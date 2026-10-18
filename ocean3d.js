/**
 * OceanEmbed 3D Volumetric & Orthogonal Fence Diagram Engine
 * Inspired by MDPI 3D Subsurface Geological & Oceanographic Modeling
 * Built with Three.js & WebGL for Real-Time Defense & Autonomous Fleet Operations
 */

(function () {
  let scene, camera, renderer, controls;
  let container, canvas;
  let volumeGroup, fenceGroup, tacticalGroup, cageGroup;
  let raycaster, mouse, hoverCrosshair;
  let animId = null;
  let resizeObserver = null;
  let intersectionObserver = null;

  // State
  const state = {
    mode: "volumetric", // 'volumetric', 'fence', 'tactical', 'acoustic'
    variable: "temp",   // 'temp', 'sound', 'tchp', 'uncertainty'
    depthScale: 1.8,    // vertical exaggeration
    peelLevel: 0,       // 0 to 5
    uavAngle: 0,
    gliderProgress: 0,
    data: null,
    isInitialized: false,
    controlsBound: false
  };

  // Standard depths
  const DEPTHS = [0, 50, 100, 200, 500, 1000];
  const GRID_ROWS = 68;
  const GRID_COLS = 60;
  const LAT_MIN = 5.125, LAT_MAX = 21.875;
  const LON_MIN = 80.125, LON_MAX = 94.875;

  // Box dimensions in Three.js world space
  const BOX_WIDTH = 50;  // X (Longitude span)
  const BOX_LENGTH = 56; // Z (Latitude span)
  const BOX_DEPTH = 24;  // Y (Depth down from 0 to -BOX_DEPTH)

  // Colormaps
  function getColor(val, min, max, colormap = 'thermal') {
    const t = Math.max(0, Math.min(1, (val - min) / (max - min || 1)));
    if (colormap === 'thermal') {
      if (t < 0.25) {
        const f = t / 0.25;
        return [0, Math.round(f * 200), 255];
      } else if (t < 0.5) {
        const f = (t - 0.25) / 0.25;
        return [0, 200 + Math.round(f * 55), 255 - Math.round(f * 155)];
      } else if (t < 0.75) {
        const f = (t - 0.5) / 0.25;
        return [Math.round(f * 255), 255, 0];
      } else {
        const f = (t - 0.75) / 0.25;
        return [255, 255 - Math.round(f * 200), 0];
      }
    } else {
      const r = Math.sin(t * Math.PI - 0.2) * 255;
      const g = Math.sin(t * Math.PI * 0.8) * 230;
      const b = Math.cos(t * Math.PI * 0.8) * 255;
      return [
        Math.max(10, Math.min(255, Math.round(r > 0 ? r : t * 255))),
        Math.max(10, Math.min(255, Math.round(g > 0 ? g : 30))),
        Math.max(10, Math.min(255, Math.round(b > 0 ? b : (1 - t) * 255)))
      ];
    }
  }

  // Create data texture from 2D grid
  function createGridTexture(grid, minVal, maxVal) {
    const width = GRID_COLS;
    const height = GRID_ROWS;
    const size = width * height;
    const data = new Uint8Array(4 * size);

    for (let i = 0; i < height; i++) {
      const row = grid && grid[i] ? grid[i] : null;
      for (let j = 0; j < width; j++) {
        const val = row && typeof row[j] === "number" ? row[j] : -1;
        const idx = (i * width + j) * 4;
        if (val <= 0 || isNaN(val)) {
          data[idx] = 10;
          data[idx + 1] = 16;
          data[idx + 2] = 28;
          data[idx + 3] = 0; // Transparent land
        } else {
          const [r, g, b] = getColor(val, minVal, maxVal, 'thermal');
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 232; // Opaque ocean
        }
      }
    }

    const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  // Calculate Sound Speed
  function calcSoundSpeed(T, depth_m, S = 34.2) {
    return 1448.96 + 4.591 * T - 0.05304 * T * T + 2.374e-4 * T * T * T + 1.340 * (S - 35) + 0.0163 * depth_m;
  }

  // Safe Grid Extractor supporting arrays and dict objects
  function extractGrids(d) {
    if (!d || !d.temperature_grids) return null;
    const tg = d.temperature_grids;
    if (Array.isArray(tg)) return tg;
    return [0, 1, 2, 3, 4, 5].map(k => tg[k] || tg[String(k)] || tg[DEPTHS[k]] || tg[String(DEPTHS[k])]);
  }

  // Fallback synthetic grid generator if network data delayed
  function generateFallbackGrid(depthIndex) {
    const baseTemps = [29.2, 28.5, 24.5, 17.2, 11.0, 6.5];
    const baseT = baseTemps[depthIndex] || 20.0;
    const rows = [];
    for (let i = 0; i < GRID_ROWS; i++) {
      const row = [];
      const lat = LAT_MIN + (i / (GRID_ROWS - 1)) * (LAT_MAX - LAT_MIN);
      for (let j = 0; j < GRID_COLS; j++) {
        const lon = LON_MIN + (j / (GRID_COLS - 1)) * (LON_MAX - LON_MIN);
        // Bay of Bengal ocean boundary
        if (lat > 20.5 && (lon < 86 || lon > 91)) {
          row.push(-0.02); // Land
        } else if (lat < 10.0 && lon < 80.5) {
          row.push(-0.02); // Land (Sri Lanka / India)
        } else {
          // Warm core eddy simulation at (13.5°N, 86.5°E)
          const distCore = Math.hypot(lat - 13.5, lon - 86.5);
          const eddyBonus = Math.max(0, 1.8 * (1 - distCore / 4.0));
          row.push(baseT + eddyBonus + (Math.sin(lat * 0.5) + Math.cos(lon * 0.4)) * 0.3);
        }
      }
      rows.push(row);
    }
    return rows;
  }

  // Initialize Three.js Engine
  function init3D() {
    container = document.getElementById("ocean3dContainer");
    if (!container) return;

    // If renderer already attached to this container, just resize
    if (renderer && canvas && container.contains(canvas)) {
      onWindowResize();
      renderer.render(scene, camera);
      return;
    }

    const width = container.clientWidth > 0 ? container.clientWidth : 800;
    const height = container.clientHeight > 0 ? container.clientHeight : 460;

    // 1. Scene & Camera
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060b14);

    camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 1000);
    // Isometric angle overlooking the block
    camera.position.set(58, 48, 70);
    camera.lookAt(0, -BOX_DEPTH / 2, 0);

    // 2. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    canvas = renderer.domElement;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "1";

    // Insert canvas BEFORE overlays so HUD and control buttons remain on top
    container.insertBefore(canvas, container.firstChild);

    // 3. OrbitControls
    if (THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.maxPolarAngle = Math.PI / 2 + 0.15;
      controls.minDistance = 25;
      controls.maxDistance = 220;
      controls.target.set(0, -BOX_DEPTH / 2, 0);
      controls.update();
    }

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 0.9);
    dirLight1.position.set(40, 60, 40);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x10b981, 0.5);
    dirLight2.position.set(-40, 30, -40);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x38bdf8, 0.6, 200);
    pointLight.position.set(0, 30, 0);
    scene.add(pointLight);

    // 5. Container Groups
    cageGroup = new THREE.Group();
    volumeGroup = new THREE.Group();
    fenceGroup = new THREE.Group();
    tacticalGroup = new THREE.Group();

    scene.add(cageGroup);
    scene.add(volumeGroup);
    scene.add(fenceGroup);
    scene.add(tacticalGroup);

    // 6. Raycasting Setup
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // 7. Crosshair Marker
    const crosshairGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const crosshairMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true });
    hoverCrosshair = new THREE.Mesh(crosshairGeo, crosshairMat);
    hoverCrosshair.visible = false;
    scene.add(hoverCrosshair);

    // Build Static Bounding Cage
    buildBoundingCage();

    // Attach Event Listeners
    canvas.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onWindowResize);

    // Responsive Observers
    if (window.ResizeObserver && !resizeObserver) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
            onWindowResize();
          }
        }
      });
      resizeObserver.observe(container);
    }

    if (window.IntersectionObserver && !intersectionObserver) {
      intersectionObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            onWindowResize();
            if (renderer && scene && camera) renderer.render(scene, camera);
          }
        }
      });
      intersectionObserver.observe(container);
    }

    // Setup UI Controls
    if (!state.controlsBound) {
      setupUIControls();
      state.controlsBound = true;
    }

    state.isInitialized = true;

    // Start Render Loop
    if (!animId) animate();

    // Load Data
    loadAndBuildData();
  }

  // Build 3D Wireframe Cage & Coordinates
  function buildBoundingCage() {
    cageGroup.clear();

    const w = BOX_WIDTH / 2;
    const l = BOX_LENGTH / 2;
    const d = BOX_DEPTH;

    // 1. Outer Bounding Box Lines
    const cageGeo = new THREE.BoxGeometry(BOX_WIDTH, BOX_DEPTH, BOX_LENGTH);
    const cageEdges = new THREE.EdgesGeometry(cageGeo);
    const cageMat = new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 2 });
    const cageLine = new THREE.LineSegments(cageEdges, cageMat);
    cageLine.position.set(0, -d / 2, 0);
    cageGroup.add(cageLine);

    // 2. Base Grid (Seafloor 1000m)
    const gridHelper = new THREE.GridHelper(BOX_WIDTH, 10, 0x0ea5e9, 0x1e3a5f);
    gridHelper.position.set(0, -d, 0);
    cageGroup.add(gridHelper);

    // 3. Depth Tick Marks & Labels
    const depthLevels = [
      { y: 0, label: "0m (Surface)" },
      { y: -d * 0.15, label: "50m (SLD)" },
      { y: -d * 0.30, label: "100m (Thermocline)" },
      { y: -d * 0.50, label: "200m" },
      { y: -d * 0.75, label: "500m" },
      { y: -d, label: "1000m (Abyssal)" }
    ];

    depthLevels.forEach(dl => {
      const ringGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-w, dl.y, -l),
        new THREE.Vector3(w, dl.y, -l),
        new THREE.Vector3(w, dl.y, l),
        new THREE.Vector3(-w, dl.y, l),
        new THREE.Vector3(-w, dl.y, -l)
      ]);
      const ringLine = new THREE.Line(ringGeo, new THREE.LineBasicMaterial({ color: 0x0369a1, transparent: true, opacity: 0.55 }));
      cageGroup.add(ringLine);
    });

    // 4. North Compass Indicator
    const arrowDir = new THREE.Vector3(0, 0, -1);
    const arrowOrigin = new THREE.Vector3(w + 5, 0, l - 5);
    const arrowHelper = new THREE.ArrowHelper(arrowDir, arrowOrigin, 8, 0x22d3ee, 2.5, 1.5);
    cageGroup.add(arrowHelper);
  }

  // Load Data and Build 3D Models
  async function loadAndBuildData() {
    try {
      if (window.appState && window.appState.currentDayData) {
        state.data = window.appState.currentDayData;
      } else {
        const res = await fetch("/data/day_2026-08-16.json");
        if (res.ok) {
          state.data = await res.json();
        }
      }

      build3DVolumetric();
      build3DFenceDiagram();
      build3DTacticalMission();
      updateVisibilityMode();
    } catch (e) {
      console.warn("Notice loading 3D dataset, using synthetic strata:", e);
      build3DVolumetric();
      build3DFenceDiagram();
      build3DTacticalMission();
      updateVisibilityMode();
    }
  }

  // Mode 1: 3D Volumetric Layer Stack (Top panel of MDPI sample)
  function build3DVolumetric() {
    if (!volumeGroup) return;
    volumeGroup.clear();

    const w = BOX_WIDTH;
    const l = BOX_LENGTH;
    const totalD = BOX_DEPTH;

    // Fractional Y positions for depths [0, 50, 100, 200, 500, 1000]m
    const yFractions = [0, -0.15, -0.30, -0.50, -0.75, -1.0];

    // Extract real grids or use fallback
    let grids = extractGrids(state.data);
    if (!grids || grids.length === 0) {
      grids = [0, 1, 2, 3, 4, 5].map(generateFallbackGrid);
    }

    grids.forEach((grid, k) => {
      const activeGrid = grid || generateFallbackGrid(k);
      const yPos = yFractions[k] * totalD * (state.depthScale / 1.8);
      const texture = createGridTexture(activeGrid, 6.0, 31.0);

      const planeGeo = new THREE.PlaneGeometry(w, l, 32, 32);
      planeGeo.rotateX(-Math.PI / 2);

      const planeMat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        opacity: k === 0 ? 0.95 : 0.88,
        side: THREE.DoubleSide,
        roughness: 0.35,
        metalness: 0.1
      });

      const planeMesh = new THREE.Mesh(planeGeo, planeMat);
      planeMesh.position.y = yPos;
      planeMesh.userData = { depth_idx: k, depth_m: DEPTHS[k], type: "layer" };
      volumeGroup.add(planeMesh);
    });

    // Build Vertical Side Curtains (Edges connecting 0m to 1000m like the solid block in MDPI)
    buildBlockCurtains(w, l, totalD);
  }

  // Solid Block Side Curtains
  function buildBlockCurtains(w, l, d) {
    const halfW = w / 2;
    const halfL = l / 2;

    const curtainMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      wireframe: false
    });

    const wallDefs = [
      { geo: new THREE.PlaneGeometry(w, d), pos: [0, -d / 2, halfL], rot: [0, 0, 0] },
      { geo: new THREE.PlaneGeometry(w, d), pos: [0, -d / 2, -halfL], rot: [0, Math.PI, 0] },
      { geo: new THREE.PlaneGeometry(l, d), pos: [-halfW, -d / 2, 0], rot: [0, -Math.PI / 2, 0] },
      { geo: new THREE.PlaneGeometry(l, d), pos: [halfW, -d / 2, 0], rot: [0, Math.PI / 2, 0] }
    ];

    wallDefs.forEach(def => {
      const mesh = new THREE.Mesh(def.geo, curtainMat);
      mesh.position.set(def.pos[0], def.pos[1], def.pos[2]);
      mesh.rotation.set(def.rot[0], def.rot[1], def.rot[2]);
      volumeGroup.add(mesh);
    });
  }

  // Mode 2: 3D Orthogonal Fence Diagram (Bottom panel of MDPI sample)
  function build3DFenceDiagram() {
    if (!fenceGroup) return;
    fenceGroup.clear();

    const w = BOX_WIDTH;
    const l = BOX_LENGTH;
    const d = BOX_DEPTH * (state.depthScale / 1.8);

    // Zonal Transects
    const zonalFractions = [-0.35, 0.0, 0.35];
    zonalFractions.forEach(zf => {
      const fenceGeo = new THREE.PlaneGeometry(w, d, 32, 16);
      const canvasTexture = createVerticalFenceTexture("zonal", zf);
      const fenceMat = new THREE.MeshStandardMaterial({
        map: canvasTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.94
      });
      const fenceMesh = new THREE.Mesh(fenceGeo, fenceMat);
      fenceMesh.position.set(0, -d / 2, zf * l);
      fenceMesh.userData = { type: "fence", orientation: "zonal" };
      fenceGroup.add(fenceMesh);

      const edges = new THREE.EdgesGeometry(fenceGeo);
      const edgeLine = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x06b6d4, linewidth: 2 }));
      edgeLine.position.set(0, -d / 2, zf * l);
      fenceGroup.add(edgeLine);
    });

    // Meridional Transects
    const meridionalFractions = [-0.35, 0.0, 0.35];
    meridionalFractions.forEach(mf => {
      const fenceGeo = new THREE.PlaneGeometry(l, d, 32, 16);
      fenceGeo.rotateY(Math.PI / 2);
      const canvasTexture = createVerticalFenceTexture("meridional", mf);
      const fenceMat = new THREE.MeshStandardMaterial({
        map: canvasTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.94
      });
      const fenceMesh = new THREE.Mesh(fenceGeo, fenceMat);
      fenceMesh.position.set(mf * w, -d / 2, 0);
      fenceMesh.userData = { type: "fence", orientation: "meridional" };
      fenceGroup.add(fenceMesh);

      const edges = new THREE.EdgesGeometry(fenceGeo);
      const edgeLine = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 }));
      edgeLine.position.set(mf * w, -d / 2, 0);
      fenceGroup.add(edgeLine);
    });
  }

  // Synthetic Vertical Gradient Texture for Fences
  function createVerticalFenceTexture(type, frac) {
    const cvs = document.createElement("canvas");
    cvs.width = 128;
    cvs.height = 128;
    const ctx = cvs.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0.0, "#ef4444");  // Surface warm (29°C)
    grad.addColorStop(0.15, "#f59e0b"); // 50m SLD (28°C)
    grad.addColorStop(0.35, "#10b981"); // 100m Thermocline (24°C)
    grad.addColorStop(0.55, "#06b6d4"); // 200m (17°C)
    grad.addColorStop(0.80, "#3b82f6"); // 500m (11°C)
    grad.addColorStop(1.0, "#1e1b4b");  // 1000m Cold Abyssal (6°C)

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1.5;
    [15, 35, 55, 80].forEach(y => {
      ctx.beginPath();
      ctx.moveTo(0, y + Math.sin(frac * 3) * 6);
      ctx.bezierCurveTo(40, y + 8, 80, y - 6, 128, y + Math.sin(frac * 3) * 6);
      ctx.stroke();
    });

    const tex = new THREE.CanvasTexture(cvs);
    tex.needsUpdate = true;
    return tex;
  }

  // Mode 3: UAV Aerial Patrol & Subsurface Autonomous Glider Trajectory
  function build3DTacticalMission() {
    if (!tacticalGroup) return;
    tacticalGroup.clear();

    // 1. Aerial UAV Drone Flight Path (Altitude +18 above water)
    const uavAlt = 16;
    const pathRadiusX = 18;
    const pathRadiusZ = 14;

    const curvePoints = [];
    for (let a = 0; a <= Math.PI * 2; a += 0.1) {
      curvePoints.push(new THREE.Vector3(Math.cos(a) * pathRadiusX, uavAlt, Math.sin(a) * pathRadiusZ));
    }
    const pathGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const pathMat = new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 2, gapSize: 1 });
    const flightLine = new THREE.Line(pathGeo, pathMat);
    flightLine.computeLineDistances();
    tacticalGroup.add(flightLine);

    // UAV Stylized 3D Mesh
    const uavObj = new THREE.Group();
    const bodyGeo = new THREE.ConeGeometry(0.8, 3.5, 8);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, metalness: 0.8 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    uavObj.add(bodyMesh);

    const wingGeo = new THREE.BoxGeometry(6.5, 0.15, 1.0);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const wingMesh = new THREE.Mesh(wingGeo, wingMat);
    uavObj.add(wingMesh);

    uavObj.position.set(pathRadiusX, uavAlt, 0);
    uavObj.name = "uavDrone";
    tacticalGroup.add(uavObj);

    // UAV Downward Scanning Radar Frustum Cone
    const coneGeo = new THREE.ConeGeometry(8, uavAlt, 16, 1, true);
    coneGeo.rotateX(Math.PI);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const scanCone = new THREE.Mesh(coneGeo, coneMat);
    scanCone.position.set(pathRadiusX, uavAlt / 2, 0);
    scanCone.name = "scanCone";
    tacticalGroup.add(scanCone);

    // 2. Targeted Sonobuoy Drop Trajectory & Hydrophone Deployment
    const dropX = 6;
    const dropZ = 4;
    const sldY = -BOX_DEPTH * 0.15 * (state.depthScale / 1.8);
    const thermY = -BOX_DEPTH * 0.50 * (state.depthScale / 1.8);

    // Surface Buoy Float
    const buoyGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.6, 12);
    const buoyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0x78350f });
    const buoyMesh = new THREE.Mesh(buoyGeo, buoyMat);
    buoyMesh.position.set(dropX, 0.3, dropZ);
    tacticalGroup.add(buoyMesh);

    // Vertical Sonobuoy Hydrophone Cable
    const cablePoints = [
      new THREE.Vector3(dropX, 0, dropZ),
      new THREE.Vector3(dropX, sldY, dropZ),
      new THREE.Vector3(dropX, thermY, dropZ)
    ];
    const cableGeo = new THREE.BufferGeometry().setFromPoints(cablePoints);
    const cableLine = new THREE.Line(cableGeo, new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 }));
    tacticalGroup.add(cableLine);

    // Hydrophone Sensor #1 at Sonic Layer Depth (50m SLD)
    const hydro1Geo = new THREE.SphereGeometry(0.65, 12, 12);
    const hydro1Mat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x064e3b });
    const hydro1Mesh = new THREE.Mesh(hydro1Geo, hydro1Mat);
    hydro1Mesh.position.set(dropX, sldY, dropZ);
    tacticalGroup.add(hydro1Mesh);

    // Acoustic Wave Pulsing Torus Rings at SLD
    for (let r = 1; r <= 3; r++) {
      const waveGeo = new THREE.TorusGeometry(r * 2.8, 0.08, 8, 32);
      waveGeo.rotateX(Math.PI / 2);
      const waveMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 - r * 0.12 });
      const waveRing = new THREE.Mesh(waveGeo, waveMat);
      waveRing.position.set(dropX, sldY, dropZ);
      tacticalGroup.add(waveRing);
    }

    // 3. Autonomous Glider (UUV) Sawtooth Trajectory
    const gliderPoints = [
      new THREE.Vector3(-18, -1, -12),
      new THREE.Vector3(-12, -8, -6),
      new THREE.Vector3(-6, -2, 0),
      new THREE.Vector3(0, -9, 6),
      new THREE.Vector3(6, -2, 12),
      new THREE.Vector3(12, -8, 16)
    ];
    const gliderCurve = new THREE.CatmullRomCurve3(gliderPoints);
    const gliderPathGeo = new THREE.TubeGeometry(gliderCurve, 40, 0.18, 8, false);
    const gliderPathMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.75 });
    const gliderPathMesh = new THREE.Mesh(gliderPathGeo, gliderPathMat);
    tacticalGroup.add(gliderPathMesh);

    // Glider 3D Model
    const gliderMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 2.0, 8),
      new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.3 })
    );
    gliderMesh.name = "uuvGlider";
    gliderMesh.position.copy(gliderPoints[0]);
    tacticalGroup.add(gliderMesh);
  }

  // Visibility and Mode Switching
  function updateVisibilityMode() {
    if (!volumeGroup || !fenceGroup || !tacticalGroup) return;

    if (state.mode === "volumetric") {
      volumeGroup.visible = true;
      fenceGroup.visible = false;
      tacticalGroup.visible = true;
      volumeGroup.children.forEach(c => {
        if (c.material) {
          c.material.opacity = (c.userData && c.userData.type === "layer") ? (c.userData.depth_idx === 0 ? 0.95 : 0.88) : 0.42;
        }
      });
    } else if (state.mode === "fence") {
      volumeGroup.visible = false;
      fenceGroup.visible = true;
      tacticalGroup.visible = true;
    } else if (state.mode === "tactical") {
      volumeGroup.visible = true;
      fenceGroup.visible = false;
      tacticalGroup.visible = true;
      volumeGroup.children.forEach(c => {
        if (c.material) c.material.opacity = 0.35;
      });
    } else if (state.mode === "acoustic") {
      volumeGroup.visible = true;
      fenceGroup.visible = true;
      tacticalGroup.visible = true;
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  // Animation Loop
  function animate() {
    animId = requestAnimationFrame(animate);

    if (controls) controls.update();

    // 1. Animate UAV Circular Orbit
    state.uavAngle += 0.012;
    if (tacticalGroup) {
      const uav = tacticalGroup.getObjectByName("uavDrone");
      const scanCone = tacticalGroup.getObjectByName("scanCone");
      if (uav && scanCone) {
        const rX = 18;
        const rZ = 14;
        const x = Math.cos(state.uavAngle) * rX;
        const z = Math.sin(state.uavAngle) * rZ;
        uav.position.x = x;
        uav.position.z = z;
        uav.rotation.y = -state.uavAngle + Math.PI / 2;

        scanCone.position.x = x;
        scanCone.position.z = z;
      }
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  // Mouse Move & 3D Raycasting Probe
  function onMouseMove(event) {
    if (!canvas || !renderer || !camera || !volumeGroup || !fenceGroup) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(volumeGroup.children.concat(fenceGroup.children), true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      if (hoverCrosshair) {
        hoverCrosshair.position.copy(hit.point);
        hoverCrosshair.visible = true;
      }

      const normX = (hit.point.x + BOX_WIDTH / 2) / BOX_WIDTH;
      const normZ = (hit.point.z + BOX_LENGTH / 2) / BOX_LENGTH;
      const normY = Math.abs(hit.point.y) / (BOX_DEPTH * (state.depthScale / 1.8));

      const lon = (LON_MIN + normX * (LON_MAX - LON_MIN)).toFixed(2);
      const lat = (LAT_MAX - normZ * (LAT_MAX - LAT_MIN)).toFixed(2);
      const depth_m = Math.min(1000, Math.round(normY * 1000));

      const temp = (29.5 - normY * 23.5).toFixed(2);
      const soundSpeed = calcSoundSpeed(parseFloat(temp), depth_m).toFixed(1);

      updateHudReadout(lat, lon, depth_m, temp, soundSpeed);
    } else {
      if (hoverCrosshair) hoverCrosshair.visible = false;
    }
  }

  // Update HUD Inspector Box
  function updateHudReadout(lat, lon, depth_m, temp, soundSpeed) {
    const elCoords = document.getElementById("hud3dCoords");
    const elTemp = document.getElementById("hud3dTemp");
    const elSound = document.getElementById("hud3dSound");
    const elLayer = document.getElementById("hud3dLayer");

    if (elCoords) elCoords.textContent = `${lat}°N, ${lon}°E (Depth: ${depth_m}m)`;
    if (elTemp) elTemp.textContent = `${temp} °C`;
    if (elSound) elSound.textContent = `${soundSpeed} m/s`;
    if (elLayer) {
      if (depth_m <= 50) {
        elLayer.textContent = "Surface Acoustic Duct (Optimal Sonobuoy Release)";
        elLayer.style.color = "#10b981";
      } else if (depth_m <= 200) {
        elLayer.textContent = "Thermocline Core (Glider Buoyancy Equilibrium)";
        elLayer.style.color = "#38bdf8";
      } else {
        elLayer.textContent = "Deep Subsurface Isothermal Layer";
        elLayer.style.color = "#94a3b8";
      }
    }
  }

  // Handle Resize
  function onWindowResize() {
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth > 0 ? container.clientWidth : 800;
    const height = container.clientHeight > 0 ? container.clientHeight : 460;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  // Setup DOM UI Controls
  function setupUIControls() {
    // Mode Buttons
    document.querySelectorAll(".btn-3d-mode").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".btn-3d-mode").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.mode = btn.dataset.mode;
        updateVisibilityMode();
      });
    });

    // Depth Exaggeration Slider
    const depthSlider = document.getElementById("slider3dDepthScale");
    if (depthSlider) {
      depthSlider.addEventListener("input", (e) => {
        state.depthScale = parseFloat(e.target.value);
        const lbl = document.getElementById("lbl3dDepthScale");
        if (lbl) lbl.textContent = `${state.depthScale.toFixed(1)}x`;
        build3DVolumetric();
        build3DFenceDiagram();
        build3DTacticalMission();
        updateVisibilityMode();
      });
    }

    // Reset View Button
    const btnReset = document.getElementById("btn3dResetView");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        if (camera) {
          camera.position.set(58, 48, 70);
          camera.lookAt(0, -BOX_DEPTH / 2, 0);
        }
        if (controls) {
          controls.target.set(0, -BOX_DEPTH / 2, 0);
          controls.update();
        }
        if (renderer && scene && camera) renderer.render(scene, camera);
      });
    }
  }

  // Expose to window for external triggers
  window.Ocean3D = {
    init: init3D,
    resize: onWindowResize,
    updateData: (newData) => {
      if (newData) {
        state.data = newData;
        if (!state.isInitialized || !volumeGroup) {
          init3D();
          return;
        }
        build3DVolumetric();
        build3DFenceDiagram();
        build3DTacticalMission();
        updateVisibilityMode();
        if (renderer && scene && camera) renderer.render(scene, camera);
      }
    },
    setMode: (m) => {
      state.mode = m;
      updateVisibilityMode();
    },
    resetCamera: () => {
      if (camera) {
        camera.position.set(58, 48, 70);
        camera.lookAt(0, -BOX_DEPTH / 2, 0);
      }
      if (controls) {
        controls.target.set(0, -BOX_DEPTH / 2, 0);
        controls.update();
      }
      if (renderer && scene && camera) renderer.render(scene, camera);
    }
  };

  // Auto-init immediately or when DOM ready
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(init3D, 50);
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(init3D, 50);
    });
  }
})();
