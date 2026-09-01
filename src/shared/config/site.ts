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

/**
 * One cancellation rule for every activity, rather than a policy typed per activity in
 * the CMS. Weather cancels boat trips and sunrise treks routinely in Bali, and the
 * guest has already paid by then — so what happens next has to be the same promise
 * every time, and it has to be stated at the point of payment.
 *
 * Change the wording here and it changes on the checkout page, nowhere else to update.
 * `cancellationPolicy` on an activity is still shown on its detail page for anything
 * operational ("bring a warm layer, the trail closes in heavy rain"); this is the
 * money rule.
 */
export const activityCancellationPolicy = {
  headline: "If we cancel, you choose a full refund or a free reschedule.",
  guestCancels:
    "Cancel more than 48 hours before and you get a full refund. Inside 48 hours we cannot refund, because the driver, guide and seats are already committed.",
  weather:
    "If weather or the supplier cancels, which happens with boat trips and sunrise treks, that is on us, whatever the notice.",
} as const;

export const whatsappHref = `https://api.whatsapp.com/send?phone=${site.whatsapp}`;

/** Property types the API returns, in the order they appear in the nav dropdown. */
export const propertyTypes = [
  { label: "Villas", value: "villas", href: "/properties?type=villas" },
  { label: "Resorts", value: "resorts", href: "/properties?type=resorts" },
  { label: "Hotels", value: "hotels", href: "/properties?type=hotels" },
  { label: "Bamboo Houses", value: "bamboo_house", href: "/properties?type=bamboo_house" },
] as const;

/**
 * Activity categories, in nav order. `TopNav` is handed the subset that actually has
 * published activities behind it — a menu offering "Wellness" that lands on an empty
 * list is worse than the plain link it replaced.
 */
export const activityCategories = [
  { label: "Tours", value: "tour", href: "/activities?category=tour" },
  { label: "Transfers", value: "transfer", href: "/activities?category=transfer" },
  { label: "On the water", value: "water", href: "/activities?category=water" },
  { label: "Culture", value: "culture", href: "/activities?category=culture" },
  { label: "Adventure", value: "adventure", href: "/activities?category=adventure" },
  { label: "Wellness", value: "wellness", href: "/activities?category=wellness" },
  { label: "Classes", value: "class", href: "/activities?category=class" },
] as const;

export type NavMenuItem = { label: string; value: string; href: string };

export type NavItem = {
  label: string;
  href: string;
  /** Present when this item opens a dropdown. Absent means a plain link. */
  menu?: readonly NavMenuItem[];
};

/**
 * The dropdown lives in the data, not in the component. Before this, `TopNav` special
 * cased item zero and rendered `primaryNav.slice(1)` as links, and `MobileMenu`
 * hardcoded the same case again — three places that had to agree about which items
 * have menus. Adding a `menu` key collapses all of it into one map.
 */
export const primaryNav: readonly NavItem[] = [
  { label: "Villas", href: "/properties", menu: propertyTypes },
  { label: "Activities", href: "/activities", menu: activityCategories },
  { label: "Events", href: "/events" },
  { label: "About Us", href: "/about-us/who-are-we" },
  { label: "Contact", href: "/about-us/contact-us" },
];

/**
 * About-us hrefs use the legacy slugs verbatim (`who-are-we`, `terms-condition`, `24-7-support`).
 * They read a little oddly, and that is the point: these URLs are live on localbalivillas.com
 * today and §8 preserves them exactly rather than resetting their search authority.
 */
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
