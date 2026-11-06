const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const distDir = path.join(rootDir, 'dist');
const htmlFile = path.join(distDir, 'index.html');

const html = fs.readFileSync(htmlFile, 'utf-8');
const regex = /(?:src|href)=["']([^"':#]+)["']/g;
let match;
const localAssets = new Set();

while ((match = regex.exec(html)) !== null) {
  const asset = match[1];
  if (!asset.startsWith('http') && !asset.startsWith('data:') && !asset.startsWith('mailto:')) {
    localAssets.add(asset);
  }
}

console.log('=== Verifying Local Assets in dist/ ===');
let missingCount = 0;

for (const asset of localAssets) {
  // Strip leading slash if present
  const cleanAsset = asset.startsWith('/') ? asset.slice(1) : asset;
  const filePath = path.join(distDir, cleanAsset);
  const exists = fs.existsSync(filePath);
  console.log(`[${exists ? 'OK' : 'MISSING'}] ${asset} -> ${path.relative(rootDir, filePath)}`);
  if (!exists) missingCount++;
}

console.log(`=== Verification Complete: ${missingCount} missing assets ===`);
process.exit(missingCount > 0 ? 1 : 0);
