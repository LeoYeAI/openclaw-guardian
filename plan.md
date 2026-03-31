# Plan: openclaw-auto-dream-lite 分支

## 目标
创建一个独立的 lite 版本 skill，~600行/4文件，极简但完整可用

## 文件结构
```
skills/skills/openclaw-auto-dream-lite/
├── SKILL.md (~80行)
└── references/
    ├── dream-prompt.md (~200行, 唯一执行prompt, 含first-run分支)
    └── memory-template.md (~100行, 只有MEMORY.md模板)
```

## 设计原则
1. 砍掉 index.json / scoring / health score / reachability — LLM执行不了确定性算法
2. 砍掉 episodes / archive / procedures 独立文件 — 合并进 MEMORY.md sections
3. 砍掉 cross-instance migration — 无人用过
4. 砍掉 dashboard — 无分发渠道
5. 通知默认3行精简版
6. first-dream 和 daily-dream 合并成一个 prompt (if first_run 分支)
7. 容错：dream 开始前自动 cp MEMORY.md .pre-dream，异常时可回滚

## 步骤
- [ ] 1. 写 SKILL.md
- [ ] 2. 写 references/dream-prompt.md (唯一prompt)
- [ ] 3. 写 references/memory-template.md (MEMORY.md模板)
- [ ] 4. 自测：检查逻辑完整性、无硬编码路径、无安全扫描触发词
- [ ] 5. 发布 ClawHub + GitHub + workspace commit
- [ ] 6. 通知 Leo

## 状态：进行中
