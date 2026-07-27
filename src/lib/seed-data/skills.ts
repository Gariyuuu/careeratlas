export interface SkillSeed {
  slug: string;
  name: string;
  category: string;
}

const s = (name: string, category: string): SkillSeed => ({
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  name,
  category,
});

export const SKILLS: SkillSeed[] = [
  // Programming & engineering
  ...[
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "SQL", "R",
    "Swift", "Kotlin", "Scala", "Ruby", "PHP", "MATLAB", "Julia", "Bash Scripting",
  ].map((n) => s(n, "programming")),
  // Cloud & infrastructure
  ...[
    "AWS", "Azure", "Google Cloud Platform", "Kubernetes", "Docker", "Terraform", "CI/CD",
    "Linux Administration", "Site Reliability Engineering", "Networking", "System Design",
    "Microservices", "Serverless Architecture", "Ansible",
  ].map((n) => s(n, "infrastructure")),
  // Data & AI
  ...[
    "Machine Learning", "Deep Learning", "Natural Language Processing", "Computer Vision",
    "Data Engineering", "Data Warehousing", "ETL Pipelines", "Statistical Modeling",
    "A/B Testing", "Experimentation Design", "PyTorch", "TensorFlow", "Reinforcement Learning",
    "Large Language Models", "Prompt Engineering", "MLOps", "Data Visualization",
    "Business Intelligence", "Apache Spark", "Hadoop", "Feature Engineering",
    "Time Series Analysis", "Causal Inference", "Bayesian Statistics",
  ].map((n) => s(n, "data-ai")),
  // Product & design
  ...[
    "Product Strategy", "Product Discovery", "User Research", "UX Design", "UI Design",
    "Wireframing", "Prototyping", "Design Systems", "Roadmapping", "Agile / Scrum",
    "Requirements Gathering", "Stakeholder Management",
  ].map((n) => s(n, "product-design")),
  // Finance & quant
  ...[
    "Financial Modeling", "Valuation", "Financial Statement Analysis", "Derivatives Pricing",
    "Portfolio Management", "Risk Management", "Quantitative Research", "Algorithmic Trading",
    "Fixed Income Analysis", "Equity Research", "Credit Analysis", "Underwriting",
    "Regulatory Compliance", "Anti-Money Laundering", "Bloomberg Terminal", "Excel / VBA",
    "Corporate Finance", "Mergers & Acquisitions", "Private Equity Diligence", "Actuarial Science",
  ].map((n) => s(n, "finance")),
  // Legal & compliance
  ...[
    "Contract Drafting", "Legal Research", "Litigation Support", "Intellectual Property Law",
    "Corporate Governance", "Regulatory Filings", "Employment Law",
  ].map((n) => s(n, "legal")),
  // Sales & marketing
  ...[
    "B2B Sales", "Account Management", "Sales Enablement", "CRM Administration",
    "Digital Marketing", "SEO", "SEM", "Content Strategy", "Brand Management",
    "Marketing Analytics", "Email Marketing", "Social Media Strategy", "Growth Marketing",
    "Copywriting", "Public Relations",
  ].map((n) => s(n, "sales-marketing")),
  // Operations & supply chain
  ...[
    "Supply Chain Management", "Logistics Planning", "Inventory Management",
    "Procurement", "Process Improvement", "Lean Manufacturing", "Six Sigma",
    "Quality Assurance", "Vendor Management", "Warehouse Management", "Demand Forecasting",
  ].map((n) => s(n, "operations")),
  // Healthcare & life sciences
  ...[
    "Clinical Research", "Patient Care", "Electronic Health Records", "Medical Coding",
    "Regulatory Affairs (FDA)", "Clinical Trial Design", "Biostatistics", "Pharmacology",
    "Genomics", "Laboratory Techniques", "Bioinformatics", "Nursing Care",
  ].map((n) => s(n, "healthcare")),
  // Engineering (physical / hardware)
  ...[
    "Mechanical Design", "Electrical Engineering", "CAD", "Structural Analysis",
    "Robotics Engineering", "Embedded Systems", "PCB Design", "Signal Processing",
    "Thermodynamics", "Materials Science", "Chip Design", "RF Engineering",
    "Aerospace Systems Engineering", "Automotive Systems", "Renewable Energy Systems",
    "Civil Engineering", "Construction Management",
  ].map((n) => s(n, "engineering")),
  // People & general business
  ...[
    "People Management", "Recruiting", "Talent Development", "Compensation & Benefits",
    "Organizational Design", "Performance Management", "Change Management",
    "Strategic Planning", "Budgeting & Forecasting", "Public Speaking", "Negotiation",
    "Cross-functional Collaboration", "Project Management", "Program Management",
    "Customer Success", "Technical Writing", "Data Storytelling",
  ].map((n) => s(n, "business-general")),
  // Security
  ...[
    "Penetration Testing", "Security Operations", "Incident Response", "Cryptography",
    "Identity & Access Management", "Threat Intelligence", "Application Security",
    "Cloud Security", "Governance, Risk & Compliance (GRC)",
  ].map((n) => s(n, "security")),
  // Skilled trades
  ...[
    "Electrical Wiring", "Plumbing Systems", "HVAC Systems", "Welding", "Carpentry",
    "Equipment Maintenance", "Blueprint Reading", "Heavy Machinery Operation",
  ].map((n) => s(n, "trades")),
  // Creative & media
  ...[
    "Video Production", "Game Design", "3D Modeling", "Animation", "Sound Design",
    "Photography", "Journalism", "Screenwriting", "Community Management",
  ].map((n) => s(n, "creative")),
];

// De-duplicate defensively (a couple of names appear in more than one bucket).
const seen = new Set<string>();
export const UNIQUE_SKILLS: SkillSeed[] = SKILLS.filter((sk) => {
  if (seen.has(sk.slug)) return false;
  seen.add(sk.slug);
  return true;
});
