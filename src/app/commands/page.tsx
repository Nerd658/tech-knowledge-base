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
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
          <Terminal className="w-5 h-5 text-blue-400" />
          <span>Bibliothèque de Commandes & Snippets</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Catalogue centralisé des commandes éprouvées lors des résolutions d'incidents.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une commande, un flag, un port (ex: ss -lunp, iptables, openssl, tcpdump)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none font-mono"
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
          >
            Rechercher
          </button>
        </div>
      </div>

      {/* Commands List */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-xs font-mono">
          Chargement des snippets techniques...
        </div>
      ) : commands.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-2">
          <Code2 className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">Aucune commande trouvée</h3>
          <p className="text-xs text-slate-500">
            Aucun snippet ne correspond à votre recherche.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {commands.map((cmd) => (
            <div
              key={cmd.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition group"
            >
              {/* Header description + Language badge + Copy */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                    {cmd.language}
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {cmd.description || "Commande technique"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {cmd.entry && (
                    <Link
                      href={`/entries/${cmd.entry.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-blue-400 transition"
                    >
                      <span>{cmd.entry.readableId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                  <CopyButton text={cmd.command} />
                </div>
              </div>

              {/* Code block */}
              <pre className="bg-black/90 rounded-lg p-3 text-xs font-mono text-emerald-400 border border-slate-850 overflow-x-auto selection:bg-emerald-950">
                <code>{cmd.command}</code>
              </pre>

              {/* Expected output & Context */}
              {(cmd.expectedOutput || cmd.context) && (
                <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                  {cmd.context && <div>Contexte : {cmd.context}</div>}
                  {cmd.expectedOutput && (
                    <div>
                      <span className="text-slate-500">Attendu : </span>
                      <span className="text-slate-300">{cmd.expectedOutput}</span>
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
