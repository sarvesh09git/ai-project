import React, { useState } from 'react';
import { Cpu, ChevronDown, ChevronUp, CheckCircle, Terminal, HelpCircle } from 'lucide-react';

export default function AgentLogDrawer({ logs = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!logs || logs.length === 0) return null;

  return (
    <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 hover:bg-slate-200 transition text-slate-700 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-emerald-600 animate-pulse" />
          <span className="font-semibold text-sm">AI Agent Decision Logs & Reasoning</span>
          <span className="bg-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {logs.length} Steps
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 font-medium">
            {isOpen ? "Hide Steps" : "Show why Agent suggested this"}
          </span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 bg-slate-900 text-slate-300 font-mono text-xs space-y-4 max-h-96 overflow-y-auto">
          <div className="text-[10px] text-slate-400 border-b border-slate-800 pb-2 flex items-center gap-1.5">
            <Terminal className="h-3 w-3 text-emerald-500" />
            <span>SwasthyaAI Multi-Agent Reasoning Chain (ReAct Flow)</span>
          </div>

          {logs.map((log, index) => (
            <div key={index} className="border-l-2 border-emerald-500 pl-3 py-1 space-y-1.5">
              
              {/* Agent Node */}
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <Cpu className="h-3.5 w-3.5" />
                <span>[{log.agent}]</span>
              </div>

              {/* Thought */}
              {log.thought && (
                <div>
                  <span className="text-amber-400 font-semibold">💭 Thought:</span>{' '}
                  <span className="text-slate-200">{log.thought}</span>
                </div>
              )}

              {/* Action / Tool Call */}
              {log.action && (
                <div className="flex items-start gap-1 bg-slate-800/80 p-1.5 rounded-md border border-slate-800 text-cyan-300">
                  <span className="font-semibold text-cyan-400">🔧 Action/Tool:</span>{' '}
                  <span>{log.action}</span>
                </div>
              )}

              {/* Observation */}
              {log.observation && (
                <div className="flex items-center gap-1.5 text-slate-400 pl-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-300">Observation:</strong> {log.observation}
                  </span>
                </div>
              )}

            </div>
          ))}

          <div className="text-[10px] text-slate-500 text-right pt-2 border-t border-slate-800">
            * Logs illustrate dynamic task-routing decisions based on user keywords and GPS coordinates.
          </div>
        </div>
      )}
    </div>
  );
}
