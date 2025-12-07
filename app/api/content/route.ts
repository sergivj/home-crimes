import { NextRequest, NextResponse } from 'next/server';
import { StrapiContentAdapter } from '@/modules/content/infrastructure/adapters/strapi-content.adapter';
import { GetContentUseCase } from '@/modules/content/application/use-cases/get-content.usecase';

const contentRepository = new StrapiContentAdapter();
const getContentUseCase = new GetContentUseCase(contentRepository);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || undefined;
    const published = searchParams.get('published') !== 'false';

    const result = await getContentUseCase.execute({
      limit,
      offset,
      sort,
      published,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
