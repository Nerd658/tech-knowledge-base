"use client";

import React, { useState, useEffect } from "react";
import { X, Zap, Terminal, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { CategoryDto, SimilarityMatch } from "@/types";
import { SimilarityWarning } from "@/components/entries/SimilarityWarning";

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuickCaptureModal({
  isOpen,
  onClose,
  onSuccess,
}: QuickCaptureModalProps) {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [quickSolution, setQuickSolution] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [environment, setEnvironment] = useState("Production");
  const [tagsInput, setTagsInput] = useState("");
  const [command, setCommand] = useState("");
  const [commandLang, setCommandLang] = useState("bash");

  // Similar issues state
  const [similarMatches, setSimilarMatches] = useState<SimilarityMatch[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => {
          setCategories(data.categories || []);
          if (data.categories?.length > 0) {
            setCategoryId(data.categories[0].id);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Real-time similarity checking when typing title or error
  useEffect(() => {
    if (!isOpen || (!title.trim() && !errorMessage.trim() && !symptoms.trim())) {
      setSimilarMatches([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/similarity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            errorMessage,
            symptoms,
            rootCause,
            threshold: 30,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setSimilarMatches(data.matches || []);
        }
      } catch (err) {
        console.error("Similarity check error:", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [title, errorMessage, symptoms, rootCause, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !symptoms.trim() || !quickSolution.trim()) {
      setError("Veuillez renseigner au minimum le Titre, le Symptôme et la Solution.");
      return;
    }

    setLoading(true);
    setError(null);

    const tags = tagsInput
      .split(/[\s,]+/)
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    const commandsPayload = command.trim()
      ? [
          {
            language: commandLang,
            command: command.trim(),
            description: "Commande de résolution",
          },
        ]
      : [];

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          symptoms,
          errorMessage,
          rootCause: rootCause || "Non spécifiée (Quick Capture)",
          quickSolution,
          categoryId,
          environment,
          tags,
          commands: commandsPayload,
          status: "VALIDATED",
          confidenceLevel: "VALIDATED",
          validationTested: true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erreur lors de l'enregistrement");
      }

      // Reset form
      setTitle("");
      setSymptoms("");
      setErrorMessage("");
      setRootCause("");
      setQuickSolution("");
      setTagsInput("");
      setCommand("");
      setSimilarMatches([]);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400">
            <Zap className="w-5 h-5 fill-amber-400/20" />
            <h2 className="font-bold text-sm text-slate-100">
              Quick Capture — Enregistrer en 1 minute
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Similar Warning if duplicate detected */}
          {similarMatches.length > 0 && (
            <SimilarityWarning matches={similarMatches} />
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">
              Titre du problème <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Wazuh agent disconnected, Nginx 502 Bad Gateway, SSL handshake failed..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Catégorie</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-100 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Environment */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Environnement</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-100 focus:outline-none"
              >
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="Test">Test</option>
                <option value="Dev">Dev</option>
                <option value="Local">Local</option>
              </select>
            </div>
          </div>

          {/* Symptoms */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">
              Symptômes observés <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Que constate-t-on ? (ex: les agents ne remontent plus les logs, timeout...)"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
            />
          </div>

          {/* Error Message */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">
              Message d'erreur / Logs exacts (optionnel mais recommandé)
            </label>
            <textarea
              rows={2}
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder="Copiez ici l'erreur brute : Connection refused, Error 1416F086..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 font-mono text-[11px] focus:outline-none resize-none"
            />
          </div>

          {/* Root Cause */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Cause racine</label>
            <input
              type="text"
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="Ex: Le port UDP 1514 était bloqué par le pare-feu..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Quick Solution */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">
              Solution Rapide <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={quickSolution}
              onChange={(e) => setQuickSolution(e.target.value)}
              placeholder="Ex: Autoriser UDP/1514 sur le firewall et redémarrer wazuh-manager."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
            />
          </div>

          {/* Quick Command */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>Commande de résolution</span>
              </label>
              <select
                value={commandLang}
                onChange={(e) => setCommandLang(e.target.value)}
                className="bg-slate-800 text-[10px] text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono"
              >
                <option value="bash">Bash / Shell</option>
                <option value="powershell">PowerShell</option>
                <option value="python">Python</option>
                <option value="sql">SQL</option>
                <option value="docker">Docker</option>
              </select>
            </div>
            <textarea
              rows={2}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="iptables -A INPUT -p udp --dport 1514 -j ACCEPT"
              className="w-full bg-black/80 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-emerald-400 placeholder-slate-600 font-mono text-[11px] focus:outline-none resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Tags (séparés par espace ou virgule)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="#wazuh #network #firewall #production"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Submit footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{loading ? "Enregistrement..." : "Enregistrer la fiche"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
