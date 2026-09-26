const fs = require('fs');
const { createCanvas } = (() => {
  try { return require('canvas'); } catch { return { createCanvas: null }; }
})();

// Generate PNG from SVG using a Node.js script approach
// Since we may not have canvas, we'll create a valid 512x512 PNG manually 
// using a minimal approach: write raw SVG into an HTML, or just create the PNG via sharp

async function main() {
  // Try using sharp first (most reliable)
  try {
    const sharp = require('sharp');
    const svgBuffer = fs.readFileSync('./icon.svg');
    
    // 512x512 PNG
    await sharp(svgBuffer).resize(512, 512).png().toFile('./icon.png');
    console.log('icon.png (512x512) created');
    
    // 256x256 for ICO (Windows uses 256x256 max in ICO)
    const ico256 = await sharp(svgBuffer).resize(256, 256).png().toBuffer();
    const ico48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
    const ico32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
    const ico16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
    
    // Build a minimal ICO file
    const images = [ico16, ico32, ico48, ico256];
    const icoBuffer = buildIco(images, [16, 32, 48, 256]);
    fs.writeFileSync('./icon.ico', icoBuffer);
    console.log('icon.ico created');
    return;
  } catch (e) {
    console.log('sharp not available:', e.message);
  }
  
  console.log('Please install sharp: npm install sharp');
  console.log('Then re-run: node generate-icons.js');
}

function buildIco(pngBuffers, sizes) {
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * numImages;
  
  let offset = headerSize + dirSize;
  const entries = [];
  
  for (let i = 0; i < numImages; i++) {
    const size = sizes[i] >= 256 ? 0 : sizes[i]; // 0 means 256 in ICO spec
    entries.push({
      width: size,
      height: size,
      dataSize: pngBuffers[i].length,
      offset: offset
    });
    offset += pngBuffers[i].length;
  }
  
  const totalSize = offset;
  const buffer = Buffer.alloc(totalSize);
  
  // ICO Header
  buffer.writeUInt16LE(0, 0);       // Reserved
  buffer.writeUInt16LE(1, 2);       // Type: 1 = ICO
  buffer.writeUInt16LE(numImages, 4); // Number of images
  
  // Directory entries
  for (let i = 0; i < numImages; i++) {
    const pos = headerSize + i * dirEntrySize;
    buffer.writeUInt8(entries[i].width, pos);      // Width
    buffer.writeUInt8(entries[i].height, pos + 1);  // Height
    buffer.writeUInt8(0, pos + 2);                  // Color palette
    buffer.writeUInt8(0, pos + 3);                  // Reserved
    buffer.writeUInt16LE(1, pos + 4);               // Color planes
    buffer.writeUInt16LE(32, pos + 6);              // Bits per pixel
    buffer.writeUInt32LE(entries[i].dataSize, pos + 8);  // Image data size
    buffer.writeUInt32LE(entries[i].offset, pos + 12);   // Image data offset
  }
  
  // Image data
  for (let i = 0; i < numImages; i++) {
    pngBuffers[i].copy(buffer, entries[i].offset);
  }
  
  return buffer;
}

main();
