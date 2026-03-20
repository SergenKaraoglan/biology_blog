/**
 * Starlink: The Orbital Web — Engineering Visuals
 */

// --- HERO VISUAL: GLOBAL CONSTELLATION ---
const heroCanvas = document.getElementById('hero-starlink-canvas');
const heroCtx = heroCanvas.getContext('2d');
let time = 0;

function resizeHero() {
    heroCanvas.width = window.innerWidth;
    heroCanvas.height = 400;
}
window.addEventListener('resize', resizeHero);
resizeHero();

const satellites = Array.from({ length: 60 }, () => ({
    angle: Math.random() * Math.PI * 2,
    orbit: 100 + Math.random() * 80,
    speed: 0.002 + Math.random() * 0.005,
    tilt: (Math.random() - 0.5) * 1.5
}));

function animateHero() {
    const w = heroCanvas.width;
    const h = heroCanvas.height;
    heroCtx.fillStyle = '#02050a';
    heroCtx.fillRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;

    // Earth Glow
    const gradient = heroCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#02050a');
    heroCtx.fillStyle = gradient;
    heroCtx.beginPath();
    heroCtx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    heroCtx.fill();

    // Satellite Constellation
    satellites.forEach(sat => {
        const x = centerX + Math.cos(sat.angle) * sat.orbit;
        const y = centerY + Math.sin(sat.angle) * sat.orbit * Math.cos(sat.tilt);

        heroCtx.fillStyle = '#f59e0b';
        heroCtx.beginPath();
        heroCtx.arc(x, y, 1.5, 0, Math.PI * 2);
        heroCtx.fill();

        // Signal Faint Line
        if (Math.random() > 0.99) {
            heroCtx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
            heroCtx.beginPath();
            heroCtx.moveTo(x, y);
            const other = satellites[Math.floor(Math.random() * satellites.length)];
            const ox = centerX + Math.cos(other.angle) * other.orbit;
            const oy = centerY + Math.sin(other.angle) * other.orbit * Math.cos(other.tilt);
            heroCtx.lineTo(ox, oy);
            heroCtx.stroke();
        }

        sat.angle += sat.speed;
    });

    time += 0.01;
    requestAnimationFrame(animateHero);
}
animateHero();

// --- ORBITAL DYNAMICS ---
const orbitCanvas = document.getElementById('orbit-canvas');
const orbitCtx = orbitCanvas.getContext('2d');
const orbitSlider = document.getElementById('orbit-slider');
const valAltitude = document.getElementById('val-altitude');
const valVelocity = document.getElementById('val-velocity');

function drawOrbit() {
    const w = orbitCanvas.width;
    const h = orbitCanvas.height;
    const altitude = parseInt(orbitSlider.value);

    // G = 6.674e-11, M = 5.972e24, R = 6371000m
    const R = 6371;
    const totalR = R + altitude;
    const velocity = Math.sqrt((398600.4418 / totalR)); // km/s simplified formula

    valAltitude.innerText = `${altitude} km`;
    valVelocity.innerText = `${velocity.toFixed(2)} km/s`;

    orbitCtx.fillStyle = '#000';
    orbitCtx.fillRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;
    const scale = 0.02; // Earth is 127px at 6371km

    // Earth
    orbitCtx.fillStyle = '#1e293b';
    orbitCtx.beginPath();
    orbitCtx.arc(centerX, centerY, R * scale, 0, Math.PI * 2);
    orbitCtx.fill();

    // Orbit Path
    orbitCtx.strokeStyle = '#3b82f6';
    orbitCtx.setLineDash([5, 5]);
    orbitCtx.beginPath();
    orbitCtx.arc(centerX, centerY, totalR * scale, 0, Math.PI * 2);
    orbitCtx.stroke();
    orbitCtx.setLineDash([]);

    // Satellite
    const satAngle = time * (velocity / totalR) * 200;
    const satX = centerX + Math.cos(satAngle) * (totalR * scale);
    const satY = centerY + Math.sin(satAngle) * (totalR * scale);

    orbitCtx.fillStyle = '#f59e0b';
    orbitCtx.beginPath();
    orbitCtx.arc(satX, satY, 4, 0, Math.PI * 2);
    orbitCtx.fill();

    requestAnimationFrame(drawOrbit);
}
drawOrbit();

// --- PHASED ARRAY BEAMFORMING ---
const beamCanvas = document.getElementById('beam-canvas');
const beamCtx = beamCanvas.getContext('2d');
const beamSlider = document.getElementById('beam-slider');
const freqSlider = document.getElementById('freq-slider');

function drawBeamforming() {
    const w = beamCanvas.width;
    const h = beamCanvas.height;
    const angle = (parseInt(beamSlider.value) * Math.PI) / 180;
    const freq = parseInt(freqSlider.value) * 0.5;

    beamCtx.fillStyle = '#000';
    beamCtx.fillRect(0, 0, w, h);

    // Dynamic wave simulation
    const emitters = 32;
    const spacing = w / (emitters + 1);

    for (let i = 0; i < emitters; i++) {
        const ex = (i + 1) * spacing;
        const ey = h - 20;

        // Phase offset based on steering angle
        const phaseOffset = i * Math.sin(angle) * (20 / freq);

        beamCtx.fillStyle = 'rgba(245, 158, 11, 0.4)';
        beamCtx.beginPath();
        beamCtx.arc(ex, ey, 2, 0, Math.PI * 2);
        beamCtx.fill();

        // Wavefronts
        for (let r = 1; r < 5; r++) {
            const radius = (time * 50 + phaseOffset) % 200 + r * 10;
            if (radius > 200) continue;
            beamCtx.strokeStyle = `rgba(59, 130, 246, ${1 - radius / 200})`;
            beamCtx.beginPath();
            beamCtx.arc(ex, ey, radius, Math.PI + angle - 0.5, Math.PI + angle + 0.5);
            beamCtx.stroke();
        }
    }
}

function beamLoop() {
    drawBeamforming();
    requestAnimationFrame(beamLoop);
}
beamLoop();

