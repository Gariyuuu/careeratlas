import type {
  IndustryTaxonomySeed,
  OccupationSeed,
  SeniorityTrack,
  SubindustrySeed,
} from "./taxonomy-types";

const occ = (
  title: string,
  summary: string,
  skills: string[],
  seniorityTrack: SeniorityTrack,
  opts: Partial<Pick<OccupationSeed, "automationExposure" | "remoteFriendliness" | "aliases">> = {},
): OccupationSeed => ({
  title,
  summary,
  skills,
  seniorityTrack,
  automationExposure: opts.automationExposure ?? 0.25,
  remoteFriendliness: opts.remoteFriendliness ?? 0.5,
  aliases: opts.aliases,
});

const sub = (name: string, description: string, jobFamilies: SubindustrySeed["jobFamilies"]): SubindustrySeed => ({
  name,
  description,
  jobFamilies,
});

// ---------------------------------------------------------------------------
// 1. Technology and Software
// ---------------------------------------------------------------------------
const technology: IndustryTaxonomySeed = {
  industrySlug: "technology-and-software",
  subindustries: [
    sub("Software Engineering", "Building and maintaining application and platform software.", [
      {
        name: "Software Engineering",
        description: "General-purpose software development across the stack.",
        occupations: [
          occ("Software Engineer", "Designs, builds, and maintains software systems.", ["JavaScript", "TypeScript", "System Design", "Microservices"], "ic", { remoteFriendliness: 0.8, automationExposure: 0.2, aliases: [{ alias: "SWE", kind: "abbreviation" }, { alias: "Developer", kind: "synonym" }] }),
          occ("Frontend Engineer", "Builds user-facing web and app interfaces.", ["JavaScript", "TypeScript", "UI Design", "Design Systems"], "ic", { remoteFriendliness: 0.85 }),
          occ("Backend Engineer", "Builds server-side systems, APIs, and data layers.", ["Go", "SQL", "System Design", "Microservices"], "ic", { remoteFriendliness: 0.8 }),
        ],
      },
      {
        name: "Solutions Architecture",
        description: "Designing technical solutions that meet business requirements.",
        occupations: [
          occ("Solutions Architect", "Designs end-to-end technical solutions for customers or internal teams.", ["System Design", "AWS", "Stakeholder Management"], "full", { remoteFriendliness: 0.6 }),
          occ("Enterprise Architect", "Defines architecture standards across an entire organization.", ["System Design", "Strategic Planning", "Stakeholder Management"], "management", { remoteFriendliness: 0.5 }),
          occ("Mobile Engineer", "Builds native and cross-platform mobile applications.", ["Swift", "Kotlin", "UI Design"], "ic", { remoteFriendliness: 0.75 }),
        ],
      },
    ]),
    sub("Product Management", "Defining and driving software product strategy and execution.", [
      {
        name: "Product Management",
        description: "Owning product vision, roadmap, and delivery.",
        occupations: [
          occ("Product Manager", "Owns the roadmap and success of a software product.", ["Product Strategy", "Roadmapping", "Stakeholder Management"], "full", { remoteFriendliness: 0.65, aliases: [{ alias: "PM", kind: "abbreviation" }] }),
          occ("Technical Program Manager", "Coordinates complex, cross-team technical programs.", ["Program Management", "Stakeholder Management", "Agile / Scrum"], "full", { remoteFriendliness: 0.6, aliases: [{ alias: "TPM", kind: "abbreviation" }] }),
          occ("Product Operations Manager", "Builds process and tooling that helps product teams run efficiently.", ["Product Strategy", "Process Improvement", "Data Storytelling"], "management", { remoteFriendliness: 0.65 }),
        ],
      },
      {
        name: "Developer Relations",
        description: "Connecting engineering teams with external developer communities.",
        occupations: [
          occ("Developer Advocate", "Builds relationships with and creates content for developer communities.", ["Technical Writing", "Public Speaking", "JavaScript"], "ic", { remoteFriendliness: 0.75, aliases: [{ alias: "DevRel", kind: "abbreviation" }] }),
          occ("Technical Writer", "Produces developer-facing documentation.", ["Technical Writing", "JavaScript"], "ic", { remoteFriendliness: 0.9 }),
          occ("Developer Experience Engineer", "Improves the tools and workflows developers use daily.", ["JavaScript", "CI/CD", "System Design"], "ic", { remoteFriendliness: 0.8 }),
        ],
      },
    ]),
    sub("Cloud Computing and DevOps", "Infrastructure, deployment, and operational reliability.", [
      {
        name: "Cloud Infrastructure",
        description: "Designing and operating cloud infrastructure.",
        occupations: [
          occ("Cloud Engineer", "Builds and manages cloud infrastructure.", ["AWS", "Terraform", "Kubernetes"], "ic", { remoteFriendliness: 0.75 }),
          occ("DevOps Engineer", "Automates build, deployment, and infrastructure workflows.", ["CI/CD", "Docker", "Kubernetes", "Terraform"], "ic", { remoteFriendliness: 0.75 }),
          occ("Platform Engineer", "Builds internal developer platforms and tooling.", ["Kubernetes", "Terraform", "System Design"], "ic", { remoteFriendliness: 0.75 }),
        ],
      },
      {
        name: "Site Reliability Engineering",
        description: "Keeping large-scale systems reliable, fast, and observable.",
        occupations: [
          occ("Site Reliability Engineer", "Ensures production systems meet reliability and performance targets.", ["Site Reliability Engineering", "Kubernetes", "System Design"], "ic", { remoteFriendliness: 0.7, aliases: [{ alias: "SRE", kind: "abbreviation" }] }),
          occ("Systems Administrator", "Maintains servers, networks, and IT infrastructure.", ["Linux Administration", "Networking"], "ic", { remoteFriendliness: 0.55, automationExposure: 0.4 }),
          occ("Infrastructure Manager", "Leads teams responsible for infrastructure reliability.", ["Site Reliability Engineering", "People Management", "Strategic Planning"], "management", { remoteFriendliness: 0.6 }),
        ],
      },
    ]),
    sub("Quality Assurance", "Verifying software meets functional and quality standards.", [
      {
        name: "Quality Assurance",
        description: "Testing and quality engineering for software products.",
        occupations: [
          occ("QA Engineer", "Designs and executes manual and automated tests.", ["Quality Assurance", "JavaScript"], "ic", { remoteFriendliness: 0.7, automationExposure: 0.35, aliases: [{ alias: "QA", kind: "abbreviation" }] }),
          occ("Test Automation Engineer", "Builds automated test suites and frameworks.", ["Quality Assurance", "Python", "CI/CD"], "ic", { remoteFriendliness: 0.75 }),
          occ("QA Manager", "Leads quality assurance strategy and teams.", ["Quality Assurance", "People Management"], "management", { remoteFriendliness: 0.65 }),
        ],
      },
      {
        name: "Security Engineering",
        description: "Securing software products and engineering pipelines.",
        occupations: [
          occ("Application Security Engineer", "Finds and fixes security vulnerabilities in software.", ["Application Security", "Penetration Testing"], "ic", { remoteFriendliness: 0.7 }),
          occ("DevSecOps Engineer", "Embeds security into CI/CD pipelines.", ["CI/CD", "Application Security", "Cloud Security"], "ic", { remoteFriendliness: 0.7 }),
          occ("Release Manager", "Coordinates and manages software release processes.", ["CI/CD", "Process Improvement"], "management", { remoteFriendliness: 0.65 }),
        ],
      },
    ]),
    sub("Engineering Leadership", "Leading engineering organizations.", [
      {
        name: "Engineering Management",
        description: "Managing software engineering teams.",
        occupations: [
          occ("Engineering Manager", "Manages a team of software engineers.", ["People Management", "System Design", "Agile / Scrum"], "management", { remoteFriendliness: 0.6 }),
          occ("Director of Engineering", "Owns engineering strategy for a business unit.", ["Strategic Planning", "People Management", "Budgeting & Forecasting"], "executive", { remoteFriendliness: 0.55 }),
          occ("VP of Engineering", "Owns engineering across multiple business units.", ["Strategic Planning", "People Management"], "executive", { remoteFriendliness: 0.5 }),
        ],
      },
      {
        name: "Executive Technology Leadership",
        description: "C-suite technology leadership.",
        occupations: [
          occ("Chief Technology Officer", "Sets overall technology strategy and vision.", ["Strategic Planning", "System Design", "Budgeting & Forecasting"], "executive", { remoteFriendliness: 0.4, aliases: [{ alias: "CTO", kind: "abbreviation" }] }),
          occ("Chief Information Officer", "Owns enterprise technology and IT strategy.", ["Strategic Planning", "Budgeting & Forecasting"], "executive", { remoteFriendliness: 0.4, aliases: [{ alias: "CIO", kind: "abbreviation" }] }),
          occ("Chief Product Officer", "Owns product strategy at the executive level.", ["Product Strategy", "Strategic Planning"], "executive", { remoteFriendliness: 0.4, aliases: [{ alias: "CPO", kind: "abbreviation" }] }),
        ],
      },
    ]),
  ],
};

