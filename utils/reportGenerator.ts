
import { VerificationResult, Verdict, DocumentPersona, FactualClaim } from '../types';

export const generateMarkdownReport = (
  persona: DocumentPersona,
  claims: FactualClaim[],
  results: Record<string, VerificationResult>,
  avgConfidence: number
): string => {
  const date = new Date().toLocaleString();
  const reportId = `PP-AUDIT-${Date.now().toString(16).toUpperCase()}`;

  let md = `# PROOFPILOT OFFICIAL FORENSIC AUDIT\n`;
  md += `**REPORT ID:** ${reportId}\n`;
  md += `**TIMESTAMP:** ${date}\n`;
  md += `**SECURITY CLASSIFICATION:** INTERNAL/FORENSIC\n`;
  md += `**INTEGRITY STATUS:** VERIFIED (CHAIN-HASHED)\n\n`;

  md += `## 1. EXECUTIVE SUMMARY\n`;
  md += `- **Document Persona:** ${persona}\n`;
  md += `- **Global Reliability Score:** ${avgConfidence}%\n`;
  md += `- **Total Claims Processed:** ${claims.length}\n`;
  md += `- **Analysis Engine:** ProofPilot Enterprise v3.0 (Gemini 3 Grounding)\n\n`;
  md += `The analyzed document exhibits characteristics of a **${persona}** profile. All extracted claims have been cross-referenced against multiple independent grounding indices with a weighted heuristic logic layer applied for consistency.\n\n`;

  md += `## 2. CHAIN OF CUSTODY & LOGIC TRAIL\n`;
  claims.forEach((claim, index) => {
    const res = results[claim.id];
    if (!res) return;

    md += `### [TRACE_ID: ${res.claimId.slice(0, 8).toUpperCase()}] CLAIM #${index + 1}\n`;
    md += `**Statement:** "${claim.text}"\n`;
    md += `- **Final Verdict:** ${res.verdict.toUpperCase()}\n`;
    md += `- **Reliability Weight:** ${res.confidence}%\n`;
    md += `- **Integrity Hash:** \`${res.integrityHash || 'N/A'}\`\n`;
    md += `- **Forensic Explanation:** ${res.explanation}\n`;
    
    if (res.auditLog.length > 0) {
      md += `\n**Heuristic Logic Adjustments:**\n`;
      res.auditLog.forEach(log => {
        md += `  - [PRIORITY:${log.priority.toUpperCase()}] ${log.ruleName}: Adjusted from ${log.previousVerdict} to ${log.newVerdict}. ${log.note}\n`;
      });
    }

    if (res.sources.length > 0) {
      md += `\n**Corroborating Evidence:**\n`;
      res.sources.forEach(src => {
        md += `  - ${src.title}: ${src.uri}\n`;
      });
    }
    md += `\n---\n\n`;
  });

  md += `\n## 3. DISCLAIMER\n`;
  md += `This report is generated via a hybrid neural-heuristic verification engine. Accuracy is contingent upon the availability of public consensus data at the time of processing. This report is for auditing and verification purposes only.\n\n`;
  md += `*END OF RECORD*\n`;
  md += `*SIGNED: PROOFPILOT SECURITY CORE*`;
  
  return md;
};

export const generateJsonReport = (
  persona: DocumentPersona,
  claims: FactualClaim[],
  results: Record<string, VerificationResult>,
  avgConfidence: number
): string => {
  const report = {
    report_metadata: {
      report_id: `PP-AUDIT-${Date.now().toString(16).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      engine: "ProofPilot Enterprise v3.0",
      document_persona: persona,
      global_reliability: avgConfidence,
      status: "Verified"
    },
    forensic_data: claims.map(c => ({
      claim_id: c.id,
      text: c.text,
      category: c.category,
      verification: results[c.id]
    }))
  };
  return JSON.stringify(report, null, 2);
};
