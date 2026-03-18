/**
 * SpaceX: The Mars Ark — Engineering Visuals
 */

// --- GLOBAL STATE ---
let time = 0;

// --- HERO VISUAL: THE STREAK ---
const heroCanvas = document.getElementById('hero-spacex-canvas');
const heroCtx = heroCanvas.getContext('2d');

function resizeHero() {
    heroCanvas.width = window.innerWidth;
    heroCanvas.height = 400;
}
window.addEventListener('resize', resizeHero);
resizeHero();

const stars = Array.from({ length: 200 }, () => ({
    x: Math.random() * heroCanvas.width,
    y: Math.random() * heroCanvas.height,
    size: Math.random() * 2,
    speed: Math.random() * 0.5
}));

function animateHero() {
    const w = heroCanvas.width, h = heroCanvas.height;
    heroCtx.fillStyle = '#000';
    heroCtx.fillRect(0, 0, w, h);

    // Starfield
    heroCtx.fillStyle = '#fff';
    stars.forEach(s => {
        heroCtx.beginPath();
        heroCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        heroCtx.fill();
        s.y += s.speed;
        if (s.y > h) s.y = 0;
    });

    // Rocket Streak
    const centerX = w / 2;
    const rocketY = (time * 100) % (h + 200) - 100;
    
    const grad = heroCtx.createLinearGradient(centerX, rocketY - 100, centerX, rocketY + 50);
    grad.addColorStop(0, 'rgba(59, 130, 246, 0)');
    grad.addColorStop(0.8, 'rgba(59, 130, 246, 0.8)');
    grad.addColorStop(1, '#fff');
    
    heroCtx.strokeStyle = grad;
    heroCtx.lineWidth = 2;
    heroCtx.beginPath();
    heroCtx.moveTo(centerX, rocketY - 100);
    heroCtx.lineTo(centerX, rocketY + 20);
    heroCtx.stroke();

    // Pulse
    heroCtx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    heroCtx.beginPath();
    heroCtx.arc(centerX, rocketY + 20, 10 + Math.sin(time * 20) * 5, 0, Math.PI * 2);
    heroCtx.fill();
}

// --- LANDING SIMULATOR ---
const landCanvas = document.getElementById('landing-canvas');
const landCtx = landCanvas.getContext('2d');
const thrustSlider = document.getElementById('thrust-slider');
const launchBtn = document.getElementById('launch-btn');

let landingState = {
    y: 50,
    vy: 0,
    fuel: 100,
    active: false,
    crashed: false,
    landed: false
};

function resetLanding() {
    landingState = { y: 50, vy: 0, fuel: 100, active: true, crashed: false, landed: false };
}

launchBtn.onclick = resetLanding;

function drawLanding() {
    const w = landCanvas.width, h = landCanvas.height;
    landCtx.fillStyle = '#050505';
    landCtx.fillRect(0, 0, w, h);

    // Ground
    landCtx.fillStyle = '#111';
    landCtx.fillRect(0, h - 20, w, 20);
    landCtx.strokeStyle = '#333';
    landCtx.strokeRect(w/2 - 50, h - 20, 100, 5); // Landing pad

    if (landingState.active) {
        const thrust = parseInt(thrustSlider.value) / 100 * 0.4;
        const gravity = 0.15;
        
        if (landingState.fuel > 0 && thrust > 0) {
            landingState.vy -= thrust;
            landingState.fuel -= thrust * 5;
        }
        
        landingState.vy += gravity;
        landingState.y += landingState.vy;

        // Collision
        if (landingState.y >= h - 70) {
            landingState.active = false;
            if (landingState.vy > 2) landingState.crashed = true;
            else landingState.landed = true;
            landingState.y = h - 70;
        }
    }

    // Rocket
    const rx = w / 2;
    const ry = landingState.y;
    
    landCtx.fillStyle = '#cbd5e1';
    landCtx.fillRect(rx - 10, ry, 20, 50); // Body
    landCtx.fillStyle = '#1e293b';
    landCtx.fillRect(rx - 12, ry + 40, 24, 5); // Legs base

    if (landingState.active && parseInt(thrustSlider.value) > 0 && landingState.fuel > 0) {
        // Flame
        const fSize = (parseInt(thrustSlider.value) / 100) * 40;
        const fGrad = landCtx.createLinearGradient(rx, ry + 50, rx, ry + 50 + fSize);
        fGrad.addColorStop(0, '#fff');
        fGrad.addColorStop(0.5, '#3b82f6');
        fGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
        landCtx.fillStyle = fGrad;
        landCtx.beginPath();
        landCtx.moveTo(rx - 8, ry + 50);
        landCtx.lineTo(rx + 8, ry + 50);
        landCtx.lineTo(rx, ry + 50 + fSize + Math.random() * 10);
        landCtx.fill();
    }

    // UI
    landCtx.fillStyle = '#fff';
    landCtx.font = '12px Outfit';
    landCtx.fillText(`VELOCITY: ${landingState.vy.toFixed(2)} m/s`, 20, 30);
    landCtx.fillText(`ALTITUDE: ${(h - 70 - landingState.y).toFixed(0)} m`, 20, 50);
    landCtx.fillText(`FUEL: ${Math.max(0, landingState.fuel).toFixed(0)}%`, 20, 70);

    if (landingState.crashed) {
        landCtx.fillStyle = '#ef4444';
        landCtx.font = 'bold 24px Outfit';
        landCtx.fillText('RUD: RAPID UNEXPECTED DISASSEMBLY', w/2 - 180, h/2);
    } else if (landingState.landed) {
        landCtx.fillStyle = '#22c55e';
        landCtx.font = 'bold 24px Outfit';
        landCtx.fillText('THE EAGLE HAS LANDED', w/2 - 120, h/2);
    }
}

