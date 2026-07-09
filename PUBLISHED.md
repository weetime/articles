# 发布清单

每篇文章/视频发布到各平台的状态与链接。**发布后把对应单元格替换成链接。**

图例:✅ 已发(点击链接) · 🟡 草稿/待发 · ⚪ 未发 · — 不适用

| 文章 | 公众号 | 视频号 | 抖音 | B站 | YouTube | X |
|---|---|---|---|---|---|---|
| [大模型推理评测:从跑分幻觉到场景验收](content/2026-07-llm-eval-series/) · 硬核长文 + Agent 通识视频 | 🟡 草稿已推(深色一图流·封面 banner·待手动发) | 🟡 竖屏 59s(Agent 通识)待发 | 🟡 待发 | ⚪ | — | — |
| [MCP 元年:加冕与裂缝(水墨史评)](content/2026-07-mcp-chronicle/) · 视频先行 | ⚪ 待配图/文章 | 🟡 横屏 4'19" 待发 | 🟡 待发 | 🟡 待发 | ⚪ 英文标题版可选 | ⚪ |
| [PPU DeepSeek-V4 参数寻优解读](content/2026-07-ppu-deepseek-v4-解读/) · 「测试报告解读」系列① | 🟡 草稿已推(中立·无外链·待手动发+加热) | 🟡 走查片 1:51 + 引流 28s 待发 | 🟡 待发 | ⚪ | — | — |
| [Higress 多集群场景化选型](content/2026-06-higress-multicluster-scenarios/) | 🟡 草稿(图文+贴图) | 🟡 待发 | 🟡 待发 | ⚪ | [✅ 正片](https://youtu.be/mCUZ8DK5s54) · [Short](https://youtu.be/HN8TaUKOZpg) | ⚪ |
| [Qwen3-32B 昇腾三引擎横评](content/2026-06-qwen3-32b-ascend-three-engine/) | ✅ 已发 | ✅ 已发 | ✅ 已发 | ⚪ | [✅ 公开](https://youtu.be/MWPS-YX8714) | ⚪ |
| [Higress prefix_cache 路由实测](content/2026-06-higress-prefix-cache-routing/) | ⚪ | ⚪ | ⚪ | ⚪ | [✅ 公开](https://youtu.be/x5ACtbvzI-c) | ⚪ |
| [Higress 双协议兼容实测](content/2026-05-higress-protocol-compat/) | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |

---

## 各篇产物速查

### 2026-07 · 大模型推理评测:从跑分幻觉到场景验收
- 主题:面向私有化部署的**「业务可用性测试」方法论**。先破三个误区(打榜≠验收 / 峰值 token/s≠可用性能 / 参数调优测试 vs 业务可用性测试两阶段),再讲性能主干(三线法·延迟-吞吐曲线·SLO 拐点)、指标口径(TTFT/TPOT/ITL/E2E/goodput)、工具选型、五场景五测法、Agent 的 Pass^k。中立、专业、去营销;通篇第一人称「咱们」。
- 数据:MLPerf 延迟约束(交互档 p99 TTFT≤450ms/TPOT≤40ms)+ 国产 PPU 810E×SGLang 跑 DeepSeek-V4-Flash(INT8)τ²-bench 实测(airline Pass¹ 81.5% / retail Pass¹ 85.7% / Pass⁴≈67%)。
- 文章:[`content/2026-07-llm-eval-series/article.md`](content/2026-07-llm-eval-series/article.md)
- 配图(深色一图流,ModelDoctor 暗色品牌):`final-1`(hero)·`final-2`(三线法曲线)·`final-3`(Prefill/Decode)·`final-4`(五场景表)·`final-5`(Pass^k)·`final-6`(指标口径表)·`final-7`(工具选型表)· `cover.png`(2.35:1 封面 banner)· `footer-card.png`(关注卡)。渲染 `render.js`(puppeteer-core + 系统 Chrome)。
- 公众号:草稿已推(深色版,标题《大模型推理评测:从跑分幻觉到场景验收》);本账号未微信认证,只能建草稿,去后台「草稿箱」手动发表。
- 视频:竖屏 9:16 · 59s Agent 通识版(edge-tts YunyangNeural + 烧录字幕 + 程序合成 BGM),`video-portrait.mp4`(gitignore)→ 视频号/抖音手动传。Remotion 源 `anim/src`(Hook/Steps/OneWrong/PassK/Outro)。
- 待办:① 公众号草稿箱手动发表 ② 上传竖屏视频到视频号/抖音。

### 2026-07 · MCP 元年:加冕与裂缝(水墨史评)
- 主题:MCP 元年「加冕(Linux 基金会 · 月下载 9700 万)与裂缝(工具投毒/CVE-2025-6514 9.6/MCPTox 72.8%)同行」的编年史评,从网关工程师视角给出判词:**协议下沉、智能上浮;分水岭不是「能不能连上」,而是「有没有治理」**。差异化定位——不是「MCP 是什么/怎么写」,而是一次盖棺定论。
- 形态:**视频先行**。横屏 16:9 · 4'19" · 冷静史评体旁白(edge-tts YunyangNeural)· 古风古琴 BGM(程序合成零版权)· 无烧字幕。
- 视觉:**水墨/手绘**(与 ModelDoctor 霓虹暗色品牌反向,刻意不与市面 MCP 内容重叠)。程序化 SVG 水墨 + 毛笔字(Xingkai 行楷 / Weibei 魏碑 / Kaiti 楷 / Baoli 隶,系统字抽单面 + pyftsubset 子集化为 woff2)+ 朱砂印章 + 晕染转场;宣纸持续呼吸让静帧不死。复用 Remotion+edge-tts+ffmpeg 流水线,另起一套 `ink.tsx` 视觉系统。
- 数据:全部经 deep-research(106 agent · 三票核实)。已修正原大纲「选对率 43%→14% 崩盘」为 **13.62%→43.13%(检索提升)**;官方自报数(9700万/98.7%/85%)与 2026 动向(Perplexity/IETF MCPS/nginx-ui)已在画面标注。来源见 `publish_meta.json`。
- 分镜(7):`Kaimu` 起·加冕与裂缝 · `JiaMian` 为何加冕 · `LieFeng` 致命三要素 · `ShiGu` 事故线 · `ZhangDan` 账单与清算 · `ShiZi` 十字路口 · `PanCi` 判词。脚本 `script.md`。
- 产物:`video-landscape.mp4`(横屏,44.1k 立体声)· `anim/`(Remotion 源)· `bgm.wav`(gitignore)· `publish_meta.json`。
- 待办:① 60s Shorts 引流版(可选)② 配套公众号「一图流」文章 + 配图 ③ 手动上传视频号/抖音/B站。

### 2026-06 · Higress 多集群场景化选型
- 主题:同一套 Higress AI 网关能力栈(ai-route / ai-provider / 治理插件 / ai-LB+EPP / PD 分离 / 分层 KV),只换网络拓扑 + ai-route 策略位置,落成 4 套部署方案:**单集群 / 管算分离(推荐)/ 管算一体 / 去中心**;附 10 维选型对比 + 跨集群路由「换 DestinationRule 即切」5 策略真实双集群实测(会话亲和 20/20 全粘、熔断 ~28×503、加权 30/70)。
- 图来源:`~/go/src/github.com/higress/multicluster-declarative/infographic`(深色霓虹海报 overview + v1–v4,直接复用渲染)。
- 文章:[`content/2026-06-higress-multicluster-scenarios/article.md`](content/2026-06-higress-multicluster-scenarios/article.md)
- 配图:`final-1.png`(场景化选型图,4 卡片 + 10 维对比)…`final-5.png`(去中心) · `cover.png`(暗色 2.35:1 封面) · `footer-card.png`(落款卡)
- 公众号:**已建两份草稿** —— ① 图文(news) ② 贴图(newspic / 图片消息);本账号未微信认证,只能建草稿,去后台「草稿箱」手动发表。
- 视频(Remotion 代码动画,含请求流/策略切换/故障转移/三个 CR 机制拓扑):
  - 中文竖屏 `video-portrait.mp4`(完整 3'40")+ `video-short.mp4`(60s)→ 视频号/抖音手动传
  - 英文横屏 `video-landscape-en.mp4` → **YouTube 正片** [youtu.be/mCUZ8DK5s54](https://youtu.be/mCUZ8DK5s54)(public)
  - 英文竖屏 `video-short-en.mp4` → **YouTube Shorts** [youtu.be/HN8TaUKOZpg](https://youtu.be/HN8TaUKOZpg)(public)
- 发布元数据:[`publish_meta.json`](content/2026-06-higress-multicluster-scenarios/publish_meta.json)

### 2026-06 · Higress prefix_cache 路由实测
- 主题:只改网关负载均衡(轮询 → prefix_cache),vLLM 前缀缓存命中率 22%→65%、吞吐 +64%、TTFT P95 −40%(Qwen3-32B × 4 Pods)。
- 文章:[`content/2026-06-higress-prefix-cache-routing/article-hardcore.md`](content/2026-06-higress-prefix-cache-routing/article-hardcore.md)
- 视频:`video-portrait.mp4`(竖屏 → 视频号/抖音) · `video-landscape.mp4`(横屏 → YouTube/B站)
- 发布元数据:[`publish_meta.json`](content/2026-06-higress-prefix-cache-routing/publish_meta.json)

### 2026-05 · Higress 双协议兼容实测
- 主题:同一网关 / 同一后端 Qwen3-32B,OpenAI 与 Anthropic 双协议并行;实测 80 次(Tukey 滤波)P50 TTFT 差 6.6ms、总时延差 0.1% → 零可测损耗;并从 ai-proxy 源码讲清零损耗原理(无状态流式转码器)+ 模型适用边界(文本/视觉 LLM 吃得到,嵌入/图像生成/音视频走不了 Anthropic 协议)。
- 文章:[`content/2026-05-higress-protocol-compat/article.md`](content/2026-05-higress-protocol-compat/article.md)
- 配图:`final-1.png`…`final-7.png`(白底一图流海报,含「转换适用范围」模型边界图) · `source-protocol-latency.png`(报告原始数据图,文章第一节) · `cover.png`(公众号封面 2.35:1) · `footer-card.png`(落款卡)
- 发布元数据:[`publish_meta.json`](content/2026-05-higress-protocol-compat/publish_meta.json)
