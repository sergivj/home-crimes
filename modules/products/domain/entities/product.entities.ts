// Product domain entity
export interface IProduct {
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
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export interface IProductFilter {
  limit?: number;
  offset?: number;
  sort?: string;
  published?: boolean;
  bestseller?: boolean;
}

export interface IPaginatedProducts {
  data: IProduct[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}
