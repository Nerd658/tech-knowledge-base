"use client";

import React from "react";
import { CopyButton } from "./CopyButton";
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Terminal,
  Activity,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { KnowledgeEntryDto } from "@/types";

interface QuickFixCardProps {
  entry: KnowledgeEntryDto;
}

export function QuickFixCard({ entry }: QuickFixCardProps) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-blue-500/30 relative">
      {/* Top subtle highlight line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

      {/* Header Banner */}
      <div className="bg-slate-900/80 px-6 py-4 border-b border-white/[0.07] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg shadow-sm">
            QUICK FIX
          </span>
          <span className="text-slate-400 text-xs font-mono font-semibold">
            {entry.readableId}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-xs font-medium text-slate-300">
            {entry.category?.name || "Non catégorisé"}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-xs text-slate-400 font-mono">{entry.environment}</span>
        </div>

        <div className="flex items-center gap-2">
          {entry.validationTested ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 rounded-full shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Solution certifiée
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-0.5 rounded-full shadow-sm">
              <Activity className="w-3.5 h-3.5" />
              En cours de test
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 1. SYMPTÔME & ERREUR */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>1. Symptôme & Message d'erreur</span>
          </div>
          <div className="bg-slate-950/90 border border-rose-900/30 rounded-xl p-4 text-slate-200 text-sm leading-relaxed shadow-inner">
            <p className="font-medium text-slate-100 mb-2">{entry.symptoms}</p>
            {entry.errorMessage && (
              <div className="mt-3">
                <div className="text-[11px] font-mono text-rose-400/90 mb-1.5 flex items-center justify-between">
                  <span>Log d'erreur / Stacktrace :</span>
                  <CopyButton text={entry.errorMessage} label="Copier erreur" />
                </div>
                <pre className="bg-black/80 border border-rose-950/70 rounded-xl p-3.5 text-xs font-mono text-rose-300 overflow-x-auto whitespace-pre-wrap selection:bg-rose-900/40">
                  {entry.errorMessage}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* 2. CAUSE RACINE */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            <span>2. Cause Racine (Root Cause)</span>
            <span className="text-[10px] font-normal px-2 py-0.5 bg-amber-500/10 border border-amber-500/25 text-amber-300 rounded-md font-mono">
              {entry.rootCauseCategory}
            </span>
          </div>
          <div className="bg-slate-950/90 border border-amber-900/30 rounded-xl p-4 text-slate-200 text-sm leading-relaxed shadow-inner">
            <p className="text-slate-100">{entry.rootCause}</p>
            {entry.responsibleComponent && (
              <p className="text-xs text-slate-400 mt-2.5 pt-2 border-t border-slate-900">
                <span className="text-slate-400 font-medium">Composant responsable :</span>{" "}
                <span className="font-mono text-slate-300 font-semibold">{entry.responsibleComponent}</span>
              </p>
            )}
          </div>
        </div>

        {/* 3. SOLUTION RAPIDE */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>3. Solution Finale</span>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 text-emerald-100 text-sm leading-relaxed font-medium shadow-inner">
            {entry.quickSolution}
          </div>
        </div>

        {/* 4. COMMANDES DE RÉSOLUTION */}
        {entry.commands && entry.commands.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Terminal className="w-4 h-4" />
                <span>4. Commandes Immédiates</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {entry.commands.length} commande(s)
              </span>
            </div>

            <div className="space-y-3">
              {entry.commands.map((cmd, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/90 border border-white/[0.08] rounded-xl p-3.5 space-y-2.5 shadow-inner"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold border border-white/[0.06]">
                        {cmd.language}
                      </span>
                      <span className="text-xs font-medium text-slate-200">
                        {cmd.description || `Commande ${idx + 1}`}
                      </span>
                    </div>
                    <CopyButton text={cmd.command} />
                  </div>

                  <pre className="bg-black/90 rounded-lg p-3 text-xs font-mono text-emerald-400 overflow-x-auto border border-white/[0.05]">
                    <code>{cmd.command}</code>
                  </pre>

                  {cmd.expectedOutput && (
                    <div className="text-[11px] font-mono text-slate-400 pt-1">
                      <span className="text-slate-400">Sortie attendue : </span>
                      <code className="text-slate-300 font-medium">{cmd.expectedOutput}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. VALIDATION & MÉTADONNÉES */}
        <div className="pt-3.5 border-t border-white/[0.07] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Technologies :{" "}
              <strong className="text-slate-200 font-medium">
                {(entry.technologies || []).join(", ") || "N/A"}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {entry.lastTestedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Dernier test validé :{" "}
                <strong className="text-slate-200 font-mono font-medium">
                  {new Date(entry.lastTestedAt).toLocaleDateString("fr-FR")}
                </strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
