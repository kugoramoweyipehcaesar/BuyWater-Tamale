import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { notifyAdminOrderCancelled } from "@/lib/email";
import { logActivity } from "@/lib/activityLogger";
import { clientIp } from "@/lib/security";

function isAdminRole(role) {
  return ["ADMIN", "SUPER_ADMIN"].includes(String(role || "").toUpperCase());
}

function isMomoPending(order) {
  const isMomo = String(order.paymentMethod || "")
    .toLowerCase()
    .includes("momo");
  if (!isMomo) return false;
  const notes = String(order.notes || "");
  if (notes.includes("PAYMENT_CONFIRMED")) return false;
  return notes.includes("PAYMENT_PENDING");
}

function withPaymentFlags(order) {
  const isMomo = String(order.paymentMethod || "")
    .toLowerCase()
    .includes("momo");
  return {
    ...order,
    paymentConfirmed: isMomo ? !isMomoPending(order) : true,
  };
}

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ order: withPaymentFlags(order) });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = params;
    const body = await request.json();
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isAdmin = isAdminRole(user.role);
    const isStaff =
      isAdmin || String(user.role || "").toUpperCase() === "RIDER";
    const isOwner =
      existing.userId === user.id || existing.email === user.email;

    if (!isStaff && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = {};
    if (body.status != null) {
      if (!isStaff && body.status !== "CANCELLED") {
        return NextResponse.json(
          { error: "Customers can only cancel orders" },
          { status: 403 }
        );
      }
      if (
        isStaff &&
        body.status &&
        body.status !== "CANCELLED" &&
        body.status !== "PENDING" &&
        isMomoPending(existing) &&
        body.paymentConfirmed !== true
      ) {
        return NextResponse.json(
          {
            error:
              "Confirm MoMo payment first before moving this order past Pending",
          },
          { status: 400 }
        );
      }
      data.status = body.status;
    }
    if (body.cancelReason != null) data.cancelReason = body.cancelReason;
    if (body.notes != null) data.notes = body.notes;
    if (isStaff) {
      if (body.driverName != null) data.driverName = body.driverName;
      if (body.driverPhone != null) data.driverPhone = body.driverPhone;
      // Confirm payment via notes only (no DB column)
      if (body.paymentConfirmed === true) {
        let n = String(
          data.notes != null ? data.notes : existing.notes || ""
        );
        n = n
          .replace(/\s*\|?\s*PAYMENT_PENDING/g, "")
          .replace(/\s*\|?\s*PAYMENT_CONFIRMED/g, "")
          .trim();
        n = `${n}${n ? " | " : ""}PAYMENT_CONFIRMED`.trim();
        data.notes = n;
      }
    }

    const order = await prisma.order.update({ where: { id }, data });

    const ip = clientIp(request);
    let emailResult = null;
    if (data.status === "CANCELLED") {
      await logActivity({
        userId: user.id,
        email: user.email,
        action: "ORDER_STATUS",
        details: `Cancelled ${order.orderNumber}${data.cancelReason ? ` · ${data.cancelReason}` : ""}`,
        ip,
      }).catch(() => {});
      try {
        emailResult = await notifyAdminOrderCancelled(order);
        console.log("[orders] cancel notify:", emailResult);
      } catch (err) {
        console.error("[orders] cancel notify error:", err?.message || err);
        emailResult = { ok: false, error: err?.message || "email error" };
      }
    } else if (body.paymentConfirmed) {
      await logActivity({
        userId: user.id,
        email: user.email,
        action: "PAYMENT_CONFIRMED",
        details: `MoMo payment confirmed for ${order.orderNumber}`,
        ip,
      }).catch(() => {});
    } else if (data.status) {
      await logActivity({
        userId: user.id,
        email: user.email,
        action: "ORDER_STATUS",
        details: `${order.orderNumber} → ${data.status}`,
        ip,
      }).catch(() => {});
    }

    return NextResponse.json({
      order: withPaymentFlags(order),
      adminEmailSent: emailResult ? !!emailResult.ok : undefined,
      adminEmailError:
        emailResult && !emailResult.ok ? emailResult.error : undefined,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = params;
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    const status = e.status || 500;
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status }
    );
  }
}
