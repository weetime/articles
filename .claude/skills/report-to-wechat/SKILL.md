---
name: report-to-wechat
description: Use when turning a ModelDoctor benchmark / compare report into a WeChat 公众号「一图流」article. Fetches the report, generates light-theme (white-bg default; dark optional) ModelDoctor-brand infographic PNGs (1080px wide), writes the Chinese article weaving images + copy, ends with a fixed footer card (account tagline + QR), and can push to the 公众号 草稿箱. Triggers on requests like "把这个报告写成公众号文章 / 一图流", or a /reports/<id> URL plus 公众号 / 一图流 / 配图.
---

# ModelDoctor 报告 → 公众号一图流文章

Turn one ModelDoctor report into a set of dark-theme infographic posters + a Chinese 公众号 article, in a consistent brand style. Each report tells a different story, so this skill is a **playbook + design system + worked example**, not a rigid renderer. Adapt the content; keep the visual language constant.

## Output layout

Create a per-report folder (gitignored): `modeldoctor/.experiments/wechat-reports/<reportId>/`. Put the `*.html`, `style.css`, `final-*.png`, and `article.md` there.

## Process (follow in order)

1. **Fetch the report.** With Playwright: `browser_navigate` to the report URL, then `browser_evaluate(() => document.body.innerText)`. Extract the headline + every OFF/ON (or A/B) metric, the per-pod numbers, the method (model, pods, tool, scenario, runs × requests), and the caveats/recommendations section.

   **⚠️ Decode internal scenario codes.** The report may label the workload with an internal template code like `长前缀t6` / `t2` / `t5`. Users don't know these. Look up the real meaning in `main/apps/api/prisma/seed.ts` (`BENCHMARK_TEMPLATES`, match by `id`/`name`) and replace with a plain description + the concrete params. E.g. **t6 = 「高并发长前缀 · RAG/Agent 形态」**: `inputTokensMean 3000` + `outputTokensMean 64` + `concurrency 100` + `conversationTurnMean 4` + `sticky-user-sessions` → render as "RAG/Agent 长上下文:in 3000 + out 64 · 并发 100 · 4 轮粘性会话". Never ship the bare code in user-facing copy.

   **⚠️ Always cross-check against the raw per-run benchmark detail pages** (`/benchmarks/<id>`, linked under "Associated benchmarks"). The saved compare report has been seen to **mislabel latency units** (showing seconds as "ms" — off by 1000×) and **overstate request counts** (saying 1000 when raw shows `total/success` = 480). The detail page's `Summary metrics` (TTFT/ITL/E2E ms) and `Prefix Cache Hit Analysis` (per-pod `QUERIES`/`HITS` block-level KV counts) are authoritative — trust them over the report card. A 32B model can't first-token in 12ms; if a number looks physically impossible, it's a unit bug. Also: the report may claim "TPOT not measured" while ITL (≈TPOT) is right there in the detail page.

2. **Decide the figure set.** Default = **1 hero + 5 支撑图** (this is what the worked example uses):
   - `1-hero` — 一图流核心:大标题 + OFF→ON 转折 + 4 个核心数字卡 + 配置 chips。
   - `2-compare` — OFF vs ON 四指标成对大柱(灰=OFF,亮=ON)。
   - `3-method` — 实验设计:模型/硬件/负载/工具 + 对照组 VS + runs×requests。
   - `4-perpod` — 逐 Pod 拆解,证明「增益靠路由不靠流量倾斜」(如报告有 per-pod 数据)。
   - `5-mechanism` — 教学风机制图:为什么有效(因果链)。
   - `6-latency` — 延迟分位数 P50/P95,OFF vs ON。
   Drop/merge figures the report can't support; never invent metrics the report doesn't have. Per-pod illustrative values must stay inside the report's stated ranges and be labelled 代表值.

3. **Build the HTML.** Copy `assets/style.css` and the relevant `assets/templates/*.html` into the report folder, then **edit the numbers, labels, and copy** to match this report. The templates ARE the worked example (prefix-aware routing on Qwen3-32B) — reuse their structure, swap the data. Keep: 1080px width, the `.poster` scaffold (eyebrow → title → content → footer), and the brand footer `ModelDoctor · mcpinfra.net · github.com/weetime`. See `assets/components.md` for copy-paste blocks.

4. **Render to PNG.** `file://` is blocked, so serve over HTTP:
   - `cd` into the report folder, run `python3 -m http.server 8899` in the background.
   - `browser_resize(1080, 1400)`.
   - For each page: `browser_navigate` to `http://localhost:8899/<n>-*.html`, then `browser_take_screenshot` with `target: ".poster"` (element crop — no black margins) → `final-<n>.png`.
   - Spot-check each PNG by Reading it; fix overflow/overlap in the HTML and re-shoot.

5. **Write `article.md`.** Use `assets/article-template.md` as the skeleton: 钩子标题 → 开篇痛点 → 主海报 → 每段「小标题 + 配图 + ~200字解读」→ 适用边界 → **关于作者** → 品牌落款. Chinese, technical-but-readable. Embed images as relative `./final-<n>.png`. Lead with the strongest number in the title.

   **⚠️ 标题与「单次实验」边界**:标题**不要头条任何单一发现**(连不带数字的「X 反超 Y」都会被当成普适结论),也不要在标题里抛具体数字 —— 用「实测 + 这次/差出了多少」这种限定式悬念,把具体发现、数字、作用域全留给正文。正文每句结论都带「本次/这批参数」作用域,且必含「适用边界」段 + 文末「换数据集/换参数,结论可能变」声明。当前 worked example 标题:`昇腾 910B4 实测:同一个 Qwen3-8B,三大引擎差出了多少`。

   **关于作者(账号固定区块)**:`article-template.md` 末尾已内置「关于作者」区块(放在正文之后、品牌落款之前),**逐字保留**——三件事 ①多引擎真实部署/国产卡适配 ②网关·编排·PD分离 ③可观测/SRE + recipes.mcpinfra.net + ModelDoctor + 谦逊免责。换账号时整体替换。见 memory `project_wechat_author_bio`。