// ---------------------------------------------------------------------------
// 2. Artificial Intelligence and Machine Learning
// ---------------------------------------------------------------------------
const ai: IndustryTaxonomySeed = {
  industrySlug: "artificial-intelligence-and-machine-learning",
  subindustries: [
    sub("Machine Learning Engineering", "Building and shipping production ML systems.", [
      {
        name: "Machine Learning Engineering",
        description: "Productionizing machine learning models.",
        occupations: [
          occ("Machine Learning Engineer", "Builds and deploys machine learning models in production.", ["Machine Learning", "Python", "MLOps"], "ic", { remoteFriendliness: 0.75, aliases: [{ alias: "MLE", kind: "abbreviation" }] }),
          occ("MLOps Engineer", "Builds infrastructure for training and serving ML models.", ["MLOps", "Kubernetes", "Python"], "ic", { remoteFriendliness: 0.75 }),
          occ("AI Infrastructure Engineer", "Builds large-scale compute infrastructure for AI workloads.", ["Kubernetes", "Python", "System Design"], "ic", { remoteFriendliness: 0.65 }),
        ],
      },
      {
        name: "LLM and Generative AI Engineering",
        description: "Building products and systems on large language models.",
        occupations: [
          occ("LLM Engineer", "Builds applications and systems powered by large language models.", ["Large Language Models", "Prompt Engineering", "Python"], "ic", { remoteFriendliness: 0.75 }),
          occ("Generative AI Engineer", "Builds generative AI products across text, image, and audio.", ["Large Language Models", "Deep Learning", "Python"], "ic", { remoteFriendliness: 0.75, aliases: [{ alias: "GenAI Engineer", kind: "synonym" }] }),
          occ("Prompt Engineer", "Designs and optimizes prompts and evaluation pipelines for LLMs.", ["Prompt Engineering", "Large Language Models"], "ic", { remoteFriendliness: 0.8 }),
        ],
      },
    ]),
    sub("AI Research", "Advancing the state of the art in AI.", [
      {
        name: "Research Science",
        description: "Original research pushing AI capabilities forward.",
        occupations: [
          occ("AI Research Scientist", "Conducts original research to advance AI capabilities.", ["Deep Learning", "PyTorch", "Statistical Modeling"], "ic", { remoteFriendliness: 0.55, automationExposure: 0.1 }),
          occ("Applied Scientist", "Applies research techniques to real product problems.", ["Machine Learning", "PyTorch", "Statistical Modeling"], "ic", { remoteFriendliness: 0.6 }),
          occ("Research Engineer", "Builds infrastructure and tooling that supports AI research.", ["PyTorch", "Python", "System Design"], "ic", { remoteFriendliness: 0.65 }),
        ],
      },
      {
        name: "AI Safety",
        description: "Ensuring AI systems are safe, aligned, and robust.",
        occupations: [
          occ("AI Safety Researcher", "Researches methods to make AI systems safer and more aligned.", ["Machine Learning", "Statistical Modeling", "Causal Inference"], "ic", { remoteFriendliness: 0.55 }),
          occ("AI Policy Researcher", "Studies the societal and policy implications of AI systems.", ["Statistical Modeling", "Technical Writing"], "ic", { remoteFriendliness: 0.6 }),
          occ("Responsible AI Lead", "Leads efforts to deploy AI responsibly across an organization.", ["Governance, Risk & Compliance (GRC)", "Strategic Planning"], "management", { remoteFriendliness: 0.55 }),
        ],
      },
    ]),
    sub("Applied AI Specialties", "Domain-specific applied machine learning.", [
      {
        name: "Natural Language Processing",
        description: "Applying ML to understand and generate human language.",
        occupations: [
          occ("NLP Engineer", "Builds systems that understand and generate natural language.", ["Natural Language Processing", "Python", "Deep Learning"], "ic", { remoteFriendliness: 0.75 }),
          occ("Conversational AI Engineer", "Builds chatbots and voice assistants.", ["Natural Language Processing", "Large Language Models"], "ic", { remoteFriendliness: 0.75 }),
          occ("Computational Linguist", "Applies linguistics to language technology.", ["Natural Language Processing", "Statistical Modeling"], "ic", { remoteFriendliness: 0.7 }),
        ],
      },
      {
        name: "Computer Vision and Robotics",
        description: "Applying ML to visual and physical-world systems.",
        occupations: [
          occ("Computer Vision Engineer", "Builds systems that interpret images and video.", ["Computer Vision", "Deep Learning", "Python"], "ic", { remoteFriendliness: 0.6 }),
          occ("Robotics ML Engineer", "Applies machine learning to robotic perception and control.", ["Computer Vision", "Reinforcement Learning", "Robotics Engineering"], "ic", { remoteFriendliness: 0.35 }),
          occ("Autonomy Engineer", "Builds decision-making systems for autonomous vehicles or robots.", ["Reinforcement Learning", "Computer Vision", "Embedded Systems"], "ic", { remoteFriendliness: 0.3 }),
        ],
      },
    ]),
    sub("AI Product and Strategy", "Bringing AI capabilities to market.", [
      {
        name: "AI Product Management",
        description: "Owning the roadmap for AI-powered products.",
        occupations: [
          occ("AI Product Manager", "Owns the product strategy for AI-powered features and products.", ["Product Strategy", "Machine Learning", "Roadmapping"], "full", { remoteFriendliness: 0.65 }),
          occ("AI Solutions Consultant", "Helps customers design and implement AI solutions.", ["Machine Learning", "Stakeholder Management"], "ic", { remoteFriendliness: 0.55 }),
          occ("Head of AI", "Leads AI strategy and teams across an organization.", ["Strategic Planning", "Machine Learning", "People Management"], "executive", { remoteFriendliness: 0.5 }),
        ],
      },
      {
        name: "Data Labeling and Evaluation",
        description: "Building the datasets and evaluations AI systems depend on.",
        occupations: [
          occ("AI Evaluation Specialist", "Designs evaluation suites that measure model quality and safety.", ["Prompt Engineering", "Statistical Modeling"], "ic", { remoteFriendliness: 0.8 }),
          occ("Data Annotation Lead", "Leads teams that label and curate training data.", ["Process Improvement", "People Management"], "management", { remoteFriendliness: 0.7 }),
          occ("Model Risk Analyst", "Assesses risk and compliance issues in deployed models.", ["Governance, Risk & Compliance (GRC)", "Statistical Modeling"], "ic", { remoteFriendliness: 0.65 }),
        ],
      },
    ]),
    sub("AI Leadership", "Executive AI leadership roles.", [
      {
        name: "AI Executive Leadership",
        description: "C-suite and VP-level AI leadership.",
        occupations: [
          occ("VP of AI", "Owns AI strategy and execution across the company.", ["Strategic Planning", "Machine Learning", "People Management"], "executive", { remoteFriendliness: 0.45 }),
          occ("Chief AI Officer", "Sets enterprise-wide AI strategy at the executive level.", ["Strategic Planning", "Machine Learning"], "executive", { remoteFriendliness: 0.4, aliases: [{ alias: "CAIO", kind: "abbreviation" }] }),
          occ("Director of Machine Learning", "Owns ML strategy and roadmap for a business unit.", ["Machine Learning", "Strategic Planning", "People Management"], "management", { remoteFriendliness: 0.55 }),
        ],
      },
    ]),
  ],
};

