export interface PitchSubmission {
  id: string;
  createdAt: string;
  updatedAt: string;
  founderName: string;
  founderEmail: string;
  founderLinkedin: string | null;
  coFounders: string | null;
  companyName: string;
  companyWebsite: string | null;
  companyLocation: string;
  foundedYear: number | null;
  oneLiner: string;
  description: string;
  market: string;
  industry: string;
  stage: string;
  arr: string;
  totalRaised: string;
  teamSize: string;
  pitchDeckUrl: string;
  howHeard: string | null;
  status: SubmissionStatus;
  notes: string | null;
  reviewedAt: string | null;
}

export interface PitchSubmissionCreate {
  founderName: string;
  founderEmail: string;
  founderLinkedin?: string;
  coFounders?: string;
  companyName: string;
  companyWebsite?: string;
  companyLocation: string;
  foundedYear?: number;
  oneLiner: string;
  description: string;
  market: string;
  industry: string;
  stage: string;
  arr: string;
  totalRaised: string;
  teamSize: string;
  pitchDeckUrl: string;
  howHeard?: string;
}

export interface PitchSubmissionUpdate {
  status?: SubmissionStatus;
  notes?: string;
}

export const ARR_OPTIONS = [
  'Pre-revenue',
  '$1 – $10K',
  '$10K – $50K',
  '$50K – $100K',
  '$100K – $500K',
  '$500K – $1M',
  '$1M – $5M',
  '$5M – $10M',
  '$10M+',
];

export const STAGE_OPTIONS = [
  'Idea / Pre-product',
  'MVP / Early traction',
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B+',
];

export const INDUSTRY_OPTIONS = [
  'AI / ML',
  'B2B SaaS',
  'Consumer',
  'Fintech',
  'Healthcare / Biotech',
  'Climate / Cleantech',
  'Crypto / Web3',
  'E-commerce',
  'Edtech',
  'Enterprise Software',
  'Hardware',
  'Marketplace',
  'Media / Content',
  'Real Estate / Proptech',
  'Security / Cybersecurity',
  'Other',
];

export const MARKET_OPTIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East & Africa',
  'Global',
];

export const TOTAL_RAISED_OPTIONS = [
  'None / Bootstrapped',
  'Under $500K',
  '$500K – $1M',
  '$1M – $2M',
  '$2M – $5M',
  '$5M – $10M',
  '$10M+',
];

export const TEAM_SIZE_OPTIONS = [
  '1 (Solo founder)',
  '2 – 5',
  '6 – 10',
  '11 – 25',
  '26 – 50',
  '50+',
];

export const HOW_HEARD_OPTIONS = [
  'LinkedIn',
  'Twitter / X',
  'Friend / colleague referral',
  'Portfolio company referral',
  'Conference / event',
  'Cold outreach',
  'Other',
];

export const STATUS_OPTIONS = ['pending', 'interested', 'follow_up', 'pass'] as const;
export type SubmissionStatus = typeof STATUS_OPTIONS[number];

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: 'Pending',
  interested: 'Interested',
  follow_up: 'Follow Up',
  pass: 'Pass',
};

export const STATUS_COLORS: Record<SubmissionStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  interested: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  follow_up: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  pass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};
