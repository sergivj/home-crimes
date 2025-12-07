// Data Transfer Objects - application-specific contracts
export interface GetContentRequest {
    limit?: number;
    offset?: number;
    sort?: string;
    published?: boolean;
  }
  
  export interface GetContentResponse {
    success: boolean;
    data?: {
      items: {
        id: string | number;
        title: string;
        slug: string;
        excerpt?: string;
        publishedAt: Date | null;
      }[];
      pagination: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
      };
    };
    error?: string;
  }
  
  export interface GetContentByIdRequest {
    id: string | number;
  }
  
  export interface GetContentByIdResponse {
    success: boolean;
    data?: {
      id: string | number;
      title: string;
      slug: string;
      description?: string;
      content: string;
      author?: string;
      publishedAt: Date | null;
    };
    error?: string;
  }
  