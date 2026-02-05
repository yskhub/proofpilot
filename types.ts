
export enum Verdict {
  TRUE = 'True',
  LIKELY_TRUE = 'Likely True',
  UNVERIFIED = 'Unverified',
  FALSE = 'False'
}

export enum RulePriority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface VerificationSignals {
  sourceCredibility: number;
  consensusStrength: number;
  logicalConsistency: number;
}

export interface FactualClaim {
  id: string;
  text: string;
  category: string;
}

export interface RuleAdjustment {
  ruleName: string;
  previousVerdict: Verdict;
  newVerdict: Verdict;
  previousConfidence: number;
  newConfidence: number;
  note: string;
  priority: RulePriority;
}

export interface VerificationResult {
  claimId: string;
  verdict: Verdict;
  confidence: number;
  explanation: string;
  sources: Source[];
  consistencyFlag?: boolean;
  originalVerdict?: Verdict;
  correctionNote?: string;
  auditLog: RuleAdjustment[];
  rawGeminiVerdict?: Verdict;
  signals: VerificationSignals;
  integrityHash?: string;
}

export interface Source {
  title: string;
  uri: string;
  credibilityScore: number;
  credibilityReason: string;
}

export enum DocumentPersona {
  FACTUAL_CORE = 'Fact-Driven Analytical',
  BALANCED_INQUIRY = 'Balanced Inquiry',
  SPECULATIVE_RISK = 'Speculative / High-Risk',
  CONTRADICTORY = 'Logical Contradiction detected',
  TRUSTED_SYSTEM = 'Trusted System (Honeypot)',
  SCRIPT_KIDDIE = 'Script Kiddie / Recon',
  AUTOMATED_BOT = 'Automated Bot / Replay',
  RECON_SCANNER = 'Advanced Recon Scanner'
}

export interface RiskAnalysis {
  summary: string;
  identifiedRisks: string[];
  suggestedActions: string[];
}

export interface AnalysisState {
  status: 'idle' | 'extracting' | 'verifying' | 'consistency-check' | 'completed' | 'error';
  claims: FactualClaim[];
  results: Record<string, VerificationResult>;
  persona?: DocumentPersona;
  riskAnalysis?: RiskAnalysis;
  error?: string;
  mode?: 'document' | 'simulation';
  isMock?: boolean;
}

export interface SecurityScenario {
  id: string;
  name: string;
  intent: string;
  requests: any[];
  expectedPersona: DocumentPersona;
  mockResponse?: {
    verdict: Verdict;
    confidence: number;
    explanation: string;
  };
}