// ---------------------------------------------------------------------------
// 3. Data and Analytics
// ---------------------------------------------------------------------------
const data: IndustryTaxonomySeed = {
  industrySlug: "data-and-analytics",
  subindustries: [
    sub("Data Science", "Extracting insight and building predictive models from data.", [
      {
        name: "Data Science",
        description: "Statistical modeling and predictive analytics.",
        occupations: [
          occ("Data Scientist", "Builds statistical and machine-learning models to answer business questions.", ["Statistical Modeling", "Python", "Machine Learning"], "ic", { remoteFriendliness: 0.75, aliases: [{ alias: "DS", kind: "abbreviation" }] }),
          occ("Decision Scientist", "Applies causal inference and modeling to guide decisions.", ["Causal Inference", "Statistical Modeling", "Bayesian Statistics"], "ic", { remoteFriendliness: 0.7 }),
          occ("Research Scientist, Experimentation", "Designs and analyzes large-scale experiments.", ["A/B Testing", "Experimentation Design", "Statistical Modeling"], "ic", { remoteFriendliness: 0.7 }),
        ],
      },
      {
        name: "Applied Statistics",
        description: "Rigorous statistical methods applied to business and research problems.",
        occupations: [
          occ("Statistician", "Applies statistical theory to design studies and analyze data.", ["Statistical Modeling", "Bayesian Statistics", "R"], "ic", { remoteFriendliness: 0.7 }),
          occ("Econometrician", "Applies statistical methods to economic data.", ["Econometrics", "Statistical Modeling", "R"], "ic", { remoteFriendliness: 0.7 }),
          occ("Biostatistician", "Applies statistics to health and life-science data.", ["Biostatistics", "Statistical Modeling", "R"], "ic", { remoteFriendliness: 0.6 }),
        ],
      },
    ]),
    sub("Data Analysis and BI", "Turning data into dashboards, reports, and recommendations.", [
      {
        name: "Data Analysis",
        description: "Analyzing data to answer specific business questions.",
        occupations: [
          occ("Data Analyst", "Analyzes data to answer business questions and build reports.", ["SQL", "Data Visualization", "Business Intelligence"], "ic", { remoteFriendliness: 0.75, aliases: [{ alias: "DA", kind: "abbreviation" }] }),
          occ("Business Analyst", "Bridges business needs and data/technical solutions.", ["SQL", "Requirements Gathering", "Business Intelligence"], "ic", { remoteFriendliness: 0.7, aliases: [{ alias: "BA", kind: "abbreviation" }] }),
          occ("Business Intelligence Analyst", "Builds and maintains BI dashboards and reporting infrastructure.", ["Business Intelligence", "SQL", "Data Visualization"], "ic", { remoteFriendliness: 0.75 }),
        ],
      },
      {
        name: "Analytics Engineering",
        description: "Building the data models that power analytics.",
        occupations: [
          occ("Analytics Engineer", "Builds well-tested, documented data models for analytics.", ["SQL", "Data Warehousing", "ETL Pipelines"], "ic", { remoteFriendliness: 0.8 }),
          occ("Data Engineer", "Builds and maintains data pipelines and infrastructure.", ["ETL Pipelines", "Apache Spark", "SQL"], "ic", { remoteFriendliness: 0.75 }),
          occ("Data Platform Engineer", "Builds the platforms that data teams rely on.", ["Data Warehousing", "Kubernetes", "SQL"], "ic", { remoteFriendliness: 0.7 }),
        ],
      },
    ]),
    sub("Data Leadership", "Leading data organizations.", [
      {
        name: "Analytics Leadership",
        description: "Managing analytics and data science teams.",
        occupations: [
          occ("Analytics Manager", "Manages a team of analysts or data scientists.", ["People Management", "Business Intelligence", "Statistical Modeling"], "management", { remoteFriendliness: 0.65 }),
          occ("Director of Data Science", "Owns data science strategy for a business unit.", ["Strategic Planning", "Machine Learning", "People Management"], "management", { remoteFriendliness: 0.55 }),
          occ("Chief Data Officer", "Owns enterprise data strategy at the executive level.", ["Strategic Planning", "Governance, Risk & Compliance (GRC)"], "executive", { remoteFriendliness: 0.45, aliases: [{ alias: "CDO", kind: "abbreviation" }] }),
        ],
      },
      {
        name: "Data Governance",
        description: "Ensuring data quality, privacy, and governance.",
        occupations: [
          occ("Data Governance Analyst", "Maintains data quality, lineage, and governance standards.", ["Governance, Risk & Compliance (GRC)", "SQL"], "ic", { remoteFriendliness: 0.7 }),
          occ("Data Privacy Analyst", "Ensures data practices comply with privacy regulations.", ["Governance, Risk & Compliance (GRC)", "Regulatory Compliance"], "ic", { remoteFriendliness: 0.65 }),
          occ("Master Data Manager", "Owns the accuracy of core enterprise data entities.", ["Governance, Risk & Compliance (GRC)", "SQL", "Process Improvement"], "management", { remoteFriendliness: 0.6 }),
        ],
      },
    ]),
  ],
};

