export function getWebhookUrl(): string {
  // Check if we're in Vercel production environment
  if (process.env.VERCEL_ENV === 'production') {
    return `https://${process.env.VERCEL_URL}/api/webhook`;
  }

  // Check if we're in Vercel preview environment (for PRs and branches)
  if (process.env.VERCEL_ENV === 'preview') {
    return `https://${process.env.VERCEL_URL}/api/webhook`;
  }

  // Default to ngrok for local development
  return "https://2bcc-110-235-233-146.ngrok-free.app/api/webhook";
}
