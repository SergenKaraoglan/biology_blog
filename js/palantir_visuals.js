/**
 * Palantir: The Digital Twin — Engineering Visuals
 */

// --- GLOBAL STATE ---
let time = 0;

// --- HERO VISUAL: DATA FLOW TO KNOWLEDGE ---
const heroCanvas = document.getElementById('hero-palantir-canvas');
const heroCtx = heroCanvas.getContext('2d');

function resizeHero() {
    heroCanvas.width = window.innerWidth;
    heroCanvas.height = 400;
}
window.addEventListener('resize', resizeHero);
resizeHero();

let particles = Array.from({ length: 50 }, () => ({
    x: Math.random() * 2000,
    y: Math.random() * 400,
    vx: -(2 + Math.random() * 3),
    vy: (Math.random() - 0.5) * 1
}));

function animateHero() {
    const w = heroCanvas.width, h = heroCanvas.height;
    heroCtx.fillStyle = '#0a0c10';
    heroCtx.fillRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2;

    // Hexagons (Foundry Branding)
    heroCtx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
    heroCtx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        const r = 50 + i * 40 + Math.sin(time + i) * 5;
        drawHex(heroCtx, cx, cy, r);
    }

    // Particles
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w + 100;
        
        const dist = Math.hypot(p.x - cx, p.y - cy);
        if (dist < 150) {
            heroCtx.fillStyle = 'rgba(212, 175, 55, 0.8)';
            heroCtx.beginPath(); heroCtx.arc(p.x, p.y, 2, 0, Math.PI * 2); heroCtx.fill();
            heroCtx.strokeStyle = 'rgba(212, 175, 55, 0.1)';
            heroCtx.beginPath(); heroCtx.moveTo(p.x, p.y); heroCtx.lineTo(cx, cy); heroCtx.stroke();
        } else {
            heroCtx.fillStyle = '#334155';
            heroCtx.beginPath(); heroCtx.arc(p.x, p.y, 1, 0, Math.PI * 2); heroCtx.fill();
        }
    });
}

function drawHex(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
    }
    ctx.closePath();
    ctx.stroke();
}

// --- ONTOLOGY GRAPH ---
const ontCanvas = document.getElementById('ontology-canvas');
const ontCtx = ontCanvas.getContext('2d');
const addRelationBtn = document.getElementById('add-relation');
const resetOntBtn = document.getElementById('reset-graph');

let nodes = [
    { x: 300, y: 200, type: 'obj', label: 'AIRCRAFT' },
    { x: 500, y: 150, type: 'obj', label: 'ENGINE' },
    { x: 500, y: 250, type: 'obj', label: 'PILOT' }
];
let rawData = [];

addRelationBtn.onclick = () => {
    for (let i = 0; i < 5; i++) {
        rawData.push({
            x: Math.random() * 800,
            y: Math.random() * 400,
            target: nodes[Math.floor(Math.random() * nodes.length)]
        });
    }
};

resetOntBtn.onclick = () => { rawData = []; };

function drawOntology() {
    const w = ontCanvas.width, h = ontCanvas.height;
    ontCtx.fillStyle = '#030712';
    ontCtx.fillRect(0, 0, w, h);

    // Raw Data to Object Mapping
    rawData.forEach(d => {
        d.x += (d.target.x - d.x) * 0.02;
        d.y += (d.target.y - d.y) * 0.02;
        ontCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ontCtx.beginPath(); ontCtx.arc(d.x, d.y, 2, 0, Math.PI * 2); ontCtx.fill();
        ontCtx.strokeStyle = 'rgba(212, 175, 55, 0.05)';
        ontCtx.beginPath(); ontCtx.moveTo(d.x, d.y); ontCtx.lineTo(d.target.x, d.target.y); ontCtx.stroke();
    });

    // Objects
    nodes.forEach(n => {
        ontCtx.strokeStyle = 'var(--accent-primary)';
        ontCtx.lineWidth = 2;
        drawHex(ontCtx, n.x, n.y, 30);
        ontCtx.fillStyle = '#fff';
        ontCtx.font = 'bold 10px Outfit';
        ontCtx.textAlign = 'center';
        ontCtx.fillText(n.label, n.x, n.y + 5);
    });
}

