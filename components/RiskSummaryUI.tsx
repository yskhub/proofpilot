
import React from 'react';
import { RiskAnalysis } from '../types';

interface Props {
  analysis: RiskAnalysis;
}

const RiskSummaryUI: React.FC<Props> = ({ analysis }) => {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 border-b border-slate-50 bg-slate-900 text-white">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter leading-none">Integrity Advisor</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gemini Neural Insight Layer</span>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Executive Interpretation</h4>
          <p className="text-slate-700 font-medium leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 italic">
            "{analysis.summary}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Identified Vulnerabilities</h4>
            <ul className="space-y-3">
              {analysis.identifiedRisks.map((risk, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></div>
                  <span className="text-sm text-slate-600 font-medium leading-snug">{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Recommended Mitigation</h4>
            <ul className="space-y-3">
              {analysis.suggestedActions.map((action, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></div>
                  <span className="text-sm text-slate-600 font-medium leading-snug">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="px-8 py-4 bg-slate-50 border-t border-slate-100">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
          Note: This insight layer provides contextual reasoning and does not modify the forensic verdict data.
        </p>
      </div>
    </div>
  );
};

export default RiskSummaryUI;
