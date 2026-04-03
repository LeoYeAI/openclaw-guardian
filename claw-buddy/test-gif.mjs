import { assembleCompanion } from './src/companion.js';
import { BuddyStore } from './src/store.js';
import { generateCompanionGif } from './src/gif-render.js';
import { writeFileSync } from 'fs';

const store = new BuddyStore();
const userId = '1958991880';
const stored = store.getCompanion(userId);

if (!stored) {
  console.log('No companion found');
  process.exit(1);
}

const companion = assembleCompanion(userId, stored);
console.log(`Generating GIF for ${companion.name} (${companion.species})...`);

const gifBuffer = await generateCompanionGif(companion);
writeFileSync('/tmp/spore.gif', gifBuffer);
console.log('✅ Saved to /tmp/spore.gif');
