import "./globals.css";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

const WhatsAppFloat = dynamic(() => import("@/components/WhatsAppFloat"), {
  ssr: false,
});
const PwaRegister = dynamic(() => import("@/components/PwaRegister"), {
  ssr: false,
});

export const metadata = {
  title: "BuyWater Tamale – Fresh Water Delivered",
  description: "Water delivery for UDS and environs, Tamale, Ghana",
  applicationName: "BuyWater Tamale",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BuyWater Tamale",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0077C8",
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-[#EEF6FC] text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100`}
      >
        <ThemeProvider>
          {children}
          <WhatsAppFloat />
          <PwaRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
