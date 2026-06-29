---
name: report-to-video
description: Use when turning a ModelDoctor report (or an existing 一图流 article) into a narrated, animated explainer video for 视频号/抖音. Builds code-driven motion-graphics scenes with Remotion (ModelDoctor brand, light/dark themes), adds Chinese AI voiceover (edge-tts), burned subtitles, royalty-free synthesized BGM, and ffmpeg-assembles a 竖屏 9:16 (1080×1920) cut by default — 横屏 16:9 only when the user explicitly asks. Triggers on "把报告/文章做成视频", "讲解视频", "动画视频", 配音/字幕/BGM for a report, or a /reports/<id> URL plus 视频.
---

# ModelDoctor 报告 → 动画解说视频

Turn one report into a fluid, code-driven explainer video. Like [report-to-wechat](../report-to-wechat/SKILL.md), this is a **playbook + design system + worked example**, not a rigid renderer. Each report tells a different story: re-author the scenes, keep the visual language + pipeline constant.

**Why code, not 文生视频**: data-type content needs exact numbers and exact causal motion. Text-to-video (Sora/可灵) garbles numbers and invents mechanics — never use it here. The AI's value is writing deterministic Remotion code; the render engine makes the pixels.

## Pipeline (3 stages)

1. **Scenes** — Remotion (React) components, one per beat of the story → render each to MP4.
2. **Narration** — edge-tts (`zh-CN-YunyangNeural`) per scene. Burned captions are **off by default** (`--subs` to opt in): the infographic already carries every key label on-screen, and platform UI clips bottom captions across devices.
3. **Assemble** — ffmpeg xfade-concat + synthesized BGM (sidechain-ducked under voice) → **portrait only** (`--land` to also build landscape).

## Setup (once per report)

Copy the worked example into a per-report folder (same folder as the 一图流 article is fine):
```bash
DIR=modeldoctor/.experiments/wechat-reports/<reportId>
mkdir -p $DIR/anim && cp -r ~/.claude/skills/report-to-video/assets/remotion/* $DIR/anim/
cp ~/.claude/skills/report-to-video/assets/scripts/*.py $DIR/
cd $DIR/anim && npm install     # pulls Remotion + bundled Chromium (~2 min)
```
Needs `ffmpeg` + `edge-tts` (`pip install edge-tts`) + `numpy`/`scipy` on PATH (conda base works).

## Authoring scenes (`anim/src/`)

- `theme.ts` — brand tokens, **light + dark palettes**; flip `MODE` (`'light'|'dark'`) to switch the whole video. Dark = 极客 default for hardcore reports.
- `Bg.tsx` — shared brand background (gradient + grid). Every scene wraps in `<Bg>`.
- One component per scene. **Make each orientation-aware**: read `useVideoConfig()`, branch `const land = width > height`. Portrait stacks vertically; landscape is two-column / wider. Register both sizes in `Root.tsx` (id `Foo` @1080×1920 + `FooL` @1920×1080) — portrait is the deliverable; landscape only when asked.
- **Portrait 视频号/抖音 safe zone**: 视频号/抖音 overlay their own chrome on a full-bleed 1080×1920 — status bar + 关注/朋友/推荐 tabs cover the top ~200px, and the account row + action buttons + progress cover the bottom ~450px. So in the portrait branch keep content inside `y ∈ [~220, ~1410]`: top padding ~210–220px, bottom reserve ~500–510px. Lift absolute bottom elements (meters, brand footers) up accordingly. Landscape keeps its normal modest padding.
- Worked example = 7 scenes (prefix-cache routing study): `Hero` (大数字 22→65 + 箭头) · `Topology` (请求流过网关→Pod,OFF 打散→ON 命中,KaTeX-free) · `PrefixTree` (分块→SHA-1→累积XOR→最长匹配点亮) · `RunData` (10 跑测柱) · `BarRace` (四指标计数+柱) · `NoHotspot` (逐 Pod) · `Outro` (一句话 + QR). Reuse the patterns (count-ups via `interpolate`, entrances via `spring`, deterministic dot flow via `random(seed)` — never `Math.random`).
- Each Composition `durationInFrames` should ≈ its narration length × 30 + tail, so no long freeze.

Verify cheaply with stills before full renders:
```bash
cd $DIR/anim && npx remotion still src/index.ts <Comp> out/chk.png --frame=<n>
```
Read the PNG, fix layout, repeat. Then render all (portrait; add the `${c}L` line only when landscape is requested):
```bash
for c in Hero Topology PrefixTree RunData BarRace NoHotspot Outro; do
  lc=$(echo $c|tr A-Z a-z)
  npx remotion render src/index.ts $c  out/$lc.mp4
  # landscape (only if user asked): npx remotion render src/index.ts ${c}L out/${lc}_l.mp4
done
```

## Narration, BGM, assembly

- Edit `SHOTS` in `build_video.py`: `(scene_name, 中文口播)` in story order. **TTS-adapt the text** — spell numbers as 中文 (`百分之二十二`), letters spaced (`K V`, `SHA 1`, `P 九五`); the script's `display()` maps them back to `22%`/`KV`/`P95` for the on-screen caption.
- `python make_bgm.py $DIR` → `bgm.wav` (92-BPM tech-keynote groove; generated = **zero copyright risk**, safe for 视频号). Tweak BPM/进行 inside if needed.
- `python build_video.py $DIR` → `video-portrait.mp4` (TTS → per-scene clip → xfade concat → BGM mix). Default = portrait, no captions. Add `--subs` to burn captions, `--land` to also build `video-landscape.mp4`.

## Gotchas

- **Portrait is the only default deliverable.** Never auto-build landscape — wait for an explicit 横版/横屏 request (memory `feedback_video_landscape_optin`).
- **Captions default off** for these infographic videos — the on-screen text carries it, and 视频号/抖音 bottom UI clips burned captions on many phones. Only `--subs` on request, and then keep MarginV ~430 (portrait) so they sit above the platform chrome.
- **视频号/抖音 safe zone** — see authoring note above; full-bleed content gets its title eaten by the tab bar and its bottom eaten by the action column.
- **ASS `Format:` line must include `Name`** (only matters with `--subs`) or libass shifts a leading comma into every caption; author `.ass` with explicit `PlayResX/Y` (build script does this) — libass otherwise uses a ~288px ref space.
- Keep the **Outro QR frame white** (`#fff`) even in dark theme, or it won't scan.
- 公众号 has no native video API; deliver the MP4 files and let the user upload (视频号/抖音). See memory `project_wechat_publish_flow`.
