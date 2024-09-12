import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY_LIVE!, {
  apiVersion: '2024-06-20', 
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL! as string,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY! as string
);

async function syncStripeData() {
  // Fetch all products from Stripe
  const stripeProducts = await stripe.products.list();

  // Insert products into Supabase
  for (const product of stripeProducts.data) {
    await supabase.from('products').upsert({
      id: product.id,
      name: product.name,
      description: product.description,
      active: product.active,
      metadata: product.metadata
    });

    // Fetch prices for this product
    const stripePrices = await stripe.prices.list({ product: product.id });

    // Insert prices into Supabase
    for (const price of stripePrices.data) {
      await supabase.from('prices').upsert({
        id: price.id,
        product_id: price.product,
        active: price.active,
        currency: price.currency,
        type: price.type,
        unit_amount: price.unit_amount,
        interval: price.recurring?.interval,
        interval_count: price.recurring?.interval_count
      });
    }
  }

  console.log('Stripe data synced successfully');
}

syncStripeData().catch(console.error);