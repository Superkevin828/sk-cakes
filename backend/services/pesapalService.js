/**
 * Pesapal v3 API client.
 *
 * Docs: https://developer.pesapal.com/how-to-integrate/api-30-json/api-reference
 *
 * Required env vars:
 *   PESAPAL_CONSUMER_KEY
 *   PESAPAL_CONSUMER_SECRET
 *   PESAPAL_ENV        "sandbox" (default) or "production"
 *   BACKEND_URL        e.g. https://sk-cakes-api.onrender.com  (used to build the IPN url)
 *   FRONTEND_URL       e.g. https://sk-cakes.pages.dev         (used to build the redirect-back url)
 * 
 * If PESAPAL_CONSUMER_KEY / PESAPAL_CONSUMER_SECRET are not set, isConfigured() returns
 * false and the caller (orderController) should fall back to the local simulator instead
 * of calling any of the functions below.
 */

const BASE_URLS = {
  sandbox: 'https://cybqa.pesapal.com/pesapalv3',
  production: 'https://pay.pesapal.com/v3'
};

function getBaseUrl() {
  const env = (process.env.PESAPAL_ENV || 'sandbox').toLowerCase();
  return BASE_URLS[env] || BASE_URLS.sandbox;
}

function isConfigured() {
  return Boolean(process.env.PESAPAL_CONSUMER_KEY && process.env.PESAPAL_CONSUMER_SECRET);
}

// In-memory caches. Fine for a single Render instance; they simply get
// rebuilt on cold start / redeploy.
let cachedToken = null;   // { token, expiryDate: Date }
let cachedIpnId = null;   // string

/**
 * Get a valid bearer token, requesting a new one only when the cached
 * one is missing or about to expire. Pesapal returns its own expiryDate
 * for the token -- always trust that value instead of assuming a fixed TTL.
 */
async function getAccessToken() {
  if (!isConfigured()) {
    throw new Error('Pesapal is not configured (missing PESAPAL_CONSUMER_KEY/SECRET).');
  }

  const now = Date.now();
  if (cachedToken && new Date(cachedToken.expiryDate).getTime() - now > 60 * 1000) {
    return cachedToken.token;
  }

  const res = await fetch(`${getBaseUrl()}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
    })
  });

  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(`Pesapal auth failed: ${data.error?.message || data.message || res.status}`);
  }

  cachedToken = { token: data.token, expiryDate: data.expiryDate };
  return data.token;
}

/**
 * Register (or re-use a cached) IPN url. Pesapal needs a notification_id
 * from this step before you can submit an order request.
 */
async function getIpnId() {
  if (cachedIpnId) return cachedIpnId;

  const ipnUrl = process.env.PESAPAL_IPN_URL || `${process.env.BACKEND_URL}/api/orders/pesapal-ipn`;
  if (!ipnUrl || ipnUrl.startsWith('undefined')) {
    throw new Error('Cannot register Pesapal IPN: set BACKEND_URL or PESAPAL_IPN_URL in .env');
  }

  const token = await getAccessToken();
  const res = await fetch(`${getBaseUrl()}/api/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ url: ipnUrl, ipn_notification_type: 'GET' })
  });

  const data = await res.json();
  if (!res.ok || !data.ipn_id) {
    throw new Error(`Pesapal IPN registration failed: ${data.error?.message || data.message || res.status}`);
  }

  cachedIpnId = data.ipn_id;
  return cachedIpnId;
}

/**
 * Submit an order to Pesapal and get back a hosted checkout redirect_url.
 * `order` is a Mongoose Order document.
 */
async function submitOrderRequest(order) {
  const token = await getAccessToken();
  const notificationId = await getIpnId();

  const callbackUrl = `${process.env.FRONTEND_URL}/?page=pesapal-callback&orderId=${order._id}`;

  // Pesapal requires a first/last name -- split the single customerName field.
  const [firstName, ...rest] = (order.customerName || 'Customer').trim().split(' ');
  const lastName = rest.join(' ') || firstName;

  const payload = {
    id: order._id.toString(),                // merchant_reference, must be unique per attempt
    currency: 'UGX',
    amount: order.totalAmount,
    description: `SK Cakes order #${order._id.toString().slice(-8)}`,
    callback_url: callbackUrl,
    notification_id: notificationId,
    billing_address: {
      email_address: order.customerEmail || undefined,
      phone_number: order.customerPhone,
      country_code: 'UG',
      first_name: firstName,
      last_name: lastName
    }
  };

  const res = await fetch(`${getBaseUrl()}/api/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`Pesapal order submission failed: ${data.error?.message || data.message || res.status}`);
  }

  // { order_tracking_id, merchant_reference, redirect_url }
  return data;
}

/**
 * Ask Pesapal for the current status of a transaction.
 * status_code: 0 = INVALID, 1 = COMPLETED, 2 = FAILED, 3 = REVERSED
 */
async function getTransactionStatus(orderTrackingId) {
  const token = await getAccessToken();
  const res = await fetch(
    `${getBaseUrl()}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
    {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Pesapal status check failed: ${data.error?.message || data.message || res.status}`);
  }

  return data;
}

module.exports = {
  isConfigured,
  getAccessToken,
  getIpnId,
  submitOrderRequest,
  getTransactionStatus
};
