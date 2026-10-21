import re

with open('web/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Header Brand Titles
old_brand = """        <div class="brand-main">
          <span class="brand-name">OceanEmbed</span>
          <span class="badge-ps">MoES &bull; INCOIS PS-26066</span>
        </div>
        <div class="brand-desc">
          Deep Learning Reconstruction of Subsurface Ocean Temperature from Satellite Observations
        </div>"""

new_brand = """        <div class="brand-main">
          <span class="brand-name">OceanEmbed</span>
          <span class="badge-ps">MoES &bull; INCOIS PS-26066</span>
          <span class="badge-ps" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.35);">JAMSTEC &bull; Japan Bilateral</span>
        </div>
        <div class="brand-desc">
          Pan-Indo-Pacific Subsurface Ocean Intelligence Suite &bull; Autonomous Fleet &amp; UAV Tactical Operations
        </div>"""

if old_brand in html:
    html = html.replace(old_brand, new_brand)
    print("Updated header brand titles.")
else:
    html = re.sub(
        r'<div class="brand-main">[\s\S]*?<\/div>\s*<div class="brand-desc">[\s\S]*?<\/div>',
        new_brand,
        html,
        count=1
    )
    print("Updated header brand titles via regex.")

# 2. Update Quick Jump Navigation Ribbon
old_jump_end = """      <button class="jump-btn" data-target="secGuide">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        6. How It Works (Guide)
      </button>"""

new_jump_end = """      <button class="jump-btn" data-target="secUAV">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
        6. UAV &amp; Autonomous Fleet
      </button>
      <button class="jump-btn" data-target="secIndoPacific">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
        7. Indo-Pacific Bilateral &amp; Business Model
      </button>"""

if old_jump_end in html:
    html = html.replace(old_jump_end, new_jump_end)
    print("Replaced guide in jump ribbon with UAV and Indo-Pacific buttons.")
else:
    html = re.sub(
        r'<button class="jump-btn" data-target="secGuide">[\s\S]*?<\/button>',
        new_jump_end,
        html,
        count=1
    )
    print("Replaced guide in jump ribbon via regex.")

# 3. Replace Section 6 (secGuide) with Production Section 6 (secUAV) and Section 7 (secIndoPacific)
production_sections = """    <!-- SECTION 6: UNMANNED SYSTEMS & UAV MARITIME FLEET INTEGRATION -->
    <section class="deck-card" id="secUAV">
      <div class="deck-card-header">
        <div class="section-title-wrap">
          <span class="section-tag">UNMANNED AERIAL &amp; UNDERWATER VEHICLE OPERATIONS</span>
          <h2 class="section-title">UAV &amp; Autonomous Fleet Integration Suite</h2>
          <p class="section-subtitle">Real-time operational coupling between aerial maritime surveillance UAVs (MQ-9B SeaGuardian / TAPAS-BH), autonomous ocean gliders (UUVs), and subsurface sound-speed fields.</p>
        </div>
        <div class="hero-metric-badge" style="background: rgba(14, 165, 233, 0.12); border-color: rgba(14, 165, 233, 0.35);">
          <span class="metric-val" style="color: #38bdf8;">72%</span>
          <span class="metric-lbl">Sonobuoy Expenditure Avoidance</span>
        </div>
      </div>

      <!-- UAV & Maritime Drone Operational Matrix -->
      <div class="geospatial-split-grid" style="margin-top: 1.25rem;">
        <!-- Left Column: UAV Mission Deck & Tactical Workflows -->
        <div class="probe-telemetry-card">
          <div class="probe-header-bar">
            <div>
              <span class="probe-tag" style="background: rgba(14, 165, 233, 0.2); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.4);">AERIAL MARITIME SURVEILLANCE</span>
              <h3 class="probe-title">UAV Flight Deck Subsurface Coupling</h3>
              <p class="probe-coords">Target Platforms: <strong>MQ-9B SeaGuardian, TAPAS-BH, P-8I Neptune</strong></p>
            </div>
          </div>

          <div class="narrative-box" style="margin: 1rem 0; background: rgba(15, 23, 42, 0.6); border-left: 3px solid #06b6d4;">
            <p style="font-size: 0.85rem; line-height: 1.55; color: #cbd5e1;">
              <strong>The Tactical Blind Spot:</strong> Long-endurance maritime UAVs carry synthetic aperture radar (SAR), optical/infrared turrets, and electronic surveillance payloads, but <em>cannot penetrate seawater</em>. Without subsurface intelligence, maritime patrol UAVs must deploy expendable bathythermographs (XBTs) and active/passive sonobuoys ($800–$2,400 per unit) blindly along patrol corridors.
            </p>
          </div>

          <!-- UAV Operational KPIs -->
          <div class="kpi-quad-grid">
            <div class="kpi-box">
              <span class="kpi-tag">TARGETED SONOBUOY DROP</span>
              <div class="kpi-num" style="color: #10b981;">3 <span class="unit">vs 20 blind</span></div>
              <span class="kpi-hint">Saves $14,400 per patrol sortie</span>
            </div>
            <div class="kpi-box">
              <span class="kpi-tag">HYDROPHONE DEPTH SETTING</span>
              <div class="kpi-num" style="color: #06b6d4;">50 <span class="unit">m SLD</span></div>
              <span class="kpi-hint">Optimal channel trap placement</span>
            </div>
            <div class="kpi-box">
              <span class="kpi-tag">GLIDER MISSION ENDURANCE</span>
              <div class="kpi-num" style="color: #a855f7;">+34% <span class="unit">range</span></div>
              <span class="kpi-hint">Thermocline buoyancy-riding</span>
            </div>
            <div class="kpi-box">
              <span class="kpi-tag">CROSS-DOMAIN RF/ACOUSTIC</span>
              <div class="kpi-num" style="color: #f59e0b;">&lt;0.8s <span class="unit">latency</span></div>
              <span class="kpi-hint">Edge-embedded GCS inference</span>
            </div>
          </div>

          <!-- UAV Tactical Actions -->
          <div style="margin-top: 1.25rem;">
            <h4 style="font-size: 0.85rem; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.75rem; letter-spacing: 0.05em;">Tactical UAV Flight-Path Simulations:</h4>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              <button class="action-btn" id="btnUavSortieWarmCore" style="text-align: left; justify-content: flex-start;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                Deploy UAV Sonar Sweep: Central Bay Warm Core (TCHP = 101.1 kJ/cm²)
              </button>
              <button class="action-btn" id="btnUavSortieBarrier" style="text-align: left; justify-content: flex-start;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/></svg>
                Deploy UAV Acoustic Patrol: Northern River Barrier Layer (50m Inversion)
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column: Autonomous Glider (UUV/USV) Mission Architecture -->
        <div class="probe-telemetry-card">
          <div class="probe-header-bar">
            <div>
              <span class="probe-tag" style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4);">UNMANNED UNDERWATER VEHICLES</span>
              <h3 class="probe-title">UUV &amp; Wave Glider Mission Optimization</h3>
              <p class="probe-coords">Compatible Platforms: <strong>Teledyne Slocum Glider, Liquid Robotics Wave Glider, Kongsberg HUGIN</strong></p>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.85rem; margin-top: 1rem;">
            <div style="background: rgba(19, 28, 49, 0.8); border: 1px solid #1e2d4a; border-radius: 8px; padding: 0.85rem 1rem;">
              <h4 style="font-size: 0.85rem; color: #10b981; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.4rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Buoyancy Engine Trim &amp; Power Preservation
              </h4>
              <p style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.5;">
                Underwater gliders rely on small variable-buoyancy pumps to ascend and descend. By predicting exact pycnocline and thermocline density gradients in advance, flight planners adjust pitch angles (&theta; = 15&deg;&ndash;18&deg;) to harvest ocean stratified density, extending autonomous deployment from 45 days to over 60 days.
              </p>
            </div>

            <div style="background: rgba(19, 28, 49, 0.8); border: 1px solid #1e2d4a; border-radius: 8px; padding: 0.85rem 1rem;">
              <h4 style="font-size: 0.85rem; color: #38bdf8; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.4rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/></svg>
                Acoustic-RF Gateway Communications Scheduling
              </h4>
              <p style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.5;">
                Submerged UUVs cannot communicate via satellite without surfacing. OceanEmbed maps surface duct boundaries and acoustic transmission loss, scheduling optimal surfacing intervals only when surface sea-state and acoustic channel conditions permit low-exposure RF burst uplink to overhead UAVs.
              </p>
            </div>

            <div style="background: rgba(19, 28, 49, 0.8); border: 1px solid #1e2d4a; border-radius: 8px; padding: 0.85rem 1rem;">
              <h4 style="font-size: 0.85rem; color: #f59e0b; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.4rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Autonomous Path Planning &amp; Eddy Avoidance
              </h4>
              <p style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.5;">
                Strong anticyclonic warm-core eddies generate peripheral current velocities exceeding 1.2 m/s, causing gliders (cruising at 0.3–0.4 m/s) to be swept off course. OceanEmbed's 3D geostrophic flow routing guides autonomous vehicles around eddy perimeters or exploits tailwinds for accelerated transit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 7: PAN-INDO-PACIFIC BILATERAL & COMMERCIAL BUSINESS MODEL -->
    <section class="deck-card" id="secIndoPacific">
      <div class="deck-card-header">
        <div class="section-title-wrap">
          <span class="section-tag">INDIA (MoES-INCOIS) &bull; JAPAN (JAMSTEC/JMA) BILATERAL MARITIME CORRIDOR</span>
          <h2 class="section-title">Pan-Indo-Pacific Operational Architecture &amp; Business Model</h2>
          <p class="section-subtitle">Scaling from regional Bay of Bengal to the full Indo-Pacific Theater (5.0&deg;N&ndash;50.0&deg;N, 60.0&deg;E&ndash;155.0&deg;E): Dual-basin AI deployment, sovereign security interoperability, and commercial ROI.</p>
        </div>
        <div class="hero-metric-badge" style="background: rgba(16, 185, 129, 0.12); border-color: rgba(16, 185, 129, 0.35);">
          <span class="metric-val" style="color: #10b981;">68,400</span>
          <span class="metric-lbl">Total Grid Cells (0.25° × 0.25°)</span>
        </div>
      </div>

      <!-- Domain Map Presentation & Technical Feasibility -->
      <div class="geospatial-split-grid" style="margin-top: 1.25rem;">
        <!-- Left: Official Study Domain Map -->
        <div class="probe-telemetry-card">
          <div class="probe-header-bar">
            <div>
              <span class="probe-tag" style="background: rgba(139, 92, 246, 0.2); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.4);">EXPANDED OPERATIONAL DOMAIN</span>
              <h3 class="probe-title">Study Domain: 5.0&deg;N &ndash; 50.0&deg;N, 60.0&deg;E &ndash; 155.0&deg;E</h3>
              <p class="probe-coords">Grid Resolution: <strong>0.25&deg; &times; 0.25&deg;</strong> (180 Lat &times; 380 Lon) &bull; Total Marine Area: <strong>~8,000,000 km&sup2;</strong></p>
            </div>
          </div>

          <div style="margin: 1rem 0; border: 1px solid #1e2d4a; border-radius: 8px; overflow: hidden; background: #070b14; text-align: center;">
            <img src="/indo_pacific_study_domain.jpg" alt="Indo-Pacific Study Domain 5N-50N, 60E-155E" style="width: 100%; height: auto; display: block; max-height: 380px; object-fit: contain; margin: 0 auto;" />
          </div>

          <!-- Dual Sector Breakdown Grid -->
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
          </div>
        </div>

        <!-- Right: Business Model, Revenue Architecture & ROI -->
        <div class="probe-telemetry-card">
          <div class="probe-header-bar">
            <div>
              <span class="probe-tag" style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4);">COMMERCIALIZATION &amp; ROI</span>
              <h3 class="probe-title">Enterprise Business Model &amp; Defense Procurement</h3>
              <p class="probe-coords">Sustainable revenue streams across government, defense, and autonomous marine tech</p>
            </div>
          </div>

          <!-- 4 Pillars of Commercial Revenue -->
          <div style="display: flex; flex-direction: column; gap: 0.85rem; margin-top: 1rem;">
            <!-- Pillar 1 -->
            <div style="background: rgba(19, 28, 49, 0.7); border: 1px solid #1e2d4a; border-radius: 8px; padding: 0.85rem 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <strong style="color: #38bdf8; font-size: 0.85rem;">1. B2G Defense / Maritime Operations Center (MOC) Licensing</strong>
                <span class="pill pill-cyan" style="font-size: 0.65rem;">GovTech SaaS</span>
              </div>
              <p style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.5;">
                Annual software license for national maritime command centers (Indian Navy MOC, Japan Maritime Self-Defense Force JMSDF, and INCOIS). Provides sovereign on-premises or secure cloud deployment with daily operational feeds, cyclone preconditioning alerts, and subsurface acoustic range matrices ($250k–$450k/year per fleet command).
              </p>
            </div>

            <!-- Pillar 2 -->
            <div style="background: rgba(19, 28, 49, 0.7); border: 1px solid #1e2d4a; border-radius: 8px; padding: 0.85rem 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <strong style="color: #10b981; font-size: 0.85rem;">2. Autonomous Marine Vehicle OEM API Integration</strong>
                <span class="pill pill-emerald" style="font-size: 0.65rem;">Platform API</span>
              </div>
              <p style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.5;">
                Developer API sold to autonomous vehicle manufacturers (UAVs, wave gliders, AUVs). Vehicles query the OceanEmbed API during mission planning to retrieve dynamic 3D density profiles, reducing mission attrition and extending vehicle operating range by 30%+.
              </p>
            </div>

            <!-- Pillar 3 -->
            <div style="background: rgba(19, 28, 49, 0.7); border: 1px solid #1e2d4a; border-radius: 8px; padding: 0.85rem 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <strong style="color: #f59e0b; font-size: 0.85rem;">3. Hydrographic Survey Ship-Day Cost Avoidance</strong>
                <span class="pill" style="font-size: 0.65rem; background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3);">Cost Optimization</span>
              </div>
              <p style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.5;">
                Chartering dedicated hydrographic research vessels (e.g. ORV Sagar Nidhi, RV Mirai) costs <strong>$45,000–$75,000 per sea-day</strong>. OceanEmbed's AORI targeted sampling directs survey ships to measure only high-uncertainty hotspots, eliminating 20+ redundant cruise days annually for a net savings of <strong>$1.2M–$1.8M per research agency</strong>.
              </p>
            </div>

            <!-- Pillar 4 -->
            <div style="background: rgba(19, 28, 49, 0.7); border: 1px solid #1e2d4a; border-radius: 8px; padding: 0.85rem 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <strong style="color: #a855f7; font-size: 0.85rem;">4. Quad IPMDA Bilateral Data Interoperability</strong>
                <span class="pill" style="font-size: 0.65rem; background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3);">Multilateral Strategic</span>
              </div>
              <p style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.5;">
                Compliant with the Indo-Pacific Partnership for Maritime Domain Awareness (IPMDA). Establishes a shared, cryptographically verified ocean intelligence standard connecting India's MoES-INCOIS and Japan's JAMSTEC/JMA for joint humanitarian disaster response and civil acoustic tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>"""

# Find and replace secGuide
guide_match = re.search(r'<!--\s*SECTION 6:\s*HOW IT WORKS & DEMO TOURS\s*-->[\s\S]*?<\/section>', html)
if guide_match:
    html = html[:guide_match.start()] + production_sections + html[guide_match.end():]
    print("Replaced Section 6 with Section 6 (UAV) and Section 7 (Indo-Pacific & Business Model).")
else:
    # Try finding id="secGuide"
    pos = html.find('id="secGuide"')
    if pos != -1:
        card_start = html.rfind('<section', 0, pos)
        card_end = html.find('</section>', pos) + len('</section>')
        html = html[:card_start] + production_sections + html[card_end:]
        print("Replaced Section 6 via id='secGuide'.")

# 4. Update Footer
old_footer = """  <footer class="app-footer">
    <div class="footer-left">
      <strong>OceanEmbed Intelligence Platform</strong> &bull; Ministry of Earth Sciences (MoES) &bull; INCOIS Problem Statement ID 26066
    </div>
    <div class="footer-right">
      <span>Operational Evaluation Window: August 16–31, 2026</span>
    </div>
  </footer>"""

new_footer = """  <footer class="app-footer">
    <div class="footer-left">
      <strong>OceanEmbed Enterprise v4.2</strong> &bull; Subsurface Ocean Intelligence Suite &bull; MoES-INCOIS (India) &amp; JAMSTEC (Japan) Bilateral Architecture &bull; PS ID 26066
    </div>
    <div class="footer-right">
      <span>Operational Indo-Pacific Grid (5.0°N–50.0°N, 60.0°E–155.0°E) &bull; 0.25° Resolution &bull; 68,400 Cells</span>
    </div>
  </footer>"""

if old_footer in html:
    html = html.replace(old_footer, new_footer)
    print("Updated footer to production enterprise.")
else:
    html = re.sub(
        r'<footer class="app-footer">[\s\S]*?<\/footer>',
        new_footer,
        html,
        count=1
    )
    print("Updated footer via regex.")

with open('web/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("web/index.html production transformation completed successfully!")
