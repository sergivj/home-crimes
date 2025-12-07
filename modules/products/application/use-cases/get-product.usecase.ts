// Use cases - application business logic
import { IProductRepository } from '../../domain/ports/product.repository';
import { GetProductsRequest, GetProductsResponse, GetProductByIdResponse } from '../dto/product.dto';

export class GetProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(request: GetProductsRequest): Promise<GetProductsResponse> {
    try {
      const result = await this.productRepository.findAll({
        limit: request.limit,
        offset: request.offset,
        sort: request.sort,
        published: request.published,
        bestseller: request.bestseller,
      });

      return {
        success: true,
        data: result.data.map((product) => ({
          id: product.id,
          title: product.title,
          slug: product.slug,
          description: product.description,
          price: product.price,
          currency: product.currency,
          duration: product.duration,
          players: product.players,
          difficulty: product.difficulty,
          image: product.image,
          bestseller: product.bestseller,
          publishedAt: product.publishedAt,
        })),
        pagination: result.pagination,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch products';
      return {
        success: false,
        error: message,
      };
    }
  }
}

export class GetProductByIdUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(id: string | number): Promise<GetProductByIdResponse> {
    try {
      const product = await this.productRepository.findById(id);

      if (!product) {
        return {
          success: false,
          error: 'Product not found',
        };
      }

      return {
        success: true,
        data: {
          id: product.id,
          title: product.title,
          slug: product.slug,
          description: product.description,
          price: product.price,
          currency: product.currency,
          duration: product.duration,
          players: product.players,
          difficulty: product.difficulty,
          image: product.image,
          bestseller: product.bestseller,
          publishedAt: product.publishedAt,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch product';
      return {
        success: false,
        error: message,
      };
    }
  }
}
