/**
 * Post-build prerender for the SPA.
 *
 * Why this exists
 * ---------------
 * The site is a client-rendered React app. react-helmet-async sets the title,
 * meta description and JSON-LD *after* JavaScript runs. Googlebot can execute
 * JS, but it does so on a second pass that can lag by days, and most other
 * crawlers (Bing, Facebook, WhatsApp, X/Twitter, LinkedIn, and the AI crawlers)
 * do NOT run JS at all. Before this script, every room URL served the exact
 * same index.html with the title "Margies" and one generic description, so:
 *   - rooms could not rank for their own names/queries,
 *   - duplicate titles/descriptions across URLs looked like duplicate content,
 *   - WhatsApp/Facebook link previews all showed the same text.
 *
 * What it does
 * ------------
 * After `vite build`, it copies dist/index.html once per route, and injects
 * into each copy:
 *   - a unique <title>, meta description and canonical,
 *   - Open Graph / Twitter tags with the right image,
 *   - JSON-LD (HotelRoom + BreadcrumbList + LodgingBusiness),
 *   - a real, readable HTML snapshot of the page content inside #root.
 *
 * React then hydrates over the top, so users see no difference, while crawlers
 * get full HTML on the very first request with no JavaScript.
 *
 * Run automatically via the "postbuild" script in package.json.
 */
const fs = require("fs");
const path = require("path");

const SITE_URL = "https://www.margies.com.ng";
const DIST = path.join(__dirname, "..", "dist");

// ---- read room data without needing a bundler -------------------------------
const roomsSource = fs.readFileSync(
  path.join(__dirname, "..", "src", "data", "rooms.js"),
  "utf8"
);

function parseRooms(src) {
  const blocks = src.split(/\n  \{\n/).slice(1);
  return blocks
    .map((block) => {
      const get = (key, quoted = true) => {
        const re = quoted
          ? new RegExp(`${key}:\\s*"([^"]*)"`)
          : new RegExp(`${key}:\\s*([0-9]+)`);
        const m = block.match(re);
        return m ? (quoted ? m[1] : Number(m[1])) : undefined;
      };
      const descMatch = block.match(/description:\s*\n?\s*"([\s\S]*?)"/);
      const perksMatch = block.match(/perks:\s*\[([^\]]*)\]/);
      const galleryMatch = block.match(/gallery:\s*\[([^\]]*)\]/);
      const list = (m) =>
        m ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : [];
      return {
        slug: get("slug"),
        id: get("id"),
        name: get("name"),
        ogImage: get("ogImage"),
        seoTagline: get("seoTagline"),
        maxGuests: get("maxGuests", false) || 2,
        price: get("price", false) || 0,
        perks: list(perksMatch),
        gallery: list(galleryMatch),
        description: descMatch ? descMatch[1].replace(/\s+/g, " ").trim() : "",
      };
    })
    .filter((r) => r.slug && r.name);
}

const rooms = parseRooms(roomsSource);

const naira = (n) => `\u20a6${Number(n || 0).toLocaleString("en-NG")}`;
const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function lodgingBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": `${SITE_URL}/#lodging`,
    name: "Margie's",
    image: `${SITE_URL}/margies-logo.jpg`,
    url: SITE_URL,
    telephone: "+2348035350455",
    priceRange: "\u20a6\u20a6",
    currenciesAccepted: "NGN",
    checkinTime: "14:00",
    checkoutTime: "12:00",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Gbagada",
      addressRegion: "Lagos",
      addressCountry: "NG",
    },
  };
}

function roomSchema(room, url) {
  return {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: room.name,
    description: room.description,
    url,
    image: `${SITE_URL}${room.ogImage}`,
    amenityFeature: room.perks.map((p) => ({
      "@type": "LocationFeatureSpecification",
      name: p,
    })),
    occupancy: { "@type": "QuantitativeValue", minValue: 1, maxValue: room.maxGuests },
    containedInPlace: { "@type": "LodgingBusiness", name: "Margie's", "@id": `${SITE_URL}/#lodging` },
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: room.price,
      availability: "https://schema.org/InStock",
      url,
    },
  };
}

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