6. **(可选)直接推到公众号草稿/发布.** Use `assets/publish_wechat.py` — it uploads the cover + 6 正文图 to WeChat media servers, converts `article.md` to inline-styled 公众号 HTML (no `<style>`/class allowed), creates a draft, and optionally publishes:
   ```bash
   source ~/.secrets   # 提供 WECHAT_APPID / WECHAT_APPSECRET
   python3 ~/articles/.claude/skills/report-to-wechat/assets/publish_wechat.py \
     --dir modeldoctor/.experiments/wechat-reports/<reportId> \
     --title "<标题>" --author "ModelDoctor"          # 仅建草稿
   # 确认草稿无误后,加 --publish 正式发布(freepublish,会过一次审核)
   ```
   **前提 / 易错点**:
   - 账号必须是**已认证**、且开通草稿箱/发布权限的服务号或订阅号。
   - 调用机器的**出口 IP 必须在公众号后台 IP 白名单**(设置与开发 → 基本配置 → IP白名单),否则 `errcode 40164` 会告诉你需要加哪个 IP。
   - 默认**只建草稿**,不自动群发(对外不可逆,留给用户点)。`--publish` 才发。
   - **本账号(vLLM 生产工程)只能推草稿**:`freepublish` 返回 **48001 api unauthorized**(账号未做微信认证,2025-07 起个人/未认证主体无发布接口)。**别再试 `--publish`** —— 建完草稿就让用户去草稿箱手动「发表」。见 memory `project_wechat_publish_flow`。
   - **封面**:推荐用 `assets/templates/0-cover.html`(1080×460,2.35:1 长条,暗色同款)单独渲染出 `cover.png`,再 `--cover cover.png`。直接拿 `final-1.png` 当封面会被裁成长条、容易裁花。
   - 改封面/重推时:用 `draft/delete`(body `{"media_id":"..."}`)删掉旧草稿再重跑,避免草稿箱堆积。

7. **Hand off.** Tell the user the folder path, list the figures. 若用了 `publish_wechat.py`,告知草稿已就绪 / 已发布;否则提醒公众号编辑器需逐张上传图片(markdown 图片外链不会自动嵌入)。

## 凭证

`publish_wechat.py` 从环境变量读 `WECHAT_APPID` / `WECHAT_APPSECRET`(存于 `~/.secrets`,运行前 `source ~/.secrets`)。绝不把密钥写进脚本或仓库。

## Theme: light by default

WeChat 公众号 正文是**白底**,所以**浅色主题是默认**(深色海报浮在白底上显脱节,还和报告原始浅色图打架)。浅色系统在 `assets/style-light.css`,每个图模板有 `*-light.html` 版(link `style-light.css`)。出图用 light 版;`final-N.png` 等基础文件名直接用浅色渲染覆盖即可,正文引用不变。深色版(`style.css` + 无后缀模板)保留作可选/品牌独立海报用。

**固定页脚卡片**:每篇文章末尾放 `assets/templates/footer-card.html` 渲染的 `footer-card.png`(浅色,横版)——左半是公众号名 + 定位标签 + tagline + 底栏 ModelDoctor 落款,右半是**大号公众号二维码**(`qrcode.png`)+「长按识别 · 关注」。**用大二维码版,别用「搜一搜」联合传播 banner**——后者文字多、二维码小,手机端看不清(用户 2026-06 明确反馈)。复用时按账号换 `qrcode.png`(公众号后台「设置与开发 → 公众号设置 → 二维码」下载)+ tagline。当前账号:`vLLM 生产工程`,定位「LLM SRE / vLLM·SGLang / AI 网关 / PD 分离;拒绝 Demo,只谈实战」。
**底部去冗余**:文末只留三段——①一句话「关于作者」(个人定位)②一行免责(单次实验非普适)③大二维码页脚卡片。**不要再加「以上数据由 ModelDoctor…」斜体行**,它和作者句 + 页脚底栏三重重复。

## Brand & style invariants (do not drift)

- **浅色(默认)**:bg `#fff`→`#f5f6fb`,白卡片 + 细边 `#e2e3ed` + 轻阴影;violet `#6d4bff`,cyan `#0891b2`,green `#16a34a`,OFF 灰 `#9aa0b4`。见 `style-light.css`。
- 深色(可选):bg `#08070f`→`#0e0d1a`, 网格 + violet/cyan glow;violet `#8b6dff`;ON violet/green,OFF `#6b7090`;latency cyan,good green。
- Big bold numbers, `PingFang SC` stack, 1080px posters, rounded panels, brand footer on every poster.
- **No emoji icons.** Emoji (🧩🖥️🔁📊🧠…) read instantly as AI-generated and cheapen a technical piece. Use geometric markers instead: small colored squares/dots (`.cdot`), short gradient accent bars (`.bar2`), numerals (01/02/03), or typographic glyphs (▲ ▼ → ✓ ✗). The reference brand decks use zero emoji.
- All visual tokens live in `style.css` — change palette there, not per-poster.

## Reference

Full worked example (this skill was built from it): `modeldoctor/.experiments/wechat-reports/cmqt2qdih/` — 6 posters + article for the prefix-aware routing experiment.
