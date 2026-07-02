const { Resend } = require('resend');
const { orderPaymentReceivedEmail, newMessageEmail } = require('./emailTemplates');

/**
 * Emails the owner whenever an order's payment is confirmed, or a
 * contact/consultation message comes in.
 *
 * Uses Resend's HTTPS API (via the official SDK) instead of raw SMTP --
 * Render's free tier blocks outbound traffic on SMTP ports 25/465/587,
 * but plain HTTPS (443) is unaffected.
 *
 * Env vars in backend/.env:
 *
 *   RESEND_API_KEY=re_xxxxxxxx        (from https://resend.com/api-keys)
 *   EMAIL_FROM=onboarding@resend.dev  (default sandbox sender, see note below)
 *   NOTIFY_EMAIL_TO=lyavalakevin@gmail.com   (defaults to this if unset)
 *
 * NOTE ON SANDBOX MODE: until you verify a real domain on Resend, you can
 * only send FROM onboarding@resend.dev, and only TO the email address you
 * signed up to Resend with. Since NOTIFY_EMAIL_TO is your own inbox, that's
 * fine for owner notifications as-is. To email customers directly later,
 * verify a domain at https://resend.com/domains and set EMAIL_FROM to
 * something like orders@skcakes.com.
 *
 * If RESEND_API_KEY isn't set, sending is skipped (logged, not thrown) so
 * it never blocks the order/payment flow.
 */

const DEFAULT_NOTIFY_EMAIL = 'lyavalakevin@gmail.com';
const DEFAULT_FROM = 'onboarding@resend.dev';

let resendClient = null;

function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

function isConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Low-level send. Throws on failure -- callers catch and log so a mail
 * hiccup never blocks the order/payment flow.
 */
async function send({ to, subject, html, replyTo }) {
  const client = getClient();

  if (!client) {
    console.warn('⚠️ Email skipped - RESEND_API_KEY not set in .env');
    return { skipped: true, reason: 'RESEND_API_KEY not configured' };
  }

  const from = process.env.EMAIL_FROM || DEFAULT_FROM;

  const { data, error } = await client.emails.send({
    from: `${'SK Cakes'} <${from}>`,
    to: [to],
    subject,
    html,
    ...(replyTo ? { reply_to: replyTo } : {})
  });

  if (error) {
    throw new Error(error.message || 'Resend API error');
  }

  return { sent: true, id: data?.id };
}

async function notifyOwnerOfPaymentReceived(order) {
  const to = process.env.NOTIFY_EMAIL_TO || DEFAULT_NOTIFY_EMAIL;

  try {
    return await send({
      to,
      subject: `✅ Payment received - Order #${order._id.toString().slice(-8)}`,
      html: orderPaymentReceivedEmail(order)
    });
  } catch (error) {
    console.error('⚠️ Payment notification email failed:', error.message);
    return { sent: false, error: error.message };
  }
}

async function notifyOwnerOfNewMessage(message) {
  const to = process.env.NOTIFY_EMAIL_TO || DEFAULT_NOTIFY_EMAIL;

  try {
    return await send({
      to,
      replyTo: message.email,
      subject: `📩 New ${message.subject || 'Inquiry'} - ${message.name}`,
      html: newMessageEmail(message)
    });
  } catch (error) {
    console.error('⚠️ Contact/consultation notification email failed:', error.message);
    return { sent: false, error: error.message };
  }
}

module.exports = {
  notifyOwnerOfPaymentReceived,
  notifyOwnerOfNewMessage
};
