const http = require('http');
const fs = require('fs');
const path = require('path');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.geojson': 'application/geo+json; charset=utf-8'
};

const rootDir = path.resolve(__dirname, '../..');
const distDir = path.join(rootDir, 'dist');
const PORT = 8080;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  let cleanUrl = req.url.split('?')[0].split('#')[0];
  if (cleanUrl === '/') cleanUrl = '/index.html';

  let filePath = path.join(distDir, cleanUrl);

  // If path doesn't exist, check without leading /static if present or fallback
  if (!fs.existsSync(filePath)) {
    if (cleanUrl.startsWith('/static/')) {
      const altPath = path.join(distDir, cleanUrl.replace('/static/', '/'));
      if (fs.existsSync(altPath)) filePath = altPath;
    }
  }

  // Handle _redirects routes
  const redirectsMap = {
    '/api/metadata': path.join(distDir, 'api', 'metadata.json'),
    '/api/argo/matchups': path.join(distDir, 'api', 'argo_matchups.json'),
    '/api/export/geojson': path.join(distDir, 'api', 'hazard_perimeter.geojson'),
    '/api/bulletin': path.join(distDir, 'api', 'bulletin.html')
  };
  if (redirectsMap[cleanUrl] && fs.existsSync(redirectsMap[cleanUrl])) {
    filePath = redirectsMap[cleanUrl];
  }

  // Check for extensionless files (.html, .json)
  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (fs.existsSync(filePath + '.json')) {
      filePath = filePath + '.json';
    }
  }

  // Fallback to index.html for SPA routes
  if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = mime[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`OceanEmbed Production Localhost running at: http://localhost:${PORT}`);
});
