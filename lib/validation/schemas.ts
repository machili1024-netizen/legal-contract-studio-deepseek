import { z } from "zod";

export const reviewRequestSchema = z.object({
  jurisdiction: z.string().trim().min(2, "请填写适用地区或法律体系"),
  reviewFocus: z.string().trim().min(2, "请填写审阅重点"),
  clientNotes: z.string().trim().optional().default("")
});

export const draftRequestSchema = z.object({
  contractType: z.string().trim().min(2, "请填写合同类型"),
  partyA: z.string().trim().min(2, "请填写甲方"),
  partyB: z.string().trim().min(2, "请填写乙方"),
  businessContext: z.string().trim().min(10, "请更完整地描述交易背景"),
  keyTerms: z.string().trim().min(10, "请填写关键商务条款"),
  specialClauses: z.string().trim().optional().default("")
});

export const reviewResultSchema = z.object({
  summary: z.string(),
  overallAssessment: z.string(),
  findings: z.array(
    z.object({
      level: z.enum(["高", "中", "低"]),
      clauseRef: z.string(),
      issue: z.string(),
      risk: z.string(),
      suggestion: z.string()
    })
  ),
  annotations: z.array(
    z.object({
      originalText: z.string(),
      comment: z.string(),
      proposedText: z.string().optional()
    })
  )
});

export const draftResultSchema = z.object({
  title: z.string(),
  preamble: z.string(),
  metadata: z.object({
    contractType: z.string(),
    parties: z.array(z.string()).min(2),
    governingLaw: z.string(),
    effectiveDate: z.string()
  }),
  sections: z.array(
    z.object({
      title: z.string(),
      content: z.string()
    })
  ),
  closingNotes: z.array(z.string())
});

export type ReviewRequestInput = z.infer<typeof reviewRequestSchema>;
export type DraftRequestInput = z.infer<typeof draftRequestSchema>;
