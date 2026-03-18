/**
 * NATO Defense: Shield of Nations — Engineering Visuals
 */

// --- GLOBAL STATE ---
let time = 0;

// --- HERO VISUAL: RADAR SCAN ---
const heroCanvas = document.getElementById('hero-nato-canvas');
const heroCtx = heroCanvas.getContext('2d');

function resizeHero() {
    heroCanvas.width = window.innerWidth;
    heroCanvas.height = 400;
}
window.addEventListener('resize', resizeHero);
resizeHero();

function animateHero() {
    const w = heroCanvas.width, h = heroCanvas.height;
    heroCtx.fillStyle = '#000c1a';
    heroCtx.fillRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2;
    const r = 150;

    // Grid
    heroCtx.strokeStyle = 'rgba(0, 73, 144, 0.2)';
    heroCtx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        heroCtx.beginPath();
        heroCtx.arc(cx, cy, (i + 1) * 30, 0, Math.PI * 2);
        heroCtx.stroke();
    }
    heroCtx.beginPath();
    heroCtx.moveTo(cx - r, cy); heroCtx.lineTo(cx + r, cy);
    heroCtx.moveTo(cx, cy - r); heroCtx.lineTo(cx, cy + r);
    heroCtx.stroke();

    // Scan Beam
    const angle = time * 2;
    const grad = heroCtx.createConicGradient(angle, cx, cy);
    grad.addColorStop(0, 'rgba(0, 73, 144, 0.8)');
    grad.addColorStop(0.1, 'rgba(0, 73, 144, 0)');
    heroCtx.fillStyle = grad;
    heroCtx.beginPath();
    heroCtx.moveTo(cx, cy);
    heroCtx.arc(cx, cy, r, angle - 0.5, angle);
    heroCtx.fill();

    // Blips
    for (let i = 0; i < 3; i++) {
        const bx = cx + Math.cos(i * 2 + time * 0.1) * 100;
        const by = cy + Math.sin(i * 2 + time * 0.1) * 100;
        const fade = (angle % (Math.PI * 2)) / (Math.PI * 2);
        heroCtx.fillStyle = `rgba(239, 68, 68, ${1 - fade})`;
        heroCtx.beginPath();
        heroCtx.arc(bx, by, 3, 0, Math.PI * 2);
        heroCtx.fill();
    }
}

// --- MISSILE INTERCEPT ---
const intCanvas = document.getElementById('intercept-canvas');
const intCtx = intCanvas.getContext('2d');
const launchBtn = document.getElementById('launch-intercept');
const targetBtn = document.getElementById('inject-target');

let threat = { x: 800, y: 50, vx: -4, vy: 1, active: false };
let interceptor = { x: 100, y: 350, vx: 0, vy: 0, active: false };
let explosion = { x: 0, y: 0, r: 0, active: false };

targetBtn.onclick = () => { threat.x = 800; threat.y = 50; threat.active = true; explosion.active = false; };
launchBtn.onclick = () => { interceptor.x = 100; interceptor.y = 350; interceptor.active = true; };

function drawIntercept() {
    const w = intCanvas.width, h = intCanvas.height;
    intCtx.fillStyle = '#01050a';
    intCtx.fillRect(0, 0, w, h);

    // Ground Station
    intCtx.fillStyle = '#1e3a5f';
    intCtx.fillRect(80, h - 20, 40, 20);

    if (threat.active) {
        threat.x += threat.vx;
        threat.y += threat.vy;
        
        // Threat GLOW
        const g = intCtx.createRadialGradient(threat.x, threat.y, 0, threat.x, threat.y, 20);
        g.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        g.addColorStop(1, 'rgba(239, 68, 68, 0)');
        intCtx.fillStyle = g;
        intCtx.beginPath(); intCtx.arc(threat.x, threat.y, 20, 0, Math.PI * 2); intCtx.fill();

        intCtx.fillStyle = '#ef4444';
        intCtx.beginPath(); intCtx.arc(threat.x, threat.y, 3, 0, Math.PI * 2); intCtx.fill();
        
        // Radar Lock (from ground)
        intCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        intCtx.setLineDash([5, 5]);
        intCtx.beginPath(); intCtx.moveTo(100, h - 20); intCtx.lineTo(threat.x, threat.y); intCtx.stroke();
        intCtx.setLineDash([]);
    }

    if (interceptor.active) {
        const dx = threat.x - interceptor.x;
        const dy = threat.y - interceptor.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Stagewise Logic
        const isKillVehicle = dist < 250;
        const speed = isKillVehicle ? 10 : 7;
        
        interceptor.vx = (dx / dist) * speed;
        interceptor.vy = (dy / dist) * speed;
        
        interceptor.x += interceptor.vx;
        interceptor.y += interceptor.vy;

        // KV Divert Thrusters
        if (isKillVehicle && Math.random() > 0.7) {
            intCtx.fillStyle = '#fff';
            // Pulsing side jets
            intCtx.beginPath();
            intCtx.arc(interceptor.x + (Math.random()-0.5)*10, interceptor.y + (Math.random()-0.5)*10, 2, 0, Math.PI*2);
            intCtx.fill();
        }

        // Interceptor Body
        intCtx.fillStyle = isKillVehicle ? '#fff' : '#3b82f6';
        intCtx.beginPath();
        intCtx.arc(interceptor.x, interceptor.y, isKillVehicle ? 2 : 4, 0, Math.PI * 2);
        intCtx.fill();

        // Trail
        intCtx.strokeStyle = isKillVehicle ? 'rgba(255,255,255,0.3)' : 'rgba(59, 130, 246, 0.5)';
        intCtx.beginPath();
        intCtx.moveTo(interceptor.x, interceptor.y);
        intCtx.lineTo(interceptor.x - interceptor.vx * 3, interceptor.y - interceptor.vy * 3);
        intCtx.stroke();

        // Telemetry
        intCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        intCtx.font = '10px Roboto Mono';
        intCtx.fillText(`RANGE: ${Math.floor(dist)}km`, interceptor.x + 10, interceptor.y);
        intCtx.fillText(`STAGE: ${isKillVehicle ? 'KV' : 'BOOSTER'}`, interceptor.x + 10, interceptor.y + 12);

        if (dist < 8) {
            explosion = { x: threat.x, y: threat.y, r: 0, active: true };
            threat.active = false;
            interceptor.active = false;
        }
    }

    if (explosion.active) {
        explosion.r += 6;
        // FLASH
        intCtx.fillStyle = `rgba(255, 255, 255, ${1 - explosion.r/100})`;
        intCtx.beginPath(); intCtx.arc(explosion.x, explosion.y, explosion.r * 1.5, 0, Math.PI * 2); intCtx.fill();
        
        // Rings
        intCtx.strokeStyle = `rgba(239, 68, 68, ${1 - explosion.r/100})`;
        intCtx.lineWidth = 3;
        intCtx.beginPath(); intCtx.arc(explosion.x, explosion.y, explosion.r, 0, Math.PI * 2); intCtx.stroke();
        
        if (explosion.r > 120) explosion.active = false;
    }
}

