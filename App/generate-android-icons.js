const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateAndroidIcons() {
  const svgPath = path.join(__dirname, 'icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  const resDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

  const densities = [
    { dir: 'mipmap-mdpi', iconSize: 48, fgSize: 108 },
    { dir: 'mipmap-hdpi', iconSize: 72, fgSize: 162 },
    { dir: 'mipmap-xhdpi', iconSize: 96, fgSize: 216 },
    { dir: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324 },
    { dir: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432 }
  ];

  console.log('Generating Android launcher icons...');

  for (const { dir, iconSize, fgSize } of densities) {
    const targetDir = path.join(resDir, dir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 1. Standard square/rounded launcher icon
    await sharp(svgBuffer)
      .resize(iconSize, iconSize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // 2. Round launcher icon with circular crop
    const circleSvg = Buffer.from(
      `<svg width="${iconSize}" height="${iconSize}"><circle cx="${iconSize/2}" cy="${iconSize/2}" r="${iconSize/2}" fill="white"/></svg>`
    );
    const standardPng = await sharp(svgBuffer).resize(iconSize, iconSize).png().toBuffer();
    await sharp(standardPng)
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // 3. Adaptive icon foreground (centered icon inside padded canvas)
    const innerIconSize = Math.round(fgSize * 0.72);
    const innerIconBuffer = await sharp(svgBuffer).resize(innerIconSize, innerIconSize).png().toBuffer();
    
    // Create empty transparent canvas of size fgSize x fgSize and composite the icon in the center
    await sharp({
      create: {
        width: fgSize,
        height: fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{
        input: innerIconBuffer,
        top: Math.round((fgSize - innerIconSize) / 2),
        left: Math.round((fgSize - innerIconSize) / 2)
      }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`✓ ${dir} generated (${iconSize}x${iconSize}, fg: ${fgSize}x${fgSize})`);
  }

  // Update ic_launcher_background.xml to brand teal color
  const bgXmlPath = path.join(resDir, 'values', 'ic_launcher_background.xml');
  fs.writeFileSync(bgXmlPath, `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0f766e</color>
</resources>
`, 'utf-8');
  console.log('✓ ic_launcher_background.xml set to #0f766e');

  // Update splash screens
  const splashDirs = [
    { dir: 'drawable', w: 480, h: 800 },
    { dir: 'drawable-land-mdpi', w: 480, h: 320 },
    { dir: 'drawable-land-hdpi', w: 800, h: 480 },
    { dir: 'drawable-land-xhdpi', w: 1280, h: 720 },
    { dir: 'drawable-land-xxhdpi', w: 1600, h: 960 },
    { dir: 'drawable-land-xxxhdpi', w: 1920, h: 1080 },
    { dir: 'drawable-port-mdpi', w: 320, h: 480 },
    { dir: 'drawable-port-hdpi', w: 480, h: 800 },
    { dir: 'drawable-port-xhdpi', w: 720, h: 1280 },
    { dir: 'drawable-port-xxhdpi', w: 960, h: 1600 },
    { dir: 'drawable-port-xxxhdpi', w: 1080, h: 1920 }
  ];

  for (const { dir, w, h } of splashDirs) {
    const targetDir = path.join(resDir, dir);
    if (!fs.existsSync(targetDir)) continue;
    const splashFile = path.join(targetDir, 'splash.png');
    
    // Centered logo on clean background
    const logoSize = Math.min(Math.round(Math.min(w, h) * 0.35), 256);
    const logoBuffer = await sharp(svgBuffer).resize(logoSize, logoSize).png().toBuffer();
    
    await sharp({
      create: {
        width: w,
        height: h,
        channels: 4,
        background: { r: 248, g: 250, b: 252, alpha: 1 } // #f8fafc
      }
    })
      .composite([{
        input: logoBuffer,
        top: Math.round((h - logoSize) / 2),
        left: Math.round((w - logoSize) / 2)
      }])
      .png()
      .toFile(splashFile);
  }
  console.log('✓ Splash screens updated with brand logo');
}

generateAndroidIcons().catch(err => {
  console.error('Error generating Android icons:', err);
  process.exit(1);
});