// --- AIP DECISION FLOW ---
const aipCanvas = document.getElementById('aip-canvas');
const aipCtx = aipCanvas.getContext('2d');
const triggerAipBtn = document.getElementById('trigger-aip');

let aipPulse = 0;
let aipActive = false;

triggerAipBtn.onclick = () => { aipActive = true; aipPulse = 0; };

function drawAIP() {
    const w = aipCanvas.width, h = aipCanvas.height;
    aipCtx.fillStyle = '#030712';
    aipCtx.fillRect(0, 0, w, h);

    const bx = w / 2, by = h / 2;

    // AIP Core
    aipCtx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    aipCtx.lineWidth = 2;
    drawHex(aipCtx, bx, by, 60 + Math.sin(time * 5) * 5);
    aipCtx.fillStyle = '#fff';
    aipCtx.font = 'bold 16px Outfit';
    aipCtx.fillText('AIP CORE', bx, by + 5);

    if (aipActive) {
        aipPulse += 0.05;
        const targets = [
            { x: bx - 200, y: by - 100, label: 'RESOURCE ALLOCATION' },
            { x: bx + 200, y: by - 100, label: 'ROUTE OPTIMIZATION' },
            { x: bx, y: by + 150, label: 'INVENTORY UPDATE' }
        ];

        targets.forEach((t, i) => {
            const p = Math.min(1, aipPulse - i * 0.5);
            if (p > 0) {
                // Connection
                aipCtx.strokeStyle = `rgba(16, 185, 129, ${p})`;
                aipCtx.beginPath();
                aipCtx.moveTo(bx, by);
                aipCtx.lineTo(bx + (t.x - bx) * p, by + (t.y - by) * p);
                aipCtx.stroke();

                // Target Node
                aipCtx.fillStyle = `rgba(16, 185, 129, ${p})`;
                aipCtx.beginPath(); aipCtx.arc(t.x, t.y, 4, 0, Math.PI * 2); aipCtx.fill();
                aipCtx.fillStyle = `rgba(255, 255, 255, ${p})`;
                aipCtx.font = '10px Inter';
                aipCtx.fillText(t.label, t.x, t.y + 20);
            }
        });

        if (aipPulse > 3) aipActive = false;
    }
}

// --- APOLLO EDGE PULSE ---
const apolloCanvas = document.getElementById('apollo-canvas');
const apolloCtx = apolloCanvas.getContext('2d');

function drawApollo() {
    const w = apolloCanvas.width, h = apolloCanvas.height;
    apolloCtx.fillStyle = '#030712';
    apolloCtx.fillRect(0, 0, w, h);

    const cx = w/2, cy = h/2;

    // Edge Nodes
    for (let i = 0; i < 8; i++) {
        const nx = cx + Math.cos(i * Math.PI / 4) * 150;
        const ny = cy + Math.sin(i * Math.PI / 4) * 100;
        apolloCtx.fillStyle = '#1f2937';
        apolloCtx.beginPath(); apolloCtx.arc(nx, ny, 5, 0, Math.PI * 2); apolloCtx.fill();
        
        // Data Pulse
        const pSize = (time * 100 + i * 20) % 300;
        if (pSize < 150) {
            apolloCtx.strokeStyle = `rgba(212, 175, 55, ${1 - pSize/150})`;
            apolloCtx.beginPath();
            apolloCtx.arc(cx, cy, pSize, 0, Math.PI * 2);
            apolloCtx.stroke();
        }
    }

    // Apollo Hub
    apolloCtx.fillStyle = 'var(--accent-primary)';
    drawHex(apolloCtx, cx, cy, 20);
}

// --- MAIN LOOP ---
function tick() {
    time += 0.01;
    animateHero();
    drawOntology();
    drawAIP();
    drawApollo();
    requestAnimationFrame(tick);
}

tick();
