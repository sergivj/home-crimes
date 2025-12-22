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
  gallery?: string[];
  bestseller: boolean;
  publishedAt: string | null;
  mainPackageFile?: string;
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

export type ThemeVariant = 'police-file' | 'dark' | string;

export interface Case {
  id: number | string;
  title: string;
  slug: string;
  briefing: string;
  disclaimer?: string;
  currentObjectiveTemplate?: string;
  theme?: ThemeVariant;
  events: Event[];
  families: Family[];
  characters: Character[];
  locations: Location[];
  evidence: Evidence[];
  questions: Question[];
}

export interface Event {
  id: number | string;
  title: string;
  orderIndex?: number;
  summary?: string;
  statusText?: string;
  unlockDescription?: string;
  evidence: Evidence[];
  questions: Question[];
  locations: Location[];
}

export type EvidenceType =
  | 'document'
  | 'photo'
  | 'audio'
  | 'object'
  | 'clipping'
  | string;

export interface Evidence {
  id: number | string;
  title: string;
  code: string;
  type: EvidenceType;
  description?: string;
  isLocked?: boolean;
  lockReason?: string;
  tags?: string[];
  playerNotesHint?: string;
  locations: Location[];
  characters: Character[];
  families: Family[];
  asset?: string;
  gallery?: string[];
  eventId?: string;
}

export interface Location {
  id: number | string;
  name: string;
  code: string;
  description?: string;
  mapPosition?: { x?: number; y?: number; lat?: number; lng?: number } | null;
  isLocked?: boolean;
  lockReason?: string;
  evidenceIds?: string[];
  eventIds?: string[];
}

export type FamilyType = 'hotel' | 'granary' | 'church' | 'police' | string;

export interface Family {
  id: number | string;
  name: string;
  type?: FamilyType;
  description?: string;
}

export type CharacterRole =
  | 'inspector'
  | 'priest'
  | 'teacher'
  | 'suspect'
  | 'victim'
  | 'familyMember'
  | string;

export interface Character {
  id: number | string;
  name: string;
  role?: CharacterRole;
  age?: number;
  bio?: string;
  isAlive?: boolean;
  family?: Family | null;
}

export type QuestionType = 'multipleChoice' | 'association' | 'chronology' | string;

export interface QuestionOption {
  label?: string;
  value?: string;
  isCorrect?: boolean;
}

export interface AssociationPair {
  left?: string;
  right?: string;
}

export interface ChronologyItem {
  label?: string;
  correctOrderIndex?: number;
}

export interface UnlockRuleTargets {
  evidenceIds?: string[];
  eventIds?: string[];
  locationIds?: string[];
}

export interface UnlockRule {
  unlockType?: 'unlockEvidence' | 'unlockEvent' | 'unlockLocation' | string;
  targets: UnlockRuleTargets;
}

export interface Question {
  id: number | string;
  prompt: string;
  type: QuestionType;
  hint1?: string;
  hint2?: string;
  explanationOnSuccess?: string;
  options?: QuestionOption[];
  associationPairs?: AssociationPair[];
  chronologyItems?: ChronologyItem[];
  unlockRule?: UnlockRule;
  eventId?: string;
}

const strapiFetch = async <T>(path: string, params?: QueryParams, options: RequestInit = {}) => {
  const response = await fetch(buildUrl(path, params), {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      ...(options.headers || {}),
    },
  });
  console.log(buildUrl(path, params));
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

const mapFamily = (entry: { id: number | string; attributes?: any }): Family => {
  const data = normalizeEntry<any>(entry) || {};
  return {
    id: data.id,
    name: data.name || '',
    type: data.type,
    description: data.description || '',
  };
};

const mapCharacter = (entry: { id: number | string; attributes?: any }): Character => {
  const data = normalizeEntry<any>(entry) || {};
  const familyData = data.family?.data || data.family;

  return {
    id: data.id,
    name: data.name || '',
    role: data.role,
    age: Number.isFinite(data.age) ? Number(data.age) : undefined,
    bio: data.bio || '',
    isAlive: data.isAlive !== undefined ? Boolean(data.isAlive) : undefined,
    family: familyData ? mapFamily(familyData) : null,
  };
};

const mapLocation = (entry: { id: number | string; attributes?: any }): Location => {
  const data = normalizeEntry<any>(entry) || {};
  const position = data.mapPosition || data.position || data.coordinates || {};
  const evidenceIds = data.evidences?.data?.map((ev: any) => String(ev.id)) || [];
  const eventIds = data.events?.data?.map((ev: any) => String(ev.id)) || [];

  return {
    id: data.id,
    name: data.name || '',
    code: data.code || data.name || '',
    description: data.description || '',
    mapPosition: position,
    isLocked: data.isLocked,
    lockReason: data.lockReason,
    evidenceIds,
    eventIds,
  };
};

