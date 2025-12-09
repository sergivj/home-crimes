import crypto from 'crypto';

const getSecret = () => process.env.ACCESS_CODE_SECRET || 'home-crimes-dev-secret';

export interface AccessCodePayload {
  productSlug: string;
  sessionId: string;
}

export const createAccessCode = ({ productSlug, sessionId }: AccessCodePayload) => {
  const payload = Buffer.from(`${productSlug}|${sessionId}`, 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('hex')
    .slice(0, 16)
    .toUpperCase();

  return `${payload}.${signature}`;
};

export const verifyAccessCode = (code: string): AccessCodePayload | null => {
  const [rawPayload, signature] = code.trim().split('.');
  if (!rawPayload || !signature) return null;

  const expected = crypto
    .createHmac('sha256', getSecret())
    .update(rawPayload)
    .digest('hex')
    .slice(0, 16)
    .toUpperCase();

  if (expected !== signature.toUpperCase()) return null;

  try {
    const decoded = Buffer.from(rawPayload, 'base64url').toString('utf8');
    const [productSlug, sessionId] = decoded.split('|');
    if (!productSlug || !sessionId) return null;

    return { productSlug, sessionId };
  } catch (error) {
    console.error('Failed to decode access code', error);
    return null;
  }
};
