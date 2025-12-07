// Strapi adapter for products
import { IProductRepository } from '../../domain/ports/product.repository';
import { IProduct, IProductFilter, IPaginatedProducts } from '../../domain/entities/product.entity';
import { strapiClient, buildStrapiQuery } from '@/lib/strapi/client';
import { handleApiError } from '@/lib/errors/api-errors';
import { productCache } from '../cache/product.cache';

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

export class StrapiProductAdapter implements IProductRepository {
  private readonly collectionName = 'products';
  private readonly cacheKeyPrefix = 'product';

  private mapToDomain(strapiData: any): IProduct {
    return {
      id: strapiData.id,
      title: strapiData.title || '',
      slug: strapiData.slug || '',
      description: strapiData.description || '',
      price: strapiData.price || 0,
      currency: strapiData.currency || 'USD',
      duration: strapiData.duration || '',
      players: strapiData.players || '',
      difficulty: strapiData.difficulty || '',
      image: strapiData.image?.url || strapiData.image || '',
      bestseller: strapiData.bestseller || false,
      publishedAt: strapiData.publishedAt ? new Date(strapiData.publishedAt) : null,
      createdAt: new Date(strapiData.createdAt),
      updatedAt: new Date(strapiData.updatedAt),
    };
  }

  async findAll(filters?: IProductFilter): Promise<IPaginatedProducts> {
    try {
      const cacheKey = `${this.cacheKeyPrefix}:all:${JSON.stringify(filters || {})}`;
      const cached = productCache.get<IPaginatedProducts>(cacheKey);

      if (cached) {
        console.log('[Cache] Products list hit');
        return cached;
      }

      const queryFilters: any = {};
      
      if (filters?.published !== false) {
        queryFilters.publishedAt = { $notNull: true };
      }
      
      if (filters?.bestseller !== undefined) {
        queryFilters.bestseller = { $eq: filters.bestseller };
      }

      const queryOptions = {
        filters: queryFilters,
        sort: filters?.sort ? [filters.sort] : ['-publishedAt'],
        pagination: {
          pageSize: filters?.limit || 10,
          page: (filters?.offset || 0) / (filters?.limit || 10) + 1,
        },
        populate: ['image'],
      };

      const query = buildStrapiQuery(queryOptions);
      const response = (await strapiClient.collection(this.collectionName).find({
        qs: query,
      })) as StrapiResponse;

      const result: IPaginatedProducts = {
        data: (response.data || []).map((item) => this.mapToDomain(item)),
        pagination: response.meta?.pagination || {
          page: 1,
          pageSize: 10,
          pageCount: 1,
          total: 0,
        },
      };

      productCache.set(cacheKey, result, 300000); // 5 minutes

      return result;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async findById(id: string | number): Promise<IProduct | null> {
    try {
      const cacheKey = `${this.cacheKeyPrefix}:${id}`;
      const cached = productCache.get<IProduct>(cacheKey);

      if (cached) {
        console.log(`[Cache] Product ${id} hit`);
        return cached;
      }

      const response = (await strapiClient.collection(this.collectionName).findOne(id, {
        qs: buildStrapiQuery({
          populate: ['image'],
        }),
      })) as StrapiSingleResponse;

      if (!response.data) {
        return null;
      }

      const product = this.mapToDomain(response.data);
      productCache.set(cacheKey, product, 600000); // 10 minutes

      return product;
    } catch (error) {
      const apiError = handleApiError(error);
      if (apiError.statusCode === 404) {
        return null;
      }
      throw apiError;
    }
  }

  async findBySlug(slug: string): Promise<IProduct | null> {
    try {
      const cacheKey = `${this.cacheKeyPrefix}:slug:${slug}`;
      const cached = productCache.get<IProduct>(cacheKey);

      if (cached) {
        console.log(`[Cache] Product slug ${slug} hit`);
        return cached;
      }

      const query = buildStrapiQuery({
        filters: { slug: { $eq: slug } },
        populate: ['image'],
      });

      const response = (await strapiClient.collection(this.collectionName).find({
        qs: query,
      })) as StrapiResponse;

      if (!response.data || response.data.length === 0) {
        return null;
      }

      const product = this.mapToDomain(response.data[0]);
      productCache.set(cacheKey, product, 600000);

      return product;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async create(data: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProduct> {
    try {
      if (!process.env.STRAPI_API_TOKEN) {
        throw new Error('STRAPI_API_TOKEN is required for create operations');
      }

      const response = (await strapiClient.collection(this.collectionName).create({
        data,
      })) as StrapiSingleResponse;

      const product = this.mapToDomain(response.data);
      productCache.invalidate(this.cacheKeyPrefix);
      return product;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async update(id: string | number, data: Partial<IProduct>): Promise<IProduct> {
    try {
      if (!process.env.STRAPI_API_TOKEN) {
        throw new Error('STRAPI_API_TOKEN is required for update operations');
      }

      const response = (await strapiClient.collection(this.collectionName).update(id, {
        data,
      })) as StrapiSingleResponse;

      const product = this.mapToDomain(response.data);
      productCache.invalidate(this.cacheKeyPrefix);
      return product;
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
      productCache.invalidate(this.cacheKeyPrefix);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}
