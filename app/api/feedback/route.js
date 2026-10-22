import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAdmin, isAdminRole } from "@/lib/auth";
import { logActivity } from "@/lib/activityLogger";
import { notifyAdminComplaint } from "@/lib/email";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    if (isAdminRole(user.role)) {
      const items = await prisma.feedback.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
      });
      return NextResponse.json({ complaints: items });
    }

    const email = (user.email || "").toLowerCase();
    if (!email) {
      return NextResponse.json({ complaints: [] });
    }
    const items = await prisma.feedback.findMany({
      where: { userEmail: email },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    if (!items.length) {
      const all = await prisma.feedback.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
      });
      const mine = all.filter(
        (c) => (c.userEmail || "").toLowerCase() === email
      );
      return NextResponse.json({ complaints: mine });
    }
    return NextResponse.json({ complaints: items });
  } catch (e) {
    const status = e.status || 500;
    return NextResponse.json({ error: e.message || "Server error" }, { status });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }
    if (isAdminRole(user.role)) {
      return NextResponse.json(
        { error: "Admins cannot submit complaints from their profile" },
        { status: 403 }
      );
    }
    const body = await request.json();
    const message = String(body.message || "").trim();
    if (!message || message.length < 5) {
      return NextResponse.json(
        { error: "Please write a complaint (at least 5 characters)" },
        { status: 400 }
      );
    }
    if (message.length > 4000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    const row = await prisma.feedback.create({
      data: {
        userEmail: (user.email || "").toLowerCase() || null,
        userName: user.name || user.username || null,
        message,
        status: "open",
      },
    });

    await logActivity({
      userId: user.id,
      email: user.email,
      action: "COMPLAINT_SUBMITTED",
      details: message.slice(0, 200),
    }).catch(() => {});

    notifyAdminComplaint({
      userName: row.userName,
      userEmail: row.userEmail,
      message: row.message,
    }).catch((e) => console.error("[feedback] notifyAdminComplaint", e?.message || e));

    return NextResponse.json({ success: true, complaint: row }, { status: 201 });
  } catch (e) {
    console.error("feedback POST", e);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await requireAdmin();
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const data = {};
    if (body.status) data.status = String(body.status);
    if (body.adminResponse !== undefined) {
      data.adminResponse = String(body.adminResponse || "").slice(0, 4000);
      if (data.adminResponse.trim() && !body.status) {
        data.status = "responded";
      }
    }
    const row = await prisma.feedback.update({
      where: { id: body.id },
      data,
    });
    return NextResponse.json({ complaint: row });
  } catch (e) {
    const status = e.status || 500;
    return NextResponse.json({ error: e.message || "Server error" }, { status });
  }
}

export async function DELETE(request) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => ({}));
    const id = body.id || new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    await prisma.feedback.delete({ where: { id: String(id) } });
    return NextResponse.json({ success: true });
  } catch (e) {
    const status = e.status || 500;
    return NextResponse.json({ error: e.message || "Server error" }, { status });
  }
}
