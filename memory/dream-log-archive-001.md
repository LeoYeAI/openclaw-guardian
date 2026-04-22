# Dream Log

_Auto-Dream 记忆整理日志_

---

## 🌙 记忆整理 — 2026-03-29（首次手动执行）

**扫描**: 16 个文件（2/12-3/23）| **新增**: 12 条 | **更新**: 8 条

### 本次整合的内容

**💡 新增到 MEMORY.md：**
- 增长渠道拆分：SEM 60-70% + 直接访问 30-40%（来源 2/18 log）
- 分水岭行为分析框架（类 Facebook "7 friends in 10 days"，来源 2/14 log）
- Product-Led Growth 策略确立决策（来源 2/21 log）
- Claude Code 配置 + MyClaw API 路由降级问题（来源 2/27 log）
- Dit.ai PRD + Guardian 部署决策（来源 3/1 log）
- 三项目同日发布决策（guardian/master-skills/backup，来源 3/2 log）
- myclaw-backup 完整迭代记录（v1.1-v1.7，来源 3/2-3/4 log）
- openclaw-auto-dream 发布决策（来源 3/28 对话）
- 📦 已发布开源项目汇总表（新建章节）
- 🔧 Claude Code 配置章节（新建）

**🔄 更新：**
- Historical 增长数据：补充渠道拆分
- Key Decisions：从 9 条扩充到 18 条（补全 2/14-3/28 所有重要决策）
- Lessons Learned：从 5 条扩充到 10 条
- Open Threads：标记 4 项已完成，新增 3 项待办
- Environment：更新模型为 opus-4.6，补充 LCM 和 Auto-Dream 信息
- Guardian 章节：补充 GitHub repo 链接

**📝 新增到 procedures.md：**
- 初始化沟通偏好、工具流程、格式偏好、快捷模式

### 洞察
- **被中断的对话是最大的知识流失风险**：3/23 生态策略落地节奏讨论被中断，3个月来从未继续。这类"半成品决策"散落在 Open Threads 里容易被遗忘，建议主动跟进
- **开源项目矩阵已成规模但缺乏协同**：6 个项目各自独立，没有统一的安装引导或互相推荐。动作2"开源工具矩阵"的概念已在策略文档里，但自己的项目还没做到

### 建议
- 优先跟进 3/23 被中断的落地节奏讨论（Leo 已发截图要求重写）
- 修复 openclaw-master-skills cron 报错（连续 3 次失败）
- Claude Code API 路由问题已搁置一个月，确认是否还需要解决

## 🌙 Dream #2 — 2026-03-30

**Scanned**: 1 file | **New**: 2 | **Updated**: 1 | **Total**: 187 entries

### Changes
- [New] Key Decisions: openclaw-auto-dream v3.5.0（全英文化）+ v3.6.0（First Dream即时首扫功能）
- [New] Lessons: Skill prompt 用英文写、输出按 USER.md 语言的分离设计是正确的
- [Updated] 已发布项目表: openclaw-auto-dream 版本 3.3.0 → 3.6.0
- [Fixed] Key Decisions 中 3/23 生态增长策略条目重复已删除

### Insights
- Auto-Dream 自身正在经历快速迭代（3天内 v3.0→v3.6.0，3个版本），说明这个工具触发了 Leo 的兴趣和参与感——"dogfooding 驱动的产品打磨"循环已启动
- First Dream 功能的核心洞察（安装后空窗期致命）是一个通用的 SaaS 教训，应该反哺 MyClaw 本体的 onboarding 策略

### Stale Threads
- Credits消费集中度（top 10%用户贡献多少） — 搁置约46天
- Non-tech用户激活方案的落地细节 — 搁置约45天
- MyClaw 分水岭行为分析（类 Facebook "7 friends in 10 days"） — 搁置约44天

### Suggestions
- 以上3个搁置线程有内在关联：了解消费集中度 → 识别分水岭行为 → 设计非技术用户激活方案。建议下次跟 Leo 聊时串联推进
- First Dream 的"安装后立即交付价值"思路，可以提炼成 MyClaw 主产品 onboarding 的改进方向

