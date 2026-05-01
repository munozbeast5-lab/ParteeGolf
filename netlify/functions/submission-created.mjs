// Triggered by Netlify Forms when a verified (non-spam) submission is captured.
// Forwards every booking-form submission to the three Par-Tee Golf owners by email
// via the Resend REST API. Customer email is set as Reply-To so any owner can
// reply directly from their inbox.
//
// Required env vars (set in Netlify > Project configuration > Environment variables):
//   RESEND_API_KEY  — API key from https://resend.com (Runtime scope)
//   FROM_EMAIL      — verified sending address, e.g. bookings@partee.golf
//
// Optional env var:
//   OWNER_EMAILS    — comma-separated override; defaults to the three owners.

const DEFAULT_OWNERS = 'dom@partee.golf,vic@partee.golf,ben@partee.golf';

const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const FIELD_LABELS = {
  eventType: 'Event Type',
  eventDate: 'Event Date',
  eventTime: 'Start Time',
  guestCount: 'Expected Guests',
  indoorOutdoor: 'Indoor / Outdoor',
  address: 'Venue Address',
  package: 'Package',
  addons: 'Add-Ons',
  addonNotes: 'Notes / Special Requests',
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email',
  phone: 'Phone',
  referral: 'Heard About Us Via',
  consentContact: 'Contact Consent',
  consentWaiver: 'Liability Acknowledged',
  consentAge: '18+ Confirmed',
};

const ORDER = Object.keys(FIELD_LABELS);

function buildHtml(data, meta) {
  const rows = ORDER
    .filter((k) => data[k] != null && String(data[k]).trim() !== '')
    .map((k) => `
      <tr>
        <td style="padding:8px 14px;background:#f4f6fb;font-weight:600;color:#091e44;border-bottom:1px solid #e3e7f1;width:200px;vertical-align:top;">${escapeHtml(FIELD_LABELS[k])}</td>
        <td style="padding:8px 14px;color:#1c2230;border-bottom:1px solid #e3e7f1;">${escapeHtml(data[k])}</td>
      </tr>`)
    .join('');

  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#eef1f8;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(9,30,68,.08);">
    <tr><td style="padding:28px 28px 8px;background:#091e44;color:#ffffff;">
      <div style="font-size:.75rem;letter-spacing:.18em;text-transform:uppercase;color:#d4af37;">New Booking Request</div>
      <h1 style="margin:6px 0 0;font-size:1.5rem;">Par-Tee Golf</h1>
    </td></tr>
    <tr><td style="padding:24px 28px 8px;color:#1c2230;font-size:.95rem;">
      A new event request just came in through the website. Reply to this email to respond directly to the customer.
    </td></tr>
    <tr><td style="padding:8px 28px 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;font-size:.9rem;">
        ${rows}
      </table>
    </td></tr>
    <tr><td style="padding:16px 28px 24px;border-top:1px solid #e3e7f1;color:#6b7280;font-size:.75rem;">
      Submission ID: ${escapeHtml(meta.id || '—')}<br>
      Received: ${escapeHtml(meta.created_at || new Date().toISOString())}<br>
      View in Netlify: <a href="https://app.netlify.com/sites/par-teegolf/forms" style="color:#091e44;">app.netlify.com/sites/par-teegolf/forms</a>
    </td></tr>
  </table>
</body></html>`;
}

function buildText(data, meta) {
  const lines = ORDER
    .filter((k) => data[k] != null && String(data[k]).trim() !== '')
    .map((k) => `${FIELD_LABELS[k]}: ${data[k]}`);
  lines.push('', `Submission ID: ${meta.id || '-'}`, `Received: ${meta.created_at || new Date().toISOString()}`);
  return `New Par-Tee Golf booking request\n\n${lines.join('\n')}\n`;
}

export default async (req) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;
  const owners = (process.env.OWNER_EMAILS || DEFAULT_OWNERS)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response('invalid json', { status: 400 });
  }

  const payload = body?.payload ?? body;
  const formName = payload?.form_name || payload?.data?.['form-name'];
  if (formName && formName !== 'booking') {
    return new Response('ignored', { status: 200 });
  }

  if (!apiKey || !from) {
    console.warn('submission-created: RESEND_API_KEY or FROM_EMAIL not set; skipping email send.');
    return new Response('email not configured', { status: 200 });
  }

  const data = payload?.data || {};
  const customerEmail = data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ? data.email : null;
  const customerName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();

  const subject = `New booking request — ${data.eventType || 'Par-Tee Golf'}${customerName ? ` (${customerName})` : ''}`;

  const message = {
    from,
    to: owners,
    subject,
    html: buildHtml(data, { id: payload?.id, created_at: payload?.created_at }),
    text: buildText(data, { id: payload?.id, created_at: payload?.created_at }),
    ...(customerEmail ? { reply_to: customerEmail } : {}),
  };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('Resend send failed', res.status, text);
      return new Response('email send failed', { status: 502 });
    }
  } catch (err) {
    console.error('Resend send error', err);
    return new Response('email send error', { status: 502 });
  }

  return new Response('ok', { status: 200 });
};
