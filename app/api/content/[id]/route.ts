import { NextRequest, NextResponse } from 'next/server';
import { StrapiContentAdapter } from '@/modules/content/infrastructure/adapters/strapi-content.adapter';
import { GetContentByIdUseCase } from '@/modules/content/application/use-cases/get-content.usecase';

const contentRepository = new StrapiContentAdapter();
const getContentByIdUseCase = new GetContentByIdUseCase(contentRepository);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await getContentByIdUseCase.execute(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Content not found' ? 404 : 400 }
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
