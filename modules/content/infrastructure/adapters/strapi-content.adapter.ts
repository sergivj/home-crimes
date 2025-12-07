// Adapter (Strapi-specific implementation of repository port)
import { IContentRepository } from '../../domain/ports/content.repository';
import { IContent, IContentFilter, IPaginatedContent } from '../../domain/entities/content.entity';
import { strapiClient, buildStrapiQuery } from '@/lib/strapi/client';
import { handleApiError } from '@/lib/errors/api-errors';
import { contentCache } from '../cache/content.cache';

interface StrapiResponse {
  data: any[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiSingleResponse {
  data: any;
}

/**
 * Strapi Adapter - Implements the content repository port
 * Translates domain objects to/from Strapi API responses
 */
export class StrapiContentAdapter implements IContentRepository {
  private readonly collectionName = 'articles'; // Adjust to your collection name
  private readonly cacheKeyPrefix = 'content';

  /**
   * Transform Strapi response to domain entity
   */
  private mapToDomain(strapiData: any): IContent {
    return {
      id: strapiData.id,
      title: strapiData.title || '',
      slug: strapiData.slug || '',
      description: strapiData.description || '',
      content: strapiData.content || '',
      author: strapiData.author || '',
      publishedAt: strapiData.publishedAt ? new Date(strapiData.publishedAt) : null,
      createdAt: new Date(strapiData.createdAt),
      updatedAt: new Date(strapiData.updatedAt),
      featured: strapiData.featured || false,
    };
  }

  async findAll(filters?: IContentFilter): Promise<IPaginatedContent> {
    try {
      const cacheKey = `${this.cacheKeyPrefix}:all:${JSON.stringify(filters || {})}`;
      const cached = contentCache.get<IPaginatedContent>(cacheKey);

      if (cached) {
        console.log('[Cache] Content list hit');
        return cached;
      }

      const queryOptions = {
        filters: filters?.published !== false ? { publishedAt: { $notNull: true } } : {},
        sort: filters?.sort ? [filters.sort] : ['-publishedAt'],
        pagination: {
          pageSize: filters?.limit || 10,
          page: (filters?.offset || 0) / (filters?.limit || 10) + 1,
        },
        fields: ['id', 'title', 'slug', 'description', 'publishedAt', 'createdAt', 'updatedAt'],
      };

      const query = buildStrapiQuery(queryOptions);
      const response = (await strapiClient.collection(this.collectionName).find({
        qs: query,
      })) as StrapiResponse;

      const result: IPaginatedContent = {
        data: (response.data || []).map((item) => this.mapToDomain(item)),
        pagination: response.meta?.pagination || {
          page: 1,
          pageSize: 10,
          pageCount: 1,
          total: 0,
        },
      };

      // Cache for 5 minutes
      contentCache.set(cacheKey, result, 300);

      return result;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async findById(id: string | number): Promise<IContent | null> {
    try {
      const cacheKey = `${this.cacheKeyPrefix}:${id}`;
      const cached = contentCache.get<IContent>(cacheKey);

      if (cached) {
        console.log(`[Cache] Content ${id} hit`);
        return cached;
      }

      const response = (await strapiClient.collection(this.collectionName).findOne(id, {
        qs: buildStrapiQuery({
          populate: ['author', 'category'],
        }),
      })) as StrapiSingleResponse;

      if (!response.data) {
        return null;
      }

      const content = this.mapToDomain(response.data);
      contentCache.set(cacheKey, content, 600); // 10 minutes

      return content;
    } catch (error) {
      const apiError = handleApiError(error);
      if (apiError.statusCode === 404) {
        return null;
      }
      throw apiError;
    }
  }

  async findBySlug(slug: string): Promise<IContent | null> {
    try {
      const cacheKey = `${this.cacheKeyPrefix}:slug:${slug}`;
      const cached = contentCache.get<IContent>(cacheKey);

      if (cached) {
        console.log(`[Cache] Content slug ${slug} hit`);
        return cached;
      }

      const query = buildStrapiQuery({
        filters: { slug: { $eq: slug } },
      });

      const response = (await strapiClient.collection(this.collectionName).find({
        qs: query,
      })) as StrapiResponse;

      if (!response.data || response.data.length === 0) {
        return null;
      }

      const content = this.mapToDomain(response.data[0]);
      contentCache.set(cacheKey, content, 600);

      return content;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async create(data: Omit<IContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<IContent> {
    try {
      if (!process.env.STRAPI_API_TOKEN) {
        throw new Error('STRAPI_API_TOKEN is required for create operations');
      }

      const response = (await strapiClient.collection(this.collectionName).create({
        data,
      })) as StrapiSingleResponse;

      const content = this.mapToDomain(response.data);
      contentCache.invalidate(this.cacheKeyPrefix); // Invalidate all content caches
      return content;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async update(id: string | number, data: Partial<IContent>): Promise<IContent> {
    try {
      if (!process.env.STRAPI_API_TOKEN) {
        throw new Error('STRAPI_API_TOKEN is required for update operations');
      }

      const response = (await strapiClient.collection(this.collectionName).update(id, {
        data,
      })) as StrapiSingleResponse;

      const content = this.mapToDomain(response.data);
      contentCache.invalidate(this.cacheKeyPrefix);
      return content;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async delete(id: string | number): Promise<void> {
    try {
      if (!process.env.STRAPI_API_TOKEN) {
        throw new Error('STRAPI_API_TOKEN is required for delete operations');
      }

      await strapiClient.collection(this.collectionName).delete(id);
      contentCache.invalidate(this.cacheKeyPrefix);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}