// --- WAVE INTERFERENCE PATTERN ---
const intfCanvas = document.getElementById('interference-canvas');
const intfCtx = intfCanvas.getContext('2d');
let intfTime = 0;
const sourceSepSlider = document.getElementById('source-sep-slider');
const wavelengthSlider = document.getElementById('wavelength-slider');

function drawInterference() {
    const w = intfCanvas.width;
    const h = intfCanvas.height;
    intfTime += 0.06;

    const sep = parseInt(sourceSepSlider.value);
    const wl = parseInt(wavelengthSlider.value);
    const cx = w / 2;
    const cy = h;

    // Source positions (at bottom of canvas)
    const s1x = cx - sep / 2;
    const s1y = cy;
    const s2x = cx + sep / 2;
    const s2y = cy;

    // Render interference pattern using ImageData for performance
    const imgData = intfCtx.createImageData(w, h);
    const data = imgData.data;
    const k = (2 * Math.PI) / wl;

    // Sample every 2 pixels for performance, then fill 2x2 blocks
    for (let y = 0; y < h; y += 2) {
        for (let x = 0; x < w; x += 2) {
            const d1 = Math.sqrt((x - s1x) ** 2 + (y - s1y) ** 2);
            const d2 = Math.sqrt((x - s2x) ** 2 + (y - s2y) ** 2);

            // Wave amplitudes
            const a1 = Math.sin(k * d1 - intfTime) / (1 + d1 * 0.005);
            const a2 = Math.sin(k * d2 - intfTime) / (1 + d2 * 0.005);
            const combined = (a1 + a2) * 0.5;

            // Map to color: constructive = bright, destructive = dark
            const intensity = (combined + 1) * 0.5; // 0 to 1
            const r = Math.floor(intensity * 245 * 0.6);
            const g = Math.floor(intensity * 158 * 0.4 + intensity * 130 * 0.3);
            const b = Math.floor(intensity * 246 * 0.5);

            // Fill 2x2 block
            for (let dy = 0; dy < 2 && y + dy < h; dy++) {
                for (let dx = 0; dx < 2 && x + dx < w; dx++) {
                    const idx = ((y + dy) * w + (x + dx)) * 4;
                    data[idx] = r;
                    data[idx + 1] = g;
                    data[idx + 2] = b;
                    data[idx + 3] = 255;
                }
            }
        }
    }
    intfCtx.putImageData(imgData, 0, 0);

    // Draw source markers
    [{ x: s1x, y: s1y }, { x: s2x, y: s2y }].forEach(s => {
        intfCtx.fillStyle = '#f59e0b';
        intfCtx.beginPath();
        intfCtx.arc(s.x, s.y, 5, 0, Math.PI * 2);
        intfCtx.fill();
        intfCtx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        intfCtx.lineWidth = 1;
        intfCtx.beginPath();
        intfCtx.arc(s.x, s.y, 10, 0, Math.PI * 2);
        intfCtx.stroke();
    });

    // Labels
    intfCtx.fillStyle = 'rgba(255,255,255,0.5)';
    intfCtx.font = '8px monospace';
    intfCtx.textAlign = 'left';
    intfCtx.fillText(`λ = ${wl}px  |  d = ${sep}px`, 10, 15);
    intfCtx.fillText('BRIGHT = CONSTRUCTIVE  |  DARK = DESTRUCTIVE', 10, 27);

    requestAnimationFrame(drawInterference);
}
drawInterference();

// --- VACUUM vs FIBER LATENCY ---
const laserCanvas = document.getElementById('laser-canvas');
const laserCtx = laserCanvas.getContext('2d');
let testingLatency = false;
let testStartTime = 0;
let fiberProgress = 0;
let spaceProgress = 0;

// Route geometry
const LON_X = 80;           // London endpoint
const NYC_X = 720;          // New York endpoint
const MID_X = (LON_X + NYC_X) / 2;
const HALF_SPAN = (NYC_X - LON_X) / 2;

// Relay satellite positions (3 hops)
const relaySats = [
    { x: 240, y: 35 },
    { x: 400, y: 25 },
    { x: 560, y: 35 }
];

function earthY(x) {
    // Gentle arc: highest at center (y=155), lowest at edges (y=195)
    const t = (x - MID_X) / HALF_SPAN; // -1 to 1
    return 155 + t * t * 40;
}

