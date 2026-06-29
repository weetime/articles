# articles

技术文章的内容生产流水线 + 产出归档:**报告 → 文章 → 动画视频 → 多平台发布**。

## 目录结构

```
articles/
├── docs/                      # 使用文档(从这里开始读)
│   └── 文章到视频到发布.md      # 全流程手册:环境、文章、视频、发布
├── skills/                    # Claude Code 技能(流水线的三个环节)
│   ├── report-to-wechat/      # ① 报告 → 公众号一图流文章(HTML 模板 + 配图)
│   ├── report-to-video/       # ② 文章 → 竖屏/横屏动画解说视频(Remotion + 配音 + BGM)
│   └── publish-video/         # ③ 视频 → YouTube / X 发布(API,凭证集中管理)
└── content/                   # 实际产出(每篇一个目录)
    └── 2026-06-higress-prefix-cache-routing/
        ├── article-hardcore.md     # 文章源文
        ├── publish_meta.json       # 发布元数据(标题/简介/标签/X 文案)
        ├── video-portrait.mp4      # 竖屏 9:16(视频号/抖音)
        └── video-landscape.mp4     # 横屏 16:9(YouTube 正片)
```

## 三个环节

| Skill | 输入 → 输出 | 关键点 |
|---|---|---|
| **report-to-wechat** | 压测/分析报告 → 一图流文章 | HTML 模板渲染配图,固定作者区块 |
| **report-to-video** | 文章 → MP4 | 代码驱动动画(非文生视频),默认竖屏无字幕,留视频号安全区 |
| **publish-video** | MP4 → 平台 | YouTube/X 官方 API;凭证集中在 `~/.config/video-publish/`,跨目录复用 |

## 快速上手

完整步骤见 **[docs/文章到视频到发布.md](docs/文章到视频到发布.md)**。一句话版:

```bash
# ② 文章 → 视频(在报告目录,已 cp skill scaffold + npm install)
python build_video.py .                 # → video-portrait.mp4(竖屏)
python build_video.py . --land          # 另出横屏

# ③ 发布(凭证一次性配好后)
PV=~/.claude/skills/publish-video/assets/scripts
python $PV/upload_youtube.py video-landscape.mp4 --privacy unlisted
python $PV/set_privacy.py <videoId> public
```

## 约定

- **凭证绝不进库**:YouTube/X/公众号密钥都从 `~/.config/video-publish/` 或环境变量读,仓库只有空模板(`x.env.example`)。
- **竖屏发视频号/抖音,横屏发 YouTube**,同内容不在 YouTube 双发。
- 视频号/抖音/公众号目前无放开的视频发布 API,手动上传。

## 已发布

| 内容 | 平台 | 链接 |
|---|---|---|
| Higress prefix_cache 路由实测 | YouTube | https://youtu.be/x5ACtbvzI-c |
