export type EntryStatus =
  | "DRAFT"
  | "VALIDATED"
  | "OUTDATED"
  | "DEPRECATED"
  | "UNRESOLVED";

export type ConfidenceLevel =
  | "VALIDATED"
  | "PROBABLE"
  | "PARTIAL"
  | "UNRESOLVED";

export type RootCauseCategory =
  | "CONFIGURATION"
  | "NETWORK"
  | "DNS"
  | "TLS"
  | "AUTHENTICATION"
  | "AUTHORIZATION"
  | "DEPENDENCY"
  | "SOFTWARE_BUG"
  | "INFRASTRUCTURE"
  | "PERFORMANCE"
  | "SECURITY"
  | "HUMAN_ERROR"
  | "UNKNOWN";

export type ResourceType =
  | "OFFICIAL_DOC"
  | "ARTICLE"
  | "GITHUB"
  | "STACKOVERFLOW"
  | "TICKET"
  | "RFC"
  | "CVE"
  | "INTERNAL_DOC"
  | "VIDEO"
  | "PDF"
  | "OTHER";

export type RelationType =
  | "SIMILAR_PROBLEM"
  | "SIMILAR_CAUSE"
  | "ALTERNATIVE_SOLUTION"
  | "PARENT_PROBLEM"
  | "CHILD_PROBLEM"
  | "REGRESSION"
  | "SUPERSEDED_BY";

export type ResolutionStatus = "SUCCESS" | "FAILURE" | "PARTIAL";

export interface InvestigationStepDto {
  id?: string;
  stepNumber: number;
  hypothesis: string;
  command?: string | null;
  result?: string | null;
  conclusion: string;
}

export interface ResolutionStepDto {
  id?: string;
  stepNumber: number;
  title: string;
  description: string;
  command?: string | null;
  expectedResult?: string | null;
  actualResult?: string | null;
  notes?: string | null;
  order: number;
}

export interface CommandSnippetDto {
  id?: string;
  language: string;
  command: string;
  description: string;
  context?: string | null;
  expectedOutput?: string | null;
  tags?: string[];
}

export interface ResourceLinkDto {
  id?: string;
  title: string;
  url: string;
  resourceType: ResourceType;
  description?: string | null;
  source?: string | null;
}

export interface EntryRelationDto {
  id?: string;
  targetEntryId: string;
  targetTitle?: string;
  targetReadableId?: string;
  relationType: RelationType;
  notes?: string | null;
}

export interface ResolutionHistoryDto {
  id?: string;
  testedAt: string;
  testerName: string;
  environment: string;
  resultStatus: ResolutionStatus;
  notes: string;
}

export interface EntryVersionDto {
  id: string;
  versionNumber: number;
  modifiedBy: string;
  changeSummary: string;
  createdAt: string;
  snapshotData?: any;
}

export interface CommentDto {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  parentId?: string | null;
  entryCount?: number;
}

export interface TagDto {
  id: string;
  name: string;
  slug: string;
  color: string;
  entryCount?: number;
}

export interface KnowledgeEntryDto {
  id: string;
  readableId: string;
  title: string;
  slug: string;
  status: EntryStatus;
  confidenceLevel: ConfidenceLevel;
  authorName: string;
  isFavorite: boolean;
  viewCount: number;
  qualityScore: number;
  lastTestedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  // Classification
  categoryId: string;
  category?: CategoryDto;
  subcategoryId?: string | null;
  environment: string;
  technologies: string[];
  tools: string[];
  affectedSystems: string[];
  affectedProjects: string[];

  // Problem & Context
  problemDescription: string;
  contextDescription: string;
  symptoms: string;
  errorMessage: string;
  triggerConditions: string;

  // Root Cause
  rootCause: string;
  secondaryCauses?: string | null;
  responsibleComponent?: string | null;
  triggerFactor?: string | null;
  rootCauseCategory: RootCauseCategory;

  // Resolution & Validation
  quickSolution: string;
  validationTested: boolean;
  validationEnvironment?: string | null;
  validationResult?: string | null;
  hasRegression: boolean;

  // Nested structures
  tags?: TagDto[];
  investigations?: InvestigationStepDto[];
  resolutionSteps?: ResolutionStepDto[];
  commands?: CommandSnippetDto[];
  resources?: ResourceLinkDto[];
  sourceRelations?: EntryRelationDto[];
  resolutionHistories?: ResolutionHistoryDto[];
  versions?: EntryVersionDto[];
  comments?: CommentDto[];
}

export interface QuickCapturePayload {
  title: string;
  symptoms: string;
  errorMessage?: string;
  rootCause: string;
  quickSolution: string;
  commands?: {
    language: string;
    command: string;
    description: string;
  }[];
  categoryId: string;
  tags?: string[];
  environment?: string;
  technologies?: string[];
  tools?: string[];
  status?: EntryStatus;
  confidenceLevel?: ConfidenceLevel;
}

export interface SearchQueryFilters {
  q?: string;
  categoryId?: string;
  tag?: string;
  technology?: string;
  tool?: string;
  environment?: string;
  status?: EntryStatus;
  confidenceLevel?: ConfidenceLevel;
  isFavorite?: boolean;
  isResolved?: boolean;
  isValidated?: boolean;
  sort?: "recent" | "views" | "score" | "title" | "lastTested";
  page?: number;
  limit?: number;
}

export interface SimilarityMatch {
  id: string;
  readableId: string;
  title: string;
  slug: string;
  categoryName: string;
  similarityScore: number; // 0 to 100
  matchedFields: string[];
  quickSolution: string;
  rootCause: string;
  symptoms: string;
  status: EntryStatus;
}

export interface QualityBreakdown {
  score: number; // 0 to 100
  checklist: {
    label: string;
    valid: boolean;
    points: number;
    description: string;
  }[];
}
