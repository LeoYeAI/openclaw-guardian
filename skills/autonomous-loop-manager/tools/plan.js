#!/usr/bin/env node
// plan.js - 从 memory 生成执行计划
// 这是让 Agent 能够"记住"并"持续追求目标"的核心工具

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(process.env.HOME, '.openclaw/workspace/skills/autonomous-loop-manager/memory');
const GOALS_FILE = path.join(MEMORY_DIR, 'goals.json');
const REFLECTIONS_FILE = path.join(MEMORY_DIR, 'reflections.json');
const STRATEGIES_FILE = path.join(MEMORY_DIR, 'strategies.json');

function readJson(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

// 搜索相关策略
function findRelevantStrategies(task) {
  const strategies = readJson(STRATEGIES_FILE);
  return strategies
    .filter(s => task.includes(s.context) || s.context.includes(task.split(' ')[0]))
    .sort((a, b) => b.success_count - a.success_count)
    .slice(0, 3);
}

// 搜索相关失败
function findFailedAttempts(task) {
  const reflections = readJson(REFLECTIONS_FILE);
  return reflections
    .filter(r => r.outcome === 'failed' && 
      (task.includes(r.task_summary) || r.task_summary.includes(task.split(' ')[0])))
    .slice(0, 3);
}

// 查找活跃目标
function findActiveGoal(userId) {
  const goals = readJson(GOALS_FILE);
  return goals.find(g => g.user_id === userId && g.status === 'active');
}

// 生成计划
function generatePlan(taskDescription, userId) {
  const plan = {
    timestamp: new Date().toISOString(),
    task: taskDescription,
    relevant_strategies: findRelevantStrategies(taskDescription),
    avoid_these_failures: findFailedAttempts(taskDescription),
    active_goal: findActiveGoal(userId),
    recommendations: []
  };
  
  // 生成建议
  if (plan.active_goal) {
    plan.recommendations.push({
      type: 'continue',
      message: `检测到您有一个进行中的目标: "${plan.active_goal.goal_text}"`
    });
  }
  
  if (plan.relevant_strategies.length > 0) {
    plan.recommendations.push({
      type: 'strategy',
      message: `之前类似任务用过这些方法: ${plan.relevant_strategies.map(s => s.context).join(', ')}`
    });
  }
  
  if (plan.avoid_these_failures.length > 0) {
    plan.recommendations.push({
      type: 'warning',
      message: `注意：之前类似任务失败过，原因: ${plan.avoid_these_failures[0].reflection.substring(0, 100)}`
    });
  }
  
  return plan;
}

const [,, ...args] = process.argv;
const taskDescription = args.join(' ');

// 从任务描述中提取 user_id（如果提供）
let userId = 'default';
const userIdMatch = taskDescription.match(/user[_-]?id[:\s]+(\w+)/i);
if (userIdMatch) {
  userId = userIdMatch[1];
  taskDescription = taskDescription.replace(/user[_-]?id[:\s]+(\w+)/i, '').trim();
}

if (!taskDescription) {
  console.log('Usage: plan <任务描述>');
  console.log('从 memory 中查找相关策略和失败教训，生成执行计划');
} else {
  const plan = generatePlan(taskDescription, userId);
  console.log(JSON.stringify(plan, null, 2));
}