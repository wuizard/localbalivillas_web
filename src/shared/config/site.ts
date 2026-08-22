export const site = {
  name: "Local Bali Villas",
  shortName: "LBV",
  tagline: "Handpicked luxury villas, unforgettable activities, and memorable events in Bali.",
  whatsapp: "6282340243600",
  phoneDisplay: "+62 823 4024 3600",
  email: "info@localbalivillas.com",
  address: "Jl. Cok Agung Tresna, Komp Griya Alamanda",
  website: "www.localbalivillas.com",
  social: {
    instagram: "https://www.instagram.com/localbalivillas/",
    facebook: "https://www.facebook.com/localbalivillas/",
    tiktok: "https://www.tiktok.com/@localbalivillas",
  },
} as const;

export const whatsappHref = `https://api.whatsapp.com/send?phone=${site.whatsapp}`;

/**
 * About-us hrefs use the legacy slugs verbatim (`who-are-we`, `terms-condition`, `24-7-support`).
 * They read a little oddly, and that is the point: these URLs are live on localbalivillas.com
 * today and §8 preserves them exactly rather than resetting their search authority.
 */
export const primaryNav = [
  { label: "Villas", href: "/properties" },
  { label: "Activities", href: "/activities" },
  { label: "Events", href: "/events" },
  { label: "About Us", href: "/about-us/who-are-we" },
  { label: "Contact", href: "/about-us/contact-us" },
] as const;

/** Property types the API returns, in the order they appear in the nav dropdown. */
export const propertyTypes = [
  { label: "Villas", value: "villas", href: "/properties?type=villas" },
  { label: "Resorts", value: "resorts", href: "/properties?type=resorts" },
  { label: "Hotels", value: "hotels", href: "/properties?type=hotels" },
  { label: "Bamboo Houses", value: "bamboo_house", href: "/properties?type=bamboo_house" },
] as const;

export const footerNav = {
  quickLinks: [
    { label: "Villas", href: "/properties" },
    { label: "Activities", href: "/activities" },
    { label: "Events", href: "/events" },
    { label: "About Us", href: "/about-us/who-are-we" },
    { label: "Contact", href: "/about-us/contact-us" },
  ],
  help: [
    { label: "FAQ", href: "/about-us/faq" },
    { label: "Terms & Conditions", href: "/about-us/terms-condition" },
    { label: "Privacy Policy", href: "/about-us/privacy-policy" },
    { label: "24/7 Support", href: "/about-us/24-7-support" },
  ],
} as const;

/**
 * The footer is desktop-only. On mobile the site behaves like an app, so everything the
 * footer carries lives on /profile instead — reachable from the bottom navigation.
 */
export const profileMenu = [
  {
    title: "Browse",
    links: [
      { label: "All villas", href: "/properties" },
      { label: "Activities", href: "/activities" },
      { label: "Events", href: "/events" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    title: "About us",
    links: [
      { label: "Who are we", href: "/about-us/who-are-we" },
      { label: "Why book with us", href: "/about-us/why-book-with-us" },
      { label: "Best price guarantee", href: "/about-us/best-price-guarantee" },
      { label: "24/7 support", href: "/about-us/24-7-support" },
      { label: "Contact us", href: "/about-us/contact-us" },
      { label: "FAQ", href: "/about-us/faq" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Terms & Conditions", href: "/about-us/terms-condition" },
      { label: "Booking terms", href: "/about-us/terms-condition-order" },
      { label: "Privacy Policy", href: "/about-us/privacy-policy" },
      { label: "Client protection", href: "/about-us/client-protection" },
      { label: "Compliance & standards", href: "/about-us/compliance-standard" },
      { label: "Legal information", href: "/about-us/legal-information" },
    ],
  },
] as const;