function drawLatency() {
    const w = laserCanvas.width;
    const h = laserCanvas.height;
    laserCtx.fillStyle = '#02050a';
    laserCtx.fillRect(0, 0, w, h);

    // --- Earth surface arc ---
    laserCtx.strokeStyle = '#2d4a6f';
    laserCtx.lineWidth = 2;
    laserCtx.beginPath();
    for (let x = LON_X - 30; x <= NYC_X + 30; x += 2) {
        const y = earthY(x);
        if (x === LON_X - 30) laserCtx.moveTo(x, y);
        else laserCtx.lineTo(x, y);
    }
    laserCtx.stroke();

    // Earth fill (below the arc)
    laserCtx.fillStyle = '#0d1b2a';
    laserCtx.beginPath();
    for (let x = LON_X - 30; x <= NYC_X + 30; x += 2) {
        const y = earthY(x);
        if (x === LON_X - 30) laserCtx.moveTo(x, y);
        else laserCtx.lineTo(x, y);
    }
    laserCtx.lineTo(NYC_X + 30, h);
    laserCtx.lineTo(LON_X - 30, h);
    laserCtx.closePath();
    laserCtx.fill();

    // --- City markers ---
    const lonY = earthY(LON_X);
    const nycY = earthY(NYC_X);

    // London
    laserCtx.fillStyle = '#f59e0b';
    laserCtx.beginPath();
    laserCtx.arc(LON_X, lonY - 5, 5, 0, Math.PI * 2);
    laserCtx.fill();
    laserCtx.font = 'bold 9px monospace';
    laserCtx.textAlign = 'center';
    laserCtx.fillText('LONDON', LON_X, lonY - 15);

    // New York
    laserCtx.fillStyle = '#f59e0b';
    laserCtx.beginPath();
    laserCtx.arc(NYC_X, nycY - 5, 5, 0, Math.PI * 2);
    laserCtx.fill();
    laserCtx.fillText('NEW YORK', NYC_X, nycY - 15);

    // --- Fiber cable path (along Earth surface) ---
    laserCtx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    laserCtx.lineWidth = 3;
    laserCtx.beginPath();
    for (let x = LON_X; x <= NYC_X; x += 2) {
        const y = earthY(x) + 8;
        if (x === LON_X) laserCtx.moveTo(x, y);
        else laserCtx.lineTo(x, y);
    }
    laserCtx.stroke();

    // --- Satellite relay path (arcing through space) ---
    // Draw path: London → Sat1 → Sat2 → Sat3 → NYC
    const spaceNodes = [
        { x: LON_X, y: lonY - 5 },
        ...relaySats,
        { x: NYC_X, y: nycY - 5 }
    ];

    laserCtx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
    laserCtx.lineWidth = 1;
    laserCtx.setLineDash([4, 4]);
    laserCtx.beginPath();
    laserCtx.moveTo(spaceNodes[0].x, spaceNodes[0].y);
    for (let i = 1; i < spaceNodes.length; i++) {
        laserCtx.lineTo(spaceNodes[i].x, spaceNodes[i].y);
    }
    laserCtx.stroke();
    laserCtx.setLineDash([]);

    // Draw relay satellites
    relaySats.forEach(sat => {
        laserCtx.fillStyle = '#f59e0b';
        laserCtx.fillRect(sat.x - 4, sat.y - 2, 8, 4);
        // Solar panels
        laserCtx.fillStyle = '#334155';
        laserCtx.fillRect(sat.x - 10, sat.y - 1, 5, 2);
        laserCtx.fillRect(sat.x + 5, sat.y - 1, 5, 2);
    });

    // --- Latency test animation ---
    if (testingLatency) {
        const elapsed = performance.now() - testStartTime;
        spaceProgress = Math.min(1, elapsed / 1200);
        fiberProgress = Math.min(1, elapsed / 1760);  // 1.47x slower

        if (fiberProgress >= 1) testingLatency = false;
    }

    // --- Fiber signal packet ---
    if (fiberProgress > 0) {
        const fx = LON_X + fiberProgress * (NYC_X - LON_X);
        const fy = earthY(fx) + 8;
        // Trail
        const trailLen = 40;
        laserCtx.strokeStyle = '#3b82f6';
        laserCtx.lineWidth = 3;
        laserCtx.beginPath();
        const trailStart = Math.max(LON_X, fx - trailLen);
        for (let x = trailStart; x <= fx; x += 2) {
            const y = earthY(x) + 8;
            if (x === trailStart) laserCtx.moveTo(x, y);
            else laserCtx.lineTo(x, y);
        }
        laserCtx.stroke();
        // Packet head
        laserCtx.fillStyle = '#3b82f6';
        laserCtx.beginPath();
        laserCtx.arc(fx, fy, 4, 0, Math.PI * 2);
        laserCtx.fill();
    }

    // --- Space signal packet ---
    if (spaceProgress > 0) {
        // Interpolate along the polyline path
        const totalSegs = spaceNodes.length - 1;
        const segFloat = spaceProgress * totalSegs;
        const segIdx = Math.min(Math.floor(segFloat), totalSegs - 1);
        const segFrac = segFloat - segIdx;
        const a = spaceNodes[segIdx];
        const b = spaceNodes[segIdx + 1];
        const sx = a.x + (b.x - a.x) * segFrac;
        const sy = a.y + (b.y - a.y) * segFrac;

        // Active laser link glow
        laserCtx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        laserCtx.lineWidth = 2;
        laserCtx.beginPath();
        laserCtx.moveTo(a.x, a.y);
        laserCtx.lineTo(sx, sy);
        laserCtx.stroke();

        // Packet head
        laserCtx.fillStyle = '#f59e0b';
        laserCtx.beginPath();
        laserCtx.arc(sx, sy, 4, 0, Math.PI * 2);
        laserCtx.fill();
        // Glow
        laserCtx.beginPath();
        laserCtx.arc(sx, sy, 8, 0, Math.PI * 2);
        laserCtx.fillStyle = 'rgba(245, 158, 11, 0.15)';
        laserCtx.fill();
    }

    // --- Live latency counters ---
    if (spaceProgress > 0 || fiberProgress > 0) {
        const spaceMs = Math.floor(spaceProgress * 28);  // ~28ms one-way London→NYC via LEO
        const fiberMs = Math.floor(fiberProgress * 41);   // ~41ms one-way via fiber

        laserCtx.font = 'bold 10px monospace';
        laserCtx.textAlign = 'right';

        // Space time
        laserCtx.fillStyle = spaceProgress >= 1 ? '#22c55e' : '#f59e0b';
        laserCtx.fillText(`SPACE: ${spaceMs}ms`, w - 20, 20);
        if (spaceProgress >= 1 && fiberProgress < 1) {
            laserCtx.fillStyle = '#22c55e';
            laserCtx.font = 'bold 8px monospace';
            laserCtx.fillText('✓ ARRIVED', w - 20, 32);
        }

        // Fiber time
        laserCtx.font = 'bold 10px monospace';
        laserCtx.fillStyle = fiberProgress >= 1 ? '#22c55e' : '#3b82f6';
        laserCtx.fillText(`FIBER: ${fiberMs}ms`, w - 20, 50);
    }

    // --- Labels ---
    laserCtx.fillStyle = 'rgba(255,255,255,0.1)';
    laserCtx.font = '7px monospace';
    laserCtx.textAlign = 'left';
    laserCtx.fillText('c = 299,792 km/s (VACUUM)', 20, h - 8);
    laserCtx.fillText('c/n ≈ 204,000 km/s (GLASS)', 20, h - 18);

    requestAnimationFrame(drawLatency);
}

document.getElementById('run-latency-test').onclick = () => {
    testingLatency = true;
    testStartTime = performance.now();
    spaceProgress = 0;
    fiberProgress = 0;
};

