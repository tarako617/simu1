import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.join(process.cwd(), 'public', 'icon.svg');
const publicDir = path.join(process.cwd(), 'public');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192x192.png'));

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512x512.png'));

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);
