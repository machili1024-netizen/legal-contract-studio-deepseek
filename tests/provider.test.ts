import { afterEach, describe, expect, it, vi } from "vitest";
import { DeepSeekProvider, parseStructuredWithSchema } from "@/lib/llm/provider";
import { reviewResultSchema } from "@/lib/validation/schemas";

describe("DeepSeekProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.DEEPSEEK_API_KEY;
  });

  it("parses structured content from the model response", async () => {
    process.env.DEEPSEEK_API_KEY = "test-key";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  summary: "summary",
                  overallAssessment: "assessment",
                  findings: [
                    {
                      level: "高",
                      clauseRef: "付款条款",
                      issue: "没有付款节点",
                      risk: "易引发争议",
                      suggestion: "补充付款计划"
                    }
                  ],
                  annotations: [
                    {
                      originalText: "付款时间另行协商",
                      comment: "建议明确日期",
                      proposedText: "自发票开具后 15 日内付款"
                    }
                  ]
                })
              }
            }
          ]
        })
      })
    );

    const provider = new DeepSeekProvider();
    const response = await provider.generateStructured(
      {
        systemPrompt: "system",
        userPrompt: "user"
      },
      "ReviewResult"
    );

    const parsed = parseStructuredWithSchema(response.rawText, reviewResultSchema, "ReviewResult");
    expect(parsed.findings[0].level).toBe("高");
  });

  it("throws when api key is missing", async () => {
    const provider = new DeepSeekProvider();

    await expect(
      provider.generateStructured(
        {
          systemPrompt: "system",
          userPrompt: "user"
        },
        "ReviewResult"
      )
    ).rejects.toThrow("缺少 DEEPSEEK_API_KEY");
  });
});