// --- RAPTOR ENGINE ---
const raptorCanvas = document.getElementById('raptor-canvas');
const raptorCtx = raptorCanvas.getContext('2d');

function drawRaptor() {
    const w = raptorCanvas.width, h = raptorCanvas.height;
    raptorCtx.fillStyle = '#050505';
    raptorCtx.fillRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2;

    // Chamber
    raptorCtx.strokeStyle = '#334155';
    raptorCtx.lineWidth = 3;
    raptorCtx.beginPath();
    raptorCtx.moveTo(cx - 40, cy - 80);
    raptorCtx.lineTo(cx + 40, cy - 80);
    raptorCtx.lineTo(cx + 60, cy + 50);
    raptorCtx.lineTo(cx + 100, cy + 150);
    raptorCtx.lineTo(cx - 100, cy + 150);
    raptorCtx.lineTo(cx - 60, cy + 50);
    raptorCtx.closePath();
    raptorCtx.stroke();

    // Propellant flow
    const offset = time * 100;
    raptorCtx.setLineDash([10, 10]);
    raptorCtx.lineDashOffset = -offset;
    
    // Methane (Blue)
    raptorCtx.strokeStyle = '#3b82f6';
    raptorCtx.beginPath();
    raptorCtx.moveTo(cx - 80, 50);
    raptorCtx.lineTo(cx - 30, cy - 50);
    raptorCtx.stroke();

    // Oxygen (Green)
    raptorCtx.strokeStyle = '#22c55e';
    raptorCtx.beginPath();
    raptorCtx.moveTo(cx + 80, 50);
    raptorCtx.lineTo(cx + 30, cy - 50);
    raptorCtx.stroke();

    raptorCtx.setLineDash([]);

    // Combustion pulse
    const pSize = 20 + Math.sin(time * 30) * 10;
    const pGrad = raptorCtx.createRadialGradient(cx, cy - 30, 0, cx, cy - 30, pSize * 2);
    pGrad.addColorStop(0, '#fff');
    pGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
    raptorCtx.fillStyle = pGrad;
    raptorCtx.beginPath();
    raptorCtx.arc(cx, cy - 30, pSize * 2, 0, Math.PI * 2);
    raptorCtx.fill();
}

// --- BELLY FLOP ---
const flopCanvas = document.getElementById('flop-canvas');
const flopCtx = flopCanvas.getContext('2d');
const flipBtn = document.getElementById('flip-btn');

let flopAngle = Math.PI / 2; // Horizontalish
let targetAngle = Math.PI / 2;
let vesselY = 100;

flipBtn.onclick = () => { targetAngle = 0; };

function drawFlop() {
    const w = flopCanvas.width, h = flopCanvas.height;
    flopCtx.fillStyle = '#050505';
    flopCtx.fillRect(0, 0, w, h);

    flopAngle += (targetAngle - flopAngle) * 0.05;
    vesselY += 0.5;
    if (vesselY > h) vesselY = -50;

    flopCtx.save();
    flopCtx.translate(w/2, vesselY);
    flopCtx.rotate(flopAngle);

    // Starship shape
    flopCtx.fillStyle = '#cbd5e1';
    flopCtx.fillRect(-15, -60, 30, 120);
    flopCtx.beginPath();
    flopCtx.moveTo(-15, -60);
    flopCtx.lineTo(0, -90);
    flopCtx.lineTo(15, -60);
    flopCtx.fill();

    // Flaps
    flopCtx.fillStyle = '#475569';
    const flapMove = Math.sin(time * 5) * 10;
    flopCtx.fillRect(-30, -50 + flapMove, 15, 30); // Top left
    flopCtx.fillRect(15, -50 + flapMove, 15, 30);  // Top right
    flopCtx.fillRect(-35, 30 - flapMove, 20, 40);  // Bot left
    flopCtx.fillRect(15, 30 - flapMove, 20, 40);   // Bot right

    flopCtx.restore();
}

