import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { assertSupportedFile, fileToBuffer } from "@/lib/files";
import { extractTextFromDocument } from "@/lib/parsers/extract-text";
import { draftContract } from "@/lib/services";
import { draftRequestSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const referenceFile = formData.get("referenceFile");
      let referenceText = "";

      if (referenceFile instanceof File && referenceFile.size > 0) {
        assertSupportedFile(referenceFile);
        referenceText = await extractTextFromDocument(referenceFile.name, await fileToBuffer(referenceFile));
      }

      const payload = draftRequestSchema.parse({
        contractType: formData.get("contractType"),
        partyA: formData.get("partyA"),
        partyB: formData.get("partyB"),
        businessContext: formData.get("businessContext"),
        keyTerms: formData.get("keyTerms"),
        specialClauses: formData.get("specialClauses")
      });

      const output = await draftContract(payload, referenceText);

      return new NextResponse(output.buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(output.fileName)}`
        }
      });
    }

    const json = await request.json();
    const payload = draftRequestSchema.parse(json);
    const output = await draftContract(payload);

    return new NextResponse(output.buffer, {
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
      { error: error instanceof Error ? error.message : "撰写失败，请稍后重试。" },
      { status: 500 }
    );
  }
}
