/**
 * All website copy lives in this file.
 * Edit the text here and every page updates.
 */

export const site = {
  name: "ENERDI",
  tagline: "Customised solutions for the energy sector",
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
  { label: "The Idea Factory", href: "/idea-factory" },
  { label: "Contact Us", href: "/contact" },
];

export const hero = {
  eyebrow: "Consulting and technology for the energy sector",
  title: "Customised solutions for specific energy problems.",
  intro:
    "Every need is different. ENERDI creates solutions that meet yours, from exploration to downstream operations and on to clean energy.",
  primaryCta: { label: "Tell us what you are working on", href: "/contact" },
  secondaryCta: { label: "See our products", href: "/products" },
};

export const focusAreas = [
  {
    title: "Multiphase Flow Assurance",
    text: "Keeping oil, gas and water moving reliably from the reservoir to the facility.",
  },
  {
    title: "Digital Twins",
    text: "Virtual models of assets that mirror how they behave in operation.",
  },
  {
    title: "Data-Driven Analysis",
    text: "Turning field and process data into decisions you can act on.",
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
 * NOTE: only the product names were supplied.
 * Replace each `text` with the real product description.
 */
export const products = [
  {
    name: "DOT",
    fullName: "Data Organising Technology",
    text: "Product details coming soon.",
  },
  {
    name: "Field Maxima",
    fullName: "",
    text: "Product details coming soon.",
  },
  {
    name: "Direct_O",
    fullName: "",
    text: "Product details coming soon.",
  },
];

export const services = [
  {
    title: "Consulting",
    text: "Technical consulting for the oil and gas industry, from exploration to downstream operations, and for clean energy work such as carbon capture and hydrogen generation and transport.",
  },
  {
    title: "Products",
    text: "Technology products that we design, build and tailor to the specific problem you need to solve.",
  },
  {
    title: "Knowledge Transfer",
    text: "Our specialists share what they know with your team, so the understanding of the design and its risks stays with you.",
  },
];

export const knowledgeHub = {
  title: "Knowledge Hub",
  lead: "Solutions for technical problems.",
  intro: "Explore solutions to all technical problems.",
  topics: [
    "Multiphase Flow Assurance",
    "Digital Twins",
    "Data-Driven Analysis",
    "Oil and Gas Operations",
    "Carbon Capture",
    "Hydrogen Generation and Transport",
  ],
  topicNote: "Articles coming soon",
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
};

export const contact = {
  title: "Contact Us",
  lead: "Tell us what you are working on.",
  paragraphs: [
    "Share your challenges and problems.",
    "We would love to explore new problems and work on solutions with you.",
  ],
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
