const nodemailer = require('nodemailer');

/**
 * Emails the owner whenever an order's payment is confirmed.
 * Controlled by env vars in backend/.env:
 *
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=youraddress@gmail.com
 *   SMTP_PASS=<app password, not your normal Gmail password>
 *   NOTIFY_EMAIL_TO=lyavalakevin@gmail.com   (defaults to this if unset)
 *
 * If SMTP isn't configured yet, sending is skipped (logged, not thrown) so
 * it never blocks the order/payment flow.
 */

const DEFAULT_NOTIFY_EMAIL = 'lyavalakevin@gmail.com';

function formatOrderSummary(order) {
  const itemLines = (order.items || [])
    .map(item => `  - ${item.quantity} x ${item.name} @ ${item.price}`)
    .join('\n');

  return [
    `New payment received - SK Cakes`,
    `Order: #${order._id.toString().slice(-8)}`,
    `Customer: ${order.customerName} (${order.customerPhone})`,
    order.customerEmail ? `Email: ${order.customerEmail}` : null,
    `Delivery: ${order.deliveryAddress}`,
    `Total: UGX ${order.totalAmount}`,
    `Payment method: ${order.paymentMethod}`,
    `Items:`,
    itemLines
  ].filter(Boolean).join('\n');
}

let cachedTransporter = null;
function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: (parseInt(process.env.SMTP_PORT, 10) || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return cachedTransporter;
}

async function notifyOwnerOfPaymentReceived(order) {
  const to = process.env.NOTIFY_EMAIL_TO || DEFAULT_NOTIFY_EMAIL;
  const transporter = getTransporter();

  if (!transporter) {
    console.warn('⚠️ Payment notification email skipped - SMTP_HOST/SMTP_USER/SMTP_PASS not set in .env');
    return { skipped: true, reason: 'SMTP not configured' };
  }

  try {
    await transporter.sendMail({
      from: `"SK Cakes Orders" <${process.env.SMTP_USER}>`,
      to,
      subject: `✅ Payment received - Order #${order._id.toString().slice(-8)}`,
      text: formatOrderSummary(order)
    });
    return { sent: true };
  } catch (error) {
    console.error('⚠️ Payment notification email failed:', error.message);
    return { sent: false, error: error.message };
  }
}

module.exports = {
  notifyOwnerOfPaymentReceived
};
