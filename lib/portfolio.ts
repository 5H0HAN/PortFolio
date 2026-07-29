export const profile = {
  name: "Shohan Biswas",
  role: "Google Workspace & Email Infrastructure Specialist",
  supportingRole: "Computer Science and Engineering graduate",
  headline: "I engineer calm into business email.",
  summary:
    "Google Workspace migrations, DNS authentication, and backend tools that keep teams connected.",
  email: "hello@shohanbiswas.com",
  location: "Pabna, Bangladesh",
  availability: "Available for select freelance work",
  personalNote: "Lifelong learner and street photography enthusiast.",
};

export const socialLinks = [
  { label: "GitHub", href: "https://github.com/5H0HAN" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/5h0han/" },
  {
    label: "ResearchGate",
    href: "https://www.researchgate.net/profile/Shohan-Biswas?ev=hdr_xprf",
  },
  { label: "Fiverr", href: "https://www.fiverr.com/theshohan" },
];

export const education = {
  degree: "BSc in Computer Science and Engineering",
  institution: "Pabna University of Science and Technology",
  graduation: "2024",
  hsc: "2016",
  ssc: "2013",
};

export const marketplaceProof = {
  rating: "5.0",
  reviews: "477",
  level: "Level 2",
  experience: "3+ years",
  label: "Fiverr Workspace & Domain Mail specialist",
  href: "https://www.fiverr.com/theshohan",
};

export const services = [
  {
    number: "01",
    title: "Google Workspace Setup",
    promise: "A secure tenant, ready for daily operations.",
    summary:
      "Domain verification, users, access, baseline security, and an organized handoff.",
    deliverables: ["Tenant configuration", "Domain verification", "Admin handoff"],
    timeline: "Typical: 3-7 days",
  },
  {
    number: "02",
    title: "Email Migration",
    promise: "Move mail without losing operational clarity.",
    summary:
      "Structured migrations from cPanel, Zoho, or Microsoft 365 into Google Workspace.",
    deliverables: ["Readiness audit", "Routing cutover", "Post-migration checks"],
    timeline: "Typical: 5-10 days",
  },
  {
    number: "03",
    title: "DNS Authentication",
    promise: "Make legitimate mail easier to trust.",
    summary:
      "SPF, DKIM, and DMARC configuration with practical validation and reporting.",
    deliverables: ["Record audit", "Policy configuration", "Validation report"],
    timeline: "Typical: 1-3 days",
  },
  {
    number: "04",
    title: "Deliverability Repair",
    promise: "Find the weak point in the delivery chain.",
    summary:
      "Routing, authentication, and sender-posture analysis for mail landing in spam or failing.",
    deliverables: ["DNS diagnosis", "Prioritized fixes", "Retest and handoff"],
    timeline: "Typical: 2-5 days",
  },
];

export const projects = [
  {
    number: "01",
    slug: "workspace-dns-checker",
    title: "Workspace DNS Checker",
    category: "Email infrastructure",
    year: "Live tool",
    summary:
      "A read-only diagnostic for Google verification, MX, SPF, DKIM, and DMARC records.",
    outcome: "Turns public DNS into a clear Workspace readiness report.",
    details: ["Custom DKIM selectors", "Scored findings", "Actionable remediation"],
    stack: ["Next.js", "TypeScript", "Google DNS", "Workspace"],
    href: "/tools/workspace-check",
    linkLabel: "Run tool",
  },
  {
    number: "02",
    slug: "mail-deliverability-test",
    title: "Mail Deliverability Test",
    category: "Email infrastructure",
    year: "Live tool",
    summary:
      "A DNS-based assessment of routing and sender-authentication readiness.",
    outcome: "Separates technical DNS posture from real inbox-placement limitations.",
    details: ["MX resolution", "Authentication posture", "Transparent limitations"],
    stack: ["Next.js", "DNS APIs", "SPF", "DKIM", "DMARC"],
    href: "/tools/mail-deliverability",
    linkLabel: "Run test",
  },
  {
    number: "03",
    slug: "ubuntu-automatic-update",
    title: "Ubuntu Automatic Update Script",
    category: "Systems automation",
    year: "Public code",
    summary:
      "A Bash utility that automates package updates for Ubuntu-based Linux distributions.",
    outcome: "Makes routine system maintenance repeatable from a single script.",
    details: ["Ubuntu-based systems", "Automated update flow", "Shell-first utility"],
    stack: ["Shell", "Ubuntu", "Linux", "Automation"],
    href: "https://github.com/5H0HAN/Ubuntu_Autometic_Update_Script",
    linkLabel: "View repository",
  },
  {
    number: "04",
    slug: "digital-image-processing-lab",
    title: "Digital Image Processing Lab",
    category: "Academic engineering",
    year: "Public code",
    summary:
      "Python coursework and experiments from a university digital image processing lab.",
    outcome: "Documents practical image-processing work as reproducible code.",
    details: ["Image-processing exercises", "Python notebooks", "CSE laboratory work"],
    stack: ["Python", "Image Processing", "Jupyter", "Computer Vision"],
    href: "https://github.com/5H0HAN/DIP_Lab",
    linkLabel: "View repository",
  },
  {
    number: "05",
    slug: "java-socket-distribution",
    title: "Java Socket Parallel Distribution",
    category: "Distributed systems",
    year: "Public code",
    summary:
      "Java socket programs created for a parallel distribution course.",
    outcome: "Explores network communication and distributed execution fundamentals.",
    details: ["Socket communication", "Parallel distribution", "Course implementation"],
    stack: ["Java", "Sockets", "Networking", "Distributed Systems"],
    href: "https://github.com/5H0HAN/JavaScoketParallelDistribution",
    linkLabel: "View repository",
  },
];

export const skillGroups = [
  {
    number: "01",
    title: "Workspace & Mail",
    description: "The operational layer I work in most often.",
    items: [
      "Google Workspace administration",
      "Email migration",
      "SPF / DKIM / DMARC",
      "DNS and deliverability audits",
    ],
  },
  {
    number: "02",
    title: "Backend Engineering",
    description: "Tools and services behind reliable workflows.",
    items: ["Node.js", "Python", "API design", "Automation"],
  },
  {
    number: "03",
    title: "Product Development",
    description: "Interfaces that make technical systems usable.",
    items: ["Next.js", "React", "JavaScript", "TypeScript"],
  },
  {
    number: "04",
    title: "Systems & AI",
    description: "Supporting tools for deployment and applied intelligence.",
    items: ["Linux", "Docker", "Git", "PyTorch", "C#", "C++"],
  },
];

export const operatingPrinciples = [
  {
    title: "Diagnose first",
    text: "Map the current mail flow and risk before changing production records.",
  },
  {
    title: "Make changes observable",
    text: "Use repeatable checks so every cutover has a clear before and after.",
  },
  {
    title: "Leave a clean handoff",
    text: "Document the system so the next operator can manage it confidently.",
  },
];
