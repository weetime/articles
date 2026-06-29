---
name: publish-video
description: Use when publishing/distributing an already-rendered video (e.g. the MP4 from report-to-video) to YouTube or X (Twitter) via their APIs. Credentials live in one fixed home dir (~/.config/video-publish) so they persist across report folders — no re-setup when the working directory changes. Triggers on "发到 YouTube / X", "上传视频到油管/推特", "把视频发布上去", change a video's privacy (公开/unlisted), or delete an uploaded video.
---

# 视频发布(YouTube / X)

把做好的视频(横屏给 YouTube 正片、竖屏给视频号/抖音)用官方 API 发出去。**凭证集中存放**,换报告目录不丢。

## 关键设计:凭证集中
所有密钥/token 放在 **`~/.config/video-publish/`**(可用 `VIDEO_PUBLISH_HOME` 覆盖),不放报告目录、不进 git:
```
~/.config/video-publish/
  client_secret.json          # GCP「桌面应用」OAuth 客户端(YouTube,一次性下载)
  token_youtube.json          # 上传权限 token(脚本自动生成/刷新)
  token_youtube_manage.json   # 管理权限 token(改公开范围/删除用)
  x.env                       # X 四个密钥(KEY=VALUE 每行一个)
```
脚本(`assets/scripts/`)默认从这里读,所以任何工作目录下都能直接跑。

## 一次性配置
- **YouTube**:console.cloud.google.com 建项目 → 启用 *YouTube Data API v3* → 凭据建 *OAuth 客户端 ID(桌面应用)* → 下载 JSON 改名 `client_secret.json` 放上面目录;OAuth 同意屏幕把自己的频道账号加成测试用户。
- **X**:developer.x.com 建 App,*User authentication* 设 **Read and Write**,改权限后**重新生成** Access Token,把四个密钥写进 `~/.config/video-publish/x.env`(见 `assets/x.env.example`)。⚠️ 免费层大概率不含视频上传,报 403 就得升 Basic($200/月)。

## 每条视频:写 publish_meta.json(放在视频同目录)
```json
{
  "youtube_title": "标题(横屏正片别带 #Shorts)",
  "youtube_desc": "简介…多行 OK",
  "youtube_tags": ["vLLM", "Higress", "..."],
  "x_text": "X 文案,≤280 字符更稳"
}
```
脚本默认读它;也可用 `--title / --desc-file / --tags / --text` 临时覆盖。

## 发布流程
```bash
cd <视频所在目录>   # 含 publish_meta.json

# 1) YouTube:先传 unlisted 自己看(首次弹浏览器授权一次)
python ~/.claude/skills/publish-video/assets/scripts/upload_youtube.py video-landscape.mp4 --privacy unlisted
#   确认无误 → 改公开(首次需再授权一次「管理」权限)
python ~/.claude/skills/publish-video/assets/scripts/set_privacy.py <videoId> public

# 2) X(配好 x.env 后)
python ~/.claude/skills/publish-video/assets/scripts/upload_x.py video-portrait.mp4
```

## 约定
- **YouTube 发横屏正片**;竖屏 9:16 是视频号/抖音的料,别在 YouTube 双发(同内容重复)。见 memory `feedback_video_landscape_optin`。
- 默认 `--privacy private`,公开是显式动作(不可逆性高,先 unlisted 验收再 public)。
- `set_privacy.py <id> delete` 删视频;`unlisted`/`private` 改回。
- 公众号无视频 API;视频号/抖音目前手动上传(没有放开的发布 API)。

## Gotchas
- 改公开范围/删除报 **403 insufficient scopes** = 当前 token 只有 upload 权限;`set_privacy.py` 用的是更高的 `force-ssl` 权限、单独的 token,首次会再授权一次。
- 测试态 OAuth app 的 refresh token 约 7 天过期;过期后脚本会自动重新弹授权。
- 浏览器授权页提示「Google 未验证此应用」属正常(自己的测试 app),点 Continue。
