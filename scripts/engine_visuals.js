/**
 * Game Engine Visuals
 * Part of the Polymath Series
 * 
 * Five interactive canvas-based visualizations:
 * 1. Game Loop (fixed vs variable timestep)
 * 2. Entity-Component-System sandbox
 * 3. Quadtree spatial partitioning
 * 4. Physics engine (rigid body sandbox)
 * 5. Scene graph (hierarchical transforms)
 */

// ============================================================
// HERO CANVAS — Animated particle grid heartbeat
// ============================================================
const heroCanvas = document.getElementById('hero-engine-canvas');
const heroCtx = heroCanvas.getContext('2d');
let heroTime = 0;

function resizeHero() {
    heroCanvas.width = heroCanvas.parentElement.clientWidth;
    heroCanvas.height = 400;
}
window.addEventListener('resize', resizeHero);
resizeHero();

function animateHero() {
    const w = heroCanvas.width;
    const h = heroCanvas.height;
    heroCtx.fillStyle = '#0a0805';
    heroCtx.fillRect(0, 0, w, h);

    const cols = Math.floor(w / 20);
    const rows = Math.floor(h / 20);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const x = i * 20 + 10;
            const y = j * 20 + 10;
            const dist = Math.sqrt((x - w / 2) ** 2 + (y - h / 2) ** 2);
            const wave = Math.sin(dist * 0.015 - heroTime * 2) * 0.5 + 0.5;
            const pulse = Math.sin(heroTime * 3) * 0.3 + 0.7;
            const alpha = wave * pulse * 0.4;
            const r = Math.floor(255 * wave);
            const g = Math.floor(109 * wave);
            heroCtx.fillStyle = `rgba(${r}, ${g}, 0, ${alpha})`;
            heroCtx.fillRect(x - 2, y - 2, 4, 4);
        }
    }

    // Central glow
    const gradient = heroCtx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 200);
    gradient.addColorStop(0, 'rgba(255, 109, 0, 0.08)');
    gradient.addColorStop(1, 'rgba(255, 109, 0, 0)');
    heroCtx.fillStyle = gradient;
    heroCtx.fillRect(0, 0, w, h);

    heroTime += 0.016;
    requestAnimationFrame(animateHero);
}
animateHero();


// ============================================================
// 1. GAME LOOP — Fixed vs Variable Timestep
// ============================================================
const loopCanvas = document.getElementById('loop-canvas');
const loopCtx = loopCanvas.getContext('2d');
const toggleTimestepBtn = document.getElementById('toggle-timestep');
const fpsSlider = document.getElementById('fps-slider');
const fpsDisplay = document.getElementById('fps-display');
const gravityLoopSlider = document.getElementById('gravity-loop-slider');
const gravityLoopDisplay = document.getElementById('gravity-loop-display');

let useFixedTimestep = false;
let simFps = 60;
let loopGravity = 980;
const FIXED_DT = 1 / 60;

// Ball state
let ball = { x: 100, y: 50, vx: 120, vy: 0, radius: 12 };
let fpsHistory = [];
const FPS_HISTORY_LEN = 120;

// Loop timing
let lastLoopTime = 0;
let accumulator = 0;
let frameCounter = 0;
let fpsTimer = 0;
let currentFps = 0;

function resetBall() {
    ball.x = 100;
    ball.y = 50;
    ball.vx = 120;
    ball.vy = 0;
}

function updateBallPhysics(dt) {
    ball.vy += loopGravity * dt;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Bounce off walls
    if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.vx = Math.abs(ball.vx); }
    if (ball.x + ball.radius > loopCanvas.width) { ball.x = loopCanvas.width - ball.radius; ball.vx = -Math.abs(ball.vx); }
    if (ball.y - ball.radius < 0) { ball.y = ball.radius; ball.vy = Math.abs(ball.vy); }
    if (ball.y + ball.radius > loopCanvas.height - 60) { ball.y = loopCanvas.height - 60 - ball.radius; ball.vy = -Math.abs(ball.vy) * 0.85; }
}

