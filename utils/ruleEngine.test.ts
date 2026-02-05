
import { runRuleEngine } from './ruleEngine';
import { FactualClaim, VerificationResult, Verdict } from '../types';

export interface TestCase {
  name: string;
  claim: FactualClaim;
  initialResult: Partial<VerificationResult>;
  expectedVerdict: Verdict;
  expectedConfidence: number;
  shouldTriggerRule?: string;
}

export const ruleEngineTests: TestCase[] = [
  {
    name: "Linguistic Downgrade: TRUE -> LIKELY_TRUE",
    claim: { id: '1', text: "A human can live up to 100 years.", category: "Biology" },
    initialResult: { verdict: Verdict.TRUE, confidence: 95, explanation: "Grounding found matches.", sources: [], auditLog: [], claimId: '1' },
    expectedVerdict: Verdict.LIKELY_TRUE,
    expectedConfidence: 95,
    shouldTriggerRule: "Linguistic Risk Pattern"
  },
  {
    name: "Linguistic Downgrade: LIKELY_TRUE -> UNVERIFIED",
    claim: { id: '2', text: "It could last as much as a decade.", category: "General" },
    initialResult: { verdict: Verdict.LIKELY_TRUE, confidence: 80, explanation: "Uncertain evidence.", sources: [], auditLog: [], claimId: '2' },
    expectedVerdict: Verdict.UNVERIFIED,
    expectedConfidence: 80,
    shouldTriggerRule: "Linguistic Risk Pattern"
  },
  {
    name: "Medical Strictness: Capping TRUE at 89%",
    claim: { id: '3', text: "The treatment is 100% effective.", category: "Medical Research" },
    initialResult: { verdict: Verdict.TRUE, confidence: 98, explanation: "Clinical trials support this.", sources: [], auditLog: [], claimId: '3' },
    expectedVerdict: Verdict.LIKELY_TRUE,
    expectedConfidence: 89,
    shouldTriggerRule: "Scientific Domain Strictness"
  },
  {
    name: "Medical Strictness: No change if confidence <= 90",
    claim: { id: '4', text: "Aspirin reduces pain.", category: "Medicine" },
    initialResult: { verdict: Verdict.TRUE, confidence: 90, explanation: "Common knowledge.", sources: [], auditLog: [], claimId: '4' },
    expectedVerdict: Verdict.TRUE,
    expectedConfidence: 90
  },
  {
    name: "Confidence Boost: FALSE with low confidence",
    claim: { id: '5', text: "The moon is made of cheese.", category: "Science" },
    initialResult: { verdict: Verdict.FALSE, confidence: 50, explanation: "Physically impossible.", sources: [], auditLog: [], claimId: '5' },
    expectedVerdict: Verdict.FALSE,
    expectedConfidence: 85,
    shouldTriggerRule: "False Verdict Confidence Boost"
  },
  {
    name: "No Downgrade: FALSE with risk phrase",
    claim: { id: '6', text: "It can reach 1000 degrees.", category: "General" },
    initialResult: { verdict: Verdict.FALSE, confidence: 90, explanation: "Actually it only reaches 100.", sources: [], auditLog: [], claimId: '6' },
    expectedVerdict: Verdict.FALSE,
    expectedConfidence: 90
  },
  {
    name: "Multi-Rule: Medical + Risk Phrase",
    claim: { id: '7', text: "Recovery can take up to 5 days.", category: "Medicine" },
    initialResult: { verdict: Verdict.TRUE, confidence: 95, explanation: "Supported by data.", sources: [], auditLog: [], claimId: '7' },
    expectedVerdict: Verdict.LIKELY_TRUE,
    expectedConfidence: 89,
    shouldTriggerRule: "Scientific Domain Strictness" // Both trigger, but medical cap is checked second in code and affects confidence
  }
];

export const runTests = () => {
  return ruleEngineTests.map(test => {
    const { result, adjustments } = runRuleEngine(test.claim, test.initialResult as VerificationResult);
    
    const verdictMatch = result.verdict === test.expectedVerdict;
    const confidenceMatch = result.confidence === test.expectedConfidence;
    const ruleMatch = test.shouldTriggerRule 
      ? adjustments.some(a => a.ruleName === test.shouldTriggerRule)
      : adjustments.length === 0;

    return {
      name: test.name,
      passed: verdictMatch && confidenceMatch && ruleMatch,
      details: `Verdict: ${result.verdict} (Exp: ${test.expectedVerdict}), Conf: ${result.confidence} (Exp: ${test.expectedConfidence}), Rules: ${adjustments.length}`
    };
  });
};
