"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Download,
  Trash2,
  Edit,
  Share2,
  CheckCircle2,
  AlertTriangle,
  History,
  Terminal,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
  MessageSquare,
  GitCompare,
  Plus,
  Activity,
  FileCode,
} from "lucide-react";
import { KnowledgeEntryDto, SimilarityMatch } from "@/types";
import { QuickFixCard } from "@/components/entries/QuickFixCard";
import { CopyButton } from "@/components/entries/CopyButton";
import { QualityBadge } from "@/components/entries/QualityBadge";
import { InvestigationTimeline } from "@/components/entries/InvestigationTimeline";
import { ResolutionStepsList } from "@/components/entries/ResolutionStepsList";

export default function EntryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [entry, setEntry] = useState<KnowledgeEntryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "quickfix" | "investigation" | "steps" | "commands" | "relations" | "history" | "resources" | "comments" | "versions"
  >("quickfix");

  // New test resolution modal state
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEnv, setTestEnv] = useState("Production");
  const [testStatus, setTestStatus] = useState("SUCCESS");
  const [testNotes, setTestNotes] = useState("");
  const [testTester, setTestTester] = useState("Lead Engineer");
  const [savingTest, setSavingTest] = useState(false);

  // New comment state
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("Engineer");
  const [savingComment, setSavingComment] = useState(false);

  // Similar issues state for "J'ai déjà vu ça"
  const [similarIssues, setSimilarIssues] = useState<SimilarityMatch[]>([]);

  useEffect(() => {
    if (id) {
      fetchEntryDetails();
    }
  }, [id]);

  const fetchEntryDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/entries/${id}`);
      if (!res.ok) {
        throw new Error("Impossible de charger la fiche");
      }
      const data = await res.json();
      setEntry(data);

      // Fetch similar issues
      fetchSimilarIssues(data);
    } catch (err: any) {
      setError(err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarIssues = async (entryData: KnowledgeEntryDto) => {
    try {
      const res = await fetch("/api/similarity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: entryData.title,
          errorMessage: entryData.errorMessage,
          symptoms: entryData.symptoms,
          rootCause: entryData.rootCause,
          excludeId: entryData.id,
          threshold: 25,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSimilarIssues(data.matches || []);
      }
    } catch (err) {
      console.error("Error fetching similar issues:", err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!entry) return;
    try {
      const res = await fetch(`/api/entries/${entry.id}/favorite`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setEntry({ ...entry, isFavorite: data.isFavorite });
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const handleDeleteEntry = async () => {
    if (!entry) return;
    if (confirm("Êtes-vous certain de vouloir supprimer cette fiche technique ?")) {
      try {
        const res = await fetch(`/api/entries/${entry.id}`, { method: "DELETE" });
        if (res.ok) {
          router.push("/entries");
        }
      } catch (err) {
        console.error("Error deleting entry:", err);
      }
    }
  };

  const handleSaveTestResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;
    setSavingTest(true);
    try {
      const res = await fetch(`/api/entries/${entry.id}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          environment: testEnv,
          resultStatus: testStatus,
          notes: testNotes,
          testerName: testTester,
        }),
      });
      if (res.ok) {
        setShowTestModal(false);
        setTestNotes("");
        fetchEntryDetails();
      }
    } catch (err) {
      console.error("Error saving test result:", err);
    } finally {
      setSavingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-500 text-xs font-mono">
        Chargement des détails de la fiche...
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <h2 className="text-base font-bold text-slate-200">Fiche introuvable</h2>
        <p className="text-xs text-slate-400">{error || "Cette fiche n'existe pas ou a été supprimée."}</p>
        <Link
          href="/entries"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/entries"
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-400">
                {entry.readableId}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">{entry.category?.name}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-500 font-mono">
                {entry.viewCount} consultations
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-100 mt-0.5">
              {entry.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <QualityBadge entry={entry} />

          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`p-2 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 ${
              entry.isFavorite
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
            title="Ajouter aux favoris"
          >
            <Star className={`w-4 h-4 ${entry.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
          </button>

          <a
            href={`/api/export?format=markdown&id=${entry.id}`}
            download
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Exporter en Markdown"
          >
            <Download className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={() => setShowTestModal(true)}
            className="px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tester / Valider</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteEntry}
            className="p-2 rounded-lg border border-rose-900/40 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 transition"
            title="Supprimer la fiche"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. QUICK FIX CARD (Prominent in all cases) */}
      <QuickFixCard entry={entry} />

      {/* 2. TABBED DEEP DIVE SECTIONS */}
      <div className="space-y-4 pt-2">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("quickfix")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "quickfix"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Vue Synthèse
          </button>

          <button
            onClick={() => setActiveTab("investigation")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "investigation"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <span>Investigation & Raisonnement</span>
            {entry.investigations && entry.investigations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
                {entry.investigations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("steps")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "steps"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <span>Procédure Détaillée</span>
            {entry.resolutionSteps && entry.resolutionSteps.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
                {entry.resolutionSteps.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("commands")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "commands"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Commandes ({entry.commands?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("relations")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "relations"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Problèmes Liés ({similarIssues.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "history"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historique Tests ({entry.resolutionHistories?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("resources")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "resources"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ressources ({entry.resources?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("versions")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "versions"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <span>Versions ({entry.versions?.length || 1})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="pt-2">
          {/* TAB 1: QUICK FIX SUMMARY DETAILS */}
          {activeTab === "quickfix" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                {/* Contexte d'apparition */}
                {entry.contextDescription && (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1.5">
                    <h4 className="text-xs font-mono font-bold uppercase text-slate-400">
                      Contexte & Environnement
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {entry.contextDescription}
                    </p>
                  </div>
                )}

                {/* Description complète du problème */}
                {entry.problemDescription && (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1.5">
                    <h4 className="text-xs font-mono font-bold uppercase text-slate-400">
                      Description Technique
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {entry.problemDescription}
                    </p>
                  </div>
                )}

                {/* Conditions de déclenchement */}
                {entry.triggerConditions && (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1.5">
                    <h4 className="text-xs font-mono font-bold uppercase text-slate-400">
                      Facteur Déclencheur
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {entry.triggerConditions}
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="space-y-4 text-xs">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-slate-200 border-b border-slate-800 pb-2">
                    Classification & Systèmes
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-500 block">Environnement :</span>
                      <span className="font-medium text-slate-300">{entry.environment}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Catégorie Cause :</span>
                      <span className="font-medium text-amber-300">{entry.rootCauseCategory}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Technologies :</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(entry.technologies || []).map((tech, i) => (
                          <span
                            key={i}
                            className="bg-slate-800 text-blue-300 px-2 py-0.5 rounded text-[11px] font-mono"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Outils concernés :</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(entry.tools || []).map((tool, i) => (
                          <span
                            key={i}
                            className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-mono"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVESTIGATION */}
          {activeTab === "investigation" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Démarche d'Investigation & Raisonnement Technique</span>
              </h3>
              <InvestigationTimeline steps={entry.investigations || []} />
            </div>
          )}

          {/* TAB 3: RESOLUTION STEPS */}
          {activeTab === "steps" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200">
                Procédure de Résolution Pas-à-Pas (Runbook)
              </h3>
              <ResolutionStepsList steps={entry.resolutionSteps || []} />
            </div>
          )}

          {/* TAB 4: COMMANDS SNIPPETS */}
          {activeTab === "commands" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200">
                Commandes & Extraits de Code
              </h3>
              <div className="space-y-3">
                {(!entry.commands || entry.commands.length === 0) && (
                  <p className="text-xs text-slate-500 italic">Aucune commande enregistrée.</p>
                )}
                {entry.commands?.map((cmd, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-bold">
                          {cmd.language}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">
                          {cmd.description}
                        </span>
                      </div>
                      <CopyButton text={cmd.command} />
                    </div>
                    {cmd.context && (
                      <p className="text-[11px] text-slate-400 italic">{cmd.context}</p>
                    )}
                    <pre className="bg-black/90 p-3 rounded-lg text-xs font-mono text-emerald-400 border border-slate-800 overflow-x-auto">
                      <code>{cmd.command}</code>
                    </pre>
                    {cmd.expectedOutput && (
                      <div className="text-[11px] font-mono text-slate-400 pt-1">
                        <span className="text-slate-500">Résultat attendu : </span>
                        <code className="text-slate-300">{cmd.expectedOutput}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: RELATIONS & "J'AI DÉJÀ VU ÇA" */}
          {activeTab === "relations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Problèmes Similaires Détectés ("J'ai déjà vu ça")</span>
                </h3>
              </div>

              {similarIssues.length === 0 ? (
                <div className="text-center py-10 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-500 italic">
                  Aucun problème similaire détecté dans la base pour le moment.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {similarIssues.map((match) => (
                    <Link
                      key={match.id}
                      href={`/entries/${match.id}`}
                      className="p-4 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl transition space-y-2 block group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-blue-400">
                          {match.readableId}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {match.similarityScore}% similarité
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-100 group-hover:text-blue-400 transition line-clamp-1">
                        {match.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {match.quickSolution}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: TEST & VALIDATION HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200">
                  Historique des Tests & Re-validations
                </h3>
                <button
                  onClick={() => setShowTestModal(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  + Enregistrer un nouveau test
                </button>
              </div>

              {(!entry.resolutionHistories || entry.resolutionHistories.length === 0) ? (
                <div className="text-center py-10 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-500 italic">
                  Aucun historique de test enregistré pour le moment.
                </div>
              ) : (
                <div className="space-y-3">
                  {entry.resolutionHistories.map((hist, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400 text-[11px]">
                            {new Date(hist.testedAt).toLocaleDateString("fr-FR")}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="font-medium text-slate-200">
                            Environnement : {hist.environment}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400">Testé par : {hist.testerName}</span>
                        </div>
                        <p className="text-slate-300 text-xs">{hist.notes}</p>
                      </div>

                      <div className="shrink-0">
                        {hist.resultStatus === "SUCCESS" ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            ✓ Résolu avec succès
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            ✕ Échec
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: RESOURCES */}
          {activeTab === "resources" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200">
                Documentation & Ressources Associées
              </h3>
              {(!entry.resources || entry.resources.length === 0) ? (
                <div className="text-center py-10 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-500 italic">
                  Aucune ressource externe renseignée.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {entry.resources.map((res, idx) => (
                    <a
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl transition space-y-1 block group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-400">
                          {res.resourceType}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition" />
                      </div>
                      <h4 className="text-xs font-semibold text-slate-100 group-hover:text-blue-300 transition">
                        {res.title}
                      </h4>
                      {res.description && (
                        <p className="text-[11px] text-slate-400">{res.description}</p>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: VERSIONING */}
          {activeTab === "versions" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200">
                Historique Immuable des Versions
              </h3>
              <div className="space-y-3">
                {entry.versions?.map((v, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-400">
                          Version {v.versionNumber}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {new Date(v.createdAt).toLocaleString("fr-FR")}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-500">{v.modifiedBy}</span>
                      </div>
                      <p className="text-slate-300 mt-1">{v.changeSummary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test & Revalidation Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Enregistrer un test de validation</span>
            </h3>

            <form onSubmit={handleSaveTestResolution} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Environnement testé
                </label>
                <select
                  value={testEnv}
                  onChange={(e) => setTestEnv(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="Production">Production</option>
                  <option value="Staging">Staging</option>
                  <option value="Test">Test</option>
                  <option value="Dev">Dev</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Résultat du test
                </label>
                <select
                  value={testStatus}
                  onChange={(e) => setTestStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="SUCCESS">🟢 Validé / Résolu</option>
                  <option value="FAILURE">🔴 Échec</option>
                  <option value="PARTIAL">🟡 Partiellement résolu</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Notes & Observations
                </label>
                <textarea
                  rows={3}
                  required
                  value={testNotes}
                  onChange={(e) => setTestNotes(e.target.value)}
                  placeholder="Ex: Testé sur le cluster de production après rotation du certificat. 100% des flux sont rétablis sans régression."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingTest}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  {savingTest ? "Enregistrement..." : "Confirmer la validation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
