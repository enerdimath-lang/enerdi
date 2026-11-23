/**
 * The starting text for the whole website.
 *
 * Once the admin panel (/admin) is connected to the database, anything saved
 * and published there replaces the matching section below. These values are
 * what the site shows before that, and whenever the database is unreachable.
 */

export const site = {
  name: "ENERDI",
  tagline: "Customised solutions for the energy sector",
  /** What the name stands for: ENER(gy) D(ata) I(ntelligence). */
  meaning: ["Energy", "Data", "Intelligence"],
  description:
    "ENERDI is a new-age consulting and technology team for the energy sector. We create customised solutions to solve specific problems.",
  copyright: "© 2026 ENERDI. All rights reserved.",
};

export const navigation = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Services", href: "/services" },
  { label: "Knowledge Hub", href: "/knowledge-hub" },
  { label: "Blog", href: "/blog" },
  { label: "The Idea Factory", href: "/idea-factory" },
  { label: "Contact Us", href: "/contact" },
];

/** The starting footer menu. Like the header menu, it is managed in the admin panel. */
export const footerNavigation = navigation;

/**
 * The blocks of the home page under the slideshow and introduction, in the
 * order they appear. The admin can reorder them and switch each one off.
 * The set itself is fixed: see `fixedLists` in `sections.ts`.
 */
export const home = {
  blocks: [
    { block: "about", show: true },
    { block: "products", show: true },
    { block: "services", show: true },
    { block: "knowledgeHubAndIdeaFactory", show: true },
  ],
  /** The heading above the focus areas ("What we work on"). */
  focusEyebrow: "What we work on",
  focusTitle: "What we help energy teams achieve",
  focusIntro:
    "Combining domain expertise, data intelligence and modern technology to solve operational challenges.",
  productsEyebrow: "Products",
  productsTitle: "Our products",
  servicesEyebrow: "Services",
  servicesTitle: "What we do",
};

export const hero = {
  eyebrow: "Consulting and technology for the energy sector",
  title: "Customised solutions for specific energy problems.",
  intro:
    "Every need is different. ENERDI creates solutions that meet yours, from exploration to downstream operations and on to clean energy.",
  primaryCta: { label: "Tell us what you are working on", href: "/contact" },
  secondaryCta: { label: "See our products", href: "/products" },
  /** The strip under the hero: what ENERDI does, in a few words each. */
  capabilities: [
    "Production Optimization",
    "Data Intelligence",
    "Digital Twins",
    "Technical Consulting",
    "Clean Energy",
    "Knowledge Transfer",
  ],
};

/**
 * The focus areas. On the home page each one is a card under "What we work
 * on"; choosing a card changes the panel beside it. `visual` picks the moving
 * picture in that panel (production, analytics or twin; anything else shows
 * the uploaded image), `tags` are the short outcomes on the card, and
 * `outcomes` are the three results under the picture. Outcomes are worded,
 * not numbered: put a figure in `value` only when it is a real, measured one.
 */
export const focusAreas = [
  {
    title: "Production Optimization",
    text: "Keeping production flowing and assets performing.",
    image: "/slides/production-assurance.svg",
    enabled: true,
    visual: "production",
    tags: ["Asset Reliability", "Efficiency Improvements", "Operational Visibility"],
    outcomes: [
      { value: "Less", label: "Unplanned downtime" },
      { value: "Higher", label: "Production efficiency" },
      { value: "Clearer", label: "View of every asset" },
    ],
  },
  {
    title: "Data Intelligence",
    text: "Connecting data, teams and decisions.",
    image: "/slides/data-driven-analysis.svg",
    enabled: true,
    visual: "analytics",
    tags: ["KPI Tracking", "Predictive Insights", "Reporting"],
    outcomes: [
      { value: "Faster", label: "Decision making" },
      { value: "One", label: "View of field and process data" },
      { value: "Earlier", label: "Warning of problems" },
    ],
  },
  {
    title: "Digital Twins",
    text: "Virtual environments for analysing operations.",
    image: "/slides/digital-twins.svg",
    enabled: true,
    visual: "twin",
    tags: ["Simulation", "Scenario Planning", "Optimization"],
    outcomes: [
      { value: "Safer", label: "Testing before changes are made" },
      { value: "Live", label: "Mirror of how assets behave" },
      { value: "Fewer", label: "Surprises in operation" },
    ],
  },
];

export const about = {
  title: "About Us",
  lead: "We create customised solutions to solve specific problems.",
  statement:
    "Every need is different, and we create solutions that meet your specific needs.",
  paragraphs: [
    "ENERDI is a new-age consulting business unit focused on the energy sector.",
    "We provide technical services to the oil and gas industry, from exploration through to downstream operations.",
    "Our services also cover clean energy, including carbon capture and hydrogen generation and transport.",
  ],
  /** Optional picture beside "Who we are". */
  image: "",
  /** Extra blocks the admin can add under the main text. */
  sections: [] as { title: string; text: string; image: string }[],
  businessUnits: [
    {
      title: "Technical Consulting",
      text: "Specialist consultants for the oil and gas industry and clean energy projects.",
    },
    {
      title: "Technology Products",
      text: "Software products built from the problems we meet in the field.",
    },
  ],
  model: {
    title: "How we work",
    paragraphs: [
      "India now has more engineers who specialise in industries such as oil and gas.",
      "What most improves effective and efficient project management is a proper understanding of the design, and of how to analyse its risks.",
      "Our consultants are specialists who can build that system with you.",
    ],
  },
};

