const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const svgPath = path.join(__dirname, '..', 'public', 'assets', 'branding', 'kemenag.svg');
  const iconsDir = path.join(__dirname, '..', 'public', 'assets', 'icons');
  
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const svgBuffer = fs.readFileSync(svgPath);

  // High-res trimmed vector logo
  const trimmed = await sharp(svgBuffer, { density: 300 })
    .trim()
    .toBuffer();

  // Helper to create transparent icon
  async function createAnyIcon(size, targetWidth) {
    const resizedLogo = await sharp(trimmed)
      .resize({ width: targetWidth, fit: 'contain' })
      .toBuffer({ resolveWithObject: true });

    const left = Math.round((size - resizedLogo.info.width) / 2);
    const top = Math.round((size - resizedLogo.info.height) / 2);

    const outPath = path.join(iconsDir, `kemenag-${size}.png`);
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{ input: resizedLogo.data, left, top }])
    .png()
    .toFile(outPath);
    console.log(`Generated: ${outPath}`);
  }

  // Helper to create maskable icon with clean background and safe-zone padding
  async function createMaskableIcon(size, targetWidth) {
    const resizedLogo = await sharp(trimmed)
      .resize({ width: targetWidth, fit: 'contain' })
      .toBuffer({ resolveWithObject: true });

    const left = Math.round((size - resizedLogo.info.width) / 2);
    const top = Math.round((size - resizedLogo.info.height) / 2);

    const outPath = path.join(iconsDir, `kemenag-maskable-${size}.png`);
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 } // clean solid white
      }
    })
    .composite([{ input: resizedLogo.data, left, top }])
    .png()
    .toFile(outPath);
    console.log(`Generated: ${outPath}`);
  }

  // Generate 192 (any: width 148, maskable: width 125)
  await createAnyIcon(192, 148);
  await createMaskableIcon(192, 125);

  // Generate 512 (any: width 395, maskable: width 330)
  await createAnyIcon(512, 395);
  await createMaskableIcon(512, 330);

  console.log('All PWA icons successfully generated!');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