// ---------------------------------------------------------------------------
// 4. Financial Services
// ---------------------------------------------------------------------------
const financialServices: IndustryTaxonomySeed = {
  industrySlug: "financial-services",
  subindustries: [
    sub("Investment Banking", "Advising on capital raising and M&A transactions.", [
      {
        name: "Investment Banking",
        description: "Executing capital markets and M&A transactions.",
        occupations: [
          occ("Investment Banking Analyst", "Supports deal execution through financial modeling and diligence.", ["Financial Modeling", "Valuation", "Excel / VBA"], "ic", { remoteFriendliness: 0.3, automationExposure: 0.3 }),
          occ("Investment Banking Associate", "Leads workstreams on M&A and capital-raising transactions.", ["Financial Modeling", "Mergers & Acquisitions", "Valuation"], "ic", { remoteFriendliness: 0.3 }),
          occ("Managing Director, Investment Banking", "Originates and leads client relationships and major deals.", ["Mergers & Acquisitions", "Stakeholder Management", "Strategic Planning"], "executive", { remoteFriendliness: 0.25 }),
        ],
      },
      {
        name: "Private Equity and Venture Capital",
        description: "Investing directly in private companies.",
        occupations: [
          occ("Private Equity Associate", "Sources, diligences, and manages private equity investments.", ["Private Equity Diligence", "Financial Modeling", "Valuation"], "ic", { remoteFriendliness: 0.35 }),
          occ("Venture Capital Associate", "Sources and evaluates early-stage startup investments.", ["Valuation", "Financial Modeling", "Stakeholder Management"], "ic", { remoteFriendliness: 0.45 }),
          occ("Partner, Private Equity", "Leads fund strategy and major investment decisions.", ["Private Equity Diligence", "Strategic Planning"], "executive", { remoteFriendliness: 0.3 }),
        ],
      },
    ]),
    sub("Asset and Wealth Management", "Managing investments on behalf of clients.", [
      {
        name: "Asset Management",
        description: "Managing pooled investment portfolios.",
        occupations: [
          occ("Portfolio Manager", "Manages an investment portfolio against a mandate or benchmark.", ["Portfolio Management", "Equity Research", "Fixed Income Analysis"], "full", { remoteFriendliness: 0.4 }),
          occ("Equity Research Analyst", "Researches public companies to inform investment decisions.", ["Equity Research", "Financial Modeling", "Valuation"], "ic", { remoteFriendliness: 0.45 }),
          occ("Fixed Income Analyst", "Analyzes bonds and credit instruments.", ["Fixed Income Analysis", "Credit Analysis"], "ic", { remoteFriendliness: 0.45 }),
        ],
      },
      {
        name: "Financial Planning",
        description: "Advising individuals on personal financial decisions.",
        occupations: [
          occ("Financial Advisor", "Advises individual clients on investing and financial planning.", ["Portfolio Management", "Stakeholder Management"], "full", { remoteFriendliness: 0.4 }),
          occ("Wealth Manager", "Manages holistic financial plans for high-net-worth clients.", ["Portfolio Management", "Financial Modeling"], "full", { remoteFriendliness: 0.4 }),
          occ("Financial Planning Analyst", "Supports financial planning and analysis for advisory teams.", ["Financial Modeling", "Excel / VBA"], "ic", { remoteFriendliness: 0.6 }),
        ],
      },
    ]),
    sub("Corporate Finance and FP&A", "Managing the finances of operating companies.", [
      {
        name: "Corporate Finance",
        description: "Managing capital structure and financial strategy for a company.",
        occupations: [
          occ("FP&A Analyst", "Builds forecasts, budgets, and financial analysis for a company.", ["Budgeting & Forecasting", "Financial Modeling", "Excel / VBA"], "ic", { remoteFriendliness: 0.65 }),
          occ("Corporate Finance Manager", "Manages financial planning and capital allocation.", ["Corporate Finance", "Budgeting & Forecasting"], "management", { remoteFriendliness: 0.6 }),
          occ("Chief Financial Officer", "Owns financial strategy at the executive level.", ["Corporate Finance", "Strategic Planning", "Budgeting & Forecasting"], "executive", { remoteFriendliness: 0.4, aliases: [{ alias: "CFO", kind: "abbreviation" }] }),
        ],
      },
      {
        name: "FinTech",
        description: "Technology-driven financial products and services.",
        occupations: [
          occ("FinTech Product Manager", "Owns roadmap for financial technology products.", ["Product Strategy", "Regulatory Compliance"], "full", { remoteFriendliness: 0.7 }),
          occ("Payments Analyst", "Analyzes and optimizes payment systems and flows.", ["Financial Modeling", "SQL"], "ic", { remoteFriendliness: 0.7 }),
          occ("FinTech Compliance Manager", "Ensures fintech products meet regulatory requirements.", ["Regulatory Compliance", "Governance, Risk & Compliance (GRC)"], "management", { remoteFriendliness: 0.55 }),
        ],
      },
    ]),
    sub("Risk and Compliance", "Managing financial and regulatory risk.", [
      {
        name: "Risk Management",
        description: "Identifying and mitigating financial risk.",
        occupations: [
          occ("Risk Analyst", "Analyzes and quantifies financial risk exposure.", ["Risk Management", "Statistical Modeling"], "ic", { remoteFriendliness: 0.6 }),
          occ("Credit Risk Manager", "Manages the risk of lending and credit portfolios.", ["Credit Analysis", "Risk Management"], "management", { remoteFriendliness: 0.55 }),
          occ("Chief Risk Officer", "Owns enterprise risk strategy at the executive level.", ["Risk Management", "Strategic Planning"], "executive", { remoteFriendliness: 0.4, aliases: [{ alias: "CRO", kind: "abbreviation" }] }),
        ],
      },
      {
        name: "Compliance",
        description: "Ensuring adherence to financial regulation.",
        occupations: [
          occ("Compliance Analyst", "Monitors and reports on regulatory compliance.", ["Regulatory Compliance", "Anti-Money Laundering"], "ic", { remoteFriendliness: 0.6 }),
          occ("AML Investigator", "Investigates potentially fraudulent or illicit transactions.", ["Anti-Money Laundering", "Risk Management"], "ic", { remoteFriendliness: 0.55, automationExposure: 0.35 }),
          occ("Chief Compliance Officer", "Owns regulatory compliance strategy at the executive level.", ["Regulatory Compliance", "Strategic Planning"], "executive", { remoteFriendliness: 0.4 }),
        ],
      },
    ]),
    sub("Actuarial and Insurance Finance", "Quantifying and pricing long-term financial risk.", [
      {
        name: "Actuarial Science",
        description: "Applying probability and statistics to insurance and pension risk.",
        occupations: [
          occ("Actuarial Analyst", "Supports pricing and reserving analysis under actuary guidance.", ["Actuarial Science", "Statistical Modeling"], "ic", { remoteFriendliness: 0.65 }),
          occ("Actuary", "Prices and reserves for long-term insurance and pension risk.", ["Actuarial Science", "Statistical Modeling", "Risk Management"], "full", { remoteFriendliness: 0.6 }),
          occ("Chief Actuary", "Owns actuarial strategy at the executive level.", ["Actuarial Science", "Strategic Planning"], "executive", { remoteFriendliness: 0.45 }),
        ],
      },
    ]),
  ],
};

