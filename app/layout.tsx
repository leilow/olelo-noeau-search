import type { Metadata, Viewport } from "next";
import "./globals.css";
import TopNav from "@/components/nav/TopNav";
import FooterNav from "@/components/nav/FooterNav";

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
  return (
    <html lang="en">
      <body>
        {/* ⚠️ DEPLOYMENT NOTE: Remove this script before deploying to production!
            This bypasses localtunnel password page for development only. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Intercept fetch
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                  const [url, options = {}] = args;
                  const headers = new Headers(options.headers);
                  headers.set('bypass-tunnel-reminder', '1');
                  return originalFetch.apply(this, [url, { ...options, headers }]);
                };
                
                // Intercept XMLHttpRequest
                const originalOpen = XMLHttpRequest.prototype.open;
                const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
                XMLHttpRequest.prototype.open = function(method, url, ...rest) {
                  this._url = url;
                  return originalOpen.apply(this, [method, url, ...rest]);
                };
                XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
                  if (header.toLowerCase() !== 'bypass-tunnel-reminder') {
                    return originalSetRequestHeader.apply(this, [header, value]);
                  }
                };
                const originalSend = XMLHttpRequest.prototype.send;
                XMLHttpRequest.prototype.send = function(...args) {
                  this.setRequestHeader('bypass-tunnel-reminder', '1');
                  return originalSend.apply(this, args);
                };
              })();
            `,
          }}
        />
        <TopNav />
        <main className="min-h-screen">
          {children}
        </main>
        <FooterNav />
      </body>
    </html>
  );
}