## 🌙 Dream #3 — 2026-04-02

**Scanned**: 1 file | **New**: 14 | **Updated**: 0 | **Total**: 210 entries

### Changes
- [New] 竞争格局 & 行业动态章节（全新）：Claude Code 三重危机、OpenClaw 生态热度、MCP 安全漏洞、竞品动态表（IronCurtain/Hermes Agent/Kilo Code/Manus AI）
- [New] MyClaw 机会窗口分析：3条战略机会（透明开源叙事、安全营销占位、普惠角度）
- [New] Key Decision: 竞争情报日报系统启动（4/1）
- [New] Open Threads +3：借 Claude Code 事件发推、评估 Hermes Agent、安全营销强化

### Insights
- **安全叙事正在被抢跑**：IronCurtain 用"Security-first"定位入场，而 MyClaw 明明有 Guardian + 完整服务器隔离 + 开源透明度三重安全优势，却从未在营销中突出。这是一个"有产品无叙事"的典型案例——窗口不等人
- **竞争情报→行动的闭环缺失**：4/1 日报提出3条行动建议（发推/KOL合作/评估威胁），但标注"待Leo决策"。过去类似的行动建议（如2/22 PLG落地、3/23落地节奏）也是提出后搁置。需要建立"情报→48小时内行动"的机制

### Stale Threads
- Non-tech用户激活方案的落地细节 — 搁置约48天（自2/13）
- MyClaw 分水岭行为分析 — 搁置约47天（自2/14）
- Credits消费集中度（top 10%用户） — 搁置约43天（自2/18）

### Suggestions
- 安全叙事是当前最紧迫的窗口：Claude Code 信任危机 + MCP 安全漏洞 + IronCurtain 入场，三件事同时发生。建议 Leo 48小时内至少发一条 X 推文占位
- 3个最老的搁置线程（Non-tech激活/分水岭行为/消费集中度）内在关联且与留存直接相关——收入结构66%依赖新用户（3/30数据），说明留存侧确实是短板，这些搁置线程恰好都指向留存改善

## 🌙 Dream #5 — 2026-04-07

**Scanned**: 1 file | **New**: 8 | **Updated**: 4 | **Total**: 245 entries

### Changes
- [New] Anthropic 透明度危机章节（删除MagicDocs功能，changelog不提）
- [New] MyClaw 品牌曝光章节（"Stop Installing OpenClaw"视频直接提及MyClaw）
- [New] 竞品表新增2条：Modo（开源IDE替代，低威胁）、silos/cheapestinference（OpenClaw Web UI替代，中低威胁）
- [New] 机会窗口#5："Stop Installing OpenClaw"视频=天然KOL合作机会
- [New] Key Decision: 竞争情报日报#4（4/6）
- [New] Open Thread: 联系"Stop Installing OpenClaw"视频作者做KOL合作
- [Updated] Anthropic封杀章节：升级至CLI层面屏蔽"OpenClaw"关键词 + Steinberger加入OpenAI + TechCrunch同时报道
- [Updated] OpenClaw安全叙事：新增CVE-2026-33579评分9.8、累计238个CVE量化数据
- [Updated] 竞争格局章节日期标记 4/01→4/06
- [Updated] 写安全对比推文串线程：标记第四次建议🚨🚨
- [Dedup] 清理3条重复的"Stop Installing OpenClaw"KOL合作Open Thread

### Insights
- **Anthropic的行为模式正在从"商业竞争"升级为"系统性敌对"**：封杀订阅→CLI关键词屏蔽→删除被曝光功能不写changelog。这不是正常的竞争行为，而是恐慌驱动的连锁反应。对MyClaw来说，Anthropic每多做一步敌对行为，"多模型路由=不被卡脖子"的叙事就多一分说服力——敌人在帮你写营销文案
- **"行动建议衰减"问题已从模式变成危机**：安全对比推文从4/1建议到4/6已经第四次，6天零执行。同期Anthropic的敌对行为却在加速升级。窗口期不等人——每多拖一天，竞品（IronCurtain等）就多一天抢占叙事的时间

