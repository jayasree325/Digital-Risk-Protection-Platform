export type FindingType = 'social' | 'app' | 'link';
export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export type FindingStatus = 
  | 'New'
  | 'Investigating'
  | 'Likely impersonation'
  | 'Confirmed fake'
  | 'Dismissed'
  | 'Resolved';

export type PlatformType = 
  | 'Instagram'
  | 'LinkedIn'
  | 'X'
  | 'Facebook'
  | 'Telegram'
  | 'Google Play'
  | 'Apple App Store'
  | 'Third-party APK'
  | 'Web Domain';

export interface SignalItem {
  id: string;
  signalType?: string;
  title: string;
  explanation: string;
  strength: 'Critical' | 'High' | 'Medium' | 'Low';
  iconName: 'name' | 'logo' | 'desc' | 'owner' | 'domain' | 'permission' | 'package' | 'redirect';
}

export interface LookalikeDetail {
  official: string;
  candidate: string;
  differenceType: 'added_words' | 'character_variation' | 'typosquat' | 'unauthorized_subdomain';
  highlightedParts: { text: string; isDifferent: boolean; differenceLabel?: string }[];
  explanation: string;
}

export interface ConnectedCampaign {
  campaignName: string;
  candidateProfile: string;
  suspiciousDomain: string;
  relatedMobileApp?: string;
  sharedInfrastructure: string;
  threatLevel: string;
}

export interface EvidenceData {
  evidenceCount?: number;
  source: string;
  rawUrl: string;
  detectedAt: string;
  firstSeen: string;
  lastSeen: string;
  description?: string;
  registrarOrHost?: string;
  sha256Hash: string;
  screenshotLabel: string;
}

export interface TimelineEntry {
  id: string;
  author: string;
  role: string;
  action: string;
  note?: string;
  timestamp: string;
}

export interface Finding {
  id: string;
  companyId?: string;
  isDemo?: boolean;
  title: string;
  type: FindingType;
  platform: PlatformType;
  usernameOrPackage: string;
  candidateUrl: string;
  riskSeverity: RiskSeverity;
  riskScore: number; // 0-100
  confidence: ConfidenceLevel;
  mainReason: string;
  detailedReason: string;
  status: FindingStatus;
  detectedTime: string;
  firstSeen: string;
  lastSeen: string;
  publisherOrOwner: string;
  candidateWebsite: string;
  description: string;
  avatarColor: string;
  avatarInitials: string;
  lookalike: LookalikeDetail;
  signals: SignalItem[];
  connectedCampaign?: ConnectedCampaign;
  evidence: EvidenceData;
  timeline: TimelineEntry[];
}

export interface OfficialSocialAccount {
  id: string;
  platform: string;
  handle: string;
  displayName: string;
  profileUrl: string;
  accountId: string;
  verifiedDate: string;
  followers?: string;
}

export interface OfficialMobileApp {
  id: string;
  name: string;
  platform: 'Android' | 'iOS';
  packageId: string;
  publisher: string;
  storeUrl: string;
  version: string;
  verifiedDate: string;
}

export interface BrandProfile {
  companyName: string;
  companyEmail: string;
  industry: string;
  brandName: string;
  aliases: string[];
  website: string;
  productNames: string[];
  slogans: string[];
  logoText: string;
  logoUrl?: string;
  completenessPercent: number;
  officialSocials: OfficialSocialAccount[];
  officialApps: OfficialMobileApp[];
}

export interface SourceStatusItem {
  id: string;
  name: string;
  status: 'live' | 'partially_available' | 'rate_limited' | 'unavailable' | 'demo_data';
  statusLabel: string;
  lastSync: string;
  tooltipText: string;
}

export interface LinkCheckRecord {
  id: string;
  url: string;
  checkedDomain: string;
  officialDomain: string;
  verdict: 'Approved' | 'Suspicious' | 'Likely phishing' | 'Confirmed malicious';
  riskSeverity: RiskSeverity;
  riskScore: number;
  confidence: ConfidenceLevel;
  redirectInfo: string;
  screenshotLabel: string;
  whyFlagged: string;
  recommendedAction: string;
  checkedAt: string;
  pageTitle?: string;
  isTrueBrand?: boolean;
  verdictBoolean?: 'TRUE' | 'FALSE';
  detectedBrand?: string;
  brandCategory?: string;
  threatClassification?: string;
  webRiskStatus?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  companyId: string;
  role: string;
}

export interface Company {
  id: string;
  name: string;
  website: string;
  industry: string;
  emailDomain?: string;
  isDemo?: boolean;
  logoText?: string;
  logoUrl?: string;
  aliases?: string[];
  productNames?: string[];
  slogans?: string[];
  findingsCount?: number;
  assetCount?: number;
}

export interface BrandAsset {
  id: string;
  company_id: string;
  type: 'domain' | 'social' | 'app' | 'logo' | 'partner';
  name: string;
  url?: string;
  platform?: string;
  account_id?: string;
  package_id?: string;
  publisher?: string;
  verification_status: 'verified_official' | 'needs_verification' | 'pending_review' | 'missing_info';
  verification_method: string;
  created_at: string;
  updated_at: string;
}