// ---------------------------------------------------------------------------
// 5. Quantitative Finance and Trading
// ---------------------------------------------------------------------------
const quant: IndustryTaxonomySeed = {
  industrySlug: "quantitative-finance-and-trading",
  subindustries: [
    sub("Quantitative Research", "Researching systematic trading and investment strategies.", [
      {
        name: "Quantitative Research",
        description: "Developing and validating quantitative trading strategies.",
        occupations: [
          occ("Quantitative Researcher", "Researches and validates systematic trading strategies.", ["Quantitative Research", "Statistical Modeling", "Python"], "ic", { remoteFriendliness: 0.35, aliases: [{ alias: "QR", kind: "abbreviation" }] }),
          occ("Quantitative Strategist", "Designs cross-asset systematic investment strategies.", ["Quantitative Research", "Portfolio Optimization"], "ic", { remoteFriendliness: 0.35 }),
          occ("Head of Quantitative Research", "Leads a firm's quantitative research function.", ["Quantitative Research", "People Management", "Strategic Planning"], "executive", { remoteFriendliness: 0.3 }),
        ],
      },
      {
        name: "Risk Modeling",
        description: "Modeling and managing quantitative portfolio risk.",
        occupations: [
          occ("Risk Modeling Analyst", "Builds models to quantify portfolio and market risk.", ["Risk Modeling", "Statistical Modeling"], "ic", { remoteFriendliness: 0.4 }),
          occ("Portfolio Risk Manager", "Manages risk exposure across trading portfolios.", ["Risk Modeling", "Portfolio Optimization"], "management", { remoteFriendliness: 0.35 }),
          occ("Model Validation Analyst", "Independently validates quantitative models before deployment.", ["Risk Modeling", "Statistical Modeling"], "ic", { remoteFriendliness: 0.5 }),
        ],
      },
    ]),
    sub("Quantitative Development", "Building the systems that power systematic trading.", [
      {
        name: "Quantitative Development",
        description: "Engineering low-latency trading and research systems.",
        occupations: [
          occ("Quantitative Developer", "Builds trading and research infrastructure for quant strategies.", ["C++", "Python", "System Design"], "ic", { remoteFriendliness: 0.4, aliases: [{ alias: "QD", kind: "abbreviation" }] }),
          occ("Low-Latency Systems Engineer", "Builds ultra-low-latency trading systems.", ["C++", "Networking", "System Design"], "ic", { remoteFriendliness: 0.2 }),
          occ("Trading Systems Engineer", "Builds and maintains order execution and trading infrastructure.", ["C++", "Python", "System Design"], "ic", { remoteFriendliness: 0.3 }),
        ],
      },
      {
        name: "Algorithmic Trading",
        description: "Executing systematic trading strategies in live markets.",
        occupations: [
          occ("Algorithmic Trader", "Designs and operates automated trading strategies.", ["Algorithmic Trading", "Statistical Modeling", "Python"], "ic", { remoteFriendliness: 0.25 }),
          occ("Market Maker", "Provides liquidity by quoting continuous buy/sell prices.", ["Market Making", "Derivatives Pricing"], "ic", { remoteFriendliness: 0.15 }),
          occ("Execution Trader", "Executes large orders while minimizing market impact.", ["Algorithmic Trading", "Market Making"], "ic", { remoteFriendliness: 0.2 }),
        ],
      },
    ]),
    sub("Derivatives and Financial Engineering", "Pricing and structuring complex financial instruments.", [
      {
        name: "Derivatives",
        description: "Pricing, trading, and structuring derivative instruments.",
        occupations: [
          occ("Derivatives Trader", "Trades options, futures, and other derivative instruments.", ["Derivatives Pricing", "Risk Management"], "ic", { remoteFriendliness: 0.2 }),
          occ("Financial Engineer", "Designs and prices structured financial products.", ["Derivatives Pricing", "Financial Modeling"], "ic", { remoteFriendliness: 0.45 }),
          occ("Structuring Associate", "Designs bespoke structured products for institutional clients.", ["Derivatives Pricing", "Stakeholder Management"], "ic", { remoteFriendliness: 0.3 }),
        ],
      },
    ]),
  ],
};

