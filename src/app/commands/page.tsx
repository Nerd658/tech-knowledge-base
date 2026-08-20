"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Terminal, Search, ExternalLink, Code2, Layers, Filter } from "lucide-react";
import { CopyButton } from "@/components/entries/CopyButton";

export default function CommandsLibraryPage() {
  const [commands, setCommands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState("");

  useEffect(() => {
    fetchCommands();
  }, [selectedLang]);

  const fetchCommands = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (selectedLang) params.set("language", selectedLang);

    try {
      const res = await fetch(`/api/commands?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCommands(data.commands || []);
      }
    } catch (err) {
      console.error("Error fetching commands:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCommands();
  };

  const languages = [
    { label: "Tous les shells", value: "" },
    { label: "Bash / Shell", value: "bash" },
    { label: "PowerShell", value: "powershell" },
    { label: "Python", value: "python" },
    { label: "Docker", value: "docker" },
    { label: "SQL", value: "sql" },
    { label: "YAML / JSON", value: "yaml" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-white/[0.07] pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2.5 tracking-tight">
          <Terminal className="w-5 h-5 text-blue-400" />
          <span>Bibliothèque de Commandes & Snippets</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Catalogue centralisé des commandes éprouvées lors des résolutions d'incidents.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel border border-white/[0.08] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 shadow-lg">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une commande, un flag, un port (ex: ss -lunp, iptables, openssl, tcpdump)..."
            className="w-full pl-10 pr-3 py-2.5 bg-slate-950/90 border border-white/[0.08] focus:border-blue-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition shadow-inner font-mono"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-slate-950/90 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none font-mono transition"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={fetchCommands}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-600/20 active:scale-95"
          >
            Filtrer
          </button>
        </div>
      </div>

      {/* Commands List */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-xs font-mono">
          Chargement des snippets techniques...
        </div>
      ) : commands.length === 0 ? (
        <div className="text-center py-16 glass-panel border border-white/[0.06] rounded-2xl p-8 space-y-2">
          <Code2 className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">Aucune commande trouvée</h3>
          <p className="text-xs text-slate-500">
            Aucun snippet ne correspond à vos critères de recherche.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {commands.map((cmd) => (
            <div
              key={cmd.id}
              className="glass-card rounded-2xl p-4 space-y-3 transition-all group"
            >
              {/* Header description + Language badge + Copy */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {cmd.language}
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {cmd.description || "Commande technique"}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {cmd.entry && (
                    <Link
                      href={`/entries/${cmd.entry.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-blue-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-white/[0.05] transition"
                    >
                      <span>{cmd.entry.readableId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                  <CopyButton text={cmd.command} />
                </div>
              </div>

              {/* Code block */}
              <pre className="bg-black/90 rounded-xl p-3 text-xs font-mono text-emerald-400 border border-white/[0.06] overflow-x-auto shadow-inner selection:bg-emerald-950">
                <code>{cmd.command}</code>
              </pre>

              {/* Expected output & Context */}
              {(cmd.expectedOutput || cmd.context) && (
                <div className="pt-2.5 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                  {cmd.context && <div>Contexte : {cmd.context}</div>}
                  {cmd.expectedOutput && (
                    <div>
                      <span className="text-slate-500">Attendu : </span>
                      <span className="text-slate-300 font-medium">{cmd.expectedOutput}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
