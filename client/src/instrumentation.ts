import { registerOTel } from "@vercel/otel"

export const register = async () => {
  registerOTel({ serviceName: "full-stack-template" })

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}