// ---------------------------------------------------------------------------
// 6. Consulting
// ---------------------------------------------------------------------------
const consulting: IndustryTaxonomySeed = {
  industrySlug: "consulting",
  subindustries: [
    sub("Strategy Consulting", "Advising executives on corporate and business strategy.", [
      {
        name: "Strategy Consulting",
        description: "High-level strategic advisory for corporate leadership.",
        occupations: [
          occ("Strategy Consultant", "Advises clients on corporate and business-unit strategy.", ["Strategic Planning", "Financial Modeling", "Stakeholder Management"], "ic", { remoteFriendliness: 0.4 }),
          occ("Engagement Manager", "Leads consulting project teams and client relationships.", ["Program Management", "Stakeholder Management"], "management", { remoteFriendliness: 0.4 }),
          occ("Partner, Strategy Consulting", "Owns client relationships and practice strategy.", ["Strategic Planning", "Stakeholder Management"], "executive", { remoteFriendliness: 0.3 }),
        ],
      },
      {
        name: "Business Analysis (Consulting)",
        description: "Analytical support for consulting engagements.",
        occupations: [
          occ("Business Analyst, Consulting", "Performs analysis supporting client engagements.", ["Requirements Gathering", "Financial Modeling"], "ic", { remoteFriendliness: 0.45 }),
          occ("Associate Consultant", "Supports research and analysis on consulting engagements.", ["Financial Modeling", "Stakeholder Management"], "ic", { remoteFriendliness: 0.4 }),
          occ("Research Analyst, Consulting", "Conducts market and competitive research for client teams.", ["Data Storytelling", "Business Intelligence"], "ic", { remoteFriendliness: 0.6 }),
        ],
      },
    ]),
    sub("Management and Operations Consulting", "Improving how organizations operate.", [
      {
        name: "Operations Consulting",
        description: "Improving operational efficiency for clients.",
        occupations: [
          occ("Operations Consultant", "Advises clients on process and operational improvement.", ["Process Improvement", "Lean Manufacturing"], "ic", { remoteFriendliness: 0.45 }),
          occ("Change Management Consultant", "Guides organizations through large-scale change initiatives.", ["Change Management", "Stakeholder Management"], "ic", { remoteFriendliness: 0.5 }),
          occ("Principal, Operations Consulting", "Leads major operations-consulting engagements.", ["Process Improvement", "Strategic Planning"], "executive", { remoteFriendliness: 0.35 }),
        ],
      },
      {
        name: "Technology Consulting",
        description: "Advising clients on technology strategy and implementation.",
        occupations: [
          occ("Technology Consultant", "Advises clients on technology strategy and system implementation.", ["System Design", "Stakeholder Management"], "ic", { remoteFriendliness: 0.55 }),
          occ("IT Strategy Consultant", "Aligns technology investment with business strategy.", ["Strategic Planning", "System Design"], "ic", { remoteFriendliness: 0.55 }),
          occ("Digital Transformation Lead", "Leads large-scale digital transformation programs.", ["Change Management", "Program Management"], "management", { remoteFriendliness: 0.5 }),
        ],
      },
    ]),
    sub("Human Capital Consulting", "Advising on organizational and workforce strategy.", [
      {
        name: "Human Capital Consulting",
        description: "Advising clients on people and organizational strategy.",
        occupations: [
          occ("Human Capital Consultant", "Advises clients on org design, talent, and workforce strategy.", ["Organizational Design", "Change Management"], "ic", { remoteFriendliness: 0.55 }),
          occ("Compensation Consultant", "Advises clients on pay strategy and benchmarking.", ["Compensation & Benefits", "Financial Modeling"], "ic", { remoteFriendliness: 0.6 }),
          occ("People Analytics Consultant", "Applies data analysis to workforce decisions.", ["Data Storytelling", "Statistical Modeling"], "ic", { remoteFriendliness: 0.65 }),
        ],
      },
    ]),
    sub("Economic and Policy Consulting", "Applying economic analysis to business and policy questions.", [
      {
        name: "Economic Consulting",
        description: "Applying economic and statistical analysis to litigation and policy.",
        occupations: [
          occ("Economic Consultant", "Applies economic analysis to litigation and business disputes.", ["Econometrics", "Statistical Modeling"], "ic", { remoteFriendliness: 0.5 }),
          occ("Policy Analyst, Consulting", "Analyzes the impact of policy and regulatory decisions.", ["Statistical Modeling", "Technical Writing"], "ic", { remoteFriendliness: 0.55 }),
          occ("Managing Director, Economic Consulting", "Leads major economic-consulting engagements.", ["Econometrics", "Strategic Planning"], "executive", { remoteFriendliness: 0.4 }),
        ],
      },
    ]),
    sub("Consulting Leadership", "Firm and practice leadership.", [
      {
        name: "Practice Leadership",
        description: "Leading a consulting practice or firm.",
        occupations: [
          occ("Practice Lead", "Owns strategy and growth for a consulting practice area.", ["Strategic Planning", "People Management"], "executive", { remoteFriendliness: 0.35 }),
          occ("Managing Partner", "Leads the overall consulting firm or a major office.", ["Strategic Planning", "Stakeholder Management"], "executive", { remoteFriendliness: 0.3 }),
          occ("Chief of Staff, Consulting Firm", "Supports firm leadership on strategic initiatives.", ["Strategic Planning", "Program Management"], "management", { remoteFriendliness: 0.45 }),
        ],
      },
    ]),
  ],
};

