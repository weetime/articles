# Higress 缓存感知路由实测报告:vLLM 命中率 22%→65%、吞吐 +64%

> 不加卡、不换模型、不动引擎参数。把网关的负载均衡策略从默认轮询切到 Higress `ai-load-balancer` 的 `prefix_cache`,Qwen3-32B 四副本上,**前缀缓存命中率 22% → 65%、吞吐 +64%、TTFT P95 −40%**。
>
> 这篇是给工程师看的硬核版:讲清楚机制、贴原始数据、列出会踩的坑。结论性的彩图在上一篇,这里我们看证据。

---

## 问题:cache-blind 的负载均衡,在长前缀负载下是纯浪费

多副本部署 vLLM 时,大家都开了 **Automatic Prefix Caching(APC)**——同一段前缀第二次进来,直接复用已经算好的 KV,跳过 prefill。但 APC 是**单副本内**的能力:它只能命中**本 Pod**上算过的前缀。

问题出在网关。默认的 L7 负载均衡(轮询 / 随机 / 普通一致性哈希)是 **cache-blind** 的——它不知道哪个 Pod 缓存了哪段前缀。于是在「成千上万条请求共享同一段系统提示 / 文档前缀」的负载里,相同前缀被均匀打散到 4 个 Pod,**每个 Pod 都得把同一段前缀重新 prefill 一遍**。APC 开了,却几乎没机会命中。

要让 APC 真正生效,网关必须 **KV-aware**:把相同前缀的请求,稳定路由到那个已经算过它的 Pod。这就是这次要验证的东西。

![命中率 22%→65% · 吞吐 +64%](./final-1.png)

---

## 被测对象:Higress `ai-load-balancer` 插件

