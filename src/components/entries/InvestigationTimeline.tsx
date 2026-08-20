"use client";

import React from "react";
import { InvestigationStepDto } from "@/types";
import { Search, CheckCircle, HelpCircle, ArrowRight } from "lucide-react";
import { CopyButton } from "./CopyButton";

interface InvestigationTimelineProps {
  steps: InvestigationStepDto[];
}

export function InvestigationTimeline({ steps }: InvestigationTimelineProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm italic glass-panel rounded-2xl border border-white/[0.06]">
        Aucune investigation détaillée n'a été consignée pour ce problème.
      </div>
    );
  }

  return (
    <div className="relative pl-7 space-y-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-blue-500/50 before:via-slate-800 before:to-transparent">
      {steps.map((step, idx) => (
        <div key={idx} className="relative group">
          {/* Glowing node ring */}
          <div className="absolute -left-7 top-2 w-6 h-6 rounded-full bg-slate-950 border-2 border-blue-500 flex items-center justify-center text-[10px] font-mono font-bold text-blue-400 shadow-md shadow-blue-500/20 group-hover:scale-110 group-hover:border-blue-400 transition">
            {step.stepNumber || idx + 1}
          </div>

          <div className="glass-panel border border-white/[0.07] hover:border-blue-500/30 transition-all rounded-2xl p-5 space-y-4 shadow-lg">
            {/* Hypothesis */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-mono font-bold uppercase text-blue-400">
                  Hypothèse {step.stepNumber || idx + 1}
                </div>
                <div className="text-sm font-semibold text-slate-100 mt-0.5 leading-snug">
                  {step.hypothesis}
                </div>
              </div>
            </div>

            {/* Test Command & Result */}
            {step.command && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    Commande de diagnostic :
                  </span>
                  <CopyButton text={step.command} />
                </div>
                <pre className="bg-black/90 rounded-xl p-3 text-xs font-mono text-cyan-300 border border-white/[0.06] overflow-x-auto shadow-inner">
                  <code>{step.command}</code>
                </pre>
              </div>
            )}

            {step.result && (
              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-mono">Résultat observé :</div>
                <pre className="bg-slate-950/90 rounded-xl p-3 text-xs font-mono text-slate-300 border border-white/[0.05] overflow-x-auto whitespace-pre-wrap">
                  {step.result}
                </pre>
              </div>
            )}

            {/* Conclusion */}
            <div className="pt-3 border-t border-white/[0.07] flex items-start gap-2.5 text-xs">
              <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-emerald-400 uppercase font-mono mr-2">
                  Conclusion :
                </span>
                <span className="text-slate-200 font-medium">{step.conclusion}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
