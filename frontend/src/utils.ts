export function formatCurrency(amount: number, currency: 'UGX' | 'CLP'): string {
  if (currency === 'UGX') {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  } else {
    // CLP (Chilean Peso)
    // Map approximate pricing: 1 UGX ~ 0.25 CLP or display standard Chilean values
    const clpAmount = Math.round(amount * 0.25);
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(clpAmount);
  }
}

export function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ');
}

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

/**
 * Resolves a product/image path returned by the backend (e.g. "/uploads/cake.png")
 * into a full URL the browser can actually load. Leaves already-absolute URLs
 * (e.g. external image links) untouched.
 */
export function resolveImageUrl(path?: string | null): string {
  if (!path) return `${API_BASE_URL}/uploads/placeholder-product.png`;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
