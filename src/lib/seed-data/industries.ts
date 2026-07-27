export type IndustryCategory =
  | "technology"
  | "finance"
  | "professional-services"
  | "healthcare-science"
  | "public-education"
  | "industrial-energy"
  | "consumer-retail"
  | "creative-media"
  | "trades-services";

export interface IndustrySeed {
  slug: string;
  name: string;
  description: string;
  icon: string; // lucide-react icon name
  category: IndustryCategory;
  /** true = hand-curated deep taxonomy lives in featured-taxonomy.ts */
  featured?: boolean;
}

const mk = (
  name: string,
  description: string,
  icon: string,
  category: IndustryCategory,
  featured = false,
): IndustrySeed => ({
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  name,
  description,
  icon,
  category,
  featured,
});

export const INDUSTRIES: IndustrySeed[] = [
  mk("Technology and Software", "Companies that build software products, platforms, and developer tools.", "cpu", "technology", true),
  mk("Artificial Intelligence and Machine Learning", "Organizations building and applying AI/ML models and infrastructure.", "brain-circuit", "technology", true),
  mk("Data and Analytics", "Roles focused on turning data into decisions across every industry.", "bar-chart-3", "technology", true),
  mk("Financial Services", "Banking, investing, and capital-markets institutions.", "landmark", "finance", true),
  mk("Quantitative Finance and Trading", "Systematic and quantitative investment and trading firms.", "trending-up", "finance", true),
  mk("Banking", "Retail, commercial, and central banking institutions.", "building-2", "finance"),
  mk("Insurance", "Underwriting and managing risk for individuals and businesses.", "shield", "finance"),
  mk("Consulting", "Advisory firms helping organizations solve strategic and operational problems.", "briefcase", "professional-services", true),
  mk("Accounting", "Audit, tax, and financial reporting services.", "calculator", "professional-services"),
  mk("Legal Services", "Law firms and in-house legal departments.", "scale", "professional-services"),
  mk("Healthcare", "Hospitals, clinics, and healthcare delivery organizations.", "stethoscope", "healthcare-science", true),
  mk("Biotechnology", "Companies applying biology to develop new therapies and products.", "dna", "healthcare-science"),
  mk("Pharmaceuticals", "Drug discovery, development, and manufacturing.", "pill", "healthcare-science"),
  mk("Medical Devices", "Design and manufacturing of diagnostic and therapeutic devices.", "activity", "healthcare-science"),
  mk("Education", "K-12, higher education, and edtech organizations.", "graduation-cap", "public-education"),
  mk("Government and Public Policy", "Federal, state, and local government and policy work.", "landmark", "public-education"),
  mk("Defense and Aerospace", "Defense contractors and aerospace manufacturers.", "rocket", "industrial-energy"),
  mk("Manufacturing", "Production of goods across durable and non-durable sectors.", "factory", "industrial-energy"),
  mk("Automotive", "Vehicle design, manufacturing, and mobility services.", "car", "industrial-energy"),
  mk("Energy", "Traditional and diversified energy producers and utilities.", "zap", "industrial-energy"),
  mk("Renewable Energy", "Solar, wind, and other clean-energy generation and storage.", "sun", "industrial-energy"),
  mk("Oil and Gas", "Upstream, midstream, and downstream petroleum operations.", "fuel", "industrial-energy"),
  mk("Utilities", "Electric, gas, and water utility providers.", "plug", "industrial-energy"),
  mk("Construction", "Commercial and residential building and infrastructure projects.", "hard-hat", "trades-services"),
  mk("Real Estate", "Property development, brokerage, and management.", "home", "consumer-retail"),
  mk("Transportation and Logistics", "Freight, shipping, and passenger transportation.", "truck", "industrial-energy"),
  mk("Supply Chain", "Planning and operations connecting production to consumption.", "network", "industrial-energy"),
  mk("Retail", "Physical and omnichannel consumer retail.", "shopping-bag", "consumer-retail"),
  mk("E-commerce", "Online-first commerce and marketplace businesses.", "shopping-cart", "consumer-retail"),
  mk("Consumer Goods", "Branded packaged and durable goods manufacturers.", "package", "consumer-retail"),
  mk("Food and Agriculture", "Farming, food production, and agtech.", "wheat", "consumer-retail"),
  mk("Hospitality and Tourism", "Hotels, travel, and leisure services.", "plane", "consumer-retail"),
  mk("Media and Entertainment", "Film, television, music, and publishing.", "clapperboard", "creative-media"),
  mk("Gaming", "Video game development and publishing.", "gamepad-2", "creative-media"),
  mk("Telecommunications", "Network operators and communications infrastructure.", "signal", "technology"),
  mk("Marketing and Advertising", "Agencies and in-house teams driving brand and demand.", "megaphone", "creative-media"),
  mk("Sales", "Revenue-generating roles across industries.", "handshake", "professional-services"),
  mk("Human Resources", "Talent acquisition, people operations, and HR strategy.", "users", "professional-services"),
  mk("Operations", "Cross-industry operations and business-process roles.", "settings", "professional-services"),
  mk("Research and Academia", "University and independent research institutions.", "microscope", "public-education"),
  mk("Environmental Science", "Environmental consulting, conservation, and sustainability.", "leaf", "public-education"),
  mk("Architecture and Design", "Building design and the built environment.", "compass", "creative-media"),
  mk("Sports", "Professional sports organizations and sports business.", "trophy", "creative-media"),
  mk("Nonprofit and Social Impact", "Mission-driven organizations and philanthropy.", "heart-handshake", "public-education"),
  mk("Skilled Trades", "Licensed hands-on trades such as electrical and plumbing.", "wrench", "trades-services"),
  mk("Creator Economy", "Independent creators, influencers, and creator-support platforms.", "video", "creative-media"),
  mk("Cybersecurity", "Protecting systems, networks, and data from threats.", "shield-check", "technology", true),
  mk("Robotics", "Design and deployment of robotic and autonomous systems.", "bot", "technology"),
  mk("Semiconductor Industry", "Chip design, fabrication, and equipment manufacturing.", "cpu", "technology"),
  mk("Space Industry", "Launch, satellite, and space-infrastructure companies.", "rocket", "technology"),
];

if (INDUSTRIES.length < 50) {
  throw new Error(`Expected at least 50 industries, found ${INDUSTRIES.length}`);
}

export const INDUSTRY_BY_SLUG: Record<string, IndustrySeed> = Object.fromEntries(
  INDUSTRIES.map((i) => [i.slug, i]),
);
