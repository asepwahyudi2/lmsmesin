import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { LayoutShell } from "@/components/LayoutShell";
import { I18nProvider } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#f59e0b",
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "LMS SMK YPWKS Cilegon",
  description: "Vocational LMS for Mechanical Engineering",
  manifest: basePath ? `${basePath}/manifest.json` : "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-900 text-slate-50">
        <Providers>
          <I18nProvider>
            <LayoutShell>{children}</LayoutShell>
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}
