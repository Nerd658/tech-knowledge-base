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
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
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
    "Postgres lock contention",
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. HERO SPOTLIGHT SECTION (Linear / Raycast style) */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-950/80 border border-white/[0.08] p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-500/10 blur-[90px] pointer-events-none rounded-full" />

        <div className="max-w-3xl mx-auto space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Moteur de Mémoire Technique Cumulative</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Quel problème technique cherchez-vous ?
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Retrouvez instantanément la cause racine, les commandes reproductibles et la solution validée
            d'un incident déjà résolu.
          </p>

          {/* Large Hero Search Input Form */}
          <form onSubmit={handleHeroSearchSubmit} className="relative max-w-2xl mx-auto mt-6">
            <div className="relative flex items-center shadow-2xl shadow-black/60 rounded-2xl">
              <Search className="absolute left-4 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: Wazuh ne reçoit plus les logs, 1514 wazuh, SSL handshake failed, OOMKilled..."
                className="w-full pl-12 pr-32 py-4 bg-slate-950/90 border border-white/[0.12] hover:border-blue-500/50 focus:border-blue-500 rounded-2xl text-slate-100 placeholder-slate-500 text-sm shadow-inner transition-all font-sans"
              />
              <button
                type="submit"
                className="absolute right-2.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-blue-600/30 active:scale-95"
              >
                Rechercher
              </button>
            </div>
          </form>

          {/* Technical Keywords Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="text-slate-400 text-[11px] font-mono">Suggestions :</span>
            {sampleKeywords.map((kw, i) => (
              <button
                key={i}
                type="button"
                onClick={() => router.push(`/entries?q=${encodeURIComponent(kw)}`)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/[0.06] hover:border-blue-500/30 text-[11px] font-mono transition shadow-sm"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. KEY METRICS STATS CARDS (Linear Style) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 space-y-1.5 border border-white/[0.07]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Incidents</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {loading ? "..." : statsData?.stats?.total || 0}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Capitalisés en mémoire</p>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-1.5 border border-white/[0.07]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Solutions Validées</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">
            {loading ? "..." : statsData?.stats?.validated || 0}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Testées et certifiées</p>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-1.5 border border-white/[0.07]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Taux de Résolution</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 tracking-tight">
            {loading ? "..." : `${statsData?.stats?.resolvedRate || 0}%`}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Fiabilité des runbooks</p>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-1.5 border border-white/[0.07]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>En Investigation</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400 tracking-tight">
            {loading ? "..." : statsData?.stats?.unresolved || 0}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">À consolider ou tester</p>
        </div>
      </section>

      {/* 3. CATEGORIES & TECHNOLOGIES REPARTITION */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Box */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4 border border-white/[0.07]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Répartition par Catégorie</span>
            </h2>
            <Link href="/categories" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition">
              <span>Toutes les catégories</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {statsData?.categoriesDistribution?.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/entries?categoryId=${cat.id}`}
                className="p-3.5 bg-slate-900/60 hover:bg-slate-850/80 border border-white/[0.06] hover:border-blue-500/30 rounded-xl transition-all flex items-center justify-between group shadow-sm"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-200 group-hover:text-blue-400 transition">
                    {cat.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{cat.count} problème(s)</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 transition" />
              </Link>
            ))}
          </div>
        </div>

        {/* Top Technologies */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-white/[0.07]">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Technologies Fréquentes</span>
          </h2>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {statsData?.technologiesDistribution?.map((tech: any, idx: number) => (
              <Link
                key={idx}
                href={`/entries?technology=${encodeURIComponent(tech.name)}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-850/80 text-xs text-slate-300 border border-white/[0.05] hover:border-white/[0.1] transition shadow-sm"
              >
                <span className="font-mono text-slate-200 font-medium">{tech.name}</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-white/[0.05]">
                  {tech.count} fiche(s)
                </span>
              </Link>
            ))}
            {(!statsData?.technologiesDistribution ||
              statsData.technologiesDistribution.length === 0) && (
              <p className="text-xs text-slate-400 italic">Aucune donnée disponible.</p>
            )}
          </div>
        </div>
      </section>

      {/* 4. RECENT INCIDENTS & TOP VIEWED RUNBOOKS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Entries */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-white/[0.07]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Derniers Incidents Ajoutés</span>
            </h2>
            <Link href="/entries" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition">
              <span>Voir tout</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {statsData?.recentEntries?.map((entry: any) => (
              <Link
                key={entry.id}
                href={`/entries/${entry.id}`}
                className="block p-4 bg-slate-900/60 hover:bg-slate-850/80 border border-white/[0.06] hover:border-blue-500/30 rounded-xl transition-all space-y-2 group shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {entry.readableId}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-white/[0.05]">
                      {entry.category?.name || "Général"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(entry.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-100 group-hover:text-blue-400 transition line-clamp-1">
                  {entry.title}
                </div>

                <div className="text-[11px] text-emerald-400 font-medium line-clamp-1">
                  Solution : {entry.quickSolution}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Viewed / Most Consulted */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-white/[0.07]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Problèmes les Plus Consultés</span>
            </h2>
            <Link href="/entries?sort=views" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition">
              <span>Par popularité</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {statsData?.topViewed?.map((entry: any, index: number) => (
              <Link
                key={entry.id}
                href={`/entries/${entry.id}`}
                className="flex items-center justify-between p-4 bg-slate-900/60 hover:bg-slate-850/80 border border-white/[0.06] hover:border-emerald-500/30 rounded-xl transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-bold text-slate-400 w-5">
                    #{index + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-100 group-hover:text-emerald-400 transition line-clamp-1">
                      {entry.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {entry.readableId} • {entry.category?.name}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
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