// --- CONSTELLATION COVERAGE ---
const constCanvas = document.getElementById('constellation-canvas');
const constCtx = constCanvas.getContext('2d');
const satSlider = document.getElementById('sat-count-slider');
const planeSlider = document.getElementById('plane-count-slider');

function drawConstellation() {
    const w = constCanvas.width;
    const h = constCanvas.height;
    const satsPerPlane = parseInt(satSlider.value);
    const planes = parseInt(planeSlider.value);

    constCtx.fillStyle = '#000';
    constCtx.fillRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;
    const earthR = 80;

    // Earth
    constCtx.fillStyle = '#1e293b';
    constCtx.beginPath();
    constCtx.arc(centerX, centerY, earthR, 0, Math.PI * 2);
    constCtx.fill();

    for (let p = 0; p < planes; p++) {
        const planeAngle = (p / planes) * Math.PI;

        for (let s = 0; s < satsPerPlane; s++) {
            const satPos = (s / satsPerPlane) * Math.PI * 2 + time * 0.5;

            const orbitR = 120;
            const x = centerX + Math.cos(satPos) * orbitR * Math.cos(planeAngle);
            const y = centerY + Math.sin(satPos) * orbitR;
            const z = Math.cos(satPos) * orbitR * Math.sin(planeAngle);

            // Simple 3D projection
            const scale = (z + 200) / 200;
            const px = centerX + (x - centerX) * scale;
            const py = centerY + (y - centerY) * scale;

            if (z < 0) { // Behind Earth
                constCtx.fillStyle = 'rgba(245, 158, 11, 0.2)';
            } else {
                constCtx.fillStyle = '#f59e0b';
                // Signal cone
                constCtx.fillStyle = 'rgba(59, 130, 246, 0.05)';
                constCtx.beginPath();
                constCtx.moveTo(px, py);
                constCtx.lineTo(px - 20, py + 40);
                constCtx.lineTo(px + 20, py + 40);
                constCtx.fill();
                constCtx.fillStyle = '#f59e0b';
            }

            constCtx.beginPath();
            constCtx.arc(px, py, 2 * scale, 0, Math.PI * 2);
            constCtx.fill();
        }
    }
}

function constLoop() {
    drawConstellation();
    requestAnimationFrame(constLoop);
}
constLoop();

// --- DEORBIT / ATMOSPHERIC DEMISE ---
const deorbitCanvas = document.getElementById('deorbit-canvas');
const deCtx = deorbitCanvas.getContext('2d');
let deorbitTime = 0;
let deorbitParticles = [];
let debrisFragments = [];

