"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CommandPalette } from "@/components/search/CommandPalette";
import { QuickCaptureModal } from "@/components/forms/QuickCaptureModal";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);

  const isAuthPage = pathname === "/login";

  return (
    <html lang="fr" className="dark">
      <head>
        <title>Tech Memory KB — Base de Connaissances Technique</title>
        <meta
          name="description"
          content="Moteur de mémoire technique personnel pour capitaliser sur les incidents, causes racines et procédures de résolution."
        />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        {isAuthPage ? (
          /* Dedicated Full-Screen Login Container */
          <div className="min-h-screen w-full">{children}</div>
        ) : (
          /* Full Application Dashboard Layout */
          <div className="flex flex-row min-h-screen">
            {/* Navigation Sidebar */}
            <Sidebar onOpenQuickCapture={() => setIsQuickCaptureOpen(true)} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
              <Header
                onOpenSearch={() => setIsSearchOpen(true)}
                onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
              />

              <main className="flex-1 p-6 max-w-7xl w-full mx-auto pb-16">
                {children}
              </main>
            </div>

            {/* Global Command Palette (Ctrl + K) */}
            <CommandPalette
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
            />

            {/* Global Quick Capture Modal */}
            <QuickCaptureModal
              isOpen={isQuickCaptureOpen}
              onClose={() => setIsQuickCaptureOpen(false)}
              onSuccess={() => {
                window.location.reload();
              }}
            />
          </div>
        )}
      </body>
    </html>
  );
}
