"use client";

import React from "react";
import { SimilarityMatch } from "@/types";
import { AlertCircle, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface SimilarityWarningProps {
  matches: SimilarityMatch[];
  onSelectExisting?: (match: SimilarityMatch) => void;
}

export function SimilarityWarning({
  matches,
  onSelectExisting,
}: SimilarityWarningProps) {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
        <AlertCircle className="w-4 h-4 text-amber-400" />
        <span>
          Attention : {matches.length} problème(s) similaire(s) existent déjà dans la base de connaissances
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-lg p-3 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400 text-[11px] font-bold">
                  {match.readableId}
                </span>
                <span className="font-semibold text-slate-100">{match.title}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {match.similarityScore}% similaire
                </span>
              </div>

              <div className="text-[11px] text-slate-400 line-clamp-1">
                <span className="text-emerald-400 font-medium">Solution : </span>
                {match.quickSolution}
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span>Correspondance sur :</span>
                {match.matchedFields.map((field, idx) => (
                  <span key={idx} className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                    {field}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/entries/${match.id}`}
                target="_blank"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              >
                <span>Consulter</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
