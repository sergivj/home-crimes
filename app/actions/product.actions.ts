'use server';

// Server Actions for products
import { StrapiProductAdapter } from '@/modules/products/infrastructure/adapters/strapi-product.adapter';
import {
  GetProductsUseCase,
  GetProductByIdUseCase,
} from '@/modules/products/application/use-cases/get-product.usecase';
import { GetProductsRequest, GetProductsResponse, GetProductByIdResponse } from '@/modules/products/application/dto/product.dto';

// Initialize repository and use cases
const productRepository = new StrapiProductAdapter();
const getProductsUseCase = new GetProductsUseCase(productRepository);
const getProductByIdUseCase = new GetProductByIdUseCase(productRepository);

/**
 * Server Action to fetch all products with filters
 */
export async function fetchProducts(request: GetProductsRequest = {}): Promise<GetProductsResponse> {
  return getProductsUseCase.execute(request);
}

/**
 * Server Action to fetch single product by ID
 */
export async function fetchProductById(
  id: string | number
): Promise<GetProductByIdResponse> {
  return getProductByIdUseCase.execute(id);
}

/**
 * Server Action to fetch product by slug
 */
export async function fetchProductBySlug(slug: string): Promise<GetProductByIdResponse> {
  try {
    const product = await productRepository.findBySlug(slug);

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
