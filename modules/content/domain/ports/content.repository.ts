// Port (interface) - defines what the adapter must implement
import { IContent, IContentFilter, IPaginatedContent } from '../entities/content.entity';

export interface IContentRepository {
  /**
   * Fetch all content with optional filtering
   */
  findAll(filters?: IContentFilter): Promise<IPaginatedContent>;

  /**
   * Fetch single content by ID
   */
  findById(id: string | number): Promise<IContent | null>;

  /**
   * Search content by title/slug
   */
  findBySlug(slug: string): Promise<IContent | null>;

  /**
   * Create new content
   */
  create(data: Omit<IContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<IContent>;

  /**
   * Update existing content
   */
  update(id: string | number, data: Partial<IContent>): Promise<IContent>;

  /**
   * Delete content
   */
  delete(id: string | number): Promise<void>;
}
