import { QualityBreakdown } from "@/types";

interface QualityInput {
  title?: string;
  problemDescription?: string;
  contextDescription?: string;
  symptoms?: string;
  errorMessage?: string;
  rootCause?: string;
  quickSolution?: string;
  resolutionSteps?: Array<any>;
  commands?: Array<any>;
  investigations?: Array<any>;
  resources?: Array<any>;
  validationTested?: boolean;
  lastTestedAt?: any;
  tags?: Array<any>;
  technologies?: Array<any> | string;
}

export function calculateQualityScore(entry: QualityInput): QualityBreakdown {
  const checklist = [
    {
      label: "Titre clair et précis",
      valid: Boolean(entry.title && entry.title.trim().length >= 10),
      points: 10,
      description: "Le titre fait au moins 10 caractères et décrit le problème.",
    },
    {
      label: "Symptômes détaillés",
      valid: Boolean(entry.symptoms && entry.symptoms.trim().length >= 15),
      points: 15,
      description: "Description claire de ce qui est observé.",
    },
    {
      label: "Message d'erreur exact",
      valid: Boolean(entry.errorMessage && entry.errorMessage.trim().length >= 5),
      points: 10,
      description: "Contient le message d'erreur ou code de statut précis.",
    },
    {
      label: "Cause racine identifiée",
      valid: Boolean(entry.rootCause && entry.rootCause.trim().length >= 15),
      points: 15,
      description: "L'origine technique exacte du dysfonctionnement est expliquée.",
    },
    {
      label: "Solution rapide immédiatement actionnable",
      valid: Boolean(entry.quickSolution && entry.quickSolution.trim().length >= 15),
      points: 20,
      description: "Résumé synthétique permettant une résolution en moins d'une minute.",
    },
    {
      label: "Commandes et scripts reproductibles",
      valid: Boolean(entry.commands && entry.commands.length > 0),
      points: 10,
      description: "Au moins une commande ou snippet directement copiable.",
    },
    {
      label: "Procédure pas-à-pas ou investigation",
      valid: Boolean(
        (entry.resolutionSteps && entry.resolutionSteps.length > 0) ||
        (entry.investigations && entry.investigations.length > 0)
      ),
      points: 10,
      description: "Étapes de résolution ou raisonnement d'investigation documentés.",
    },
    {
      label: "Validation et tests confirmés",
      valid: Boolean(entry.validationTested === true),
      points: 5,
      description: "La solution a été testée et validée en situation réelle.",
    },
    {
      label: "Ressources et documentation",
      valid: Boolean(entry.resources && entry.resources.length > 0),
      points: 5,
      description: "Liens vers la documentation officielle, CVE, ticket ou article.",
    },
  ];

  const score = checklist.reduce((acc, item) => (item.valid ? acc + item.points : acc), 0);

  return {
    score: Math.min(100, score),
    checklist,
  };
}
