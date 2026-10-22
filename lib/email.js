/**
 * BuyWater email — Resend
 * All critical alerts go immediately to the super admin.
 */

import { Resend } from "resend";

const FROM = "BuyWater <onboarding@resend.dev>";

/** Hard-coded super admin — always receives alerts */
const SUPER_ADMIN_EMAIL = "kugoramoweyipehcaesar49@gmail.com";

const ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL ||
  process.env.ADMIN_EMAIL ||
  SUPER_ADMIN_EMAIL;

/** Always include the super admin so env misconfig cannot drop alerts */
function adminRecipients(extra) {
  const set = new Set(
    [SUPER_ADMIN_EMAIL, ADMIN_EMAIL, extra]
      .flat()
      .filter(Boolean)
      .map((e) => String(e).toLowerCase().trim())
  );
  return Array.from(set);
}

const APP_URL =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://buywater-tamale.onrender.com";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[email] RESEND_API_KEY is missing");
    return null;
  }
  return new Resend(key);
}

/** Core send — always targets super admin unless a specific user email is required */
export async function sendEmail({ to, subject, html, text }) {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "RESEND_API_KEY not set on Render" };
  }

  const recipientList = Array.isArray(to)
    ? to
    : to
      ? [to]
      : adminRecipients();

  console.log("[email] Sending via Resend →", recipientList.join(", "), "|", subject);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: recipientList,
      subject,
      html:
        html ||
        `<pre style="font-family:sans-serif">${text || subject}</pre>`,
      text: text || undefined,
    });

    if (error) {
      console.error("[email] Resend FAILED:", error);
      // Fallback: try one-by-one to super admin if batch failed
      if (recipientList.length > 1 || recipientList[0] !== SUPER_ADMIN_EMAIL) {
        try {
          const retry = await resend.emails.send({
            from: FROM,
            to: [SUPER_ADMIN_EMAIL],
            subject,
            html:
              html ||
              `<pre style="font-family:sans-serif">${text || subject}</pre>`,
          });
          if (!retry.error) {
            console.log("[email] Resend SUCCESS (fallback to super admin):", retry.data);
            return { ok: true, data: retry.data, messageId: retry.data?.id };
          }
        } catch (_) {}
      }
      return {
        ok: false,
        error:
          typeof error === "string"
            ? error
            : error.message || JSON.stringify(error),
      };
    }

    console.log("[email] Resend SUCCESS:", data);
    return { ok: true, data, messageId: data?.id };
  } catch (err) {
    console.error("[email] CRITICAL FAIL:", err?.message || err);
    return { ok: false, error: err?.message || String(err) };
  }
}

function wrapHtml(title, bodyHtml) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#EEF6FC;font-family:system-ui,sans-serif">
  <div style="max-width:520px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.06)">
    <div style="background:#0077C8;padding:20px 24px;color:#fff">
      <div style="font-size:20px;font-weight:700">BuyWater</div>
      <div style="font-size:13px;opacity:.9">Fresh Water Delivered · Tamale</div>
    </div>
    <div style="padding:24px">
      <h1 style="margin:0 0 12px;font-size:18px;color:#0B2545">${title}</h1>
      ${bodyHtml}
    </div>
    <div style="padding:14px 24px;background:#f8fafc;font-size:11px;color:#94a3b8">
      BuyWater admin alert · ${APP_URL}
    </div>
  </div>
