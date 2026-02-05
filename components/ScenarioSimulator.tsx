
import React, { useState } from 'react';
import { SecurityScenario, DocumentPersona, Verdict } from '../types';

const SCENARIOS: SecurityScenario[] = [
  {
    id: 'ds1',
    name: 'Honeypot Health Check',
    intent: 'Legitimate properly configured honeypot service validating connectivity.',
    expectedPersona: DocumentPersona.TRUSTED_SYSTEM,
    requests: [
      {
        "timestamp": "2026-02-01T10:15:03Z",
        "ip": "198.51.100.23",
        "method": "GET",
        "endpoint": "/api/honeypot/status",
        "headers": { "Authorization": "Bearer hp_test_token_abc123", "User-Agent": "Honeypot-Validator/1.0" },
        "response_time_ms": 420, "status_code": 401
      }
    ],
    mockResponse: {
      verdict: Verdict.TRUE,
      confidence: 95,
      explanation: "Auth token and UA entropy match known health-check patterns. Response timing is within nominal validator bounds."
    }
  },
  {
    id: 'ds2',
    name: 'Script Kiddie Recon Scan',
    intent: 'Automated scanning tool probing endpoints.',
    expectedPersona: DocumentPersona.SCRIPT_KIDDIE,
    requests: [
      {
        "timestamp": "2026-02-01T11:02:14Z",
        "ip": "203.0.113.77",
        "method": "GET", "endpoint": "/api/honeypot",
        "headers": { "User-Agent": "curl/7.88.1" }, "status_code": 404
      },
      {
        "timestamp": "2026-02-01T11:02:15Z",
        "ip": "203.0.113.77",
        "method": "POST", "endpoint": "/api/login",
        "headers": { "User-Agent": "curl/7.88.1" }, "payload_size": 12, "status_code": 404
      }
    ],
    mockResponse: {
      verdict: Verdict.FALSE,
      confidence: 58,
      explanation: "UA 'curl' combined with rapid 404 enumeration of sensitive endpoints (/api/login) indicates non-human exploration."
    }
  },
  {
    id: 'ds3',
    name: 'Replay Attack Simulation',
    intent: 'Same request replayed multiple times to force unauthorized access.',
    expectedPersona: DocumentPersona.AUTOMATED_BOT,
    requests: [
      {
        "timestamp": "2026-02-01T12:20:01Z",
        "ip": "192.0.2.44",
        "method": "POST", "endpoint": "/api/honeypot/verify",
        "headers": { "Authorization": "Bearer reused_token_xyz" }, "payload_hash": "9f86d081884c7d659a2feaa0c55ad015"
      },
      {
        "timestamp": "2026-02-01T12:20:04Z",
        "ip": "192.0.2.44",
        "method": "POST", "endpoint": "/api/honeypot/verify",
        "headers": { "Authorization": "Bearer reused_token_xyz" }, "payload_hash": "9f86d081884c7d659a2feaa0c55ad015"
      }
    ],
    mockResponse: {
      verdict: Verdict.FALSE,
      confidence: 92,
      explanation: "Deterministic replay signature detected. Multiple identical payload hashes with same bearer token within 3s window."
    }
  },
  {
    id: 'ds4',
    name: 'Slow Reconnaissance',
    intent: 'Low-and-slow probing to avoid detection by standard rate-limiters.',
    expectedPersona: DocumentPersona.RECON_SCANNER,
    requests: [
      {
        "timestamp": "2026-02-01T13:00:00Z", "ip": "198.51.100.88", "method": "GET", "endpoint": "/api/status", "status_code": 404 },
      {
        "timestamp": "2026-02-01T13:07:45Z", "ip": "198.51.100.88", "method": "OPTIONS", "endpoint": "/api/honeypot", "status_code": 403 }
    ],
    mockResponse: {
      verdict: Verdict.LIKELY_TRUE,
      confidence: 71,
      explanation: "Temporal spreading of 7+ minutes suggests manual or advanced recon designed to bypass simple threshold monitors."
    }
  },
  {
    id: 'ds5',
    name: 'Explanation Stress Test',
    intent: 'Mixed signals that require nuanced forensic explanation.',
    expectedPersona: DocumentPersona.SCRIPT_KIDDIE,
    requests: [
      {
        "timestamp": "2026-02-01T14:40:12Z", "ip": "203.0.113.15", "method": "POST", "endpoint": "/api/honeypot/verify",
        "headers": { "Authorization": "Bearer malformed_token" }, "response_time_ms": 2600, "status_code": 401
      }
    ],
    mockResponse: {
      verdict: Verdict.UNVERIFIED,
      confidence: 68,
      explanation: "Malformed token with high latency (2.6s) could indicate a server-side pressure test or slow-loris intent."
    }
  }
];

interface Props {
  onSelect: (scenario: SecurityScenario, isMock: boolean) => void;
  onClose: () => void;
}

const ScenarioSimulator: React.FC<Props> = ({ onSelect, onClose }) => {
  const [useMock, setUseMock] = useState(true);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border border-slate-200">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
               <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.727 2.903a2 2 0 01-1.39 1.416l-3.23.808a2 2 0 01-1.416-1.39l-.808-3.23a2 2 0 011.416-1.416l3.23-.808a2 2 0 011.416 1.39l.808 3.23a2 2 0 01-1.39 1.416l-3.23.808a2 2 0 01-1.416-1.39l-.808-3.23a2 2 0 011.416-1.416l3.23-.808a2 2 0 011.416 1.39l.808 3.23a2 2 0 01-1.39 1.416l-3.23.808a2 2 0 01-1.416-1.39l-.808-3.23a2 2 0 011.416-1.416l3.23-.808a2 2 0 011.416 1.39l.808 3.23a2 2 0 01-1.39 1.416l-3.23.808" />
               </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Forensic Simulation Lab</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Validate Behavioral Detection Logic</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[9px] font-black uppercase text-slate-400">Analysis Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={useMock} onChange={() => setUseMock(!useMock)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className="ml-3 text-[10px] font-black uppercase text-slate-900">{useMock ? 'Mocked' : 'Live AI'}</span>
              </label>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {SCENARIOS.map(s => (
            <button 
              key={s.id}
              onClick={() => onSelect(s, useMock)}
              className="group text-left p-8 rounded-[2rem] border border-slate-100 hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-100 transition-all bg-white flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                    {s.expectedPersona}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-0 group-hover:scale-100">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{s.name}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">{s.intent}</p>
              </div>
              <div className="bg-slate-900 rounded-2xl p-5 font-mono text-[9px] text-indigo-300 overflow-hidden max-h-32 shadow-inner border border-white/10 group-hover:border-indigo-500/30 transition-colors">
                <div className="text-slate-500 mb-2 uppercase tracking-widest text-[8px] font-black">Raw Log Sample:</div>
                <pre>{JSON.stringify(s.requests, null, 2)}</pre>
              </div>
            </button>
          ))}
        </div>
        
        <div className="p-8 bg-slate-900 border-t border-slate-800 text-center flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Digital Simulation Environment v3.0</p>
          <div className="flex gap-4">
            <span className="text-[9px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-3 py-1 rounded-full">Determinism: High</span>
            <span className="text-[9px] font-black text-indigo-400 uppercase bg-indigo-400/10 px-3 py-1 rounded-full">Persona Alignment: 98%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioSimulator;
