import { NextRequest, NextResponse } from 'next/server';
import { getCaseBySlug } from '@/lib/strapi/api';

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Missing case slug' },
        { status: 400 }
      );
    }

    const caseData = await getCaseBySlug(slug);

    if (!caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(caseData);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
