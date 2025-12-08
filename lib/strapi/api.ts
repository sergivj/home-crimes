const STRAPI_BASE_URL = (() => {
  const rawBase =
    process.env.STRAPI_URL + '/api' ||
    'http://localhost:1337';

  const normalized = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
})();

const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

interface StrapiCollectionResponse<T> {
  data: Array<{
    id: number | string;
    attributes?: T;
  }>;
  meta?: { pagination?: StrapiPagination };
}

interface StrapiSingleResponse<T> {
  data: any;
}

interface StrapiImage {
  data?: {
    attributes?: {
      url?: string;
    };
  };
  url?: string;
}

export interface Product {
  id: number | string;
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
  publishedAt: string | null;
}

export interface Article {
  id: number | string;
  title: string;
  slug: string;
  description: string;
  content: string;
  author: string;
  publishedAt: string | null;
}

type QueryParams = Record<string, string | number | boolean | undefined>;

const buildUrl = (path: string, params?: QueryParams) => {
  const url = new URL(`${STRAPI_BASE_URL}/${path.replace(/^\//, '')}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) return;
      url.searchParams.append(key, String(value));
    });
  }

  return url.toString();
};

const resolveMediaUrl = (image: StrapiImage | string | null | undefined) => {
  const rawUrl =
    (typeof image === 'string'
      ? image
      : image?.data?.attributes?.url || image?.url) || '';

  if (!rawUrl) return '';
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return rawUrl;

  const assetBase =
    process.env.STRAPI_URL ||
    '';

  const normalizedBase = assetBase.endsWith('/')
    ? assetBase.slice(0, -1)
    : assetBase;

  return `${normalizedBase}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
};

const strapiFetch = async <T>(path: string, params?: QueryParams) => {
  const response = await fetch(buildUrl(path, params), {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    },
  });
  console.log(buildUrl(path, params))
  if (!response.ok) {
    throw new Error(`Strapi request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

const normalizeEntry = <T>(entry: { id: number | string; attributes?: T } | null): (T & { id: number | string }) | null => {
  if (!entry) return null;
  const attributes = entry.attributes ?? (entry as unknown as T);
  return { id: entry.id, ...(attributes as T) };
};

const mapProduct = (entry: { id: number | string; attributes?: any }): Product => {
  const data = normalizeEntry<any>(entry) || {};

  return {
    id: data.id,
    title: data.title || '',
    slug: data.slug || '',
    description: data.description || '',
    price: Number(data.price) || 0,
    currency: data.currency || 'USD',
    duration: data.duration || '',
    players: data.players || '',
    difficulty: data.difficulty || '',
    image: resolveMediaUrl(data.image),
    bestseller: Boolean(data.bestseller),
    publishedAt: data.publishedAt || null,
  };
};

const mapArticle = (entry: { id: number | string; attributes?: any }): Article => {
  const data = normalizeEntry<any>(entry) || {};

  return {
    id: data.id,
    title: data.title || '',
    slug: data.slug || '',
    description: data.description || '',
    content: data.content || '',
    author: data.author || '',
    publishedAt: data.publishedAt || null,
  };
};

export interface ProductQuery {
  limit?: number;
  offset?: number;
  sort?: string;
  published?: boolean;
  bestseller?: boolean;
}

export interface ArticleQuery {
  limit?: number;
  offset?: number;
  sort?: string;
  published?: boolean;
}

export const getProductsFromStrapi = async (query: ProductQuery = {}) => {
  const pageSize = query.limit ?? 10;
  const offset = query.offset ?? 0;
  const page = Math.floor(offset / pageSize) + 1;

  const params: QueryParams = {
    populate: '*',
    'pagination[pageSize]': pageSize,
    'pagination[page]': page,
    ...(query.sort ? { sort: query.sort } : {}),
  };

  if (query.published !== false) {
    params['filters[publishedAt][$notNull]'] = true;
  }

  if (query.bestseller !== undefined) {
    params['filters[bestseller][$eq]'] = query.bestseller;
  }

  const response = await strapiFetch<StrapiCollectionResponse<any>>('products', params);

  return {
    data: response.data.map(mapProduct),
    pagination: response.meta?.pagination,
  };
};

export const getProductById = async (id: string | number) => {
  const response = await strapiFetch<StrapiSingleResponse<any>>(`products?filters[id]=${id}`, {
    populate: '*',
  });
  console.log('Product response:', response);
  return mapProduct(response.data[0] as any);
};

export const getProductBySlug = async (slug: string) => {
  const response = await strapiFetch<StrapiCollectionResponse<any>>('products', {
    populate: '*',
    'filters[slug][$eq]': slug,
    'pagination[pageSize]': 1,
  });

  const entry = response.data[0] || null;
  return entry ? mapProduct(entry) : null;
};

export const getArticlesFromStrapi = async (query: ArticleQuery = {}) => {
  const pageSize = query.limit ?? 10;
  const offset = query.offset ?? 0;
  const page = Math.floor(offset / pageSize) + 1;

  const params: QueryParams = {
    'pagination[pageSize]': pageSize,
    'pagination[page]': page,
    ...(query.sort ? { sort: query.sort } : {}),
  };

  if (query.published !== false) {
    params['filters[publishedAt][$notNull]'] = true;
  }

  const response = await strapiFetch<StrapiCollectionResponse<any>>('articles', params);

  return {
    data: response.data.map(mapArticle),
    pagination: response.meta?.pagination,
  };
};

export const getArticleById = async (id: string | number) => {
  const response = await strapiFetch<StrapiSingleResponse<any>>(`articles/${id}`);
  return response.data ? mapArticle(response.data) : null;
};

export const getArticleBySlug = async (slug: string) => {
  const response = await strapiFetch<StrapiCollectionResponse<any>>('articles', {
    'filters[slug][$eq]': slug,
    'pagination[pageSize]': 1,
  });

  const entry = response.data[0] || null;
  return entry ? mapArticle(entry) : null;
};
