
import { FactualClaim, VerificationResult, Verdict, RulePriority } from "../types";

export const RISK_PHRASES = ["up to", "as much as", "can reach", "may survive", "could last", "estimated"];

export const runRuleEngine = (claim: FactualClaim, result: VerificationResult): { result: VerificationResult, adjustments: any[] } => {
  let finalResult = { ...result };
  const adjustments: any[] = [];
  const textLower = claim.text.toLowerCase();

  // Rule 1: Risk Phrase Downgrade (Priority: MEDIUM)
  const hasRiskPhrase = RISK_PHRASES.some(phrase => textLower.includes(phrase));
  if (hasRiskPhrase && (finalResult.verdict === Verdict.TRUE || finalResult.verdict === Verdict.LIKELY_TRUE)) {
    const prevV = finalResult.verdict;
    const nextV = finalResult.verdict === Verdict.TRUE ? Verdict.LIKELY_TRUE : Verdict.UNVERIFIED;
    
    adjustments.push({
      ruleName: "Linguistic Risk Pattern",
      priority: RulePriority.MEDIUM,
      previousVerdict: prevV,
      newVerdict: nextV,
      previousConfidence: finalResult.confidence,
      newConfidence: finalResult.confidence,
      note: `Detected hedging language ("${RISK_PHRASES.find(p => textLower.includes(p))}"). Downgrading for nuance.`
    });
    
    finalResult.verdict = nextV;
    // Impact specific signal
    finalResult.signals.consensusStrength = Math.min(finalResult.signals.consensusStrength, 0.7);
  }

  // Rule 2: Medical/Scientific Domain Strictness (Priority: HIGH)
  const isMedical = claim.category.toLowerCase().includes('medic') || claim.category.toLowerCase().includes('scien');
  if (isMedical && finalResult.verdict === Verdict.TRUE && finalResult.confidence > 90) {
    const prevV = finalResult.verdict;
    adjustments.push({
      ruleName: "Scientific Domain Strictness",
      priority: RulePriority.HIGH,
      previousVerdict: prevV,
      newVerdict: Verdict.LIKELY_TRUE,
      previousConfidence: finalResult.confidence,
      newConfidence: 89,
      note: "Scientific/Medical claims require absolute global consensus. Capping at 'Likely True' for safety."
    });
    finalResult.verdict = Verdict.LIKELY_TRUE;
    finalResult.confidence = 89;
    finalResult.signals.sourceCredibility = Math.min(finalResult.signals.sourceCredibility, 0.85);
  }

  // Rule 3: Disinformation Confidence Boost (Priority: LOW)
  if (finalResult.verdict === Verdict.FALSE && finalResult.confidence < 80) {
    const prevC = finalResult.confidence;
    adjustments.push({
      ruleName: "False Verdict Confidence Boost",
      priority: RulePriority.LOW,
      previousVerdict: finalResult.verdict,
      newVerdict: finalResult.verdict,
      previousConfidence: prevC,
      newConfidence: 85,
      note: "High discrepancy identified. Strengthening confidence in identified misinformation."
    });
    finalResult.confidence = 85;
  }

  // Rule 4: Integrity Signature (Tamper Proofing Simulation)
  const integrityPayload = `${finalResult.claimId}|${finalResult.verdict}|${finalResult.confidence}`;
  finalResult.integrityHash = btoa(integrityPayload).slice(0, 16);

  return { result: finalResult, adjustments };
};
