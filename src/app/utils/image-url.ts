import { environment } from '../../environments/environment';

export function resolveImageUrl(path?: string | null): string | null {
  if (!path) return null;
  const isAbsolute = /^https?:\/\//i.test(path);
  if (isAbsolute) return path;
  // Fallback for legacy relative paths served by your API
  const base = environment.uploadsUrl?.replace(/\/$/, '') || '';
  return base && path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}
