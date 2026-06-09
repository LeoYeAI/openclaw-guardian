#!/bin/bash
# autonomous-loop-manager core engine
# 核心循环引擎 - 目标追踪、反思写入、策略管理

SKILL_DIR="$HOME/.openclaw/workspace/skills/autonomous-loop-manager"
MEMORY_DIR="$SKILL_DIR/memory"
TOOLS_DIR="$SKILL_DIR/tools"
NODE_BIN="node"

# 确保目录存在
mkdir -p "$MEMORY_DIR" "$TOOLS_DIR"

# 主入口
case "$1" in
  goal-track)
    shift
    "$NODE_BIN" "$TOOLS_DIR/goal-track.js" "$@"
    ;;
  reflect)
    shift
    "$NODE_BIN" "$TOOLS_DIR/reflect.js" "$@"
    ;;
  strategy)
    shift
    "$NODE_BIN" "$TOOLS_DIR/strategy.js" "$@"
    ;;
  status)
    shift
    "$NODE_BIN" "$TOOLS_DIR/status.js" "$@"
    ;;
  plan)
    shift
    "$NODE_BIN" "$TOOLS_DIR/plan.js" "$@"
    ;;
  help|--help|-h)
    echo "🌀 Autonomous Loop Manager"
    echo ""
    echo "Usage: loop <command> [args]"
    echo ""
    echo "Commands:"
    echo "  goal-track create <goal> <user_id>    - 创建新目标"
    echo "  goal-track update <goal_id> <step>    - 更新进度"
    echo "  goal-track status <goal_id>           - 查看目标状态"
    echo "  goal-track list <user_id>             - 列出用户所有目标"
    echo "  goal-track active <user_id>           - 查找活跃目标"
    echo "  reflect write <goal_id> <反思> <结果> <摘要> - 写入反思"
    echo "  reflect query <关键词> [limit]        - 查询反思"
    echo "  reflect failed                        - 获取失败上下文"
    echo "  strategy add <context> <策略> [user]  - 添加策略"
    echo "  strategy query <context> [limit]      - 查询策略"
    echo "  strategy top <user_id> [limit]        - 最常用策略"
    echo "  strategy recent <user_id> [limit]      - 最近使用"
    echo "  status <user_id>                      - 整体状态"
    echo "  plan <任务描述>                        - 从 memory 生成计划"
    ;;
  *)
    echo "Usage: loop <command> [args]"
    echo "Run 'loop help' for full command list."
    ;;
esac