// --- MECHAZILLA CATCH ---
const catchCanvas = document.getElementById('catch-canvas');
const catchCtx = catchCanvas.getContext('2d');
const catchBtn = document.getElementById('catch-btn');

let booster = { x: 400, y: -50, vy: 2, active: false, caught: false };
let armsWidth = 150;
let targetArmsWidth = 150;

catchBtn.onclick = () => {
    booster = { x: 400, y: -50, vy: 2, active: true, caught: false };
    targetArmsWidth = 150;
};

function drawCatch() {
    const w = catchCanvas.width, h = catchCanvas.height;
    catchCtx.fillStyle = '#050505';
    catchCtx.fillRect(0, 0, w, h);

    // Tower
    catchCtx.fillStyle = '#111';
    catchCtx.fillRect(w/2 - 120, 0, 40, h);

    // Arms
    armsWidth += (targetArmsWidth - armsWidth) * 0.1;
    catchCtx.strokeStyle = '#fff';
    catchCtx.lineWidth = 10;
    
    // Left Arm
    catchCtx.beginPath();
    catchCtx.moveTo(w/2 - 80, 200);
    catchCtx.lineTo(w/2 - 80 + armsWidth, 200);
    catchCtx.stroke();
    
    // Right Arm
    catchCtx.beginPath();
    catchCtx.moveTo(w/2 - 80, 250);
    catchCtx.lineTo(w/2 - 80 + armsWidth, 250);
    catchCtx.stroke();

    if (booster.active) {
        booster.y += booster.vy;
        if (booster.y > 180 && !booster.caught) {
            booster.vy *= 0.9; // Decelerate to hover
            if (booster.vy < 0.2) {
                targetArmsWidth = 100; // Close arms
                if (armsWidth < 110) {
                    booster.caught = true;
                    booster.vy = 0;
                }
            }
        }
        
        // Booster
        catchCtx.fillStyle = '#cbd5e1';
        catchCtx.fillRect(booster.x - 15, booster.y - 100, 30, 200);
        
        if (!booster.caught) {
            // Flame
            catchCtx.fillStyle = '#3b82f6';
            catchCtx.beginPath();
            catchCtx.moveTo(booster.x - 10, booster.y + 100);
            catchCtx.lineTo(booster.x + 10, booster.y + 100);
            catchCtx.lineTo(booster.x, booster.y + 140 + Math.random() * 20);
            catchCtx.fill();
        }
    }

    if (booster.caught) {
        catchCtx.fillStyle = '#22c55e';
        catchCtx.font = 'bold 20px Outfit';
        catchCtx.fillText('BOOSTER SECURED', w/2 - 250, 230);
    }
}

// --- HEAT SHIELD TPS ---
const heatCanvas = document.getElementById('heat-canvas');
const heatCtx = heatCanvas.getContext('2d');

function drawHeat() {
    const w = heatCanvas.width, h = heatCanvas.height;
    heatCtx.fillStyle = '#0a0a0a';
    heatCtx.fillRect(0, 0, w, h);

    const bx = w / 2, by = h / 2;

    // Hexagonal Grid (Abstract)
    heatCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 10; j++) {
            const hx = i * 40 + (j % 2) * 20;
            const hy = j * 35;
            heatCtx.beginPath();
            heatCtx.moveTo(hx, hy);
            heatCtx.lineTo(hx + 20, hy);
            heatCtx.lineTo(hx + 30, hy + 15);
            heatCtx.lineTo(hx + 20, hy + 30);
            heatCtx.lineTo(hx, hy + 30);
            heatCtx.lineTo(hx - 10, hy + 15);
            heatCtx.closePath();
            heatCtx.stroke();
        }
    }

    // Plasma Flow
    const pSize = 100 + Math.sin(time * 5) * 10;
    const pGrad = heatCtx.createRadialGradient(bx - 100, by, 0, bx - 100, by, pSize * 2);
    pGrad.addColorStop(0, '#fff');
    pGrad.addColorStop(0.3, '#3b82f6');
    pGrad.addColorStop(0.6, '#ef4444');
    pGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    
    heatCtx.fillStyle = pGrad;
    heatCtx.beginPath();
    heatCtx.arc(bx - 100, by, pSize * 2, 0, Math.PI * 2);
    heatCtx.fill();

    // Steel Hull (Glow)
    heatCtx.fillStyle = 'rgba(203, 213, 225, 0.1)';
    heatCtx.fillRect(bx - 50, by - 100, 200, 200);
}

// --- MAIN LOOP ---
function tick() {
    time += 0.01;
    animateHero();
    drawLanding();
    drawRaptor();
    drawFlop();
    drawCatch();
    drawHeat();
    requestAnimationFrame(tick);
}

tick();
