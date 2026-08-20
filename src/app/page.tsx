"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Sparkles,
  BookOpen,
  Terminal,
  Zap,
  TrendingUp,
  Clock,
  Layers,
  Star,
  Activity,
} from "lucide-react";
import { CopyButton } from "@/components/entries/CopyButton";
import { QualityBadge } from "@/components/entries/QualityBadge";

export default function DashboardPage() {
  const router = useRouter();
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStatsData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Stats fetch error:", err);
        setLoading(false);
      });
  }, []);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/entries?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const sampleKeywords = [
    "Wazuh UDP 1514",
    "OpenSSL local issuer certificate",
    "Docker DNS timeout",
    "Kubernetes OOMKilled",
    "Nginx 502 Bad Gateway",
    "Jenkins SSL handshake",
    "Postgres lock contention",
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. HERO SEARCH SECTION (Mission §30) */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-blue-950/40 via-slate-900/60 to-slate-900 border border-blue-900/40 p-8 sm:p-12 text-center shadow-2xl">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Moteur de Mémoire Technique Cumulative</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Quel problème technique cherchez-vous ?
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Retrouvez instantanément la cause racine, les commandes et la solution validée
            d'un incident déjà résolu dans le passé.
          </p>

          {/* Large Hero Search Input Form */}
          <form onSubmit={handleHeroSearchSubmit} className="relative max-w-2xl mx-auto mt-4">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: Wazuh ne reçoit plus les logs, 1514 wazuh, SSL handshake failed, OOMKilled..."
                className="w-full pl-12 pr-28 py-3.5 bg-slate-950 border-2 border-slate-700 hover:border-blue-500 focus:border-blue-500 rounded-xl text-slate-100 placeholder-slate-500 text-sm shadow-xl focus:outline-none transition"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition shadow-md shadow-blue-600/30"
              >
                Rechercher
              </button>
            </div>
          </form>

          {/* Quick Keywords Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="text-slate-500 text-[11px] font-mono">Suggestions :</span>
            {sampleKeywords.map((kw, i) => (
              <button
                key={i}
                type="button"
                onClick={() => router.push(`/entries?q=${encodeURIComponent(kw)}`)}
                className="px-2.5 py-1 rounded-full bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 text-[11px] font-mono transition"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. KEY METRICS STATS CARDS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Problèmes</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {loading ? "..." : statsData?.stats?.total || 0}
          </div>
          <p className="text-[11px] text-slate-500">Capitalisés dans la mémoire</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Solutions Validées</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {loading ? "..." : statsData?.stats?.validated || 0}
          </div>
          <p className="text-[11px] text-slate-500">Testées et certifiées</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Taux de Résolution</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">
            {loading ? "..." : `${statsData?.stats?.resolvedRate || 0}%`}
          </div>
          <p className="text-[11px] text-slate-500">Fiabilité de la base</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>En Investigation / DRAFT</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {loading ? "..." : statsData?.stats?.unresolved || 0}
          </div>
          <p className="text-[11px] text-slate-500">À compléter ou tester</p>
        </div>
      </section>

      {/* 3. CATEGORIES & TECHNOLOGIES REPARTITION */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Box */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Répartition par Catégorie</span>
            </h2>
            <Link href="/categories" className="text-xs text-blue-400 hover:underline">
              Toutes les catégories →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {statsData?.categoriesDistribution?.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/entries?categoryId=${cat.id}`}
                className="p-3 bg-slate-950/60 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 rounded-lg transition flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-200 group-hover:text-blue-300 transition">
                    {cat.name}
                  </div>
                  <div className="text-[10px] text-slate-500">{cat.count} problème(s)</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition" />
              </Link>
            ))}
          </div>
        </div>

        {/* Top Technologies */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Technologies Fréquentes</span>
          </h2>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {statsData?.technologiesDistribution?.map((tech: any, idx: number) => (
              <Link
                key={idx}
                href={`/entries?technology=${encodeURIComponent(tech.name)}`}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-850 text-xs text-slate-300 transition"
              >
                <span className="font-mono text-slate-200">{tech.name}</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {tech.count} fiche(s)
                </span>
              </Link>
            ))}
            {(!statsData?.technologiesDistribution ||
              statsData.technologiesDistribution.length === 0) && (
              <p className="text-xs text-slate-500 italic">Aucune donnée disponible.</p>
            )}
          </div>
        </div>
      </section>

      {/* 4. RECENT PROBLEMS & TOP VIEWED */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Entries */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Derniers Problèmes Ajoutés</span>
            </h2>
            <Link href="/entries" className="text-xs text-blue-400 hover:underline">
              Voir tout →
            </Link>
          </div>

          <div className="space-y-3">
            {statsData?.recentEntries?.map((entry: any) => (
              <Link
                key={entry.id}
                href={`/entries/${entry.id}`}
                className="block p-3.5 bg-slate-950/60 hover:bg-slate-850 border border-slate-850 hover:border-slate-750 rounded-xl transition space-y-2 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-blue-400">
                      {entry.readableId}
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-400">
                      {entry.category?.name || "Général"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(entry.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-100 group-hover:text-blue-300 transition line-clamp-1">
                  {entry.title}
                </div>

                <div className="text-[11px] text-emerald-400/90 font-medium line-clamp-1">
                  Solution : {entry.quickSolution}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Viewed / Most Consulted */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Problèmes les Plus Consultés</span>
            </h2>
            <Link href="/entries?sort=views" className="text-xs text-blue-400 hover:underline">
              Par popularité →
            </Link>
          </div>

          <div className="space-y-3">
            {statsData?.topViewed?.map((entry: any, index: number) => (
              <Link
                key={entry.id}
                href={`/entries/${entry.id}`}
                className="flex items-center justify-between p-3.5 bg-slate-950/60 hover:bg-slate-850 border border-slate-850 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-500 w-5">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-slate-100 group-hover:text-blue-300 transition line-clamp-1">
                      {entry.title}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {entry.readableId} • {entry.category?.name}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {entry.viewCount} vues
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
