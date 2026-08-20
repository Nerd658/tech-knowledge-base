"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, Award } from "lucide-react";
import { calculateQualityScore } from "@/lib/quality";

interface QualityBadgeProps {
  entry: any;
  showBreakdown?: boolean;
}

export function QualityBadge({ entry, showBreakdown = false }: QualityBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const breakdown = calculateQualityScore(entry);
  const score = breakdown.score;

  let badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  if (score < 60) {
    badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/30";
  } else if (score < 80) {
    badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/30";
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor} hover:brightness-110 transition`}
        title="Voir les détails de complétude de la fiche"
      >
        <Award className="w-3.5 h-3.5" />
        <span>Qualité : {score}%</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-4 z-50 text-left text-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <span className="font-semibold text-slate-200">Score de complétude</span>
            <span className={`font-bold ${score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-400"}`}>
              {score} / 100
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {breakdown.checklist.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-300">
                {item.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={`font-medium ${item.valid ? "text-slate-200" : "text-slate-500"}`}>
                    {item.label} <span className="text-[10px] text-slate-500">({item.points} pts)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{item.description}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mt-3 w-full py-1 text-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}