function drawLoop() {
    const w = loopCanvas.width;
    const h = loopCanvas.height;
    loopCtx.fillStyle = '#0d0a06';
    loopCtx.fillRect(0, 0, w, h);

    // Draw floor
    loopCtx.fillStyle = '#1a1408';
    loopCtx.fillRect(0, h - 60, w, 60);
    loopCtx.strokeStyle = '#3a2a10';
    loopCtx.beginPath();
    loopCtx.moveTo(0, h - 60);
    loopCtx.lineTo(w, h - 60);
    loopCtx.stroke();

    // Draw ball
    loopCtx.beginPath();
    loopCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    const ballGrad = loopCtx.createRadialGradient(ball.x - 3, ball.y - 3, 2, ball.x, ball.y, ball.radius);
    ballGrad.addColorStop(0, '#ffab00');
    ballGrad.addColorStop(1, '#ff6d00');
    loopCtx.fillStyle = ballGrad;
    loopCtx.fill();

    // Ball glow
    loopCtx.beginPath();
    loopCtx.arc(ball.x, ball.y, ball.radius + 6, 0, Math.PI * 2);
    loopCtx.fillStyle = 'rgba(255, 109, 0, 0.15)';
    loopCtx.fill();

    // FPS graph background
    const graphX = 20;
    const graphY = 10;
    const graphW = 200;
    const graphH = 60;
    loopCtx.fillStyle = 'rgba(0,0,0,0.5)';
    loopCtx.fillRect(graphX, graphY, graphW, graphH);
    loopCtx.strokeStyle = '#2a2010';
    loopCtx.strokeRect(graphX, graphY, graphW, graphH);

    // FPS label
    loopCtx.fillStyle = '#888';
    loopCtx.font = '10px Courier New';
    loopCtx.fillText(`FPS: ${currentFps}`, graphX + 5, graphY + 12);

    // Mode label
    loopCtx.fillStyle = useFixedTimestep ? '#ffab00' : '#ff6d00';
    loopCtx.fillText(useFixedTimestep ? 'FIXED TIMESTEP' : 'VARIABLE TIMESTEP', graphX + 5, graphY + 24);

    // FPS graph line
    if (fpsHistory.length > 1) {
        loopCtx.beginPath();
        loopCtx.strokeStyle = useFixedTimestep ? '#ffab00' : '#ff6d00';
        loopCtx.lineWidth = 1;
        for (let i = 0; i < fpsHistory.length; i++) {
            const fx = graphX + (i / FPS_HISTORY_LEN) * graphW;
            const fy = graphY + graphH - (fpsHistory[i] / 150) * graphH;
            if (i === 0) loopCtx.moveTo(fx, fy);
            else loopCtx.lineTo(fx, fy);
        }
        loopCtx.stroke();
        loopCtx.lineWidth = 1;
    }
}

function loopTick(timestamp) {
    if (!lastLoopTime) lastLoopTime = timestamp;
    let realDt = (timestamp - lastLoopTime) / 1000;
    lastLoopTime = timestamp;

    // Clamp to avoid spiral of death
    if (realDt > 0.1) realDt = 0.1;

    // Simulate throttled frame rate
    const targetInterval = 1 / simFps;
    // We artificially jitter to show the problem with variable timestep
    const jitter = useFixedTimestep ? 0 : (Math.random() - 0.5) * 0.3 * targetInterval;
    const dt = targetInterval + jitter;

    // FPS tracking
    frameCounter++;
    fpsTimer += realDt;
    if (fpsTimer >= 0.5) {
        currentFps = Math.round(frameCounter / fpsTimer);
        fpsHistory.push(currentFps);
        if (fpsHistory.length > FPS_HISTORY_LEN) fpsHistory.shift();
        frameCounter = 0;
        fpsTimer = 0;
    }

    if (useFixedTimestep) {
        accumulator += dt;
        while (accumulator >= FIXED_DT) {
            updateBallPhysics(FIXED_DT);
            accumulator -= FIXED_DT;
        }
    } else {
        updateBallPhysics(dt);
    }

    drawLoop();
    requestAnimationFrame(loopTick);
}

