# 合同审阅与撰写工作台

一个基于 Next.js 的中文律师风格 Web 应用，支持上传 Word/PDF 合同进行专业审阅，或根据业务要求生成可编辑合同草稿。

## 功能

- 合同审阅：上传 `.docx` / `.pdf`，输出带风险提示、修改建议和正文标注的 `.docx`
- 合同撰写：输入合同需求并可附参考文件，输出可继续编辑的 `.docx`
- 模型抽象层：默认接入 `DeepSeek`
- 健康检查：`/api/health`

## 本地启动

当前仓库已准备好项目代码，但这台机器在本次会话里尚未检测到 `Node.js / npm`。先安装 `Node.js 20+`，然后执行：

```bash
npm install
npm run dev
```

复制环境变量：

```bash
copy .env.example .env.local
```

复制环境变量：

```bash
copy .env.example .env.local
```

然后在 `.env.local` 中填入：

- `DEEPSEEK_API_KEY`
- `DEEPSEEK_API_BASE_URL`
- `DEEPSEEK_MODEL`

## 说明

- 首版仅支持可提取文本的 PDF，不支持纯图片扫描件
- 首版不含登录、数据库、计费和历史任务
- 审阅版 Word 采用“高亮正文 + 批注说明 + 风险页 + 建议页”的稳定交付形式
