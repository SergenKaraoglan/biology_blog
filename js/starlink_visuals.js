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

// --- LASER INTERLINK LATENCY ---
const laserCanvas = document.getElementById('laser-canvas');
const laserCtx = laserCanvas.getContext('2d');
let testingLatency = false;
let testStartTime = 0;
let fiberProgress = 0;
let spaceProgress = 0;

function drawLatency() {
    const w = laserCanvas.width;
    const h = laserCanvas.height;
    laserCtx.fillStyle = '#000';
    laserCtx.fillRect(0, 0, w, h);

    // Tracks
    laserCtx.strokeStyle = '#1e293b';
    laserCtx.lineWidth = 1;
    laserCtx.strokeRect(50, 40, w - 100, 40); // Space
    laserCtx.strokeRect(50, 120, w - 100, 40); // Earth

    laserCtx.fillStyle = '#94a3b8';
    laserCtx.font = '10px Outfit';
    laserCtx.fillText('VACUUM (SPACE LASER) - 300,000 km/s', 50, 35);
    laserCtx.fillText('GLASS FIBER (EARTH) - ~204,000 km/s', 50, 115);

    if (testingLatency) {
        const elapsed = performance.now() - testStartTime;
        spaceProgress = Math.min(1, elapsed / 1000);
        fiberProgress = Math.min(1, elapsed / 1470); // Space is ~1.47x faster

        if (fiberProgress >= 1) testingLatency = false;
    }

    // Space Packet
    laserCtx.fillStyle = '#f59e0b';
    laserCtx.fillRect(50 + spaceProgress * (w - 110), 45, 10, 30);

    // Fiber Packet
    laserCtx.fillStyle = '#3b82f6';
    laserCtx.fillRect(50 + fiberProgress * (w - 110), 125, 10, 30);

    requestAnimationFrame(drawLatency);
}

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

// function constLoop() { // This will be handled by the global tick
//     drawConstellation();
//     requestAnimationFrame(constLoop);
// }
// constLoop(); // This will be handled by the global tick

// --- DEORBIT PLASMA SIMULATION ---
const deorbitCanvas = document.getElementById('deorbit-canvas');
const deCtx = deorbitCanvas.getContext('2d');
let particles = [];

function drawDeorbit() {
    const w = deorbitCanvas.width;
    const h = deorbitCanvas.height;
    deCtx.fillStyle = '#0a0510';
    deCtx.fillRect(0, 0, w, h);

    const satX = w / 4 + Math.sin(time) * 20;
    const satY = h / 2 + Math.cos(time * 0.5) * 10;

    // Satellite body (abstract)
    deCtx.fillStyle = '#94a3b8';
    deCtx.fillRect(satX, satY, 40, 10);
    deCtx.fillRect(satX + 15, satY - 15, 10, 40); // Solar panel

    // Plasma particles
    if (Math.random() > 0.1) {
        particles.push({
            x: satX + 40,
            y: satY + 5,
            vx: Math.random() * 10 + 5,
            vy: (Math.random() - 0.5) * 10,
            life: 1,
            color: Math.random() > 0.5 ? '#f59e0b' : '#3b82f6'
        });
    }

    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;

        deCtx.fillStyle = p.color;
        deCtx.globalAlpha = p.life;
        deCtx.beginPath();
        deCtx.arc(p.x, p.y, p.life * 5, 0, Math.PI * 2);
        deCtx.fill();
        deCtx.globalAlpha = 1;

        return p.life > 0;
    });

    requestAnimationFrame(drawDeorbit);
}
drawDeorbit();

// --- COLLISION AVOIDANCE ---
const collCanvas = document.getElementById('collision-canvas');
const collCtx = collCanvas.getContext('2d');
let debris = [];
let satelliteY = 150;
let targetSatelliteY = 150;
let collisionWarning = false;

