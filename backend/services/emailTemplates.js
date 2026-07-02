/**
 * Branded HTML email templates for SK Cakes owner notifications.
 * Kept table-based / inline-styled on purpose -- this is the only layout
 * approach that renders consistently across Gmail, Outlook, and mobile
 * mail clients (no external stylesheets, no flexbox/grid).
 */

const BRAND = {
  name: 'SK Cakes',
  accent: '#D4536A',   // warm rose/pink, swap to your actual brand color
  dark: '#1A1A1A',
  bg: '#F7F3F0',
  cardBg: '#FFFFFF',
  muted: '#6B6B6B'
};

function wrapper(bodyHtml, { preheader = '' } = {}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${BRAND.name}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:${BRAND.cardBg};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND.dark};padding:24px 32px;">
              <span style="color:#ffffff;font-size:18px;font-weight:600;letter-spacing:-0.02em;">🍰 ${BRAND.name}</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #EEEEEE;">
              <p style="margin:0;font-size:12px;color:${BRAND.muted};">
                This is an automated notification from your ${BRAND.name} website.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function pill(text, color = BRAND.accent) {
  return `<span style="display:inline-block;background-color:${color}1A;color:${color};font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;">${text}</span>`;
}

function row(label, value) {
  if (!value) return '';
  return `
  <tr>
    <td style="padding:6px 0;font-size:13px;color:${BRAND.muted};width:120px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:${BRAND.dark};font-weight:500;">${value}</td>
  </tr>`;
}

function orderPaymentReceivedEmail(order) {
  const itemsRows = (order.items || []).map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F0F0F0;font-size:14px;color:${BRAND.dark};">${item.quantity} × ${item.name}</td>
      <td style="padding:10px 0;border-bottom:1px solid #F0F0F0;font-size:14px;color:${BRAND.muted};text-align:right;">UGX ${Number(item.price).toLocaleString()}</td>
    </tr>`).join('');

  const body = `
    <div style="margin-bottom:20px;">
      ${pill('✅ Payment Confirmed')}
    </div>
    <h1 style="margin:0 0 8px;font-size:20px;color:${BRAND.dark};">New order paid</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${BRAND.muted};">Order #${order._id.toString().slice(-8).toUpperCase()}</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      ${row('Customer', order.customerName)}
      ${row('Phone', order.customerPhone)}
      ${row('Email', order.customerEmail)}
      ${row('Delivery', order.deliveryAddress)}
      ${row('Payment', order.paymentMethod)}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg};border-radius:8px;padding:16px;margin-bottom:8px;">
      <tr><td colspan="2" style="padding-bottom:8px;font-size:12px;font-weight:600;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.04em;">Items</td></tr>
      ${itemsRows}
      <tr>
        <td style="padding-top:12px;font-size:15px;font-weight:700;color:${BRAND.dark};">Total</td>
        <td style="padding-top:12px;font-size:15px;font-weight:700;color:${BRAND.accent};text-align:right;">UGX ${Number(order.totalAmount).toLocaleString()}</td>
      </tr>
    </table>
  `;

  return wrapper(body, { preheader: `Payment received - UGX ${Number(order.totalAmount).toLocaleString()} from ${order.customerName}` });
}

function newMessageEmail(message) {
  const body = `
    <div style="margin-bottom:20px;">
      ${pill('📩 New Message', '#3B82F6')}
    </div>
    <h1 style="margin:0 0 8px;font-size:20px;color:${BRAND.dark};">${message.subject || 'General Inquiry'}</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${BRAND.muted};">from ${message.name}</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      ${row('Name', message.name)}
      ${row('Email', message.email)}
      ${row('Phone', message.phone)}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg};border-radius:8px;padding:16px;">
      <tr><td style="font-size:14px;line-height:1.6;color:${BRAND.dark};white-space:pre-wrap;">${message.message}</td></tr>
    </table>
  `;

  return wrapper(body, { preheader: `New message from ${message.name}: ${(message.message || '').slice(0, 80)}` });
}

module.exports = {
  orderPaymentReceivedEmail,
  newMessageEmail
};
