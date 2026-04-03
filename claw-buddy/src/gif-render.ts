import GifEncoder from 'gif-encoder-2';
import sharp from 'sharp';
import { SPRITES } from './sprites.js';
import type { Companion } from './types.js';

const WIDTH = 120;
const HEIGHT = 100;
const FRAME_DELAY = 200; // ms per frame

async function renderFrameToBuffer(
  spriteLines: string[],
  bgColor: string = '#1a1a1a',
): Promise<Buffer> {
  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${WIDTH}" height="${HEIGHT}" fill="${bgColor}"/>
      <text x="10" y="50" font-family="monospace" font-size="10" fill="#00ff00" white-space="pre">
        ${spriteLines.map((line, i) => `<tspan x="10" dy="${i === 0 ? 0 : 12}">${escapeXml(line)}</tspan>`).join('')}
      </text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function generateCompanionGif(
  companion: Companion,
): Promise<Buffer> {
  const sprite = SPRITES[companion.species];
  if (!sprite) return Buffer.alloc(0);

  const gif = new GifEncoder(WIDTH, HEIGHT);
  gif.setDelay(FRAME_DELAY);
  gif.setQuality(10);
  gif.setRepeat(0); // infinite loop

  gif.render();

  // Render 3 animation frames
  for (let frameIdx = 0; frameIdx < 3; frameIdx++) {
    const frameLines = sprite.frames[frameIdx % sprite.frames.length];
    const frameBuffer = await renderFrameToBuffer(frameLines);
    gif.addFrame(frameBuffer);
  }

  gif.end();
  return gif.render();
}
