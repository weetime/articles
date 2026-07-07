# 发布清单

每篇文章/视频发布到各平台的状态与链接。**发布后把对应单元格替换成链接。**

图例:✅ 已发(点击链接) · 🟡 草稿/待发 · ⚪ 未发 · — 不适用

| 文章 | 公众号 | 视频号 | 抖音 | B站 | YouTube | X |
|---|---|---|---|---|---|---|
| [PPU DeepSeek-V4 参数寻优解读](content/2026-07-ppu-deepseek-v4-解读/) · 「测试报告解读」系列① | 🟡 草稿已推(中立·无外链·待手动发+加热) | 🟡 走查片 1:51 + 引流 28s 待发 | 🟡 待发 | ⚪ | — | — |
| [Higress 多集群场景化选型](content/2026-06-higress-multicluster-scenarios/) | 🟡 草稿(图文+贴图) | 🟡 待发 | 🟡 待发 | ⚪ | [✅ 正片](https://youtu.be/mCUZ8DK5s54) · [Short](https://youtu.be/HN8TaUKOZpg) | ⚪ |
| [Qwen3-32B 昇腾三引擎横评](content/2026-06-qwen3-32b-ascend-three-engine/) | ✅ 已发 | ✅ 已发 | ✅ 已发 | ⚪ | [✅ 公开](https://youtu.be/MWPS-YX8714) | ⚪ |
| [Higress prefix_cache 路由实测](content/2026-06-higress-prefix-cache-routing/) | ⚪ | ⚪ | ⚪ | ⚪ | [✅ 公开](https://youtu.be/x5ACtbvzI-c) | ⚪ |
| [Higress 双协议兼容实测](content/2026-05-higress-protocol-compat/) | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |

---

## 各篇产物速查

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
