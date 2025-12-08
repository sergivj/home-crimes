import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getProductById } from '@/lib/strapi/api';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' }) // Updated to a valid version
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Missing STRIPE_SECRET_KEY.' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const productId = body.productId as string | number | undefined;
    const quantity = Number(body.quantity ?? 1);

    if (!productId || Number.isNaN(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid checkout payload.' },
        { status: 400 }
      );
    }

    const product = await getProductById(productId);
    console.log('Fetched product:', product);

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const origin =
      request.headers.get('origin') ||
      process.env.APP_URL ||
      'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: product.title,
              description: product.description,
              ...(product.image ? { images: [product.image] } : {}),
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity,
        },
      ],
      success_url: `${origin}/game-access?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/products/${product.slug}`,
      metadata: {
        productId: String(product.id),
        productSlug: product.slug,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
