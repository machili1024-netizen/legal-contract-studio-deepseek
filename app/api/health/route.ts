import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    time: new Date().toISOString(),
    provider: "deepseek",
    model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
    configured: Boolean(process.env.DEEPSEEK_API_KEY)
  });
}
