#!/usr/bin/env node
// goal-track.js - 目标追踪工具（Node.js 版本，无依赖）

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(process.env.HOME, '.openclaw/workspace/skills/autonomous-loop-manager/memory');
const GOALS_FILE = path.join(MEMORY_DIR, 'goals.json');

// 确保目录存在
if (!fs.existsSync(MEMORY_DIR)) {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

// 初始化文件
if (!fs.existsSync(GOALS_FILE)) {
  fs.writeFileSync(GOALS_FILE, '[]');
}

// 读取 goals
function readGoals() {
  return JSON.parse(fs.readFileSync(GOALS_FILE, 'utf-8'));
}

// 写入 goals
function writeGoals(goals) {
  fs.writeFileSync(GOALS_FILE, JSON.stringify(goals, null, 2));
}

// 生成唯一ID
function genId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 创建新目标
function createGoal(goalText, userId) {
  const goals = readGoals();
  const goalId = genId();
  const timestamp = new Date().toISOString();
  
  const newGoal = {
    goal_id: goalId,
    user_id: userId,
    goal_text: goalText,
    status: 'active',
    created_at: timestamp,
    updated_at: timestamp,
    decomposition: [],
    completed_steps: [],
    current_step: '',
    failed_attempts: [],
    context: {}
  };
  
  goals.push(newGoal);
  writeGoals(goals);
  
  console.log(`✅ 目标已创建: ${goalId}`);
  return goalId;
}

// 更新目标进度
function updateGoal(goalId, step, status = 'active') {
  const goals = readGoals();
  const idx = goals.findIndex(g => g.goal_id === goalId);
  
  if (idx === -1) {
    console.log(`❌ 目标不存在: ${goalId}`);
    return false;
  }
  
  goals[idx].completed_steps.push(step);
  goals[idx].current_step = step;
  goals[idx].status = status;
  goals[idx].updated_at = new Date().toISOString();
  
  writeGoals(goals);
  console.log(`✅ 进度已更新: ${step}`);
  return true;
}

// 添加强制尝试记录
function addFailedAttempt(goalId, task, method, whyFailed, pivotTo) {
  const goals = readGoals();
  const idx = goals.findIndex(g => g.goal_id === goalId);
  
  if (idx === -1) {
    console.log(`❌ 目标不存在: ${goalId}`);
    return false;
  }
  
  goals[idx].failed_attempts.push({
    task,
    method,
    why_failed: whyFailed,
    pivot_to: pivotTo,
    timestamp: new Date().toISOString()
  });
  
  writeGoals(goals);
  console.log('📝 失败记录已写入');
  return true;
}

// 查询目标状态
function getGoalStatus(goalId) {
  const goals = readGoals();
  const goal = goals.find(g => g.goal_id === goalId);
  console.log(JSON.stringify(goal, null, 2));
  return goal;
}

// 列出用户的所有目标
function listUserGoals(userId) {
  const goals = readGoals();
  const userGoals = goals.filter(g => g.user_id === userId);
  console.log(JSON.stringify(userGoals, null, 2));
  return userGoals;
}

// 查找活跃目标
function findActiveGoal(userId) {
  const goals = readGoals();
  const active = goals.find(g => g.user_id === userId && g.status === 'active');
  if (active) {
    console.log(JSON.stringify(active, null, 2));
  } else {
    console.log('null');
  }
  return active || null;
}

// 目标分解
function decomposeGoal(goalId, decomposition) {
  const goals = readGoals();
  const idx = goals.findIndex(g => g.goal_id === goalId);
  
  if (idx === -1) {
    console.log(`❌ 目标不存在: ${goalId}`);
    return false;
  }
  
  goals[idx].decomposition = decomposition;
  goals[idx].updated_at = new Date().toISOString();
  
  writeGoals(goals);
  console.log(`✅ 目标已分解为 ${decomposition.length} 个子任务`);
  return true;
}

// 主入口
const [,, command, ...args] = process.argv;

switch (command) {
  case 'create':
    createGoal(args[0], args[1]);
    break;
  case 'update':
    updateGoal(args[0], args[1], args[2]);
    break;
  case 'add-failed':
    addFailedAttempt(args[0], args[1], args[2], args[3], args[4]);
    break;
  case 'status':
    getGoalStatus(args[0]);
    break;
  case 'list':
    listUserGoals(args[0]);
    break;
  case 'active':
    findActiveGoal(args[0]);
    break;
  case 'decompose':
    try {
      const decomp = JSON.parse(args.slice(1).join(' '));
      decomposeGoal(args[0], decomp);
    } catch (e) {
      console.log('❌ 分解必须是有效的 JSON 数组');
    }
    break;
  default:
    console.log('Usage: goal-track <command> [args]');
    console.log('Commands: create, update, add-failed, status, list, active, decompose');
}