import { SITE_URL, DEFAULT_IMAGE, absoluteUrl } from "./Seo";

export function lodgingBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Margie's",
    image: DEFAULT_IMAGE,
    url: SITE_URL,
    telephone: "+2348035350455",
    priceRange: "₦₦",
    "@id": `${SITE_URL}/#lodging`,
    description:
      "Margie's is a comfortable short-stay apartment and rooms in Gbagada, Lagos - book online in minutes.",
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

export function hotelRoomSchema(room, path) {
  return {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: room.name,
    description: room.description,
    url: `${SITE_URL}${path}`,
    image: absoluteUrl(room.ogImage || room.img),
    amenityFeature: room.perks.map((p) => ({
      "@type": "LocationFeatureSpecification",
      name: p,
    })),
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: room.price,
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}${path}`,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: room.price,
        priceCurrency: "NGN",
        unitCode: "DAY",
      },
    },
    occupancy: {
      "@type": "QuantitativeValue",
      minValue: 1,
      maxValue: room.maxGuests || 4,
    },
    containedInPlace: {
      "@type": "LodgingBusiness",
      name: "Margie's",
      "@id": `${SITE_URL}/#lodging`,
    },
  };
}

export function breadcrumbSchema(items) {
  // items: [{ name, path }]
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

export function articleSchema(article, path) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt || "",
    image: [absoluteUrl(article.coverImage) || DEFAULT_IMAGE],
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.publishedAt || article.createdAt,
    author: { "@type": "Organization", name: "Margie's" },
    publisher: { "@type": "Organization", name: "Margie's", logo: { "@type": "ImageObject", url: DEFAULT_IMAGE } },
    mainEntityOfPage: `${SITE_URL}${path}`,
  };
}

export function faqSchema(faqs) {
  // faqs: [{ question, answer }]
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Margie's",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
