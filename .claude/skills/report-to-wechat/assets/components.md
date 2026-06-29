# Copy-paste 组件块(配合 style.css)

每张图都是一个 `.poster`。基本骨架:

```html
<!doctype html><html lang="zh"><head><meta charset="utf-8"><link rel="stylesheet" href="style.css">
<style>/* 本图特有样式 */</style></head><body>
<div class="poster">
  <div class="eyebrow"><span class="dot"></span>分类 · 副标<span class="tag">右上角标签</span></div>
  <h2 class="sec">主标题 <span class="hi">高亮词</span></h2>
  <div class="sec-sub">一句话副标题说明。</div>
  <!-- 内容区 -->
  <div class="footer"><span class="brand"><span class="md">ModelDoctor</span> · 模块名</span>
    <span class="right">右下角注脚</span></div>
</div>
</body></html>
```

## 核心数字卡(4 联)
```html
<div class="metrics">
  <div class="mcard"><div class="glow" style="background:var(--green)"></div>
    <div class="lab">指标名</div><div class="big up">+197%</div>
    <div class="flow"><span class="o">22.0%</span> → <span class="n">65.4%</span></div></div>
  <!-- 重复 4 个;.big.up 绿色升、.big.down 青色降 -->
</div>
```

## OFF vs ON 对比柱
```html
<div class="mblock"><div class="head"><span class="name">指标</span><span class="unit">越高越好</span>
    <span class="delta good">▲ +64%</span></div>
  <div class="bar"><span class="tag">OFF</span><div class="track"><div class="fill off" style="width:58%">2.88</div></div></div>
  <div class="bar"><span class="tag">ON</span><div class="track"><div class="fill on" style="width:95%">4.73</div></div></div></div>
```
- `width:` 按该指标内的相对大小手算(同组共用一个 max 做基准)。
- `.delta.good`=绿(越高越好)、`.delta.cool`=青(越低越好,如延迟)。
- `.fill.on` 紫 / `.fill.on.g` 绿 / `.fill.on.c` 青。

## 配置 chips
```html
<div class="chips">
  <div class="chip"><span class="ico">🧩</span>场景 <b>长前缀 t6</b></div>
  <div class="chip"><span class="ico">🖥️</span><b>4 Pods</b> · Qwen3-32B</div>
</div>
```

## 对照组 VS 块
```html
<div class="vs">
  <div class="vsbox off"><div class="lab">对照组 · OFF</div><div class="x">说明</div></div>
  <div class="vsmid">VS</div>
  <div class="vsbox on"><div class="lab">实验组 · ON</div><div class="x">说明</div></div>
</div>
```

## 因果链(机制图底部)
```html
<div class="chain">
  <div class="ci">命中率 ↑</div><span class="arr">→</span>
  <div class="ci">prefill 计算 ↓</div><span class="arr">→</span>
  <div class="ci hl2">延迟 ↓</div><span class="arr">&</span>
  <div class="ci hl">吞吐 ↑</div>
</div>
```

## 结论高亮条 / 双结论卡
```html
<div class="note">一句话强结论,<b>关键词</b>用品牌色。</div>

<div class="callout">
  <div class="co a"><div class="t">✓ 论点一</div><div class="d">证据。</div></div>
  <div class="co b"><div class="t">✓ 论点二</div><div class="d">证据。</div></div>
</div>
```

可用类:`.note`(紫)、`.ctrl`(青)、`.co.a`(绿)、`.co.b`(紫)。
