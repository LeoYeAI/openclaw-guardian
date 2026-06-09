#!/bin/bash
# goal-track.sh - 目标追踪工具
# 创建、更新、查询目标

MEMORY_DIR="$HOME/.openclaw/workspace/skills/autonomous-loop-manager/memory"
GOALS_FILE="$MEMORY_DIR/goals.json"

# 生成唯一ID
gen_id() {
  echo "$(date +%s)-$RANDOM"
}

# 读取goals
read_goals() {
  if [ -f "$GOALS_FILE" ]; then
    cat "$GOALS_FILE"
  else
    echo "[]"
  fi
}

# 写入goals
write_goals() {
  echo "$1" > "$GOALS_FILE"
}

# 创建新目标
create_goal() {
  local goal_text="$1"
  local user_id="$2"
  local goal_id=$(gen_id)
  
  local timestamp=$(date -Iseconds)
  
  local new_goal=$(cat <<EOF
{
  "goal_id": "$goal_id",
  "user_id": "$user_id",
  "goal_text": "$goal_text",
  "status": "active",
  "created_at": "$timestamp",
  "updated_at": "$timestamp",
  "decomposition": [],
  "completed_steps": [],
  "current_step": "",
  "failed_attempts": [],
  "context": {}
}
EOF
)

  # 读取现有goals，添加新goal，写回
  local goals=$(read_goals)
  local new_goals=$(echo "$goals" | jq --argjson new "$new_goal" '. += [$new]')
  write_goals "$new_goals"
  
  echo "✅ 目标已创建: $goal_id"
  echo "$goal_id"
}

# 更新目标进度
update_goal() {
  local goal_id="$1"
  local step="$2"
  local status="${3:-active}"
  
  local goals=$(read_goals)
  local updated=$(echo "$goals" | jq --arg id "$goal_id" --arg step "$step" --arg status "$status" \
    'map(if .goal_id == $id then 
      .completed_steps += [$step]
      | .current_step = $step
      | .status = $status
      | .updated_at = now | iso
    else . end)')
  
  write_goals "$updated"
  echo "✅ 进度已更新: $step"
}

# 添加强制尝试记录
add_failed_attempt() {
  local goal_id="$1"
  local task="$2"
  local method="$3"
  local why_failed="$4"
  local pivot_to="$5"
  
  local attempt=$(cat <<EOF
{
  "task": "$task",
  "method": "$method",
  "why_failed": "$why_failed",
  "pivot_to": "$pivot_to",
  "timestamp": "$(date -Iseconds)"
}
EOF
)

  local goals=$(read_goals)
  local updated=$(echo "$goals" | jq --arg id "$goal_id" --argjson attempt "$attempt" \
    'map(if .goal_id == $id then .failed_attempts += [$attempt] else . end)')
  
  write_goals "$updated"
  echo "📝 失败记录已写入"
}

# 查询目标状态
get_goal_status() {
  local goal_id="$1"
  local goals=$(read_goals)
  echo "$goals" | jq --arg id "$goal_id" 'map(select(.goal_id == $id)) | .[0]'
}

# 列出用户的所有目标
list_user_goals() {
  local user_id="$1"
  local goals=$(read_goals)
  echo "$goals" | jq --arg uid "$user_id" '[.[] | select(.user_id == $uid)]'
}

# 查找活跃目标
find_active_goal() {
  local user_id="$1"
  local goals=$(read_goals)
  echo "$goals" | jq --arg uid "$user_id" '[.[] | select(.user_id == $uid and .status == "active")] | .[0] // null'
}

# 目标分解
decompose_goal() {
  local goal_id="$1"
  local decomposition="$2"
  
  local goals=$(read_goals)
  local updated=$(echo "$goals" | jq --arg id "$goal_id" --argjson decomp "$decomposition" \
    'map(if .goal_id == $id then .decomposition = $decomp else . end)')
  
  write_goals "$updated"
  echo "✅ 目标已分解为 ${#decomposition[@]} 个子任务"
}

# 主入口
case "$1" in
  create)
    create_goal "$2" "$3"
    ;;
  update)
    update_goal "$2" "$3" "$4"
    ;;
  add-failed)
    add_failed_attempt "$2" "$3" "$4" "$5" "$6"
    ;;
  status)
    get_goal_status "$2"
    ;;
  list)
    list_user_goals "$2"
    ;;
  active)
    find_active_goal "$2"
    ;;
  decompose)
    decompose_goal "$2" "$3"
    ;;
  *)
    echo "Usage: goal-track <command> [args]"
    ;;
esac