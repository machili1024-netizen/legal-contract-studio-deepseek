import mammoth from "mammoth";
import pdf from "pdf-parse";

export async function extractTextFromDocument(fileName: string, buffer: Buffer) {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer });
    return normalizeExtractedText(value);
  }

  if (lowerName.endsWith(".pdf")) {
    const result = await pdf(buffer);
    const text = normalizeExtractedText(result.text);

    if (text.length < 80) {
      throw new Error("当前 PDF 可能为扫描件或文本过少，首版仅支持可提取文本的 PDF。");
    }

    return text;
  }

  throw new Error("不支持的文件类型。");
}

function normalizeExtractedText(input: string) {
  return input.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}
