const DEFAULT_LIMIT_MB = 15;

export function getMaxUploadSizeBytes() {
  const configured = Number(process.env.MAX_UPLOAD_SIZE_MB ?? DEFAULT_LIMIT_MB);
  const safe = Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_LIMIT_MB;
  return safe * 1024 * 1024;
}

export function assertSupportedFile(file: File) {
  const maxBytes = getMaxUploadSizeBytes();
  const ext = file.name.toLowerCase();
  const supported = ext.endsWith(".docx") || ext.endsWith(".pdf");

  if (!supported) {
    throw new Error("仅支持上传 .docx 或 .pdf 文件。");
  }

  if (file.size > maxBytes) {
    throw new Error(`文件过大，请上传不超过 ${Math.round(maxBytes / 1024 / 1024)}MB 的文件。`);
  }
}

export async function fileToBuffer(file: File) {
  return Buffer.from(await file.arrayBuffer());
}
