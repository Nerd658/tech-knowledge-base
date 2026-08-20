"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Star,
  Layers,
  Terminal,
  ArrowUpDown,
  ExternalLink,
  Plus,
  Zap,
  Tag,
  Shield,
  Activity,
} from "lucide-react";
import { KnowledgeEntryDto, CategoryDto, TagDto } from "@/types";
import { CopyButton } from "@/components/entries/CopyButton";
import { QualityBadge } from "@/components/entries/QualityBadge";

function EntriesListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [entries, setEntries] = useState<KnowledgeEntryDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [tags, setTags] = useState<TagDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  // Filter states
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [environment, setEnvironment] = useState(searchParams.get("environment") || "");
  const [tag, setTag] = useState(searchParams.get("tag") || "");
  const [technology, setTechnology] = useState(searchParams.get("technology") || "");
  const [isFavorite, setIsFavorite] = useState(searchParams.get("isFavorite") === "true");
  const [sort, setSort] = useState(searchParams.get("sort") || "recent");

  // Fetch categories & tags
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
    fetch("/api/tags")
      .then((r) => r.json())
      .then((d) => setTags(d.tags || []));
  }, []);

  // Fetch entries on filter changes
  useEffect(() => {
    fetchEntries();
  }, [searchParams]);

  const fetchEntries = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchParams.get("q")) params.set("q", searchParams.get("q")!);
    if (searchParams.get("categoryId")) params.set("categoryId", searchParams.get("categoryId")!);
    if (searchParams.get("status")) params.set("status", searchParams.get("status")!);
    if (searchParams.get("environment")) params.set("environment", searchParams.get("environment")!);
    if (searchParams.get("tag")) params.set("tag", searchParams.get("tag")!);
    if (searchParams.get("technology")) params.set("technology", searchParams.get("technology")!);
    if (searchParams.get("isFavorite")) params.set("isFavorite", searchParams.get("isFavorite")!);
    if (searchParams.get("sort")) params.set("sort", searchParams.get("sort")!);
    if (searchParams.get("page")) params.set("page", searchParams.get("page")!);

    try {
      const res = await fetch(`/api/entries?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
        setPagination(data.pagination || { total: 0, page: 1, totalPages: 1 });
      }
    } catch (err) {
      console.error("Error fetching entries:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (categoryId) params.set("categoryId", categoryId);
    if (status) params.set("status", status);
    if (environment) params.set("environment", environment);
    if (tag) params.set("tag", tag);
    if (technology) params.set("technology", technology);
    if (isFavorite) params.set("isFavorite", "true");
    if (sort) params.set("sort", sort);
    params.set("page", "1");
    router.push(`/entries?${params.toString()}`);
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryId("");
    setStatus("");
    setEnvironment("");
    setTag("");
    setTechnology("");
    setIsFavorite(false);
    setSort("recent");
    router.push("/entries");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>Base de Connaissances & Incidents</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {pagination.total} problème(s) documenté(s) au total
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/entries/new"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Créer une fiche</span>
          </Link>
        </div>
      </div>

      {/* Advanced Filter Controls Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main search bar in list */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Filtrer par mot-clé, symptôme, commande, code d'erreur..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
          >
            Filtrer
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
          >
            Réinitialiser
          </button>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* Category */}
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 focus:outline-none"
          >
            <option value="">Toutes Catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 focus:outline-none"
          >
            <option value="">Tous Statuts</option>
            <option value="VALIDATED">🟢 VALIDATED</option>
            <option value="DRAFT">🟡 DRAFT</option>
            <option value="OUTDATED">⚠️ OUTDATED</option>
            <option value="UNRESOLVED">🔴 UNRESOLVED</option>
          </select>

          {/* Environment */}
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 focus:outline-none"
          >
            <option value="">Tous Environnements</option>
            <option value="Production">Production</option>
            <option value="Staging">Staging</option>
            <option value="Test">Test</option>
            <option value="Dev">Dev</option>
            <option value="Local">Local</option>
          </select>

          {/* Tag */}
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 focus:outline-none"
          >
            <option value="">Tous les Tags</option>
            {tags.map((t) => (
              <option key={t.id} value={t.slug}>
                #{t.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 focus:outline-none"
          >
            <option value="recent">Plus récents</option>
            <option value="views">Plus consultés</option>
            <option value="score">Qualité (%)</option>
            <option value="title">Titre (A-Z)</option>
            <option value="lastTested">Dernier test</option>
          </select>

          {/* Favorites toggle button */}
          <button
            type="button"
            onClick={() => {
              setIsFavorite(!isFavorite);
            }}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              isFavorite
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? "fill-amber-400" : ""}`} />
            <span>Favoris seuls</span>
          </button>
        </div>
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-xs font-mono">
          Chargement des fiches de connaissances...
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">Aucun problème trouvé</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Aucune fiche ne correspond aux critères sélectionnés. Essayez d'ajuster vos filtres
            ou d'enregistrer une nouvelle solution.
          </p>
          <button
            onClick={resetFilters}
            className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium transition"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-slate-900/90 hover:bg-slate-850/90 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition space-y-3 relative group shadow-sm"
            >
              {/* Header metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {entry.readableId}
                  </span>
                  <span className="text-slate-400 font-medium">{entry.category?.name}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{entry.environment}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {new Date(entry.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <QualityBadge entry={entry} />
                  {entry.status === "VALIDATED" ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      🟢 Validé
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      🟡 {entry.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Quick Link */}
              <Link href={`/entries/${entry.id}`} className="block group">
                <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition">
                  {entry.title}
                </h3>
              </Link>

              {/* Symptoms summary */}
              <p className="text-xs text-slate-300 line-clamp-2">
                <span className="font-semibold text-rose-400/90 font-mono text-[11px] uppercase mr-1">
                  Symptôme :
                </span>
                {entry.symptoms}
              </p>

              {/* Quick Solution box */}
              <div className="bg-slate-950 border border-emerald-900/30 rounded-lg p-3 text-xs text-emerald-200">
                <span className="font-bold text-emerald-400 font-mono text-[10px] uppercase block mb-1">
                  Solution Rapide
                </span>
                <p className="line-clamp-2 font-medium">{entry.quickSolution}</p>
              </div>

              {/* Command preview if any */}
              {entry.commands && entry.commands.length > 0 && (
                <div className="bg-black/80 rounded-lg p-2.5 border border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Terminal className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <code className="text-xs font-mono text-cyan-300 truncate">
                      {entry.commands[0].command}
                    </code>
                  </div>
                  <CopyButton text={entry.commands[0].command} />
                </div>
              )}

              {/* Footer Tags & Actions */}
              <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(entry.tags || []).map((t) => (
                    <span
                      key={t.id}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700/60"
                    >
                      #{t.name}
                    </span>
                  ))}
                  {(entry.technologies || []).map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/40 text-blue-300 border border-blue-800/40"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/entries/${entry.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
                >
                  <span>Consulter la fiche complète</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EntriesListPage() {
  return (
    <React.Suspense
      fallback={
        <div className="text-center py-16 text-slate-500 text-xs font-mono">
          Chargement de la base de connaissances...
        </div>
      }
    >
      <EntriesListContent />
    </React.Suspense>
  );
}
