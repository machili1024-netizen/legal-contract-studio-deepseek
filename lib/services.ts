import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { DeepSeekProvider, parseStructuredWithSchema } from "@/lib/llm/provider";
import { buildDraftSystemPrompt, buildDraftUserPrompt } from "@/lib/prompts/draft";
import { buildReviewSystemPrompt, buildReviewUserPrompt } from "@/lib/prompts/review";
import { draftResultSchema, reviewResultSchema, type DraftRequestInput, type ReviewRequestInput } from "@/lib/validation/schemas";

const provider = new DeepSeekProvider();

export async function reviewContract(
  request: ReviewRequestInput,
  documentText: string,
  originalName: string
) {
  const result = await provider.generateStructured(
    {
      systemPrompt: buildReviewSystemPrompt(),
      userPrompt: buildReviewUserPrompt({ ...request, documentText }),
      temperature: 0.2
    },
    "ReviewResult"
  );

  const validated = parseStructuredWithSchema(result.rawText, reviewResultSchema, "ReviewResult");
  const buffer = await buildReviewDocx(validated, originalName, documentText);

  return {
    fileName: `${stripExt(originalName)}-审阅意见.docx`,
    buffer
  };
}

export async function draftContract(request: DraftRequestInput, referenceText?: string) {
  const result = await provider.generateStructured(
    {
      systemPrompt: buildDraftSystemPrompt(),
      userPrompt: buildDraftUserPrompt({ ...request, referenceText }),
      temperature: 0.35
    },
    "DraftResult"
  );

  const validated = parseStructuredWithSchema(result.rawText, draftResultSchema, "DraftResult");
  const buffer = await buildDraftDocx(validated);

  return {
    fileName: `${request.contractType}-起草稿.docx`,
    buffer
  };
}

async function buildReviewDocx(
  result: typeof reviewResultSchema._type,
  originalName: string,
  documentText: string
) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          title(`合同审阅报告｜${stripExt(originalName)}`),
          intro(`总体评估：${result.overallAssessment}`),
          sectionHeading("一、合同摘要"),
          body(result.summary),
          sectionHeading("二、风险提示"),
          ...result.findings.flatMap((finding, index) => [
            bullet(`${index + 1}. [${finding.level}风险] ${finding.clauseRef}`),
            body(`问题：${finding.issue}`),
            body(`风险：${finding.risk}`),
            body(`建议：${finding.suggestion}`)
          ]),
          sectionHeading("三、重点批注"),
          ...result.annotations.flatMap((annotation, index) => [
            bullet(`${index + 1}. 原文片段：${annotation.originalText}`),
            body(`批注：${annotation.comment}`),
            ...(annotation.proposedText ? [body(`建议改为：${annotation.proposedText}`)] : [])
          ]),
          sectionHeading("四、带标注正文摘录"),
          ...buildAnnotatedPreview(documentText, result.annotations)
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}

async function buildDraftDocx(result: typeof draftResultSchema._type) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          title(result.title),
          intro(result.preamble),
          sectionHeading("合同要素"),
          body(`合同类型：${result.metadata.contractType}`),
          body(`签约主体：${result.metadata.parties.join(" / ")}`),
          body(`适用法律：${result.metadata.governingLaw}`),
          body(`生效安排：${result.metadata.effectiveDate}`),
          ...result.sections.flatMap((section) => [sectionHeading(section.title), body(section.content)]),
          sectionHeading("签署及补充说明"),
          ...result.closingNotes.map((note) => bullet(note)),
          body("甲方（盖章）：________________"),
          body("乙方（盖章）：________________"),
          body("签署日期：________________")
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}

function buildAnnotatedPreview(documentText: string, annotations: Array<{ originalText: string; comment: string }>) {
  const preview = documentText.split("\n").filter(Boolean).slice(0, 18);

  return preview.map((paragraphText) => {
    const matched = annotations.find(
      (annotation) =>
        annotation.originalText &&
        paragraphText.includes(annotation.originalText.slice(0, Math.min(annotation.originalText.length, 14)))
    );

    if (!matched) {
      return body(paragraphText);
    }

    return new Paragraph({
      spacing: { after: 140 },
      children: [
        new TextRun({
          text: paragraphText,
          shading: {
            fill: "F6EBD5"
          }
        }),
        new TextRun({
          text: `  【批注】${matched.comment}`,
          color: "A64B2A",
          italics: true
        })
      ]
    });
  });
}

function title(text: string) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 280 },
    children: [new TextRun({ text, bold: true, size: 34, font: "Songti SC" })]
  });
}

function intro(text: string) {
  return new Paragraph({
    spacing: { after: 220 },
    children: [new TextRun({ text, size: 24, color: "4B5B4E" })]
  });
}

function sectionHeading(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 140 },
    children: [new TextRun({ text, bold: true, color: "1B261F" })]
  });
}

function body(text: string) {
  return new Paragraph({
    spacing: { after: 140 },
    children: [new TextRun({ text, size: 24 })]
  });
}

function bullet(text: string) {
  return new Paragraph({
    spacing: { after: 100 },
    bullet: { level: 0 },
    children: [new TextRun({ text, size: 24 })]
  });
}

function stripExt(name: string) {
  return name.replace(/\.(docx|pdf)$/i, "");
}
