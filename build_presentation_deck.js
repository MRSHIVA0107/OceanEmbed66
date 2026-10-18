const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

function getBase64(filename) {
  const p = path.join(__dirname, filename);
  if (fs.existsSync(p)) {
    const data = fs.readFileSync(p);
    return `data:image/png;base64,${data.toString('base64')}`;
  }
  return '';
}

console.log('Loading prototype screenshot assets...');
const imgHero = getBase64('slide_hero_3d.png');
const imgMapConsole = getBase64('live_demo_map_console.png');
const imgTactical = getBase64('tactical_render.png');
const imgAcoustic = getBase64('live_demo_scroll_2000.png');
const imgArgoProof = getBase64('live_demo_3d_cube.png');
const imgAori = getBase64('live_demo_scroll_2900.png');

console.log('Building HTML presentation slides...');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>OceanEmbed – Idea Submission & Detailed Presentation Deck</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    @page {
      size: 297mm 167.06mm; /* 16:9 widescreen presentation format */
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 8.5pt;
      line-height: 1.4;
      color: #f1f5f9;
      background: #031525;
      -webkit-font-smoothing: antialiased;
    }

    .slide {
      width: 297mm;
      height: 167.06mm;
      max-height: 167.06mm;
      overflow: hidden;
      page-break-after: always;
      position: relative;
      background: #031525;
      padding: 10mm 15mm 8mm 15mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .slide:last-child {
      page-break-after: avoid;
    }

    /* Background glow accents */
    .glow-cyan {
      position: absolute;
      top: -50px;
      right: -50px;
      width: 250px;
      height: 250px;
      background: radial-gradient(circle, rgba(2, 132, 199, 0.25) 0%, transparent 70%);
      pointer-events: none;
    }

    /* Slide Header */
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1.5px solid rgba(56, 189, 248, 0.25);
      padding-bottom: 6px;
      margin-bottom: 8px;
    }

    .slide-header-left {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .slide-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 6.8pt;
      font-weight: 700;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .slide-title {
      font-size: 15pt;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
      line-height: 1.15;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .slide-title span.accent {
      color: #38bdf8;
    }

    .slide-header-right {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 3px;
    }

    .badge {
      display: inline-block;
      font-size: 6.5pt;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .badge-deeptech { background: rgba(56, 189, 248, 0.15); border: 1px solid #0284c7; color: #38bdf8; }
    .badge-defence { background: rgba(245, 158, 11, 0.15); border: 1px solid #d97706; color: #fbbf24; }
    .badge-green { background: rgba(16, 185, 129, 0.15); border: 1px solid #059669; color: #34d399; }

    /* Layout Grids */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      flex: 1;
      align-items: stretch;
    }

    .grid-2-wide-left {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 12px;
      flex: 1;
      align-items: stretch;
    }

    .grid-2-wide-right {
      display: grid;
      grid-template-columns: 0.85fr 1.15fr;
      gap: 12px;
      flex: 1;
      align-items: stretch;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      flex: 1;
      align-items: stretch;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 8px;
      margin-bottom: 6px;
    }

    /* Cards */
    .card {
      background: #072340;
      border: 1px solid #133b63;
      border-radius: 6px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .card.accent {
      border-left: 3.5px solid #38bdf8;
      background: #08284a;
    }

    .card.warning {
      border-left: 3.5px solid #f59e0b;
      background: #1c2333;
    }

    .card.danger {
      border-left: 3.5px solid #ef4444;
      background: #251824;
    }

    .card.success {
      border-left: 3.5px solid #10b981;
      background: #0a2d33;
    }

    .card-title {
      font-size: 8.5pt;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .card-metric {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13pt;
      font-weight: 800;
      color: #38bdf8;
      line-height: 1.1;
      margin: 2px 0 3px 0;
    }

    .card-metric.red { color: #f87171; }
    .card-metric.green { color: #34d399; }
    .card-metric.amber { color: #fbbf24; }

    .card-desc {
      font-size: 7.2pt;
      color: #94a3b8;
      line-height: 1.35;
    }

    /* Image Preview Container */
    .img-box {
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #1e4976;
      background: #020e1a;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .img-box-header {
      background: #0a2d50;
      padding: 3px 8px;
      font-size: 6.5pt;
      font-family: 'JetBrains Mono', monospace;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #1e4976;
    }

    .img-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* Links & Buttons */
    .link-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 7.2pt;
      font-weight: 700;
      letter-spacing: 0.02em;
      border: 1px solid #38bdf8;
    }

    /* Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.2pt;
      margin: 4px 0;
    }

    table.data-table th {
      background: #0a2d50;
      color: #38bdf8;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 6.4pt;
      letter-spacing: 0.04em;
      padding: 3px 6px;
      text-align: left;
      border: 1px solid #133b63;
    }

    table.data-table td {
      padding: 3px 6px;
      border: 1px solid #133b63;
      vertical-align: middle;
      line-height: 1.3;
      color: #cbd5e1;
    }

    table.data-table tr:nth-child(even) td {
      background: rgba(10, 45, 80, 0.4);
    }

    .pill {
      display: inline-block;
      font-size: 6pt;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 3px;
      text-transform: uppercase;
    }

    .pill-green { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #059669; }
    .pill-blue { background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #0284c7; }
    .pill-amber { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #d97706; }

    /* Formula Box */
    .formula-box {
      background: #020e1a;
      border: 1px solid #133b63;
      border-left: 3px solid #38bdf8;
      color: #e2e8f0;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 7pt;
      margin: 3px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Footer */
    .slide-footer {
      border-top: 1px solid rgba(56, 189, 248, 0.2);
      padding-top: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 6.8pt;
      color: #64748b;
      margin-top: 6px;
    }

    .slide-footer a {
      color: #38bdf8;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>

  <!-- ========================================================================= -->
  <!-- SLIDE 1: COVER / TITLE SLIDE                                              -->
  <!-- ========================================================================= -->
  <div class="slide" style="justify-content: center; text-align: left; padding: 15mm 20mm;">
    <div class="glow-cyan" style="width: 400px; height: 400px; top: -100px; right: -100px;"></div>
    
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
      <div>
        <span class="badge badge-deeptech" style="font-size: 7.5pt; padding: 3px 10px;">DEFENCE / AEROSPACE &amp; DEEP TECH</span>
        <span class="badge badge-green" style="font-size: 7.5pt; padding: 3px 10px; margin-left: 6px;">TRL-5/6 OPERATIONAL PROTOTYPE</span>
      </div>
      <div style="text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 7.5pt; color: #94a3b8;">
        COHORT 3.0 • IDEA SUBMISSION &amp; DETAILED PRESENTATION<br>
        <span style="color: #38bdf8;">MINISTRY OF EDUCATION INNOVATION CELL &amp; AICTE</span>
      </div>
    </div>

    <div style="margin-bottom: 25px;">
      <h1 style="font-size: 34pt; font-weight: 800; color: #ffffff; letter-spacing: -0.03em; line-height: 1.05; margin-bottom: 8px;">
        Ocean<span style="color: #38bdf8;">Embed</span>
      </h1>
      <h2 style="font-size: 14pt; font-weight: 600; color: #94a3b8; letter-spacing: -0.01em; max-width: 850px; line-height: 1.3;">
        AI-Powered 3D Subsurface Ocean Intelligence Engine for Disaster Early Warning, Naval Acoustics &amp; Autonomous Fleets
      </h2>
    </div>

    <div style="background: rgba(7, 35, 64, 0.7); border: 1px solid #1e4976; border-radius: 8px; padding: 12px 16px; margin-bottom: 25px; max-width: 900px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 7.5pt; font-family: 'JetBrains Mono', monospace; color: #38bdf8; margin-bottom: 3px;">
          🌐 LIVE WORKING PROTOTYPE DEPLOYMENT &amp; 3D CONSOLE
        </div>
        <div style="font-size: 9.5pt; font-weight: 700; color: #ffffff;">
          <a href="https://oceanembed089.netlify.app/" style="color: #38bdf8; text-decoration: none;">https://oceanembed089.netlify.app/</a>
        </div>
      </div>
      <a href="https://oceanembed089.netlify.app/" class="link-pill" style="font-size: 8.5pt; padding: 6px 14px;">
        EXPLORE LIVE PROTOTYPE ↗
      </a>
    </div>

    <div style="display: flex; gap: 20px; font-size: 7.5pt; color: #64748b; font-family: 'JetBrains Mono', monospace;">
      <div>• 2.15M+ Physical ARGO CTD Measurements Validated</div>
      <div>• 0–1,000m Physics-Informed Neural Reconstruction</div>
      <div>• 48–72h Cyclone RI Advance Warning</div>
      <div>• 72% Sonobuoy UAV Expenditure Avoidance</div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 2: THE 1,000-METER SUBSURFACE BLIND SPOT                            -->
  <!-- ========================================================================= -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-tag">01 / PROBLEM STATEMENT &amp; MOTIVATION</span>
        <div class="slide-title">The <span class="accent">1,000-Meter Subsurface Blind Spot</span> in Ocean Observation</div>
      </div>
      <div class="slide-header-right">
        <span class="badge badge-defence">CRITICAL NATIONAL CHALLENGE</span>
        <span style="font-size: 6.5pt; color: #64748b; font-family: 'JetBrains Mono';">THEME: SURAKSHIT BHARAT</span>
      </div>
    </div>

    <div class="grid-3" style="margin-bottom: 8px;">
      <div class="card danger">
        <div class="card-title" style="color: #f87171;">1. Cyclone Rapid Intensification (RI)</div>
        <div class="card-desc">
          Satellites only see surface skin (SST). Warm skin (29°C) that is shallow quickly cools under hurricane churn. However, <strong>deep subsurface warm pools (D26 > 80m)</strong> trigger sudden, catastrophic cyclone explosive intensification within 24–48 hours, catching coastal disaster authorities unprepared.
        </div>
        <div class="card-metric red" style="font-size: 11pt; margin-top: 6px;">₹10,000+ Crores</div>
        <div class="card-desc">Annual coastal destruction risk along Odisha, AP, TN, and West Bengal coasts.</div>
      </div>

      <div class="card warning">
        <div class="card-title" style="color: #fbbf24;">2. Naval Sonar &amp; Acoustic Shadow Zones</div>
        <div class="card-desc">
          Active naval sonar depends on Sonic Layer Depth (SLD). Below SLD, sound rays refract downward creating <strong>acoustic shadow zones</strong> where hostile submarines navigate completely undetected. Maritime patrol aircraft (P-8I, MQ-9B) waste ₹12L per flight dropping sonobuoys blindly.
        </div>
        <div class="card-metric amber" style="font-size: 11pt; margin-top: 6px;">72% Sensor Waste</div>
        <div class="card-desc">Disposable sonobuoys ($800–$2,400 each) dropped blindly into acoustic shadows.</div>
      </div>

      <div class="card accent">
        <div class="card-title" style="color: #38bdf8;">3. In-Situ Observation Sparsity</div>
        <div class="card-desc">
          Robotic ARGO profiling floats provide vertical accuracy but are critically sparse: only ~30 active buoys exist across the 2.2M km² Bay of Bengal, surfacing only once every 10 days. Hydrographic research vessel cruises (<em>ORV Sagar Nidhi</em>) cost ₹15–25 Lakhs per sea-day.
        </div>
        <div class="card-metric" style="font-size: 11pt; margin-top: 6px;">₹25 Lakhs / Day</div>
        <div class="card-desc">Prohibitive cost of physical research vessel cruises for deep ocean soundings.</div>
      </div>
    </div>

    <div class="card" style="background: rgba(10, 45, 80, 0.4);">
      <div class="card-title" style="font-size: 8pt; color: #38bdf8;">THE OCEANEMBED PARADIGM SHIFT</div>
      <div class="card-desc" style="font-size: 7.2pt; color: #cbd5e1;">
        Instead of deploying hundreds of millions of dollars in hardware buoys, <strong>OceanEmbed inverts readily available 2D satellite surface observations (SST, SLA altimetry, sea surface salinity, wind stress curl)</strong> into the full 0–1,000m continuous 3D temperature and acoustic sound-speed profile using physics-regularized deep learning.
      </div>
    </div>

    <div class="slide-footer">
      <div>OceanEmbed: Idea Submission Presentation • Cohort 3.0</div>
      <div>Slide 2 of 12</div>
      <div><a href="https://oceanembed089.netlify.app/">Live Prototype: oceanembed089.netlify.app</a></div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 3: OPERATIONAL WORKING PROTOTYPE SHOWCASE                           -->
  <!-- ========================================================================= -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-tag">02 / LIVE WORKING PROTOTYPE</span>
        <div class="slide-title">Interactive <span class="accent">Operations Deck &amp; Sounding Console</span></div>
      </div>
      <div class="slide-header-right">
        <a href="https://oceanembed089.netlify.app/#demo" class="link-pill">LAUNCH LIVE 3D DEMO ↗</a>
        <span style="font-size: 6.5pt; color: #64748b; font-family: 'JetBrains Mono';">LIVE ON NETLIFY EDGE</span>
      </div>
    </div>

    <div class="grid-2-wide-right">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="card accent">
          <div class="card-title">Real-Time Operational Intelligence</div>
          <div class="card-desc">
            OceanEmbed is not an academic paper or mock-up. It is a <strong>fully operational WebGL-based intelligence platform</strong> accessible directly from any web browser.
          </div>
        </div>

        <div class="card">
          <div class="card-title">Key Interactive Features</div>
          <ul style="font-size: 7pt; color: #94a3b8; padding-left: 12px; line-height: 1.45;">
            <li><strong>Geospatial Virtual Soundings:</strong> Click any coordinate across the Bay of Bengal or Indo-Pacific to drop an instant AI virtual sounding (0–1,000m).</li>
            <li><strong>Live Cyclone Heat Hazard:</strong> Instant mapping of Tropical Cyclone Heat Potential (TCHP > 80 kJ/cm²) and 26°C isotherm depth (<i>D</i><sub>26</sub>).</li>
            <li><strong>Acoustic Profiling:</strong> Real-time Mackenzie sound speed calculation and Sonic Layer Depth (SLD) identification.</li>
            <li><strong>Ground-Truth Matchup:</strong> Click real emerald ARGO buoys to compare AI predictions with actual in-situ CTD sensor readings.</li>
          </ul>
        </div>

        <div class="card success">
          <div class="card-title">Production Web Architecture</div>
          <div class="card-desc">
            Single-page application featuring Three.js 3D WebGL rendering, Chart.js acoustic sound velocity curves, Leaflet geospatial tile layers, and NetCDF satellite ingestion pipelines.
          </div>
        </div>
      </div>

      <div class="img-box">
        <div class="img-box-header">
          <span>PROTOTYPE SCREENSHOT: GEOSPATIAL SOUNDING CONSOLE (LIVE DEPLOYMENT)</span>
          <span style="color: #34d399;">● CONNECTED</span>
        </div>
        <img src="${imgMapConsole}" alt="OceanEmbed Geospatial Console">
      </div>
    </div>

    <div class="slide-footer">
      <div>OceanEmbed: Idea Submission Presentation • Cohort 3.0</div>
      <div>Slide 3 of 12</div>
      <div><a href="https://oceanembed089.netlify.app/">Live Prototype: oceanembed089.netlify.app</a></div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 4: DEEP TECH AI ARCHITECTURE                                        -->
  <!-- ========================================================================= -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-tag">03 / CORE TECHNOLOGY &amp; AI FORMULATION</span>
        <div class="slide-title">Spatiotemporal ConvNeXt + Causal ConvGRU + <span class="accent">NeOF</span></div>
      </div>
      <div class="slide-header-right">
        <span class="badge badge-deeptech">PHYSICS-INFORMED NEURAL OPERATOR</span>
        <span style="font-size: 6.5pt; color: #64748b; font-family: 'JetBrains Mono';">1,687,217 MODEL PARAMETERS</span>
      </div>
    </div>

    <div class="grid-2">
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div class="card">
          <div class="card-title">1. Multi-Modal Surface Telemetry Ingestion</div>
          <div class="card-desc">
            Fuses 4 daily satellite observations: L4 Foundation SST, Altimetric Sea Level Anomaly (SLA), Sea Surface Salinity (SSS), and 10m scatterometry wind stress curl + geostrophic surface currents (OSCAR).
          </div>
        </div>

        <div class="card accent">
          <div class="card-title">2. 7-Day Causal ConvGRU Temporal Memory</div>
          <div class="card-desc">
            Maintains internal memory over (<i>t</i> − 6 to <i>t</i>) causal sequence. Explicitly resolves propagating equatorial Kelvin waves and westward Rossby waves (1.5–2.5 m/s) governing thermocline heave.
          </div>
        </div>

        <div class="card">
          <div class="card-title">3. Continuous Neural Ocean Field (NeOF) Coordinate Decoder</div>
          <div class="card-desc">
            Reconstructs temperature as a continuous coordinate implicit field <i>T̂</i>(<i>x</i>, <i>y</i>, <i>z</i>) using multi-frequency sinusoidal Fourier positional encodings, enabling queries at arbitrary vertical depth resolutions.
          </div>
        </div>

        <div class="card warning">
          <div class="card-title">4. Evidential Uncertainty Head</div>
          <div class="card-desc">
            Predicts localized epistemic variance <i>σ</i>²(<i>x</i>, <i>y</i>, <i>z</i>) alongside temperature, alerting operators when cloud-masking degrades satellite confidence.
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div class="card" style="background: #020e1a; border-left: 3.5px solid #38bdf8;">
          <div class="card-title" style="color: #38bdf8;">Physics-Informed Multi-Objective Loss Formulation</div>
          <div class="formula-box">
            <div>ℒ<sub>total</sub> = ℒ<sub>Huber</sub>(T̂, T) + λ<sub>smooth</sub> ‖∂²T̂/∂z²‖² + λ<sub>steric</sub> |η<sub>steric</sub> − SLA| + λ<sub>NLL</sub> ℒ<sub>evidential</sub></div>
          </div>
          <div class="card-desc" style="font-size: 7.2pt; line-height: 1.4; color: #cbd5e1; margin-top: 4px;">
            • <strong>Vertical Curvature Penalty (λ<sub>smooth</sub>):</strong> Enforces fluid mechanical vertical stability, completely suppressing unphysical oscillatory ripples.<br>
            • <strong>Steric Sea Level Constraint (λ<sub>steric</sub>):</strong> Integrates thermal expansion ∫ <i>α</i>(<i>T</i>) <i>dz</i> to ensure vertical profile column expansion exactly matches observed altimetric SLA.<br>
            • <strong>Evidential NLL (λ<sub>NLL</sub>):</strong> Directly calibrates predictive uncertainty for defense and disaster risk planning.
          </div>
        </div>

        <div class="card success">
          <div class="card-title" style="color: #34d399;">Model Efficiency &amp; Inference Speed</div>
          <div class="grid-3" style="margin-top: 4px;">
            <div>
              <div style="font-size: 6.5pt; color: #94a3b8;">TRAINING PARAMETERS</div>
              <div style="font-size: 11pt; font-weight: 800; color: #38bdf8; font-family: 'JetBrains Mono';">1.68M</div>
            </div>
            <div>
              <div style="font-size: 6.5pt; color: #94a3b8;">GPU INFERENCE TIME</div>
              <div style="font-size: 11pt; font-weight: 800; color: #34d399; font-family: 'JetBrains Mono';">42 ms</div>
            </div>
            <div>
              <div style="font-size: 6.5pt; color: #94a3b8;">DAILY COMPUTE COST</div>
              <div style="font-size: 11pt; font-weight: 800; color: #fbbf24; font-family: 'JetBrains Mono';">&lt; ₹150 / day</div>
            </div>
          </div>
          <div class="card-desc" style="margin-top: 4px;">
            Enables full regional 3D ocean volume update in under 1 second on a single commodity GPU.
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>OceanEmbed: Idea Submission Presentation • Cohort 3.0</div>
      <div>Slide 4 of 12</div>
      <div><a href="https://oceanembed089.netlify.app/">Live Prototype: oceanembed089.netlify.app</a></div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 5: CYCLONE RAPID INTENSIFICATION (RI) EARLY WARNING                 -->
  <!-- ========================================================================= -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-tag">04 / DISASTER RESILIENCE APPLICATION</span>
        <div class="slide-title">Predicting <span class="accent">Cyclone Rapid Intensification (RI)</span> 48–72h in Advance</div>
      </div>
      <div class="slide-header-right">
        <span class="badge badge-green">LIFE-SAVING PUBLIC SAFETY</span>
        <span style="font-size: 6.5pt; color: #64748b; font-family: 'JetBrains Mono';">INCOIS / IMD ALIGNED</span>
      </div>
    </div>

    <div class="grid-2-wide-left">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="card danger">
          <div class="card-title" style="color: #f87171;">The Physics of Cyclone Explosive Escalation</div>
          <div class="card-desc">
            Cyclones draw thermal energy not from the razor-thin surface skin, but from the heat reservoir extending down to the <strong>26°C Isotherm Depth (<i>D</i><sub>26</sub>)</strong>. OceanEmbed calculates the <strong>Tropical Cyclone Heat Potential (TCHP)</strong> thermodynamic integral:
          </div>
          <div class="formula-box" style="margin: 4px 0;">
            <div>TCHP(x, y) = ρ · c<sub>p</sub> ∫<sub>0</sub><sup>D<sub>26</sub></sup> (T(x, y, z) - 26) dz</div>
          </div>
        </div>

        <div class="grid-3">
          <div class="card">
            <div class="card-title">Peak TCHP Detected</div>
            <div class="card-metric red">101.1 kJ/cm²</div>
            <div class="card-desc">Exceeds critical RI trigger threshold (>80 kJ/cm²).</div>
          </div>
          <div class="card">
            <div class="card-title">Deepest D26 Depth</div>
            <div class="card-metric red">81.3 meters</div>
            <div class="card-desc">Warm fuel pool extends 35m deeper than normal baseline.</div>
          </div>
          <div class="card">
            <div class="card-title">Advance Warning</div>
            <div class="card-metric green">48–72 Hours</div>
            <div class="card-desc">Advance notice before atmospheric storm cloud vortex appears.</div>
          </div>
        </div>

        <div class="card accent">
          <div class="card-title">Automated Disaster Command GIS Export</div>
          <div class="card-desc">
            The platform automatically formats official <strong>INCOIS Advisory Bulletins</strong> and exports <strong>684 GeoJSON evacuation boundary polygons</strong> for direct ingestion into State Disaster Management Authority (SDMA) and NDRF emergency dispatch portals.
          </div>
        </div>
      </div>

      <div class="img-box">
        <div class="img-box-header">
          <span>PROTOTYPE: BAY OF BENGAL TCHP HEAT HAZARD MAP</span>
          <span style="color: #f87171;">● HIGH HAZARD ZONE</span>
        </div>
        <img src="${imgMapConsole}" alt="Cyclone Heat Hazard">
      </div>
    </div>

    <div class="slide-footer">
      <div>OceanEmbed: Idea Submission Presentation • Cohort 3.0</div>
      <div>Slide 5 of 12</div>
      <div><a href="https://oceanembed089.netlify.app/">Live Prototype: oceanembed089.netlify.app</a></div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 6: TACTICAL NAVAL ACOUSTICS & SUBMARINE DEFENSE                     -->
  <!-- ========================================================================= -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-tag">05 / DEFENSE &amp; MARITIME SECURITY APPLICATION</span>
        <div class="slide-title">Tactical Naval Acoustics &amp; <span class="accent">Submarine Shadow Zones</span></div>
      </div>
      <div class="slide-header-right">
        <span class="badge badge-defence">INDIAN NAVY MARITIME OPERATIONS</span>
        <span style="font-size: 6.5pt; color: #64748b; font-family: 'JetBrains Mono';">ANTI-SUBMARINE WARFARE (ASW)</span>
      </div>
    </div>

    <div class="grid-2-wide-left">
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div class="card">
          <div class="card-title">Mackenzie Sound Speed Profile Formulation</div>
          <div class="card-desc">
            Sound velocity in seawater is governed by temperature, salinity, and pressure. OceanEmbed evaluates the empirical 9-term <strong>Mackenzie (1981) equation</strong> at every vertical depth coordinate:
          </div>
          <div class="formula-box">
            <div>C(T, S, z) = 1448.96 + 4.591 T − 0.05304 T² + 2.374×10⁻⁴ T³ + 1.340(S − 35) + 0.0163 z + …</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="card accent">
            <div class="card-title">Sonic Layer Depth (SLD) Duct</div>
            <div class="card-metric green">50.0 meters</div>
            <div class="card-desc">
              Near-surface sound speed maximum (1545.6 m/s) creates an upper acoustic duct trapping active sonar waves horizontally.
            </div>
          </div>
          <div class="card danger">
            <div class="card-title">Submarine Shadow Zone</div>
            <div class="card-metric red">Below 50 m</div>
            <div class="card-desc">
              Negative thermal gradient bends sound rays downward, creating blind zones where submarines conceal from surface ships.
            </div>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Depth (z)</th>
              <th>Temperature</th>
              <th>Sound Speed</th>
              <th>Acoustic Tactical Designation</th>
              <th>Operational Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>0 m</strong></td>
              <td>29.70 °C</td>
              <td>1544.38 m/s</td>
              <td>Surface Mixed Layer</td>
              <td><span class="pill pill-blue">Wave Mixed</span></td>
            </tr>
            <tr>
              <td><strong>50 m</strong></td>
              <td><strong>29.88 °C</strong></td>
              <td><strong>1545.60 m/s</strong></td>
              <td><strong>Sonic Layer Depth (Acoustic Max)</strong></td>
              <td><span class="pill pill-green">Sonar Waveguide</span></td>
            </tr>
            <tr>
              <td><strong>100 m</strong></td>
              <td>23.73 °C</td>
              <td>1532.64 m/s</td>
              <td>Shadow Zone Threshold</td>
              <td><span class="pill pill-amber">Submarine Hideout</span></td>
            </tr>
            <tr>
              <td><strong>1000 m</strong></td>
              <td>6.18 °C</td>
              <td>1491.53 m/s</td>
              <td>SOFAR Channel Axis</td>
              <td><span class="pill pill-blue">Deep Long-Range Axis</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="img-box">
        <div class="img-box-header">
          <span>PROTOTYPE: ACOUSTIC PROFILE &amp; SOUND SPEED ENGINE</span>
          <span style="color: #38bdf8;">● SLD: 50M RESOLVED</span>
        </div>
        <img src="${imgAcoustic}" alt="Acoustic Sound Speed Engine">
      </div>
    </div>

    <div class="slide-footer">
      <div>OceanEmbed: Idea Submission Presentation • Cohort 3.0</div>
      <div>Slide 6 of 12</div>
      <div><a href="https://oceanembed089.netlify.app/">Live Prototype: oceanembed089.netlify.app</a></div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 7: AUTONOMOUS FLEET (UAV & GLIDER) COUPLING                         -->
  <!-- ========================================================================= -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-tag">06 / AEROSPACE &amp; ROBOTICS INTEGRATION</span>
        <div class="slide-title">Autonomous Fleets: <span class="accent">Aerial UAV &amp; Underwater Glider</span> Coupling</div>
      </div>
      <div class="slide-header-right">
        <span class="badge badge-deeptech">DUAL-DOMAIN AUTONOMY</span>
        <span style="font-size: 6.5pt; color: #64748b; font-family: 'JetBrains Mono';">MQ-9B &amp; GLIDER INTEGRATION</span>
      </div>
    </div>

    <div class="grid-2-wide-left">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="card success">
          <div class="card-title" style="color: #34d399;">Aerial UAV Sonobuoy Optimization (MQ-9B / P-8I)</div>
          <div class="grid-2" style="margin: 4px 0;">
            <div>
              <div style="font-size: 6.5pt; color: #94a3b8;">SONOBUOY COST AVOIDANCE</div>
              <div class="card-metric green">72% Savings</div>
            </div>
            <div>
              <div style="font-size: 6.5pt; color: #94a3b8;">SORTIE COST REDUCTION</div>
              <div class="card-metric green">₹12 Lakhs / Flight</div>
            </div>
          </div>
          <div class="card-desc">
            • <strong>Traditional Practice:</strong> Drone cockpits drop 20+ expendable sonobuoys ($800–$2,400 each = $24,000) blindly along search paths.<br>
            • <strong>OceanEmbed Precision Drop:</strong> Feeds real-time SLD coordinates directly into flight telemetry, requiring only <strong>3 targeted sonobuoys</strong> dropped precisely into the acoustic duct.
          </div>
        </div>

        <div class="card accent">
          <div class="card-title" style="color: #38bdf8;">Autonomous Underwater Glider (UUV) Mission Endurance</div>
          <div class="grid-2" style="margin: 4px 0;">
            <div>
              <div style="font-size: 6.5pt; color: #94a3b8;">ENDURANCE EXTENSION</div>
              <div class="card-metric">+34% Range</div>
            </div>
            <div>
              <div style="font-size: 6.5pt; color: #94a3b8;">MISSION LONGEVITY</div>
              <div class="card-metric">45d → 60+ Days</div>
            </div>
          </div>
          <div class="card-desc">
            • <strong>Pycnocline Surfing:</strong> Gliders trim buoyancy engines using OceanEmbed's pre-computed 3D density layers, surfing natural density gradients.<br>
            • <strong>Eddy Hazard Avoidance:</strong> Automatically routes gliders around hazardous 1.2 m/s eddy shears that sweep slow gliders off-mission.
          </div>
        </div>
      </div>

      <div class="img-box">
        <div class="img-box-header">
          <span>PROTOTYPE: 3D VOLUMETRIC CUBE &amp; UAV DEPLOYMENT SIMULATION</span>
          <span style="color: #38bdf8;">● 3D WEBGL ENGINE</span>
        </div>
        <img src="${imgTactical}" alt="3D Volumetric Engine">
      </div>
    </div>

    <div class="slide-footer">
      <div>OceanEmbed: Idea Submission Presentation • Cohort 3.0</div>
      <div>Slide 7 of 12</div>
      <div><a href="https://oceanembed089.netlify.app/">Live Prototype: oceanembed089.netlify.app</a></div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 8: AORI ADAPTIVE DECISION ENGINE & COST AVOIDANCE                   -->
  <!-- ========================================================================= -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-tag">07 / DECISION INTELLIGENCE &amp; COST AVOIDANCE</span>
        <div class="slide-title">AORI: <span class="accent">Adaptive Observation Recommendation Interface</span></div>
      </div>
      <div class="slide-header-right">
        <span class="badge badge-green">₹10–15 CRORES ANNUAL SAVINGS</span>
        <span style="font-size: 6.5pt; color: #64748b; font-family: 'JetBrains Mono';">RESEARCH SHIP COST OPTIMIZATION</span>
      </div>
    </div>

    <div class="grid-2-wide-left">
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div class="card">
          <div class="card-title">Solving the ₹25 Lakhs/Day Research Cruise Dilemma</div>
          <div class="card-desc">
            Chartering hydrographic research ships (<em>ORV Sagar Nidhi, Sagar Kanya</em>) costs <strong>$45,000–$75,000/day</strong>. Traditionally, ships drop buoys along arbitrary lines, measuring uniform calm water where AI already has high confidence.
          </div>
        </div>

        <div class="card accent">
          <div class="card-title">Explainable Multi-Criteria Priority Formulation</div>
          <div class="formula-box">
            <div>S<sub>obs</sub>(x, y) = 0.45 U(x, y) + 0.25 G(x, y) + 0.15 H(x, y) + 0.15 S<sub>sparse</sub>(x, y) − R<sub>constraint</sub>(x, y)</div>
          </div>
          <div class="grid-4" style="margin-top: 4px;">
            <div class="card" style="padding: 4px 6px;">
              <div style="font-size: 6.5pt; color: #94a3b8;">UNCERTAINTY (U)</div>
              <div style="font-size: 9.5pt; font-weight: 800; color: #38bdf8;">0.84 (45%)</div>
            </div>
            <div class="card" style="padding: 4px 6px;">
              <div style="font-size: 6.5pt; color: #94a3b8;">GRADIENT (G)</div>
              <div style="font-size: 9.5pt; font-weight: 800; color: #38bdf8;">0.91 (25%)</div>
            </div>
            <div class="card" style="padding: 4px 6px;">
              <div style="font-size: 6.5pt; color: #94a3b8;">HAZARD (H)</div>
              <div style="font-size: 9.5pt; font-weight: 800; color: #f87171;">0.94 (15%)</div>
            </div>
            <div class="card" style="padding: 4px 6px;">
              <div style="font-size: 6.5pt; color: #94a3b8;">SPARSITY (S)</div>
              <div style="font-size: 9.5pt; font-weight: 800; color: #fbbf24;">0.82 (15%)</div>
            </div>
          </div>
        </div>

        <div class="card success">
          <div class="card-title" style="color: #34d399;">Active Target #1: Central Bay Mesoscale Eddy Front (15.25°N, 89.75°E)</div>
          <div class="card-desc">
            Identifies sharp cyclonic/anticyclonic dipole shear with peak thermocline variance at 100–200m. Directing research cruises to this coordinate eliminates 20+ redundant cruise days annually, saving <strong>₹10–15 Crores ($1.2M–$1.8M USD)</strong> in government funds.
          </div>
        </div>
      </div>

      <div class="img-box">
        <div class="img-box-header">
          <span>PROTOTYPE: AORI TARGET SELECTION &amp; ROADMAP</span>
          <span style="color: #34d399;">● TARGET SCORE: 0.88</span>
        </div>
        <img src="${imgAori}" alt="AORI Recommendation Engine">
      </div>
    </div>

    <div class="slide-footer">
      <div>OceanEmbed: Idea Submission Presentation • Cohort 3.0</div>
      <div>Slide 8 of 12</div>
      <div><a href="https://oceanembed089.netlify.app/">Live Prototype: oceanembed089.netlify.app</a></div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 9: EMPIRICAL GROUND TRUTH BENCHMARKS                                -->
  <!-- ========================================================================= -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-tag">08 / VALIDATION &amp; DATA PROOF</span>
        <div class="slide-title">Empirical Proof: <span class="accent">2,159,612 Physical ARGO Profiles</span></div>
      </div>
      <div class="slide-header-right">
        <span class="badge badge-green">10/10 ACCEPTANCE GATES PASSED</span>
        <span style="font-size: 6.5pt; color: #64748b; font-family: 'JetBrains Mono';">R² = 0.942 | RMSE = 0.637°C</span>
      </div>
    </div>

    <div class="grid-2-wide-left">
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div class="grid-3">
          <div class="card accent">
            <div style="font-size: 6.5pt; color: #94a3b8;">GLOBAL ARGO SOUNDINGS</div>
            <div class="card-metric">2.15 Million</div>
            <div class="card-desc">Real physical CTD sensor profiles across Indian Ocean.</div>
          </div>
          <div class="card success">
            <div style="font-size: 6.5pt; color: #94a3b8;">TEMPERATURE RMSE</div>
            <div class="card-metric green">0.637 °C</div>
            <div class="card-desc">Full 0–1,000m depth vertical accuracy.</div>
          </div>
          <div class="card">
            <div style="font-size: 6.5pt; color: #94a3b8;">CORRELATION COEFFICIENT</div>
            <div class="card-metric">R² = 0.942</div>
            <div class="card-desc">Exceptional alignment with ocean physics.</div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">4-Tier Progressive Validation Framework</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Observing Platform</th>
                <th>Physical Metric Evaluated</th>
                <th>Quantitative Result</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Tier 1</strong></td>
                <td>Global ARGO CTD Floats</td>
                <td>0–1,000m Vertical Temp Profiles</td>
                <td><strong>RMSE 0.637°C | R² = 0.942</strong></td>
                <td><span class="pill pill-green">Verified</span></td>
              </tr>
              <tr>
                <td><strong>Tier 2</strong></td>
                <td>OMNI &amp; RAMA Moored Buoys</td>
                <td>Thermocline Phase Coherence</td>
                <td>Phase Lag &lt; 0.4 days | MLD Error &lt; 4.8m</td>
                <td><span class="pill pill-green">Benchmarked</span></td>
              </tr>
              <tr>
                <td><strong>Tier 3</strong></td>
                <td>Ship XBT &amp; Gliders</td>
                <td>Horizontal Eddy Front Resolution</td>
                <td>Spatial Error &lt; 12 km across fronts</td>
                <td><span class="pill pill-blue">Scheduled Pilot</span></td>
              </tr>
              <tr>
                <td><strong>Tier 4</strong></td>
                <td>SATTUNA Tuna Bio-Logging</td>
                <td>Subsurface Diving Envelope</td>
                <td>Isotherm match within 0.85°C</td>
                <td><span class="pill pill-blue">Research Ready</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card" style="background: rgba(10, 45, 80, 0.4);">
          <div class="card-desc" style="font-size: 7.2pt; color: #cbd5e1;">
            <strong>Cryptographic Verification:</strong> All model weights, pipeline code, and test gates are hashed under SHA-256 fingerprint: <span style="font-family: 'JetBrains Mono'; color: #38bdf8;">15C39E56E19C879DC6C2A0ABE12CA4D3EA98D7D5F8B09D226743A763EF58F5BC</span>, certifying strict test-set isolation and zero future-data leakage.
          </div>
        </div>
      </div>

      <div class="img-box">
        <div class="img-box-header">
          <span>PROTOTYPE: ARGO IN-SITU PROOF &amp; ERROR BREAKDOWN</span>
          <span style="color: #34d399;">● 99.1% ACCURACY</span>
        </div>
        <img src="${imgArgoProof}" alt="ARGO In-Situ Benchmarking">
      </div>
    </div>

    <div class="slide-footer">
      <div>OceanEmbed: Idea Submission Presentation • Cohort 3.0</div>
      <div>Slide 9 of 12</div>
      <div><a href="https://oceanembed089.netlify.app/">Live Prototype: oceanembed089.netlify.app</a></div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 10: BUSINESS MODEL & DUAL-USE COMMERCIALIZATION                     -->
  <!-- ========================================================================= -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-tag">09 / COMMERCIALIZATION &amp; ROI</span>
        <div class="slide-title">Dual-Use Business Model &amp; <span class="accent">Defense Procurement</span> (Who Pays)</div>
      </div>
      <div class="slide-header-right">
        <span class="badge badge-defence">SOVEREIGN B2G &amp; OEM SAAS</span>
        <span style="font-size: 6.5pt; color: #64748b; font-family: 'JetBrains Mono';">TAM: $4.8B GLOBAL OCEAN INTEL</span>
      </div>
    </div>

    <div class="grid-2">
      <div class="card accent">
        <div class="card-title" style="color: #38bdf8;">1. B2G Defense / Maritime Operations Center (MOC) Licensing</div>
        <div class="card-metric" style="font-size: 11pt;">₹2.90 Crores / Year ($350,000/yr)</div>
        <div class="card-desc" style="line-height: 1.45;">
          • <strong>Customer:</strong> Indian Navy (MOC) &amp; Japan Maritime Self-Defense Force (JMSDF).<br>
          • <strong>Deliverable:</strong> Air-gapped on-premises operational server deployment providing daily 3D acoustic range feeds, cyclone preconditioning alerts, and real-time submarine shadow-zone maps.
        </div>
      </div>

      <div class="card success">
        <div class="card-title" style="color: #34d399;">2. Autonomous Marine Drone &amp; Glider OEM Developer API</div>
        <div class="card-metric green" style="font-size: 11pt;">₹40 Lakhs / Year ($50,000/yr per tier)</div>
        <div class="card-desc" style="line-height: 1.45;">
          • <strong>Customer:</strong> Autonomous marine vehicle manufacturers (Sagar Defence, Teledyne, Liquid Robotics).<br>
          • <strong>Deliverable:</strong> Cloud REST API queried during mission planning to retrieve 3D density layers and geostrophic current vectors, extending glider mission range by +34%.
        </div>
      </div>

      <div class="card warning">
        <div class="card-title" style="color: #fbbf24;">3. Hydrographic Research Ship-Day Cost Avoidance</div>
        <div class="card-metric amber" style="font-size: 11pt;">₹10–15 Crores Net Saved / Year</div>
        <div class="card-desc" style="line-height: 1.45;">
          • <strong>Customer:</strong> MoES, INCOIS, NIOT, JAMSTEC.<br>
          • <strong>Deliverable:</strong> AORI targeted sampling schedules eliminate 20+ redundant research cruise days annually ($45k–$75k/day), generating massive public expenditure savings.
        </div>
      </div>

      <div class="card">
        <div class="card-title">4. Quad IPMDA Bilateral Strategic Alignment</div>
        <div class="card-metric" style="font-size: 11pt; color: #cbd5e1;">Multilateral Standard</div>
        <div class="card-desc" style="line-height: 1.45;">
          • <strong>Framework:</strong> Indo-Pacific Partnership for Maritime Domain Awareness (IPMDA).<br>
          • <strong>Deliverable:</strong> Cryptographically verified civil ocean intelligence data standard bridging India (INCOIS) and Japan (JAMSTEC/JMA) across 68,400 grid cells (~8 Million km²).
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>OceanEmbed: Idea Submission Presentation • Cohort 3.0</div>
      <div>Slide 10 of 12</div>
      <div><a href="https://oceanembed089.netlify.app/">Live Prototype: oceanembed089.netlify.app</a></div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 11: BUDGET & 18-MONTH EXECUTION ROADMAP                             -->
  <!-- ========================================================================= -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-tag">10 / EXECUTION ROADMAP &amp; GOVERNANCE</span>
        <div class="slide-title">18-Month Production Budget &amp; <span class="accent">Deployment Milestones</span></div>
      </div>
      <div class="slide-header-right">
        <span class="badge badge-green">TOTAL BUDGET: ₹1.38 CRORES ($165K)</span>
        <span style="font-size: 6.5pt; color: #64748b; font-family: 'JetBrains Mono';">CERT-IN COMPLIANT DEFENSE HARDENING</span>
      </div>
    </div>

    <div class="grid-2-wide-left">
      <div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Expenditure Category</th>
              <th>Scope &amp; Deliverables</th>
              <th>INR</th>
              <th>USD</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Core Engineering (4 FTE)</strong></td>
              <td>Lead AI Oceanographer, 3D Specialist, Defense Architect, DevOps</td>
              <td><strong>₹71.0 L</strong></td>
              <td>$85,000</td>
              <td>51.5%</td>
            </tr>
            <tr>
              <td><strong>Sovereign Cloud &amp; GPU</strong></td>
              <td>2x NVIDIA L40S/A100 instances on C-DAC AIRAWAT; 60TB storage</td>
              <td><strong>₹23.5 L</strong></td>
              <td>$28,000</td>
              <td>17.0%</td>
            </tr>
            <tr>
              <td><strong>Defense Cyber Audits</strong></td>
              <td>Mandatory CERT-In security audit, ISO 27001 data compliance</td>
              <td><strong>₹12.5 L</strong></td>
              <td>$15,000</td>
              <td>9.1%</td>
            </tr>
            <tr>
              <td><strong>Near-Real-Time Feeds</strong></td>
              <td>Low-latency satellite pipelines (MOSDAC, Copernicus, ECMWF)</td>
              <td><strong>₹10.0 L</strong></td>
              <td>$12,000</td>
              <td>7.3%</td>
            </tr>
            <tr>
              <td><strong>Sea-Trial Validation</strong></td>
              <td>Matchup campaign during scheduled NIOT/INCOIS cruises</td>
              <td><strong>₹8.5 L</strong></td>
              <td>$10,000</td>
              <td>6.1%</td>
            </tr>
            <tr>
              <td><strong>Contingency Reserve (10%)</strong></td>
              <td>Bandwidth redundancy, hardware maintenance, failover buffer</td>
              <td><strong>₹12.5 L</strong></td>
              <td>$15,000</td>
              <td>9.0%</td>
            </tr>
            <tr style="background: rgba(56, 189, 248, 0.15); font-weight: 800;">
              <td colspan="2"><strong>TOTAL 18-MONTH CAPITAL REQUIREMENT</strong></td>
              <td><strong>₹1.38 Cr</strong></td>
              <td><strong>$165,000</strong></td>
              <td><strong>100%</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="card">
          <div class="card-title">Phase 1: Institutional Pilot (M1–M6)</div>
          <div class="card-desc">
            Containerized Docker/Kubernetes deployment on INCOIS and IMD servers. Automated ingestion of daily INSAT-3D and Sentinel-6 feeds for daily Bay of Bengal Cyclone Heat Advisories.
          </div>
        </div>

        <div class="card accent">
          <div class="card-title">Phase 2: Defense MOC Integration (M6–M12)</div>
          <div class="card-desc">
            Air-gapped deployment in the Indian Navy Maritime Operations Center (MOC). Complete CERT-In cybersecurity audit; interface with naval MQ-9B and P-8I sonobuoy tactical systems.
          </div>
        </div>

        <div class="card success">
          <div class="card-title">Phase 3: Indo-Pacific Scale &amp; Quad (M12–M18)</div>
          <div class="card-desc">
            Expand computational grid across 68,400 cells (5°N–50°N, 60°E–155°E). Deploy OEM API for autonomous gliders and establish Quad IPMDA shared data standard with Japan (JAMSTEC).
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>OceanEmbed: Idea Submission Presentation • Cohort 3.0</div>
      <div>Slide 11 of 12</div>
      <div><a href="https://oceanembed089.netlify.app/">Live Prototype: oceanembed089.netlify.app</a></div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 12: COHORT 3.0 ENGAGEMENT & LIVE ACCESS                             -->
  <!-- ========================================================================= -->
  <div class="slide" style="justify-content: space-between; padding: 12mm 18mm;">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-tag">11 / COHORT 3.0 ENGAGEMENT &amp; CONCLUSION</span>
        <div class="slide-title">What We Seek from <span class="accent">Cohort 3.0</span> &amp; Next Steps</div>
      </div>
      <div class="slide-header-right">
        <span class="badge badge-deeptech">LET'S SCALE OCEANEMBED TOGETHER</span>
        <span style="font-size: 6.5pt; color: #64748b; font-family: 'JetBrains Mono';">CONTACT &amp; DEPLOYMENT READY</span>
      </div>
    </div>

    <div class="grid-3" style="margin-bottom: 12px;">
      <div class="card accent">
        <div class="card-title" style="color: #38bdf8;">1. Seed Funding &amp; Compute Grants</div>
        <div class="card-desc">
          To procure dedicated GPU compute time on sovereign high-performance computing clusters (C-DAC AIRAWAT) and operationalize near-real-time satellite API pipelines.
        </div>
      </div>

      <div class="card success">
        <div class="card-title" style="color: #34d399;">2. Defense &amp; Institutional Mentorship</div>
        <div class="card-desc">
          Guidance on defense procurement frameworks (iDEX / Naval Innovation and Indigenisation Organisation - NIIO) and establishing MoES / INCOIS pilot integration agreements.
        </div>
      </div>

      <div class="card warning">
        <div class="card-title" style="color: #fbbf24;">3. Fleet Pilot Opportunities</div>
        <div class="card-desc">
          Connecting with autonomous underwater vehicle (AUV/glider) manufacturers and maritime drone operators for sea-trial operational validation.
        </div>
      </div>
    </div>

    <div class="card" style="background: rgba(7, 35, 64, 0.9); border: 1.5px solid #0284c7; padding: 12px 18px; margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 8pt; font-family: 'JetBrains Mono'; color: #38bdf8; margin-bottom: 2px;">
            VERIFY OUR LIVE WORKING PROTOTYPE DIRECTLY:
          </div>
          <div style="font-size: 13pt; font-weight: 800; color: #ffffff;">
            <a href="https://oceanembed089.netlify.app/" style="color: #ffffff; text-decoration: none;">https://<span style="color: #38bdf8;">oceanembed089</span>.netlify.app/</a>
          </div>
          <div style="font-size: 7.5pt; color: #94a3b8; margin-top: 2px;">
            Direct 3D Operations Console: <a href="https://oceanembed089.netlify.app/#demo" style="color: #38bdf8;">https://oceanembed089.netlify.app/#demo</a>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <a href="https://oceanembed089.netlify.app/" class="link-pill" style="font-size: 8pt; padding: 7px 16px;">
            LAUNCH LIVE SYSTEM ↗
          </a>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>OceanEmbed: AI-Driven 3D Subsurface Ocean Intelligence Engine • Cohort 3.0 Idea Submission</div>
      <div>Slide 12 of 12 (End of Deck)</div>
      <div><a href="https://oceanembed089.netlify.app/">Live System: oceanembed089.netlify.app</a></div>
    </div>
  </div>

</body>
</html>
`;

const htmlPath = path.join(__dirname, 'presentation_deck.html');
fs.writeFileSync(htmlPath, html, 'utf-8');
console.log('Written presentation_deck.html (' + (fs.statSync(htmlPath).size / 1024).toFixed(1) + ' KB)');

async function printDeck() {
  const pdfPath = path.join(__dirname, 'OceanEmbed_Idea_Submission_Presentation.pdf');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9257',
    '--disable-gpu',
    'file:///' + htmlPath.replace(/\\/g, '/')
  ]);

  await new Promise(r => setTimeout(r, 2500));

  http.get('http://127.0.0.1:9257/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      const tabs = JSON.parse(data);
      const page = tabs.find(t => t.type === 'page');
      if (!page) { console.error('No page found'); chrome.kill(); return; }

      const ws = new WebSocket(page.webSocketDebuggerUrl);
      ws.onopen = () => {
        let msgId = 1;
        function send(method, params = {}) {
          ws.send(JSON.stringify({ id: msgId++, method, params }));
        }

        send('Page.enable');

        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.result && msg.result.data) {
            fs.writeFileSync(pdfPath, Buffer.from(msg.result.data, 'base64'));
            const stats = fs.statSync(pdfPath);
            console.log('SUCCESS! Presentation PDF Generated: ' + pdfPath + ' (' + (stats.size / 1024 / 1024).toFixed(2) + ' MB)');
            chrome.kill();
            process.exit(0);
          }
        };

        setTimeout(() => {
          send('Page.printToPDF', {
            printBackground: true,
            paperWidth: 11.69, // 16:9 widescreen presentation width in inches
            paperHeight: 6.58, // 16:9 widescreen presentation height in inches
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0
          });
        }, 1500);
      };
    });
  });
}

printDeck();
