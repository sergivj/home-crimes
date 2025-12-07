// Repository port (interface) - defines contract for data access
import { IProduct, IProductFilter, IPaginatedProducts } from '../entities/product.entity';

export interface IProductRepository {
  findAll(filters?: IProductFilter): Promise<IPaginatedProducts>;
  findById(id: string | number): Promise<IProduct | null>;
  findBySlug(slug: string): Promise<IProduct | null>;
  create(data: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProduct>;
  update(id: string | number, data: Partial<IProduct>): Promise<IProduct>;
  delete(id: string | number): Promise<void>;
}