/**
 * The starting products and services. They are copied into the database the
 * first time it is set up, and managed from the admin panel after that. These
 * are also what the site shows whenever the database is unreachable.
 */
export const products = [
  { name: "DOT", fullName: "Data Organising Technology", category: "", text: "Product details coming soon.", image: "" },
  { name: "Field Maxima", fullName: "", category: "", text: "Product details coming soon.", image: "" },
  { name: "Direct_O", fullName: "", category: "", text: "Product details coming soon.", image: "" },
];

export const productsPage = {
  eyebrow: "Products",
  title: "Our products",
  intro: "Technology products built from the problems we meet in the field.",
};

export const services = [
  {
    name: "Consulting",
    fullName: "",
    category: "",
    text: "Technical consulting for the oil and gas industry, from exploration to downstream operations, and for clean energy work such as carbon capture and hydrogen generation and transport.",
    image: "",
  },
  {
    name: "Products",
    fullName: "",
    category: "",
    text: "Technology products that we design, build and tailor to the specific problem you need to solve.",
    image: "",
  },
  {
    name: "Knowledge Transfer",
    fullName: "",
    category: "",
    text: "Our specialists share what they know with your team, so the understanding of the design and its risks stays with you.",
    image: "",
  },
];

export const servicesPage = {
  eyebrow: "Services",
  title: "Consulting, products and knowledge transfer.",
  intro: "Three ways we work with you on a specific problem.",
};

export const knowledgeHub = {
  title: "Knowledge Hub",
  lead: "Solutions for technical problems.",
  intro: "Explore solutions to all technical problems.",
  topics: [
    "Production Assurance and Optimization",
    "Multiphase Flow Assurance",
    "Digital Twins",
    "Data-Driven Analysis",
    "Oil and Gas Operations",
    "Carbon Capture",
    "Hydrogen Generation and Transport",
  ],
  topicNote: "Articles coming soon",
};

export const blog = {
  title: "Blog",
  lead: "News and notes from ENERDI.",
  intro: "What we are building, what we are learning and what we think is worth sharing.",
  emptyNote: "The first posts are on their way.",
  categories: ["Company news", "Engineering notes"],
};

export const ideaFactory = {
  title: "The Idea Factory",
  lead: "The ideas we are working on.",
  intro:
    "This is where we showcase what is on our workbench before it becomes a product.",
  ideas: [
    {
      name: "VoV",
      kind: "Meetings management application",
      image: "",
      status: "In the works",
      summary:
        "Meetings matter in every business, but unhelpful meetings waste valuable time and people. VoV is a web application that helps you plan, schedule and organise meetings.",
      points: [
        "Improve the quality of the time spent in meetings.",
        "Make sure no important point or decision is missed.",
        "Share the discussion points in a structured meeting plan, so attendees know them well before the meeting.",
        "Apply a different plan structure for each type of meeting.",
      ],
    },
  ],
  /** The button under the ideas. Leave the label empty to hide it. */
  cta: { label: "Talk to us about an idea", href: "/contact" },
};

export const contact = {
  title: "Contact Us",
  lead: "Tell us what you are working on.",
  paragraphs: [
    "Share your challenges and problems.",
    "We would love to explore new problems and work on solutions with you.",
  ],
};

export const footer = {
  description:
    "ENERDI is a new-age consulting and technology team for the energy sector. We create customised solutions to solve specific problems.",
  showNavigation: true,
  showContactDetails: true,
  email: "",
  phone: "",
  address: "",
  showSocialLinks: true,
  socialLinks: [] as { label: string; href: string }[],
  copyright: "© 2026 ENERDI. All rights reserved.",
};

/**
 * Wording for the two emails the contact form sends:
 * one to ENERDI with the enquiry, one back to the person who wrote in.
 * "{name}" is replaced with their name.
 */
export const contactEmails = {
  /** Sent to the ENERDI inbox. */
  admin: {
    subject: "New website enquiry from {name}",
    preheader: "{name} filled in the contact form.",
    eyebrow: "New website enquiry",
    heading: "{name} has sent you a message.",
    intro:
      "Someone filled in the contact form on the ENERDI website. Replying to this email goes straight back to them.",
    detailsLabel: "Their details",
    messageLabel: "What they are working on",
    action: "Reply to {name}",
    footerNote:
      "You receive this because you are the contact for the ENERDI website form.",
  },

  /** The confirmation sent back to the visitor. */
  visitor: {
    subject: "Thank you for contacting ENERDI",
    preheader: "We have your message and will get back to you soon.",
    eyebrow: "We have your message",
    heading: "Thank you, {name}.",
    paragraphs: [
      "We have your message and will get back to you soon.",
      "Every need is different, and we would love to explore your problem and work on a solution with you.",
    ],
    recapLabel: "What you sent us",
    focusLabel: "What we work on",
    action: "Read more about ENERDI",
    footerNote:
      "You received this because you contacted ENERDI through our website. No reply is needed.",
  },
};
