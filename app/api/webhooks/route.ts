import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/utils/supabase';
import { clerkClient } from '@clerk/nextjs/server';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const SUBSCRIPTION_POINTS = {
  monthly: 10000,
  yearly: 12500  // Monthly credit for yearly subscribers
};

async function updateUserPoints(userId: string, points: number, type: string, stripeData: any) {
  const { data, error } = await supabase
    .from('user_points')
    .select('points_remaining')
    .eq('clerk_user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user points:', error);
    throw error;
  }

  const currentPoints = data?.points_remaining || 0;
  const newPoints = currentPoints + points;

  // Get description based on type
  let description = '';
  switch (type) {
    case 'subscription_purchased':
      description = `New subscription purchase: ${points.toLocaleString()} points`;
      break;
    case 'subscription_credit':
      description = `Subscription renewal: ${points.toLocaleString()} points`;
      break;
    case 'purchase':
      description = `Points purchase: ${points.toLocaleString()} points`;
      break;
    default:
      description = `${points.toLocaleString()} points added`;
  }

  // Start a transaction to update points and create transaction record
  const { error: transactionError } = await supabase.rpc('handle_points_transaction', {
    p_user_id: userId,
    p_amount: points,
    p_type: type,
    p_description: description,
    p_stripe_payment_id: stripeData.payment_intent || stripeData.subscription,
    p_stripe_data: stripeData,
    p_new_total: newPoints
  });

  if (transactionError) {
    console.error('Error in points transaction:', transactionError);
    throw transactionError;
  }

  return newPoints;
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription, userId: string, type: string = 'subscription_credit') {
  const interval = subscription.items.data[0].price.recurring?.interval;
  const isYearly = interval === 'year';
  const points = isYearly ? SUBSCRIPTION_POINTS.yearly : SUBSCRIPTION_POINTS.monthly;

  // Update subscription info in Supabase
  const { error } = await supabase
    .from('user_points')
    .update({ 
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_type: isYearly ? 'yearly' : 'monthly',
      subscription_updated_at: new Date().toISOString()
    })
    .eq('clerk_user_id', userId);

  if (error) {
    console.error('Error updating user subscription info:', error);
    throw error;
  }

  // Credit points and update metadata
  if (subscription.status === 'active') {
    // For yearly subscriptions, set up Clerk metadata
    if (isYearly) {
      const now = new Date();
      const nextCredit = new Date(now);
      nextCredit.setMonth(nextCredit.getMonth() + 1);

      // Update Clerk metadata - using publicMetadata instead of privateMetadata
      await (await clerkClient()).users.updateUserMetadata(userId, {
        publicMetadata: {
          subscription_type: 'yearly',
          subscription_start: new Date(subscription.current_period_start * 1000).toISOString(),
          subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
          next_points_credit: nextCredit.toISOString(),
          points_per_credit: SUBSCRIPTION_POINTS.yearly,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string
        }
      });
    } else {
      // For monthly subscriptions, still update metadata but without next_points_credit
      await (await clerkClient()).users.updateUserMetadata(userId, {
        publicMetadata: {
          subscription_type: 'monthly',
          subscription_start: new Date(subscription.current_period_start * 1000).toISOString(),
          subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string
        }
      });
    }

    // Credit points for both monthly and initial yearly
    await updateUserPoints(userId, points, type, {
      subscription: subscription.id,
      customer: subscription.customer,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      interval: interval,
      credit_type: 'subscription'
    });
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`❌ Error verifying webhook signature: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${errorMessage}` },
      { status: 400 }
    );
  }

  console.log(`🔔 Received webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('📦 Checkout Session Data:', JSON.stringify({
          id: session.id,
          mode: session.mode,
          metadata: session.metadata,
          client_reference_id: session.client_reference_id,
          customer: session.customer,
          subscription: session.subscription
        }, null, 2));
        
        // Handle one-time payment for points
        if (session.mode === 'payment' && session.metadata?.points && session.metadata?.userId) {
          const points = parseInt(session.metadata.points);
          const userId = session.metadata.userId;
          
          await updateUserPoints(userId, points, 'purchase', {
            checkout_session_id: session.id,
            payment_intent: session.payment_intent,
            amount_paid: session.amount_total,
            currency: session.currency,
            payment_status: session.payment_status,
            customer_email: session.customer_details?.email
          });
          
          console.log(`✅ Added ${points} points to user ${userId}`);
        }
        // Handle subscription checkout completion
        else if (session.mode === 'subscription' && session.client_reference_id) {
          console.log('🔄 Updating user subscription info:', JSON.stringify({
            userId: session.client_reference_id,
            customerId: session.customer,
            subscriptionId: session.subscription
          }, null, 2));

          // Update subscription info in Supabase
          const { error: updateError } = await supabase
            .from('user_points')
            .update({ 
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              subscription_status: 'active',
              subscription_updated_at: new Date().toISOString()
            })
            .eq('clerk_user_id', session.client_reference_id);

          if (updateError) {
            console.error('Error updating initial subscription info:', updateError);
            throw updateError;
          }

          console.log('✅ Updated initial subscription info in Supabase');
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log('🆕 Subscription Created Event:', JSON.stringify({
          subscription_id: subscription.id,
          customer: subscription.customer,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          items: subscription.items.data.map(item => ({
            price_id: item.price.id,
            interval: item.price.recurring?.interval
          }))
        }, null, 2));

        // Get the user associated with this customer
        const { data: userData, error: userError } = await supabase
          .from('user_points')
          .select('clerk_user_id')
          .eq('stripe_customer_id', subscription.customer)
          .single();

        if (userError) {
          console.error('Error finding user for subscription:', userError);
          throw userError;
        }

        // Process the new subscription
        await handleSubscriptionUpdate(
          subscription, 
          userData.clerk_user_id, 
          'subscription_purchased'
        );
        
        console.log(`✅ Processed new subscription for user ${userData.clerk_user_id}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const previousAttributes = event.data.previous_attributes as Partial<Stripe.Subscription>;
        const cancellation=event.data.object.canceled_at;
        const cancel_at_period_end=event.data.object.cancel_at_period_end;
        const cancellation_reason=event.data.object.cancellation_details?.reason;
        console.log('🔄 Subscription Update Event:', JSON.stringify({
          subscription_id: subscription.id,
          customer: subscription.customer,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          previous_attributes: previousAttributes,
          items: subscription.items.data.map(item => ({
            price_id: item.price.id,
            interval: item.price.recurring?.interval
          }))
        }, null, 2));

        // Get the user associated with this customer
        const { data: userData, error: userError } = await supabase
          .from('user_points')
          .select('clerk_user_id')
          .eq('stripe_customer_id', subscription.customer)
          .single();

        if (userError) {
          console.error('Error finding user for subscription:', userError);
          throw userError;
        }

        // Handle both initial activation and renewals
        const isStatusChange = previousAttributes.status !== undefined;
        const isRenewal = previousAttributes.current_period_start !== undefined;
        const isNewSubscription = isStatusChange && !isRenewal; // No previous status means new subscription
        const isCancellation=cancel_at_period_end;

        console.log('🔍 Event Analysis:', JSON.stringify({
          isStatusChange,
          isRenewal,
          isNewSubscription,
          isCancellation,
          cancellation_reason,
          cancellation,
          previousStatus: previousAttributes.status,
          previousPeriodStart: previousAttributes.current_period_start ? 
            new Date(previousAttributes.current_period_start * 1000).toISOString() : null
        }, null, 2));

        if (isStatusChange || isRenewal) {
          await handleSubscriptionUpdate(
            subscription, 
            userData.clerk_user_id, 
            isNewSubscription ? 'subscription_purchased' : 'subscription_credit'
          );
          console.log(`✅ Processed subscription ${isNewSubscription ? 'purchase' : 'renewal'} for user ${userData.clerk_user_id}`);
        }
        if (isCancellation) 
          {
        console.log('❌ Subscription Deleted:', JSON.stringify({
          subscription_id: subscription.id,
          customer: subscription.customer,
          status: subscription.status,
          canceled_at: subscription.canceled_at ? 
            new Date(subscription.canceled_at * 1000).toISOString() : null
        }, null, 2));
        
        // Get the user associated with this customer
        const { data: userData, error: userError } = await supabase
          .from('user_points')
          .select('clerk_user_id')
          .eq('stripe_customer_id', subscription.customer)
          .single();

        if (userError) {
          console.error('Error finding user for subscription:', userError);
          throw userError;
        }

        // Update subscription status in Supabase
        const { error: updateError } = await supabase
          .from('user_points')
          .update({ 
            subscription_status: 'canceled',
            subscription_updated_at: new Date().toISOString(),
            stripe_subscription_id: null
          })
          .eq('clerk_user_id', userData.clerk_user_id);

        if (updateError) {
          console.error('Error updating subscription status:', updateError);
          throw updateError;
        }
        const metadata = (await (await clerkClient()).users.getUser(userData.clerk_user_id)).publicMetadata;

        // Clear subscription metadata from Clerk
        await (await clerkClient()).users.updateUser(userData.clerk_user_id, {
          publicMetadata: {
          ...metadata,
          cancel_at_period_end:true
          }
        });

        console.log(`✅ Processed subscription cancellation for user ${userData.clerk_user_id}`);
        }
          
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('❌ Subscription Deleted:', JSON.stringify({
          subscription_id: subscription.id,
          customer: subscription.customer,
          status: subscription.status,
          canceled_at: subscription.canceled_at ? 
            new Date(subscription.canceled_at * 1000).toISOString() : null
        }, null, 2));
        
        // Get the user associated with this customer
        const { data: userData, error: userError } = await supabase
          .from('user_points')
          .select('clerk_user_id')
          .eq('stripe_customer_id', subscription.customer)
          .single();

        if (userError) {
          console.error('Error finding user for subscription:', userError);
          throw userError;
        }

        // Update subscription status in Supabase
        const { error: updateError } = await supabase
          .from('user_points')
          .update({ 
            subscription_status: 'canceled',
            subscription_updated_at: new Date().toISOString(),
            stripe_subscription_id: null
          })
          .eq('clerk_user_id', userData.clerk_user_id);

        if (updateError) {
          console.error('Error updating subscription status:', updateError);
          throw updateError;
        }
        //const metadata = (await (await clerkClient()).users.getUser(userData.clerk_user_id)).publicMetadata;
        // Clear subscription metadata from Clerk
        await (await clerkClient()).users.updateUser(userData.clerk_user_id, {
          publicMetadata: {
            
          }
        });

        console.log(`✅ Processed subscription cancellation for user ${userData.clerk_user_id}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`❌ Error processing webhook: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook processing failed: ${errorMessage}` },
      { status: 400 }
    );
  }
}
