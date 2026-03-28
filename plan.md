# 任务：openclaw-auto-dream v3.0

## 新增能力

### 1. 🔔 Dream Report 推送通知
- [ ] Dream cycle 完成后自动推送摘要到用户聊天频道
- [ ] 支持三种通知级别：silent（静默记录）、summary（简短摘要）、full（完整报告）
- [ ] 通知内容：健康分、新增/更新/归档数、关键变化、建议
- [ ] 在 dream-prompt.md 的 Post-flight 阶段加入推送逻辑

### 2. 🔄 跨实例记忆迁移
- [ ] 导出：将记忆系统打包为可移植的 JSON bundle（MEMORY.md + procedures + episodes + index）
- [ ] 导入：从 bundle 恢复记忆，自动合并/冲突检测
- [ ] 选择性迁移：可选择只迁移特定层（如只迁移 procedures）
- [ ] 创建 references/migration-cross-instance.md

### 3. 📊 记忆健康仪表板
- [ ] 生成单文件 HTML 仪表板，展示记忆健康状态
- [ ] 可视化：健康分趋势图、记忆层分布饼图、重要度热力图、遗忘曲线图
- [ ] 数据源：index.json + dream-log.md 历史
- [ ] 一键生成，可在浏览器打开
- [ ] 创建 references/dashboard-template.html

### 4. 🧠 智能记忆检索增强（新增）
- [ ] Dream cycle 中为 index.json 生成语义标签和搜索关键词
- [ ] 支持 memory_search 的语义增强：dream cycle 中发现的关联可加速后续检索
- [ ] 在 dream report 中增加 "记忆可达性" 指标

### 5. 🎯 Dream Insight（新增）
- [ ] Dream cycle 结束时，基于全局记忆生成 1-3 条 "洞察"
- [ ] 发现用户可能没意识到的关联（如：A项目的策略和B项目的教训有相似模式）
- [ ] 在推送通知中展示

## 文件修改计划
- [ ] SKILL.md — 更新为 v3.0，加入新能力描述
- [ ] references/dream-prompt.md — 加入推送通知 + 洞察生成
- [ ] references/scoring.md — 加入可达性指标
- [ ] references/memory-template.md — 更新 index.json schema（加 tags 增强）
- [ ] references/migration-cross-instance.md — 新建，跨实例迁移协议
- [ ] references/dashboard-template.html — 新建，仪表板模板
- [ ] README.md + 多语言 README — 更新 GitHub
- [ ] ClawHub publish v3.0.0
- [ ] GitHub push

## 状态：进行中
