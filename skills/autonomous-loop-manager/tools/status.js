#!/usr/bin/env node
// status.js - 查看用户整体 loop 状态

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

function showStatus(userId) {
  console.log('═══════════════════════════════════════');
  console.log('🌀 Autonomous Loop 状态报告');
  console.log('═══════════════════════════════════════');
  
  const goals = readJson(GOALS_FILE).filter(g => g.user_id === userId);
  const strategies = readJson(STRATEGIES_FILE).filter(s => s.user_id === userId);
  const reflections = readJson(REFLECTIONS_FILE);
  
  console.log('\n📋 目标概览');
  console.log('───────────────────────────────────────');
  const active = goals.filter(g => g.status === 'active');
  const completed = goals.filter(g => g.status === 'completed');
  console.log(`总目标数: ${goals.length}`);
  console.log(`进行中: ${active.length}`);
  console.log(`已完成: ${completed.length}`);
  
  if (active.length > 0) {
    console.log('\n🎯 当前进行中的目标:');
    active.forEach(g => {
      console.log(`  • ${g.goal_text}`);
      console.log(`    进度: ${g.completed_steps.length} 步完成`);
      if (g.current_step) {
        console.log(`    当前: ${g.current_step}`);
      }
    });
  }
  
  console.log('\n🧠 策略库');
  console.log('───────────────────────────────────────');
  console.log(`策略总数: ${strategies.length}`);
  
  if (strategies.length > 0) {
    const top = strategies.sort((a, b) => b.success_count - a.success_count)[0];
    console.log(`最常用: ${top.context}`);
    console.log(`    成功 ${top.success_count} 次`);
  }
  
  console.log('\n💭 反思记录');
  console.log('───────────────────────────────────────');
  const failed = reflections.filter(r => r.outcome === 'failed');
  console.log(`反思总数: ${reflections.length}`);
  console.log(`失败记录: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log('\n⚠️ 最近失败:');
    failed.slice(-3).forEach(r => {
      console.log(`  • ${r.task_summary}: ${r.reflection.substring(0, 50)}...`);
    });
  }
  
  console.log('\n═══════════════════════════════════════');
}

const [,, userId] = process.argv;
if (!userId) {
  console.log('Usage: status <user_id>');
} else {
  showStatus(userId);
}