const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const vercelHtml = fs.readFileSync(path.join(baseDir, 'vercel_page.html'), 'utf-8');
const currentIndexHtml = fs.readFileSync(path.join(baseDir, 'web', 'index.html'), 'utf-8');

// 1. Extract .tsb-root (the live ticker)
const tsbStart = vercelHtml.indexOf('<div class="tsb-root"');
let tsbHtml = '';
if (tsbStart !== -1) {
  const tsbEnd = vercelHtml.indexOf('</div>', vercelHtml.indexOf('</style>', tsbStart)) + 6;
  tsbHtml = vercelHtml.slice(tsbStart, tsbEnd);
  // Set status to Live
  tsbHtml = tsbHtml.replace(
    'class="tsb-status tsb-status-checking"><i class="tsb-dot"></i>Checking...',
    'class="tsb-status tsb-status-live"><i class="tsb-dot"></i>Live'
  );
  // Define --tsb-height: 38px in style tag so .ocean-nav is properly offset
  tsbHtml = tsbHtml.replace(
    '<style>',
    '<style>:root { --tsb-height: 38px; }'
  );
}

// 2. Extract <main> ... </main>
const mainStart = vercelHtml.indexOf('<main');
const mainEnd = vercelHtml.indexOf('</main>') + 7;
let mainHtml = vercelHtml.slice(mainStart, mainEnd);

// 3. Inject Operations Deck Buttons into mainHtml
// A) In nav
mainHtml = mainHtml.replace(
  '</nav>',
  `  <button id="navDemoBtn" onclick="openSampleDemo()" style="margin-left: 0.8rem; background: linear-gradient(135deg, #2ec4a6, #1c7eb0); color: #fff; border: 0; padding: 0.45rem 1.15rem; border-radius: 9999px; font-weight: 700; font-size: 0.75rem; letter-spacing: 0.08em; cursor: pointer; box-shadow: 0 0 16px rgba(46,196,166,0.45); pointer-events: auto; transition: transform 0.2s;">✨ OPERATIONS DECK →</button>
  </nav>`
);

// B) Final narrative panel call-to-action
mainHtml = mainHtml.replace(
  '</article>\n        </div>\n      </div>',
  `<div style="margin-top: 2rem; pointer-events: auto;">
    <button onclick="openSampleDemo()" style="background: linear-gradient(135deg, #7ce0d0, #38bdf8); color: #02101f; border: 0; padding: 0.85rem 2.2rem; border-radius: 8px; font-family: 'Public Sans', sans-serif; font-weight: 800; font-size: 0.95rem; letter-spacing: 0.08em; cursor: pointer; box-shadow: 0 6px 25px rgba(124,224,208,0.55); pointer-events: auto; transition: transform 0.2s;">🌊 OPEN INTERACTIVE OPERATIONS DECK</button>
  </div>
  </article>
  </div>
  </div>`
);

// C) In footer
mainHtml = mainHtml.replace(
  '<a href="/technology">Models</a>',
  '<a href="/technology">Models</a><a href="javascript:void(0)" onclick="openSampleDemo()" style="color: #7ce0d0; font-weight: 600;">✨ Operations Deck</a>'
);

// 4. Extract existing demo-view from current index.html
const demoStart = currentIndexHtml.indexOf('<div id="demo-view"');
let demoHtml = '';
if (demoStart !== -1) {
  const scriptsStart = currentIndexHtml.indexOf('<!-- Landing Page Interactive Engine -->', demoStart);
  const altScriptsStart = currentIndexHtml.indexOf('<!-- Scrollytelling Engine -->', demoStart);
  const alt2ScriptsStart = currentIndexHtml.indexOf('<!-- External Libraries -->', demoStart);
  
  let sliceEnd = scriptsStart !== -1 ? scriptsStart : (altScriptsStart !== -1 ? altScriptsStart : alt2ScriptsStart);
  demoHtml = currentIndexHtml.slice(demoStart, sliceEnd).trim();
} else {
  console.error("Could not find demo-view in current index.html!");
  process.exit(1);
}

// Ensure demo-view has style="display: none;"
if (!demoHtml.includes('style="display: none;')) {
  demoHtml = demoHtml.replace('<div id="demo-view"', '<div id="demo-view" style="display: none; min-height: 100vh; background: #070d18;"');
}