function drawDeorbit() {
    const w = deorbitCanvas.width;
    const h = deorbitCanvas.height;
    deCtx.fillStyle = '#02050a';
    deCtx.fillRect(0, 0, w, h);
    deorbitTime += 0.004;

    // Cycle: 0→1 = descent, resets automatically
    const cycle = deorbitTime % 1;
    const altitude = 1 - cycle;  // 1 = space, 0 = burned up

    // --- Atmospheric layers ---
    const layers = [
        { name: 'THERMOSPHERE', yStart: 0, yEnd: 0.33, color: 'rgba(15, 23, 42, 0.3)' },
        { name: 'MESOSPHERE',   yStart: 0.33, yEnd: 0.66, color: 'rgba(30, 41, 59, 0.2)' },
        { name: 'STRATOSPHERE', yStart: 0.66, yEnd: 1.0,  color: 'rgba(51, 65, 85, 0.15)' },
    ];

    layers.forEach(l => {
        const y0 = l.yStart * h;
        const y1 = l.yEnd * h;
        deCtx.fillStyle = l.color;
        deCtx.fillRect(0, y0, w, y1 - y0);
        // Layer boundary
        deCtx.strokeStyle = 'rgba(255,255,255,0.04)';
        deCtx.beginPath();
        deCtx.moveTo(0, y1);
        deCtx.lineTo(w, y1);
        deCtx.stroke();
        // Label
        deCtx.fillStyle = 'rgba(255,255,255,0.06)';
        deCtx.font = '7px monospace';
        deCtx.textAlign = 'right';
        deCtx.fillText(l.name, w - 10, y0 + 14);
    });

    // --- Satellite position ---
    const satX = 200 + cycle * (w - 400);  // Moves right as it descends
    const satY = 30 + cycle * (h - 80);    // Moves downward
    const heatLevel = Math.max(0, cycle - 0.15) / 0.85;  // 0 to 1 as heating increases
    const integrity = Math.max(0, 1 - cycle * 1.4);       // Breaks apart as it descends

    // Reset fragments at start of new cycle
    if (cycle < 0.02) {
        debrisFragments = [];
        deorbitParticles = [];
    }

    // --- Plasma sheath / heating glow ---
    if (heatLevel > 0.05) {
        const glowR = 30 + heatLevel * 40;
        const glow = deCtx.createRadialGradient(satX, satY, 0, satX, satY, glowR);
        const r = Math.floor(200 + heatLevel * 55);
        const g = Math.floor(100 * (1 - heatLevel * 0.5));
        const b = Math.floor(20 * (1 - heatLevel));
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${heatLevel * 0.3})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        deCtx.fillStyle = glow;
        deCtx.fillRect(satX - glowR, satY - glowR, glowR * 2, glowR * 2);
    }

    // --- Spawn plasma trail particles ---
    if (heatLevel > 0.1) {
        const numP = Math.floor(heatLevel * 6);
        for (let i = 0; i < numP; i++) {
            deorbitParticles.push({
                x: satX - 10 - Math.random() * 20,
                y: satY + (Math.random() - 0.5) * 15,
                vx: -2 - Math.random() * 4,
                vy: -1 + Math.random() * 2,
                life: 1,
                size: 1 + Math.random() * 3,
                hot: Math.random() > 0.4
            });
        }
    }

    // --- Break off debris fragments ---
    if (heatLevel > 0.3 && integrity > 0 && Math.random() > 0.92) {
        debrisFragments.push({
            x: satX + (Math.random() - 0.5) * 15,
            y: satY + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 3,
            vy: 1 + Math.random() * 2,
            rot: Math.random() * Math.PI * 2,
            rotV: (Math.random() - 0.5) * 0.2,
            size: 2 + Math.random() * 4,
            life: 1
        });
    }

    // --- Draw & update debris fragments ---
    debrisFragments = debrisFragments.filter(f => {
        f.x += f.vx;
        f.y += f.vy;
        f.rot += f.rotV;
        f.life -= 0.015;
        f.size *= 0.995;

        // Fragment with heating
        deCtx.save();
        deCtx.translate(f.x, f.y);
        deCtx.rotate(f.rot);
        deCtx.fillStyle = f.life > 0.5
            ? `rgba(245, 158, 11, ${f.life})`
            : `rgba(148, 163, 184, ${f.life})`;
        deCtx.fillRect(-f.size / 2, -f.size / 2, f.size, f.size);
        deCtx.restore();

        // Fragment trail
        deCtx.beginPath();
        deCtx.arc(f.x, f.y, Math.max(0, f.size * f.life * 0.5), 0, Math.PI * 2);
        deCtx.fillStyle = `rgba(245, 158, 11, ${f.life * 0.2})`;
        deCtx.fill();

        return f.life > 0 && f.y < h;
    });

    // --- Draw & update plasma particles ---
    deorbitParticles = deorbitParticles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025;

        deCtx.beginPath();
        deCtx.arc(p.x, p.y, Math.max(0, p.size * p.life), 0, Math.PI * 2);
        deCtx.fillStyle = p.hot
            ? `rgba(245, 158, 11, ${p.life * 0.6})`
            : `rgba(59, 130, 246, ${p.life * 0.4})`;
        deCtx.fill();

        return p.life > 0;
    });

    // --- Draw satellite (if still has integrity) ---
    if (integrity > 0.05) {
        const alpha = Math.min(1, integrity * 2);
        deCtx.globalAlpha = alpha;

        // Body color shifts with heat
        const bodyR = Math.floor(148 + heatLevel * 107);
        const bodyG = Math.floor(163 * (1 - heatLevel * 0.7));
        const bodyB = Math.floor(184 * (1 - heatLevel * 0.8));
        deCtx.fillStyle = `rgb(${bodyR}, ${bodyG}, ${bodyB})`;
        deCtx.fillRect(satX - 12, satY - 3, 24, 6);

        // Solar panels (shrink as they burn)
        const panelW = 8 * integrity;
        deCtx.fillStyle = `rgba(30, 58, 95, ${alpha})`;
        deCtx.fillRect(satX - 12 - panelW, satY - 1, panelW, 2);
        deCtx.fillRect(satX + 12, satY - 1, panelW, 2);

        deCtx.globalAlpha = 1;
    }

    // --- Altitude & Temperature gauges ---
    const altKm = Math.floor(altitude * 400 + 80);
    const tempK = Math.floor(300 + heatLevel * 2500);

    deCtx.fillStyle = 'rgba(255,255,255,0.5)';
    deCtx.font = '8px monospace';
    deCtx.textAlign = 'left';
    deCtx.fillText(`ALT: ${altKm}km`, 10, 15);
    deCtx.fillText(`TEMP: ${tempK}K`, 10, 27);
    deCtx.fillText(`v = 7.5 km/s`, 10, 39);

    // Integrity bar
    deCtx.fillStyle = '#111';
    deCtx.fillRect(10, 48, 80, 6);
    deCtx.fillStyle = integrity > 0.3 ? '#22c55e' : '#ef4444';
    deCtx.fillRect(10, 48, 80 * Math.max(0, integrity), 6);
    deCtx.fillStyle = 'rgba(255,255,255,0.4)';
    deCtx.font = '6px monospace';
    deCtx.fillText('STRUCTURAL', 10, 44);

    // --- Status ---
    deCtx.font = '8px monospace';
    deCtx.textAlign = 'left';
    if (integrity > 0.7) {
        deCtx.fillStyle = 'rgba(245, 158, 11, 0.6)';
        deCtx.fillText('DEORBIT BURN — ENTERING ATMOSPHERE', 10, h - 10);
    } else if (integrity > 0.05) {
        deCtx.fillStyle = 'rgba(239, 68, 68, 0.7)';
        deCtx.fillText('ABLATION IN PROGRESS — STRUCTURAL BREAKUP', 10, h - 10);
    } else {
        deCtx.fillStyle = 'rgba(34, 197, 94, 0.6)';
        deCtx.fillText('FULL DEMISE — 0% GROUND IMPACT', 10, h - 10);
    }

    requestAnimationFrame(drawDeorbit);
}
drawDeorbit();

// --- COLLISION AVOIDANCE ---
const collCanvas = document.getElementById('collision-canvas');
const collCtx = collCanvas.getContext('2d');
let debris = [];
let satAltitude = 150;       // Current Y position
let targetAltitude = 150;    // Target Y position
let collisionWarning = false;
let collTime = 0;
let pocValue = 0;            // Probability of Collision (0-1)
let thrusterParticles = [];
let maneuverActive = false;

// Orbit bands
const orbits = [
    { y: 90, label: '580km', color: 'rgba(59, 130, 246, 0.04)' },
    { y: 150, label: '550km', color: 'rgba(59, 130, 246, 0.06)' },
    { y: 210, label: '520km', color: 'rgba(59, 130, 246, 0.04)' },
];