toggleTimestepBtn.addEventListener('click', () => {
    useFixedTimestep = !useFixedTimestep;
    toggleTimestepBtn.textContent = useFixedTimestep ? 'Switch to Variable Timestep' : 'Switch to Fixed Timestep';
    resetBall();
    fpsHistory = [];
});

fpsSlider.addEventListener('input', () => {
    simFps = parseInt(fpsSlider.value);
    fpsDisplay.textContent = simFps;
});

gravityLoopSlider.addEventListener('input', () => {
    loopGravity = parseInt(gravityLoopSlider.value);
    gravityLoopDisplay.textContent = loopGravity;
});

requestAnimationFrame(loopTick);


// ============================================================
// 2. ENTITY-COMPONENT-SYSTEM SANDBOX
// ============================================================
const ecsCanvas = document.getElementById('ecs-canvas');
const ecsCtx = ecsCanvas.getContext('2d');
const ecsEntityListEl = document.getElementById('ecs-entity-list');

let nextEntityId = 0;
const entities = new Map();

// Component stores
const positions = new Map();
const velocities = new Map();
const gravities = new Map();
const renders = new Map();

let selectedEntityId = null;

function ecsSpawn() {
    const id = nextEntityId++;
    entities.set(id, { id });
    // Always give position
    positions.set(id, {
        x: 50 + Math.random() * (ecsCanvas.width - 100),
        y: 50 + Math.random() * 150
    });
    selectedEntityId = id;
    updateECSList();
}

function ecsAddVelocity() {
    if (selectedEntityId === null || !entities.has(selectedEntityId)) return;
    if (!velocities.has(selectedEntityId)) {
        velocities.set(selectedEntityId, {
            vx: (Math.random() - 0.5) * 200,
            vy: (Math.random() - 0.5) * 100
        });
    }
    updateECSList();
}

function ecsAddGravity() {
    if (selectedEntityId === null || !entities.has(selectedEntityId)) return;
    if (!gravities.has(selectedEntityId)) {
        gravities.set(selectedEntityId, { strength: 300 });
    }
    updateECSList();
}

function ecsAddRender() {
    if (selectedEntityId === null || !entities.has(selectedEntityId)) return;
    if (!renders.has(selectedEntityId)) {
        const hue = Math.random() * 60 + 10; // orange-ish range
        renders.set(selectedEntityId, {
            radius: 6 + Math.random() * 10,
            color: `hsl(${hue}, 100%, 55%)`
        });
    }
    updateECSList();
}

function ecsClearAll() {
    entities.clear();
    positions.clear();
    velocities.clear();
    gravities.clear();
    renders.clear();
    selectedEntityId = null;
    nextEntityId = 0;
    updateECSList();
}

function updateECSList() {
    let html = '';
    entities.forEach((_, id) => {
        const comps = [];
        if (positions.has(id)) comps.push('Pos');
        if (velocities.has(id)) comps.push('Vel');
        if (gravities.has(id)) comps.push('Grav');
        if (renders.has(id)) comps.push('Rnd');
        const sel = id === selectedEntityId ? ' ◄' : '';
        html += `<div style="cursor:pointer;${id === selectedEntityId ? 'color:#ff6d00' : ''}" data-eid="${id}">Entity #${id} [${comps.join(', ')}]${sel}</div>`;
    });
    ecsEntityListEl.innerHTML = html || '<div style="color:#555">No entities yet. Click "Spawn Entity" to begin.</div>';

    // Click handlers for entity selection
    ecsEntityListEl.querySelectorAll('[data-eid]').forEach(el => {
        el.addEventListener('click', () => {
            selectedEntityId = parseInt(el.dataset.eid);
            updateECSList();
        });
    });
}

// ECS Systems
function gravitySystem(dt) {
    gravities.forEach((g, id) => {
        if (velocities.has(id)) {
            const vel = velocities.get(id);
            vel.vy += g.strength * dt;
        }
    });
}

