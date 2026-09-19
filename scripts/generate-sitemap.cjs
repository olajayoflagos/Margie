/**
 * Generates public/sitemap.xml at build time.
 * Static routes + rooms are always included. Published blog articles are
 * included too IF a Firebase service account is available at the path in
 * GOOGLE_APPLICATION_CREDENTIALS (set this in your CI/build environment) -
 * otherwise the script just skips that part and logs a note, so local
 * `npm run build` still works without extra setup.
 *
 * Wired into `npm run build` via package.json's "prebuild" script.
 */
const fs = require("fs");
const path = require("path");

const SITE_URL = "https://www.margies.com.ng";

const roomsPath = path.join(__dirname, "..", "src", "data", "rooms.js");
// Cheap slug extraction without needing a bundler/transpiler for this script.
const roomsSource = fs.readFileSync(roomsPath, "utf8");
const slugMatches = [...roomsSource.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);

const staticRoutes = ["/", "/gallery", "/contact", "/check", "/blog", "/support"];
const roomRoutes = slugMatches.map((slug) => `/rooms/${slug}`);

async function getArticleRoutes() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log("[sitemap] GOOGLE_APPLICATION_CREDENTIALS not set - skipping article URLs.");
    return [];
  }
  try {
    const admin = require("firebase-admin");
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
    const db = admin.firestore();
    const snap = await db.collection("articles").where("status", "==", "published").get();
    return snap.docs.map((d) => `/blog/${d.data().slug}`);
  } catch (err) {
    console.warn("[sitemap] Could not fetch articles for sitemap:", err.message);
    return [];
  }
}

async function main() {
  const articleRoutes = await getArticleRoutes();
  const allRoutes = [...staticRoutes, ...roomRoutes, ...articleRoutes];

  const today = new Date().toISOString().slice(0, 10);
  const priorityFor = (route) => {
    if (route === "/") return "1.0";
    if (route.startsWith("/rooms/")) return "0.9";
    if (route === "/check") return "0.8";
    return "0.6";
  };
  const changefreqFor = (route) =>
    route === "/" || route.startsWith("/rooms/") ? "weekly" : "monthly";

  const urlEntries = allRoutes
    .map(
      (route) => `  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreqFor(route)}</changefreq>
    <priority>${priorityFor(route)}</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

  const outPath = path.join(__dirname, "..", "public", "sitemap.xml");
  fs.writeFileSync(outPath, xml);
  console.log(`[sitemap] Wrote ${allRoutes.length} URLs to ${outPath}`);
}

main();
