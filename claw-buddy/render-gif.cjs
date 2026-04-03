const GifEncoder = require('gif-encoder-2');
const sharp = require('sharp');
const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('/home/ubuntu/.openclaw/buddy.db');
const row = db.prepare('SELECT * FROM companions WHERE user_id = ?').get('1958991880');
if (!row) { console.log('No companion'); process.exit(1); }

const frames = [
  ['            ', ' .-o-OO-o-. ', '(__________)', '   |×  ×|   ', '   |____|   '],
  ['            ', ' .-o-OO-o-. ', '(__________)', '   |○  ○|   ', '   |____|   '],
  ['            ', ' .-o-OO-o-. ', '(__________)', '   |×  ×|   ', '   |____|   ']
];

async function render() {
  const gif = new GifEncoder(200, 120);
  gif.setDelay(300);
  gif.setQuality(10);
  gif.setRepeat(0);
  gif.start();

  for (const frame of frames) {
    const svg = `<svg width="200" height="120" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="120" fill="#1a1a2e"/>
      <text x="20" y="40" font-family="Courier,monospace" font-size="14" fill="#00ff88" xml:space="preserve">
        ${frame.map((line, i) => `<tspan x="20" dy="${i === 0 ? 0 : 16}">${line}</tspan>`).join('')}
      </text>
    </svg>`;
    
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    gif.addFrame(png);
  }

  gif.finish();
  return gif.out.getData();
}

render().then(buf => {
  fs.writeFileSync('/tmp/spore.gif', buf);
  console.log('✅ Saved to /tmp/spore.gif');
}).catch(e => console.error(e));
