"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Terminal, ArrowRight, Shield, Layers, CornerDownLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { KnowledgeEntryDto } from "@/types";
import { useRouter } from "next/navigation";
import { CopyButton } from "@/components/entries/CopyButton";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KnowledgeEntryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      searchEntries("");
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global key listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (isOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        } else if (e.key === "Enter" && results[selectedIndex]) {
          e.preventDefault();
          navigateToEntry(results[selectedIndex].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const searchEntries = async (text: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/entries?q=${encodeURIComponent(text)}&limit=8`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.entries || []);
        setSelectedIndex(0);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    searchEntries(val);
  };

  const navigateToEntry = (id: string) => {
    onClose();
    router.push(`/entries/${id}`);
  };

  if (!isOpen) return null;

  const selectedEntry = results[selectedIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Rechercher par problème, symptôme, code d'erreur, port, commande (ex: 1514 wazuh, SSL handshake, OOMKilled)..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                searchEntries("");
              }}
              className="p-1 text-slate-500 hover:text-slate-300 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            ESC
          </span>
        </div>

        {/* Search Content Body (Split view: Results list + Quick preview) */}
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden flex-1 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Results Column */}
          <div className="md:col-span-5 overflow-y-auto p-2 space-y-1 max-h-[60vh]">
            {loading && (
              <div className="text-center py-8 text-xs text-slate-500 font-mono">
                Recherche dans la mémoire technique...
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="text-center py-10 px-4 text-xs text-slate-400 space-y-2">
                <p className="font-semibold text-slate-300">Aucun problème correspondant</p>
                <p className="text-slate-500">
                  Essayez avec un mot-clé approximatif, un port, un nom de service ou un message d'erreur.
                </p>
              </div>
            )}

            {!loading &&
              results.map((entry, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={entry.id}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => navigateToEntry(entry.id)}
                    className={`p-3 rounded-lg cursor-pointer transition flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-blue-600/20 border border-blue-500/40 text-white"
                        : "hover:bg-slate-800/60 text-slate-300 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-blue-400">
                        {entry.readableId}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {entry.category?.name || "Général"}
                      </span>
                    </div>

                    <div className="font-medium text-xs text-slate-100 line-clamp-1">
                      {entry.title}
                    </div>

                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {entry.quickSolution}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Quick Preview Column */}
          <div className="md:col-span-7 overflow-y-auto p-4 bg-slate-950/40 max-h-[60vh] space-y-4">
            {selectedEntry ? (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono text-blue-400 font-bold">
                      {selectedEntry.readableId}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-[11px] text-slate-400">
                      {selectedEntry.environment}
                    </span>
                    {selectedEntry.validationTested && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Validé
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    {selectedEntry.title}
                  </h3>
                </div>

                {/* Symptom */}
                <div className="bg-slate-900 border border-rose-900/30 p-3 rounded-lg space-y-1">
                  <div className="font-mono text-[10px] text-rose-400 uppercase font-bold">
                    Symptôme
                  </div>
                  <div className="text-slate-300 text-xs">{selectedEntry.symptoms}</div>
                </div>

                {/* Solution */}
                <div className="bg-slate-900 border border-emerald-900/30 p-3 rounded-lg space-y-1">
                  <div className="font-mono text-[10px] text-emerald-400 uppercase font-bold">
                    Solution Rapide
                  </div>
                  <div className="text-emerald-200 text-xs font-medium">
                    {selectedEntry.quickSolution}
                  </div>
                </div>

                {/* Commands */}
                {selectedEntry.commands && selectedEntry.commands.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-mono text-[10px] text-blue-400 uppercase font-bold">
                      Commandes ({selectedEntry.commands.length})
                    </div>
                    {selectedEntry.commands.slice(0, 2).map((cmd, idx) => (
                      <div
                        key={idx}
                        className="bg-black/90 p-2.5 rounded border border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            {cmd.description || "Commande"}
                          </span>
                          <CopyButton text={cmd.command} />
                        </div>
                        <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto">
                          <code>{cmd.command}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => navigateToEntry(selectedEntry.id)}
                  className="w-full mt-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/20"
                >
                  <span>Ouvrir la fiche complète</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-slate-500 text-xs">
                Sélectionnez un résultat pour afficher l'aperçu instantané.
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ pour naviguer</span>
            <span>↵ pour ouvrir</span>
            <span>ESC pour fermer</span>
          </div>
          <span>Tech Memory KB</span>
        </div>
      </div>
    </div>
  );
}
