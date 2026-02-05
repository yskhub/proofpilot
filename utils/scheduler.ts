
import { VerificationResult, Verdict } from "../types";

const MAX_AI_CALLS_PER_SESSION = 15;
let sessionAiCount = 0;

export interface PriorityMetrics {
  authFailures: number;
  tokenReuse: boolean;
  uniqueEndpoints: number;
}

/**
 * Calculates if a session is worth the "AI Token Cost"
 * Score >= 3 triggers full Gemini Forensics
 */
export const calculateAiPriority = (metrics: PriorityMetrics): number => {
  let score = 0;
  if (metrics.authFailures > 2) score += 4;
  if (metrics.tokenReuse) score += 5;
  if (metrics.uniqueEndpoints > 5) score += 2;
  return score;
};

export const canCallAi = (): boolean => {
  if (sessionAiCount >= MAX_AI_CALLS_PER_SESSION) {
    console.warn("Quota Guard: Maximum AI budget for this session exceeded.");
    return false;
  }
  sessionAiCount++;
  return true;
};

export const resetAiBudget = () => {
  sessionAiCount = 0;
};
