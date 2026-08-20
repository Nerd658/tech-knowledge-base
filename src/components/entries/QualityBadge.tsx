"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, Award, ChevronDown } from "lucide-react";
import { calculateQualityScore } from "@/lib/quality";

interface QualityBadgeProps {
  entry: any;
  showBreakdown?: boolean;
}

export function QualityBadge({ entry, showBreakdown = false }: QualityBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const breakdown = calculateQualityScore(entry);
  const score = breakdown.score;

  let badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-950/20";
  let barColor = "bg-emerald-400";
  if (score < 60) {
    badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-rose-950/20";
    barColor = "bg-rose-400";
  } else if (score < 80) {
    badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-950/20";
    barColor = "bg-amber-400";
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor} hover:brightness-125 transition shadow-sm`}
        title="Voir les détails du score de qualité"
      >
        <Award className="w-3.5 h-3.5" />
        <span className="font-mono">{score}%</span>
        <div className="w-10 h-1.5 bg-slate-800 rounded-full overflow-hidden shrink-0">
          <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${score}%` }} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 glass-panel border border-white/[0.12] rounded-2xl shadow-2xl p-5 z-50 text-left text-xs backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
            <div>
              <span className="font-bold text-slate-100 text-sm">Score de Complétude</span>
              <p className="text-[11px] text-slate-400">9 critères de capitalisation technique</p>
            </div>
            <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded-lg ${score >= 80 ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : score >= 60 ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" : "text-rose-400 bg-rose-500/10 border border-rose-500/20"}`}>
              {score} / 100
            </span>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {breakdown.checklist.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-slate-300">
                {item.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${item.valid ? "text-slate-200" : "text-slate-500"}`}>
                      {item.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">+{item.points} pts</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{item.description}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mt-4 w-full py-1.5 text-center bg-slate-800/80 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-semibold transition border border-white/[0.06]"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}