</body></html>`;
}

function formatProducts(order) {
  try {
    const p = typeof order.products === "string" ? JSON.parse(order.products) : order.products;
    if (Array.isArray(p)) {
      return p
        .map((x) => `${x.name || "Item"} × ${x.qty ?? x.quantity ?? 1}`)
        .join(", ");
    }
    return String(order.products || "—").slice(0, 200);
  } catch {
    return String(order.products || "—").slice(0, 200);
  }
}

/** Admin: new order */
export async function notifyAdminOrderPlaced(order) {
  const num = order.orderNumber || order.order_number || order.id;
  const total = Number(order.totalAmount ?? order.total_amount ?? 0).toFixed(2);
  const isMomo = String(order.paymentMethod || "")
    .toLowerCase()
    .includes("momo");
  const subject = isMomo
    ? `[BuyWater] MoMo order ${num} — Ghc ${total} (confirm payment)`
    : `[BuyWater] New order ${num} — Ghc ${total}`;
  const productsLine = formatProducts(order);
  const location =
    order.hostel || order.address || order.delivery_address || "—";
  const momoBlock = isMomo
    ? `
      <tr><td style="padding:6px 0;color:#64748b">MoMo phone used</td><td><strong style="color:#b45309">${order.momoNumber || "—"}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Transaction reference</td><td><strong style="color:#b45309">${order.momoReference || "—"}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Payment status</td><td><strong style="color:#b45309">Pending confirmation</strong></td></tr>`
    : "";
  const html = wrapHtml(
    isMomo ? `MoMo payment · order ${num}` : `New order ${num}`,
    `<table style="width:100%;font-size:14px;color:#334155;border-collapse:collapse">
      <tr><td style="padding:6px 0;color:#64748b;width:40%">Order #</td><td><strong>${num}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Customer</td><td><strong>${order.customerName || order.customer_name || "—"}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Phone</td><td>${order.phone || order.customer_phone || "—"}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Email</td><td>${order.email || "—"}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Location</td><td>${location}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Room / Block</td><td>${order.roomNumber || "—"} / ${order.blockNumber || "—"}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Items</td><td>${productsLine}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Gallons</td><td><strong>${order.gallons ?? "—"}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Price</td><td><strong style="color:#0077C8;font-size:16px">Ghc ${total}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Payment</td><td>${isMomo ? "Mobile Money" : "Cash on delivery"}</td></tr>
      ${momoBlock}
    </table>
    <p style="margin:16px 0 0"><a href="${APP_URL}/admin/order-queue" style="display:inline-block;background:#0077C8;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600;font-size:13px">Open order queue</a></p>`
  );
  return sendEmail({ to: adminRecipients(), subject, html });
}

export async function notifyAdminOrderCancelled(order) {
  const num = order.orderNumber || order.id;
  const subject = `[BuyWater] Order cancelled ${num}`;
  const html = wrapHtml(
    `Order cancelled ${num}`,
    `<table style="width:100%;font-size:14px;color:#334155;border-collapse:collapse">
      <tr><td style="padding:6px 0;color:#64748b">Order #</td><td><strong>${num}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Customer</td><td>${order.customerName || "—"}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Email</td><td>${order.email || "—"}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Reason</td><td>${order.cancelReason || "—"}</td></tr>
    </table>`
  );
  return sendEmail({ to: adminRecipients(), subject, html });
}

export async function notifyAdminLogin({ email, name, role, when, ip }) {
  const subject = `[BuyWater] Login: ${email}`;
  const html = wrapHtml(
    "User login",
    `<table style="width:100%;font-size:14px;color:#334155;border-collapse:collapse">
      <tr><td style="padding:4px 0;color:#64748b;width:30%">Email</td><td><strong>${email || "—"}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#64748b">Name</td><td>${name || "—"}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b">Role</td><td>${role || "USER"}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b">When</td><td>${when || new Date().toLocaleString()}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b">IP</td><td>${ip || "—"}</td></tr>
    </table>`
  );
  return sendEmail({ to: adminRecipients(), subject, html });
}

export async function notifyAdminSignup({ email, name, phone, when, ip }) {
  const subject = `[BuyWater] New signup: ${email}`;
  const html = wrapHtml(
    "New user signup",
    `<table style="width:100%;font-size:14px;color:#334155;border-collapse:collapse">
      <tr><td style="padding:4px 0;color:#64748b;width:30%">Email</td><td><strong>${email || "—"}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#64748b">Name</td><td>${name || "—"}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b">Phone</td><td>${phone || "—"}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b">When</td><td>${when || new Date().toLocaleString()}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b">IP</td><td>${ip || "—"}</td></tr>
    </table>
    <p style="margin:16px 0 0"><a href="${APP_URL}/admin/users" style="display:inline-block;background:#0077C8;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600;font-size:13px">Open user directory</a></p>`
  );
  return sendEmail({ to: adminRecipients(), subject, html });
}

export async function notifyAdminComplaint({ email, name, message, when }) {
  const subject = `[BuyWater] Complaint from ${email || name || "user"}`;
  const html = wrapHtml(
    "New customer complaint",
    `<table style="width:100%;font-size:14px;color:#334155;border-collapse:collapse">
      <tr><td style="padding:4px 0;color:#64748b;width:30%">From</td><td><strong>${name || "—"}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#64748b">Email</td><td>${email || "—"}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b">When</td><td>${when || new Date().toLocaleString()}</td></tr>
    </table>
    <div style="margin-top:12px;padding:12px;background:#fef3c7;border-radius:10px;font-size:14px;color:#78350f;white-space:pre-wrap">${String(message || "").slice(0, 2000)}</div>
    <p style="margin:16px 0 0"><a href="${APP_URL}/admin/complaints" style="display:inline-block;background:#0077C8;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600;font-size:13px">Open complaints</a></p>`
  );
  return sendEmail({ to: adminRecipients(), subject, html });
}

export async function notifyAdminPaymentConfirmed(order) {
  const num = order.orderNumber || order.id;
  const total = Number(order.totalAmount ?? 0).toFixed(2);
  const subject = `[BuyWater] MoMo confirmed · ${num} — Ghc ${total}`;
  const html = wrapHtml(
    `MoMo payment confirmed · ${num}`,
    `<table style="width:100%;font-size:14px;color:#334155;border-collapse:collapse">
      <tr><td style="padding:6px 0;color:#64748b;width:40%">Order #</td><td><strong>${num}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Customer</td><td>${order.customerName || "—"}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Email</td><td>${order.email || "—"}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">MoMo phone</td><td>${order.momoNumber || "—"}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Transaction ref</td><td>${order.momoReference || "—"}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Amount</td><td><strong style="color:#059669">Ghc ${total}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Status</td><td><strong style="color:#059669">Payment confirmed</strong></td></tr>
    </table>
    <p style="margin:16px 0 0"><a href="${APP_URL}/admin/order-queue" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600;font-size:13px">Open order queue</a></p>`
  );
  return sendEmail({ to: adminRecipients(), subject, html });
}

