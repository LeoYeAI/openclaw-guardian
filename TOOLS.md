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

- Token: nfp_ttrx1YpskTsypXvB5SVNdxac3MWnzQGS6b22
- Account: Cubo (leoyeai)
- Dit.ai site: dit-ai-official (id: 989f9371-70a0-48d3-8e00-29d5de7fb86a)
- URL: https://dit-ai-official.netlify.app

### Twitter (X) Authentication
- auth_token (cookie): aafcff5c7252e3ba36ea6c4e3da68086d56b52d1
- ct0 (cookie): aa5e183b91e63095652387ca41c3603d81ecbacf8850addb39187e3648061eef01f3c1bbd014d747a757a344a4df83762c7e660c4b2e4c0e3245337c47a066caf6ec3e4121d81d2d4cd26e2331b73df2
- 用法：作为 Cookie header 传入 → `auth_token=<val>; ct0=<val>`，ct0 同时作为 `x-csrf-token` header

---

Add whatever helps you do your job. This is your cheat sheet.
