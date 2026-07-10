# 大模型网站全景地图 — 文章 + 实拍导览视频 设计

> 状态:已与用户确认核心决策(2026-07-10)。素材源:`~/Downloads/大模型相关网站梳理.md`(约 50 站 / 8 类)。

## 目标

把源文件里的大模型相关网站,**调研 → 归类 → 讲特色 → 讲场景**,产出:
1. 一篇公众号图文文章(链路叙事 + 收藏导航,中等偏长 4000–5500 字,真实截图)。
2. 一支网站实拍点击导览视频(竖屏 9:16,Playwright 录屏 + AI 配音 + 字幕,60–90 秒)。

## 已确认决策

| 维度 | 选择 |
|---|---|
| 文章定位 | 链路叙事 +（每类)收藏导航表格 |
| 文章篇幅 | 中等偏长,4000–5500 字 |
| 截图规模 | 重点站截图约 14 张;免登录用 Playwright 自动截;挡登录时找用户 |
| 视频形态 | 网站实拍点击导览(非代码动画) |
| 视频配音 | edge-tts 中文 AI 配音 + 烧字幕 |
| 视频比例 | 竖屏 9:16(1080×1920) |

## 主线

顺「**看榜 → 选型 → 落地 → 趋势**」链路。每一「站」= 一个真实工作场景:我要解决什么 → 打开哪些网站 → 怎么看、坑在哪。第七类「部署落地」是作者主场(ModelDoctor / 让推理从能跑到敢上线),给最重篇幅。

## 文章结构

标题主推:《大模型网站全景地图:从「看榜」到「敢上线」,我常用的这几十个站》

| 段 | 场景钩子 | 主讲站(配截图) | 收全表格 |
|---|---|---|---|
| 开篇 | 信息过载,给一张地图,交代链路 | — | — |
| ①看榜·综合 | "谁最强" | LMArena、SuperCLUE | 一、四类 |
| ②看榜·陷阱 | 榜单会骗人:MMLU 饱和 / 偏好≠事实 / 标称≠有效上下文 | Context Arena / LiveBench | 避坑小节 |
| ③选型定价 | "上哪个、多少钱" | LLM-Stats、Artificial Analysis | 二、三类 |
| ④垂直能力 | "编码 / embedding / 工具调用谁行" | SWE-bench、MTEB | 五类 |
| ⑤拿模型 | "从哪调 API / 本地怎么跑" | OpenRouter、Hugging Face | 六类 |
| ⑥落地(主场) | "真部署起来:模型×GPU 给命令" | recipes.vllm.ai、recipes.mcpinfra.net | 七类 |
| ⑦趋势 | 宏观视角:成本下降 / 上下文增长 | Epoch AI | 八类 |
| 结尾 | 三条避坑 + 我的用法路径 + 收藏钩子 + 作者/footer | — | — |

差异化钩子:大多数榜只给"跑得多好",少有人给"在 A100/4090/910B 上怎么部署、实测多少 TTFT/吞吐" —— 接 ModelDoctor 实测系列。

## 截图清单(约 14,重点站)

LMArena · SuperCLUE · CompassRank(司南)· LLM-Stats · Artificial Analysis · AI Release Tracker · SWE-bench · MTEB · OpenRouter(含 token 份额榜)· Hugging Face · recipes.vllm.ai · recipes.mcpinfra.net · Epoch AI trends · ARC-AGI

采集方式:
- 逐站先 WebFetch 核对当前状态与真实特色,避免过时信息。
- 免登录站用 Playwright(桌面视口、@2x),存 `content/2026-07-llm-sites-map/shots/`。
- 挡登录的站(如个别榜单详情)截到墙即通知用户协助登录。

## 视频:网站实拍点击导览

- Playwright 录真实站点点击过程,沿同一链路走 **8 站**精选:
  LMArena → SuperCLUE → LLM-Stats → Artificial Analysis → SWE-bench → OpenRouter → recipes.vllm.ai → recipes.mcpinfra.net
- 光标不进录屏 → 记录点击坐标,PIL 合成光标 + 圆点高亮(参照 playwright-site-tour 经验)。
- 竖屏画框 + 每站一句要点 callout;edge-tts 中文配音贯穿 + 烧字幕;60–90 秒。
- 片头:"按这条链路,我每天开这些站";片尾引流公众号。

## 产出物落位

新目录 `content/2026-07-llm-sites-map/`:
- `article.md` — 图文源
- `shots/*.png` — 截图
- `site-tour.py` — 录制脚本
- `video-portrait.mp4` — 竖屏视频
- `publish_meta.json` — 发布元数据

## 待核实/风险

- 部分站点可能改版或下线 → 写作前逐站核对。
- 视频录屏依赖网络与站点加载稳定性 → 单站失败可跳过或换备选站。
- 光标合成、竖屏适配沿用既有经验,首次跑通后再批量。