function movementSystem(dt) {
    velocities.forEach((vel, id) => {
        if (positions.has(id)) {
            const pos = positions.get(id);
            pos.x += vel.vx * dt;
            pos.y += vel.vy * dt;

            // Bounce off canvas edges
            const r = renders.has(id) ? renders.get(id).radius : 5;
            if (pos.x - r < 0) { pos.x = r; vel.vx = Math.abs(vel.vx); }
            if (pos.x + r > ecsCanvas.width) { pos.x = ecsCanvas.width - r; vel.vx = -Math.abs(vel.vx); }
            if (pos.y - r < 0) { pos.y = r; vel.vy = Math.abs(vel.vy); }
            if (pos.y + r > ecsCanvas.height) { pos.y = ecsCanvas.height - r; vel.vy = -Math.abs(vel.vy) * 0.8; }
        }
    });
}

function renderSystem() {
    renders.forEach((rnd, id) => {
        if (positions.has(id)) {
            const pos = positions.get(id);
            ecsCtx.beginPath();
            ecsCtx.arc(pos.x, pos.y, rnd.radius, 0, Math.PI * 2);
            ecsCtx.fillStyle = rnd.color;
            ecsCtx.fill();

            // Glow
            ecsCtx.beginPath();
            ecsCtx.arc(pos.x, pos.y, rnd.radius + 4, 0, Math.PI * 2);
            ecsCtx.fillStyle = 'rgba(255, 109, 0, 0.1)';
            ecsCtx.fill();
        }
    });
}

function drawECSGhosts() {
    // Entities with position but no Render component: draw faint outline
    positions.forEach((pos, id) => {
        if (!renders.has(id)) {
            ecsCtx.beginPath();
            ecsCtx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
            ecsCtx.strokeStyle = 'rgba(255, 171, 0, 0.3)';
            ecsCtx.lineWidth = 1;
            ecsCtx.setLineDash([3, 3]);
            ecsCtx.stroke();
            ecsCtx.setLineDash([]);

            // Label
            ecsCtx.fillStyle = 'rgba(255,171,0,0.4)';
            ecsCtx.font = '9px Courier New';
            ecsCtx.fillText(`#${id}`, pos.x + 10, pos.y + 3);
        }
    });
}

let lastECSTime = 0;
function ecsLoop(timestamp) {
    if (!lastECSTime) lastECSTime = timestamp;
    const dt = Math.min((timestamp - lastECSTime) / 1000, 0.05);
    lastECSTime = timestamp;

    ecsCtx.fillStyle = '#0d0a06';
    ecsCtx.fillRect(0, 0, ecsCanvas.width, ecsCanvas.height);

    // System labels
    ecsCtx.fillStyle = '#333';
    ecsCtx.font = '10px Courier New';
    ecsCtx.fillText(`Entities: ${entities.size}  |  Positions: ${positions.size}  |  Velocities: ${velocities.size}  |  Renders: ${renders.size}`, 10, 15);

    gravitySystem(dt);
    movementSystem(dt);
    drawECSGhosts();
    renderSystem();

    requestAnimationFrame(ecsLoop);
}

document.getElementById('ecs-spawn').addEventListener('click', ecsSpawn);
document.getElementById('ecs-add-velocity').addEventListener('click', ecsAddVelocity);
document.getElementById('ecs-add-gravity').addEventListener('click', ecsAddGravity);
document.getElementById('ecs-add-render').addEventListener('click', ecsAddRender);
document.getElementById('ecs-clear').addEventListener('click', ecsClearAll);

updateECSList();
requestAnimationFrame(ecsLoop);


// ============================================================
// 3. QUADTREE SPATIAL PARTITIONING
// ============================================================
const qtCanvas = document.getElementById('quadtree-canvas');
const qtCtx = qtCanvas.getContext('2d');
const qtToggle = document.getElementById('qt-toggle');
const qtCountSlider = document.getElementById('qt-count');
const qtCountDisplay = document.getElementById('qt-count-display');
const qtCapacitySlider = document.getElementById('qt-capacity');
const qtCapacityDisplay = document.getElementById('qt-capacity-display');

let showQuadtree = false;
let qtParticles = [];
let qtCapacity = 4;

