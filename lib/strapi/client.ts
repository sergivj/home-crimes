import { strapi } from '@strapi/client';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337/api';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || 'abc';

if (!STRAPI_URL) {
  throw new Error('STRAPI_URL is not defined');
}

export const strapiClient = strapi({
  baseURL: STRAPI_URL,
  auth: STRAPI_TOKEN as string,
});

/**
 * Type-safe Strapi query builder compatible with Strapi v5 REST API.
 */
export interface QueryOptions {
  filters?: Record<string, unknown>;
  populate?: '*' | string[] | Record<string, unknown>;
  sort?: string[];
  pagination?: { pageSize: number; page: number };
  fields?: string[];
}

const appendNestedParams = (
  params: URLSearchParams,
  prefix: string,
  value: unknown,
) => {
  if (value === undefined || value === null) return;

  if (Array.isArray(value)) {
    value.forEach((item, index) => appendNestedParams(params, `${prefix}[${index}]`, item));
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) =>
      appendNestedParams(params, `${prefix}[${key}]`, val),
    );
    return;
  }

  params.append(prefix, String(value));
};

export const buildStrapiQuery = (options?: QueryOptions) => {
  const params = new URLSearchParams();

  if (options?.filters) {
    appendNestedParams(params, 'filters', options.filters);
  }

  if (options?.populate) {
    if (options.populate === '*' || (Array.isArray(options.populate) && options.populate.includes('*'))) {
      params.append('populate', '*');
    } else if (Array.isArray(options.populate)) {
      params.append('populate', options.populate.join(','));
    } else {
      appendNestedParams(params, 'populate', options.populate);
    }
  }

  if (options?.sort?.length) {
    params.append('sort', options.sort.join(','));
  }

  if (options?.pagination) {
    params.append('pagination[pageSize]', options.pagination.pageSize.toString());
    params.append('pagination[page]', options.pagination.page.toString());
  }

  if (options?.fields?.length) {
    params.append('fields', options.fields.join(','));
  }

  return params.toString();
};
