import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import TopNav from "@/components/nav/TopNav";
import FooterNav from "@/components/nav/FooterNav";
import VisitTracker from "@/components/VisitTracker";

export const metadata: Metadata = {
  title: "ʻŌlelo Noʻeau Search",
  description: "A searchable index of ʻōlelo noʻeau - Hawaiian poetical sayings",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use only your domain; never the Vercel deployment URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.olelonoeau.com';

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: "ʻŌlelo Noʻeau Search",
    description: 'A searchable index of ʻōlelo noʻeau — Hawaiian poetical sayings. Browse, search, and filter by Hawaiian letter, category, and tags.',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${baseUrl}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en">
      {/* Proprietary. © All rights reserved. */}
      <body>
        <Suspense fallback={null}>
          <VisitTracker />
        </Suspense>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSiteSchema).replace(/</g, '\\u003c'),
          }}
        />
        <TopNav />
        <main className="min-h-screen">
          {children}
        </main>
        <FooterNav />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