class Rectangle {
    constructor(x, y, w, h) {
        this.x = x; this.y = y; this.w = w; this.h = h;
    }
    contains(p) {
        return p.x >= this.x && p.x < this.x + this.w && p.y >= this.y && p.y < this.y + this.h;
    }
    intersects(range) {
        return !(range.x > this.x + this.w || range.x + range.w < this.x ||
                 range.y > this.y + this.h || range.y + range.h < this.y);
    }
}

class Quadtree {
    constructor(boundary, capacity) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
        this.nw = null; this.ne = null; this.sw = null; this.se = null;
    }

    insert(point) {
        if (!this.boundary.contains(point)) return false;

        if (this.points.length < this.capacity && !this.divided) {
            this.points.push(point);
            return true;
        }

        if (!this.divided) this.subdivide();

        return this.nw.insert(point) || this.ne.insert(point) ||
               this.sw.insert(point) || this.se.insert(point);
    }

    subdivide() {
        const { x, y, w, h } = this.boundary;
        const hw = w / 2, hh = h / 2;
        this.nw = new Quadtree(new Rectangle(x, y, hw, hh), this.capacity);
        this.ne = new Quadtree(new Rectangle(x + hw, y, hw, hh), this.capacity);
        this.sw = new Quadtree(new Rectangle(x, y + hh, hw, hh), this.capacity);
        this.se = new Quadtree(new Rectangle(x + hw, y + hh, hw, hh), this.capacity);
        this.divided = true;

        // Re-insert existing points
        for (const p of this.points) {
            this.nw.insert(p) || this.ne.insert(p) || this.sw.insert(p) || this.se.insert(p);
        }
        this.points = [];
    }

    query(range, found = []) {
        if (!this.boundary.intersects(range)) return found;
        for (const p of this.points) {
            if (range.contains(p)) found.push(p);
        }
        if (this.divided) {
            this.nw.query(range, found);
            this.ne.query(range, found);
            this.sw.query(range, found);
            this.se.query(range, found);
        }
        return found;
    }

    draw(ctx) {
        ctx.strokeStyle = 'rgba(255, 109, 0, 0.25)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(this.boundary.x, this.boundary.y, this.boundary.w, this.boundary.h);
        if (this.divided) {
            this.nw.draw(ctx);
            this.ne.draw(ctx);
            this.sw.draw(ctx);
            this.se.draw(ctx);
        }
    }
}

function initQTParticles(count) {
    qtParticles = [];
    for (let i = 0; i < count; i++) {
        qtParticles.push({
            x: Math.random() * qtCanvas.width,
            y: Math.random() * qtCanvas.height,
            vx: (Math.random() - 0.5) * 80,
            vy: (Math.random() - 0.5) * 80,
            colliding: false
        });
    }
}

initQTParticles(50);

let lastQTTime = 0;
function qtLoop(timestamp) {
    if (!lastQTTime) lastQTTime = timestamp;
    const dt = Math.min((timestamp - lastQTTime) / 1000, 0.05);
    lastQTTime = timestamp;

    const w = qtCanvas.width;
    const h = qtCanvas.height;

    // Update particles
    for (const p of qtParticles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); }
        if (p.x > w) { p.x = w; p.vx = -Math.abs(p.vx); }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy); }
        if (p.y > h) { p.y = h; p.vy = -Math.abs(p.vy); }
        p.colliding = false;
    }

    // Build quadtree
    const qt = new Quadtree(new Rectangle(0, 0, w, h), qtCapacity);
    for (const p of qtParticles) qt.insert(p);

    // Collision detection using quadtree
    const checkRadius = 15;
    for (const p of qtParticles) {
        const range = new Rectangle(p.x - checkRadius, p.y - checkRadius, checkRadius * 2, checkRadius * 2);
        const nearby = qt.query(range);
        for (const other of nearby) {
            if (other === p) continue;
            const dx = other.x - p.x;
            const dy = other.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < checkRadius) {
                p.colliding = true;
                other.colliding = true;
            }
        }
    }

    // Draw
    qtCtx.fillStyle = '#0d0a06';
    qtCtx.fillRect(0, 0, w, h);

    if (showQuadtree) qt.draw(qtCtx);

    for (const p of qtParticles) {
        qtCtx.beginPath();
        qtCtx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        qtCtx.fillStyle = p.colliding ? '#ff6d00' : '#ffab00';
        qtCtx.fill();
        if (p.colliding) {
            qtCtx.beginPath();
            qtCtx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            qtCtx.fillStyle = 'rgba(255, 109, 0, 0.2)';
            qtCtx.fill();
        }
    }

    // Stats
    qtCtx.fillStyle = '#888';
    qtCtx.font = '10px Courier New';
    qtCtx.fillText(`Particles: ${qtParticles.length}  |  Capacity: ${qtCapacity}`, 10, 15);

    requestAnimationFrame(qtLoop);
}

