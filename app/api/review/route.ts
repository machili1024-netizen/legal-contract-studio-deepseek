import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { assertSupportedFile, fileToBuffer } from "@/lib/files";
import { extractTextFromDocument } from "@/lib/parsers/extract-text";
import { reviewContract } from "@/lib/services";
import { reviewRequestSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请上传需要审阅的合同文件。" }, { status: 400 });
    }

    assertSupportedFile(file);

    const payload = reviewRequestSchema.parse({
      jurisdiction: formData.get("jurisdiction"),
      reviewFocus: formData.get("reviewFocus"),
      clientNotes: formData.get("clientNotes")
    });

    const buffer = await fileToBuffer(file);
    const text = await extractTextFromDocument(file.name, buffer);
    const output = await reviewContract(payload, text, file.name);

    return new NextResponse(new Uint8Array(output.buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(output.fileName)}`
      }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "请求参数不完整。" }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "审阅失败，请稍后重试。" },
      { status: 500 }
    );
  }
}
