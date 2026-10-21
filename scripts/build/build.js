const fs = require('fs');
const path = require('path');

console.log('=== Starting OceanEmbed Production Build ===');
// Script is in scripts/build/ -> project root is 2 levels up
const rootDir = path.resolve(__dirname, '../..');
const distDir = path.join(rootDir, 'dist');
const webDir = path.join(rootDir, 'web');
const apiDir = path.join(rootDir, 'api');
const dataDir = path.join(rootDir, 'data');
const specsDir = path.join(rootDir, 'docs', 'specifications');

try {
  fs.mkdirSync(distDir, { recursive: true });
  fs.mkdirSync(path.join(distDir, 'api'), { recursive: true });
  fs.mkdirSync(path.join(distDir, 'data'), { recursive: true });

  function copySafe(src, dst) {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
      console.log('Copied ' + path.relative(rootDir, src) + ' -> ' + path.relative(rootDir, dst));
    } else {
      console.warn('Warning: Source file not found: ' + src);
    }
  }

  function copyDir(srcDir, dstDir, filterExt = null) {
    if (!fs.existsSync(srcDir)) return;
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        if (!filterExt || entry.name.endsWith(filterExt)) {
          copySafe(path.join(srcDir, entry.name), path.join(dstDir, entry.name));
        }
      }
    }
  }

  // 1. Core Web Assets
  const assets = [
    'index.html',
    'style.css',
    'app.js',
    'acoustics.js',
    'landing.css',
    'landing.js',
    'scrolly.js',
    'scrolly_style.css',
    'oceanembed-logo-v2.png',
    'three.min.js',
    'OrbitControls.js',
    'ocean3d.js',
    'indo_pacific_study_domain.jpg'
  ];

  for (const asset of assets) {
    const src = path.join(webDir, asset);
    copySafe(src, path.join(distDir, asset));
  }

  // 2. Pre-computed API payloads (JSON, GeoJSON, Bulletin HTML)
  copyDir(apiDir, path.join(distDir, 'api'));

  // 3. Pre-computed day data files (*.json)
  copyDir(dataDir, path.join(distDir, 'data'), '.json');

  // 4. Documentation PDF for live downloads
  copySafe(
    path.join(specsDir, 'OceanEmbed_Mathematical_and_Data_Specifications.pdf'),
    path.join(distDir, 'OceanEmbed_Mathematical_and_Data_Specifications.pdf')
  );

  // 5. Netlify / Static Host Redirects
  const redirectsDist = path.join(distDir, '_redirects');
  const redirectsContent = `/api/metadata /api/metadata.json 200
/api/argo/matchups /api/argo_matchups.json 200
/api/export/geojson /api/hazard_perimeter.geojson 200
/api/bulletin /api/bulletin.html 200
/* /index.html 200
`;
  fs.writeFileSync(redirectsDist, redirectsContent, 'utf-8');
  fs.writeFileSync(path.join(rootDir, '_redirects'), redirectsContent, 'utf-8');

  // 6. Pure headers for dist netlify.toml (no build command to avoid recursive drop loops)
  const distToml = `[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "/*.json"
  [headers.values]
    Content-Type = "application/json"
    Cache-Control = "public, max-age=86400"
`;
  fs.writeFileSync(path.join(distDir, 'netlify.toml'), distToml, 'utf-8');

  console.log('=== Production Build Completed Successfully! ===');
  process.exit(0);
} catch (e) {
  console.error('Build error:', e.message);
  process.exit(1);
}
