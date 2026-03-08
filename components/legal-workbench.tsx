"use client";

import { useState, useTransition } from "react";

type Mode = "review" | "draft";

const initialReview = {
  jurisdiction: "中华人民共和国法律",
  reviewFocus: "付款、违约责任、解除权、争议解决、保密条款",
  clientNotes: ""
};

const initialDraft = {
  contractType: "技术服务合同",
  partyA: "",
  partyB: "",
  businessContext: "",
  keyTerms: "",
  specialClauses: ""
};

export function LegalWorkbench() {
  const [mode, setMode] = useState<Mode>("review");
  const [reviewForm, setReviewForm] = useState(initialReview);
  const [draftForm, setDraftForm] = useState(initialDraft);
  const [reviewFile, setReviewFile] = useState<File | null>(null);
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [status, setStatus] = useState("等待上传文件并填写参数。");
  const [error, setError] = useState("");
  const [downloadName, setDownloadName] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError("");
    setDownloadName("");

    startTransition(async () => {
      try {
        setStatus(mode === "review" ? "正在提取合同文本并生成审阅意见..." : "正在根据业务要求起草合同...");
        const formData = new FormData();
        const endpoint = mode === "review" ? "/api/review" : "/api/draft";

        if (mode === "review") {
          if (!reviewFile) {
            throw new Error("请先上传需要审阅的 Word 或 PDF 合同。");
          }

          formData.set("file", reviewFile);
          formData.set("jurisdiction", reviewForm.jurisdiction);
          formData.set("reviewFocus", reviewForm.reviewFocus);
          formData.set("clientNotes", reviewForm.clientNotes);
        } else {
          formData.set("contractType", draftForm.contractType);
          formData.set("partyA", draftForm.partyA);
          formData.set("partyB", draftForm.partyB);
          formData.set("businessContext", draftForm.businessContext);
          formData.set("keyTerms", draftForm.keyTerms);
          formData.set("specialClauses", draftForm.specialClauses);

          if (draftFile) {
            formData.set("referenceFile", draftFile);
          }
        }

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({ error: "请求失败" }))) as { error?: string };
          throw new Error(payload.error || "处理失败，请稍后重试。");
        }

        const blob = await response.blob();
        const header = response.headers.get("content-disposition") || "";
        const matched = header.match(/filename\*=UTF-8''(.+)$/);
        const fileName = matched ? decodeURIComponent(matched[1]) : mode === "review" ? "合同审阅意见.docx" : "合同起草稿.docx";

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);

        setDownloadName(fileName);
        setStatus(mode === "review" ? "审阅完成，已生成带批注和风险提示的 Word 文件。" : "合同撰写完成，已生成可编辑 Word 文件。");
      } catch (submitError) {
        const message = submitError instanceof Error ? submitError.message : "处理失败，请稍后重试。";
        setError(message);
        setStatus("当前未完成任务，请根据提示调整后重试。");
      }
    });
  };

  return (
    <main className="min-h-screen bg-hero-radial">
      <section className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-8 lg:px-10 lg:py-10">
        <header className="animate-rise rounded-[32px] border border-line bg-white/75 p-8 shadow-card backdrop-blur md:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex rounded-full border border-accent/30 bg-accentSoft px-4 py-2 text-sm tracking-[0.2em] text-accent">
                LEGAL CONTRACT STUDIO
              </p>
              <h1 className="font-display text-4xl font-semibold leading-tight text-ink md:text-6xl">
                让合同审阅与起草，像律师工作台一样专业。
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted md:text-lg">
                上传 Word 或 PDF 合同即可进行专业审阅，输出带风险提示、修改建议和正文标注的 Word 文件；也可按业务需求快速生成可继续编辑的合同初稿。
              </p>
            </div>

            <div className="grid gap-3 rounded-[28px] border border-line bg-paper/70 p-5 text-sm text-muted md:min-w-[280px]">
              <div>支持格式：`.docx` / `.pdf`</div>
              <div>输出结果：可编辑 `.docx`</div>
              <div>模型接入：DeepSeek API</div>
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <div className="animate-rise rounded-[32px] border border-line bg-white/80 p-6 shadow-card backdrop-blur md:p-8">
              <div className="flex flex-wrap gap-3">
                {[
                  { value: "review", label: "合同审阅" },
                  { value: "draft", label: "合同撰写" }
                ].map((tab) => (
                  <button
                    key={tab.value}
                    className={`rounded-full px-5 py-3 text-sm transition ${mode === tab.value ? "bg-ink text-white" : "border border-line bg-white text-ink"}`}
                    onClick={() => setMode(tab.value as Mode)}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {mode === "review" ? (
                <div className="mt-6 grid gap-5">
                  <UploadCard
                    title="上传合同文件"
                    description="推荐上传正式版本合同，支持 Word 与文本型 PDF。"
                    file={reviewFile}
                    onFileChange={setReviewFile}
                  />
                  <Field
                    label="适用地区 / 法律体系"
                    value={reviewForm.jurisdiction}
                    onChange={(value) => setReviewForm((prev) => ({ ...prev, jurisdiction: value }))}
                  />
                  <TextArea
                    label="审阅重点"
                    value={reviewForm.reviewFocus}
                    onChange={(value) => setReviewForm((prev) => ({ ...prev, reviewFocus: value }))}
                    placeholder="例如：价款支付节点、违约责任、解除条件、知识产权归属等"
                  />
                  <TextArea
                    label="客户补充要求"
                    value={reviewForm.clientNotes}
                    onChange={(value) => setReviewForm((prev) => ({ ...prev, clientNotes: value }))}
                    placeholder="例如：我方为乙方，希望尽量控制赔偿责任上限。"
                  />
                </div>
              ) : (
                <div className="mt-6 grid gap-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field
                      label="合同类型"
                      value={draftForm.contractType}
                      onChange={(value) => setDraftForm((prev) => ({ ...prev, contractType: value }))}
                    />
                    <Field
                      label="甲方"
                      value={draftForm.partyA}
                      onChange={(value) => setDraftForm((prev) => ({ ...prev, partyA: value }))}
                    />
                  </div>
                  <Field
                    label="乙方"
                    value={draftForm.partyB}
                    onChange={(value) => setDraftForm((prev) => ({ ...prev, partyB: value }))}
                  />
                  <TextArea
                    label="交易背景"
                    value={draftForm.businessContext}
                    onChange={(value) => setDraftForm((prev) => ({ ...prev, businessContext: value }))}
                    placeholder="请描述交易场景、合作内容、服务周期等。"
                  />
                  <TextArea
                    label="关键商务条款"
                    value={draftForm.keyTerms}
                    onChange={(value) => setDraftForm((prev) => ({ ...prev, keyTerms: value }))}
                    placeholder="例如：合同金额、付款节点、验收标准、发票安排等。"
                  />
                  <TextArea
                    label="特殊条款要求"
                    value={draftForm.specialClauses}
                    onChange={(value) => setDraftForm((prev) => ({ ...prev, specialClauses: value }))}
                    placeholder="例如：保密义务延续 3 年、争议提交上海仲裁委。"
                  />
                  <UploadCard
                    title="上传参考材料（可选）"
                    description="可上传历史合同或业务说明，系统会在撰写时一并参考。"
                    file={draftFile}
                    onFileChange={setDraftFile}
                    optional
                  />
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
                <button
                  className="rounded-full bg-ink px-6 py-3 text-sm text-white transition hover:translate-y-[-1px] hover:bg-[#243329] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isPending}
                  onClick={submit}
                  type="button"
                >
                  {isPending ? "处理中..." : mode === "review" ? "开始专业审阅" : "生成合同初稿"}
                </button>
                <p className="text-sm text-muted">输出文件为可编辑 Word 文档，适合二次修改和交付。</p>
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <StatusCard status={status} error={error} downloadName={downloadName} />
            <InfoCard />
          </aside>
        </section>
      </section>
    </main>
  );
}

function UploadCard({
  title,
  description,
  file,
  onFileChange,
  optional
}: {
  title: string;
  description: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  optional?: boolean;
}) {
  return (
    <label className="grid gap-3 rounded-[28px] border border-dashed border-line bg-paper/75 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-ink">
            {title}
            {optional ? <span className="ml-2 text-muted">（可选）</span> : null}
          </div>
          <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
        </div>
        <span className="rounded-full border border-line px-4 py-2 text-xs text-muted">拖拽或点击上传</span>
      </div>
      <input
        accept=".docx,.pdf"
        className="hidden"
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        type="file"
      />
      <div className="rounded-2xl border border-line bg-white/90 px-4 py-3 text-sm text-ink">
        {file ? `已选择：${file.name}` : "尚未选择文件"}
      </div>
    </label>
  );
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        className="rounded-2xl border border-line bg-white px-4 py-3 outline-none transition focus:border-accent"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-ink">{label}</span>
      <textarea
        className="min-h-[140px] rounded-3xl border border-line bg-white px-4 py-4 outline-none transition focus:border-accent"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function StatusCard({
  status,
  error,
  downloadName
}: {
  status: string;
  error: string;
  downloadName: string;
}) {
  return (
    <div className="animate-rise rounded-[32px] border border-line bg-[#1f2c24] p-6 text-white shadow-card md:p-8">
      <h2 className="font-display text-2xl">处理状态</h2>
      <p className="mt-4 text-sm leading-7 text-white/78">{status}</p>
      {downloadName ? (
        <div className="mt-5 rounded-2xl border border-white/15 bg-white/8 p-4 text-sm">最新输出：{downloadName}</div>
      ) : null}
      {error ? (
        <div className="mt-5 rounded-2xl border border-[#c9745c]/40 bg-[#7b3426]/20 p-4 text-sm text-[#ffd2c7]">
          {error}
        </div>
      ) : null}
      <div className="mt-6 grid gap-3 text-sm text-white/68">
        <div>1. 提取合同内容并做结构整理</div>
        <div>2. 调用 GLM-4 生成律师风格结果</div>
        <div>3. 产出可下载的 Word 文件</div>
      </div>
    </div>
  );
}

function InfoCard() {
  return (
    <div className="animate-rise rounded-[32px] border border-line bg-white/80 p-6 shadow-card backdrop-blur md:p-8">
      <h2 className="font-display text-2xl text-ink">功能说明</h2>
      <div className="mt-5 grid gap-4 text-sm leading-7 text-muted">
        <p>
          `合同审阅` 将输出包含风险等级、修改建议和正文标注的审阅版 Word。若原始 Word 的原位批注能力受限，系统会采用高亮正文加批注说明的专业交付形式。
        </p>
        <p>
          `合同撰写` 将根据你的业务描述直接生成结构完整的合同初稿，方便律师或业务人员继续编辑。
        </p>
        <p>首版默认不支持图片扫描型 PDF，也不提供登录、计费和历史任务存档。</p>
      </div>
      <div className="mt-6 rounded-[24px] border border-accent/20 bg-accentSoft p-4 text-sm leading-7 text-ink">
        法律提示：本系统输出仅作为合同审阅与草拟辅助材料，正式签署前仍建议由执业律师结合具体交易背景进行最终审核。
      </div>
    </div>
  );
}