qtToggle.addEventListener('click', () => {
    showQuadtree = !showQuadtree;
    qtToggle.textContent = showQuadtree ? 'Hide Quadtree Boundaries' : 'Show Quadtree Boundaries';
});

qtCountSlider.addEventListener('input', () => {
    const count = parseInt(qtCountSlider.value);
    qtCountDisplay.textContent = count;
    initQTParticles(count);
});

qtCapacitySlider.addEventListener('input', () => {
    qtCapacity = parseInt(qtCapacitySlider.value);
    qtCapacityDisplay.textContent = qtCapacity;
});

requestAnimationFrame(qtLoop);


// ============================================================
// 4. PHYSICS ENGINE — Rigid Body Sandbox
// ============================================================
const physCanvas = document.getElementById('physics-canvas');
const physCtx = physCanvas.getContext('2d');
const physSpawnBtn = document.getElementById('phys-spawn');
const physResetBtn = document.getElementById('phys-reset');
const physGravitySlider = document.getElementById('phys-gravity');
const physGravityDisplay = document.getElementById('phys-gravity-display');
const physRestitutionSlider = document.getElementById('phys-restitution');
const physRestitutionDisplay = document.getElementById('phys-restitution-display');

let physGravity = 500;
let physRestitution = 0.6;
let bodies = [];

class RigidBody {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 100;
        this.vy = 0;
        this.radius = radius;
        this.mass = radius * radius * 0.01;
        const hue = Math.random() * 50 + 15;
        this.color = `hsl(${hue}, 100%, 55%)`;
    }

    update(dt, gravity) {
        this.vy += gravity * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Wall collisions
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx = Math.abs(this.vx) * physRestitution;
        }
        if (this.x + this.radius > physCanvas.width) {
            this.x = physCanvas.width - this.radius;
            this.vx = -Math.abs(this.vx) * physRestitution;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy = Math.abs(this.vy) * physRestitution;
        }
        // Floor
        if (this.y + this.radius > physCanvas.height) {
            this.y = physCanvas.height - this.radius;
            this.vy = -Math.abs(this.vy) * physRestitution;
            // Friction
            this.vx *= 0.98;
            // Stop micro-bouncing
            if (Math.abs(this.vy) < 10) this.vy = 0;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(this.x - this.radius * 0.3, this.y - this.radius * 0.3, 1, this.x, this.y, this.radius);
        grad.addColorStop(0, '#ffab00');
        grad.addColorStop(1, this.color);
        ctx.fillStyle = grad;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 109, 0, 0.08)';
        ctx.fill();
    }
}

function resolveCollision(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = a.radius + b.radius;

    if (dist < minDist && dist > 0) {
        // Normal
        const nx = dx / dist;
        const ny = dy / dist;

        // Relative velocity
        const dvx = a.vx - b.vx;
        const dvy = a.vy - b.vy;
        const dvDotN = dvx * nx + dvy * ny;

        // Don't resolve if separating
        if (dvDotN > 0) {
            const e = physRestitution;
            const j = -(1 + e) * dvDotN / (1 / a.mass + 1 / b.mass);

            a.vx += j * nx / a.mass;
            a.vy += j * ny / a.mass;
            b.vx -= j * nx / b.mass;
            b.vy -= j * ny / b.mass;

            // Positional correction (prevent sinking)
            const overlap = minDist - dist;
            const correction = overlap / 2;
            a.x -= nx * correction;
            a.y -= ny * correction;
            b.x += nx * correction;
            b.y += ny * correction;
        }
    }
}

