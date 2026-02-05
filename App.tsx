
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { AnalysisState, FactualClaim, VerificationResult, Verdict, DocumentPersona, SecurityScenario } from './types';
import { extractClaims, verifyClaim, checkConsistency, generateRiskAnalysis, verifySecurityScenario } from './services/gemini';
import { runRuleEngine } from './utils/ruleEngine';
import { runTests } from './utils/ruleEngine.test';
import { canCallAi, calculateAiPriority, resetAiBudget } from './utils/scheduler';
import ClaimCard from './components/ClaimCard';
import VerdictBadge from './components/VerdictBadge';
import ReportModal from './components/ReportModal';
import RiskSummaryUI from './components/RiskSummaryUI';
import ScenarioSimulator from './components/ScenarioSimulator';

const generateRequestSignature = (payload: string): string => {
  const combined = `${navigator.userAgent}|${payload}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase();
};

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [testResults, setTestResults] = useState<{name: string, passed: boolean, details: string}[] | null>(null);
  const [replayWarning, setReplayWarning] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [state, setState] = useState<AnalysisState>({
    status: 'idle',
    claims: [],
    results: {}
  });

  const submissionHistory = useRef<{ signature: string; timestamp: number }[]>([]);

  const handleRunTests = () => {
    const results = runTests();
    setTestResults(results);
  };

  const calculateDocumentPersona = (results: VerificationResult[]): DocumentPersona => {
    const verdicts = results.map(r => r.verdict);
    const hasConsistencyIssue = results.some(r => r.consistencyFlag);
    if (hasConsistencyIssue) return DocumentPersona.CONTRADICTORY;
    const falseCount = verdicts.filter(v => v === Verdict.FALSE).length;
    const trueCount = verdicts.filter(v => v === Verdict.TRUE).length;
    if (falseCount > results.length * 0.3) return DocumentPersona.SPECULATIVE_RISK;
    if (trueCount > results.length * 0.7) return DocumentPersona.FACTUAL_CORE;
    return DocumentPersona.BALANCED_INQUIRY;
  };

  const processAnalysis = async (claims: FactualClaim[], personaOverride?: DocumentPersona) => {
    const initialResults: Record<string, VerificationResult> = {};
    
    for (const claim of claims) {
      if (!canCallAi()) {
        const fallback: VerificationResult = {
          claimId: claim.id,
          verdict: Verdict.UNVERIFIED,
          confidence: 0,
          explanation: "AI budget exceeded for this session. Use localized rules or upgrade for more forensic detail.",
          sources: [],
          auditLog: [],
          signals: { sourceCredibility: 0, consensusStrength: 0, logicalConsistency: 0 }
        };
        initialResults[claim.id] = fallback;
        continue;
      }

      try {
        const rawResult = await verifyClaim(claim);
        const { result: ruledResult, adjustments } = runRuleEngine(claim, rawResult);
        const enrichedResult: VerificationResult = {
          ...ruledResult,
          rawGeminiVerdict: rawResult.verdict,
          auditLog: adjustments
        };
        initialResults[claim.id] = enrichedResult;
        setState(prev => ({ ...prev, results: { ...prev.results, [claim.id]: enrichedResult } }));
      } catch (err) {
        console.error(`Verification failed for ${claim.id}`, err);
      }
    }

    setState(prev => ({ ...prev, status: 'consistency-check' }));
    const currentResults = Object.values(initialResults);
    const consistencyCorrections = await checkConsistency(claims, currentResults);

    const finalResults = { ...initialResults };
    consistencyCorrections.forEach((corr: any) => {
      if (corr.inconsistent && finalResults[corr.id]) {
        const old = finalResults[corr.id];
        finalResults[corr.id] = {
          ...old,
          verdict: (corr.suggestedVerdict as Verdict) || old.verdict,
          consistencyFlag: true,
          correctionNote: `Contradiction: ${corr.reason}`,
          confidence: Math.max(old.confidence - 10, 50)
        };
      }
    });

    const persona = personaOverride || calculateDocumentPersona(Object.values(finalResults));
    const verdictStats = { [Verdict.TRUE]: 0, [Verdict.LIKELY_TRUE]: 0, [Verdict.UNVERIFIED]: 0, [Verdict.FALSE]: 0 };
    let totalConfidence = 0;
    Object.values(finalResults).forEach(c => { 
      verdictStats[c.verdict]++; 
      totalConfidence += c.confidence; 
    });
    const avgConfidence = Math.round(totalConfidence / (Object.values(finalResults).length || 1));
    const riskAnalysis = await generateRiskAnalysis(persona, verdictStats, avgConfidence);

    setState(prev => ({ ...prev, status: 'completed', results: finalResults, persona, riskAnalysis }));
  };

  const handleStartAnalysis = async () => {
    if (!inputText.trim()) return;
    const currentSignature = generateRequestSignature(inputText);
    const now = Date.now();
    const existingEntry = submissionHistory.current.find(s => s.signature === currentSignature && (now - s.timestamp) < 300000);

    if (existingEntry) {
      setReplayWarning(`REPLAY ALERT: Signature [${currentSignature}] detected.`);
      setTimeout(() => setReplayWarning(null), 10000);
      return;
    }

    submissionHistory.current.push({ signature: currentSignature, timestamp: now });
    setState({ status: 'extracting', claims: [], results: {}, mode: 'document' });
    try {
      const extractedClaims = await extractClaims(inputText);
      setState(prev => ({ ...prev, status: 'verifying', claims: extractedClaims }));
      await processAnalysis(extractedClaims);
    } catch (error: any) {
      setState(prev => ({ ...prev, status: 'error', error: error.message }));
    }
  };

  const handleRunSimulation = async (scenario: SecurityScenario, isMock: boolean) => {
    setShowSimulator(false);
    setState({ status: 'verifying', claims: [], results: {}, mode: 'simulation', isMock });
    try {
      const { claims, results, persona } = await verifySecurityScenario(scenario, isMock);
      const verdictStats = { [Verdict.TRUE]: 0, [Verdict.LIKELY_TRUE]: 0, [Verdict.UNVERIFIED]: 0, [Verdict.FALSE]: 0 };
      let totalConfidence = 0;
      Object.values(results).forEach(c => { verdictStats[c.verdict]++; totalConfidence += c.confidence; });
      const avgConfidence = Math.round(totalConfidence / (Object.values(results).length || 1));
      const riskAnalysis = await generateRiskAnalysis(persona, verdictStats, avgConfidence);
      setState(prev => ({ ...prev, status: 'completed', claims, results, persona, riskAnalysis }));
    } catch (error: any) {
      setState(prev => ({ ...prev, status: 'error', error: error.message }));
    }
  };

  const summary = useMemo(() => {
    const claims = Object.values(state.results) as VerificationResult[];
    if (claims.length === 0) return null;
    const verdicts = { [Verdict.TRUE]: 0, [Verdict.LIKELY_TRUE]: 0, [Verdict.UNVERIFIED]: 0, [Verdict.FALSE]: 0 };
    let totalConfidence = 0;
    claims.forEach(c => { verdicts[c.verdict]++; totalConfidence += c.confidence; });
    return { total: claims.length, verdicts, avgConfidence: Math.round(totalConfidence / claims.length) };
  }, [state.results]);

  const reset = () => { setState({ status: 'idle', claims: [], results: {} }); setInputText(''); resetAiBudget(); };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFF]">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">ProofPilot</h1>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Enterprise v3.0</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSimulator(true)} className="text-[10px] font-bold text-slate-900 border-2 border-slate-900 px-4 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2">Lab</button>
            {state.status === 'completed' && (<button onClick={() => setShowReportModal(true)} className="text-[10px] font-bold text-indigo-600 border border-indigo-100 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors uppercase tracking-widest">Audit Report</button>)}
            <button onClick={handleRunTests} className="text-[10px] font-bold text-slate-400 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors uppercase">Health</button>
          </div>
        </div>
      </header>

      {replayWarning && (
        <div className="bg-red-600 text-white px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] animate-in slide-in-from-top duration-300 shadow-xl flex items-center justify-center gap-4 z-[60]">
          <svg className="w-5 h-5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01" /></svg>
          {replayWarning}
        </div>
      )}

      {showSimulator && <ScenarioSimulator onSelect={handleRunSimulation} onClose={() => setShowSimulator(false)} />}

      {testResults && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white text-slate-900 p-8 rounded-[2rem] shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h4 className="text-xl font-black uppercase tracking-widest">Health Report</h4>
              <button onClick={() => setTestResults(null)} className="p-2 hover:bg-slate-100 rounded-full"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="space-y-4">
              {testResults.map((tr, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${tr.passed ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-black text-slate-900">{tr.name}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${tr.passed ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{tr.passed ? "PASS" : "FAIL"}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">{tr.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showReportModal && state.status === 'completed' && <ReportModal state={state} onClose={() => setShowReportModal(false)} />}

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-8">
        {state.status === 'idle' && (
          <div className="max-w-2xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Enterprise Fact Audit.</h2>
              <p className="text-slate-500 text-lg font-medium">Verify claims, cross-reference sources, and detect adversarial patterns.</p>
            </div>
            <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-8">
                <textarea
                  className="w-full h-80 p-8 text-slate-800 border-none bg-slate-50 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none resize-none transition-all placeholder:text-slate-300 text-xl font-medium"
                  placeholder="Paste text for consensus audit or use the Lab..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>
              <div className="bg-slate-50 p-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                <div className="flex gap-3">
                   <div className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">Quota Safety Active</div>
                   <button onClick={() => setShowSimulator(true)} className="px-3 py-1 bg-indigo-600 text-[10px] font-bold text-white uppercase rounded-full shadow-lg">Simulation Lab</button>
                </div>
                <button onClick={handleStartAnalysis} disabled={!inputText.trim()} className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all uppercase tracking-widest text-sm disabled:opacity-50">Start Forensic Audit</button>
              </div>
            </div>
          </div>
        )}

        {state.status !== 'idle' && (
          <div className="flex flex-col gap-8">
            {state.status === 'completed' && state.persona && (
               <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl animate-in slide-in-from-top-4">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20"><svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                    <div>
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">AUDIT PERSONA</h4>
                      <p className="text-4xl font-black tracking-tight">{state.persona}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-center min-w-[150px]"><span className="text-3xl font-black block tabular-nums">{summary?.avgConfidence}%</span><p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Integrity Score</p></div>
               </div>
            )}

            {state.status === 'completed' && state.riskAnalysis && <RiskSummaryUI analysis={state.riskAnalysis} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl">
                  <h3 className="font-black text-slate-900 mb-6 uppercase tracking-[0.2em] text-[10px]">Forensic Pipeline</h3>
                  <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-1 before:bg-slate-50">
                    <div className={`relative pl-8 flex items-center gap-4 ${state.status !== 'extracting' ? 'text-green-600' : 'text-slate-400'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${state.status !== 'extracting' ? 'bg-green-600 border-green-600 text-white' : 'border-slate-100 bg-white'}`}>1</div>
                      <span className="text-[11px] font-black uppercase tracking-widest">{state.mode === 'simulation' ? 'Behavior Parsing' : 'Claim Discovery'}</span>
                    </div>
                    <div className={`relative pl-8 flex items-center gap-4 ${state.status === 'completed' || state.status === 'consistency-check' ? 'text-green-600' : state.status === 'verifying' ? 'text-indigo-600' : 'text-slate-400'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${state.status === 'completed' || state.status === 'consistency-check' ? 'bg-green-600 border-green-600 text-white' : state.status === 'verifying' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-100 bg-white'}`}>2</div>
                      <span className="text-[11px] font-black uppercase tracking-widest">Grounding Audit</span>
                    </div>
                  </div>
                </div>
                {summary && (
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Consensus Matrix</h3>
                    <div className="space-y-5">
                      {Object.entries(summary.verdicts).map(([verdict, count]) => (
                        <div key={verdict} className="flex items-center justify-between"><VerdictBadge verdict={verdict as Verdict} size="sm" /><span className="font-black text-slate-900 text-xl tabular-nums">{count}</span></div>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={reset} className="w-full py-6 bg-white border-2 border-slate-100 text-slate-900 font-black rounded-3xl hover:bg-slate-50 transition-all uppercase tracking-widest text-xs shadow-md">Release Session</button>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div className="space-y-8">
                  {state.claims.map(claim => (<ClaimCard key={claim.id} claim={claim} result={state.results[claim.id]} />))}
                </div>
                {state.status === 'verifying' && (
                   <div className="flex flex-col items-center justify-center py-24 bg-white border border-dashed border-slate-200 rounded-[3rem] shadow-inner">
                      <div className="w-16 h-16 border-[6px] border-indigo-50 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
                      <p className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Auditing Digital Fingerprints...</p>
                      <span className="text-[10px] text-slate-400 mt-2 font-bold">Querying High-Authority Grounding Indices</span>
                   </div>
                )}
                {state.status === 'error' && (
                  <div className="bg-red-50 p-10 rounded-[3rem] text-red-700 border border-red-100 shadow-xl flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></div>
                    <div><h4 className="font-black uppercase tracking-[0.2em] text-xs mb-2">Audit Pipeline Interrupted</h4><p className="text-sm font-medium leading-relaxed max-w-sm">{state.error}</p></div>
                    <button onClick={reset} className="mt-4 px-6 py-2 bg-red-600 text-white font-black text-[10px] uppercase rounded-xl">Retry</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