function drawCollision() {
    const w = collCanvas.width;
    const h = collCanvas.height;
    collCtx.fillStyle = '#020810';
    collCtx.fillRect(0, 0, w, h);
    collTime += 0.016;

    // --- Orbit bands ---
    orbits.forEach(o => {
        // Band fill
        collCtx.fillStyle = o.color;
        collCtx.fillRect(0, o.y - 15, w, 30);
        // Center line
        collCtx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
        collCtx.setLineDash([8, 12]);
        collCtx.beginPath();
        collCtx.moveTo(0, o.y);
        collCtx.lineTo(w, o.y);
        collCtx.stroke();
        collCtx.setLineDash([]);
        // Label
        collCtx.fillStyle = 'rgba(59, 130, 246, 0.15)';
        collCtx.font = '7px monospace';
        collCtx.textAlign = 'right';
        collCtx.fillText(o.label, w - 8, o.y - 8);
    });

    // --- Satellite position (smooth transition) ---
    const prevAlt = satAltitude;
    satAltitude += (targetAltitude - satAltitude) * 0.04;
    maneuverActive = Math.abs(targetAltitude - satAltitude) > 2;

    // --- Thruster particles (emit when maneuvering) ---
    if (maneuverActive) {
        const dir = targetAltitude > satAltitude ? -1 : 1; // Thrust opposite to movement
        for (let i = 0; i < 2; i++) {
            thrusterParticles.push({
                x: 140 + (Math.random() - 0.5) * 10,
                y: satAltitude + dir * 8,
                vx: (Math.random() - 0.5) * 1.5,
                vy: dir * (1 + Math.random() * 2),
                life: 1,
                size: 1 + Math.random() * 2
            });
        }
    }

    // Draw & update thruster particles
    thrusterParticles = thrusterParticles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
        collCtx.globalAlpha = p.life * 0.6;
        collCtx.fillStyle = p.life > 0.5 ? '#60a5fa' : '#38bdf8';
        collCtx.beginPath();
        collCtx.arc(p.x, p.y, Math.max(0, p.size * p.life), 0, Math.PI * 2);
        collCtx.fill();
        collCtx.globalAlpha = 1;
        return p.life > 0;
    });

    // --- Detection cone (forward-looking threat zone) ---
    let closestDist = Infinity;
    let closestDebris = null;
    debris.forEach(d => {
        const dist = d.x - 150;
        if (dist > 0 && dist < closestDist) {
            closestDist = dist;
            closestDebris = d;
        }
    });

    if (closestDebris && closestDist < 500) {
        const threatAlpha = Math.max(0.02, 0.12 * (1 - closestDist / 500));
        collCtx.fillStyle = `rgba(239, 68, 68, ${threatAlpha})`;
        collCtx.beginPath();
        collCtx.moveTo(170, satAltitude);
        collCtx.lineTo(closestDebris.x, closestDebris.y - 30);
        collCtx.lineTo(closestDebris.x, closestDebris.y + 30);
        collCtx.closePath();
        collCtx.fill();
    }

    // --- Debris ---
    pocValue = 0;
    debris = debris.filter(d => {
        d.x -= d.vx;

        // PoC calculation
        const dist = d.x - 140;
        const vertDist = Math.abs(d.y - satAltitude);
        if (dist > 0 && dist < 500) {
            const proximity = 1 - dist / 500;
            const vertThreat = Math.max(0, 1 - vertDist / 60);
            const thisPoc = proximity * vertThreat;
            pocValue = Math.max(pocValue, thisPoc);

            // Trigger avoidance if PoC too high
            if (thisPoc > 0.3 && dist < 400) {
                collisionWarning = true;
                targetAltitude = d.y > 150 ? 90 : 210;
            }
        }

        // Predicted trajectory line
        collCtx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
        collCtx.setLineDash([2, 4]);
        collCtx.beginPath();
        collCtx.moveTo(d.x, d.y);
        collCtx.lineTo(d.x - 120, d.y);
        collCtx.stroke();
        collCtx.setLineDash([]);

        // Debris body (irregular shape)
        collCtx.fillStyle = '#94a3b8';
        collCtx.save();
        collCtx.translate(d.x, d.y);
        collCtx.rotate(collTime * 3 + d.x);
        collCtx.fillRect(-4, -3, 8, 6);
        collCtx.fillRect(-2, -5, 4, 2);
        collCtx.restore();

        // Danger halo
        if (Math.abs(d.x - 140) < 80 && Math.abs(d.y - satAltitude) < 40) {
            collCtx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
            collCtx.lineWidth = 1;
            collCtx.beginPath();
            collCtx.arc(d.x, d.y, 10, 0, Math.PI * 2);
            collCtx.stroke();
        }

        // Speed label
        collCtx.fillStyle = 'rgba(148, 163, 184, 0.3)';
        collCtx.font = '6px monospace';
        collCtx.textAlign = 'center';
        collCtx.fillText(`${Math.floor(d.vx * 1000)}m/s`, d.x, d.y - 10);

        return d.x > -20;
    });

    if (debris.length === 0) {
        collisionWarning = false;
        targetAltitude = 150;
        pocValue = 0;
    }

    // --- Satellite ---
    // Body
    collCtx.fillStyle = '#f59e0b';
    collCtx.fillRect(130, satAltitude - 4, 20, 8);
    // Solar panels
    collCtx.fillStyle = '#78350f';
    collCtx.fillRect(118, satAltitude - 2, 11, 4);
    collCtx.fillRect(151, satAltitude - 2, 11, 4);
    // Antenna
    collCtx.strokeStyle = '#f59e0b';
    collCtx.lineWidth = 1;
    collCtx.beginPath();
    collCtx.moveTo(140, satAltitude - 4);
    collCtx.lineTo(140, satAltitude - 12);
    collCtx.stroke();

    // --- PoC Gauge ---
    const gaugeX = 20, gaugeY = 20, gaugeW = 120, gaugeH = 10;
    collCtx.fillStyle = '#111';
    collCtx.fillRect(gaugeX, gaugeY, gaugeW, gaugeH);
    collCtx.strokeStyle = '#333';
    collCtx.strokeRect(gaugeX, gaugeY, gaugeW, gaugeH);

    // Fill color based on value
    let pocColor;
    if (pocValue < 0.3) pocColor = '#22c55e';
    else if (pocValue < 0.6) pocColor = '#f59e0b';
    else pocColor = '#ef4444';
    collCtx.fillStyle = pocColor;
    collCtx.fillRect(gaugeX + 1, gaugeY + 1, (gaugeW - 2) * pocValue, gaugeH - 2);

    // Label
    collCtx.fillStyle = 'rgba(255,255,255,0.3)';
    collCtx.font = '8px monospace';
    collCtx.textAlign = 'left';
    collCtx.fillText(`PoC: ${(pocValue * 100).toFixed(1)}%`, gaugeX, gaugeY - 5);

    // Threshold line
    collCtx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    collCtx.setLineDash([2, 2]);
    collCtx.beginPath();
    const threshX = gaugeX + (gaugeW - 2) * 0.3;
    collCtx.moveTo(threshX, gaugeY);
    collCtx.lineTo(threshX, gaugeY + gaugeH);
    collCtx.stroke();
    collCtx.setLineDash([]);

    // --- Status ---
    collCtx.font = '8px monospace';
    collCtx.textAlign = 'left';
    if (maneuverActive) {
        collCtx.fillStyle = 'rgba(96, 165, 250, 0.6)';
        collCtx.fillText('ION THRUSTER BURN — ALTITUDE CHANGE IN PROGRESS', 20, h - 12);
    } else if (collisionWarning) {
        collCtx.fillStyle = 'rgba(239, 68, 68, 0.5)';
        collCtx.fillText('THREAT DETECTED — MANEUVER AUTHORIZED', 20, h - 12);
    } else {
        collCtx.fillStyle = 'rgba(34, 197, 94, 0.3)';
        collCtx.fillText('NOMINAL ORBIT — 550km ALTITUDE', 20, h - 12);
    }

    requestAnimationFrame(drawCollision);
}

