"use client";

import React, { useState, useEffect } from "react";
import { History, Shield, Filter, Clock, User, FileText } from "lucide-react";

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [selectedAction]);

  const fetchLogs = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedAction) params.set("action", selectedAction);

    try {
      const res = await fetch(`/api/audit?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const actionColors: Record<string, string> = {
    CREATED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    UPDATED: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    DELETED: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    EXPORTED: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    IMPORTED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    RESOLUTION_TESTED: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
          <History className="w-5 h-5 text-blue-400" />
          <span>Journal d'Audit & Traçabilité</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Historique exhaustif des ajouts, modifications, validations et exports effectués sur la mémoire technique.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-xl text-xs">
        <span className="font-semibold text-slate-300">Filtrer par action :</span>
        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
        >
          <option value="">Toutes les actions</option>
          <option value="CREATED">CREATED (Créations)</option>
          <option value="UPDATED">UPDATED (Modifications)</option>
          <option value="RESOLUTION_TESTED">RESOLUTION_TESTED (Tests & validations)</option>
          <option value="EXPORTED">EXPORTED (Exports)</option>
          <option value="IMPORTED">IMPORTED (Imports)</option>
          <option value="DELETED">DELETED (Suppressions)</option>
        </select>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-xs font-mono">
          Chargement du journal d'audit...
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-xs text-slate-500 italic">
          Aucun événement d'audit enregistré.
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="p-3.5">Date & Heure</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entité</th>
                <th className="p-3.5">Utilisateur</th>
                <th className="p-3.5">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {logs.map((log) => {
                let parsedDetails: any = {};
                try {
                  parsedDetails = JSON.parse(log.details);
                } catch {
                  parsedDetails = { raw: log.details };
                }

                return (
                  <tr key={log.id} className="hover:bg-slate-850/60 transition">
                    <td className="p-3.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("fr-FR")}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                          actionColors[log.action] || "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                      {log.entityType}
                    </td>
                    <td className="p-3.5 font-medium text-slate-200">{log.userName}</td>
                    <td className="p-3.5 text-[11px] text-slate-400 font-mono">
                      {parsedDetails.readableId && (
                        <span className="text-blue-400 mr-2 font-bold">
                          {parsedDetails.readableId}
                        </span>
                      )}
                      {parsedDetails.title && <span>{parsedDetails.title}</span>}
                      {parsedDetails.status && (
                        <span className="text-emerald-400 mr-2">
                          Status: {parsedDetails.status}
                        </span>
                      )}
                      {parsedDetails.format && (
                        <span>Format: {parsedDetails.format.toUpperCase()}</span>
                      )}
                      {parsedDetails.importedCount !== undefined && (
                        <span>{parsedDetails.importedCount} fiches importées</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
