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
            beamCtx.strokeStyle = `rgba(59, 130, 246, ${1 - radius/200})`;
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

document.getElementById('run-latency-test').onclick = () => {
    testingLatency = true;
    testStartTime = performance.now();
    spaceProgress = 0;
    fiberProgress = 0;
};

drawLatency();
