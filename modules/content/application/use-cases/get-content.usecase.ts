// Use Case - orchestrates business logic
import { IContentRepository } from '../../domain/ports/content.repository';
import { GetContentRequest, GetContentResponse } from '../dto/content.dto';

export class GetContentUseCase {
  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(request: GetContentRequest): Promise<GetContentResponse> {
    try {
      const result = await this.contentRepository.findAll({
        limit: request.limit ?? 10,
        offset: request.offset ?? 0,
        sort: request.sort ?? '-publishedAt',
        published: request.published !== false,
      });

      return {
        success: true,
        data: {
          items: result.data.map((item) => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            excerpt: item.description,
            publishedAt: item.publishedAt,
          })),
          pagination: result.pagination,
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
}

export class GetContentByIdUseCase {
  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(id: string | number): Promise<any> {
    try {
      const content = await this.contentRepository.findById(id);

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
}
