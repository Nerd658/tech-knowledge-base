# Référence du Schéma PostgreSQL (Neon)

Le schéma est géré par Prisma ORM (`prisma/schema.prisma`).

---

## 1. Tables Principales

| Table | Description | Clé Primaire | Index Clés |
| :--- | :--- | :--- | :--- |
| `KnowledgeEntry` | Fiche d'incident technique | `id` (cuid) | `readableId` (unique), `slug` (unique), `categoryId`, `status`, `isFavorite` |
| `Category` | Catégories hiérarchiques | `id` (cuid) | `slug` (unique), `parentId` |
| `Tag` | Tags et mots-clés | `id` (cuid) | `slug` (unique) |
| `TagsOnKnowledgeEntry` | Table de liaison N-N Entrée <-> Tag | `(entryId, tagId)` | Composite |
| `InvestigationStep` | Étapes d'hypothèse & raisonnement | `id` (cuid) | `entryId`, `stepNumber` |
| `ResolutionStep` | Étapes de la procédure (runbook) | `id` (cuid) | `entryId`, `order` |
| `CommandSnippet` | Commandes et snippets exécutables | `id` (cuid) | `entryId`, `language` |
| `ResourceLink` | Liens documentaires & CVEs | `id` (cuid) | `entryId` |
| `EntryRelation` | Relations entre incidents | `id` (cuid) | `sourceEntryId`, `targetEntryId` |
| `ResolutionHistory` | Suivi des validations terrain | `id` (cuid) | `entryId` |
| `EntryVersion` | Snapshots d'historique | `id` (cuid) | `entryId`, `versionNumber` |
| `Comment` | Commentaires et notes collaboratives | `id` (cuid) | `entryId` |
| `AuditLog` | Traçabilité des opérations | `id` (cuid) | `createdAt`, `action` |

---

## 2. Énumérations (Enums)

### `EntryStatus`
* `DRAFT` : Brouillon en cours de documentation
* `VALIDATED` : Fiche complète et solution confirmée
* `OUTDATED` : Procédure potentiellement obsolète
* `DEPRECATED` : Remplacée par une autre solution
* `UNRESOLVED` : Incident ouvert sans solution finale

### `RootCauseCategory`
* `CONFIGURATION`, `NETWORK`, `DNS`, `TLS`, `AUTHENTICATION`, `AUTHORIZATION`, `DEPENDENCY`, `SOFTWARE_BUG`, `INFRASTRUCTURE`, `PERFORMANCE`, `SECURITY`, `HUMAN_ERROR`, `UNKNOWN`

### `RelationType`
* `SIMILAR_PROBLEM`, `SIMILAR_CAUSE`, `ALTERNATIVE_SOLUTION`, `PARENT_PROBLEM`, `CHILD_PROBLEM`, `REGRESSION`, `SUPERSEDED_BY`
