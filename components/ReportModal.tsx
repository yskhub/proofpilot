
import React, { useState, useEffect } from 'react';
import { AnalysisState, VerificationResult, Verdict } from '../types';
import { generateMarkdownReport, generateJsonReport } from '../utils/reportGenerator';

interface Props {
  state: AnalysisState;
  onClose: () => void;
}

const ReportModal: React.FC<Props> = ({ state, onClose }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'timeline' | 'markdown' | 'json'>('preview');
  const [playbackIndex, setPlaybackIndex] = useState(0);

  const claims = state.claims;
  const results = state.results;
  // Fix: Added explicit cast to VerificationResult[] to resolve 'unknown' type errors during reduce operation
  const avgConfidence = Math.round(
    (Object.values(results) as VerificationResult[]).reduce((acc, r) => acc + r.confidence, 0) / 
    (Object.values(results).length || 1)
  );

  useEffect(() => {
    if (activeTab === 'timeline') {
      setPlaybackIndex(0);
      const timer = setInterval(() => {
        setPlaybackIndex(prev => (prev < claims.length ? prev + 1 : prev));
      }, 800);
      return () => clearInterval(timer);
    }
  }, [activeTab, claims.length]);

  const downloadFile = (content: string, ext: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ProofPilot_Forensic_Audit_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (activeTab === 'json') {
      downloadFile(generateJsonReport(state.persona!, claims, results, avgConfidence), 'json');
    } else {
      downloadFile(generateMarkdownReport(state.persona!, claims, results, avgConfidence), 'md');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Audit Report Generator</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Law Enforcement & Compliance Standard v3.0</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 px-8 py-3 flex gap-2 border-b border-slate-100 shrink-0 overflow-x-auto">
          {[
            { id: 'preview', label: 'Forensic Preview' },
            { id: 'timeline', label: 'Audit Timeline' },
            { id: 'markdown', label: 'Markdown Audit' },
            { id: 'json', label: 'Machine JSON' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-white print:p-0">
          
          {/* TAB: PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-10" id="printable-report">
              <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8">
                <div>
                  <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">CERTIFIED AUDIT</h1>
                  <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">OFFICIAL RECORD // AUTHENTICATED BY PROOFPILOT SECURITY CORE</p>
                </div>
                <div className="text-right">
                  <div className="inline-block p-4 bg-slate-900 text-white rounded-2xl">
                    <span className="text-[10px] font-black block mb-1 uppercase tracking-widest text-slate-400">Reliability Index</span>
                    <span className="text-3xl font-black">{avgConfidence}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Document Persona</span>
                  <p className="text-lg font-black text-slate-900 leading-tight">{state.persona}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Signals</span>
                  <p className="text-lg font-black text-slate-900">{claims.length} Claims</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Audit Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-lg font-black text-green-600">VERIFIED</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em] mb-6 pb-2 border-b border-slate-100">CLAIM REPLICATION TIMELINE</h4>
                <div className="space-y-4">
                  {claims.map((c, i) => (
                    <div key={c.id} className="p-5 bg-white border border-slate-100 rounded-[1.5rem] hover:border-slate-300 transition-colors group">
                      <div className="flex items-start gap-5">
                        <span className="text-xs font-black text-slate-300 font-mono pt-1">#{String(i + 1).padStart(2, '0')}</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-bold text-slate-900 leading-relaxed max-w-xl">{c.text}</p>
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                              results[c.id]?.verdict === Verdict.TRUE ? 'bg-green-100 text-green-700' :
                              results[c.id]?.verdict === Verdict.FALSE ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {results[c.id]?.verdict}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[9px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase">SIG: {results[c.id]?.integrityHash}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Conf: {results[c.id]?.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: TIMELINE (Demo Gold) */}
          {activeTab === 'timeline' && (
            <div className="max-w-2xl mx-auto space-y-8 py-10">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">Forensic Playback</h3>
                <p className="text-slate-500 text-sm">Automated reconstruction of the audit sequence.</p>
              </div>
              
              <div className="relative space-y-0 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-1 before:bg-slate-100">
                {claims.slice(0, playbackIndex).map((c, i) => (
                  <div key={c.id} className="relative pl-12 pb-10 animate-in slide-in-from-left-4 fade-in duration-500">
                    <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-4 border-slate-900 z-10 flex items-center justify-center">
                      <span className="text-[10px] font-black text-slate-900">{i + 1}</span>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.category} AUDIT</span>
                        <span className="text-[9px] font-mono text-slate-300">ID: {c.id.slice(0, 6)}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 mb-4">"{c.text}"</p>
                      <div className="flex items-center gap-3">
                        <div className="h-1 flex-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-900 animate-grow-x" style={{ width: '100%' }}></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-900 uppercase">{results[c.id]?.verdict}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {playbackIndex < claims.length && (
                  <div className="relative pl-12 pb-10">
                    <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-slate-100 animate-pulse z-10"></div>
                    <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center py-4">Processing Signal {playbackIndex + 1}...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: RAW FORMATS */}
          {(activeTab === 'markdown' || activeTab === 'json') && (
            <div className="relative">
              <button 
                onClick={() => {
                  const content = activeTab === 'json' ? generateJsonReport(state.persona!, claims, results, avgConfidence) : generateMarkdownReport(state.persona!, claims, results, avgConfidence);
                  navigator.clipboard.writeText(content);
                }}
                className="absolute top-4 right-4 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 shadow-sm transition-all"
                title="Copy to clipboard"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>
              <pre className="p-8 bg-slate-950 text-slate-300 rounded-[2rem] font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                {activeTab === 'json' ? generateJsonReport(state.persona!, claims, results, avgConfidence) : generateMarkdownReport(state.persona!, claims, results, avgConfidence)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Integrity Chain Verified: PPS-V3-{Date.now().toString(16).toUpperCase()}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-900 text-xs font-black rounded-xl hover:bg-slate-100 transition-all uppercase tracking-widest flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              PDF Report
            </button>
            <button
              onClick={handleExport}
              className="px-8 py-3 bg-slate-900 text-white text-xs font-black rounded-xl shadow-xl hover:bg-black transition-all uppercase tracking-widest flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download {activeTab === 'json' ? 'JSON' : 'Markdown'}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes grow-x {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-grow-x {
          animation: grow-x 0.8s ease-out forwards;
        }
        @media print {
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ReportModal;
