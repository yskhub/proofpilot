
import React, { useState } from 'react';
import { FactualClaim, VerificationResult, Verdict } from '../types';
import VerdictBadge from './VerdictBadge';
import AuditLogUI from './AuditLogUI';

interface Props {
  claim: FactualClaim;
  result?: VerificationResult;
}

const ClaimCard: React.FC<Props> = ({ claim, result }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  if (!result) {
    return (
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-slate-50 rounded w-1/4"></div>
      </div>
    );
  }

  const isAdjusted = result.consistencyFlag || result.auditLog.length > 0;
  const shareText = `🔍 ProofPilot Audit Report\n\nClaim: "${claim.text}"\nVerdict: ${result.verdict}\nReliability: ${result.confidence}%\n\nVerified via ProofPilot Enterprise Forensic Logic.`;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ProofPilot Claim Audit',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        console.debug('Share cancelled or failed', err);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Clipboard failed', err);
    }
  };

  return (
    <>
      <div 
        className={`bg-white rounded-[2rem] border transition-all duration-500 overflow-hidden ${
          isExpanded 
            ? 'ring-4 ring-indigo-50 border-transparent shadow-2xl scale-[1.01] z-20' 
            : 'border-slate-100 shadow-sm hover:border-slate-200 hover:shadow-md'
        } ${result.consistencyFlag ? 'border-amber-100' : ''}`}
      >
        <div 
          className="p-6 sm:p-8 cursor-pointer flex items-start gap-6"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {/* Dynamic Verdict Badge using standardized component */}
              <VerdictBadge verdict={result.verdict} />
              
              {isAdjusted && (
                <span className="flex items-center gap-1 text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
                  Audit Override
                </span>
              )}
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                {claim.category}
              </span>
            </div>
            <h3 className="text-slate-900 font-bold text-lg sm:text-xl leading-tight tracking-tight whitespace-pre-wrap">
              {claim.text}
            </h3>
          </div>
          
          <div className="flex flex-col items-end shrink-0 pt-1">
            <div className="flex items-center gap-2 mb-1">
              {/* Share Button integrated into card header */}
              <button 
                onClick={handleShare}
                className="p-2.5 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all duration-300 shadow-sm hover:shadow-md"
                title="Share Audit Result"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                isExpanded ? 'bg-slate-900 border-slate-900 text-white rotate-180' : 'bg-white border-slate-100 text-slate-300'
              }`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-black tabular-nums tracking-tighter ${
                result.confidence < 70 ? 'text-amber-500' : 'text-slate-900'
              }`}>
                {result.confidence}%
              </span>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">Reliability</p>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-6 sm:px-8 pb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Forensic Reasoning</h4>
                    {/* Explicit VerdictBadge for 'True' verdicts in the reasoning section */}
                    {result.verdict === Verdict.TRUE && (
                      <VerdictBadge verdict={Verdict.TRUE} size="sm" />
                    )}
                  </div>
                  <div className="h-[1px] flex-1 bg-slate-200 mx-4"></div>
                </div>
                <p className="text-slate-700 font-medium leading-relaxed text-sm sm:text-base italic bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  "{result.explanation}"
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                 <button 
                    onClick={(e) => { e.stopPropagation(); setShowAudit(!showAudit); }}
                    className={`text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all flex items-center gap-3 shadow-lg ${
                      showAudit 
                        ? 'bg-slate-900 text-white shadow-slate-200' 
                        : 'bg-white text-indigo-600 border border-indigo-50 hover:bg-indigo-50 hover:shadow-indigo-50 shadow-slate-100'
                    }`}
                 >
                    <svg className={`w-4 h-4 transition-transform duration-500 ${showAudit ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    {showAudit ? 'Conceal Trace' : 'Audit Trace'}
                 </button>

                 <button 
                    onClick={handleShare}
                    className="text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all flex items-center gap-3 shadow-lg bg-white text-slate-600 border border-slate-100 hover:bg-slate-50 shadow-slate-100"
                 >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Result
                 </button>
              </div>

              {showAudit && <AuditLogUI result={result} />}
              
              {result.sources.length > 0 && !showAudit && (
                <div className="mt-8">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Verification Grounding</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.sources.map((source, i) => (
                      <div key={i} className="group bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden hover:border-indigo-200 transition-all shadow-sm">
                        <a 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-5 hover:bg-indigo-50/30 transition-all"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            source.credibilityScore >= 0.8 ? 'bg-green-50 text-green-600' : 
                            source.credibilityScore >= 0.5 ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'
                          }`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 105.656 5.656l1.1 1.1" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-800 truncate block group-hover:text-indigo-900">{source.title}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new URL(source.uri).hostname}</span>
                          </div>
                        </a>
                        <div className="px-5 py-2.5 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-500">{source.credibilityReason}</span>
                          <span className={`text-[10px] font-black ${
                            source.credibilityScore >= 0.8 ? 'text-green-600' : 
                            source.credibilityScore >= 0.5 ? 'text-indigo-600' : 'text-red-600'
                          }`}>
                            {Math.round(source.credibilityScore * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Share Fallback Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col scale-in-center animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Export Audit</h3>
              </div>
              <button onClick={() => setShowShareModal(false)} className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Summary Transcript</label>
                <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 font-medium text-slate-700 text-sm whitespace-pre-wrap leading-relaxed shadow-inner">
                  <div className="mb-4">
                    <VerdictBadge verdict={result.verdict} size="sm" />
                  </div>
                  {shareText}
                </div>
              </div>
              <button 
                onClick={copyToClipboard}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 shadow-2xl ${
                  copyStatus === 'copied' 
                    ? 'bg-green-600 text-white shadow-green-100' 
                    : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98]'
                }`}
              >
                {copyStatus === 'copied' ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    Copy Audit Trail
                  </>
                )}
              </button>
            </div>
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Fingerprint: {result.integrityHash || 'SECURE'}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClaimCard;
