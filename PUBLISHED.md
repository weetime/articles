# 发布清单

每篇文章/视频发布到各平台的状态与链接。**发布后把对应单元格替换成链接。**

图例:✅ 已发(点击链接) · 🟡 草稿/待发 · ⚪ 未发 · — 不适用

| 文章 | 公众号 | 视频号 | 抖音 | B站 | YouTube | X |
|---|---|---|---|---|---|---|
| [Qwen3-32B 昇腾三引擎横评](content/2026-06-qwen3-32b-ascend-three-engine/) | ✅ 已发 | ✅ 已发 | ✅ 已发 | ⚪ | [✅ 公开](https://youtu.be/MWPS-YX8714) | ⚪ |
| [Higress prefix_cache 路由实测](content/2026-06-higress-prefix-cache-routing/) | ⚪ | ⚪ | ⚪ | ⚪ | [✅ 公开](https://youtu.be/x5ACtbvzI-c) | ⚪ |
| [Higress 双协议兼容实测](content/2026-05-higress-protocol-compat/) | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |

---

## 各篇产物速查

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
