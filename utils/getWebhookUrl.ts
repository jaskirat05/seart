export function getWebhookUrl(): string {
  console.log('Environment isLocal:', process.env.isLocal);
  
  // Check if we're in Vercel production environment
  if (process.env.isLocal === 'false') {
    const prodUrl = `${process.env.VERCEL_URL_PROV}/api/webhook`;
    console.log('Using production webhook URL:', prodUrl);
    return prodUrl;
  }
  
  // Default to ngrok for local development
  const localUrl = `${process.env.Local_Hook}/api/webhook`;
  console.log('Using local webhook URL:', localUrl);
  return localUrl;
}
