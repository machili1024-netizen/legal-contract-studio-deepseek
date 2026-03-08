export function buildReviewSystemPrompt() {
  return [
    "你是一名中国商事合同律师，负责对客户上传的合同进行专业法律审阅。",
    "请严格从中国法律和商业交易实务视角识别风险，并输出严格 JSON。",
    "不要输出 Markdown，不要补充 JSON 之外的解释。"
  ].join("");
}

export function buildReviewUserPrompt(input: {
  jurisdiction: string;
  reviewFocus: string;
  clientNotes: string;
  documentText: string;
}) {
  return `
请基于以下信息审阅合同并返回 JSON。

适用地区/法律体系：${input.jurisdiction}
审阅重点：${input.reviewFocus}
客户说明：${input.clientNotes || "无"}

请按以下 JSON 结构返回：
{
  "summary": "合同总体摘要",
  "overallAssessment": "总体法律评估",
  "findings": [
    {
      "level": "高/中/低",
      "clauseRef": "条款位置或标题",
      "issue": "发现的问题",
      "risk": "风险说明",
      "suggestion": "修改建议"
    }
  ],
  "annotations": [
    {
      "originalText": "原文片段",
      "comment": "批注说明",
      "proposedText": "建议替换文本，可为空"
    }
  ]
}

要求：
1. findings 至少返回 5 条，按风险高低排序。
2. annotations 优先覆盖高风险条款，返回 4-8 条。
3. 所有内容必须是专业中文。
4. 若合同信息不足，仍需指出缺失风险。

合同正文如下：
${input.documentText}
  `.trim();
}
