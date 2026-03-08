export type ReviewRiskLevel = "高" | "中" | "低";

export interface ReviewFinding {
  level: ReviewRiskLevel;
  clauseRef: string;
  issue: string;
  risk: string;
  suggestion: string;
}

export interface ReviewAnnotation {
  originalText: string;
  comment: string;
  proposedText?: string;
}

export interface ReviewResult {
  summary: string;
  overallAssessment: string;
  findings: ReviewFinding[];
  annotations: ReviewAnnotation[];
}

export interface DraftMetadata {
  contractType: string;
  parties: string[];
  governingLaw: string;
  effectiveDate: string;
}

export interface DraftSection {
  title: string;
  content: string;
}

export interface DraftResult {
  title: string;
  preamble: string;
  metadata: DraftMetadata;
  sections: DraftSection[];
  closingNotes: string[];
}

export interface LLMGenerateOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}

export interface LLMStructuredResponse<T> {
  rawText: string;
  data: T;
}

export interface LLMProvider {
  generateStructured<T>(
    options: LLMGenerateOptions,
    schemaName: string
  ): Promise<LLMStructuredResponse<T>>;
}
