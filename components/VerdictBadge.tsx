
import React from 'react';
import { Verdict } from '../types';

interface Props {
  verdict: Verdict;
  size?: 'sm' | 'md';
}

const VerdictBadge: React.FC<Props> = ({ verdict, size = 'md' }) => {
  const styles = {
    [Verdict.TRUE]: 'bg-green-100 text-green-700 border-green-200',
    [Verdict.LIKELY_TRUE]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    [Verdict.UNVERIFIED]: 'bg-slate-100 text-slate-600 border-slate-200',
    [Verdict.FALSE]: 'bg-red-100 text-red-700 border-red-200',
  };

  const icons = {
    [Verdict.TRUE]: (
      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    [Verdict.LIKELY_TRUE]: (
      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    [Verdict.UNVERIFIED]: (
      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    [Verdict.FALSE]: (
      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[verdict]} ${size === 'md' ? 'text-sm' : 'text-xs'}`}>
      {icons[verdict]}
      {verdict}
    </span>
  );
};

export default VerdictBadge;