function drawCollision() {
    const w = collCanvas.width;
    const h = collCanvas.height;
    collCtx.fillStyle = '#050a10';
    collCtx.fillRect(0, 0, w, h);

    // Orbit Lines
    collCtx.strokeStyle = '#1e293b';
    collCtx.beginPath();
    collCtx.moveTo(0, 150);
    collCtx.lineTo(w, 150);
    collCtx.stroke();

    // Satellite (Gold)
    satelliteY += (targetSatelliteY - satelliteY) * 0.1;
    collCtx.fillStyle = '#f59e0b';
    collCtx.fillRect(100, satelliteY - 5, 30, 10);
    
    // Detection cone
    if (collisionWarning) {
        collCtx.fillStyle = 'rgba(239, 68, 68, 0.1)';
        collCtx.beginPath();
        collCtx.moveTo(130, satelliteY);
        collCtx.lineTo(w, satelliteY - 100);
        collCtx.lineTo(w, satelliteY + 100);
        collCtx.fill();
    }

    debris = debris.filter(d => {
        d.x -= d.vx;
        
        // Detection logic
        const dist = d.x - 100;
        if (dist < 400 && dist > 0 && Math.abs(d.y - satelliteY) < 40) {
            collisionWarning = true;
            targetSatelliteY = d.y > 150 ? 80 : 220; // Move away
        }

        collCtx.fillStyle = '#ef4444';
        collCtx.beginPath();
        collCtx.arc(d.x, d.y, 4, 0, Math.PI * 2);
        collCtx.fill();

        return d.x > -10;
    });

    if (debris.length === 0) {
        collisionWarning = false;
        targetSatelliteY = 150;
    }

    requestAnimationFrame(drawCollision);
}

document.getElementById('trigger-debris').onclick = () => {
    debris.push({
        x: collCanvas.width,
        y: 130 + Math.random() * 40,
        vx: 8 + Math.random() * 4
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
    routeCtx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
    nodes.forEach((n1, i) => {
        nodes.slice(i + 1).forEach(n2 => {
            const d = Math.sqrt((n1.x - n2.x)**2 + (n1.y - n2.y)**2);
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

    // Shortest path (simulated for visual effect)
    if (nodes.length > 0) {
        routeCtx.strokeStyle = '#f59e0b';
        routeCtx.lineWidth = 2;
        routeCtx.beginPath();
        routeCtx.moveTo(nodes[0].x, nodes[0].y);
        let current = nodes[0];
        for (let j = 0; j < 5; j++) {
            const next = nodes.find(n => n !== current && Math.sqrt((n.x - current.x)**2 + (n.y - current.y)**2) < 200);
            if (next) {
                routeCtx.lineTo(next.x, next.y);
                current = next;
            }
        }
        routeCtx.stroke();
        routeCtx.lineWidth = 1;
    }

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

function initShield() {
    trackingSats = Array.from({ length: 12 }, (_, i) => ({
        x: (i / 12) * 800,
        y: 100,
        id: i
    }));
}

function drawShield() {
    const w = shieldCanvas.width, h = shieldCanvas.height;
    shieldCtx.fillStyle = '#050a10';
    shieldCtx.fillRect(0, 0, w, h);

    // Ground
    shieldCtx.fillStyle = '#111';
    shieldCtx.fillRect(0, h - 20, w, 20);

    // Satellites
    trackingSats.forEach(sat => {
        sat.x = (sat.x + 1) % w;
        shieldCtx.fillStyle = '#3b82f6';
        shieldCtx.fillRect(sat.x - 5, sat.y - 5, 10, 10);
        
        // FOV
        shieldCtx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
        shieldCtx.beginPath();
        shieldCtx.moveTo(sat.x, sat.y);
        shieldCtx.lineTo(sat.x - 150, h - 20);
        shieldCtx.lineTo(sat.x + 150, h - 20);
        shieldCtx.stroke();

        // Trackers
        shieldTargets.forEach(t => {
            const dx = Math.abs(sat.x - t.x);
            if (dx < 150) {
                shieldCtx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
                shieldCtx.beginPath();
                shieldCtx.moveTo(sat.x, sat.y);
                shieldCtx.lineTo(t.x, t.y);
                shieldCtx.stroke();
                
                shieldCtx.fillStyle = 'rgba(59, 130, 246, 0.2)';
                shieldCtx.beginPath();
                shieldCtx.arc(t.x, t.y, 20, 0, Math.PI * 2);
                shieldCtx.fill();
            }
        });
    });

    // Targets
    shieldTargets = shieldTargets.filter(t => {
        t.x += t.vx;
        shieldCtx.fillStyle = '#ef4444';
        shieldCtx.beginPath();
        shieldCtx.arc(t.x, t.y, 4, 0, Math.PI * 2);
        shieldCtx.fill();
        return t.x < w + 50;
    });

    requestAnimationFrame(drawShield);
}

document.getElementById('add-target').onclick = () => {
    shieldTargets.push({ x: -20, y: 350, vx: 5 + Math.random() * 5 });
};

initShield();
drawShield();

drawLatency();
