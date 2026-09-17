// ComputeRail payments SDK — call createCheckout() to take a payment.
// ComputeRail resolves platform-collected vs. user-connected server-side;
// this app never sees a Stripe key.
const APP_ID = import.meta.env.VITE_COMPUTERAIL_APP_ID as string | undefined;
const CHECKOUT_URL = (import.meta.env.VITE_COMPUTERAIL_CHECKOUT_URL as string | undefined) || "https://computerail.co/api/vibe-coding/payments/checkout";

export interface CreateCheckoutArgs { amountCents: number; currency?: string; description?: string; successUrl: string; cancelUrl: string; }
export interface CreateCheckoutResult { url: string; }

export async function createCheckout(args: CreateCheckoutArgs): Promise<CreateCheckoutResult> {
  const res = await fetch(CHECKOUT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appId: APP_ID, amount_cents: args.amountCents, currency: args.currency || "usd", description: args.description, success_url: args.successUrl, cancel_url: args.cancelUrl }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) throw new Error(json.error || json.detail || `checkout_failed (${res.status})`);
  return { url: json.url as string };
}
