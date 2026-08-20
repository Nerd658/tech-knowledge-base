"use client";

import React from "react";
import { InvestigationStepDto } from "@/types";
import { Search, CheckCircle, HelpCircle } from "lucide-react";
import { CopyButton } from "./CopyButton";

interface InvestigationTimelineProps {
  steps: InvestigationStepDto[];
}

export function InvestigationTimeline({ steps }: InvestigationTimelineProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm italic bg-slate-900/40 rounded-lg border border-slate-800">
        Aucune investigation détaillée n'a été consignée pour ce problème.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
      {steps.map((step, idx) => (
        <div key={idx} className="relative group">
          {/* Node dot */}
          <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-slate-900 border-2 border-blue-500 flex items-center justify-center text-[10px] font-mono font-bold text-blue-400">
            {step.stepNumber || idx + 1}
          </div>

          <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition rounded-xl p-5 space-y-3.5">
            {/* Hypothesis */}
            <div className="flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-mono font-bold uppercase text-blue-400">
                  Hypothèse {step.stepNumber || idx + 1}
                </div>
                <div className="text-sm font-semibold text-slate-200 mt-0.5">
                  {step.hypothesis}
                </div>
              </div>
            </div>

            {/* Test Command & Result */}
            {step.command && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    Commande ou test exécuté :
                  </span>
                  <CopyButton text={step.command} />
                </div>
                <pre className="bg-black/80 rounded-lg p-3 text-xs font-mono text-cyan-300 border border-slate-800 overflow-x-auto">
                  <code>{step.command}</code>
                </pre>
              </div>
            )}

            {step.result && (
              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-mono">Résultat observé :</div>
                <pre className="bg-slate-950 rounded-lg p-3 text-xs font-mono text-slate-300 border border-slate-850 overflow-x-auto whitespace-pre-wrap">
                  {step.result}
                </pre>
              </div>
            )}

            {/* Conclusion */}
            <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-400 uppercase font-mono mr-1.5">
                  Conclusion :
                </span>
                <span className="text-slate-300">{step.conclusion}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
