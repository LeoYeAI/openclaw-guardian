#!/usr/bin/env node
// strategy.js - 策略库管理

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(process.env.HOME, '.openclaw/workspace/skills/autonomous-loop-manager/memory');
const STRATEGIES_FILE = path.join(MEMORY_DIR, 'strategies.json');

// 确保目录存在
if (!fs.existsSync(MEMORY_DIR)) {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

// 初始化文件
if (!fs.existsSync(STRATEGIES_FILE)) {
  fs.writeFileSync(STRATEGIES_FILE, '[]');
}

function readStrategies() {
  return JSON.parse(fs.readFileSync(STRATEGIES_FILE, 'utf-8'));
}

function writeStrategies(strategies) {
  fs.writeFileSync(STRATEGIES_FILE, JSON.stringify(strategies, null, 2));
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 添加策略
function addStrategy(context, strategy, userId = 'default') {
  const strategies = readStrategies();
  const strategyId = genId();
  const timestamp = new Date().toISOString();
  
  const newStrategy = {
    strategy_id: strategyId,
    user_id: userId,
    context,
    strategy,
    success_count: 1,
    last_used: timestamp,
    created_at: timestamp
  };
  
  strategies.push(newStrategy);
  writeStrategies(strategies);
  
  console.log(`✅ 策略已添加: ${strategyId}`);
  return strategyId;
}

// 查询策略（模糊匹配上下文）
function queryStrategy(context, limit = 3) {
  const strategies = readStrategies();
  const filtered = strategies
    .filter(s => s.context.includes(context) || context.includes(s.context))
    .sort((a, b) => b.success_count - a.success_count)
    .slice(0, limit);
  
  console.log(JSON.stringify(filtered, null, 2));
  return filtered;
}

// 增加成功计数
function incrementSuccess(strategyId) {
  const strategies = readStrategies();
  const idx = strategies.findIndex(s => s.strategy_id === strategyId);
  
  if (idx === -1) {
    console.log(`❌ 策略不存在: ${strategyId}`);
    return false;
  }
  
  strategies[idx].success_count += 1;
  strategies[idx].last_used = new Date().toISOString();
  writeStrategies(strategies);
  
  console.log('📈 成功计数 +1');
  return true;
}

// 更新策略
function updateStrategy(strategyId, newStrategy) {
  const strategies = readStrategies();
  const idx = strategies.findIndex(s => s.strategy_id === strategyId);
  
  if (idx === -1) {
    console.log(`❌ 策略不存在: ${strategyId}`);
    return false;
  }
  
  strategies[idx].strategy = newStrategy;
  writeStrategies(strategies);
  
  console.log('✅ 策略已更新');
  return true;
}

// 获取用户最常用的策略
function getTopStrategies(userId, limit = 5) {
  const strategies = readStrategies();
  const filtered = strategies
    .filter(s => s.user_id === userId)
    .sort((a, b) => b.success_count - a.success_count)
    .slice(0, limit);
  
  console.log(JSON.stringify(filtered, null, 2));
  return filtered;
}

// 获取最近使用的策略
function getRecentStrategies(userId, limit = 5) {
  const strategies = readStrategies();
  const filtered = strategies
    .filter(s => s.user_id === userId)
    .sort((a, b) => new Date(b.last_used) - new Date(a.last_used))
    .slice(0, limit);
  
  console.log(JSON.stringify(filtered, null, 2));
  return filtered;
}

// 搜索策略
function searchStrategies(keywords, limit = 5) {
  const strategies = readStrategies();
  const filtered = strategies
    .filter(s => s.context.includes(keywords) || s.strategy.includes(keywords))
    .slice(0, limit);
  
  console.log(JSON.stringify(filtered, null, 2));
  return filtered;
}

// 删除策略
function deleteStrategy(strategyId) {
  const strategies = readStrategies();
  const filtered = strategies.filter(s => s.strategy_id !== strategyId);
  writeStrategies(filtered);
  
  console.log('🗑️ 策略已删除');
  return true;
}

// 主入口
const [,, command, ...args] = process.argv;

switch (command) {
  case 'add':
    addStrategy(args[0], args[1], args[2]);
    break;
  case 'query':
    queryStrategy(args[0], args[1]);
    break;
  case 'success':
    incrementSuccess(args[0]);
    break;
  case 'update':
    updateStrategy(args[0], args[1]);
    break;
  case 'top':
    getTopStrategies(args[0], args[1]);
    break;
  case 'recent':
    getRecentStrategies(args[0], args[1]);
    break;
  case 'search':
    searchStrategies(args[0], args[1]);
    break;
  case 'delete':
    deleteStrategy(args[0]);
    break;
  default:
    console.log('Usage: strategy <command> [args]');
    console.log('Commands: add, query, success, update, top, recent, search, delete');
}