document.getElementById('trigger-debris').onclick = () => {
    debris.push({
        x: collCanvas.width + 20,
        y: 130 + Math.random() * 40,
        vx: 6 + Math.random() * 6
    });
};

drawCollision();

// --- SPACE-BASED ROUTING ---
const routeCanvas = document.getElementById('routing-canvas');
const routeCtx = routeCanvas.getContext('2d');
let nodes = [];
let targetNode = null;

function initRouting() {
    nodes = [];
    for (let i = 0; i < 20; i++) {
        nodes.push({
            x: 50 + Math.random() * (routeCanvas.width - 100),
            y: 50 + Math.random() * (routeCanvas.height - 100),
            active: true
        });
    }
}

function drawRouting() {
    const w = routeCanvas.width;
    const h = routeCanvas.height;
    routeCtx.fillStyle = '#02050a';
    routeCtx.fillRect(0, 0, w, h);

    // Draw all links
    routeCtx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    nodes.forEach((n1, i) => {
        nodes.slice(i + 1).forEach(n2 => {
            const d = Math.sqrt((n1.x - n2.x) ** 2 + (n1.y - n2.y) ** 2);
            if (d < 150) {
                routeCtx.beginPath();
                routeCtx.moveTo(n1.x, n1.y);
                routeCtx.lineTo(n2.x, n2.y);
                routeCtx.stroke();
            }
        });
    });

    // Draw nodes
    nodes.forEach(n => {
        routeCtx.fillStyle = n.active ? '#3b82f6' : '#1e293b';
        routeCtx.beginPath();
        routeCtx.arc(n.x, n.y, 3, 0, Math.PI * 2);
        routeCtx.fill();
    });



    requestAnimationFrame(drawRouting);
}

document.getElementById('re-route').onclick = () => {
    initRouting();
};

initRouting();
drawRouting();

// --- STARSHIELD TARGET TRACKING ---
const shieldCanvas = document.getElementById('starshield-canvas');
const shieldCtx = shieldCanvas.getContext('2d');
let trackingSats = [];
let shieldTargets = [];
let shieldTime = 0;

function initShield() {
    trackingSats = Array.from({ length: 8 }, (_, i) => ({
        x: (i / 8) * 800 + Math.random() * 60,
        baseY: 55 + Math.random() * 30,
        speed: 0.4 + Math.random() * 0.3,
        fovHalf: 110 + Math.random() * 40,
        id: i,
        trackingTarget: null
    }));
}

