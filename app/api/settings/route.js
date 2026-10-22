import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const ALLOWED = [
  "serviceActive",
  "maintenanceMode",
  "maintenanceMessage",
  "heroTitle",
  "operatingHours",
  "productImageUrl",
  "productDescription",
  "deliveryTimeMin",
  "deliveryTimeMax",
  "pricePerGallon",
  "subscriptionPrice",
  "subscriptionGallons",
  "cashEnabled",
  "momoEnabled",
  "momoNumber",
  "momoName",
  "momoNumber2",
  "momoName2",
  "adminPhone",
  "adminEmail",
  "serviceArea",
  "contentJson",
  "gallonSize",
];

const BOOL = new Set([
  "serviceActive",
  "maintenanceMode",
  "cashEnabled",
  "momoEnabled",
]);
const NUM = new Set([
  "deliveryTimeMin",
  "deliveryTimeMax",
  "pricePerGallon",
  "subscriptionPrice",
  "subscriptionGallons",
  "gallonSize",
]);

function parseExtra(contentJson) {
  try {
    return contentJson ? JSON.parse(contentJson) : {};
  } catch {
    return {};
  }
}

function withExtras(settings) {
  if (!settings) return settings;
  const extra = parseExtra(settings.contentJson);
  const whatsappNumber =
    extra.whatsappNumber || settings.adminPhone || settings.momoNumber || "";
  const secondaryPhone =
    extra.secondaryPhone ||
    extra.callNumber2 ||
    settings.momoNumber2 ||
    "";
  return {
    ...settings,
    outOfStock: !!extra.outOfStock,
    whatsappNumber,
    secondaryPhone,
    callNumber1: whatsappNumber,
    callNumber2: secondaryPhone,
    momoNumber3: extra.momoNumber3 || settings.momoNumber3 || "",
    momoName3: extra.momoName3 || settings.momoName3 || "",
    howItWorks: extra.howItWorks || null,
    whyChoose: extra.whyChoose || null,
    supportSection: extra.supportSection || null,
    ctaSection: extra.ctaSection || null,
    footerSection: extra.footerSection || null,
    productSection: extra.productSection || null,
  };
}

function pick(body) {
  const data = {};
  for (const k of ALLOWED) {
    if (body[k] === undefined) continue;
    let v = body[k];
    if (BOOL.has(k)) v = v === true || v === "true" || v === 1 || v === "1";
    if (NUM.has(k)) {
      const n = Number(v);
      if (Number.isFinite(n)) v = n;
      else continue;
    }
    if (typeof v === "string") v = v.slice(0, 5000);
    data[k] = v;
  }
  return data;
}