### Stale Threads
- Non-tech用户激活方案 — 搁置53天（自2/13），与59%月流失率直接相关
- MyClaw 分水岭行为分析 — 搁置52天（自2/14），是留存优化的前提
- Credits消费集中度 — 搁置48天（自2/18），关系收入集中度风险

### Suggestions
- 安全对比推文已建议4次未执行，建议降低执行门槛：不需要完美长文，先发一条简短推文"238 CVEs in 130 days. That's why MyClaw runs your Agent in an isolated server."占位即可
- "Stop Installing OpenClaw"视频作者是目前最高优先级KOL联系对象——已经在替MyClaw说话，只需要正式建立关系

---

## 🌙 Dream #4 — 2026-04-05

**Scanned**: 1 file | **New**: 14 | **Updated**: 2 | **Total**: 233 entries

### Changes
- [New] Anthropic 封杀第三方 harness 章节（2026-04-04重大事件）
- [New] OpenClaw 安全叙事升级章节（Ars Technica 质疑）
- [New] 竞品生态工具涌现章节（AgentShift/ZooClaw/GitClaw/Loki Agent）
- [New] 竞品动态表新增5条（AgentShift/ZooClaw/GitClaw/Loki Agent + Manus更新）
- [New] 机会窗口#4：Anthropic封杀→多模型路由叙事
- [New] Key Decisions +2（Anthropic封杀事件、竞争情报日报#2）
- [New] Open Threads +3（Anthropic应对策略、联系KOL、写安全对比）
- [Updated] Fireship视频播放量 192万→194万
- [Updated] 安全营销强化线程：增加4/4 Ars Technica紧迫性

### Insights
- **行动建议"半衰期"问题暴露**：安全对比文章在4/1首次建议、4/4再次建议，两次都标"不能再拖"却仍未执行。类似的还有"借Claude Code事件发推"。情报系统已经建立，但"情报→行动"的最后一公里一直断裂——日报提建议容易，执行难。核心瓶颈可能不是信息不足，而是Leo团队的执行带宽/优先级管理
- **生态分裂信号首次出现**：AgentShift（一键迁移到NemoClaw）是质变信号——从"新竞品出现"升级到"有人做工具帮用户离开"。这通常出现在平台增长后期，但MyClaw才上线不到2个月就出现，说明竞争烈度远超正常SaaS节奏

### Stale Threads
- Non-tech用户激活方案 — 搁置51天（自2/13），与留存率直接相关
- MyClaw 分水岭行为分析 — 搁置50天（自2/14），是留存优化的前提
- Credits消费集中度 — 搁置46天（自2/18），关系收入集中度风险

### Suggestions
- 建立"48小时行动检查"机制：每份竞争情报日报的行动建议，48小时后自动检查是否执行。未执行的标记升级或关闭
- AgentShift 迁移工具值得深入评估：它迁移什么？迁移后体验如何？NemoClaw 的差异化是什么？这些信息决定是否需要建立"防守迁移"策略

## 🌙 Dream #5 — 2026-04-07

**Scanned**: 1 file (4/6) | **New**: 8 | **Updated**: 4 | **Total**: 233 → 245 entries

### Changes
- [New] Anthropic 透明度危机章节（删除MagicDocs功能、changelog不提）
- [New] MyClaw 品牌曝光章节（"Stop Installing OpenClaw"视频直接提及MyClaw）
- [New] 竞品表新增2条：Modo（开源IDE替代,低威胁）、silos/cheapestinference（OpenClaw Web UI替代,中低威胁）
- [New] 机会窗口#5："Stop Installing OpenClaw"视频=天然KOL合作机会
- [New] Key Decision: 竞争情报日报#4（4/6）
- [New] Open Thread: 联系"Stop Installing OpenClaw"视频作者做KOL合作
- [Updated] Anthropic封杀章节升级：CLI层面屏蔽"OpenClaw"关键词 + Steinberger加入OpenAI + TechCrunch同时报道
- [Updated] OpenClaw安全叙事：新增CVE-2026-33579评分9.8、累计238个CVE量化数据
- [Updated] 竞争格局时间戳 4/1→4/6
- [Updated] 写安全对比推文串线程：标注第四次建议 🚨🚨
- [Dedup] 清理3条重复的"Stop Installing OpenClaw"KOL合作Open Thread

