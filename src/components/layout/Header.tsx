"use client";

import React from "react";
import { Search, Zap, Plus, BookOpen, Terminal, Sparkles } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenQuickCapture: () => void;
}

export function Header({ onOpenSearch, onOpenQuickCapture }: HeaderProps) {
  return (
    <header className="h-14 bg-slate-950/80 backdrop-blur border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Global Search Bar Trigger (Ctrl + K) */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex items-center gap-3 px-3.5 py-1.5 w-full max-w-lg bg-slate-900/90 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg text-xs transition shadow-inner group"
      >
        <Search className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
        <span className="flex-1 text-left truncate">
          Rechercher par problème, symptôme, code d'erreur, port, commande...
        </span>
        <div className="flex items-center gap-1">
          <kbd className="font-mono text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400">
            Ctrl
          </kbd>
          <kbd className="font-mono text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400">
            K
          </kbd>
        </div>
      </button>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenQuickCapture}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>+ Quick Capture</span>
        </button>

        <Link
          href="/entries/new"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle Fiche</span>
        </Link>
      </div>
    </header>
  );
}
