// Core business entities - framework agnostic
export interface IContent {
    id: string | number;
    title: string;
    slug: string;
    description?: string;
    content: string;
    author?: string;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    featured?: boolean;
  }
  
  export interface IContentFilter {
    limit?: number;
    offset?: number;
    sort?: string;
    published?: boolean;
  }
  
  export interface IPaginatedContent {
    data: IContent[];
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  }
  