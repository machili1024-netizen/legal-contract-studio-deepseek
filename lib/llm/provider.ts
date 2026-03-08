import { z } from "zod";
import type { LLMGenerateOptions, LLMProvider, LLMStructuredResponse } from "@/lib/types";

const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-chat";

interface DeepSeekChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

export class DeepSeekProvider implements LLMProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY ?? "";
    this.baseUrl = process.env.DEEPSEEK_API_BASE_URL ?? DEFAULT_BASE_URL;
    this.model = process.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL;
  }

  async generateStructured<T>(
    options: LLMGenerateOptions,
    schemaName: string
  ): Promise<LLMStructuredResponse<T>> {
    if (!this.apiKey) {
      throw new Error("缺少 DEEPSEEK_API_KEY，无法调用模型服务。");
    }

    const response = await this.requestWithRetry(options, 2);
    const rawText = this.extractText(response);
    const parsed = safeJsonParse(rawText, schemaName);

    return { rawText, data: parsed as T };
  }

  private async requestWithRetry(options: LLMGenerateOptions, retries: number) {
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45000);

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: this.model,
            temperature: options.temperature ?? 0.2,
            messages: [
              { role: "system", content: options.systemPrompt },
              { role: "user", content: options.userPrompt }
            ]
          }),
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const body = (await response.text()) || response.statusText;
          throw new Error(`模型调用失败(${response.status})：${body}`);
        }

        return (await response.json()) as DeepSeekChatResponse;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error ? lastError : new Error("模型调用失败。");
  }

  private extractText(response: DeepSeekChatResponse) {
    const message = response.choices?.[0]?.message?.content?.trim();

    if (!message) {
      throw new Error(response.error?.message || "模型返回内容为空。");
    }

    return message;
  }
}

export function safeJsonParse(rawText: string, schemaName: string) {
  const fenced = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

  try {
    return JSON.parse(fenced);
  } catch {
    throw new Error(`模型返回的 ${schemaName} 不是合法 JSON。`);
  }
}

export function parseStructuredWithSchema<T>(
  rawText: string,
  schema: z.ZodType<T>,
  schemaName: string
) {
  const parsed = safeJsonParse(rawText, schemaName);
  return schema.parse(parsed);
}