const mapEvidence = (entry: { id: number | string; attributes?: any }): Evidence => {
  const data = normalizeEntry<any>(entry) || {};
  const locationsData = data.locations?.data || data.locations || [];
  const charactersData = data.characters?.data || data.characters || [];
  const familiesData = data.families?.data || data.families || [];
  const galleryData = data.gallery?.data || data.gallery || [];

  return {
    id: data.id,
    title: data.title || '',
    code: data.code || '',
    type: data.type || 'document',
    description: data.description || '',
    isLocked: data.isLocked,
    lockReason: data.lockReason,
    tags: data.tags || [],
    playerNotesHint: data.playerNotesHint || '',
    locations: Array.isArray(locationsData) ? locationsData.map(mapLocation) : [],
    characters: Array.isArray(charactersData) ? charactersData.map(mapCharacter) : [],
    families: Array.isArray(familiesData) ? familiesData.map(mapFamily) : [],
    asset: resolveMediaUrl(data.asset),
    gallery: Array.isArray(galleryData)
      ? galleryData.map((item: any) => resolveMediaUrl(item))
      : [],
    eventId: data.event?.data?.id ? String(data.event.data.id) : undefined,
  };
};

const mapUnlockRule = (entry: any): UnlockRule | undefined => {
  if (!entry) return undefined;

  const evidenceIds = entry.evidence_targets?.data?.map((ev: any) => String(ev.id)) ||
    entry.evidenceTargets?.data?.map((ev: any) => String(ev.id)) ||
    [];
  const eventIds = entry.event_targets?.data?.map((ev: any) => String(ev.id)) ||
    entry.eventTargets?.data?.map((ev: any) => String(ev.id)) ||
    [];
  const locationIds = entry.location_targets?.data?.map((ev: any) => String(ev.id)) ||
    entry.locationTargets?.data?.map((ev: any) => String(ev.id)) ||
    [];

  return {
    unlockType: entry.unlockType,
    targets: { evidenceIds, eventIds, locationIds },
  };
};

const mapQuestion = (entry: { id: number | string; attributes?: any }): Question => {
  const data = normalizeEntry<any>(entry) || {};
  const options = data.options || [];
  const associationPairs = data.associationPairs || [];
  const chronologyItems = data.chronologyItems || [];

  return {
    id: data.id,
    prompt: data.prompt || '',
    type: data.type || 'multipleChoice',
    hint1: data.hint1,
    hint2: data.hint2,
    explanationOnSuccess: data.explanationOnSuccess,
    options: Array.isArray(options) ? options.map((opt: any) => ({
      label: opt?.label,
      value: opt?.value,
      isCorrect: opt?.isCorrect,
    })) : [],
    associationPairs: Array.isArray(associationPairs)
      ? associationPairs.map((pair: any) => ({ left: pair?.left, right: pair?.right }))
      : [],
    chronologyItems: Array.isArray(chronologyItems)
      ? chronologyItems.map((item: any) => ({
          label: item?.label,
          correctOrderIndex: Number.isFinite(item?.correctOrderIndex)
            ? Number(item.correctOrderIndex)
            : undefined,
        }))
      : [],
    unlockRule: mapUnlockRule(data.unlock_rule || data.unlockRule),
    eventId: data.event?.data?.id ? String(data.event.data.id) : undefined,
  };
};

const mapEvent = (entry: { id: number | string; attributes?: any }): Event => {
  const data = normalizeEntry<any>(entry) || {};
  const evidenceData = data.evidence?.data || data.evidence || data.evidences || [];
  const questionsData = data.questions?.data || data.questions || [];
  const locationsData = data.locations?.data || data.locations || [];

  return {
    id: data.id,
    title: data.title || '',
    orderIndex: Number.isFinite(data.orderIndex) ? Number(data.orderIndex) : undefined,
    summary: data.summary || '',
    statusText: data.statusText || '',
    unlockDescription: data.unlockDescription || '',
    evidence: Array.isArray(evidenceData) ? evidenceData.map(mapEvidence) : [],
    questions: Array.isArray(questionsData) ? questionsData.map(mapQuestion) : [],
    locations: Array.isArray(locationsData) ? locationsData.map(mapLocation) : [],
  };
};

const mapCase = (entry: { id: number | string; attributes?: any }): Case => {
  const data = normalizeEntry<any>(entry) || {};

  const eventsData = data.events?.data || data.events || [];
  const familiesData = data.families?.data || data.families || [];
  const charactersData = data.characters?.data || data.characters || [];
  const locationsData = data.locations?.data || data.locations || [];
  const evidenceData = data.evidence?.data || data.evidence || data.evidences || [];
  const questionsData = data.questions?.data || data.questions || [];

  return {
    id: data.id,
    title: data.title || '',
    slug: data.slug || '',
    briefing: data.briefing || '',
    disclaimer: data.disclaimer || '',
    currentObjectiveTemplate: data.currentObjectiveTemplate || data.objective || '',
    theme: data.theme,
    events: Array.isArray(eventsData) ? eventsData.map(mapEvent) : [],
    families: Array.isArray(familiesData) ? familiesData.map(mapFamily) : [],
    characters: Array.isArray(charactersData) ? charactersData.map(mapCharacter) : [],
    locations: Array.isArray(locationsData) ? locationsData.map(mapLocation) : [],
    evidence: Array.isArray(evidenceData) ? evidenceData.map(mapEvidence) : [],
    questions: Array.isArray(questionsData) ? questionsData.map(mapQuestion) : [],
  };
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
    mainPackageFile: resolveMediaUrl(data.mainPackageFile),
  };
};

