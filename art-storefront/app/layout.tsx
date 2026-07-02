import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { CartProvider } from "@/lib/cart-context";
import { CatalogProvider } from "@/lib/catalog-context";
import { siteConfig } from "@/lib/site-config";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} — Original Art & Sculpture`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} — Original Art & Sculpture`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    type: "website",
    images: ["/images/site/hero.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Original Art & Sculpture`,
    description: siteConfig.description,
    images: ["/images/site/hero.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <CatalogProvider>
          <CartProvider>
            <SiteChrome>{children}</SiteChrome>
          </CartProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
