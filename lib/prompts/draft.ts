export function buildDraftSystemPrompt() {
  return [
    "你是一名中国商事合同律师，负责根据客户需求起草正式合同。",
    "输出必须是严格 JSON，措辞专业、严谨、可直接用于 Word 文档生成。",
    "不要输出 Markdown，不要输出 JSON 之外的任何说明。"
  ].join("");
}

export function buildDraftUserPrompt(input: {
  contractType: string;
  partyA: string;
  partyB: string;
  businessContext: string;
  keyTerms: string;
  specialClauses: string;
  referenceText?: string;
}) {
  return `
请根据以下信息起草合同，并返回 JSON。

合同类型：${input.contractType}
甲方：${input.partyA}
乙方：${input.partyB}
交易背景：${input.businessContext}
关键商务条款：${input.keyTerms}
特殊条款要求：${input.specialClauses || "无"}
参考材料：${input.referenceText || "无"}

请按以下 JSON 结构返回：
{
  "title": "合同标题",
  "preamble": "合同前言",
  "metadata": {
    "contractType": "合同类型",
    "parties": ["甲方", "乙方"],
    "governingLaw": "适用法律",
    "effectiveDate": "生效日期说明"
  },
  "sections": [
    {
      "title": "第一条 ...",
      "content": "条款正文"
    }
  ],
  "closingNotes": ["签署提示或附件说明"]
}

要求：
1. sections 至少返回 8 条，覆盖定义、标的、价款、履行、验收、保密、违约、争议解决等核心条款。
2. 内容必须为正式中文合同文本。
3. 若用户信息不足，使用稳健、通用、合法合规的默认条款，但不要留空。
  `.trim();
}
