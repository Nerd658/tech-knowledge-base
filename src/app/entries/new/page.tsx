"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Terminal,
  Layers,
  HelpCircle,
  ListOrdered,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  Tag,
} from "lucide-react";
import { CategoryDto, SimilarityMatch } from "@/types";
import { SimilarityWarning } from "@/components/entries/SimilarityWarning";

export default function NewEntryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [environment, setEnvironment] = useState("Production");
  const [status, setStatus] = useState("VALIDATED");
  const [confidenceLevel, setConfidenceLevel] = useState("VALIDATED");
  const [authorName, setAuthorName] = useState("Lead Engineer");

  // Problem details
  const [symptoms, setSymptoms] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [contextDescription, setContextDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [triggerConditions, setTriggerConditions] = useState("");

  // Root cause
  const [rootCause, setRootCause] = useState("");
  const [rootCauseCategory, setRootCauseCategory] = useState("CONFIGURATION");
  const [responsibleComponent, setResponsibleComponent] = useState("");
  const [triggerFactor, setTriggerFactor] = useState("");
  const [secondaryCauses, setSecondaryCauses] = useState("");

  // Quick Solution
  const [quickSolution, setQuickSolution] = useState("");

  // Tags and Techs
  const [tagsInput, setTagsInput] = useState("");
  const [techInput, setTechInput] = useState("");
  const [toolsInput, setToolsInput] = useState("");

  // Dynamic Lists
  const [commands, setCommands] = useState<
    Array<{ language: string; command: string; description: string; expectedOutput: string }>
  >([]);

  const [resolutionSteps, setResolutionSteps] = useState<
    Array<{ title: string; description: string; command: string; expectedResult: string; notes: string }>
  >([]);

  const [investigations, setInvestigations] = useState<
    Array<{ hypothesis: string; command: string; result: string; conclusion: string }>
  >([]);

  const [resources, setResources] = useState<
    Array<{ title: string; url: string; resourceType: string; description: string }>
  >([]);

  // Real-time duplicates state
  const [similarMatches, setSimilarMatches] = useState<SimilarityMatch[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories || []);
        if (d.categories?.length > 0) setCategoryId(d.categories[0].id);
      });
  }, []);

  // Similarity checking timer
  useEffect(() => {
    if (!title.trim() && !errorMessage.trim() && !symptoms.trim()) {
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
            technologies: techInput.split(/[\s,]+/).filter(Boolean),
            threshold: 25,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setSimilarMatches(data.matches || []);
        }
      } catch (err) {
        console.error("Similarity check error:", err);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [title, errorMessage, symptoms, rootCause, techInput]);

  // Helpers for dynamic arrays
  const addCommand = () => {
    setCommands([
      ...commands,
      { language: "bash", command: "", description: "", expectedOutput: "" },
    ]);
  };
  const removeCommand = (index: number) => {
    setCommands(commands.filter((_, i) => i !== index));
  };

  const addStep = () => {
    setResolutionSteps([
      ...resolutionSteps,
      { title: "", description: "", command: "", expectedResult: "", notes: "" },
    ]);
  };
  const removeStep = (index: number) => {
    setResolutionSteps(resolutionSteps.filter((_, i) => i !== index));
  };

  const addInvestigation = () => {
    setInvestigations([
      ...investigations,
      { hypothesis: "", command: "", result: "", conclusion: "" },
    ]);
  };
  const removeInvestigation = (index: number) => {
    setInvestigations(investigations.filter((_, i) => i !== index));
  };

  const addResource = () => {
    setResources([
      ...resources,
      { title: "", url: "", resourceType: "OFFICIAL_DOC", description: "" },
    ]);
  };
  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !symptoms.trim() || !quickSolution.trim()) {
      setError("Veuillez renseigner les champs obligatoires : Titre, Symptômes et Solution Rapide.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    setError(null);

    const tags = tagsInput
      .split(/[\s,]+/)
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    const technologies = techInput
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const tools = toolsInput
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title,
      categoryId,
      environment,
      status,
      confidenceLevel,
      authorName,
      symptoms,
      problemDescription,
      contextDescription,
      errorMessage,
      triggerConditions,
      rootCause: rootCause || "Non spécifiée",
      rootCauseCategory,
      responsibleComponent,
      triggerFactor,
      secondaryCauses,
      quickSolution,
      tags,
      technologies,
      tools,
      commands: commands.filter((c) => c.command.trim()),
      resolutionSteps: resolutionSteps.filter((s) => s.title.trim() || s.description.trim()),
      investigations: investigations.filter((inv) => inv.hypothesis.trim() || inv.conclusion.trim()),
      resources: resources.filter((r) => r.url.trim() && r.title.trim()),
      validationTested: true,
    };

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erreur lors de la création de la fiche");
      }

      const data = await res.json();
      router.push(`/entries/${data.entry.id}`);
    } catch (err: any) {
      setError(err.message || "Une erreur inattendue est survenue");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/entries"
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <span>Créer une Nouvelle Fiche Technique</span>
            </h1>
            <p className="text-xs text-slate-400">
              Documentez complètement le problème pour le retrouver facilement plus tard.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Real-time duplicate similarity warning */}
      {similarMatches.length > 0 && (
        <SimilarityWarning matches={similarMatches} />
      )}

      <form onSubmit={handleSubmit} className="space-y-8 text-xs">
        {/* SECTION 1: IDENTIFICATION & CLASSIFICATION */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <span>1. Identification & Classification</span>
          </h2>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">
              Titre du Problème <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Wazuh Manager ne reçoit plus les logs des agents, OpenSSL verify failed..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-3 text-slate-100 text-sm placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Catégorie</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Environnement</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
              >
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="Test">Test</option>
                <option value="Dev">Dev</option>
                <option value="Local">Local</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Statut de validation</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
              >
                <option value="VALIDATED">🟢 Solution Validée</option>
                <option value="DRAFT">🟡 DRAFT (Brouillon)</option>
                <option value="OUTDATED">⚠️ Obsolète</option>
                <option value="UNRESOLVED">🔴 Non Résolu</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Tags (séparés par virgule)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="#wazuh, #network, #firewall"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Technologies concernées</label>
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Wazuh, Linux, iptables, UDP"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Outils / Services</label>
              <input
                type="text"
                value={toolsInput}
                onChange={(e) => setToolsInput(e.target.value)}
                placeholder="wazuh-manager, ss, tcpdump"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: DESCRIPTION & SYMPTÔMES */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <span>2. Symptômes, Message d'Erreur & Contexte</span>
          </h2>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">
              Symptômes observés <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Description concrète : les agents ne remontent plus les logs, le service refuse les requêtes..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">
              Message d'erreur / Logs exacts (très important pour la recherche)
            </label>
            <textarea
              rows={3}
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder="Collez ici l'erreur brute : Connection refused, Error 1416F086, OOMKilled..."
              className="w-full bg-black/80 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-rose-300 font-mono text-[11px] placeholder-slate-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Contexte d'apparition</label>
              <textarea
                rows={2}
                value={contextDescription}
                onChange={(e) => setContextDescription(e.target.value)}
                placeholder="OS, version, architecture, réseau, mise à jour récente..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Conditions de déclenchement</label>
              <textarea
                rows={2}
                value={triggerConditions}
                onChange={(e) => setTriggerConditions(e.target.value)}
                placeholder="Suite à un redémarrage, rechargement firewall, rotation cert..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: CAUSE RACINE & SOLUTION */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <span>3. Cause Racine (RCA) & Solution Finale</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">
                Cause Racine (Root Cause)
              </label>
              <textarea
                rows={2}
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                placeholder="Origine technique exacte : le port UDP 1514 était fermé sur iptables suite au reload..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Catégorie de la Cause</label>
              <select
                value={rootCauseCategory}
                onChange={(e) => setRootCauseCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
              >
                <option value="CONFIGURATION">Configuration</option>
                <option value="NETWORK">Réseau</option>
                <option value="DNS">DNS</option>
                <option value="TLS">TLS / SSL</option>
                <option value="AUTHENTICATION">Authentification</option>
                <option value="AUTHORIZATION">Autorisation / Droits</option>
                <option value="DEPENDENCY">Dépendance externe</option>
                <option value="SOFTWARE_BUG">Bug logiciel</option>
                <option value="INFRASTRUCTURE">Infrastructure</option>
                <option value="PERFORMANCE">Performance / OOM</option>
                <option value="SECURITY">Sécurité / Firewall</option>
                <option value="HUMAN_ERROR">Erreur humaine</option>
                <option value="UNKNOWN">Inconnu</option>
              </select>
            </div>
          </div>

          {/* Quick Solution */}
          <div className="space-y-1">
            <label className="font-semibold text-emerald-400">
              Solution Finale Synthétique (Quick Fix) <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={quickSolution}
              onChange={(e) => setQuickSolution(e.target.value)}
              placeholder="Résumé très court permettant une résolution en 30 secondes..."
              className="w-full bg-emerald-950/20 border border-emerald-500/40 rounded-lg p-3 text-emerald-100 placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* SECTION 4: COMMANDES & SNIPPETS */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>4. Commandes & Scripts Reproductibles</span>
            </h2>
            <button
              type="button"
              onClick={addCommand}
              className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une commande</span>
            </button>
          </div>

          {commands.length === 0 ? (
            <p className="text-slate-500 italic text-xs py-2">
              Aucune commande ajoutée. Cliquez sur "Ajouter une commande" pour inclure des commandes immédiatement copiables.
            </p>
          ) : (
            <div className="space-y-3">
              {commands.map((cmd, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={cmd.description}
                      onChange={(e) => {
                        const updated = [...commands];
                        updated[idx].description = e.target.value;
                        setCommands(updated);
                      }}
                      placeholder="Description de la commande (ex: Ouvrir port 1514)..."
                      className="bg-transparent border-b border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none flex-1 py-1"
                    />

                    <select
                      value={cmd.language}
                      onChange={(e) => {
                        const updated = [...commands];
                        updated[idx].language = e.target.value;
                        setCommands(updated);
                      }}
                      className="bg-slate-800 text-[10px] text-slate-300 px-2 py-1 rounded border border-slate-700 font-mono"
                    >
                      <option value="bash">Bash</option>
                      <option value="powershell">PowerShell</option>
                      <option value="python">Python</option>
                      <option value="sql">SQL</option>
                      <option value="docker">Docker</option>
                      <option value="yaml">YAML</option>
                      <option value="http">HTTP / cURL</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => removeCommand(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={cmd.command}
                    onChange={(e) => {
                      const updated = [...commands];
                      updated[idx].command = e.target.value;
                      setCommands(updated);
                    }}
                    placeholder="iptables -A INPUT -p udp --dport 1514 -j ACCEPT"
                    className="w-full bg-black/80 border border-slate-800 rounded-lg p-2.5 text-emerald-400 font-mono text-[11px] placeholder-slate-600 focus:outline-none"
                  />

                  <input
                    type="text"
                    value={cmd.expectedOutput}
                    onChange={(e) => {
                      const updated = [...commands];
                      updated[idx].expectedOutput = e.target.value;
                      setCommands(updated);
                    }}
                    placeholder="Résultat attendu (optionnel)..."
                    className="w-full bg-slate-900 border border-slate-850 rounded p-2 text-slate-300 font-mono text-[11px] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 5: INVESTIGATION STEPS */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>5. Investigation & Raisonnement (Hypothèses & Tests)</span>
            </h2>
            <button
              type="button"
              onClick={addInvestigation}
              className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une hypothèse</span>
            </button>
          </div>

          {investigations.length === 0 ? (
            <p className="text-slate-500 italic text-xs py-2">
              Optionnel mais utile : documentez les tests qui ont fonctionné ou échoué durant votre diagnostic.
            </p>
          ) : (
            <div className="space-y-3">
              {investigations.map((inv, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-400 text-xs">
                      Hypothèse {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeInvestigation(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={inv.hypothesis}
                    onChange={(e) => {
                      const updated = [...investigations];
                      updated[idx].hypothesis = e.target.value;
                      setInvestigations(updated);
                    }}
                    placeholder="Hypothèse (ex: Le port UDP 1514 est bloqué)..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={inv.command}
                      onChange={(e) => {
                        const updated = [...investigations];
                        updated[idx].command = e.target.value;
                        setInvestigations(updated);
                      }}
                      placeholder="Commande de test (ex: ss -lunp | grep 1514)..."
                      className="bg-black/70 border border-slate-800 rounded p-2 text-cyan-300 font-mono text-[11px] focus:outline-none"
                    />

                    <input
                      type="text"
                      value={inv.conclusion}
                      onChange={(e) => {
                        const updated = [...investigations];
                        updated[idx].conclusion = e.target.value;
                        setInvestigations(updated);
                      }}
                      placeholder="Conclusion (ex: Le service écoute bien localement)..."
                      className="bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 6: RESSOURCES & DOCUMENTATION */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>6. Liens & Documentation Officielle</span>
            </h2>
            <button
              type="button"
              onClick={addResource}
              className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter un lien</span>
            </button>
          </div>

          {resources.length === 0 ? (
            <p className="text-slate-500 italic text-xs py-2">
              Optionnel : ajoutez les liens vers la doc officielle, CVEs, issues GitHub ou articles consultés.
            </p>
          ) : (
            <div className="space-y-3">
              {resources.map((res, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={res.title}
                      onChange={(e) => {
                        const updated = [...resources];
                        updated[idx].title = e.target.value;
                        setResources(updated);
                      }}
                      placeholder="Titre de la ressource (ex: Doc officielle Wazuh)..."
                      className="bg-transparent border-b border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none flex-1 py-1"
                    />

                    <select
                      value={res.resourceType}
                      onChange={(e) => {
                        const updated = [...resources];
                        updated[idx].resourceType = e.target.value;
                        setResources(updated);
                      }}
                      className="bg-slate-800 text-[10px] text-slate-300 px-2 py-1 rounded border border-slate-700"
                    >
                      <option value="OFFICIAL_DOC">Doc Officielle</option>
                      <option value="ARTICLE">Article / Blog</option>
                      <option value="GITHUB">GitHub Issue / PR</option>
                      <option value="STACKOVERFLOW">Stack Overflow</option>
                      <option value="CVE">CVE / Avis Sécurité</option>
                      <option value="RFC">RFC Standard</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => removeResource(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="url"
                    value={res.url}
                    onChange={(e) => {
                      const updated = [...resources];
                      updated[idx].url = e.target.value;
                      setResources(updated);
                    }}
                    placeholder="https://documentation.wazuh.com/..."
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-blue-300 font-mono text-[11px] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions Bottom Bar */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <Link
            href="/entries"
            className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Enregistrement en cours..." : "Enregistrer la Fiche Technique"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
