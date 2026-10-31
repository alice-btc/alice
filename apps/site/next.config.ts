import type { NextConfig } from 'next';

// Static website for alicebtc.com. Exported as flat HTML so it can be
// hosted anywhere (Vercel/Cloudflare Pages) with no server runtime. It imports
// no workspace package, so it builds on its own, apart from apps/app-web.
const nextConfig: NextConfig = {
  output: 'export',
  // Nested `foo/index.html` exports resolve cleanly on static hosts and keep
  // canonical URLs trailing-slashed, matching apps/app-web.
  trailingSlash: true,
  // `next/image` optimization needs a server; static export has none.
  images: { unoptimized: true },
  // English and each other language are separate root layouts (app/(en) and
  // app/[locale]), so the 404 page needs its own document:
  // app/global-not-found.tsx.
  experimental: { globalNotFound: true },
};

export default nextConfig;