export async function GET() {
  try {
    let settings = await prisma.appSettings.findFirst();
    if (!settings) {
      settings = await prisma.appSettings.create({ data: {} });
    }
    return NextResponse.json({ settings: withExtras(settings) });
  } catch (e) {
    console.error("settings GET", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await requireAdmin();
    const raw = await request.json();
    const body = pick(raw);

    let settingsRow = await prisma.appSettings.findFirst();
    const extra = parseExtra(settingsRow?.contentJson);

    if (raw.whatsappNumber !== undefined) {
      extra.whatsappNumber = String(raw.whatsappNumber || "").trim();
      if (extra.whatsappNumber && body.adminPhone === undefined) {
        body.adminPhone = extra.whatsappNumber;
      }
    }

    if (raw.secondaryPhone !== undefined) {
      extra.secondaryPhone = String(raw.secondaryPhone || "").trim();
      extra.callNumber2 = extra.secondaryPhone;
    }

    if (raw.howItWorks !== undefined) {
      const h = raw.howItWorks || {};
      const steps = Array.isArray(h.steps) ? h.steps : [];
      extra.howItWorks = {
        sectionTitle: String(h.sectionTitle || "How It Works").slice(0, 120),
        steps: [0, 1, 2].map((i) => {
          const s = steps[i] || {};
          return {
            title: String(s.title || "").slice(0, 80),
            desc: String(s.desc || "").slice(0, 500),
          };
        }),
      };
    }

    if (raw.whyChoose !== undefined) {
      const w = raw.whyChoose || {};
      const items = Array.isArray(w.items) ? w.items : [];
      extra.whyChoose = {
        badge: String(w.badge || "Built for Students").slice(0, 80),
        sectionTitle: String(w.sectionTitle || "Why Choose BuyWater").slice(0, 120),
        items: [0, 1, 2, 3, 4, 5].map((i) => {
          const it = items[i] || {};
          return {
            title: String(it.title || "").slice(0, 80),
            desc: String(it.desc || "").slice(0, 500),
          };
        }),
      };
    }

    if (raw.supportSection !== undefined) {
      const s = raw.supportSection || {};
      const card = (c, fallbackTitle, fallbackDesc) => ({
        title: String((c && c.title) || fallbackTitle).slice(0, 80),
        desc: String((c && c.desc) || fallbackDesc).slice(0, 500),
      });
      extra.supportSection = {
        whatsapp: card(s.whatsapp, "WhatsApp", "Fastest response · opens DM"),
        email: card(s.email, "Email", "We'll reply within 24 hours"),
        hours: card(s.hours, "Hours", ""),
        issues: card(
          s.issues,
          "Issues?",
          "Late delivery, wrong hostel — report from your Profile → Submit complaint"
        ),
      };
    }

    if (raw.ctaSection !== undefined) {
      const c = raw.ctaSection || {};
      extra.ctaSection = {
        title: String(c.title || "Thirsty? Get Water Now.").slice(0, 120),
        subtitle: String(
          c.subtitle ||
            "Order in seconds. Delivered in minutes. Serving all UDS hostels and environs in Tamale."
        ).slice(0, 400),
        buttonText: String(c.buttonText || "").slice(0, 80),
      };
    }

    if (raw.footerSection !== undefined) {
      const f = raw.footerSection || {};
      extra.footerSection = {
        brandName: String(f.brandName || "BuyWater").slice(0, 80),
        locationLine: String(
          f.locationLine || "Tamale UDS and environs · Tamale, Northern Region, Ghana"
        ).slice(0, 200),
        contactLine: String(f.contactLine || "").slice(0, 200),
        copyrightLine: String(
          f.copyrightLine || "BuyWater. Fresh Water Delivered."
        ).slice(0, 200),
      };
    }

    if (raw.contentJson !== undefined && typeof raw.contentJson === "string") {
      try {
        const incoming = JSON.parse(raw.contentJson);
        Object.assign(extra, incoming);
      } catch (_) {}
    }

    if (raw.productSection !== undefined) {
      const p = raw.productSection || {};
      const tags = Array.isArray(p.tags) ? p.tags : [];
      extra.productSection = {
        sectionTitle: String(p.sectionTitle || "Premium 20-Liter Water Gallons").slice(0, 120),
        description: String(p.description || "").slice(0, 500),
        tags: [0, 1, 2].map((i) => String(tags[i] || "").slice(0, 40)),
      };
      if (extra.productSection.description) {
        body.productDescription = extra.productSection.description;
      }
    }

    body.contentJson = JSON.stringify(extra);

    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    let settings = settingsRow;
    if (!settings) {
      settings = await prisma.appSettings.create({ data: body });
    } else {
      settings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: body,
      });
    }

    try {
      revalidatePath("/");
      revalidatePath("/order");
      revalidatePath("/dashboard");
      revalidatePath("/admin");
    } catch (e) {
      console.warn("revalidatePath", e.message);
    }

    return NextResponse.json({ settings: withExtras(settings), success: true, live: true });
  } catch (e) {
    console.error("settings PATCH", e);
    const status = e.status || 500;
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status }
    );
  }
}