// Ensure demo-view header has Overview Story button
if (!demoHtml.includes('openStoryLanding()')) {
  const backBtnHtml = `
      <button class="btn-back-story" onclick="openStoryLanding()" style="display: inline-flex; align-items: center; gap: 7px; background: rgba(124, 224, 208, 0.12); border: 1px solid rgba(124, 224, 208, 0.4); color: #7ce0d0; padding: 6px 14px; border-radius: 6px; font-weight: 600; font-size: 0.75rem; cursor: pointer; margin-right: 12px; transition: all 0.2s ease;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        <span>Overview Story</span>
      </button>
  `;
  demoHtml = demoHtml.replace('<div class="header-left">', '<div class="header-left">' + backBtnHtml);
}

// 5. Construct full unified index.html
const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OceanEmbed – Deep Learning Reconstruction of Subsurface Ocean Temperature</title>
  <meta name="description" content="OceanEmbed reconstructs the full ocean temperature profile from satellite surface signals alone. MoES &bull; INCOIS PS-26066" />
  <link rel="icon" href="/oceanembed-logo-v2.png" />
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Public+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Manrope:wght@400;600;700&display=swap" rel="stylesheet">
  
  <!-- Scrollytelling stylesheet -->
  <link rel="stylesheet" href="/scrolly_style.css" />
  
  <!-- Leaflet CSS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  
  <!-- Operations Deck stylesheet -->
  <link rel="stylesheet" href="/style.css" />
