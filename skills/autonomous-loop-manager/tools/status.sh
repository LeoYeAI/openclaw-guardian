#!/bin/bash
# status.sh - 查看用户整体 loop 状态

MEMORY_DIR="$HOME/.openclaw/workspace/skills/autonomous-loop-manager/memory"
GOALS_FILE="$MEMORY_DIR/goals.json"
REFLECTIONS_FILE="$MEMORY_DIR/reflections.json"
STRATEGIES_FILE="$MEMORY_DIR/strategies.json"

get_user_id() {
  echo "$1"
}

# 整体状态报告
show_status() {
  local user_id=$(get_user_id "$1")
  
  echo "═══════════════════════════════════════"
  echo "🌀 Autonomous Loop 状态报告"
  echo "═══════════════════════════════════════"
  
  # 目标统计
  echo ""
  echo "📋 目标概览"
  echo "───────────────────────────────────────"
  if [ -f "$GOALS_FILE" ]; then
    local total=$(cat "$GOALS_FILE" | jq --arg uid "$user_id" '[.[] | select(.user_id == $uid)] | length')
    local active=$(cat "$GOALS_FILE" | jq --arg uid "$user_id" '[.[] | select(.user_id == $uid and .status == "active")] | length')
    local completed=$(cat "$GOALS_FILE" | jq --arg uid "$user_id" '[.[] | select(.user_id == $uid and .status == "completed")] | length')
    
    echo "总目标数: $total"
    echo "进行中: $active"
    echo "已完成: $completed"
    
    # 显示活跃目标
    if [ "$active" -gt 0 ]; then
      echo ""
      echo "🎯 当前进行中的目标:"
      cat "$GOALS_FILE" | jq --arg uid "$user_id" '[.[] | select(.user_id == $uid and .status == "active")] | .[] | "  - \(.goal_text) (完成\(.completed_steps | length)步)"
    fi
  fi
  
  # 策略统计
  echo ""
  echo "🧠 策略库"
  echo "───────────────────────────────────────"
  if [ -f "$STRATEGIES_FILE" ]; then
    local strategy_count=$(cat "$STRATEGIES_FILE" | jq --arg uid "$user_id" '[.[] | select(.user_id == $uid)] | length')
    local top_strategy=$(cat "$STRATEGIES_FILE" | jq --arg uid "$user_id" '[.[] | select(.user_id == $uid)] | sort_by(-.success_count) | .[0] // null')
    
    echo "策略总数: $strategy_count"
    if [ "$strategy_count" -gt 0 ]; then
      echo "最常用: $(echo "$top_strategy" | jq -r '.context') (成功\(echo "$top_strategy" | jq -r '.success_count')次)"
    fi
  fi
  
  # 反思统计
  echo ""
  echo "💭 反思记录"
  echo "───────────────────────────────────────"
  if [ -f "$REFLECTIONS_FILE" ]; then
    local reflection_count=$(cat "$REFLECTIONS_FILE" | jq length)
    local failed_count=$(cat "$REFLECTIONS_FILE" | jq '[.[] | select(.outcome == "failed")] | length')
    
    echo "反思总数: $reflection_count"
    echo "失败记录: $failed_count"
  fi
  
  echo ""
  echo "═══════════════════════════════════════"
}

# 主入口
case "$1" in
  *)
    show_status "$1"
    ;;
esac