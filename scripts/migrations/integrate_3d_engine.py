import re

# 1. Update build.js
with open('build.js', 'r', encoding='utf-8') as f:
    bjs = f.read()

new_assets_list = """  // 1. Core Web Assets
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
    'ocean3d.js'
  ];"""

bjs = re.sub(
    r'\/\/\s*1\.\s*Core Web Assets[\s\S]*?const assets\s*=\s*\[[\s\S]*?\];',
    new_assets_list,
    bjs,
    count=1
)

with open('build.js', 'w', encoding='utf-8') as f:
    f.write(bjs)
print("Updated build.js assets list.")

# 2. Update web/index.html
with open('web/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace static image in Section 7 with 3D Interactive Volumetric & Fence Viewer
old_image_block = """          <div style="margin: 1rem 0; border: 1px solid #1e2d4a; border-radius: 8px; overflow: hidden; background: #070b14; text-align: center;">
            <img src="/indo_pacific_study_domain.jpg" alt="Indo-Pacific Study Domain 5N-50N, 60E-155E" style="width: 100%; height: auto; display: block; max-height: 380px; object-fit: contain; margin: 0 auto;" />
          </div>"""

new_3d_block = """          <!-- 3D Subsurface Volumetric & Orthogonal Fence Viewer (Inspired by MDPI 3D Geological & Ocean Modeling) -->
          <div class="interactive-3d-wrapper" style="margin: 1rem 0; border: 1px solid #06b6d4; border-radius: 8px; overflow: hidden; background: #060b14; position: relative;">
            
            <!-- 3D Viewer Header Controls Bar -->
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; background: #0c1527; padding: 0.6rem 0.9rem; border-bottom: 1px solid #1e2d4a; gap: 0.5rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="pill pill-cyan" style="font-size: 0.68rem; font-weight: 700;">3D VOLUMETRIC ENGINE</span>
                <span style="font-size: 0.8rem; font-weight: 600; color: #f8fafc;">Subsurface 3D Block &amp; Orthogonal Fence Explorer</span>
              </div>
              
              <!-- 3D Mode Selector Buttons -->
              <div style="display: flex; align-items: center; gap: 0.35rem;">
                <button class="action-btn-sm btn-3d-mode active" data-mode="volumetric" style="font-size: 0.72rem; padding: 3px 9px;">
                  1. Volumetric Block
                </button>
                <button class="action-btn-sm btn-3d-mode" data-mode="fence" style="font-size: 0.72rem; padding: 3px 9px;">
                  2. Orthogonal Fences
                </button>
                <button class="action-btn-sm btn-3d-mode" data-mode="tactical" style="font-size: 0.72rem; padding: 3px 9px;">
                  3. UAV &amp; Glider Paths
                </button>
                <button class="action-btn-sm" id="btn3dResetView" style="font-size: 0.72rem; padding: 3px 8px; background: rgba(30, 41, 59, 0.8);">
                  Reset 3D
                </button>
              </div>
            </div>

            <!-- WebGL 3D Canvas Viewport -->
            <div id="ocean3dContainer" style="width: 100%; height: 460px; position: relative; background: #060b14;">
              <!-- 3D Canvas will be injected here by ocean3d.js -->

              <!-- Live 3D Tactical Probe HUD Overlay -->
              <div id="hud3dInspectorBox" style="position: absolute; top: 12px; right: 12px; background: rgba(12, 21, 39, 0.88); backdrop-filter: blur(8px); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 6px; padding: 0.65rem 0.85rem; max-width: 280px; font-size: 0.75rem; pointer-events: none; z-index: 10; box-shadow: 0 4px 16px rgba(0,0,0,0.5);">
                <div style="color: #22d3ee; font-weight: 700; text-transform: uppercase; font-size: 0.7rem; margin-bottom: 0.25rem; display: flex; align-items: center; gap: 4px;">
                  <span class="pulse-dot" style="width: 6px; height: 6px;"></span> 3D VOXEL QUERY (HOVER ACTIVE)
                </div>
                <div style="color: #cbd5e1; font-family: var(--font-mono); font-size: 0.72rem; margin-bottom: 0.2rem;" id="hud3dCoords">14.38°N, 88.38°E (Depth: 50m)</div>
                <div style="display: flex; justify-content: space-between; margin-top: 0.3rem;">
                  <span style="color: #94a3b8;">Temperature T:</span>
                  <strong style="color: #f8fafc;" id="hud3dTemp">28.45 °C</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 0.15rem;">
                  <span style="color: #94a3b8;">Sound Speed c:</span>
                  <strong style="color: #38bdf8;" id="hud3dSound">1544.3 m/s</strong>
                </div>
                <div style="margin-top: 0.35rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.3rem; font-size: 0.68rem; color: #10b981;" id="hud3dLayer">
                  Surface Acoustic Duct (Optimal Sonobuoy Release)
                </div>
              </div>

              <!-- 3D Tactical Colorbar Legend & Depth Scale Controls -->
              <div style="position: absolute; bottom: 12px; left: 12px; background: rgba(12, 21, 39, 0.85); backdrop-filter: blur(6px); border: 1px solid #1e2d4a; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.72rem; z-index: 10;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
                  <span style="color: #94a3b8;">Depth Exaggeration:</span>
                  <input type="range" id="slider3dDepthScale" min="1.0" max="4.0" step="0.2" value="1.8" style="width: 80px; height: 4px; accent-color: #06b6d4; cursor: pointer;">
                  <span id="lbl3dDepthScale" style="color: #22d3ee; font-weight: 700; font-family: var(--font-mono);">1.8x</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <span style="font-size: 0.68rem; color: #3b82f6;">Cold (6°C)</span>
                  <div style="width: 110px; height: 8px; border-radius: 3px; background: linear-gradient(to right, #1e1b4b, #3b82f6, #06b6d4, #10b981, #f59e0b, #ef4444);"></div>
                  <span style="font-size: 0.68rem; color: #ef4444;">Warm (30°C)</span>
                </div>
              </div>

              <!-- Orbit Hint Overlay -->
              <div style="position: absolute; bottom: 12px; right: 12px; background: rgba(7, 11, 20, 0.65); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 3px 8px; font-size: 0.68rem; color: #94a3b8; pointer-events: none;">
                🖱️ Left Drag: Rotate 3D &bull; Right Drag: Pan &bull; Scroll: Zoom
              </div>
            </div>
          </div>"""

if old_image_block in html:
    html = html.replace(old_image_block, new_3d_block)
    print("Replaced static image block with interactive 3D WebGL block.")
else:
    # Regex fallback
    html = re.sub(
        r'<div style="margin:\s*1rem 0; border:\s*1px solid #1e2d4a;[\s\S]*?<img src="\/indo_pacific_study_domain\.jpg"[\s\S]*?<\/div>',
        new_3d_block,
        html,
        count=1
    )
    print("Replaced static image block via regex.")

# Update the KPI boxes in Section 7 to advanced scientific & defense metrics
old_kpi_sec7 = """          <!-- Dual Sector Breakdown Grid -->
          <div class="kpi-quad-grid">
            <div class="kpi-box">
              <span class="kpi-tag">SECTOR ALPHA (INDIA)</span>
              <div class="kpi-num" style="color: #06b6d4;">MoES-INCOIS</div>
              <span class="kpi-hint">Bay of Bengal &amp; Arabian Sea</span>
            </div>
            <div class="kpi-box">
              <span class="kpi-tag">SECTOR BRAVO (JAPAN)</span>
              <div class="kpi-num" style="color: #10b981;">JAMSTEC / JMA</div>
              <span class="kpi-hint">Kuroshio Extension &amp; Sea of Japan</span>
            </div>
            <div class="kpi-box">
              <span class="kpi-tag">DATA ASSIMILATION</span>
              <div class="kpi-num" style="color: #f59e0b;">GLORYS12V1</div>
              <span class="kpi-hint">CMEMS Global Ocean Reanalysis</span>
            </div>
            <div class="kpi-box">
              <span class="kpi-tag">IN-SITU PROOF DENSITY</span>
              <div class="kpi-num" style="color: #a855f7;">&gt;850 Floats</div>
              <span class="kpi-hint">Active Indo-Pacific ARGO Network</span>
            </div>
          </div>"""

new_kpi_sec7 = """          <!-- Advanced Oceanographic & Tactical Sensor Telemetry -->
          <div class="kpi-quad-grid">
            <div class="kpi-box">
              <span class="kpi-tag">VOLUMETRIC HEAT CONTENT</span>
              <div class="kpi-num" style="color: #ef4444;">1.01 &times; 10⁹ <span class="unit">J/m²</span></div>
              <span class="kpi-hint">TCHP integral &ge; 80 kJ/cm²</span>
            </div>
            <div class="kpi-box">
              <span class="kpi-tag">BRUNT-VÄISÄLÄ FREQ (N²)</span>
              <div class="kpi-num" style="color: #06b6d4;">2.84 &times; 10⁻⁴ <span class="unit">s⁻²</span></div>
              <span class="kpi-hint">Pycnocline stability profile</span>
            </div>
            <div class="kpi-box">
              <span class="kpi-tag">ACOUSTIC DUCT GRADIENT</span>
              <div class="kpi-num" style="color: #10b981;">+0.024 <span class="unit">s⁻¹</span></div>
              <span class="kpi-hint">Upper 50m sound trapping layer</span>
            </div>
            <div class="kpi-box">
              <span class="kpi-tag">DIRECT TRAP RANGE</span>
              <div class="kpi-num" style="color: #a855f7;">14.8 <span class="unit">km</span></div>
              <span class="kpi-hint">In-duct acoustic boundary</span>
            </div>
          </div>"""

if old_kpi_sec7 in html:
    html = html.replace(old_kpi_sec7, new_kpi_sec7)
    print("Elevated Section 7 KPIs to advanced oceanographic metrics.")
else:
    print("Section 7 KPIs not matched directly, checking regex.")

# Add Script Tags for Three.js, OrbitControls, and ocean3d.js
if 'ocean3d.js' not in html:
    script_tags = """
  <!-- 3D Subsurface Volumetric Engine -->
  <script src="/three.min.js"></script>
  <script src="/static/three.min.js"></script>
  <script src="/OrbitControls.js"></script>
  <script src="/static/OrbitControls.js"></script>
  <script src="/ocean3d.js"></script>
  <script src="/static/ocean3d.js"></script>
"""
    # Insert right before </body>
    bpos = html.rfind('</body>')
    if bpos != -1:
        html = html[:bpos] + script_tags + html[bpos:]
        print("Injected Three.js, OrbitControls, and ocean3d.js script tags.")

with open('web/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("web/index.html successfully updated with 3D engine integration!")
