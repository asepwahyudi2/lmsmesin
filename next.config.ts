import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.qrserver.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://api.qrserver.com https://threejs.org https://*.public.blob.vercel-storage.com; connect-src 'self' https://api.qrserver.com https://*.public.blob.vercel-storage.com; media-src 'self' https://*.public.blob.vercel-storage.com; font-src 'self' data:; object-src 'none';",
  },
];

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs", "@prisma/client", "bcryptjs", "speakeasy", "web-push"],
  basePath: basePath || undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.qrserver.com" },
      { protocol: "https", hostname: "threejs.org" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
