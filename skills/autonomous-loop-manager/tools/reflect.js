#!/usr/bin/env node
// reflect.js - 自我反思工具

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(process.env.HOME, '.openclaw/workspace/skills/autonomous-loop-manager/memory');
const REFLECTIONS_FILE = path.join(MEMORY_DIR, 'reflections.json');

// 确保目录存在
if (!fs.existsSync(MEMORY_DIR)) {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

// 初始化文件
if (!fs.existsSync(REFLECTIONS_FILE)) {
  fs.writeFileSync(REFLECTIONS_FILE, '[]');
}

function readReflections() {
  return JSON.parse(fs.readFileSync(REFLECTIONS_FILE, 'utf-8'));
}

function writeReflections(reflections) {
  fs.writeFileSync(REFLECTIONS_FILE, JSON.stringify(reflections, null, 2));
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 写入反思
function writeReflection(goalId, reflectionText, outcome, taskSummary) {
  const reflections = readReflections();
  const reflectionId = genId();
  const timestamp = new Date().toISOString();
  
  const newReflection = {
    reflection_id: reflectionId,
    goal_id: goalId,
    task_summary: taskSummary,
    reflection: reflectionText,
    outcome,
    timestamp,
    tags: [],
    insights: []
  };
  
  reflections.push(newReflection);
  writeReflections(reflections);
  
  console.log(`✅ 反思已写入: ${reflectionId}`);
  return reflectionId;
}

// 查询相关反思
function queryReflections(keyword, limit = 5) {
  const reflections = readReflections();
  const filtered = reflections.filter(r => 
    r.reflection.includes(keyword) || r.task_summary.includes(keyword)
  ).slice(0, limit);
  
  console.log(JSON.stringify(filtered, null, 2));
  return filtered;
}

// 获取目标的反思
function getGoalReflections(goalId) {
  const reflections = readReflections();
  const filtered = reflections.filter(r => r.goal_id === goalId);
  console.log(JSON.stringify(filtered, null, 2));
  return filtered;
}

// 提取洞察
function extractInsights(reflectionId) {
  const reflections = readReflections();
  const reflection = reflections.find(r => r.reflection_id === reflectionId);
  
  if (!reflection) {
    console.log(`❌ 反思不存在: ${reflectionId}`);
    return null;
  }
  
  console.log(JSON.stringify({ insights: [reflection.reflection, reflection.task_summary], outcome: reflection.outcome }, null, 2));
  return reflection;
}

// 标记洞察
function tagInsight(reflectionId, tag) {
  const reflections = readReflections();
  const idx = reflections.findIndex(r => r.reflection_id === reflectionId);
  
  if (idx === -1) {
    console.log(`❌ 反思不存在: ${reflectionId}`);
    return false;
  }
  
  reflections[idx].tags.push(tag);
  writeReflections(reflections);
  
  console.log(`🏷️ 洞察已标记: ${tag}`);
  return true;
}

// 获取所有失败的上下文
function getFailedContexts() {
  const reflections = readReflections();
  const failed = reflections.filter(r => r.outcome === 'failed').map(r => ({
    task: r.task_summary,
    reflection: r.reflection
  }));
  
  console.log(JSON.stringify(failed, null, 2));
  return failed;
}

// 主入口
const [,, command, ...args] = process.argv;

switch (command) {
  case 'write':
    writeReflection(args[0], args[1], args[2], args[3]);
    break;
  case 'query':
    queryReflections(args[0], args[1]);
    break;
  case 'goal':
    getGoalReflections(args[0]);
    break;
  case 'insights':
    extractInsights(args[0]);
    break;
  case 'tag':
    tagInsight(args[0], args[1]);
    break;
  case 'failed':
    getFailedContexts();
    break;
  default:
    console.log('Usage: reflect <command> [args]');
    console.log('Commands: write, query, goal, insights, tag, failed');
}