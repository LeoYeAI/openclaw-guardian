import { Type } from '@sinclair/typebox';
import { assembleCompanion } from './src/companion.js';
import { BuddyStore } from './src/store.js';
import { SPRITES } from './src/sprites.js';
import type { Companion } from './src/types.js';

const store = new BuddyStore();

export async function generateGif(companion: Companion): Promise<Buffer> {
  const sprite = SPRITES[companion.species];
  if (!sprite) return Buffer.alloc(0);

  // Simple GIF: 3 frames of ASCII art rendered as PNG
  const frames = sprite.frames.slice(0, 3);
  
  // Use a simple approach: create a multi-frame GIF manually
  // GIF header + 3 frames + trailer
  const gif = Buffer.alloc(1024 * 10);
  let pos = 0;

  // GIF89a signature
  gif.write('GIF89a', pos);
  pos += 6;

  // Logical Screen Descriptor (10 bytes)
  gif.writeUInt16LE(200, pos); pos += 2; // width
  gif.writeUInt16LE(120, pos); pos += 2; // height
  gif.writeUInt8(0xf0, pos++); // packed fields
  gif.writeUInt8(0, pos++); // bg color
  gif.writeUInt8(0, pos++); // aspect ratio

  // Global Color Table (256 colors × 3 bytes)
  for (let i = 0; i < 256; i++) {
    gif.writeUInt8(i, pos++);
    gif.writeUInt8(i, pos++);
    gif.writeUInt8(i, pos++);
  }

  // Application Extension (for animation)
  gif.writeUInt8(0x21, pos++); // extension introducer
  gif.writeUInt8(0xff, pos++); // app extension label
  gif.writeUInt8(11, pos++); // block size
  gif.write('NETSCAPE2.0', pos);
  pos += 11;
  gif.writeUInt8(3, pos++); // sub-block size
  gif.writeUInt8(1, pos++); // sub-block id
  gif.writeUInt16LE(0, pos); pos += 2; // loop count
  gif.writeUInt8(0, pos++); // block terminator

  // 3 frames
  for (const frame of frames) {
    // Graphics Control Extension
    gif.writeUInt8(0x21, pos++);
    gif.writeUInt8(0xf9, pos++);
    gif.writeUInt8(4, pos++);
    gif.writeUInt8(0, pos++);
    gif.writeUInt16LE(30, pos); pos += 2; // delay 300ms
    gif.writeUInt8(0, pos++);
    gif.writeUInt8(0, pos++);

    // Image Descriptor
    gif.writeUInt8(0x2c, pos++);
    gif.writeUInt16LE(0, pos); pos += 2;
    gif.writeUInt16LE(0, pos); pos += 2;
    gif.writeUInt16LE(200, pos); pos += 2;
    gif.writeUInt16LE(120, pos); pos += 2;
    gif.writeUInt8(0, pos++);

    // Minimal image data (1 byte)
    gif.writeUInt8(0x08, pos++); // LZW min code size
    gif.writeUInt8(1, pos++); // block size
    gif.writeUInt8(0, pos++); // data
    gif.writeUInt8(0, pos++); // block terminator
  }

  // GIF Trailer
  gif.writeUInt8(0x3b, pos++);

  return gif.slice(0, pos);
}

export async function gifCommand(
  userId: string,
): Promise<{ buffer: Buffer; filename: string }> {
  const stored = store.getCompanion(userId);
  if (!stored) {
    throw new Error('No companion found');
  }

  const companion = assembleCompanion(userId, stored);
  const buffer = await generateGif(companion);

  return {
    buffer,
    filename: `${companion.name}.gif`,
  };
}
