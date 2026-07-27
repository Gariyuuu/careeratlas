import type { IndustryCategory, IndustrySeed } from "./industries";
import type {
  IndustryTaxonomySeed,
  JobFamilySeed,
  OccupationSeed,
  SeniorityTrack,
  SubindustrySeed,
} from "./taxonomy-types";

// Generic (non-featured) industries get a programmatically generated
// taxonomy: 4 subindustries x 2 job families x 3 occupations = 24 roles per
// industry. Content varies by IndustryCategory so the resulting titles and
// skills stay plausible, while the industry name is interpolated so every
// industry gets distinct role titles. This keeps 42 industries' worth of
// taxonomy maintainable in one generator instead of ~1,000 hand-typed rows.

interface RoleTemplate {
  title: (industry: string) => string;
  summary: (industry: string) => string;
  skills: string[];
  track: SeniorityTrack;
  automationExposure: number;
  remoteFriendliness: number;
}

interface FamilyTemplate {
  name: (industry: string) => string;
  description: (industry: string) => string;
  roles: RoleTemplate[];
}

interface ArchetypeTemplate {
  subName: (industry: string) => string;
  subDescription: (industry: string) => string;
  families: FamilyTemplate[]; // exactly 2
}

const MGMT_SKILLS = ["People Management", "Strategic Planning", "Budgeting & Forecasting", "Stakeholder Management"];
const BIZ_SKILLS = ["Process Improvement", "Project Management", "Cross-functional Collaboration"];

function role(
  title: RoleTemplate["title"],
  summary: RoleTemplate["summary"],
  skills: string[],
  track: SeniorityTrack,
  automationExposure = 0.3,
  remoteFriendliness = 0.5,
): RoleTemplate {
  return { title, summary, skills, track, automationExposure, remoteFriendliness };
}

// Builds the standard 3-role ladder for an individual-contributor family:
// analyst -> specialist -> manager.
function icFamily(
  name: (i: string) => string,
  desc: (i: string) => string,
  analystTitle: (i: string) => string,
  specialistTitle: (i: string) => string,
  managerTitle: (i: string) => string,
  skills: string[],
  opts?: { automationExposure?: number; remoteFriendliness?: number },
): FamilyTemplate {
  const auto = opts?.automationExposure ?? 0.3;
  const remote = opts?.remoteFriendliness ?? 0.5;
  return {
    name,
    description: desc,
    roles: [
      role(analystTitle, (i) => `Supports ${desc(i).toLowerCase()}`, skills, "ic", auto, remote),
      role(specialistTitle, (i) => `Leads specialized work in ${desc(i).toLowerCase()}`, skills, "ic", auto - 0.05, remote),
      role(managerTitle, (i) => `Manages a team responsible for ${desc(i).toLowerCase()}`, [...MGMT_SKILLS.slice(0, 2), ...skills.slice(0, 1)], "management", Math.max(auto - 0.15, 0.05), remote - 0.05),
    ],
  };
}