function spawnBody() {
    if (bodies.length >= 30) return; // Cap at 30
    const radius = 10 + Math.random() * 15;
    const x = 50 + Math.random() * (physCanvas.width - 100);
    bodies.push(new RigidBody(x, 30, radius));
}

function resetPhysics() {
    bodies = [];
}

let lastPhysTime = 0;
function physLoop(timestamp) {
    if (!lastPhysTime) lastPhysTime = timestamp;
    const dt = Math.min((timestamp - lastPhysTime) / 1000, 0.05);
    lastPhysTime = timestamp;

    // Update
    for (const b of bodies) {
        b.update(dt, physGravity);
    }

    // Collision detection (O(n²) for simplicity — this is a teaching tool)
    for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            resolveCollision(bodies[i], bodies[j]);
        }
    }

    // Draw
    physCtx.fillStyle = '#0d0a06';
    physCtx.fillRect(0, 0, physCanvas.width, physCanvas.height);

    // Floor
    physCtx.fillStyle = '#1a1408';
    physCtx.fillRect(0, physCanvas.height - 2, physCanvas.width, 2);

    for (const b of bodies) {
        b.draw(physCtx);
    }

    // Stats
    physCtx.fillStyle = '#888';
    physCtx.font = '10px Courier New';
    physCtx.fillText(`Bodies: ${bodies.length}  |  Gravity: ${physGravity}  |  Restitution: ${physRestitution}`, 10, 15);

    requestAnimationFrame(physLoop);
}

physSpawnBtn.addEventListener('click', spawnBody);
physResetBtn.addEventListener('click', resetPhysics);
physGravitySlider.addEventListener('input', () => {
    physGravity = parseInt(physGravitySlider.value);
    physGravityDisplay.textContent = physGravity;
});
physRestitutionSlider.addEventListener('input', () => {
    physRestitution = parseFloat(physRestitutionSlider.value);
    physRestitutionDisplay.textContent = physRestitution.toFixed(2);
});

// 5 initial bodies
for (let i = 0; i < 5; i++) spawnBody();
requestAnimationFrame(physLoop);


// ============================================================
// 5. SCENE GRAPH — Hierarchical Transforms
// ============================================================
const sceneCanvas = document.getElementById('scene-canvas');
const sceneCtx = sceneCanvas.getContext('2d');
const sceneAddBtn = document.getElementById('scene-add-child');
const sceneRemoveBtn = document.getElementById('scene-remove');
const sceneResetBtn = document.getElementById('scene-reset');
const sceneSpeedSlider = document.getElementById('scene-speed');
const sceneSpeedDisplay = document.getElementById('scene-speed-display');

let rootSpeed = 1.0;

class SceneNode {
    constructor(orbitRadius, orbitSpeed, size, color, parent = null) {
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = orbitSpeed;
        this.size = size;
        this.color = color;
        this.angle = Math.random() * Math.PI * 2;
        this.children = [];
        this.parent = parent;
        // World position (computed each frame)
        this.worldX = 0;
        this.worldY = 0;
    }

    update(dt, parentX, parentY, speedMul) {
        this.angle += this.orbitSpeed * speedMul * dt;

        this.worldX = parentX + Math.cos(this.angle) * this.orbitRadius;
        this.worldY = parentY + Math.sin(this.angle) * this.orbitRadius;

        for (const child of this.children) {
            child.update(dt, this.worldX, this.worldY, speedMul);
        }
    }

