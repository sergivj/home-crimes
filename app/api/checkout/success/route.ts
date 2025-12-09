import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAccessCode } from '@/lib/gameCodes';
import { sendAccessEmail } from '@/lib/email/sendAccessEmail';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' })
  : null;

export async function GET(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe no está configurado' }, { status: 500 });
  }

  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Falta session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer_details'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Pago no completado' }, { status: 402 });
    }

    const productSlug = session.metadata?.productSlug || request.nextUrl.searchParams.get('product') || 'game';
    const productTitle = session.metadata?.productTitle || productSlug;

    const code = createAccessCode({
      productSlug,
      sessionId,
    });

    const customerEmail = session.customer_details?.email || session.customer_email;

    if (customerEmail) {
      await sendAccessEmail({
        to: customerEmail,
        code,
        productTitle,
        productSlug,
      });
    }

    return NextResponse.json({ code, productSlug, email: customerEmail });
  } catch (error) {
    console.error('Checkout success error', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
