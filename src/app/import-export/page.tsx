"use client";

import React, { useState } from "react";
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  FileCode,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function ImportExportPage() {
  const [selectedFormat, setSelectedFormat] = useState("markdown");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportResult(null);
    setImportError(null);

    // Run preview
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "preview");

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewData(data);
      } else {
        const err = await res.json();
        setImportError(err.message || "Fichier non valide");
      }
    } catch (err: any) {
      setImportError(err.message || "Erreur de lecture");
    }
  };

  const handleExecuteImport = async () => {
    if (!importFile) return;
    setImportLoading(true);
    setImportError(null);

    const formData = new FormData();
    formData.append("file", importFile);
    formData.append("mode", "execute");

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setImportResult(data);
        setPreviewData(null);
      } else {
        const err = await res.json();
        setImportError(err.message || "Erreur lors de l'import");
      }
    } catch (err: any) {
      setImportError(err.message || "Erreur réseau");
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
          <FileSpreadsheet className="w-5 h-5 text-blue-400" />
          <span>Centre d'Importation & Exportation</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Exportez vos connaissances techniques sous différents formats ou importez vos anciens tableaux d'incidents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* EXPORT BOX */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 text-blue-400 border-b border-slate-800 pb-3">
            <Download className="w-5 h-5" />
            <h2 className="text-sm font-bold text-slate-100">Exportation de la Base</h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Téléchargez l'intégralité ou une sélection de vos fiches techniques avec tous les champs,
            commandes et historiques associés.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <a
              href="/api/export?format=markdown"
              download="tech-knowledge-base.md"
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-850 transition flex flex-col items-center justify-center gap-2 text-center group"
            >
              <FileText className="w-6 h-6 text-blue-400 group-hover:scale-110 transition" />
              <div>
                <div className="font-bold text-slate-200">Markdown (.md)</div>
                <div className="text-[10px] text-slate-500">Documentation & Wiki</div>
              </div>
            </a>

            <a
              href="/api/export?format=xlsx"
              download="tech-knowledge-base.xlsx"
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-850 transition flex flex-col items-center justify-center gap-2 text-center group"
            >
              <FileSpreadsheet className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition" />
              <div>
                <div className="font-bold text-slate-200">Excel (.xlsx)</div>
                <div className="text-[10px] text-slate-500">Tableau structuré</div>
              </div>
            </a>

            <a
              href="/api/export?format=csv"
              download="tech-knowledge-base.csv"
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-850 transition flex flex-col items-center justify-center gap-2 text-center group"
            >
              <FileCode className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition" />
              <div>
                <div className="font-bold text-slate-200">CSV (.csv)</div>
                <div className="text-[10px] text-slate-500">Export universel</div>
              </div>
            </a>

            <a
              href="/api/export?format=json"
              download="tech-knowledge-base.json"
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-850 transition flex flex-col items-center justify-center gap-2 text-center group"
            >
              <FileJson className="w-6 h-6 text-amber-400 group-hover:scale-110 transition" />
              <div>
                <div className="font-bold text-slate-200">JSON (.json)</div>
                <div className="text-[10px] text-slate-500">Données brutes complètes</div>
              </div>
            </a>
          </div>
        </div>

        {/* IMPORT BOX */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-3">
            <Upload className="w-5 h-5" />
            <h2 className="text-sm font-bold text-slate-100">Importation de Connaissances</h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Convertissez automatiquement un fichier Excel, CSV ou JSON contenant vos anciens problèmes
            en fiches structurées avec détection de doublons.
          </p>

          <div className="space-y-3">
            <label className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-950/60 transition text-center">
              <Upload className="w-8 h-8 text-slate-400" />
              <div className="text-xs font-semibold text-slate-200">
                {importFile ? importFile.name : "Sélectionner un fichier (Excel, CSV, JSON)"}
              </div>
              <div className="text-[10px] text-slate-500">
                Colonnes reconnues : Titre, Symptômes, Solution Rapide, Cause Racine, Erreur
              </div>
              <input
                type="file"
                accept=".json,.csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {importError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {/* Preview Section */}
            {previewData && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Aperçu avant importation</span>
                  <span className="font-mono text-emerald-400">
                    {previewData.validCount} fiche(s) valide(s)
                  </span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {previewData.previewItems?.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="p-2 bg-slate-900 rounded border border-slate-850 text-[11px]"
                    >
                      <div className="font-semibold text-slate-200">{item.title}</div>
                      <div className="text-slate-400 text-[10px] truncate">
                        {item.quickSolution}
                      </div>
                      {item.duplicates?.length > 0 && (
                        <div className="text-amber-400 text-[10px] mt-0.5">
                          ⚠️ {item.duplicates.length} doublon(s) potentiel(s) détecté(s)
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={importLoading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{importLoading ? "Importation en cours..." : "Confirmer et Importer"}</span>
                </button>
              </div>
            )}

            {/* Success Report */}
            {importResult && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Importation terminée avec succès !</span>
                </div>
                <p className="text-slate-300">
                  {importResult.importedCount} nouvelle(s) fiche(s) ajoutée(s) à la base de connaissances.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