interface OrderEntry {
  id: number | string;
  attributes?: {
    confirmation_id?: string;
    email?: string;
    emailSended?: boolean;
    product?: { data?: { id: number | string } };
  };
}

export interface Order {
  documentId: string;
  id: number | string;
  confirmationId: string;
  email?: string;
  emailSended: boolean;
  productId?: number | string | null;
}

const mapOrder = (entry: OrderEntry | null): Order | null => {
  const data = normalizeEntry<any>(entry) || {};
  const productId = data.product?.data?.id ?? data.product?.id ?? null;

  if (!data.id) return null;

  return {
    id: data.id,
    documentId: String(data.documentId),
    confirmationId: data.confirmation_id || '',
    email: data.email || '',
    emailSended: Boolean(data.emailSended),
    productId,
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
  return mapProduct(response.data[0] as any);
};

export const getProductBySlug = async (slug: string) => {
  const response = await strapiFetch<StrapiSingleResponse<any>>(`products?filters[slug]=${slug}`, {
    'populate[image][fields][0]': 'url',
    'populate[mainPackageFile][fields][0]': 'url',

  });
  return mapProduct(response.data[0] as any);

};

export const getOrderByConfirmationId = async (confirmationId: string) => {
  const response = await strapiFetch<StrapiCollectionResponse<OrderEntry>>('orders', {
    'filters[confirmation_id][$eq]': confirmationId,
    'pagination[pageSize]': 1,
  });

  return mapOrder(response.data[0] as any);
};

export const createOrder = async ({
  confirmationId,
  email,
  emailSended = false,
  productId,
}: {
  confirmationId: string;
  email?: string;
  emailSended?: boolean;
  productId?: string | number;
}) => {
  const response = await strapiFetch<StrapiSingleResponse<OrderEntry>>(
    'orders',
    undefined,
    {
      method: 'POST',
      body: JSON.stringify({
        data: {
          confirmation_id: confirmationId,
          ...(email ? { email } : {}),
          ...(emailSended !== undefined ? { emailSended } : {}),
          ...(productId ? { product: productId } : {}),
        },
      }),
    }
  );

  return mapOrder(response.data);
};

export const updateOrder = async (
  orderId: string | number,
  updates: { email?: string; emailSended?: boolean; productId?: string | number }
) => {
  console.log({
    data: {
      ...(updates.email !== undefined ? { email: updates.email } : {}),
      ...(updates.emailSended !== undefined ? { emailSended: updates.emailSended } : {}),
      ...(updates.productId ? { product: updates.productId } : {}),
    },
  });
  const response = await strapiFetch<StrapiSingleResponse<OrderEntry>>(
    `orders/${orderId}`,
    undefined,
    {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          ...(updates.email !== undefined ? { email: updates.email } : {}),
          ...(updates.emailSended !== undefined ? { emailSended: updates.emailSended } : {}),
          ...(updates.productId ? { product: updates.productId } : {}),
        },
      }),
    }
  );

  return mapOrder(response.data);
};

export const getCaseBySlug = async (slug: string) => {
  const response = await strapiFetch<StrapiCollectionResponse<any>>('cases', {
    'filters[slug][$eq]': slug,
    'populate[events][populate][evidence][populate][0]': '*',
    'populate[events][populate][questions][populate][0]': '*',
    'populate[events][populate][locations][populate][0]': '*',
    'populate[families][populate][0]': '*',
    'populate[characters][populate][family][populate][0]': '*',
    'populate[locations][populate][events][populate][0]': '*',
    'populate[locations][populate][evidences][populate][0]': '*',
    'populate[evidence][populate][locations][populate][0]': '*',
    'populate[evidence][populate][characters][populate][0]': '*',
    'populate[evidence][populate][families][populate][0]': '*',
    'populate[evidence][populate][asset][fields][0]': 'url',
    'populate[evidence][populate][gallery][fields][0]': 'url',
    'populate[questions][populate][options][populate][0]': '*',
    'populate[questions][populate][associationPairs][populate][0]': '*',
    'populate[questions][populate][chronologyItems][populate][0]': '*',
    'populate[questions][populate][event][populate][0]': '*',
    'populate[questions][populate][unlock_rule][populate][evidence_targets][populate][0]': '*',
    'populate[questions][populate][unlock_rule][populate][event_targets][populate][0]': '*',
    'populate[questions][populate][unlock_rule][populate][location_targets][populate][0]': '*',
  });

  const caseEntry = response.data?.[0];
  return caseEntry ? mapCase(caseEntry as any) : null;
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