function drawShield() {
    const w = shieldCanvas.width, h = shieldCanvas.height;
    shieldCtx.fillStyle = '#020810';
    shieldCtx.fillRect(0, 0, w, h);
    shieldTime += 0.016;

    // --- Ground terrain ---
    const groundY = h - 50;
    // Terrain line
    shieldCtx.strokeStyle = '#1a2a3a';
    shieldCtx.lineWidth = 1;
    shieldCtx.beginPath();
    for (let x = 0; x <= w; x += 3) {
        const ty = groundY + Math.sin(x * 0.02) * 5 + Math.sin(x * 0.007) * 8;
        if (x === 0) shieldCtx.moveTo(x, ty);
        else shieldCtx.lineTo(x, ty);
    }
    shieldCtx.stroke();

    // Terrain fill
    shieldCtx.fillStyle = '#0a1218';
    shieldCtx.beginPath();
    for (let x = 0; x <= w; x += 3) {
        const ty = groundY + Math.sin(x * 0.02) * 5 + Math.sin(x * 0.007) * 8;
        if (x === 0) shieldCtx.moveTo(x, ty);
        else shieldCtx.lineTo(x, ty);
    }
    shieldCtx.lineTo(w, h);
    shieldCtx.lineTo(0, h);
    shieldCtx.closePath();
    shieldCtx.fill();

    // --- Orbit altitude line ---
    shieldCtx.strokeStyle = 'rgba(59, 130, 246, 0.06)';
    shieldCtx.setLineDash([6, 8]);
    shieldCtx.beginPath();
    shieldCtx.moveTo(0, 70);
    shieldCtx.lineTo(w, 70);
    shieldCtx.stroke();
    shieldCtx.setLineDash([]);
    shieldCtx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    shieldCtx.font = '7px monospace';
    shieldCtx.textAlign = 'left';
    shieldCtx.fillText('LEO 550km', 5, 65);

    // --- Update & draw satellites ---
    trackingSats.forEach(sat => {
        sat.x = (sat.x + sat.speed) % (w + 40);
        const satY = sat.baseY + Math.sin(shieldTime * 0.5 + sat.id) * 4;

        // FOV cone (to ground)
        const fovL = sat.x - sat.fovHalf;
        const fovR = sat.x + sat.fovHalf;

        // Check if tracking any target
        sat.trackingTarget = null;
        shieldTargets.forEach(t => {
            if (t.x > fovL && t.x < fovR) {
                sat.trackingTarget = t;
            }
        });

        // FOV cone fill
        const isTracking = sat.trackingTarget !== null;
        shieldCtx.fillStyle = isTracking
            ? 'rgba(239, 68, 68, 0.04)'
            : 'rgba(59, 130, 246, 0.02)';
        shieldCtx.beginPath();
        shieldCtx.moveTo(sat.x, satY + 8);
        shieldCtx.lineTo(fovL, groundY);
        shieldCtx.lineTo(fovR, groundY);
        shieldCtx.closePath();
        shieldCtx.fill();

        // FOV cone edges
        shieldCtx.strokeStyle = isTracking
            ? 'rgba(239, 68, 68, 0.12)'
            : 'rgba(59, 130, 246, 0.06)';
        shieldCtx.lineWidth = 1;
        shieldCtx.beginPath();
        shieldCtx.moveTo(sat.x, satY + 8);
        shieldCtx.lineTo(fovL, groundY);
        shieldCtx.moveTo(sat.x, satY + 8);
        shieldCtx.lineTo(fovR, groundY);
        shieldCtx.stroke();

        // Tracking beam
        if (isTracking) {
            const t = sat.trackingTarget;
            shieldCtx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
            shieldCtx.lineWidth = 1;
            shieldCtx.setLineDash([3, 3]);
            shieldCtx.beginPath();
            shieldCtx.moveTo(sat.x, satY + 8);
            shieldCtx.lineTo(t.x, t.y);
            shieldCtx.stroke();
            shieldCtx.setLineDash([]);

            // Reticle around target
            const pulse = 12 + Math.sin(shieldTime * 6) * 4;
            shieldCtx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
            shieldCtx.lineWidth = 1;
            shieldCtx.beginPath();
            shieldCtx.arc(t.x, t.y, pulse, 0, Math.PI * 2);
            shieldCtx.stroke();

            // Cross-hairs
            shieldCtx.beginPath();
            shieldCtx.moveTo(t.x - pulse - 3, t.y);
            shieldCtx.lineTo(t.x - pulse + 5, t.y);
            shieldCtx.moveTo(t.x + pulse - 5, t.y);
            shieldCtx.lineTo(t.x + pulse + 3, t.y);
            shieldCtx.moveTo(t.x, t.y - pulse - 3);
            shieldCtx.lineTo(t.x, t.y - pulse + 5);
            shieldCtx.moveTo(t.x, t.y + pulse - 5);
            shieldCtx.lineTo(t.x, t.y + pulse + 3);
            shieldCtx.stroke();
        }

        // Satellite body
        shieldCtx.fillStyle = isTracking ? '#60a5fa' : '#3b82f6';
        shieldCtx.fillRect(sat.x - 5, satY - 3, 10, 6);
        // Solar panels
        shieldCtx.fillStyle = '#1e3a5f';
        shieldCtx.fillRect(sat.x - 13, satY - 1, 7, 2);
        shieldCtx.fillRect(sat.x + 6, satY - 1, 7, 2);
    });

    // --- Targets ---
    shieldTargets = shieldTargets.filter(t => {
        t.x += t.vx;
        t.y += Math.sin(shieldTime * 3 + t.x * 0.01) * 0.3;

        // Exhaust trail
        for (let i = 0; i < 3; i++) {
            const trailX = t.x - i * 8 - t.vx * i * 0.5;
            const alpha = 0.3 - i * 0.1;
            shieldCtx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
            shieldCtx.beginPath();
            shieldCtx.arc(trailX, t.y + (Math.random() - 0.5) * 3, 2 - i * 0.5, 0, Math.PI * 2);
            shieldCtx.fill();
        }

        // Target body
        shieldCtx.fillStyle = '#ef4444';
        shieldCtx.beginPath();
        // Arrowhead shape
        shieldCtx.moveTo(t.x + 8, t.y);
        shieldCtx.lineTo(t.x - 4, t.y - 4);
        shieldCtx.lineTo(t.x - 2, t.y);
        shieldCtx.lineTo(t.x - 4, t.y + 4);
        shieldCtx.closePath();
        shieldCtx.fill();

        // Target label
        shieldCtx.fillStyle = 'rgba(239, 68, 68, 0.5)';
        shieldCtx.font = '7px monospace';
        shieldCtx.textAlign = 'left';
        shieldCtx.fillText(`TGT ${Math.floor(t.vx * 1000)}km/h`, t.x + 12, t.y - 6);

        // Track count (how many sats see it)
        let trackCount = 0;
        trackingSats.forEach(s => {
            const fovL = s.x - s.fovHalf;
            const fovR = s.x + s.fovHalf;
            if (t.x > fovL && t.x < fovR) trackCount++;
        });
        if (trackCount > 0) {
            shieldCtx.fillStyle = 'rgba(59, 130, 246, 0.6)';
            shieldCtx.fillText(`${trackCount}× TRACK`, t.x + 12, t.y + 6);
        }

        return t.x < w + 80;
    });

    // --- Status overlay ---
    shieldCtx.fillStyle = 'rgba(255,255,255,0.12)';
    shieldCtx.font = '8px monospace';
    shieldCtx.textAlign = 'left';
    shieldCtx.fillText(`STARSHIELD OPS — ${trackingSats.length} SENSORS ACTIVE`, 10, 15);
    shieldCtx.fillText(`TARGETS: ${shieldTargets.length}`, 10, 27);

    requestAnimationFrame(drawShield);
}

document.getElementById('add-target').onclick = () => {
    const gY = shieldCanvas.height - 50;
    shieldTargets.push({
        x: -30,
        y: gY - 20 - Math.random() * 60,
        vx: 3 + Math.random() * 4
    });
};

initShield();
drawShield();

drawLatency();