// --- SWARM DEFENSE ---
const swarmCanvas = document.getElementById('swarm-canvas');
const swarmCtx = swarmCanvas.getContext('2d');
const addSwarmBtn = document.getElementById('add-swarm');
const pulseBtn = document.getElementById('pulse-btn');

let drones = [];
let pulseR = 0;
let pulseActive = false;

addSwarmBtn.onclick = () => {
    for (let i = 0; i < 30; i++) {
        drones.push({
            x: 800 + Math.random() * 200,
            y: 50 + Math.random() * 300,
            vx: -(2 + Math.random() * 2),
            vy: (Math.random() - 0.5) * 1,
            active: true
        });
    }
};

pulseBtn.onclick = () => { pulseR = 0; pulseActive = true; };

function drawSwarm() {
    const w = swarmCanvas.width, h = swarmCanvas.height;
    swarmCtx.fillStyle = '#000c1a';
    swarmCtx.fillRect(0, 0, w, h);

    // Defense Battery
    swarmCtx.fillStyle = '#1e3a5f';
    swarmCtx.fillRect(50, h - 80, 40, 60);

    if (pulseActive) {
        pulseR += 10;
        swarmCtx.strokeStyle = `rgba(59, 130, 246, ${1 - pulseR / 600})`;
        swarmCtx.lineWidth = 5;
        swarmCtx.beginPath();
        swarmCtx.arc(70, h - 50, pulseR, 0, Math.PI * 2);
        swarmCtx.stroke();
        if (pulseR > 600) pulseActive = false;
    }

    drones = drones.filter(d => {
        d.x += d.vx;
        d.y += d.vy;
        
        // Pulse hit
        const dx = d.x - 70;
        const dy = d.y - (h - 50);
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (pulseActive && Math.abs(dist - pulseR) < 20) d.active = false;

        if (d.active) {
            swarmCtx.fillStyle = '#ef4444';
            swarmCtx.beginPath();
            swarmCtx.arc(d.x, d.y, 2, 0, Math.PI * 2);
            swarmCtx.fill();
        } else {
            d.y += 5; // Falling
            swarmCtx.fillStyle = '#444';
            swarmCtx.beginPath();
            swarmCtx.arc(d.x, d.y, 2, 0, Math.PI * 2);
            swarmCtx.fill();
        }

        return d.x > -10 && d.y < h;
    });
}

// --- JAMMING ---
const jamCanvas = document.getElementById('jamming-canvas');
const jamCtx = jamCanvas.getContext('2d');

function drawJamming() {
    const w = jamCanvas.width, h = jamCanvas.height;
    jamCtx.fillStyle = '#000c1a';
    jamCtx.fillRect(0, 0, w, h);

    // Jamming Zone
    const grad = jamCtx.createRadialGradient(w/2, h/2, 0, w/2, h/2, 100);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    grad.addColorStop(1, 'rgba(0, 73, 144, 0)');
    jamCtx.fillStyle = grad;
    jamCtx.beginPath();
    jamCtx.arc(w/2, h/2, 100, 0, Math.PI * 2);
    jamCtx.fill();

    // Noise ripples
    jamCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 3; i++) {
        const r = (time * 100 + i * 40) % 100;
        jamCtx.beginPath();
        jamCtx.arc(w/2, h/2, r, 0, Math.PI * 2);
        jamCtx.stroke();
    }

    // Drone
    const dx = (time * 100) % (w + 100) - 50;
    let dy = h / 2;
    const distToCenter = Math.abs(dx - w/2);
    if (distToCenter < 100) {
        dy += Math.sin(time * 50) * (20 * (1 - distToCenter/100)); // Erratic
    }

    jamCtx.fillStyle = '#fff';
    jamCtx.beginPath();
    jamCtx.arc(dx, dy, 3, 0, Math.PI * 2);
    jamCtx.fill();
}

// --- MAIN LOOP ---
function tick() {
    time += 0.01;
    animateHero();
    drawIntercept();
    drawSwarm();
    drawJamming();
    requestAnimationFrame(tick);
}

tick();
