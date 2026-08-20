"use client";

import React from "react";
import { ResolutionStepDto } from "@/types";
import { CopyButton } from "./CopyButton";
import { ListOrdered, CheckCheck, Info } from "lucide-react";

interface ResolutionStepsListProps {
  steps: ResolutionStepDto[];
}

export function ResolutionStepsList({ steps }: ResolutionStepsListProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm italic bg-slate-900/40 rounded-lg border border-slate-800">
        Aucune procédure détaillée par étape n'est enregistrée.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step, idx) => (
        <div
          key={idx}
          className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3 relative overflow-hidden"
        >
          {/* Top header */}
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 font-mono font-bold text-xs border border-blue-500/30">
              #{step.stepNumber || idx + 1}
            </span>
            <h4 className="text-sm font-semibold text-slate-100">{step.title}</h4>
          </div>

          {step.description && (
            <p className="text-xs text-slate-300 leading-relaxed pl-10">
              {step.description}
            </p>
          )}

          {step.command && (
            <div className="pl-10 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Commande à exécuter :</span>
                <CopyButton text={step.command} />
              </div>
              <pre className="bg-black/90 rounded-lg p-3 text-xs font-mono text-emerald-400 border border-slate-800 overflow-x-auto">
                <code>{step.command}</code>
              </pre>
            </div>
          )}

          {step.expectedResult && (
            <div className="pl-10 flex items-start gap-2 text-xs text-slate-400">
              <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-300">Résultat attendu : </span>
                <span className="font-mono text-emerald-400/90">{step.expectedResult}</span>
              </div>
            </div>
          )}

          {step.notes && (
            <div className="pl-10 flex items-start gap-2 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-300">Remarque : </span>
                <span className="text-slate-400">{step.notes}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
