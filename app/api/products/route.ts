import { NextRequest, NextResponse } from 'next/server';
import { getProductsFromStrapi } from '@/lib/strapi/api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get('limit') ?? '10');
    const offset = Number(searchParams.get('offset') ?? '0');
    const sort = searchParams.get('sort') || undefined;
    const published = searchParams.get('published') !== 'false';
    const bestsellerParam = searchParams.get('bestseller');

    const result = await getProductsFromStrapi({
      limit: Number.isFinite(limit) ? limit : 10,
      offset: Number.isFinite(offset) ? offset : 0,
      sort,
      published,
      bestseller:
        bestsellerParam === null ? undefined : bestsellerParam === 'true',
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