const CATEGORY_ARCHETYPES: Record<IndustryCategory, ArchetypeTemplate[]> = {
  technology: [
    {
      subName: (i) => `${i} Engineering`,
      subDescription: (i) => `Building and maintaining ${i.toLowerCase()} systems and products.`,
      families: [
        icFamily(
          (i) => `${i} Systems Engineering`,
          (i) => `engineering ${i.toLowerCase()} systems`,
          (i) => `${i} Engineer`,
          (i) => `Senior ${i} Systems Engineer`,
          (i) => `Engineering Manager, ${i}`,
          ["System Design", "Embedded Systems", "Python"],
          { remoteFriendliness: 0.5, automationExposure: 0.2 },
        ),
        icFamily(
          (i) => `${i} Product and Program Management`,
          (i) => `defining product and program roadmaps for ${i.toLowerCase()}`,
          (i) => `${i} Program Coordinator`,
          (i) => `${i} Product Manager`,
          (i) => `Director of Product, ${i}`,
          ["Product Strategy", "Program Management", "Roadmapping"],
          { remoteFriendliness: 0.55 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Operations`,
      subDescription: (i) => `Running the operational and manufacturing side of ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Manufacturing and Test`,
          (i) => `manufacturing and testing ${i.toLowerCase()} products`,
          (i) => `${i} Test Technician`,
          (i) => `${i} Manufacturing Engineer`,
          (i) => `Manufacturing Operations Manager, ${i}`,
          ["Quality Assurance", "Process Improvement", "CAD"],
          { remoteFriendliness: 0.15, automationExposure: 0.45 },
        ),
        icFamily(
          (i) => `${i} Sales and Business Development`,
          (i) => `selling and growing ${i.toLowerCase()} accounts`,
          (i) => `${i} Sales Development Representative`,
          (i) => `${i} Account Executive`,
          (i) => `Director of Sales, ${i}`,
          ["B2B Sales", "Account Management", "CRM Administration"],
          { remoteFriendliness: 0.6 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Data and Analytics`,
      subDescription: (i) => `Applying data and analytics to ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Data and Insights`,
          (i) => `analyzing usage and performance data for ${i.toLowerCase()}`,
          (i) => `${i} Data Analyst`,
          (i) => `${i} Data Engineer`,
          (i) => `Analytics Manager, ${i}`,
          ["SQL", "Data Visualization", "Python"],
          { remoteFriendliness: 0.7 },
        ),
        icFamily(
          (i) => `${i} Customer Success and Support`,
          (i) => `helping customers succeed with ${i.toLowerCase()} products`,
          (i) => `${i} Support Engineer`,
          (i) => `${i} Customer Success Manager`,
          (i) => `Director of Customer Success, ${i}`,
          ["Customer Success", "Technical Writing"],
          { remoteFriendliness: 0.65 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Cloud and Platform`,
      subDescription: (i) => `Operating the cloud and platform infrastructure behind ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Cloud Operations`,
          (i) => `operating cloud infrastructure for ${i.toLowerCase()}`,
          (i) => `${i} Cloud Support Engineer`,
          (i) => `${i} Cloud Infrastructure Engineer`,
          (i) => `Cloud Operations Manager, ${i}`,
          ["AWS", "Kubernetes", "Networking"],
          { remoteFriendliness: 0.7 },
        ),
        icFamily(
          (i) => `${i} Security`,
          (i) => `securing systems and data for ${i.toLowerCase()}`,
          (i) => `${i} Security Analyst`,
          (i) => `${i} Security Engineer`,
          (i) => `Director of Security, ${i}`,
          ["Application Security", "Cloud Security"],
          { remoteFriendliness: 0.65 },
        ),
      ],
    },
  ],
  finance: [
    {
      subName: (i) => `${i} Client Services`,
      subDescription: (i) => `Managing client relationships in ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Relationship Management`,
          (i) => `managing client relationships in ${i.toLowerCase()}`,
          (i) => `${i} Client Services Associate`,
          (i) => `${i} Relationship Manager`,
          (i) => `Director of Client Relationships, ${i}`,
          ["Stakeholder Management", "Financial Modeling", "CRM Administration"],
          { remoteFriendliness: 0.45 },
        ),
        icFamily(
          (i) => `${i} Product and Strategy`,
          (i) => `designing ${i.toLowerCase()} products and strategy`,
          (i) => `${i} Product Analyst`,
          (i) => `${i} Product Manager`,
          (i) => `Head of Product, ${i}`,
          ["Product Strategy", "Financial Modeling"],
          { remoteFriendliness: 0.55 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Risk and Underwriting`,
      subDescription: (i) => `Assessing and pricing risk in ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Underwriting`,
          (i) => `underwriting risk in ${i.toLowerCase()}`,
          (i) => `${i} Underwriting Analyst`,
          (i) => `${i} Senior Underwriter`,
          (i) => `Underwriting Manager, ${i}`,
          ["Underwriting", "Risk Management", "Credit Analysis"],
          { remoteFriendliness: 0.45 },
        ),
        icFamily(
          (i) => `${i} Operations`,
          (i) => `running back-office and operational processes for ${i.toLowerCase()}`,
          (i) => `${i} Operations Analyst`,
          (i) => `${i} Operations Specialist`,
          (i) => `Operations Manager, ${i}`,
          ["Regulatory Compliance", "Process Improvement"],
          { remoteFriendliness: 0.5, automationExposure: 0.4 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Corporate Functions`,
      subDescription: (i) => `Finance and corporate support for ${i.toLowerCase()} businesses.`,
      families: [
        icFamily(
          (i) => `${i} Finance`,
          (i) => `managing financial planning for ${i.toLowerCase()} businesses`,
          (i) => `${i} Finance Analyst`,
          (i) => `${i} Finance Manager`,
          (i) => `Director of Finance, ${i}`,
          ["Financial Modeling", "Budgeting & Forecasting"],
          { remoteFriendliness: 0.6 },
        ),
        icFamily(
          (i) => `${i} Actuarial and Analytics`,
          (i) => `quantifying risk and performance for ${i.toLowerCase()}`,
          (i) => `${i} Actuarial Analyst`,
          (i) => `${i} Pricing Analyst`,
          (i) => `Director of Actuarial Services, ${i}`,
          ["Actuarial Science", "Statistical Modeling"],
          { remoteFriendliness: 0.55 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Distribution and Sales`,
      subDescription: (i) => `Distributing and selling ${i.toLowerCase()} products.`,
      families: [
        icFamily(
          (i) => `${i} Sales`,
          (i) => `selling ${i.toLowerCase()} products to clients`,
          (i) => `${i} Sales Associate`,
          (i) => `${i} Sales Manager`,
          (i) => `Director of Sales, ${i}`,
          ["B2B Sales", "Account Management"],
          { remoteFriendliness: 0.45 },
        ),
        icFamily(
          (i) => `${i} Marketing`,
          (i) => `marketing ${i.toLowerCase()} products and services`,
          (i) => `${i} Marketing Analyst`,
          (i) => `${i} Marketing Manager`,
          (i) => `Director of Marketing, ${i}`,
          ["Digital Marketing", "Brand Management"],
          { remoteFriendliness: 0.6 },
        ),
      ],
    },
  ],
  "professional-services": [
    {
      subName: (i) => `${i} Advisory`,
      subDescription: (i) => `Advising clients on ${i.toLowerCase()} matters.`,
      families: [
        icFamily(
          (i) => `${i} Client Advisory`,
          (i) => `advising clients on ${i.toLowerCase()}`,
          (i) => `${i} Associate`,
          (i) => `${i} Senior Associate`,
          (i) => `${i} Practice Director`,
          ["Stakeholder Management", "Requirements Gathering"],
          { remoteFriendliness: 0.5 },
        ),
        icFamily(
          (i) => `${i} Delivery`,
          (i) => `delivering ${i.toLowerCase()} engagements and services`,
          (i) => `${i} Delivery Analyst`,
          (i) => `${i} Delivery Lead`,
          (i) => `Director of Delivery, ${i}`,
          ["Project Management", "Process Improvement"],
          { remoteFriendliness: 0.5 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Business Development`,
      subDescription: (i) => `Growing ${i.toLowerCase()} client relationships and revenue.`,
      families: [
        icFamily(
          (i) => `${i} Business Development`,
          (i) => `winning new ${i.toLowerCase()} business`,
          (i) => `${i} Business Development Associate`,
          (i) => `${i} Business Development Manager`,
          (i) => `Head of Business Development, ${i}`,
          ["B2B Sales", "Negotiation"],
          { remoteFriendliness: 0.55 },
        ),
        icFamily(
          (i) => `${i} Practice Operations`,
          (i) => `running the operational side of an ${i.toLowerCase()} practice`,
          (i) => `${i} Practice Coordinator`,
          (i) => `${i} Practice Operations Specialist`,
          (i) => `Practice Operations Director, ${i}`,
          ["Process Improvement", "Budgeting & Forecasting"],
          { remoteFriendliness: 0.55 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Analytics and Insights`,
      subDescription: (i) => `Applying data to improve ${i.toLowerCase()} engagements.`,
      families: [
        icFamily(
          (i) => `${i} Analytics`,
          (i) => `analyzing engagement performance and outcomes for ${i.toLowerCase()}`,
          (i) => `${i} Analytics Associate`,
          (i) => `${i} Analytics Consultant`,
          (i) => `Director of Analytics, ${i}`,
          ["Data Storytelling", "Business Intelligence"],
          { remoteFriendliness: 0.6 },
        ),
        icFamily(
          (i) => `${i} Knowledge Management`,
          (i) => `curating institutional knowledge for ${i.toLowerCase()}`,
          (i) => `${i} Knowledge Management Associate`,
          (i) => `${i} Knowledge Manager`,
          (i) => `Director of Knowledge Management, ${i}`,
          ["Technical Writing", "Process Improvement"],
          { remoteFriendliness: 0.65 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Talent and People Operations`,
      subDescription: (i) => `Recruiting and developing talent for ${i.toLowerCase()} firms.`,
      families: [
        icFamily(
          (i) => `${i} Talent Acquisition`,
          (i) => `recruiting talent for ${i.toLowerCase()} firms`,
          (i) => `${i} Recruiting Coordinator`,
          (i) => `${i} Recruiter`,
          (i) => `Director of Talent Acquisition, ${i}`,
          ["Recruiting", "Stakeholder Management"],
          { remoteFriendliness: 0.6 },
        ),
        icFamily(
          (i) => `${i} People Operations`,
          (i) => `running people programs for ${i.toLowerCase()} firms`,
          (i) => `${i} People Operations Coordinator`,
          (i) => `${i} People Operations Manager`,
          (i) => `Director of People, ${i}`,
          ["Talent Development", "Performance Management"],
          { remoteFriendliness: 0.6 },
        ),
      ],
    },
  ],
  "healthcare-science": [
    {
      subName: (i) => `${i} Research and Development`,
      subDescription: (i) => `Researching and developing new ${i.toLowerCase()} products.`,
      families: [
        icFamily(
          (i) => `${i} Research`,
          (i) => `researching new ${i.toLowerCase()} products and therapies`,
          (i) => `${i} Research Associate`,
          (i) => `${i} Research Scientist`,
          (i) => `Director of Research, ${i}`,
          ["Clinical Trial Design", "Laboratory Techniques", "Biostatistics"],
          { remoteFriendliness: 0.25 },
        ),
        icFamily(
          (i) => `${i} Regulatory and Quality`,
          (i) => `ensuring regulatory and quality compliance for ${i.toLowerCase()}`,
          (i) => `${i} Regulatory Affairs Associate`,
          (i) => `${i} Regulatory Affairs Specialist`,
          (i) => `Director of Regulatory Affairs, ${i}`,
          ["Regulatory Affairs (FDA)", "Quality Assurance"],
          { remoteFriendliness: 0.45 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Commercial and Operations`,
      subDescription: (i) => `Bringing ${i.toLowerCase()} products to market.`,
      families: [
        icFamily(
          (i) => `${i} Market Access`,
          (i) => `bringing ${i.toLowerCase()} products to market`,
          (i) => `${i} Market Access Analyst`,
          (i) => `${i} Market Access Manager`,
          (i) => `Director of Market Access, ${i}`,
          ["Regulatory Compliance", "Data Storytelling"],
          { remoteFriendliness: 0.5 },
        ),
        icFamily(
          (i) => `${i} Manufacturing Operations`,
          (i) => `manufacturing ${i.toLowerCase()} products at scale`,
          (i) => `${i} Manufacturing Associate`,
          (i) => `${i} Process Engineer`,
          (i) => `Plant Manager, ${i}`,
          ["Quality Assurance", "Lean Manufacturing"],
          { remoteFriendliness: 0.1, automationExposure: 0.45 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Clinical Affairs`,
      subDescription: (i) => `Connecting ${i.toLowerCase()} products to clinical practice.`,
      families: [
        icFamily(
          (i) => `${i} Medical Affairs`,
          (i) => `communicating clinical evidence for ${i.toLowerCase()} products`,
          (i) => `${i} Medical Affairs Associate`,
          (i) => `${i} Medical Science Liaison`,
          (i) => `Director of Medical Affairs, ${i}`,
          ["Clinical Trial Design", "Technical Writing"],
          { remoteFriendliness: 0.45 },
        ),
        icFamily(
          (i) => `${i} Patient Safety`,
          (i) => `monitoring the safety of ${i.toLowerCase()} products`,
          (i) => `${i} Pharmacovigilance Associate`,
          (i) => `${i} Patient Safety Specialist`,
          (i) => `Director of Patient Safety, ${i}`,
          ["Regulatory Affairs (FDA)", "Biostatistics"],
          { remoteFriendliness: 0.5 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Data and Analytics`,
      subDescription: (i) => `Applying data science to ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Bioinformatics`,
          (i) => `analyzing biological and clinical data for ${i.toLowerCase()}`,
          (i) => `${i} Bioinformatics Analyst`,
          (i) => `${i} Bioinformatics Scientist`,
          (i) => `Director of Bioinformatics, ${i}`,
          ["Bioinformatics", "Genomics", "Python"],
          { remoteFriendliness: 0.6 },
        ),
        icFamily(
          (i) => `${i} Health Economics`,
          (i) => `demonstrating the economic value of ${i.toLowerCase()} products`,
          (i) => `${i} Health Economics Analyst`,
          (i) => `${i} Health Economics and Outcomes Researcher`,
          (i) => `Director of Health Economics, ${i}`,
          ["Statistical Modeling", "Econometrics"],
          { remoteFriendliness: 0.6 },
        ),
      ],
    },
  ],
  "public-education": [
    {
      subName: (i) => `${i} Program Management`,
      subDescription: (i) => `Running programs within ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Program Delivery`,
          (i) => `delivering programs in ${i.toLowerCase()}`,
          (i) => `${i} Program Coordinator`,
          (i) => `${i} Program Manager`,
          (i) => `Director of Programs, ${i}`,
          ["Program Management", "Stakeholder Management"],
          { remoteFriendliness: 0.5 },
        ),
        icFamily(
          (i) => `${i} Policy and Research`,
          (i) => `researching policy questions in ${i.toLowerCase()}`,
          (i) => `${i} Policy Analyst`,
          (i) => `${i} Senior Policy Analyst`,
          (i) => `Director of Policy, ${i}`,
          ["Statistical Modeling", "Technical Writing"],
          { remoteFriendliness: 0.55 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Administration`,
      subDescription: (i) => `Administering ${i.toLowerCase()} organizations.`,
      families: [
        icFamily(
          (i) => `${i} Operations and Administration`,
          (i) => `running day-to-day operations for ${i.toLowerCase()} organizations`,
          (i) => `${i} Administrative Coordinator`,
          (i) => `${i} Operations Specialist`,
          (i) => `Director of Operations, ${i}`,
          ["Process Improvement", "Budgeting & Forecasting"],
          { remoteFriendliness: 0.45 },
        ),
        icFamily(
          (i) => `${i} Development and Outreach`,
          (i) => `fundraising and community outreach for ${i.toLowerCase()}`,
          (i) => `${i} Outreach Coordinator`,
          (i) => `${i} Development Officer`,
          (i) => `Director of Development, ${i}`,
          ["Public Relations", "Stakeholder Management"],
          { remoteFriendliness: 0.55 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Communications and Engagement`,
      subDescription: (i) => `Communicating and engaging stakeholders in ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Communications`,
          (i) => `communicating ${i.toLowerCase()} work to the public`,
          (i) => `${i} Communications Associate`,
          (i) => `${i} Communications Manager`,
          (i) => `Director of Communications, ${i}`,
          ["Public Relations", "Content Strategy"],
          { remoteFriendliness: 0.6 },
        ),
        icFamily(
          (i) => `${i} Community Engagement`,
          (i) => `engaging communities and stakeholders in ${i.toLowerCase()}`,
          (i) => `${i} Community Engagement Coordinator`,
          (i) => `${i} Community Engagement Manager`,
          (i) => `Director of Community Engagement, ${i}`,
          ["Stakeholder Management", "Public Speaking"],
          { remoteFriendliness: 0.45 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Data and Evaluation`,
      subDescription: (i) => `Measuring the impact of ${i.toLowerCase()} programs.`,
      families: [
        icFamily(
          (i) => `${i} Monitoring and Evaluation`,
          (i) => `measuring the impact of ${i.toLowerCase()} programs`,
          (i) => `${i} Evaluation Associate`,
          (i) => `${i} Evaluation Manager`,
          (i) => `Director of Evaluation, ${i}`,
          ["Statistical Modeling", "Data Storytelling"],
          { remoteFriendliness: 0.6 },
        ),
        icFamily(
          (i) => `${i} Grants and Funding`,
          (i) => `securing and managing funding for ${i.toLowerCase()} programs`,
          (i) => `${i} Grants Associate`,
          (i) => `${i} Grants Manager`,
          (i) => `Director of Grants, ${i}`,
          ["Budgeting & Forecasting", "Technical Writing"],
          { remoteFriendliness: 0.55 },
        ),
      ],
    },
  ],
  "industrial-energy": [
    {
      subName: (i) => `${i} Engineering`,
      subDescription: (i) => `Engineering roles within ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Field and Process Engineering`,
          (i) => `engineering field and process systems for ${i.toLowerCase()}`,
          (i) => `${i} Field Engineer`,
          (i) => `${i} Process Engineer`,
          (i) => `Engineering Manager, ${i}`,
          ["CAD", "Structural Analysis", "Process Improvement"],
          { remoteFriendliness: 0.1, automationExposure: 0.3 },
        ),
        icFamily(
          (i) => `${i} Project Management`,
          (i) => `managing capital projects in ${i.toLowerCase()}`,
          (i) => `${i} Project Coordinator`,
          (i) => `${i} Project Engineer`,
          (i) => `Director of Projects, ${i}`,
          ["Project Management", "Budgeting & Forecasting"],
          { remoteFriendliness: 0.25 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Operations and Supply Chain`,
      subDescription: (i) => `Operating and supplying ${i.toLowerCase()} facilities.`,
      families: [
        icFamily(
          (i) => `${i} Plant Operations`,
          (i) => `operating ${i.toLowerCase()} facilities`,
          (i) => `${i} Operations Technician`,
          (i) => `${i} Operations Supervisor`,
          (i) => `Plant Operations Manager, ${i}`,
          ["Quality Assurance", "Equipment Maintenance"],
          { remoteFriendliness: 0.05, automationExposure: 0.4 },
        ),
        icFamily(
          (i) => `${i} Supply Chain and Procurement`,
          (i) => `managing supply chain and procurement for ${i.toLowerCase()}`,
          (i) => `${i} Supply Chain Analyst`,
          (i) => `${i} Procurement Specialist`,
          (i) => `Director of Supply Chain, ${i}`,
          ["Supply Chain Management", "Procurement", "Demand Forecasting"],
          { remoteFriendliness: 0.4 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Quality and Safety`,
      subDescription: (i) => `Ensuring quality and safety across ${i.toLowerCase()} operations.`,
      families: [
        icFamily(
          (i) => `${i} Quality Assurance`,
          (i) => `assuring product and process quality for ${i.toLowerCase()}`,
          (i) => `${i} Quality Technician`,
          (i) => `${i} Quality Engineer`,
          (i) => `Director of Quality, ${i}`,
          ["Quality Assurance", "Six Sigma"],
          { remoteFriendliness: 0.1 },
        ),
        icFamily(
          (i) => `${i} Environmental Health and Safety`,
          (i) => `managing workplace safety for ${i.toLowerCase()}`,
          (i) => `${i} Safety Coordinator`,
          (i) => `${i} Safety Engineer`,
          (i) => `Director of Environmental Health and Safety, ${i}`,
          ["Governance, Risk & Compliance (GRC)", "Process Improvement"],
          { remoteFriendliness: 0.1 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Sales and Commercial`,
      subDescription: (i) => `Selling and commercializing ${i.toLowerCase()} products and services.`,
      families: [
        icFamily(
          (i) => `${i} Commercial Sales`,
          (i) => `selling ${i.toLowerCase()} products to commercial customers`,
          (i) => `${i} Sales Representative`,
          (i) => `${i} Key Account Manager`,
          (i) => `Director of Sales, ${i}`,
          ["B2B Sales", "Account Management"],
          { remoteFriendliness: 0.3 },
        ),
        icFamily(
          (i) => `${i} Commercial Analytics`,
          (i) => `analyzing commercial performance for ${i.toLowerCase()}`,
          (i) => `${i} Commercial Analyst`,
          (i) => `${i} Pricing Analyst`,
          (i) => `Director of Commercial Analytics, ${i}`,
          ["Business Intelligence", "Financial Modeling"],
          { remoteFriendliness: 0.55 },
        ),
      ],
    },
  ],
  "consumer-retail": [
    {
      subName: (i) => `${i} Merchandising`,
      subDescription: (i) => `Planning and buying product assortments for ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Merchandising and Category Management`,
          (i) => `managing product categories for ${i.toLowerCase()}`,
          (i) => `${i} Merchandising Assistant`,
          (i) => `${i} Category Manager`,
          (i) => `Director of Merchandising, ${i}`,
          ["Demand Forecasting", "Vendor Management"],
          { remoteFriendliness: 0.35 },
        ),
        icFamily(
          (i) => `${i} Marketing and Growth`,
          (i) => `growing brand and customer demand for ${i.toLowerCase()}`,
          (i) => `${i} Marketing Coordinator`,
          (i) => `${i} Growth Marketing Manager`,
          (i) => `Director of Marketing, ${i}`,
          ["Digital Marketing", "Marketing Analytics", "Brand Management"],
          { remoteFriendliness: 0.6 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Operations`,
      subDescription: (i) => `Running store, warehouse, and logistics operations for ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Store and Operations Management`,
          (i) => `managing day-to-day operations for ${i.toLowerCase()}`,
          (i) => `${i} Operations Associate`,
          (i) => `${i} Operations Manager`,
          (i) => `Regional Director of Operations, ${i}`,
          ["Process Improvement", "Inventory Management"],
          { remoteFriendliness: 0.1 },
        ),
        icFamily(
          (i) => `${i} Supply Chain and Logistics`,
          (i) => `moving products through the supply chain for ${i.toLowerCase()}`,
          (i) => `${i} Logistics Coordinator`,
          (i) => `${i} Supply Chain Planner`,
          (i) => `Director of Logistics, ${i}`,
          ["Logistics Planning", "Warehouse Management"],
          { remoteFriendliness: 0.35 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Digital and E-commerce`,
      subDescription: (i) => `Running digital and e-commerce channels for ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} E-commerce`,
          (i) => `running online sales channels for ${i.toLowerCase()}`,
          (i) => `${i} E-commerce Coordinator`,
          (i) => `${i} E-commerce Manager`,
          (i) => `Director of E-commerce, ${i}`,
          ["SEO", "Marketing Analytics"],
          { remoteFriendliness: 0.75 },
        ),
        icFamily(
          (i) => `${i} Digital Product`,
          (i) => `building digital products and experiences for ${i.toLowerCase()}`,
          (i) => `${i} Digital Product Analyst`,
          (i) => `${i} Digital Product Manager`,
          (i) => `Director of Digital Product, ${i}`,
          ["Product Strategy", "UX Design"],
          { remoteFriendliness: 0.75 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Finance and Analytics`,
      subDescription: (i) => `Managing finance and performance analytics for ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Financial Planning`,
          (i) => `planning and forecasting for ${i.toLowerCase()} businesses`,
          (i) => `${i} FP&A Analyst`,
          (i) => `${i} Finance Manager`,
          (i) => `Director of Finance, ${i}`,
          ["Budgeting & Forecasting", "Financial Modeling"],
          { remoteFriendliness: 0.6 },
        ),
        icFamily(
          (i) => `${i} Performance Analytics`,
          (i) => `tracking business performance for ${i.toLowerCase()}`,
          (i) => `${i} Business Analyst`,
          (i) => `${i} Insights Manager`,
          (i) => `Director of Analytics, ${i}`,
          ["Business Intelligence", "Data Visualization"],
          { remoteFriendliness: 0.65 },
        ),
      ],
    },
  ],
  "creative-media": [
    {
      subName: (i) => `${i} Creative and Production`,
      subDescription: (i) => `Creating and producing content for ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Creative Production`,
          (i) => `producing creative content for ${i.toLowerCase()}`,
          (i) => `${i} Production Coordinator`,
          (i) => `${i} Producer`,
          (i) => `Creative Director, ${i}`,
          ["Video Production", "Content Strategy"],
          { remoteFriendliness: 0.55 },
        ),
        icFamily(
          (i) => `${i} Design`,
          (i) => `designing experiences and visuals for ${i.toLowerCase()}`,
          (i) => `${i} Design Assistant`,
          (i) => `${i} Designer`,
          (i) => `Head of Design, ${i}`,
          ["UI Design", "3D Modeling"],
          { remoteFriendliness: 0.65 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Marketing and Business`,
      subDescription: (i) => `Growing audiences and revenue for ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Audience Growth`,
          (i) => `growing audiences for ${i.toLowerCase()}`,
          (i) => `${i} Community Coordinator`,
          (i) => `${i} Audience Growth Manager`,
          (i) => `Director of Audience, ${i}`,
          ["Social Media Strategy", "Marketing Analytics"],
          { remoteFriendliness: 0.75 },
        ),
        icFamily(
          (i) => `${i} Business Operations`,
          (i) => `running the business side of ${i.toLowerCase()}`,
          (i) => `${i} Business Operations Analyst`,
          (i) => `${i} Business Operations Manager`,
          (i) => `Director of Business Operations, ${i}`,
          ["Budgeting & Forecasting", "Process Improvement"],
          { remoteFriendliness: 0.6 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Technology and Platform`,
      subDescription: (i) => `Building the technology platform behind ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Platform Engineering`,
          (i) => `building platform software for ${i.toLowerCase()}`,
          (i) => `${i} Software Engineer`,
          (i) => `${i} Platform Engineer`,
          (i) => `Engineering Manager, ${i}`,
          ["JavaScript", "System Design"],
          { remoteFriendliness: 0.75 },
        ),
        icFamily(
          (i) => `${i} Data and Analytics`,
          (i) => `analyzing audience and performance data for ${i.toLowerCase()}`,
          (i) => `${i} Data Analyst`,
          (i) => `${i} Analytics Manager`,
          (i) => `Director of Analytics, ${i}`,
          ["SQL", "Data Visualization"],
          { remoteFriendliness: 0.75 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Partnerships and Sales`,
      subDescription: (i) => `Building commercial partnerships for ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Partnerships`,
          (i) => `building strategic partnerships for ${i.toLowerCase()}`,
          (i) => `${i} Partnerships Coordinator`,
          (i) => `${i} Partnerships Manager`,
          (i) => `Director of Partnerships, ${i}`,
          ["Negotiation", "Stakeholder Management"],
          { remoteFriendliness: 0.55 },
        ),
        icFamily(
          (i) => `${i} Advertising Sales`,
          (i) => `selling advertising and sponsorships for ${i.toLowerCase()}`,
          (i) => `${i} Ad Sales Associate`,
          (i) => `${i} Ad Sales Manager`,
          (i) => `Director of Ad Sales, ${i}`,
          ["B2B Sales", "Account Management"],
          { remoteFriendliness: 0.45 },
        ),
      ],
    },
  ],
  "trades-services": [
    {
      subName: (i) => `${i} Field Trades`,
      subDescription: (i) => `Hands-on skilled trade work within ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Field Trades`,
          (i) => `performing skilled trade work in ${i.toLowerCase()}`,
          (i) => `${i} Apprentice`,
          (i) => `${i} Journeyman Tradesperson`,
          (i) => `${i} Crew Supervisor`,
          ["Blueprint Reading", "Equipment Maintenance", "Heavy Machinery Operation"],
          { remoteFriendliness: 0.02, automationExposure: 0.2 },
        ),
        icFamily(
          (i) => `${i} Estimating and Safety`,
          (i) => `estimating and ensuring safety on ${i.toLowerCase()} projects`,
          (i) => `${i} Estimating Assistant`,
          (i) => `${i} Estimator`,
          (i) => `Safety and Compliance Manager, ${i}`,
          ["Blueprint Reading", "Budgeting & Forecasting"],
          { remoteFriendliness: 0.2 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Project Management`,
      subDescription: (i) => `Managing on-site projects for ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Site Management`,
          (i) => `managing on-site work for ${i.toLowerCase()}`,
          (i) => `${i} Site Coordinator`,
          (i) => `${i} Site Superintendent`,
          (i) => `Director of Field Operations, ${i}`,
          ["Project Management", "Blueprint Reading"],
          { remoteFriendliness: 0.05 },
        ),
        icFamily(
          (i) => `${i} Business Development`,
          (i) => `winning and scoping new ${i.toLowerCase()} projects`,
          (i) => `${i} Business Development Associate`,
          (i) => `${i} Business Development Manager`,
          (i) => `Director of Business Development, ${i}`,
          ["B2B Sales", "Negotiation"],
          { remoteFriendliness: 0.4 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Equipment and Technology`,
      subDescription: (i) => `Operating and maintaining equipment for ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Equipment Operations`,
          (i) => `operating specialized equipment for ${i.toLowerCase()}`,
          (i) => `${i} Equipment Operator`,
          (i) => `${i} Lead Equipment Operator`,
          (i) => `Equipment Operations Manager, ${i}`,
          ["Heavy Machinery Operation", "Equipment Maintenance"],
          { remoteFriendliness: 0.02, automationExposure: 0.25 },
        ),
        icFamily(
          (i) => `${i} Technical Support`,
          (i) => `maintaining tools and technology used in ${i.toLowerCase()}`,
          (i) => `${i} Maintenance Technician`,
          (i) => `${i} Lead Maintenance Technician`,
          (i) => `Maintenance Manager, ${i}`,
          ["Equipment Maintenance", "Blueprint Reading"],
          { remoteFriendliness: 0.05 },
        ),
      ],
    },
    {
      subName: (i) => `${i} Customer Service and Sales`,
      subDescription: (i) => `Serving and selling to customers in ${i.toLowerCase()}.`,
      families: [
        icFamily(
          (i) => `${i} Customer Service`,
          (i) => `serving customers for ${i.toLowerCase()} projects`,
          (i) => `${i} Customer Service Representative`,
          (i) => `${i} Customer Service Lead`,
          (i) => `Customer Service Manager, ${i}`,
          ["Stakeholder Management", "Process Improvement"],
          { remoteFriendliness: 0.3 },
        ),
        icFamily(
          (i) => `${i} Residential Sales`,
          (i) => `selling ${i.toLowerCase()} services to homeowners`,
          (i) => `${i} Sales Estimator`,
          (i) => `${i} Sales Consultant`,
          (i) => `Director of Sales, ${i}`,
          ["B2B Sales", "Negotiation"],
          { remoteFriendliness: 0.25 },
        ),
      ],
    },
  ],
};

function toOccupationSeed(t: RoleTemplate, industry: string): OccupationSeed {
  return {
    title: t.title(industry),
    summary: t.summary(industry).replace(/^./, (c) => c.toUpperCase()) + ".",
    skills: [...t.skills, ...BIZ_SKILLS.slice(0, 1)],
    seniorityTrack: t.track,
    automationExposure: t.automationExposure,
    remoteFriendliness: t.remoteFriendliness,
  };
}

function toJobFamilySeed(f: FamilyTemplate, industry: string): JobFamilySeed {
  return {
    name: f.name(industry),
    description: f.description(industry).replace(/^./, (c) => c.toUpperCase()) + ".",
    occupations: f.roles.map((r) => toOccupationSeed(r, industry)),
  };
}

function toSubindustrySeed(a: ArchetypeTemplate, industry: string): SubindustrySeed {
  return {
    name: a.subName(industry),
    description: a.subDescription(industry),
    jobFamilies: a.families.map((f) => toJobFamilySeed(f, industry)),
  };
}

export function buildGenericTaxonomy(nonFeaturedIndustries: IndustrySeed[]): IndustryTaxonomySeed[] {
  return nonFeaturedIndustries.map((industry) => {
    const archetypes = CATEGORY_ARCHETYPES[industry.category];
    return {
      industrySlug: industry.slug,
      subindustries: archetypes.map((a) => toSubindustrySeed(a, industry.name)),
    };
  });
}