// ---- the routes we prerender ------------------------------------------------
const routes = [
  {
    path: "/",
    title: "Margie's | Short-Stay Apartment & Rooms in Gbagada, Lagos",
    description:
      "Book a clean, comfortable room or serviced apartment at Margie's in Gbagada, Lagos. Instant online booking, secure payment, no phone calls needed.",
    image: "/margies-logo.jpg",
    schema: [lodgingBusinessSchema()],
    body: `
      <h1>Margie's - Short-Stay Apartment &amp; Rooms in Gbagada, Lagos</h1>
      <p>Margie's offers comfortable short-stay rooms and a serviced apartment in Gbagada, Lagos,
      with instant online booking and secure card payment.</p>
      <h2>Our rooms</h2>
      <ul>
        ${rooms
          .map(
            (r) =>
              `<li><a href="/rooms/${r.slug}">${esc(r.name)}</a> - ${esc(
                r.seoTagline || ""
              )}, from ${naira(r.price)} per night.</li>`
          )
          .join("\n        ")}
      </ul>
      <p><a href="/check">Check availability and book</a> | <a href="/gallery">Gallery</a> |
      <a href="/blog">Guides &amp; Stories</a> | <a href="/contact">Contact us</a></p>`,
  },
  {
    path: "/check",
    title: "Check Availability & Book a Room | Margie's, Gbagada Lagos",
    description:
      "Check live room availability at Margie's in Gbagada, Lagos, choose your dates and number of guests, and pay securely online.",
    image: "/margies-logo.jpg",
    schema: [lodgingBusinessSchema()],
    body: `
      <h1>Check Room Availability at Margie's</h1>
      <p>Select your room, check-in and check-out dates and the number of people lodging, then pay
      securely with Paystack. Confirmation is instant.</p>`,
  },
  {
    path: "/gallery",
    title: "Photo Gallery | Margie's, Gbagada Lagos",
    description:
      "See photos of every room and the serviced apartment at Margie's in Gbagada, Lagos before you book.",
    image: "/margies-logo.jpg",
    schema: [lodgingBusinessSchema()],
    body: `<h1>Photo Gallery</h1><p>Photos of the rooms and apartment at Margie's, Gbagada, Lagos.</p>`,
  },
  {
    path: "/contact",
    title: "Contact Margie's | Gbagada, Lagos",
    description:
      "Contact Margie's in Gbagada, Lagos for booking questions, group stays, long stays or anything else.",
    image: "/margies-logo.jpg",
    schema: [lodgingBusinessSchema()],
    body: `<h1>Contact Us</h1><p>Questions about a booking, a group stay or a longer stay? Send us a
      message and we'll get back to you.</p>`,
  },
  {
    path: "/blog",
    title: "Guides & Stories | Margie's, Gbagada Lagos",
    description:
      "Local guides, travel tips and stories from Margie's in Gbagada, Lagos - what to see, eat and do nearby.",
    image: "/margies-logo.jpg",
    schema: [],
    body: `<h1>Guides &amp; Stories</h1><p>Local guides and tips for visitors staying in Gbagada and
      around Lagos.</p>`,
  },
  {
    path: "/support",
    title: "Buy the Owner a Coffee | Margie's",
    description: "Enjoyed Margie's? Say thank you with a small tip to the owner.",
    image: "/margies-logo.jpg",
    schema: [],
    body: `<h1>Buy the owner a coffee</h1><p>A small thank-you goes a long way.</p>`,
  },
  ...rooms.map((room) => {
    const url = `${SITE_URL}/rooms/${room.slug}`;
    return {
      path: `/rooms/${room.slug}`,
      title: `${room.name} - ${room.seoTagline || "Gbagada, Lagos"} | Margie's`,
      description: `${room.description} Sleeps up to ${room.maxGuests}. From ${naira(
        room.price
      )} per night at Margie's, Gbagada, Lagos. Book online instantly.`,
      image: room.ogImage,
      schema: [
        roomSchema(room, url),
        lodgingBusinessSchema(),
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Rooms", path: "/#rooms" },
          { name: room.name, path: `/rooms/${room.slug}` },
        ]),
      ],
      body: `
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>${esc(room.name)}</span></nav>
      <h1>${esc(room.name)} - ${esc(room.seoTagline || "")}</h1>
      <p><strong>${naira(room.price)} per night</strong> - sleeps up to ${room.maxGuests} guests.</p>
      <p>${esc(room.description)}</p>
      <h2>What's included</h2>
      <ul>${room.perks.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
      <h2>Photos of ${esc(room.name)}</h2>
      ${room.gallery
        .map(
          (g, i) =>
            `<img src="/gallery/${g}" alt="${esc(room.name)} at Margie's Gbagada - photo ${i + 1}" width="600" height="400" loading="lazy" />`
        )
        .join("")}
      <p><a href="/check">Check availability and book ${esc(room.name)}</a></p>
      <h2>Other rooms at Margie's</h2>
      <ul>${rooms
        .filter((r) => r.slug !== room.slug)
        .map((r) => `<li><a href="/rooms/${r.slug}">${esc(r.name)}</a></li>`)
        .join("")}</ul>`,
    };
  }),
];

// ---- do the work ------------------------------------------------------------
function buildHtml(template, route) {
  const url = `${SITE_URL}${route.path === "/" ? "/" : route.path}`;
  const image = `${SITE_URL}${route.image}`;

  const head = `
    <title>${esc(route.title)}</title>
    <meta name="description" content="${esc(route.description)}" />
    <link rel="canonical" href="${url}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta property="og:site_name" content="Margie's" />
    <meta property="og:locale" content="en_NG" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(route.title)}" />
    <meta property="og:description" content="${esc(route.description)}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${url}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(route.title)}" />
    <meta name="twitter:description" content="${esc(route.description)}" />
    <meta name="twitter:image" content="${image}" />
${(route.schema || [])
  .map((s) => `    <script type="application/ld+json">${JSON.stringify(s)}</script>`)
  .join("\n")}
  `;

  let html = template;

  // Remove the build's generic tags so we don't ship two titles/descriptions.
  html = html.replace(/<title>[\s\S]*?<\/title>/i, "");
  html = html.replace(/<meta\s+name="description"[^>]*>/gi, "");
  html = html.replace(/<link\s+rel="canonical"[^>]*>/gi, "");
  html = html.replace(/<meta\s+name="robots"[^>]*>/gi, "");
  html = html.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, "");
  html = html.replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, "");

  html = html.replace("</head>", `${head}\n  </head>`);
  html = html.replace(
    /<div id="root"><\/div>/,
    `<div id="root"><div data-prerendered="true">${route.body}</div></div>`
  );

  return html;
}

function main() {
  const indexPath = path.join(DIST, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.error("[prerender] dist/index.html not found - run `vite build` first.");
    process.exit(1);
  }
  const template = fs.readFileSync(indexPath, "utf8");

  for (const route of routes) {
    const html = buildHtml(template, route);
    const outDir = route.path === "/" ? DIST : path.join(DIST, route.path);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), html);
    console.log(`[prerender] ${route.path} -> ${path.relative(DIST, path.join(outDir, "index.html"))}`);
  }

  console.log(`[prerender] Wrote ${routes.length} prerendered pages.`);
}

main();
