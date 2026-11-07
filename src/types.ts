// ============================================================
//  Shared types for the site configuration.
//  Edit the data in `site.config.ts` and `data/projects.ts`;
//  these types make the editor autocomplete and flag mistakes.
// ============================================================

/** Icons available in `components/Icon.astro`. Add a path there before adding a name here. */
export const ICON_NAMES = ['github', 'linkedin', 'mail', 'rss', 'arrow'] as const;
export type IconName = (typeof ICON_NAMES)[number];

/** A link shown in the "Na web" section of the home page. */
export interface SocialLink {
  /** Visible text, e.g. "@davivers" or "LinkedIn". */
  label: string;
  /** Full URL (`https://…` or `mailto:…`). Leave it empty ('') to hide the link. */
  url: string;
  icon: IconName;
}

/** One line of the "Trajetória" (career timeline) section. */
export interface TimelineEntry {
  /** Year shown in bold, e.g. "2024". A string so ranges like "2022–2023" also work. */
  year: string;
  text: string;
}

/** An item of the top navigation bar. */
export interface NavItem {
  /** Path starting and ending with "/", e.g. "/blog/". `withBase()` is applied automatically. */
  href: `/${string}`;
  label: string;
}

/** Everything that appears on the home page and in the site metadata. */
export interface SiteConfig {
  /** Full name. The first two initials are used when there's no `public/avatar.jpg`. */
  name: string;
  /** Subtitle under the name. */
  role: string;
  location: string;
  /** Text in the rounded box above the name. */
  greeting: string;
  /** Default `<meta name="description">` and RSS description. */
  description: string;
  /** Paragraphs of the "Trabalho" section. */
  work: string[];
  /** Career entries, oldest first. */
  timeline: TimelineEntry[];
  /** Short items joined with commas in the "Eu ♥" section. */
  loves: string[];
  links: SocialLink[];
  /** URL of the "Código" link in the navbar (the site's repository). */
  sourceUrl: string;
}

/** A card on the "Projetos" page. */
export interface Project {
  title: string;
  summary: string;
  tags: string[];
  /** Where the card points to. Without it the card isn't clickable. */
  url?: string;
  /** Cover image path inside `public/`, e.g. "/img/vitrix.png". Replaces the generated cover. */
  image?: string;
  /** Hue (0–360) of the generated gradient cover. */
  hue: number;
  /** One or two characters drawn on the generated cover, e.g. "{ }". */
  glyph: string;
}
