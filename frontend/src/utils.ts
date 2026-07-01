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

// Product images come back as "/uploads/xyz.png" (relative to the Render backend).
// The frontend lives on a different domain (Cloudflare Pages), so relative paths
// must be prefixed with API_BASE_URL, otherwise the browser requests them from
// the frontend's own domain and gets a 404.
export function getImageUrl(url?: string): string {
  if (!url) return `${API_BASE_URL}/uploads/placeholder-product.png`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}
