import { strapi } from '@strapi/client';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337/api';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_URL) {
  throw new Error('STRAPI_URL is not defined');
}

export const strapiClient = strapi({
  baseURL: STRAPI_URL,
  auth: STRAPI_TOKEN ? STRAPI_TOKEN : '',
});

/**
 * Type-safe Strapi query builder
 */
export interface QueryOptions {
  filters?: Record<string, any>;
  populate?: '*' | string[];
  sort?: string[];
  pagination?: { pageSize: number; page: number };
  fields?: string[];
}

export const buildStrapiQuery = (options?: QueryOptions) => {
  const params = new URLSearchParams();

  if (options?.filters) {
    params.append('filters', JSON.stringify(options.filters));
  }

  if (options?.populate) {
    const populate = options.populate;

    if (populate === '*' || (Array.isArray(populate) && populate.includes('*'))) {
      params.append('populate', '*');
    } else if (Array.isArray(populate) && populate.length) {
      populate.forEach((field) => {
        params.append(`populate[${field}]`, 'true');
      });
    }
  }

  if (options?.sort?.length) {
    params.append('sort', JSON.stringify(options.sort));
  }

  if (options?.pagination) {
    params.append('pagination[pageSize]', options.pagination.pageSize.toString());
    params.append('pagination[page]', options.pagination.page.toString());
  }

  if (options?.fields?.length) {
    params.append('fields', JSON.stringify(options.fields));
  }

  return params.toString();
};
