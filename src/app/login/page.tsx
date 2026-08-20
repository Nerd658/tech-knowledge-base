"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Terminal,
  Database,
  KeyRound,
  Zap,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [email, setEmail] = useState("admin@knowledge.local");
  const [password, setPassword] = useState("AdminPassword123!");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Identifiants incorrects.");
      }

      // Successful authentication -> navigate to dashboard
      router.push(from);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Impossible de se connecter.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail("admin@knowledge.local");
    setPassword("AdminPassword123!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-600/5 blur-[100px] pointer-events-none rounded-full" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-slate-900/90 border border-slate-800/90 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl shadow-black/60">
          {/* Header Brand */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/30 to-indigo-700/20 border border-blue-500/40 shadow-lg shadow-blue-950/60 mb-4 ring-4 ring-blue-500/10">
              <Shield className="w-7 h-7 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              <span>Tech Memory</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                KB
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              Plateforme de capitalisation & moteur de mémoire technique
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Identifiant / Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@knowledge.local"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Vérification des accès...</span>
                </div>
              ) : (
                <>
                  <span>Accéder à la Base de Connaissances</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 text-xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Identifiants Administrateur :</span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoCredentials}
                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Remplir</span>
                </button>
              </div>

              <div className="font-mono text-[11px] text-slate-400 space-y-1 bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email :</span>
                  <span className="text-blue-300 font-medium select-all">admin@knowledge.local</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Mot de passe :</span>
                  <span className="text-blue-300 font-medium select-all">AdminPassword123!</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-3 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-slate-600" />
              <span>Inscriptions désactivées. Comptes gérés manuellement en base.</span>
            </p>
          </div>
        </div>

        {/* Footer Badges */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 px-2">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Neon Serverless Postgres</span>
          </div>
          <span className="font-mono">Next.js 14 • JWT Edge</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 text-xs font-mono">
          Initialisation de la page de connexion...
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
