# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

### Netlify

- Token: nfp_gXZuCzBNqxGSNRVcWX2aZp91QUNFvZUg1354
- Account: Cubo (leoyeai)
- Dit.ai site: dit-ai-official (id: 989f9371-70a0-48d3-8e00-29d5de7fb86a)
- URL: https://dit-ai-official.netlify.app

### Twitter (X) Authentication
- auth_token (cookie): aafcff5c7252e3ba36ea6c4e3da68086d56b52d1
- ct0 (cookie): aa5e183b91e63095652387ca41c3603d81ecbacf8850addb39187e3648061eef01f3c1bbd014d747a757a344a4df83762c7e660c4b2e4c0e3245337c47a066caf6ec3e4121d81d2d4cd26e2331b73df2
- 用法：作为 Cookie header 传入 → `auth_token=<val>; ct0=<val>`，ct0 同时作为 `x-csrf-token` header

### GitHub Token
- Account: LeoYeAI (Leo Ye)
- Token: [REDACTED — 存储在 openclaw.json credentials 中]
- Updated: 2026-04-01

### MyClaw Blog API
- Endpoint: `https://myclaw.ai/api/blog/submit` (POST=create, PUT=update)
- Read: `https://myclaw.ai/api/blog/post?slug={slug}&locale={locale}`
- Categories: `https://myclaw.ai/api/blog/categories`
- API Key: `mck_blog_2f06eb0a9193c340366f4e3e01f8cf5150526713f31f61e1`
- Header: `X-API-Key: <key>`
- Content format: Markdown
- Scopes: posts:write, posts:publish, posts:delete, categories:write, categories:delete
- Default status: draft; set `"status": "published"` to publish immediately
- Categories: skills, guides, usecases, comparison, tutorials, news, updates
- API doc: saved at `pr/myclaw-blog-api.md`

### Email SMTP (leo@myclaw.ai)
- SMTP: smtp.gmail.com:587
- Login: leo@flot.ai (leo@myclaw.ai is Send-As alias)
- App Password: [REDACTED — 存储在 openclaw.json credentials 中]
- From header: `Leo Ye <leo@myclaw.ai>`
- Also available: leoye123@gmail.com (App Password: orlqftbsuiyfreoj)

---

Add whatever helps you do your job. This is your cheat sheet.
