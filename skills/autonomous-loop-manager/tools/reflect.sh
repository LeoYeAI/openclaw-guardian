#!/bin/bash
# reflect.sh - 自我反思工具
# 写入和查询 Agent 的反思记录

MEMORY_DIR="$HOME/.openclaw/workspace/skills/autonomous-loop-manager/memory"
REFLECTIONS_FILE="$MEMORY_DIR/reflections.json"

init_memory() {
  if [ ! -f "$REFLECTIONS_FILE" ]; then
    echo "[]" > "$REFLECTIONS_FILE"
  fi
}

init_memory

gen_id() {
  echo "$(date +%s)-$RANDOM"
}

read_reflections() {
  cat "$REFLECTIONS_FILE"
}

write_reflections() {
  echo "$1" > "$REFLECTIONS_FILE"
}

# 写入反思
write_reflection() {
  local goal_id="$1"
  local reflection_text="$2"
  local outcome="$3"  # "completed" | "failed" | "interrupted"
  local task_summary="$4"
  
  local reflection_id=$(gen_id)
  local timestamp=$(date -Iseconds)
  
  local new_reflection=$(cat <<EOF
{
  "reflection_id": "$reflection_id",
  "goal_id": "$goal_id",
  "task_summary": "$task_summary",
  "reflection": "$reflection_text",
  "outcome": "$outcome",
  "timestamp": "$timestamp",
  "tags": [],
  "insights": []
}
EOF
)

  local reflections=$(read_reflections)
  local updated=$(echo "$reflections" | jq --argjson new "$new_reflection" '. += [$new]')
  write_reflections "$updated"
  
  echo "✅ 反思已写入: $reflection_id"
  echo "$reflection_id"
}

# 查询相关反思
query_reflections() {
  local keyword="$1"
  local limit="${2:-5}"
  
  local reflections=$(read_reflections)
  echo "$reflections" | jq --arg kw "$keyword" --arg limit "$limit" \
    '[.[] | select(.reflection + .task_summary | test($kw; "i"))] | .[0:$limit | tonumber]'
}

# 获取目标的反思
get_goal_reflections() {
  local goal_id="$1"
  local reflections=$(read_reflections)
  echo "$reflections" | jq --arg gid "$goal_id" '[.[] | select(.goal_id == $gid)]'
}

# 提取洞察（用于策略更新）
extract_insights() {
  local reflection_id="$1"
  
  local reflections=$(read_reflections)
  local reflection=$(echo "$reflections" | jq --arg rid "$reflection_id" '[.[] | select(.reflection_id == $rid)] | .[0]')
  
  if [ "$reflection" == "null" ]; then
    echo "❌ 反思不存在: $reflection_id"
    return 1
  fi
  
  # 提取关键洞察
  echo "$reflection" | jq '{insights: [.reflection, .task_summary], outcome: .outcome}'
}

# 标记洞察（给Agent用）
tag_insight() {
  local reflection_id="$1"
  local tag="$2"
  
  local reflections=$(read_reflections)
  local updated=$(echo "$reflections" | jq --arg rid "$reflection_id" --arg tag "$tag" \
    'map(if .reflection_id == $rid then .tags += [$tag] else . end)')
  
  write_reflections "$updated"
  echo "🏷️ 洞察已标记: $tag"
}

# 获取所有失败的上下文（用于避坑）
get_failed_contexts() {
  local reflections=$(read_reflections)
  echo "$reflections" | jq '[.[] | select(.outcome == "failed") | {task: .task_summary, reflection: .reflection}]'
}

# 主入口
case "$1" in
  write)
    write_reflection "$2" "$3" "$4" "$5"
    ;;
  query)
    query_reflections "$2" "$3"
    ;;
  goal)
    get_goal_reflections "$2"
    ;;
  insights)
    extract_insights "$2"
    ;;
  tag)
    tag_insight "$2" "$3"
    ;;
  failed)
    get_failed_contexts
    ;;
  *)
    echo "Usage: reflect <command> [args]"
    ;;
esac