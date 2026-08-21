const isDevelopment = process.env.NODE_ENV === "development";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self'",
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src https://www.youtube-nocookie.com",
  // Keep this image/media allowlist in sync with `images.remotePatterns` below.
  "img-src 'self' data: blob: https://commons.wikimedia.org https://upload.wikimedia.org https://images.unsplash.com https://images.pexels.com https://i.imgur.com https://*.imgbox.com https://*.giphy.com https://media.tenor.com",
  "manifest-src 'self'",
  "media-src 'self' https://commons.wikimedia.org https://upload.wikimedia.org https://images.unsplash.com https://images.pexels.com https://i.imgur.com https://*.imgbox.com https://*.giphy.com https://media.tenor.com",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "upgrade-insecure-requests",
  "worker-src 'self' blob:",
].join("; ");

const baselineSecurityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "off",
  },
];

const publicPageSources = [
  "/",
  "/about",
  "/blog",
  "/blog/:path*",
  "/contact",
  "/projects",
  "/projects/:path*",
  "/services",
  "/skills",
  "/tools",
  "/tools/:path*",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  images: {
    minimumCacheTTL: 2_678_400,
    remotePatterns: [
      { protocol: "https", hostname: "commons.wikimedia.org" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "**.imgbox.com" },
      { protocol: "https", hostname: "**.giphy.com" },
      { protocol: "https", hostname: "media.tenor.com" },
      { protocol: "https", hostname: "inputidea.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: baselineSecurityHeaders,
      },
      ...publicPageSources.map((source) => ({
        source,
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
        ],
      })),
    ];
  },
  async redirects() {
    return [
      {
        source: "/blog/dns-spf-dkim-dmarc-guide",
        destination:
          "/blog/spf-dkim-and-dmarc-for-google-workspace-a-practical-guide",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