    draw(ctx, parentX, parentY) {
        // Orbit path
        if (this.orbitRadius > 0) {
            ctx.beginPath();
            ctx.arc(parentX, parentY, this.orbitRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 109, 0, 0.1)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        // Connection line
        if (this.orbitRadius > 0) {
            ctx.beginPath();
            ctx.moveTo(parentX, parentY);
            ctx.lineTo(this.worldX, this.worldY);
            ctx.strokeStyle = 'rgba(255, 171, 0, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Node
        ctx.beginPath();
        ctx.arc(this.worldX, this.worldY, this.size, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(
            this.worldX - this.size * 0.3, this.worldY - this.size * 0.3, 1,
            this.worldX, this.worldY, this.size
        );
        grad.addColorStop(0, '#fff');
        grad.addColorStop(1, this.color);
        ctx.fillStyle = grad;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(this.worldX, this.worldY, this.size + 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 109, 0, ${0.05 + this.size * 0.003})`;
        ctx.fill();

        // Draw children
        for (const child of this.children) {
            child.draw(ctx, this.worldX, this.worldY);
        }
    }

    getDeepestLeaf() {
        if (this.children.length === 0) return this;
        return this.children[this.children.length - 1].getDeepestLeaf();
    }

    getTotalNodes() {
        let count = 1;
        for (const c of this.children) count += c.getTotalNodes();
        return count;
    }
}

// Build initial scene graph
let sceneRoot;

function initSceneGraph() {
    sceneRoot = new SceneNode(0, 0, 18, '#ff6d00');

    const child1 = new SceneNode(90, 0.8, 10, '#ffab00', sceneRoot);
    const child2 = new SceneNode(140, 0.5, 12, '#ff8f00', sceneRoot);

    const grandchild1 = new SceneNode(35, 1.5, 5, '#ffd600', child1);
    const grandchild2 = new SceneNode(45, 1.2, 6, '#ffcc00', child2);

    child1.children.push(grandchild1);
    child2.children.push(grandchild2);
    sceneRoot.children.push(child1, child2);
}

initSceneGraph();

function addChildToDeepest() {
    const leaf = sceneRoot.getDeepestLeaf();
    const total = sceneRoot.getTotalNodes();
    if (total >= 20) return; // Cap

    const radius = 20 + Math.random() * 25;
    const speed = 0.8 + Math.random() * 1.5;
    const size = 3 + Math.random() * 5;
    const hue = Math.random() * 50 + 20;
    const newNode = new SceneNode(radius, speed, size, `hsl(${hue}, 100%, 55%)`, leaf);
    leaf.children.push(newNode);
}

function removeLastChild() {
    function removeLast(node) {
        if (node.children.length === 0) return false;
        const lastChild = node.children[node.children.length - 1];
        if (lastChild.children.length === 0) {
            node.children.pop();
            return true;
        }
        return removeLast(lastChild);
    }
    removeLast(sceneRoot);
}

let lastSceneTime = 0;
function sceneLoop(timestamp) {
    if (!lastSceneTime) lastSceneTime = timestamp;
    const dt = Math.min((timestamp - lastSceneTime) / 1000, 0.05);
    lastSceneTime = timestamp;

    const cx = sceneCanvas.width / 2;
    const cy = sceneCanvas.height / 2;

    sceneRoot.update(dt, cx, cy, rootSpeed);

    // Draw
    sceneCtx.fillStyle = '#0d0a06';
    sceneCtx.fillRect(0, 0, sceneCanvas.width, sceneCanvas.height);

    // Faint center cross
    sceneCtx.strokeStyle = 'rgba(255,109,0, 0.08)';
    sceneCtx.beginPath();
    sceneCtx.moveTo(cx - 10, cy); sceneCtx.lineTo(cx + 10, cy);
    sceneCtx.moveTo(cx, cy - 10); sceneCtx.lineTo(cx, cy + 10);
    sceneCtx.stroke();

    sceneRoot.draw(sceneCtx, cx, cy);

    // Stats
    sceneCtx.fillStyle = '#888';
    sceneCtx.font = '10px Courier New';
    sceneCtx.fillText(`Nodes: ${sceneRoot.getTotalNodes()}  |  Root Speed: ${rootSpeed.toFixed(1)}x`, 10, 15);

    requestAnimationFrame(sceneLoop);
}

sceneAddBtn.addEventListener('click', addChildToDeepest);
sceneRemoveBtn.addEventListener('click', removeLastChild);
sceneResetBtn.addEventListener('click', initSceneGraph);
sceneSpeedSlider.addEventListener('input', () => {
    rootSpeed = parseFloat(sceneSpeedSlider.value);
    sceneSpeedDisplay.textContent = rootSpeed.toFixed(1);
});

requestAnimationFrame(sceneLoop);
