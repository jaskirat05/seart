export function getWebhookUrl(): string {
  // Check if we're in Vercel production environment
  if (process.env.isLocal === 'false') {
    return `${process.env.VERCEL_URL_PROV}/api/webhook`;
  }

  

  // Default to ngrok for local development
  return "https://2bcc-110-235-233-146.ngrok-free.app/api/webhook";
}
