import {
  about,
  blog,
  contact,
  focusAreas,
  footer,
  hero,
  home,
  ideaFactory,
  knowledgeHub,
  productsPage,
  servicesPage,
  site,
} from "./site";

/**
 * Every block of page text the admin can edit, with its starting value.
 * The shape of each default is also the shape the admin form is built from,
 * and the shape saved content is forced back into before it is stored.
 *
 * Products, services, articles, blog posts and the menus are not here: they
 * are records with their own tables and their own admin screens.
 */
export const defaults = {
  site,
  hero,
  slides: focusAreas,
  home,
  about,
  productsPage,
  servicesPage,
  knowledgeHub,
  blog,
  ideaFactory,
  contact,
  footer,
};

export type SiteContent = typeof defaults;
export type SectionKey = keyof SiteContent;

export const sections: Record<SectionKey, { label: string; note: string }> = {
  slides: {
    label: "Focus areas (What we work on)",
    note: "The capability cards on the home page and the panel beside them. Each card has a title, one line of text, short outcomes, the picture its panel shows and three results under that picture. Untick Enabled to hide a card without deleting it.",
  },
  hero: {
    label: "Hero: headline, buttons and capability strip",
    note: "The top of the home page: the small line above the headline, the headline, the introduction, the two buttons, and the strip of capabilities underneath.",
  },
  home: {
    label: "Home page blocks",
    note: "Put the blocks of the home page in the order you want, switch any of them off, and change the headings above the focus areas, products and services.",
  },
  site: {
    label: "Website settings",
    note: "The site name, what ENERDI stands for (shown in the panel beside the home page headline and in the footer), and the description search engines show.",
  },
  about: { label: "About page", note: "Also feeds the About block on the home page." },
  productsPage: {
    label: "Products page heading",
    note: "The products themselves are under Products Management.",
  },
  servicesPage: {
    label: "Services page heading",
    note: "The services themselves are under Services Management.",
  },
  knowledgeHub: {
    label: "Knowledge Hub page",
    note: "Heading text and the list of topics. Articles are under Articles Management.",
  },
  blog: {
    label: "Blog page",
    note: "Heading text and the list of categories. Posts are under Blog Management.",
  },
  ideaFactory: { label: "The Idea Factory page", note: "The ideas on the workbench and the button under them." },
  contact: { label: "Contact page", note: "The text beside the contact form." },
  footer: {
    label: "Footer",
    note: "Description, contact details, social links and the copyright line. The footer menu is under Navigation Management.",
  },
};

/** The entries of "Website Content" in the admin sidebar: one screen per public page. */
export const contentPages: {
  slug: string;
  label: string;
  path: string;
  sections: SectionKey[];
}[] = [
  { slug: "home", label: "Home", path: "/", sections: ["slides", "hero", "home"] },
  { slug: "about", label: "About", path: "/about", sections: ["about"] },
  { slug: "products", label: "Products", path: "/products", sections: ["productsPage"] },
  { slug: "services", label: "Services", path: "/services", sections: ["servicesPage"] },
  { slug: "knowledge-hub", label: "Knowledge Hub", path: "/knowledge-hub", sections: ["knowledgeHub"] },
  { slug: "blog", label: "Blogs", path: "/blog", sections: ["blog"] },
  { slug: "idea-factory", label: "Idea Factory", path: "/idea-factory", sections: ["ideaFactory"] },
  { slug: "contact", label: "Contact", path: "/contact", sections: ["contact"] },
  { slug: "footer", label: "Footer", path: "/", sections: ["footer"] },
];

export function isSectionKey(value: string): value is SectionKey {
  return Object.hasOwn(sections, value);
}

/**
 * The shape of one row in lists that start out empty, where the default has
 * no first row to copy the shape from. Keyed by "section.field".
 */
export const listShapes: Record<string, unknown> = {
  "about.sections": { title: "", text: "", image: "" },
  "slides.tags": "",
  "slides.outcomes": { value: "", label: "" },
  "footer.socialLinks": { label: "", href: "" },
};

/**
 * Lists whose rows are fixed: the admin can reorder them and change their
 * switches, but not add, remove or rename rows. Keyed by "section.field";
 * `id` names the field that identifies a row, `labels` what the admin sees.
 */
export const fixedLists: Record<string, { id: string; labels: Record<string, string> }> = {
  "home.blocks": {
    id: "block",
    labels: {
      about: "About",
      products: "Products",
      services: "Services",
      knowledgeHubAndIdeaFactory: "Knowledge Hub and The Idea Factory",
    },
  },
};

/**
 * Fields the admin picks from a short list instead of typing. Keyed by
 * "section.field"; a saved value that is not in the list counts as the last
 * option.
 */
export const choices: Record<string, { value: string; label: string }[]> = {
  "slides.visual": [
    { value: "production", label: "Production dashboard (indicators and a trend line)" },
    { value: "analytics", label: "Analytics dashboard (data streams and KPI bars)" },
    { value: "twin", label: "Digital twin (an asset and its virtual copy)" },
    { value: "picture", label: "The image chosen above" },
  ],
};

const MAX_TEXT = 4000;
const MAX_ITEMS = 40;

/**
 * Forces a saved value into the shape of its default: unknown fields are
 * dropped, missing ones are filled in, text stays text and switches stay
 * switches. Whatever the admin form (or anyone else) sends, the pages always
 * receive something they can render.
 */
export function conform<T>(
  template: T,
  value: unknown,
  path: string,
  insideList = false,
): T {
  if (typeof template === "string") {
    if (typeof value === "string") return value.slice(0, MAX_TEXT) as T;
    return (insideList ? "" : template) as T;
  }

  if (typeof template === "boolean") {
    if (typeof value === "boolean") return value as T;
    // A switch added after content was saved defaults to "on".
    return (insideList ? true : template) as T;
  }

  if (Array.isArray(template)) {
    if (!Array.isArray(value)) return (insideList ? [] : template) as T;

    const fixed = fixedLists[path];
    if (fixed) {
      // Keep the saved order and switches, but exactly the rows of the
      // default: no extras, no duplicates, none missing.
      const rows = template as Record<string, unknown>[];
      const saved = value.filter(
        (item): item is Record<string, unknown> => Boolean(item) && typeof item === "object",
      );
      const ordered = [
        ...saved.map((item) => item[fixed.id]),
        ...rows.map((row) => row[fixed.id]),
      ].filter((id, index, all) => all.indexOf(id) === index);
      return ordered.flatMap((id) => {
        const row = rows.find((item) => item[fixed.id] === id);
        if (!row) return [];
        const given = saved.find((item) => item[fixed.id] === id);
        return [{ ...conform(row, given, path, true), [fixed.id]: id }];
      }) as T;
    }

    const shape = listShapes[path] ?? template[0] ?? "";
    return value
      .slice(0, MAX_ITEMS)
      .map((item) => conform(shape, item, path, true)) as T;
  }

  if (template && typeof template === "object") {
    const source =
      value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
    const result: Record<string, unknown> = {};
    for (const [key, part] of Object.entries(template)) {
      result[key] = conform(part, source[key], `${path}.${key}`, insideList);
    }
    return result as T;
  }

  return template;
}

/** Forces a whole section into shape. */
export function conformSection<K extends SectionKey>(key: K, value: unknown) {
  return conform(defaults[key], value, key);
}

/** An empty copy of a list row, for the "Add" buttons in the admin form. */
export function blank<T>(shape: T, path: string): T {
  return conform(shape, undefined, path, true);
}
