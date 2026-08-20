# Documentation des Points d'API (RESTful)

Tous les points d'API renvoient et acceptent du JSON (sauf les exports qui renvoient des fichiers téléchargeables).

---

## 1. Entrées de Connaissances (`/api/entries`)

### `GET /api/entries`
Liste paginée des problèmes avec filtres multi-critères.
* **Paramètres de requête** :
  - `q` : Chaîne de recherche (mots-clés, erreurs, ports, etc.)
  - `categoryId` : ID de catégorie
  - `status` : `VALIDATED` | `DRAFT` | `OUTDATED` | `DEPRECATED` | `UNRESOLVED`
  - `environment` : `Production` | `Staging` | `Test` | `Dev` | `Local`
  - `tag` : Slug du tag (ex: `wazuh`, `network`)
  - `technology` : Nom de technologie
  - `isFavorite` : `true` | `false`
  - `sort` : `recent` | `views` | `score` | `title` | `lastTested`
  - `page` : Numéro de page (défaut 1)
  - `limit` : Nombre d'éléments par page (défaut 20)
* **Réponse** : `{ entries: KnowledgeEntryDto[], pagination: { total, page, limit, totalPages } }`

### `POST /api/entries`
Création d'une nouvelle fiche technique complète ou rapide.
* **Corps (JSON)** :
  ```json
  {
    "title": "Titre du problème",
    "symptoms": "Description des symptômes",
    "errorMessage": "Logs d'erreur",
    "rootCause": "Cause racine identifiée",
    "rootCauseCategory": "CONFIGURATION",
    "quickSolution": "Solution synthétique",
    "categoryId": "cat_id",
    "environment": "Production",
    "tags": ["wazuh", "network"],
    "commands": [
      { "language": "bash", "command": "iptables -L", "description": "Vérifier règles" }
    ]
  }
  ```
* **Réponse (201)** : `{ success: true, entry: KnowledgeEntryDto }`

---

## 2. Fiche Unique (`/api/entries/[id]`)

### `GET /api/entries/[id]`
Récupère les détails complets d'une fiche (avec investigation, étapes, commandes, relations, historique de test, versions, commentaires) et incrémente le compteur de vues.

### `PUT /api/entries/[id]`
Met à jour une fiche existante, sauvegarde un snapshot dans `EntryVersion`, recalcule le score de qualité et trace l'audit.

### `DELETE /api/entries/[id]`
Supprime une fiche et trace l'audit.

---

## 3. Actions Rapides sur Entrée

### `POST /api/entries/[id]/favorite`
Bascule l'état favori (`isFavorite: true/false`).

### `POST /api/entries/[id]/test`
Enregistre un test de validation en situation réelle.
* **Corps** : `{ "environment": "Production", "resultStatus": "SUCCESS", "notes": "..." }`

---

## 4. Moteur de Similarité (`/api/similarity`)

### `POST /api/similarity`
Analyse de doublons et recherche "J'ai déjà vu ça".
* **Corps** : `{ "title": "...", "errorMessage": "...", "symptoms": "...", "excludeId": "..." }`
* **Réponse** : `{ "matches": [ { "id": "...", "similarityScore": 92, "matchedFields": [...] } ] }`

---

## 5. Exports & Imports (`/api/export` & `/api/import`)

### `GET /api/export`
* `format` : `markdown` | `xlsx` | `csv` | `json`
* `id` : (Optionnel) ID d'une seule fiche

### `POST /api/import`
* `multipart/form-data` avec champ `file` et `mode` (`preview` ou `execute`).

---

## 6. Statistiques Dashboard (`/api/stats`)
Retourne le total des problèmes, le taux de résolution, la répartition par catégorie et techno, et les problèmes les plus consultés.