// ---------------------------------------------------------------------------
// 7. Healthcare
// ---------------------------------------------------------------------------
const healthcare: IndustryTaxonomySeed = {
  industrySlug: "healthcare",
  subindustries: [
    sub("Clinical Care", "Direct patient care roles.", [
      {
        name: "Nursing",
        description: "Direct nursing care for patients.",
        occupations: [
          occ("Registered Nurse", "Provides direct patient care in clinical settings.", ["Patient Care", "Electronic Health Records"], "full", { remoteFriendliness: 0.1, automationExposure: 0.1, aliases: [{ alias: "RN", kind: "abbreviation" }] }),
          occ("Nurse Practitioner", "Provides advanced clinical care and can prescribe treatment.", ["Patient Care", "Pharmacology"], "full", { remoteFriendliness: 0.15, aliases: [{ alias: "NP", kind: "abbreviation" }] }),
          occ("Nurse Manager", "Manages nursing staff and clinical operations for a unit.", ["Patient Care", "People Management"], "management", { remoteFriendliness: 0.1 }),
        ],
      },
      {
        name: "Physician and Advanced Practice",
        description: "Diagnosing and treating patients.",
        occupations: [
          occ("Physician", "Diagnoses and treats patients across a medical specialty.", ["Patient Care", "Pharmacology"], "full", { remoteFriendliness: 0.15 }),
          occ("Physician Assistant", "Provides medical care under physician supervision.", ["Patient Care", "Pharmacology"], "full", { remoteFriendliness: 0.15, aliases: [{ alias: "PA", kind: "abbreviation" }] }),
          occ("Medical Director", "Oversees clinical quality and strategy for a facility or program.", ["Patient Care", "Strategic Planning"], "executive", { remoteFriendliness: 0.25 }),
        ],
      },
    ]),
    sub("Health Administration", "Running healthcare organizations and programs.", [
      {
        name: "Healthcare Administration",
        description: "Managing the business side of healthcare delivery.",
        occupations: [
          occ("Healthcare Administrator", "Manages daily operations of a healthcare facility or department.", ["Patient Care", "Budgeting & Forecasting"], "management", { remoteFriendliness: 0.35 }),
          occ("Medical Practice Manager", "Manages operations for a physician practice.", ["Process Improvement", "Budgeting & Forecasting"], "management", { remoteFriendliness: 0.3 }),
          occ("Chief Medical Officer", "Owns clinical strategy at the executive level.", ["Strategic Planning", "Patient Care"], "executive", { remoteFriendliness: 0.3, aliases: [{ alias: "CMO", kind: "abbreviation" }] }),
        ],
      },
      {
        name: "Health Informatics",
        description: "Applying data and technology to healthcare delivery.",
        occupations: [
          occ("Health Informatics Analyst", "Analyzes clinical and operational healthcare data.", ["Electronic Health Records", "SQL"], "ic", { remoteFriendliness: 0.55 }),
          occ("Clinical Data Manager", "Manages the integrity of clinical trial or health-system data.", ["Electronic Health Records", "Clinical Trial Design"], "management", { remoteFriendliness: 0.5 }),
          occ("Medical Coder", "Translates clinical documentation into standardized billing codes.", ["Medical Coding", "Electronic Health Records"], "ic", { remoteFriendliness: 0.8, automationExposure: 0.55 }),
        ],
      },
    ]),
    sub("Clinical Research", "Researching new treatments and therapies.", [
      {
        name: "Clinical Research",
        description: "Running clinical trials and studies.",
        occupations: [
          occ("Clinical Research Coordinator", "Manages day-to-day operations of clinical trials.", ["Clinical Trial Design", "Patient Care"], "ic", { remoteFriendliness: 0.35 }),
          occ("Clinical Research Associate", "Monitors clinical trial sites for compliance and quality.", ["Clinical Trial Design", "Regulatory Affairs (FDA)"], "ic", { remoteFriendliness: 0.45, aliases: [{ alias: "CRA", kind: "abbreviation" }] }),
          occ("Director of Clinical Operations", "Leads clinical trial operations across a portfolio of studies.", ["Clinical Trial Design", "People Management"], "management", { remoteFriendliness: 0.4 }),
        ],
      },
    ]),
    sub("Behavioral and Allied Health", "Mental health and allied health services.", [
      {
        name: "Behavioral Health",
        description: "Mental and behavioral health care.",
        occupations: [
          occ("Clinical Psychologist", "Diagnoses and treats mental health conditions.", ["Patient Care"], "full", { remoteFriendliness: 0.4 }),
          occ("Licensed Therapist", "Provides talk therapy and counseling services.", ["Patient Care"], "full", { remoteFriendliness: 0.45 }),
          occ("Behavioral Health Program Manager", "Manages behavioral health programs and staff.", ["Patient Care", "People Management"], "management", { remoteFriendliness: 0.3 }),
        ],
      },
      {
        name: "Allied Health",
        description: "Diagnostic and therapeutic support services.",
        occupations: [
          occ("Physical Therapist", "Helps patients recover movement and manage pain.", ["Patient Care"], "full", { remoteFriendliness: 0.1 }),
          occ("Pharmacist", "Dispenses medication and advises on drug therapy.", ["Pharmacology", "Patient Care"], "full", { remoteFriendliness: 0.15 }),
          occ("Medical Laboratory Scientist", "Performs diagnostic tests on clinical specimens.", ["Laboratory Techniques"], "ic", { remoteFriendliness: 0.05 }),
        ],
      },
    ]),
  ],
};

