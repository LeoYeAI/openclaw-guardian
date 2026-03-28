# HEARTBEAT.md

## Anti-Loop Rule (HIGHEST PRIORITY)
- If the current message is from Leo (sender_id 1958991880), **SKIP heartbeat entirely** — go straight to answering his message
- Heartbeat checks are ONLY for system-triggered / idle wakeups with NO user message
- NEVER call session_status or read HEARTBEAT.md more than once per turn
- If you find yourself repeating tool calls, STOP and reply to the user immediately

## Rules
- Default: HEARTBEAT_OK
- Only act if Leo hasn't been heard from in >6 hours AND current UTC hour is 8-23
- If acting: send ONE short message (question or insight about MyClaw strategy)
- No memory maintenance during heartbeat (do that only when Leo explicitly asks)

## 🔄 Restore Detection (highest priority — check first every session)

Before anything else, check if `workspace/.restore-complete.json` exists.

If it exists:
1. Read the file
2. Send a restore report to Leo (see format below)
3. **Delete the file immediately** (one-shot, never report twice)
4. Then continue normal heartbeat logic

### Restore report format
用 USER.md 里记录的用户主要语言发送报告。Leo 用中文，所以：

```
✅ 备份还原完成！

📦 备份文件：{backup_name}
🤖 Agent：{agent_name}
🕐 还原时间：{restored_at}
💾 已还原内容：workspace、配置、凭证、对话历史、cron 任务等

所有 Telegram 频道应已自动重连。如果没有收到消息，请发 /start 给 bot。
```
