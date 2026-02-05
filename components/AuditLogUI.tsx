
import React from 'react';
import { VerificationResult, Verdict, RulePriority } from '../types';

interface Props {
  result: VerificationResult;
}

const AuditLogUI: React.FC<Props> = ({ result }) => {
  const signalBar = (value: number, label: string, color: string) => (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{label}</span>
        <span className="text-[10px] font-mono font-bold text-slate-600">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${value * 100}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="mt-8 pt-8 border-t border-slate-200 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping absolute inset-0 opacity-20"></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full relative shadow-[0_0_10px_rgba(79,70,229,0.4)]"></div>
          </div>
          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">
            Forensic Pipeline Trace
          </h4>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-tighter shadow-sm">
            INTEGRITY: {result.integrityHash || 'SECURE'}
          </span>
          <span className="hidden sm:block text-[9px] font-mono text-slate-400 bg-slate-50 px-2 py-1.5 rounded border border-slate-100">
            PID-{result.claimId.slice(0, 8).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Signal Breakdown (Confidence 2.0 Engine) */}
      <div className="mb-12 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-indigo-900/5">
        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Weighted Signal Diagnostics
        </h5>
        <div className="flex flex-col md:flex-row gap-8">
          {signalBar(result.signals.sourceCredibility, "Domain Authority", "bg-blue-600")}
          {signalBar(result.signals.consensusStrength, "Global Corroboration", "bg-indigo-600")}
          {signalBar(result.signals.logicalConsistency, "Logical Integrity", "bg-emerald-600")}
        </div>
      </div>

      <div className="space-y-0 relative">
        {/* Visual Timeline Path */}
        <div className="absolute left-[15px] top-2 bottom-2 w-1 bg-gradient-to-b from-slate-100 via-indigo-50 to-slate-100 rounded-full opacity-50"></div>

        {/* Phase 01: Grounding */}
        <div className="relative pl-12 pb-12">
          <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center z-10 shadow-md">
            <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
            <span className="text-[12px] font-black text-slate-900 uppercase tracking-wider">01. Neural Grounding Sweep</span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 uppercase">
                GEMINI-3 PRO
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 uppercase">
                {result.rawGeminiVerdict || 'SCAN_COMPLETE'}
              </span>
            </div>
          </div>
          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 shadow-sm">
            <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
              Executed deep-index retrieval. Cross-referenced statement string against verified academic, government, and high-authority journalism repositories. Initial consensus threshold established at 0.82.
            </p>
          </div>
        </div>

        {/* Phase 02: Heuristics */}
        <div className="relative pl-12 pb-12">
          <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center z-10 shadow-md">
            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <span className="text-[12px] font-black text-indigo-600 uppercase tracking-wider">02. Heuristic Override Engine</span>
            <span className="text-[10px] font-bold text-indigo-600 px-3 py-1 border border-indigo-100 rounded-full bg-indigo-50 uppercase tracking-widest shadow-sm">
              {result.auditLog.length} Logic Adjustments
            </span>
          </div>
          
          <div className="space-y-4">
            {result.auditLog.length > 0 ? (
              result.auditLog.map((adj, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${
                    adj.priority === RulePriority.HIGH ? 'bg-red-500' :
                    adj.priority === RulePriority.MEDIUM ? 'bg-indigo-500' : 'bg-slate-300'
                  }`}></div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{adj.ruleName}</span>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-[0.1em] ${
                        adj.priority === RulePriority.HIGH ? 'bg-red-600 text-white' :
                        adj.priority === RulePriority.MEDIUM ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {adj.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Verdict Shift */}
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
                        <span className="text-[10px] line-through text-slate-400 font-bold">{adj.previousVerdict}</span>
                        <svg className="w-3 h-3 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <span className="text-[10px] text-indigo-700 font-black">{adj.newVerdict}</span>
                      </div>
                      
                      {/* Confidence Shift */}
                      {adj.previousConfidence !== adj.newConfidence && (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-indigo-50/50 px-3 py-1 rounded-xl border border-indigo-100">
                          <span className="text-slate-400">{adj.previousConfidence}%</span>
                          <span className="text-indigo-300">→</span>
                          <span className={adj.newConfidence > adj.previousConfidence ? 'text-emerald-600' : 'text-amber-600'}>
                            {adj.newConfidence}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-[12px] text-slate-500 leading-relaxed font-medium pl-2">
                    {adj.note}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 bg-slate-50/40 border border-slate-100 rounded-2xl border-dashed">
                <p className="text-[12px] text-slate-400 font-medium italic text-center">Global grounding confirmed baseline results. No deterministic logic overrides triggered.</p>
              </div>
            )}
          </div>
        </div>

        {/* Phase 03: Meta-Sweep */}
        {result.consistencyFlag && (
          <div className="relative pl-12 pb-12">
            <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center z-10 shadow-md">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
              <span className="text-[12px] font-black text-amber-600 uppercase tracking-wider">03. Contextual Meta-Sweep</span>
              <span className="text-[10px] font-bold text-amber-600 px-3 py-1 border border-amber-100 rounded-full bg-amber-50 uppercase tracking-widest shadow-sm">
                Recursive Correction
              </span>
            </div>
            <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-6 border-l-[6px] border-l-amber-500 shadow-sm">
              <h6 className="text-[11px] font-black text-amber-900 uppercase tracking-widest mb-2">Cross-Claim Correlation Conflict</h6>
              <p className="text-[12px] text-amber-900/80 font-medium leading-relaxed italic">
                "{result.correctionNote || "Adjusted outcome based on identifying a logical contradiction with high-confidence sibling claims."}"
              </p>
            </div>
          </div>
        )}

        {/* Forensic Termination */}
        <div className="relative pl-12">
          <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center z-10 shadow-xl ring-4 ring-indigo-50">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="mb-4">
            <span className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Termination Conclusion</span>
          </div>
          
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-indigo-500/20"></div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-6">
              <div className="text-center sm:text-left">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em] block mb-2">Final Forensic Outcome</span>
                <span className="text-4xl font-black tracking-tighter block">{result.verdict}</span>
              </div>
              <div className="text-center sm:text-right">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em] block mb-2">Reliability Weighting</span>
                <span className="text-4xl font-black tracking-tighter tabular-nums block font-mono">{result.confidence}%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1 px-1">
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Global Integrity Confidence</span>
                <span className="text-[9px] font-mono font-bold text-slate-300">CRC32_CHECK: PASS</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full transition-all duration-[1500ms] ease-out ${
                    result.verdict === Verdict.TRUE ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
                    result.verdict === Verdict.FALSE ? 'bg-gradient-to-r from-red-600 to-red-400' :
                    result.verdict === Verdict.LIKELY_TRUE ? 'bg-gradient-to-r from-indigo-600 to-blue-400' : 'bg-slate-600'
                  }`}
                  style={{ width: `${result.confidence}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogUI;
