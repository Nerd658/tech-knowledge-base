"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Star,
  Terminal,
  FolderTree,
  FileSpreadsheet,
  History,
  PlusCircle,
  Zap,
  Tag as TagIcon,
  Shield,
  Layers,
  ChevronRight,
  Database,
  User,
  LogOut,
} from "lucide-react";
import { CategoryDto } from "@/types";

interface SidebarProps {
  onOpenQuickCapture?: () => void;
}

export function Sidebar({ onOpenQuickCapture }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      window.location.href = "/login";
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Tous les problèmes", href: "/entries", icon: BookOpen },
    { label: "Résolus & Validés", href: "/entries?status=VALIDATED", icon: CheckCircle2 },
    { label: "Non résolus / DRAFT", href: "/entries?status=UNRESOLVED", icon: AlertCircle },
    { label: "Favoris", href: "/entries?isFavorite=true", icon: Star },
    { label: "Bibliothèque Commandes", href: "/commands", icon: Terminal },
    { label: "Catégories", href: "/categories", icon: FolderTree },
    { label: "Import / Export", href: "/import-export", icon: FileSpreadsheet },
    { label: "Journal d'Audit", href: "/audit", icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col h-screen sticky top-0 shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>Tech Memory</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                KB
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Mémoire technique cumulative</p>
          </div>
        </Link>
      </div>

      {/* Action Buttons */}
      <div className="p-3 space-y-2">
        <Link
          href="/entries/new"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-600/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nouvelle Fiche Complète</span>
        </Link>

        <button
          type="button"
          onClick={onOpenQuickCapture}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-slate-900 hover:bg-slate-850 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>+ Quick Capture (1 min)</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        <div className="space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase text-slate-400 px-2 py-1 tracking-wider">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href) && !item.href.includes("?"));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? "bg-slate-850 text-blue-400 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Categories Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
            <span>Catégories</span>
            <Link href="/categories" className="text-blue-400 hover:underline">
              Gérer
            </Link>
          </div>

          <div className="space-y-0.5 max-h-40 overflow-y-auto pr-1">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={`/entries?categoryId=${cat.id}`}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition"
              >
                <span className="truncate">{cat.name}</span>
                {cat.entryCount !== undefined && cat.entryCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-850 text-slate-400">
                    {cat.entryCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* User Session & Logout Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 space-y-2">
        {currentUser ? (
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-300 font-bold text-xs shrink-0">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">{currentUser.role}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Se déconnecter"
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Connecté</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-[11px] text-slate-400 hover:text-red-400 transition"
            >
              Déconnexion
            </button>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono">Neon Postgres</span>
          </div>
          <span className="font-mono">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
