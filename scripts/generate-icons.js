import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createSolidPNG(width, height, r, g, b, a = 255) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image data: for each scanline, 1 filter byte (0) + width * 4 bytes
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      // Draw a subtle leaf/green circle pattern in center
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = width * 0.42;

      if (dist < radius) {
        // Agro green inside
        rawData[pixelOffset] = 21;     // R
        rawData[pixelOffset + 1] = 128; // G
        rawData[pixelOffset + 2] = 61;  // B
        rawData[pixelOffset + 3] = 255; // A
      } else {
        // Dark green border
        rawData[pixelOffset] = 20;
        rawData[pixelOffset + 1] = 83;
        rawData[pixelOffset + 2] = 45;
        rawData[pixelOffset + 3] = 255;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([length, body, crcBuf]);
}

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createSolidPNG(192, 192, 21, 128, 61));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createSolidPNG(512, 512, 21, 128, 61));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createSolidPNG(512, 512, 20, 83, 45));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createSolidPNG(180, 180, 21, 128, 61));
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createSolidPNG(192, 192, 21, 128, 61));

console.log('Generated PNG icons successfully.');
