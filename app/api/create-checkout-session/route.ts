import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {getStripeWebhookUrl} from '@/utils/getStripeWebhook';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { priceId, points, amount, mode = 'subscription' } = await req.json();

    const sessionConfig: any = {
      billing_address_collection: 'auto',
      success_url: `${getStripeWebhookUrl()}/success?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getStripeWebhookUrl()}/pricing?canceled=true`,
      mode,
      metadata: mode === 'payment' ? {
        points: points.toString(),
        userId,
      } : undefined,
      client_reference_id: userId,
    };

    if (mode === 'subscription') {
      sessionConfig.line_items = [{
        price: priceId,
        quantity: 1,
      }];
    } else {
      // One-time payment for points
      sessionConfig.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${points.toLocaleString()} Energy Points`,
            description: 'One-time purchase of energy points',
          },
          unit_amount: amount,
        },
        quantity: 1,
      }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
