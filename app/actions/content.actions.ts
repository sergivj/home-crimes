'use server';

// Server Actions - thin layer connecting UI to application layer
import { StrapiContentAdapter } from '@/modules/content/infrastructure/adapters/strapi-content.adapter';
import {
  GetContentUseCase,
  GetContentByIdUseCase,
} from '@/modules/content/application/use-cases/get-content.usecase';
import { GetContentRequest, GetContentResponse, GetContentByIdResponse } from '@/modules/content/application/dto/content.dto';

// Initialize repository and use cases
const contentRepository = new StrapiContentAdapter();
const getContentUseCase = new GetContentUseCase(contentRepository);
const getContentByIdUseCase = new GetContentByIdUseCase(contentRepository);

/**
 * Server Action to fetch all content with filters
 */
export async function fetchContent(request: GetContentRequest): Promise<GetContentResponse> {
  return getContentUseCase.execute(request);
}

/**
 * Server Action to fetch single content by ID
 */
export async function fetchContentById(
  id: string | number
): Promise<GetContentByIdResponse> {
  return getContentByIdUseCase.execute(id);
}

/**
 * Server Action with error handling wrapper
 */
export async function fetchContentBySlug(slug: string): Promise<GetContentByIdResponse> {
  try {
    const content = await contentRepository.findBySlug(slug);

    if (!content) {
      return {
        success: false,
        error: 'Content not found',
      };
    }

    return {
      success: true,
      data: {
        id: content.id,
        title: content.title,
        slug: content.slug,
        description: content.description,
        content: content.content,
        author: content.author,
        publishedAt: content.publishedAt,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch content';
    return {
      success: false,
      error: message,
    };
  }
}