### Insights
- **Anthropic从"封杀"升级到"敌对"是质变信号**：封杀订阅额度→CLI屏蔽关键词→创始人加入OpenAI公开抨击开源。这不是商业竞争,是意识形态战争。MyClaw的"多模型路由+不锁定供应商"叙事从"差异化"升级为"生存必需品"——用户现在有切身痛感,不再是假设性风险
- **行动建议已连续4次被忽略（4/1→4/4→4/5→4/6）**：安全对比推文/文章是所有日报中出现频率最高的建议,但6天过去仍未执行。这已经不是"窗口期"问题,而是执行系统问题。建议：与其继续建议Leo发推,不如直接起草3条推文供Leo一键发布,把"决策成本"降到最低

### Stale Threads
- Non-tech用户激活方案 — 搁置53天（自2/13），留存率核心瓶颈
- MyClaw 分水岭行为分析 — 搁置52天（自2/14），留存优化前提
- Credits消费集中度 — 搁置48天（自2/18），收入集中度风险

### Suggestions
- 直接起草3条推文（安全对比/Anthropic封杀回应/多模型路由优势），降低Leo的执行门槛——6天4次建议未执行,瓶颈是决策成本不是信息不足
- "Stop Installing OpenClaw"视频作者是最高优先级KOL联系对象——已经在主动推荐MyClaw,合作转化率远高于冷outreach

## 🌙 Dream #7 — 2026-04-08

**Scanned**: 1 file | **New**: 4 | **Updated**: 3 | **Total**: 245 → 252 entries

### Changes
- [New] Key Decision: 竞争情报日报#5（4/7）——Anthropic封杀持续发酵、Manus威胁升级、取消订阅视频进入预警
- [New] 竞品表新增2条：OpenCow（354⭐）、Frona（新进入监控）
- [New] Open Threads +2：联系 Hoz 做 KOL 合作；取消订阅视频应对
- [Updated] Manus AI 威胁等级 🟠中高 → 🔴高，官方视频播放量 255万 → 277万
- [Updated] 取消订阅视频风险描述：从“出现”升级为“算法会推给所有搜 MyClaw 的人”
- [Updated] 安全对比文章/推文串线程：从连续4天未执行升级到连续5天未执行

### Insights
- **风险正在从“外部竞争”转向“品牌搜索结果战”**：如果用户搜索 MyClaw 时同时看到第三方推荐视频和取消订阅视频，决策权会被 YouTube 推荐算法部分接管。KOL 合作和负面内容对冲，不再只是增长动作，也是品牌防御动作
- **执行瓶颈进一步坐实**：同一批建议已连续5天重复，说明问题不是缺情报，而是缺“低摩擦执行载体”。未来应优先沉淀可一键执行的素材，而不是继续重复高层建议

### Stale Threads
- Non-tech用户激活方案 — stale for 54 days
- MyClaw 分水岭行为分析 — stale for 53 days
- Credits消费集中度 — stale for 49 days

### Suggestions
- 直接准备 3 条可发推文 + 1 条 KOL outreach 模板，把“知道该做什么”改成“可以立刻发送”
- 取消订阅视频应纳入搜索结果防御视角，评估是否需要用正向教程/KOL内容做对冲

## 🌙 Dream #8 — 2026-04-09

**Scanned**: 1 file (4/8) | **New**: 4 | **Updated**: 6 | **Total**: 248 → 252 entries

