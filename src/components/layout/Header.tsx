"use client";

import React from "react";
import { Search, Zap, Plus, Command, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenQuickCapture: () => void;
}

export function Header({ onOpenSearch, onOpenQuickCapture }: HeaderProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    if (pathname.startsWith("/entries/new")) return "Nouvelle Fiche d'Incident";
    if (pathname.startsWith("/entries/")) return "Fiche d'Incident & Runbook";
    if (pathname.startsWith("/entries")) return "Explorateur de Problèmes";
    if (pathname.startsWith("/commands")) return "Bibliothèque de Commandes";
    if (pathname.startsWith("/categories")) return "Gestion des Catégories";
    if (pathname.startsWith("/import-export")) return "Centre Import & Export";
    if (pathname.startsWith("/audit")) return "Journal d'Audit";
    return "Base de Connaissances";
  };

  return (
    <header className="h-14 bg-slate-950/70 backdrop-blur-xl border-b border-white/[0.07] px-6 flex items-center justify-between sticky top-0 z-20 transition-all">
      {/* Breadcrumb / Section Header */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="font-semibold text-slate-200">{getPageTitle()}</span>
      </div>

      {/* Global Search Bar Trigger (Raycast / Linear style Ctrl + K) */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex items-center gap-3 px-3.5 py-1.5 w-full max-w-md bg-slate-900/60 hover:bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-white/[0.08] hover:border-blue-500/40 rounded-xl text-xs transition-all shadow-inner shadow-black/40 group"
      >
        <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition" />
        <span className="flex-1 text-left truncate text-slate-400 group-hover:text-slate-300">
          Rechercher (erreur, symptôme, port, commande)...
        </span>
        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
          <kbd className="bg-slate-800/80 border border-slate-700/80 px-1.5 py-0.5 rounded shadow-sm">
            ⌘
          </kbd>
          <kbd className="bg-slate-800/80 border border-slate-700/80 px-1.5 py-0.5 rounded shadow-sm">
            K
          </kbd>
        </div>
      </button>

      {/* Right side actions */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenQuickCapture}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-500/50 rounded-xl text-xs font-semibold transition shadow-sm"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Capture</span>
        </button>

        <Link
          href="/entries/new"
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle Fiche</span>
        </Link>
      </div>
    </header>
  );
}