export type ScanStageId = 'critical' | 'high' | 'medium' | 'low';
export type FindingsTabId = 'all' | 'social' | 'app';

export type PageId = 
  | 'home'
  | 'check-link'
  | 'social'
  | 'apps'
  | 'findings'
  | 'brand-profile'
  | 'settings'
  | 'scan-results'
  | 'watchlist'
  | 'scam-analyzer'
  | 'unicode-xray'
  | 'warning-kit'
  | 'board-report'
  | 'alert-preview';

export type AppRoute = 
  | '/'
  | '/login'
  | '/register'
  | '/forgot-password'
  | '/onboarding'
  | '/dashboard'
  | '/check-link'
  | '/social-monitoring'
  | '/app-monitoring'
  | '/findings'
  | '/brand-profile'
  | '/settings';

export type AppViewMode = 'landing' | 'login' | 'register' | 'forgot-password' | 'onboarding' | 'app' | 'verify';

// --- FEATURE 1: Public Brand Verification ---
export type VerificationVerdict = 'Verified Official' | 'Suspicious' | 'Not Recognized' | 'Unavailable';

export interface VerificationSearchResult {
  query: string;
  verdict: VerificationVerdict;
  confidenceScore: number;
  checkedAt: string;
  matchedAsset?: {
    name: string;
    type: 'domain' | 'social' | 'app' | 'support_channel';
    url: string;
    platform?: string;
    verifiedDate: string;
  };
  warnings?: string[];
  officialCompany: {
    name: string;
    website: string;
    officialSocials: OfficialSocialAccount[];
    officialApps: OfficialMobileApp[];
    supportChannels: { channel: string; contact: string; responseTime: string }[];
    activeWarnings: string[];
  };
  notes: string;
  isDemoData: boolean;
}

// --- FEATURE 2: Unified Case Management ---
export type CaseStatus = 'Open' | 'Investigating' | 'Escalated' | 'Resolved' | 'Closed';
export type CasePriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface CaseActivity {
  id: string;
  author: string;
  role: string;
  action: string;
  timestamp: string;
  note?: string;
}

export interface InvestigationCase {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  assignedAnalyst: string;
  createdAt: string;
  updatedAt: string;
  findingIds: string[]; // Linked findings
  evidenceCount: number;
  scamMessageSnippets?: string[];
  tags: string[];
  notes: string[];
  activities: CaseActivity[];
}

// --- FEATURE 3: Trust Graph ---
export interface TrustNode {
  id: string;
  label: string;
  type: 'official' | 'suspicious_profile' | 'suspicious_domain' | 'mobile_app' | 'publisher' | 'infrastructure';
  detail?: string;
  riskLevel?: 'safe' | 'low' | 'medium' | 'high' | 'critical';
}

export interface TrustEdge {
  id: string;
  source: string;
  target: string;
  reason: string; // e.g., 'copied branding', 'shared domain', 'shared publisher', 'similar contact details', 'shared host IP'
  confidence: 'High' | 'Medium' | 'Low';
}

export interface TrustGraphData {
  nodes: TrustNode[];
  edges: TrustEdge[];
}

// --- FEATURE 4: Change Detection ---
export type ChangeType = 'New' | 'Changed' | 'Removed' | 'Risk Increased' | 'Risk Decreased';

export interface FindingChangeRecord {
  id: string;
  timestamp: string;
  attribute: 'Logo' | 'Description' | 'Suspicious Link' | 'Publisher' | 'Package ID' | 'Activity' | 'Risk Score';
  changeType: ChangeType;
  previousValue?: string;
  currentValue: string;
  explanation: string;
}

// --- FEATURE 5: Risk Score Simulator ---
export interface RiskSignalSimulation {
  id: string;
  name: string;
  description: string;
  weight: number;
  enabled: boolean;
  category: 'name' | 'logo' | 'domain' | 'owner' | 'publisher';
}

// --- FEATURE 6: Evidence Integrity Record ---
export type EvidenceIntegrityStatus = 'Captured' | 'Verified' | 'Changed' | 'Unavailable' | 'Demo Evidence';

export interface EvidenceAuditEntry {
  timestamp: string;
  action: string;
  verifiedBy: string;
  hashMatches: boolean;
}

export interface EvidenceIntegrityData {
  id: string;
  source: string;
  captureTime: string;
  lastVerificationTime: string;
  screenshotStatus: 'Available' | 'Pending Capture' | 'Archived' | 'Failed';
  sha256Hash: string;
  evidenceStatus: EvidenceIntegrityStatus;
  isTamperFree: boolean;
  auditHistory: EvidenceAuditEntry[];
}

// --- FEATURE 7: Triage Recommendation ---
export type TriageActionType = 
  | 'Verify Ownership'
  | 'Capture Evidence'
  | 'Warn Customers'
  | 'Contact Platform'
  | 'Monitor Changes'
  | 'Add to Case'
  | 'Escalate';

export type TriageActionStatus = 'Recommended' | 'Pending Review' | 'In Progress' | 'Completed' | 'Dismissed';

export interface TriageRecommendation {
  id: string;
  action: TriageActionType;
  reason: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: TriageActionStatus;
  suggestedWorkflow: string;
  requiresConfirmation: boolean;
}
