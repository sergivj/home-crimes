import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessCode } from '@/lib/gameCodes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = (body.code as string | undefined)?.trim();

    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    if (code.toUpperCase() === 'HC-DEMO-ARCHIVO.DEMO') {
      return NextResponse.json({ valid: true, productSlug: 'demo', sessionId: 'demo-session' });
    }

    const payload = verifyAccessCode(code);

    if (!payload) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 401 });
    }

    return NextResponse.json({ valid: true, ...payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
