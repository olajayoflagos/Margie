import { Helmet } from "react-helmet-async";

const SITE_URL = "https://www.margies.com.ng";
const SITE_NAME = "Margie's";
const DEFAULT_IMAGE = `${SITE_URL}/margies-logo.jpg`;

/** Search engines and social crawlers need absolute image URLs. Vite asset
 *  imports give us "/assets/x-hash.jpg", so prefix anything relative. */
export function absoluteUrl(maybeRelative) {
  if (!maybeRelative) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(maybeRelative)) return maybeRelative;
  return `${SITE_URL}${maybeRelative.startsWith("/") ? "" : "/"}${maybeRelative}`;
}

/**
 * Per-page <title>/meta/OG tags + optional JSON-LD schema blocks.
 * Every route should render one of these with its own title/description.
 *
 * `schema` accepts one schema.org object or an array of them.
 * `noindex`  keeps private pages (login, signup, bookings) out of search.
 */
export default function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  schema,
  noindex = false,
  type = "website",
  publishedTime,
  modifiedTime,
}) {
  const url = `${SITE_URL}${path}`;
  const imageUrl = absoluteUrl(image);
  const schemas = Array.isArray(schema) ? schema : schema ? [schema] : [];

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en-NG" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"}
      />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_NG" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}

export { SITE_URL, SITE_NAME, DEFAULT_IMAGE };
