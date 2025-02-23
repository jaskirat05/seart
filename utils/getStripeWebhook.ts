export function getStripeWebhookUrl(): string {
    console.log('Environment isLocal:', process.env.isLocal);
    
    // Check if we're in Vercel production environment
    if (process.env.isLocal === 'false') {
      const successUrl = `${process.env.VERCEL_URL_PROV}`;
      console.log('Using production webhook URL:', successUrl);
      return successUrl;
    }
    
    // Default to ngrok for local development
    const localUrl = `${process.env.Local_Hook}`;
    console.log('Using local webhook URL:', localUrl);
    return localUrl;
  }
  