/* bio_visuals.js — Core animations for Biology Blog */

// --- Hero Animation: DNA Double Helix ---
const heroCanvas = document.getElementById('heroCanvas');
const heroCtx = heroCanvas.getContext('2d');

let time = 0;

function drawHeroDNA() {
    const width = heroCanvas.width;
    const height = heroCanvas.height;
    heroCtx.clearRect(0, 0, width, height);

    const nodes = 30;
    const spacing = width / nodes;
    const amp = 40;
    const freq = 0.05;

    for (let i = 0; i < nodes; i++) {
        const x = i * spacing + spacing / 2;
        const yOffset = height / 2;
        
        const y1 = yOffset + Math.sin(time + i * freq * 10) * amp;
        const y2 = yOffset + Math.sin(time + i * freq * 10 + Math.PI) * amp;

        // Draw bridge (hydrogen bonds)
        heroCtx.beginPath();
        heroCtx.moveTo(x, y1);
        heroCtx.lineTo(x, y2);
        heroCtx.strokeStyle = (i % 2 === 0) ? '#00ff8844' : '#00aaff44';
        heroCtx.lineWidth = 2;
        heroCtx.stroke();

        // Draw nodes (bases)
        heroCtx.beginPath();
        heroCtx.arc(x, y1, 4, 0, Math.PI * 2);
        heroCtx.fillStyle = '#00ff88';
        heroCtx.fill();

        heroCtx.beginPath();
        heroCtx.arc(x, y2, 4, 0, Math.PI * 2);
        heroCtx.fillStyle = '#00aaff';
        heroCtx.fill();
    }

    time += 0.03;
    requestAnimationFrame(drawHeroDNA);
}

// --- DNA Section Animation: Twirling Helix ---
const dnaCanvas = document.getElementById('dnaCanvas');
const dnaCtx = dnaCanvas.getContext('2d');

let dnaTime = 0;
let isTwirling = true;

function drawDnaSection() {
    const w = dnaCanvas.width;
    const h = dnaCanvas.height;
    dnaCtx.clearRect(0, 0, w, h);

    const pairs = 15;
    const padding = 50;
    const spacing = (h - padding * 2) / pairs;

    for (let i = 0; i < pairs; i++) {
        const y = padding + i * spacing;
        const angle = dnaTime + i * 0.5;
        
        const r = 80; // Helix radius
        const x1 = w / 2 + Math.cos(angle) * r;
        const x2 = w / 2 + Math.cos(angle + Math.PI) * r;
        
        const z1 = Math.sin(angle);
        const z2 = Math.sin(angle + Math.PI);

        // Bridge
        dnaCtx.beginPath();
        dnaCtx.moveTo(x1, y);
        dnaCtx.lineTo(x2, y);
        dnaCtx.strokeStyle = '#333';
        dnaCtx.lineWidth = 1;
        dnaCtx.stroke();

        // Rungs (Base pairs)
        const midpoint = (x1 + x2) / 2;
        dnaCtx.beginPath();
        dnaCtx.moveTo(x1, y);
        dnaCtx.lineTo(midpoint, y);
        dnaCtx.strokeStyle = (i % 2 === 0) ? '#00ff88' : '#ff0055'; // A-T
        dnaCtx.lineWidth = 3;
        dnaCtx.stroke();

        dnaCtx.beginPath();
        dnaCtx.moveTo(midpoint, y);
        dnaCtx.lineTo(x2, y);
        dnaCtx.strokeStyle = (i % 2 === 0) ? '#00aaff' : '#fbbf24'; // G-C
        dnaCtx.lineWidth = 3;
        dnaCtx.stroke();

        // Backbone points
        const size1 = 5 + z1 * 2;
        const size2 = 5 + z2 * 2;
        
        dnaCtx.beginPath();
        dnaCtx.arc(x1, y, size1, 0, Math.PI * 2);
        dnaCtx.fillStyle = '#fff';
        dnaCtx.fill();

        dnaCtx.beginPath();
        dnaCtx.arc(x2, y, size2, 0, Math.PI * 2);
        dnaCtx.fillStyle = '#fff';
        dnaCtx.fill();
    }

    if (isTwirling) dnaTime += 0.02;
    requestAnimationFrame(drawDnaSection);
}

document.getElementById('dna-twirl-btn').addEventListener('click', () => {
    isTwirling = !isTwirling;
});

// Initialize
drawHeroDNA();
drawDnaSection();