export async function sendPasswordResetEmail(email, resetUrl) {
  const subject = "[BuyWater] Reset your password";
  const html = wrapHtml(
    "Password reset",
    `<p style="font-size:14px;color:#334155">Click the button below to reset your password. This link expires soon.</p>
     <p style="margin:16px 0"><a href="${resetUrl}" style="display:inline-block;background:#0077C8;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600;font-size:13px">Reset password</a></p>
     <p style="font-size:12px;color:#94a3b8">If you did not request this, ignore this email.</p>`
  );
  const userResult = await sendEmail({ to: email, subject, html });
  await sendEmail({
    to: adminRecipients(),
    subject: `[BuyWater] Password reset requested: ${email}`,
    html: wrapHtml("Password reset requested", `<p>${email} requested a password reset.</p>`),
  }).catch(() => {});
  return userResult;
}

export async function sendAdminInviteEmail(email, inviteUrl, role) {
  const subject = "[BuyWater] Admin invitation";
  const html = wrapHtml(
    "You are invited as admin",
    `<p style="font-size:14px;color:#334155">You have been invited as <strong>${role || "ADMIN"}</strong> on BuyWater.</p>
     <p style="margin:16px 0"><a href="${inviteUrl}" style="display:inline-block;background:#0077C8;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600;font-size:13px">Accept invitation</a></p>`
  );
  const toUser = await sendEmail({ to: email, subject, html });
  await sendEmail({
    to: adminRecipients(),
    subject: `[BuyWater] Invite sent to ${email}`,
    html: wrapHtml("Admin invite sent", `<p>Invite sent to ${email} as ${role || "ADMIN"}.</p>`),
  }).catch(() => {});
  return toUser;
}

export async function sendTestEmail(to = SUPER_ADMIN_EMAIL) {
  return sendEmail({
    to: to || SUPER_ADMIN_EMAIL,
    subject: `[BuyWater] Test email · ${new Date().toISOString()}`,
    html: wrapHtml(
      "Test email",
      `<p style="font-size:14px;color:#334155">If you received this, Resend is working.</p>
       <p style="font-size:13px;color:#64748b">From: ${FROM}<br/>To: ${to || SUPER_ADMIN_EMAIL}<br/>Time: ${new Date().toLocaleString()}</p>`
    ),
  });
}

export function isSmtpConfigured() {
  return !!process.env.RESEND_API_KEY;
}

export { APP_URL, ADMIN_EMAIL, SUPER_ADMIN_EMAIL as SUPER_ADMIN };

export default {
  sendEmail,
  notifyAdminOrderPlaced,
  notifyAdminOrderCancelled,
  notifyAdminLogin,
  notifyAdminSignup,
  notifyAdminComplaint,
  notifyAdminPaymentConfirmed,
};
