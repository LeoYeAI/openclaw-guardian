#!/bin/bash
# strategy.sh - 策略库管理
# 添加、查询、更新有效策略

MEMORY_DIR="$HOME/.openclaw/workspace/skills/autonomous-loop-manager/memory"
STRATEGIES_FILE="$MEMORY_DIR/strategies.json"

init_memory() {
  if [ ! -f "$STRATEGIES_FILE" ]; then
    echo "[]" > "$STRATEGIES_FILE"
  fi
}

init_memory

gen_id() {
  echo "$(date +%s)-$RANDOM"
}

read_strategies() {
  cat "$STRATEGIES_FILE"
}

write_strategies() {
  echo "$1" > "$STRATEGIES_FILE"
}

# 添加策略
add_strategy() {
  local context="$1"
  local strategy="$2"
  local user_id="${3:-default}"
  
  local strategy_id=$(gen_id)
  local timestamp=$(date -Iseconds)
  
  local new_strategy=$(cat <<EOF
{
  "strategy_id": "$strategy_id",
  "user_id": "$user_id",
  "context": "$context",
  "strategy": "$strategy",
  "success_count": 1,
  "last_used": "$timestamp",
  "created_at": "$timestamp"
}
EOF
)

  local strategies=$(read_strategies)
  local updated=$(echo "$strategies" | jq --argjson new "$new_strategy" '. += [$new]')
  write_strategies "$updated"
  
  echo "✅ 策略已添加: $strategy_id"
  echo "$strategy_id"
}

# 查询策略（模糊匹配上下文）
query_strategy() {
  local context="$1"
  local limit="${2:-3}"
  
  local strategies=$(read_strategies)
  echo "$strategies" | jq --arg ctx "$context" --arg limit "$limit" \
    '[.[] | select(.context | test($ctx; "i"))] | sort_by(-.success_count) | .[0:$limit | tonumber]'
}

# 增加成功计数
increment_success() {
  local strategy_id="$1"
  
  local strategies=$(read_strategies)
  local updated=$(echo "$strategies" | jq --arg sid "$strategy_id" \
    'map(if .strategy_id == $sid then .success_count += 1 | .last_used = now | iso else . end)')
  
  write_strategies "$updated"
  echo "📈 成功计数 +1"
}

# 更新策略
update_strategy() {
  local strategy_id="$1"
  local new_strategy="$2"
  
  local strategies=$(read_strategies)
  local updated=$(echo "$strategies" | jq --arg sid "$strategy_id" --arg strat "$new_strategy" \
    'map(if .strategy_id == $sid then .strategy = $strat else . end)')
  
  write_strategies "$updated"
  echo "✅ 策略已更新"
}

# 获取用户最常用的策略
get_top_strategies() {
  local user_id="$1"
  local limit="${2:-5}"
  
  local strategies=$(read_strategies)
  echo "$strategies" | jq --arg uid "$user_id" --arg limit "$limit" \
    '[.[] | select(.user_id == $uid)] | sort_by(-.success_count) | .[0:$limit | tonumber]'
}

# 获取最近使用的策略
get_recent_strategies() {
  local user_id="$1"
  local limit="${2:-5}"
  
  local strategies=$(read_strategies)
  echo "$strategies" | jq --arg uid "$user_id" --arg limit "$limit" \
    '[.[] | select(.user_id == $uid)] | sort_by(-.last_used) | .[0:$limit | tonumber]'
}

# 搜索策略（支持多关键词）
search_strategies() {
  local keywords="$1"
  local limit="${2:-5}"
  
  local strategies=$(read_strategies)
  echo "$strategies" | jq --arg kw "$keywords" --arg limit "$limit" \
    '[.[] | select(.context + .strategy | test($kw; "i"))] | .[0:$limit | tonumber]'
}

# 删除策略
delete_strategy() {
  local strategy_id="$1"
  
  local strategies=$(read_strategies)
  local updated=$(echo "$strategies" | jq --arg sid "$strategy_id" 'map(select(.strategy_id != $sid))')
  write_strategies "$updated"
  echo "🗑️ 策略已删除"
}

# 主入口
case "$1" in
  add)
    add_strategy "$2" "$3" "$4"
    ;;
  query)
    query_strategy "$2" "$3"
    ;;
  success)
    increment_success "$2"
    ;;
  update)
    update_strategy "$2" "$3"
    ;;
  top)
    get_top_strategies "$2" "$3"
    ;;
  recent)
    get_recent_strategies "$2" "$3"
    ;;
  search)
    search_strategies "$2" "$3"
    ;;
  delete)
    delete_strategy "$2"
    ;;
  *)
    echo "Usage: strategy <command> [args]"
    ;;
esac