### Changes
- [New] Key Decision: 竞争情报日报#6（4/8）——Anthropic信任危机恶化、OpenInfer直接威胁Dit.ai、Agent疲劳信号
- [New] 竞品表新增2条：OpenInfer（🔴直接威胁Dit.ai,云推理成本优化）、TrustClaw（🟡安全主打）
- [New] 机会窗口+2：#6"Agent疲劳"反叙事、#7"推理成本民主化"叙事（均与Dit.ai相关）
- [New] Open Thread: 监控OpenInfer进展，Dit.ai差异化必须比"便宜"更深
- [Updated] Anthropic封杀章节：新增信任危机恶化数据（FT"故意泄露"、HN 127次宕机/90天）
- [Updated] Manus AI播放量 277万→283万
- [Updated] Fireship播放量 194万→195万
- [Updated] MyClaw品牌曝光：新增AI學堂粤语教程（多语言/多区域曝光扩展）
- [Updated] 安全对比推文串线程：从连续5天升级到连续6天未执行 🚨🚨🚨
- [Updated] GitClaw：补充200⭐和"Agent as Git Repo"概念细节

### Insights
- **"Agent疲劳"是MyClaw的天然叙事盟友**：市场上"我不要自主Agent"声音变大，恰好印证MyClaw"用户掌控的AI"定位。这不是威胁，是定位验证——当用户害怕失控的AI时，"你的Agent在你的服务器上，你有完整控制权"就是解药
- **OpenInfer是Dit.ai的第一个命名对手**：之前Dit.ai面对的是抽象的"推理成本竞争"，现在有了具体的名字和"1/10成本"的攻击性定价。Dit.ai的差异化不能只靠价格——必须是"价格+质量评级+路由智能+供应商可靠性"的组合壁垒

### Stale Threads
- Non-tech用户激活方案 — stale for 55 days（自2/13），与59%月流失率直接相关
- MyClaw 分水岭行为分析 — stale for 54 days（自2/14），留存优化前提
- Credits消费集中度 — stale for 50 days（自2/18），收入集中度风险

### Suggestions
- 安全对比推文已连续6天建议未执行——建议不再等Leo决策，直接准备3条即发推文+配图描述，放在workspace里等Leo一键审批
- OpenInfer需要在下一份竞争情报日报中深度评估：产品成熟度、定价模型、技术架构、团队背景。知己知彼才能让Dit.ai找到真正的差异化护城河

## 🌙 Dream #9 — 2026-04-10

**Scanned**: 1 file | **New**: 4 | **Updated**: 3 | **Total**: 253 entries

### Changes
- [New] Key Decision: 竞争情报日报#7（4/9）——安全质疑持续发酵、Agent疲劳反叙事升温、Copilot用户流失讨论、Vix新竞品
- [New] 竞品表新增1条：Vix（"50% cheaper than Claude Code"，低价替代玩家）
- [New] 新增“叙事状态评估(2026-04-09)”表，明确4条叙事线的紧迫度
- [New] Open Threads +2：抢占"Agent疲劳"叙事、做Copilot用户迁移内容
- [Updated] 竞争格局章节日期 2026-04-08 → 2026-04-09
- [Updated] 安全对比文章/推文串线程：从连续6天升级到连续8天未执行
- [Updated] 4/9日记标记为已整理

### Insights
- 现在已经不是“有没有营销素材”的问题，而是“执行系统是否能把连续8天重复出现的同一建议转成动作”。情报密度足够高，但执行摩擦明显高于信息摩擦
- "Agent疲劳"与Copilot流失讨论组合起来，意味着MyClaw可以同时吃到两类迁移红利：一类是害怕失控Agent的用户，一类是对现有代码助手失望的开发者

### Stale Threads
- 生态增长策略落地节奏重写 — stale for 18 days
- ClawHub top 50 skill作者联系方式 — stale for 18 days
- Dit.ai工程启动:Gateway + Adapter MVP(6周),Leo确认团队资源 — stale for 18 days

### Suggestions
- 下一步最值钱的不是继续加情报，而是把“安全对比推文串”“Agent疲劳回应”“Copilot迁移内容”直接起草成可发素材，压缩Leo的执行成本
- 可以把3/23以来未推进的增长策略、Dit.ai工程、开发者触达三个线程打包成一次优先级校准，避免战略层待办继续堆积

