# Buddy GIF 动效实现计划

## 步骤
- [x] 步骤1：bitmap-font.ts — 完整位图字体（ASCII + 18物种特殊字符）
- [x] 步骤2：gif-colors.ts — 5级稀有度配色方案
- [x] 步骤3：gif-engine.ts — 核心像素渲染引擎（drawChar/drawString/renderFrame）
- [x] 步骤4：gif-scenes.ts — 5个场景帧序列（idle/hatch/pet/feed/levelup）
- [x] 步骤5：集成到 index.ts — 注册 gif 相关命令到 buddy tool
- [x] 步骤6：测试 idle/pet/feed 三场景 — Leo 确认清晰度OK
- [ ] 步骤7：端到端测试 — 通过 /buddy 命令触发 GIF 生成+发送

## 状态：已集成，待端到端验证