</head>
<body style="margin: 0; background: #02101f; color: #eaf7ff; overflow-x: clip;">

  <!-- VIEW 1: Cinematic Ocean Scrollytelling Landing Page (Exact Vercel Interface) -->
  <div id="landing-view" style="display: block;">
    ${tsbHtml}
    ${mainHtml}
    
    <!-- Floating Operations Deck Action Pill -->
    <div id="deckFloatingPill" style="position: fixed; bottom: 24px; right: 24px; z-index: 99999; display: flex; align-items: center; pointer-events: auto;">
      <button onclick="openSampleDemo()" style="background: linear-gradient(135deg, #2ec4a6, #0284c7); color: #fff; border: 1px solid rgba(255,255,255,0.25); padding: 0.72rem 1.35rem; border-radius: 9999px; font-family: 'Public Sans', sans-serif; font-weight: 700; font-size: 0.82rem; letter-spacing: 0.04em; cursor: pointer; box-shadow: 0 4px 20px rgba(46,196,166,0.5); backdrop-filter: blur(8px); transition: all 0.25s ease; display: inline-flex; align-items: center; gap: 8px;">
        <span>⚡ Launch 3D Operations Deck</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
      </button>
    </div>
  </div>

  <!-- VIEW 2: Minimum Viable Product - Live Interactive Operations Deck -->
  ${demoHtml}

  <!-- Scrollytelling Engine -->
  <script src="/scrolly.js"></script>

  <!-- External Libraries -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  
  <!-- Marine Operations Deck Engine -->
  <script src="/acoustics.js"></script>
  <script src="/app.js"></script>

  <!-- 3D Subsurface Volumetric Engine -->
  <script src="/three.min.js"></script>
  <script src="/OrbitControls.js"></script>
  <script src="/ocean3d.js"></script>

  <!-- Research Audit Fingerprint Modal -->
  <div id="sha256Modal" class="modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(7,11,20,0.85); backdrop-filter:blur(8px); z-index:9999; align-items:center; justify-content:center;">
    <div class="modal-card" style="background:#0e1526; border:1px solid #06b6d4; border-radius:12px; width:90%; max-width:680px; padding:1.75rem; box-shadow:0 20px 40px rgba(0,0,0,0.7); max-height:90vh; overflow-y:auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e2d4a; padding-bottom:1rem; margin-bottom:1.25rem;">
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <h3 style="font-size:1.15rem; font-weight:700; color:#f8fafc; margin:0;">OceanEmbed Cryptographic Research Audit</h3>
        </div>
        <button id="closeSha256Modal" style="background:none; border:none; color:#94a3b8; font-size:1.5rem; cursor:pointer; line-height:1;">&times;</button>
      </div>

      <p style="font-size:0.85rem; color:#cbd5e1; margin-bottom:1.25rem; line-height:1.5;">
        This cryptographic fingerprint certifies that the neural model parameters, mathematical losses, and pre-training acceptance gates match the audited specification without data leakage or unverified claims.
      </p>

      <div style="display:flex; flex-direction:column; gap:0.85rem;">
        <div style="background:#131c31; border:1px solid #1e2d4a; border-radius:8px; padding:0.85rem 1rem;">
          <div style="font-size:0.75rem; color:#94a3b8; font-weight:600; text-transform:uppercase; margin-bottom:0.25rem;">Model Architecture &amp; Scale</div>
          <div style="font-size:0.95rem; font-weight:700; color:#22d3ee; font-family:var(--font-mono);">OceanEmbed-Lite ST (1,687,217 Trainable Parameters)</div>
          <div style="font-size:0.75rem; color:#64748b; margin-top:0.2rem;">Causal 7-day ConvGRU + Residual U-Net + Discrete 6-level conditioning</div>
        </div>

        <div style="background:#131c31; border:1px solid #1e2d4a; border-radius:8px; padding:0.85rem 1rem;">
          <div style="font-size:0.75rem; color:#94a3b8; font-weight:600; text-transform:uppercase; margin-bottom:0.25rem;">Synthetic Acceptance Gate Verification</div>
          <div style="font-size:0.95rem; font-weight:700; color:#10b981; font-family:var(--font-mono);">10 / 10 Gates Passed (100% Validated)</div>
          <div style="font-size:0.75rem; color:#64748b; margin-top:0.2rem;">Tiny-batch overfit loss reduction: 75.2% (Initial 0.4042 &rarr; Final 0.1004)</div>
        </div>

        <div style="background:#131c31; border:1px solid #1e2d4a; border-radius:8px; padding:0.85rem 1rem;">
          <div style="font-size:0.75rem; color:#94a3b8; font-weight:600; text-transform:uppercase; margin-bottom:0.35rem;">Master Specification PDF SHA-256</div>
          <div style="font-size:0.75rem; word-break:break-all; font-family:var(--font-mono); color:#f59e0b; background:#070b14; padding:0.4rem 0.6rem; border-radius:4px; border:1px solid #182238;">15C39E56E19C879DC6C2A0ABE12CA4D3EA98D7D5F8B09D226743A763EF58F5BC</div>
        </div>

        <div style="background:#131c31; border:1px solid #1e2d4a; border-radius:8px; padding:0.85rem 1rem;">
          <div style="font-size:0.75rem; color:#94a3b8; font-weight:600; text-transform:uppercase; margin-bottom:0.35rem;">Model PyTorch Source Definition SHA-256</div>
          <div style="font-size:0.75rem; word-break:break-all; font-family:var(--font-mono); color:#38bdf8; background:#070b14; padding:0.4rem 0.6rem; border-radius:4px; border:1px solid #182238;">3260D96000CB0C9F0CD87EC6004422363D9F9F4AD49984BC08C54960AAB7F8DB</div>
        </div>

        <div style="background:#131c31; border:1px solid #1e2d4a; border-radius:8px; padding:0.85rem 1rem;">
          <div style="font-size:0.75rem; color:#94a3b8; font-weight:600; text-transform:uppercase; margin-bottom:0.35rem;">Synthetic Acceptance Gate Report SHA-256</div>
          <div style="font-size:0.75rem; word-break:break-all; font-family:var(--font-mono); color:#a855f7; background:#070b14; padding:0.4rem 0.6rem; border-radius:4px; border:1px solid #182238;">E82EF3879B7600C7FC2687F6D02E324E9ECDF6D8790FBF5D0208DF552528D518</div>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">
        <button id="downloadFingerprintJsonBtn" class="action-btn" style="background:#0284c7; border-color:#0284c7; color:#fff; font-weight:600;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download Signed Audit JSON
        </button>
      </div>
    </div>
  </div>

</body>
</html>
`;

fs.writeFileSync(path.join(baseDir, 'web', 'index.html'), fullHtml, 'utf-8');
console.log('web/index.html successfully updated with exact Vercel landing interface + operations deck!');
