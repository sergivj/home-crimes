// Data Transfer Objects for API contracts
export interface GetProductsRequest {
  limit?: number;
  offset?: number;
  sort?: string;
  published?: boolean;
  bestseller?: boolean;
}

export interface ProductResponse {
  id: string | number;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  players: string;
  difficulty: string;
  image: string;
  bestseller: boolean;
  publishedAt: Date | null;
}

export interface GetProductsResponse {
  success: boolean;
  data?: ProductResponse[];
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  error?: string;
}

export interface GetProductByIdResponse {
  success: boolean;
  data?: ProductResponse;
  error?: string;
}