[Higress](https://github.com/alibaba/higress) 是基于 Envoy + Istio 的云原生 AI 网关。它的 **`ai-load-balancer`(中文「AI 负载均衡」)是一个可热插拔的 WASM 插件**,专门为推理流量做更聪明的后端选择。插件提供三种策略(`lb_policy`):

| `lb_policy` | 含义 | 依赖 |
|---|---|---|
| `global_least_request` | 全局最少请求数,跨网关副本统计在途请求 | Redis |
| **`prefix_cache`** | **前缀匹配:把相同前缀路由到曾服务它的 Pod** | **Redis** |
| `least_busy` | 拉取 vLLM 指标(队列 / KV 利用率 / LoRA)选最闲 Pod | vLLM metrics |

本次实验切换的就是这个插件(版本 **`ai-load-balancer` 1.0.0**)在某条推理路由上的开关。准确说,**ON / OFF 不是改策略,而是该路由 matchRule 上的 `configDisable`**:`false` = 启用 `prefix_cache`,`true` = 禁用。官方插件描述写得很直白——**插件被禁用时,负载均衡退化为服务自身的策略(轮询 / 本地最少请求 / 随机 / 一致性哈希)**。这正是我们的 OFF 基线。线上实测配置(脱敏):

```yaml
# WasmPlugin: ai-load-balancer-1.0.0 (ns: higress-system)
failStrategy: FAIL_OPEN               # Redis 挂了也不阻断流量
matchRules:
- config:
    lb_policy: prefix_cache           # ON;OFF = 同一 matchRule 置 configDisable: true
    lb_config:
      serviceFQDN: redis-master.dns   # 全局前缀树所在 Redis
      servicePort: 6379
      redisKeyTTL: 1800               # 前缀 key TTL(秒)
  configDisable: false                # ← 本次 ON 的那条 infer 路由
  ingress: [ai-route-infer-…-eb8df3a2d08f.internal]
```

> ⚠️ 别和 GIE/EPP 混为一谈。Higress 在 v2.2.0 还支持 Gateway API Inference Extension(InferencePool CRD + ext-proc 调 llm-d 风格的 EndPoint Picker),那是**另一条独立路径**。本实验走的是插件自带的 Redis 实现,不是 EPP。
>
> 另外注意 `failStrategy: FAIL_OPEN`:Redis 不可用时插件**放行而非阻断**,此时退化为服务自身 LB——好处是不影响可用性,代价是 Redis 抖动会悄悄吃掉命中率,生产要给 Redis 上监控。

---

## 机制:不是 hash 取模,是一棵 Redis 全局前缀树

`prefix_cache` 的核心是一棵**放在 Redis 里的全局前缀树**,所有网关副本共享:

1. **分块**:把 prompt 切成 block;
2. **逐块 SHA-1**:每个 block 取哈希;
3. **累积 XOR 生成 key 序列**:`sha1(b1)`、`sha1(b1)⊕sha1(b2)`、…—— 每个 key 代表「前 N 个 block 这段前缀」;
4. **最长前缀匹配**:拿这串 key 去 Redis 查,找到**最长的、且有 Pod 曾服务过**的前缀,把请求 **pin 到那个 Pod**,触发该 Pod 的 vLLM APC 命中;
5. **未命中则回退** `global_least_request`,并把这次的前缀→Pod 映射回写 Redis。

注意:它是**最长前缀匹配**,不是一致性哈希取模——这正是它能逐级复用前缀、而不是「整段相同才命中」的原因。

![Higress prefix_cache 路由机制](./hc-arch.png)

---

## 实验设计:一个变量,十次跑测

- **模型 / 硬件**:Qwen3-32B,4 × vLLM Pod,配置完全一致,均开 APC;
- **负载**:RAG/Agent 长上下文场景(系统内部代号 t6)—— 每条请求 **~3000 token 大上下文**(系统提示 + 检索文档)+ **短回答 ~64 token** + **并发 100** + **4 轮多轮对话**,粘性会话(sticky session)把大前缀钉在同一 Pod 上复用。这是典型的 **prefill-bound** 形态,贴近 RAG / 智能体 / 文档问答;
- **工具**:`aiperf`,场景 `lb-strategy`;
- **对照**:`prefix_cache` ON vs OFF,**各跑 5 次 × 每次 480 请求**(原始引擎数据 success 480 / error 0),取均值压抖动;
- 其余(请求长度、并发、模型版本、引擎参数)全程钉死。唯一变量就是 `lb_policy`。

---

## 原始数据:10 次跑测,每一次 ON 都甩开 OFF 2.5 倍以上

先看最关键的指标——前缀缓存命中率,逐次列出(不是只给均值):

![逐次命中率:OFF-1..5 vs ON-1..5](./rpt-fig1.png)

- **OFF**:20.4 / 23.1 / 22.2 / 22.4 / 20.6 %,均值 **22.0%**,方差极小;
- **ON**:58.7 / 66.5 / 67.4 / 66.7 / 67.5 %,均值 **65.4%**。

ON-1 略低(58.7%)是**冷启动**——前缀树还没建满。从第二次起稳定在 66–68%。十次跑测方差都很小,说明这不是某次走运,是**可复现**的。

再把粒度拉到「每个 Pod × 每次跑测」:

![逐 Pod × 逐次 命中率热力图](./rpt-fig3.png)

OFF 区(左)整片浅,4 个 Pod 都在 16–27% 之间徒劳重算;ON 区(右)整片深,4 个 Pod 全部均匀落在 58–70%。**没有一个 Pod 被冷落,也没有一个 Pod 被打爆**——这点很重要,下面专门验证。

再往下钻一层,看引擎上报的 **block 级 KV 缓存查询 / 命中数**(单条 run 实测):

![block 级 KV 缓存 QUERIES / HITS](./hc-kvcache.png)

OFF 下 4 个 Pod 合计约 **411 万次 block 查询、仅 91 万命中**;ON 下查询涨到 **497 万**(更长的前缀参与匹配),命中却跳到 **336 万 —— 命中数 ×3.7**。这才是「命中率 22%→65%」底下真正发生的事:每个 Pod 少做了几百万个 block 的重复 prefill。

顺带纠正报告里的一句话:它写「未测 TPOT」,但引擎其实上报了 **ITL(≈每 token 间隔)**——而且 ITL P95 从 **472.8ms 降到 296.5ms(−37%)**、Output TPS 从 **186 涨到 310(+67%)**。OFF 的 Pod 忙于重算 prefill、decode 被挤;ON 把算力释放出来,连解码都更快。**缓存命中省的不只是首 token,是整条链路。**

---

## 结果:四个指标同向改善,且不是靠制造热点

| 指标 | OFF 均值 | ON 均值 | 变化 |
|---|---|---|---|
| 前缀缓存命中率 | 22.0% | 65.4% | **▲ +197%** |
| 吞吐量 (req/s) | 2.88 | 4.73 | **▲ +64%** |
| TTFT P95 (s) | 20.0 | 11.9 | **▼ −40%** |
| E2E P95 (s) | 45.1 | 28.4 | **▼ −37%** |
| ITL P95 (ms) | 472.8 | 296.5 | **▼ −37%** |
| Output TPS (tok/s) | 186 | 310 | **▲ +67%** |

![OFF vs ON 四指标](./final-2.png)

因果链很干净:**命中率↑ → 省掉重复 prefill 的算力 → 吞吐↑ & 延迟↓**。没有 trade-off。

**关键反驳点:这是不是靠把请求挤到某个 Pod 换来的?** 不是。看每个 Pod 的流量份额:

![逐 Pod 流量:无热点](./final-4.png)

OFF / ON 下最大 Pod 份额都在 **27–29%**,开关前后几乎不变。命中率的提升**纯粹来自调度策略**,不是负载倾斜——否则就是用稳定性换数字,生产不敢用。

延迟分位数也全面下降,且 P50 降幅比 P95 还大(TTFT P50 −35% / E2E P50 −41%),说明是**普遍变快**,不是只优化了个别慢请求:

![TTFT / E2E 分位数](./final-6.png)

---

## 和 Higress 官方数据对比:方向一致,数值别照搬

Higress 官方博客做过 `prefix_cache` 的对照(不同模型 / 负载):TTFT 240ms→120ms(−50%)、命中率 40%+→80%+、吞吐 367→419 tok/s(+14%)、P99 35.3s→30.2s。

和我们的数差异不小(我们命中率基线更低、吞吐增益更大、而绝对延迟在**秒级**——长前缀 + 32B,prefill 本来就重,首 token 十几秒很正常)。原因是**模型、请求规模、前缀共享程度都不同**——我们这套 RAG/Agent 长上下文场景是「大前缀高度复用」的有利场景,所以命中率从更低的基线起跳、吞吐(prefill 密集)增益更明显。**两边方向完全一致,但数值不可直接对比**。结论:在你自己的负载上实测,别抄别人的百分比。

---

## 工程注意事项(会踩的坑)

- **只在共享前缀负载上赢**。短前缀 / 随机前缀场景,前缀树几乎没得复用,`prefix_cache` 不仅不涨,还要付 Redis 查询 + 回退的开销,可能轻微负优化。对号入座再开。
- **Redis 是必须的全局状态**。它是这套机制的单点与延迟来源,`redisKeyTTL` 要按前缀热度调:太短命中掉、太长占内存又可能指向已驱逐的 KV。
- **块粒度要对齐**。插件按 block 级 SHA-1 建树,若与 vLLM 的 KV block 粒度不匹配,命中率会被压低——我此前在 Mooncake 上就吃过「块级 vs 消息级 SHA-1 粒度不匹配」的亏,表现为命中率异常低。
- **持续高负载下计数可能退化**。社区有反馈(higress#3407)在缺少滑动窗口时,负载计数会逐渐退化为近似随机,需要配合 Pod 健康检查 / 窗口策略。
- **小规模结论**。本测只有 4 Pod;Pod 数变多后,前缀树的命中分布、Redis 压力都会变,需要重新压测。

---

## 怎么落地

1. 装 `ai-load-balancer` 插件,路由上配 `lb_policy: prefix_cache` + Redis;
2. 确认后端 vLLM 开了 APC;
3. 压测时**逐 Pod 看命中率是否均匀**(像前面那张逐 Pod 热力图)——均匀且整体抬高,才说明前缀真的被导向了对的 Pod,而不是制造了热点;
4. 混合负载(长前缀 + 随机)可考虑分级:共享前缀走 `prefix_cache`,其余回退 `global_least_request`(插件本身就是这么兜底的)。

---

**一句话**:`prefix_cache` 不是玄学调参,是把「网关该把请求发去哪个 Pod」这个决定,从 cache-blind 改成 KV-aware。在对的负载上,这几乎是一顿免费的午餐。

*数据由 ModelDoctor 实测产出 —— 面向私有化、多引擎推理的可观测与压测工具箱。*

![关注 vLLM 生产工程](./footer-card.png)
