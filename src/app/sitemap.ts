import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://careeratlas-ten.vercel.app";

// Static PUBLIC routes only. The [industry], [industry]/[subindustry], [role], and
// [from]/[to] dynamic routes are intentionally excluded — their data comes from Prisma
// at request time, not a static source, so they aren't enumerated here (still reachable
// via on-page links).
const STATIC_ROUTES = [
  "",
  "/careers",
  "/roles",
  "/compare",
  "/salary",
  "/education",
  "/education/compare",
  "/projection",
  "/transitions",
  "/trends",
  "/methodology",
  "/data-sources",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
  }));
}
