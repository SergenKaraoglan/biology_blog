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

let threats = [];
let interceptors = [];
let explosions = [];
let intTime = 0;
let intParticles = [];

targetBtn.onclick = () => {
    threats.push({
        x: 760 + Math.random() * 40, y: 5 + Math.random() * 15,
        vx: -1.8 - Math.random() * 0.8, vy: 0.1 + Math.random() * 0.2,
        active: true, trail: []
    });
};
launchBtn.onclick = () => {
    interceptors.push({
        x: 110 + Math.random() * 20, y: 370,
        vx: (Math.random() - 0.5) * 0.5, vy: -5,
        active: true, trail: [], stage: 'BOOST'
    });
};

function drawIntercept() {
    const w = intCanvas.width, h = intCanvas.height;
    intCtx.fillStyle = '#01050a';
    intCtx.fillRect(0, 0, w, h);
    intTime += 0.016;

    // --- Ground terrain ---
    intCtx.fillStyle = '#0a1218';
    intCtx.fillRect(0, h - 30, w, 30);
    intCtx.strokeStyle = '#1a2a3a';
    intCtx.lineWidth = 1;
    intCtx.beginPath();
    intCtx.moveTo(0, h - 30);
    intCtx.lineTo(w, h - 30);
    intCtx.stroke();

    // Defense battery
    intCtx.fillStyle = '#1e3a5f';
    intCtx.fillRect(100, h - 50, 30, 20);
    intCtx.fillRect(108, h - 60, 14, 10);
    intCtx.strokeStyle = '#3b82f6';
    intCtx.lineWidth = 2;
    intCtx.beginPath();
    intCtx.arc(115, h - 62, 8, Math.PI + 0.5, Math.PI * 2 - 0.5);
    intCtx.stroke();

    // --- Radar sweep ---
    if (threats.some(t => t.active)) {
        const radarAngle = intTime * 3;
        intCtx.strokeStyle = 'rgba(59, 130, 246, 0.06)';
        intCtx.lineWidth = 1;
        intCtx.beginPath();
        intCtx.moveTo(115, h - 62);
        intCtx.lineTo(115 + Math.cos(radarAngle) * 500, (h - 62) + Math.sin(radarAngle) * 500);
        intCtx.stroke();
    }

    // --- Threats ---
    threats = threats.filter(t => {
        if (!t.active) return false;
        t.vy += 0.007;
        t.x += t.vx;
        t.y += t.vy;
        t.trail.push({ x: t.x, y: t.y });
        if (t.trail.length > 60) t.trail.shift();

        // Radar track
        intCtx.strokeStyle = 'rgba(239, 68, 68, 0.06)';
        intCtx.setLineDash([4, 6]);
        intCtx.beginPath();
        intCtx.moveTo(115, h - 62);
        intCtx.lineTo(t.x, t.y);
        intCtx.stroke();
        intCtx.setLineDash([]);

        // Predicted trajectory
        intCtx.strokeStyle = 'rgba(239, 68, 68, 0.08)';
        intCtx.setLineDash([3, 5]);
        intCtx.beginPath();
        let px = t.x, py = t.y, pvx = t.vx, pvy = t.vy;
        intCtx.moveTo(px, py);
        for (let i = 0; i < 30; i++) { pvy += 0.015; px += pvx; py += pvy; intCtx.lineTo(px, py); }
        intCtx.stroke();
        intCtx.setLineDash([]);

        // Trail
        intCtx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
        intCtx.lineWidth = 2;
        intCtx.beginPath();
        t.trail.forEach((p, i) => { if (i === 0) intCtx.moveTo(p.x, p.y); else intCtx.lineTo(p.x, p.y); });
        intCtx.stroke();

        // Warhead body
        intCtx.fillStyle = '#ef4444';
        intCtx.save();
        intCtx.translate(t.x, t.y);
        intCtx.rotate(Math.atan2(t.vy, t.vx));
        intCtx.beginPath();
        intCtx.moveTo(8, 0); intCtx.lineTo(-5, -4); intCtx.lineTo(-3, 0); intCtx.lineTo(-5, 4);
        intCtx.closePath(); intCtx.fill();
        intCtx.restore();

        // Glow
        intCtx.beginPath();
        intCtx.arc(t.x, t.y, 12, 0, Math.PI * 2);
        intCtx.fillStyle = 'rgba(239, 68, 68, 0.1)';
        intCtx.fill();

        // Ground impact
        if (t.y >= h - 30) {
            explosions.push({
                x: t.x, y: h - 30, r: 0, active: true, groundHit: true,
                debris: Array.from({ length: 10 }, () => ({
                    x: 0, y: 0, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 5, life: 1
                }))
            });
            return false;
        }
        if (t.x < -20) return false;
        return true;
    });

    // --- Interceptors ---
    interceptors = interceptors.filter(int => {
        if (!int.active) return false;

        // Find nearest active threat
        let nearestThreat = null;
        let nearestDist = Infinity;
        threats.forEach(t => {
            if (!t.active) return;
            const d = Math.sqrt((t.x - int.x) ** 2 + (t.y - int.y) ** 2);
            if (d < nearestDist) { nearestDist = d; nearestThreat = t; }
        });

        if (!nearestThreat) {
            int.x += int.vx; int.y += int.vy;
            if (int.y < -20 || int.x < -20 || int.x > w + 20) return false;
            intCtx.fillStyle = '#3b82f6';
            intCtx.beginPath();
            intCtx.arc(int.x, int.y, 3, 0, Math.PI * 2);
            intCtx.fill();
            return true;
        }

        const dx = nearestThreat.x + nearestThreat.vx * 15 - int.x;
        const dy = nearestThreat.y + nearestThreat.vy * 15 - int.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (int.stage === 'BOOST' && int.vy < -2 && dist < 300) int.stage = 'MIDCOURSE';
        if (int.stage === 'MIDCOURSE' && dist < 120) int.stage = 'TERMINAL';

        const speed = int.stage === 'TERMINAL' ? 7 : int.stage === 'MIDCOURSE' ? 5 : 4;
        if (int.stage !== 'BOOST') {
            int.vx += (dx / dist) * 0.8;
            int.vy += (dy / dist) * 0.8;
            const mag = Math.sqrt(int.vx ** 2 + int.vy ** 2);
            int.vx = (int.vx / mag) * speed;
            int.vy = (int.vy / mag) * speed;
        } else {
            int.vy += 0.2;
            if (int.vy > -2.5) int.stage = 'MIDCOURSE';
        }

        int.x += int.vx; int.y += int.vy;
        int.trail.push({ x: int.x, y: int.y });
        if (int.trail.length > 40) int.trail.shift();

        for (let i = 0; i < (int.stage === 'BOOST' ? 3 : 1); i++) {
            intParticles.push({
                x: int.x - int.vx * 0.3, y: int.y - int.vy * 0.3,
                vx: -int.vx * 0.2 + (Math.random() - 0.5) * 2,
                vy: -int.vy * 0.2 + (Math.random() - 0.5) * 2,
                life: 1, size: int.stage === 'BOOST' ? 2 + Math.random() * 2 : 1 + Math.random()
            });
        }

        if (int.stage === 'TERMINAL' && Math.random() > 0.6) {
            intCtx.fillStyle = '#fff';
            intCtx.beginPath();
            intCtx.arc(int.x + (Math.random() - 0.5) * 8, int.y + (Math.random() - 0.5) * 8, 1.5, 0, Math.PI * 2);
            intCtx.fill();
        }

        intCtx.strokeStyle = int.stage === 'TERMINAL' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(59, 130, 246, 0.3)';
        intCtx.lineWidth = int.stage === 'BOOST' ? 3 : 1;
        intCtx.beginPath();
        int.trail.forEach((p, i) => { if (i === 0) intCtx.moveTo(p.x, p.y); else intCtx.lineTo(p.x, p.y); });
        intCtx.stroke();

        intCtx.fillStyle = int.stage === 'TERMINAL' ? '#fff' : '#60a5fa';
        intCtx.beginPath();
        intCtx.arc(int.x, int.y, int.stage === 'TERMINAL' ? 3 : 4, 0, Math.PI * 2);
        intCtx.fill();

        if (dist < 12) {
            explosions.push({
                x: (nearestThreat.x + int.x) / 2, y: (nearestThreat.y + int.y) / 2,
                r: 0, active: true,
                debris: Array.from({ length: 12 }, () => ({
                    x: 0, y: 0, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 1
                }))
            });
            nearestThreat.active = false;
            return false;
        }

        if (int.y >= h - 30) {
            explosions.push({
                x: int.x, y: h - 30, r: 0, active: true, groundHit: false,
                debris: Array.from({ length: 8 }, () => ({
                    x: 0, y: 0, vx: (Math.random() - 0.5) * 5, vy: -Math.random() * 4, life: 1
                }))
            });
            return false;
        }
        if (int.x < -20 || int.x > w + 20 || int.y < -20) return false;
        return true;
    });

    // --- Exhaust particles ---
    intParticles = intParticles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.04;
        intCtx.beginPath();
        intCtx.arc(p.x, p.y, Math.max(0, p.size * p.life), 0, Math.PI * 2);
        intCtx.fillStyle = p.life > 0.5 ? `rgba(245, 158, 11, ${p.life * 0.5})` : `rgba(148, 163, 184, ${p.life * 0.3})`;
        intCtx.fill();
        return p.life > 0;
    });

    // --- Explosions ---
    explosions = explosions.filter(exp => {
        exp.r += 5;
        intCtx.beginPath();
        intCtx.arc(exp.x, exp.y, Math.max(0, exp.r * 1.5), 0, Math.PI * 2);
        intCtx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, 0.8 - exp.r / 80)})`;
        intCtx.fill();
        for (let i = 0; i < 3; i++) {
            intCtx.strokeStyle = `rgba(239, 68, 68, ${Math.max(0, 0.6 - exp.r / 100)})`;
            intCtx.lineWidth = 2;
            intCtx.beginPath();
            intCtx.arc(exp.x, exp.y, exp.r * (0.6 + i * 0.3), 0, Math.PI * 2);
            intCtx.stroke();
        }
        exp.debris.forEach(d => {
            d.x += d.vx; d.y += d.vy; d.vy += 0.1; d.life -= 0.015;
            if (d.life > 0) {
                intCtx.fillStyle = `rgba(245, 158, 11, ${d.life})`;
                intCtx.fillRect(exp.x + d.x - 1, exp.y + d.y - 1, 2, 2);
            }
        });
        if (exp.r < 60) {
            if (exp.groundHit) {
                intCtx.fillStyle = 'rgba(239, 68, 68, 0.6)';
                intCtx.font = 'bold 9px monospace';
                intCtx.textAlign = 'center';
                intCtx.fillText('GROUND IMPACT', exp.x, exp.y - exp.r - 10);
            } else {
                intCtx.fillStyle = 'rgba(34, 197, 94, 0.6)';
                intCtx.font = 'bold 9px monospace';
                intCtx.textAlign = 'center';
                intCtx.fillText('KILL', exp.x, exp.y - exp.r - 10);
            }
        }
        return exp.r < 120;
    });

    // --- Status overlay ---
    const activeThreats = threats.filter(t => t.active).length;
    const activeInts = interceptors.length;
    intCtx.fillStyle = 'rgba(255,255,255,0.15)';
    intCtx.font = '8px monospace';
    intCtx.textAlign = 'left';
    intCtx.fillText('AEGIS BALLISTIC MISSILE DEFENSE', 10, 15);
    if (activeThreats > 0 || activeInts > 0) {
        intCtx.fillStyle = activeThreats > 0 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.4)';
        intCtx.fillText(`THREATS: ${activeThreats}  |  INTERCEPTORS: ${activeInts}`, 10, 27);
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
        const dist = Math.sqrt(dx * dx + dy * dy);
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
    const grad = jamCtx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 100);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    grad.addColorStop(1, 'rgba(0, 73, 144, 0)');
    jamCtx.fillStyle = grad;
    jamCtx.beginPath();
    jamCtx.arc(w / 2, h / 2, 100, 0, Math.PI * 2);
    jamCtx.fill();

    // Noise ripples
    jamCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 3; i++) {
        const r = (time * 100 + i * 40) % 100;
        jamCtx.beginPath();
        jamCtx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
        jamCtx.stroke();
    }

    // Drone
    const dx = (time * 100) % (w + 100) - 50;
    let dy = h / 2;
    const distToCenter = Math.abs(dx - w / 2);
    if (distToCenter < 100) {
        dy += Math.sin(time * 50) * (20 * (1 - distToCenter / 100)); // Erratic
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
tick();
