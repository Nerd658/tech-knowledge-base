# Architecture Technique — Tech Memory KB

Ce document détaille les choix d'architecture, la structure modulaire, les mécanismes d'indexation, de recherche et de similarité de la plateforme.

---

## 1. Principes Directeurs

1. **Vitesse de recherche & UX Instantanée** : Le moteur est optimisé pour permettre au développeur/ingénieur de retrouver une commande ou une cause racine en moins de 5 secondes.
2. **Priorité à la solution validée** : Mise en avant immédiate du triplet *Symptôme $\rightarrow$ Cause $\rightarrow$ Solution $\rightarrow$ Commandes*.
3. **Séparation nette des responsabilités** :
   - Présentation : Composants React client/serveur avec TailwindCSS.
   - Logique métier : Modules purs isolés dans `src/lib/` (calcul de qualité, similarité, export/import).
   - Données : Modèle relationnel PostgreSQL sous Prisma ORM.

---

## 2. Diagramme d'Architecture

```text
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│  ┌─────────────────────────┐     ┌────────────────────────────┐  │
│  │   CommandPalette        │     │      QuickFixCard          │  │
│  │   (Recherche Ctrl+K)    │     │  (Symptôme-Cause-Solution) │  │
│  └────────────┬────────────┘     └─────────────┬──────────────┘  │
│               │                                │                 │
│  ┌────────────┴────────────┐     ┌─────────────┴──────────────┐  │
│  │   Dashboard / Stats     │     │   Runbook & Investigation  │  │
│  └─────────────────────────┘     └────────────────────────────┘  │
└────────────────────────────────┬─────────────────────────────────┘
                                 │ HTTP / JSON
┌────────────────────────────────▼─────────────────────────────────┐
│                      API LAYER (Route Handlers)                  │
│   /api/entries   /api/similarity   /api/export   /api/commands   │
│   /api/stats     /api/import       /api/audit    /api/categories │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
┌────────────────────────────────▼─────────────────────────────────┐
│                     BUSINESS ENGINE (src/lib)                    │
│   • Similarity Engine (Jaccard, N-grams, Tokenizer, StopWords)   │
│   • Quality Calculator (0-100% Score & Checklist Breakdown)      │
│   • Export/Import Engine (MD, XLSX, CSV, JSON)                  │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
┌────────────────────────────────▼─────────────────────────────────┐
│                         PERSISTENCE                              │
│   • Prisma ORM 6.4 (Type-safe query builder & migrations)       │
│   • PostgreSQL Database on Neon (SSL connection, pooled)         │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Moteur de Recherche & Similarité

### A. Recherche Multi-critères
La recherche balaie l'ensemble des champs critiques avec recherche insensible à la casse :
- Titre et ID lisible (`KB-XXXX`)
- Message d'erreur exact & logs
- Symptômes observés
- Cause racine
- Solution rapide
- Commandes d'exécution
- Technologies et outils associés

### B. Algorithme de Similarité ("J'ai déjà vu ça" & Doublons)
L'algorithme (`src/lib/similarity.ts`) applique une pondération sectorielle :
* **35%** : Similarité sur le message d'erreur (N-gram overlap & inclusion exacte).
* **25%** : Similarité sur le titre (Jaccard sur tokens normalisés, exclusion des stop-words).
* **20%** : Similarité sur les symptômes observés.
* **10%** : Similarité sur la cause racine.
* **10%** : Recouvrement des technologies (Jaccard).

Ce score (0 à 100%) est calculé en temps réel côté client et serveur lors de la frappe pour avertir immédiatement l'utilisateur si un incident identique a déjà été consigné.

---

## 4. Score de Qualité & Complétude

Le module `src/lib/quality.ts` attribue des points selon 9 critères objectifs :
* Titre explicite ($\ge 10$ caractères) : **10 pts**
* Symptômes détaillés ($\ge 15$ caractères) : **15 pts**
* Message d'erreur exact ($\ge 5$ caractères) : **10 pts**
* Cause racine explicite ($\ge 15$ caractères) : **15 pts**
* Solution rapide actionnable ($\ge 15$ caractères) : **20 pts**
* Commandes reproductibles : **10 pts**
* Procédure pas-à-pas ou investigation : **10 pts**
* Validation terrain confirmée : **5 pts**
* Liens & ressources associées : **5 pts**

Total : **100%**.
