
import { GoogleGenAI, Type } from "@google/genai";
import { FactualClaim, VerificationResult, Verdict, Source, DocumentPersona, SecurityScenario, RiskAnalysis } from "../types";
import { scoreSource } from "../utils/credibility";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * MINIMAL DETERMINISTIC PROMPT (Optimized for tokens)
 */
const MINIMAL_SECURITY_PROMPT = `You are a security classifier.
Task: Classify session as Legitimate, Suspicious, or Malicious.
Rules: Be conservative. Output JSON only. No markdown.
Schema: { "verdict": "", "confidence": 0.0, "persona": "", "key_signals": [], "explanation": "" }`;

/**
 * Summarizes complex logs into a token-efficient numeric object
 */
const summarizeLogs = (requests: any[]) => {
  const endpoints = new Set(requests.map(r => r.endpoint));
  const authFailures = requests.filter(r => r.status_code === 401 || r.status_code === 403).length;
  const tokenReuse = new Set(requests.map(r => r.headers?.Authorization)).size < requests.filter(r => r.headers?.Authorization).length;

  return {
    request_count: requests.length,
    unique_endpoints: endpoints.size,
    auth_failures: authFailures,
    token_reuse: tokenReuse,
    time_span_sec: requests.length > 1 ? (new Date(requests[requests.length - 1].timestamp).getTime() - new Date(requests[0].timestamp).getTime()) / 1000 : 0,
    ua_entropy: new Set(requests.map(r => r.headers?.['User-Agent'])).size
  };
};

export const verifySecurityScenario = async (scenario: SecurityScenario, isMock: boolean = false): Promise<{ claims: FactualClaim[], results: Record<string, VerificationResult>, persona: DocumentPersona }> => {
  if (isMock && scenario.mockResponse) {
    const claim: FactualClaim = { id: 'sim-1', text: scenario.intent, category: 'Security' };
    const result: VerificationResult = {
      claimId: 'sim-1',
      verdict: scenario.mockResponse.verdict,
      confidence: scenario.mockResponse.confidence,
      explanation: scenario.mockResponse.explanation,
      sources: [],
      auditLog: [],
      signals: { sourceCredibility: 0.95, consensusStrength: 0.9, logicalConsistency: 0.98 }
    };
    return { claims: [claim], results: { [claim.id]: result }, persona: scenario.expectedPersona };
  }

  const summary = summarizeLogs(scenario.requests);

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: `Analyze behavior: ${JSON.stringify(summary)}. Intent: ${scenario.intent}`,
    config: {
      responseMimeType: "application/json",
      systemInstruction: MINIMAL_SECURITY_PROMPT
    }
  });

  const data = JSON.parse(response.text || '{}');
  const claimId = 'sim-0';
  const claim: FactualClaim = { id: claimId, text: scenario.intent, category: 'Forensic Audit' };

  const result: VerificationResult = {
    claimId,
    verdict: (data.verdict === 'Malicious' ? Verdict.FALSE : data.verdict === 'Suspicious' ? Verdict.LIKELY_TRUE : Verdict.TRUE) as Verdict,
    confidence: Math.round(data.confidence * 100),
    explanation: data.explanation,
    sources: [],
    auditLog: [],
    signals: { sourceCredibility: 0.8, consensusStrength: 0.7, logicalConsistency: 0.9 }
  };

  return { claims: [claim], results: { [claimId]: result }, persona: data.persona as DocumentPersona };
};

export const extractClaims = async (text: string): Promise<FactualClaim[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: `Extract factual claims. JSON only. TEXT: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          claims: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                category: { type: Type.STRING },
              },
              required: ["id", "text", "category"]
            }
          }
        },
        required: ["claims"]
      }
    }
  });

  const data = JSON.parse(response.text || '{"claims":[]}');
  return data.claims;
};

export const verifyClaim = async (claim: FactualClaim): Promise<VerificationResult> => {
  const searchResponse = await ai.models.generateContent({
    model: 'gemini-1.5-pro',
    contents: `Verify: "${claim.text}"`,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "Factual verification engine. Output grounding evidence."
    }
  });

  const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources: Source[] = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => {
      const rating = scoreSource(chunk.web.uri);
      return {
        title: chunk.web.title || "External Source",
        uri: chunk.web.uri,
        credibilityScore: rating.score,
        credibilityReason: rating.reason
      };
    });

  const avgCredibility = sources.length > 0
    ? sources.reduce((acc, s) => acc + s.credibilityScore, 0) / sources.length
    : 0.5;

  const structuredResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Grounding analysis: "${searchResponse.text}". Output JSON verdict.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verdict: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          explanation: { type: Type.STRING }
        }
      }
    }
  });

  const analysis = JSON.parse(structuredResponse.text || '{}');

  return {
    claimId: claim.id,
    verdict: (analysis.verdict as Verdict) || Verdict.UNVERIFIED,
    confidence: analysis.confidence || 0,
    explanation: analysis.explanation || "Verification grounded in source indices.",
    sources: sources,
    auditLog: [],
    signals: {
      sourceCredibility: avgCredibility,
      consensusStrength: 0.8,
      logicalConsistency: 0.9
    }
  };
};

export const checkConsistency = async (claims: FactualClaim[], results: VerificationResult[]): Promise<any[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: `Check contradictions: ${JSON.stringify(claims.map(c => ({ id: c.id, verdict: results.find(r => r.claimId === c.id)?.verdict })))}`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || '[]');
};

// Fix: Imported RiskAnalysis to satisfy TypeScript type checking for the signature and return value
export const generateRiskAnalysis = async (persona: DocumentPersona, verdicts: Record<Verdict, number>, avgConfidence: number): Promise<RiskAnalysis> => {
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: `Risk profile for ${persona}. Stats: ${JSON.stringify(verdicts)}. Confidence: ${avgConfidence}%`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || '{}') as RiskAnalysis;
};