// ---------------------------------------------------------------------------
// 8. Cybersecurity
// ---------------------------------------------------------------------------
const cybersecurity: IndustryTaxonomySeed = {
  industrySlug: "cybersecurity",
  subindustries: [
    sub("Security Operations", "Detecting and responding to security threats.", [
      {
        name: "Security Operations",
        description: "Monitoring and responding to security incidents.",
        occupations: [
          occ("Security Analyst", "Monitors systems and investigates security alerts.", ["Security Operations", "Incident Response"], "ic", { remoteFriendliness: 0.6 }),
          occ("Incident Response Engineer", "Leads response and remediation for security incidents.", ["Incident Response", "Threat Intelligence"], "ic", { remoteFriendliness: 0.55 }),
          occ("SOC Manager", "Manages a security operations center team.", ["Security Operations", "People Management"], "management", { remoteFriendliness: 0.5 }),
        ],
      },
      {
        name: "Threat Intelligence",
        description: "Researching and tracking adversary threats.",
        occupations: [
          occ("Threat Intelligence Analyst", "Researches and tracks emerging cyber threats.", ["Threat Intelligence", "Security Operations"], "ic", { remoteFriendliness: 0.6 }),
          occ("Malware Analyst", "Reverse-engineers and analyzes malicious software.", ["Threat Intelligence", "Application Security"], "ic", { remoteFriendliness: 0.55 }),
          occ("Director of Threat Intelligence", "Leads a threat intelligence program.", ["Threat Intelligence", "Strategic Planning"], "management", { remoteFriendliness: 0.5 }),
        ],
      },
    ]),
    sub("Offensive Security", "Proactively testing security defenses.", [
      {
        name: "Penetration Testing",
        description: "Proactively identifying security vulnerabilities.",
        occupations: [
          occ("Penetration Tester", "Simulates attacks to find security vulnerabilities.", ["Penetration Testing", "Application Security"], "ic", { remoteFriendliness: 0.55, aliases: [{ alias: "Pentester", kind: "synonym" }] }),
          occ("Red Team Operator", "Conducts adversary-simulation exercises against an organization.", ["Penetration Testing", "Threat Intelligence"], "ic", { remoteFriendliness: 0.5 }),
          occ("Vulnerability Researcher", "Discovers and documents new software vulnerabilities.", ["Application Security", "Penetration Testing"], "ic", { remoteFriendliness: 0.6 }),
        ],
      },
    ]),
    sub("Security Architecture and Engineering", "Building secure systems and infrastructure.", [
      {
        name: "Security Engineering",
        description: "Designing and building secure systems.",
        occupations: [
          occ("Security Engineer", "Builds and maintains security tooling and controls.", ["Application Security", "Cloud Security"], "ic", { remoteFriendliness: 0.65 }),
          occ("Cloud Security Engineer", "Secures cloud infrastructure and workloads.", ["Cloud Security", "AWS", "Terraform"], "ic", { remoteFriendliness: 0.7 }),
          occ("Security Architect", "Designs security architecture across an organization.", ["System Design", "Cloud Security"], "full", { remoteFriendliness: 0.55 }),
        ],
      },
      {
        name: "Identity and Access",
        description: "Managing who can access what.",
        occupations: [
          occ("IAM Engineer", "Builds and manages identity and access management systems.", ["Identity & Access Management", "Cloud Security"], "ic", { remoteFriendliness: 0.65 }),
          occ("Cryptography Engineer", "Designs and implements cryptographic systems.", ["Cryptography", "Application Security"], "ic", { remoteFriendliness: 0.6 }),
          occ("Zero Trust Architect", "Designs zero-trust network and access architectures.", ["Identity & Access Management", "System Design"], "full", { remoteFriendliness: 0.55 }),
        ],
      },
    ]),
    sub("Governance, Risk, and Compliance", "Managing security risk and regulatory compliance.", [
      {
        name: "Security GRC",
        description: "Managing security governance, risk, and compliance programs.",
        occupations: [
          occ("GRC Analyst", "Runs risk assessments and compliance audits.", ["Governance, Risk & Compliance (GRC)", "Regulatory Compliance"], "ic", { remoteFriendliness: 0.65 }),
          occ("Security Compliance Manager", "Manages compliance with security frameworks and regulations.", ["Governance, Risk & Compliance (GRC)", "People Management"], "management", { remoteFriendliness: 0.55 }),
          occ("Chief Information Security Officer", "Owns enterprise security strategy at the executive level.", ["Strategic Planning", "Governance, Risk & Compliance (GRC)"], "executive", { remoteFriendliness: 0.4, aliases: [{ alias: "CISO", kind: "abbreviation" }] }),
        ],
      },
    ]),
    sub("Security Leadership", "Leading security organizations.", [
      {
        name: "Security Management",
        description: "Managing security engineering and operations teams.",
        occupations: [
          occ("Security Engineering Manager", "Manages a team of security engineers.", ["People Management", "Application Security"], "management", { remoteFriendliness: 0.55 }),
          occ("VP of Security", "Owns security strategy across the organization.", ["Strategic Planning", "People Management"], "executive", { remoteFriendliness: 0.45 }),
          occ("Director of Product Security", "Owns the security of an organization's product line.", ["Application Security", "Strategic Planning"], "management", { remoteFriendliness: 0.5 }),
        ],
      },
    ]),
  ],
};

export const FEATURED_TAXONOMY: IndustryTaxonomySeed[] = [
  technology,
  ai,
  data,
  financialServices,
  quant,
  consulting,
  healthcare,
  cybersecurity,
];
