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

// --- Section 3: Nucleotide Assembly ---
const assemblyCanvas = document.getElementById('assemblyCanvas');
const assemblyCtx = assemblyCanvas ? assemblyCanvas.getContext('2d') : null;
const snapBtn = document.getElementById('assembly-snap-btn');

let assemblyProgress = 0; // 0 (separated) to 1 (snapped)
let isSnapping = false;

function drawAssembly() {
    if (!assemblyCtx) return;
    const w = assemblyCanvas.width;
    const h = assemblyCanvas.height;
    assemblyCtx.clearRect(0, 0, w, h);

    if (isSnapping) {
        assemblyProgress += (1 - assemblyProgress) * 0.08;
        if (assemblyProgress > 0.99) assemblyProgress = 1;
    } else {
        assemblyProgress += (0 - assemblyProgress) * 0.08;
        if (assemblyProgress < 0.01) assemblyProgress = 0;
    }

    const midX = w / 2;
    const offset = 80 * (1 - assemblyProgress); 

    const leftEdge = midX - 50 - offset; 
    const rightEdge = midX + 50 + offset;

    assemblyCtx.fillStyle = '#444';
    assemblyCtx.fillRect(leftEdge - 20, 20, 20, h - 40);
    assemblyCtx.fillRect(rightEdge, 20, 20, h - 40);
    
    assemblyCtx.fillStyle = '#aaa';
    assemblyCtx.font = '12px monospace';
    assemblyCtx.textAlign = 'center';
    assemblyCtx.fillText('BACKBONE', leftEdge - 10, h - 5);
    assemblyCtx.fillText('BACKBONE', rightEdge + 10, h - 5);

    const pairs = [
        { y: 70, left: 'A', right: 'T', lc: '#00ff88', rc: '#ff0055' },
        { y: 125, left: 'C', right: 'G', lc: '#fbbf24', rc: '#00aaff' },
        { y: 180, left: 'T', right: 'A', lc: '#ff0055', rc: '#00ff88' }
    ];

    pairs.forEach(p => {
        // Left
        assemblyCtx.fillStyle = p.lc;
        assemblyCtx.beginPath();
        assemblyCtx.moveTo(leftEdge, p.y - 20);
        
        if (p.left === 'A') {
            assemblyCtx.lineTo(leftEdge + 30, p.y - 20); 
            assemblyCtx.lineTo(leftEdge + 50, p.y); 
            assemblyCtx.lineTo(leftEdge + 30, p.y + 20); 
        } else if (p.left === 'T') {
            assemblyCtx.lineTo(leftEdge + 50, p.y - 20); 
            assemblyCtx.lineTo(leftEdge + 30, p.y); 
            assemblyCtx.lineTo(leftEdge + 50, p.y + 20); 
        } else if (p.left === 'C') {
            assemblyCtx.lineTo(leftEdge + 30, p.y - 20); 
            assemblyCtx.arc(leftEdge + 30, p.y, 20, -Math.PI/2, Math.PI/2); 
        } else if (p.left === 'G') {
            assemblyCtx.lineTo(leftEdge + 50, p.y - 20); 
            assemblyCtx.arc(leftEdge + 50, p.y, 20, -Math.PI/2, Math.PI/2, true); 
        }
        assemblyCtx.lineTo(leftEdge, p.y + 20); 
        assemblyCtx.fill();
        assemblyCtx.fillStyle = '#000';
        assemblyCtx.textAlign = 'center';
        assemblyCtx.fillText(p.left, leftEdge + 15, p.y + 4);

        // Right
        assemblyCtx.fillStyle = p.rc;
        assemblyCtx.beginPath();
        assemblyCtx.moveTo(rightEdge, p.y - 20);
        
        if (p.right === 'A') {
            assemblyCtx.lineTo(rightEdge - 30, p.y - 20);
            assemblyCtx.lineTo(rightEdge - 50, p.y); 
            assemblyCtx.lineTo(rightEdge - 30, p.y + 20);
        } else if (p.right === 'T') {
            assemblyCtx.lineTo(rightEdge - 50, p.y - 20); 
            assemblyCtx.lineTo(rightEdge - 30, p.y); 
            assemblyCtx.lineTo(rightEdge - 50, p.y + 20);
        } else if (p.right === 'C') {
            assemblyCtx.lineTo(rightEdge - 30, p.y - 20);
            assemblyCtx.arc(rightEdge - 30, p.y, 20, -Math.PI/2, Math.PI/2, true); 
        } else if (p.right === 'G') {
            assemblyCtx.lineTo(rightEdge - 50, p.y - 20);
            assemblyCtx.arc(rightEdge - 50, p.y, 20, -Math.PI/2, Math.PI/2); 
        }
        assemblyCtx.lineTo(rightEdge, p.y + 20); 
        assemblyCtx.fill();
        assemblyCtx.fillStyle = '#000';
        assemblyCtx.fillText(p.right, rightEdge - 15, p.y + 4);

        if (assemblyProgress > 0.5) {
            assemblyCtx.strokeStyle = `rgba(255,255,255,${(assemblyProgress-0.5)*2})`;
            assemblyCtx.setLineDash([4, 4]);
            assemblyCtx.lineWidth = 1;
            assemblyCtx.beginPath();
            const bonds = (p.left === 'C' || p.left === 'G') ? 3 : 2;
            for(let i=0; i<bonds; i++) {
                const by = p.y - 8 + (i * (16/(bonds-1)));
                assemblyCtx.moveTo(midX - 10, by);
                assemblyCtx.lineTo(midX + 10, by);
            }
            assemblyCtx.stroke();
            assemblyCtx.setLineDash([]);
        }
    });

    requestAnimationFrame(drawAssembly);
}

if (assemblyCanvas) {
    drawAssembly();
    if (snapBtn) {
        snapBtn.addEventListener('click', () => {
            isSnapping = !isSnapping;
            snapBtn.innerText = isSnapping ? 'SEPARATE STRANDS' : 'SNAP NUCLEOTIDES';
        });
    }
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

// --- Section 2: Codon Reader ---
const codonCanvas = document.getElementById('codonCanvas');
const codonCtx = codonCanvas.getContext('2d');
const codonVal = document.getElementById('codon-val');
const aminoVal = document.getElementById('amino-val');

let currentCodon = ["A", "T", "G"];
const bases = ["A", "T", "C", "G"];
const codonTable = {
    "ATG": "Methionine (START)", "TTT": "Phenylalanine", "TTC": "Phenylalanine",
    "TTA": "Leucine", "TTG": "Leucine", "TCT": "Serine", "TCC": "Serine",
    "TCA": "Serine", "TCG": "Serine", "TAT": "Tyrosine", "TAC": "Tyrosine",
    "TAA": "STOP", "TAG": "STOP", "TGA": "STOP", "TGT": "Cysteine", "TGC": "Cysteine"
    // (Simplified for brevity, but enough for variety)
};

function updateCodonReader() {
    const seq = currentCodon.join("");
    codonVal.innerText = seq;
    aminoVal.innerText = codonTable[seq] || "Amino Acid X (Generic)";

    // Draw
    const w = codonCanvas.width;
    const h = codonCanvas.height;
    codonCtx.clearRect(0, 0, w, h);

    currentCodon.forEach((base, i) => {
        const x = (w / 4) * (i + 1);
        const y = h / 2;

        codonCtx.beginPath();
        codonCtx.arc(x, y, 30, 0, Math.PI * 2);
        codonCtx.strokeStyle = "#333";
        codonCtx.lineWidth = 1;
        codonCtx.stroke();

        codonCtx.fillStyle = "#fff";
        codonCtx.font = "bold 24px 'Courier New'";
        codonCtx.textAlign = "center";
        codonCtx.textBaseline = "middle";
        codonCtx.fillText(base, x, y);

        codonCtx.fillStyle = (base === "A") ? "#00ff88" : (base === "T") ? "#ff0055" : (base === "C") ? "#fbbf24" : "#00aaff";
        codonCtx.beginPath();
        codonCtx.arc(x, y + 50, 5, 0, Math.PI * 2);
        codonCtx.fill();
    });
}

document.querySelectorAll('.base-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const pos = parseInt(btn.dataset.pos);
        const nextIdx = (bases.indexOf(currentCodon[pos]) + 1) % 4;
        currentCodon[pos] = bases[nextIdx];
        btn.innerText = currentCodon[pos];
        updateCodonReader();
    });
});

// --- Section 3: Transcription Animation (High Fidelity) ---
const transCanvas = document.getElementById('transcriptionCanvas');
const transCtx = transCanvas.getContext('2d');
let transProgress = -1; // -1 = idle
let isTranscribing = false;

// DNA template strand (3'→5') and its complement (5'→3')
const templateStrand = ['T', 'A', 'C', 'G', 'G', 'C', 'A', 'T', 'C', 'G', 'A', 'T'];
const codingStrand = ['A', 'T', 'G', 'C', 'C', 'G', 'T', 'A', 'G', 'C', 'T', 'A'];
// mRNA is complementary to template: A→U, T→A, C→G, G→C
function toRNA(base) {
    return { 'T': 'A', 'A': 'U', 'C': 'G', 'G': 'C' }[base];
}

const baseColor = { 'A': '#00ff88', 'T': '#ff0055', 'C': '#fbbf24', 'G': '#00aaff', 'U': '#a855f7' };

function drawTranscription() {
    const w = transCanvas.width;
    const h = transCanvas.height;
    transCtx.clearRect(0, 0, w, h);

    const numBases = templateStrand.length;
    const startX = 40;
    const spacing = (w - 80) / (numBases - 1);
    const midY = h / 2 - 10;
    const strandGap = 30;    // Half-gap between coding/template strands when zipped
    const unzipGap = 65;     // Half-gap when unzipped

    const polyIdx = Math.floor(transProgress);  // Which base the polymerase is on
    const polyFrac = transProgress - polyIdx;    // Sub-position within that base

    // --- Labels ---
    transCtx.fillStyle = 'rgba(255,255,255,0.1)';
    transCtx.font = '8px monospace';
    transCtx.textAlign = 'left';
    transCtx.fillText("5'", startX - 25, midY - strandGap);
    transCtx.fillText("3'", w - 15, midY - strandGap);
    transCtx.fillText("3'", startX - 25, midY + strandGap);
    transCtx.fillText("5'", w - 15, midY + strandGap);

    // For each base pair, calculate its vertical separation
    for (let i = 0; i < numBases; i++) {
        const x = startX + i * spacing;

        // How "unzipped" is this position? (0 = zipped, 1 = fully open)
        let unzipAmount = 0;
        if (transProgress >= 0) {
            const distFromPoly = transProgress - i;
            if (distFromPoly > 0 && distFromPoly < 3) {
                unzipAmount = 1 - (distFromPoly / 3); // Closing behind
            } else if (distFromPoly >= -1.5 && distFromPoly <= 0) {
                unzipAmount = 1 + distFromPoly / 1.5; // Opening ahead
                unzipAmount = Math.max(0, unzipAmount);
            }
        }

        const gap = strandGap + (unzipGap - strandGap) * unzipAmount;
        const codingY = midY - gap;
        const templateY = midY + gap;

        // --- Hydrogen bond rungs (only when zipped) ---
        if (unzipAmount < 0.8) {
            const bondAlpha = 1 - unzipAmount;
            transCtx.strokeStyle = `rgba(80, 80, 80, ${bondAlpha * 0.4})`;
            transCtx.lineWidth = 1;
            transCtx.setLineDash([2, 3]);
            transCtx.beginPath();
            transCtx.moveTo(x, codingY + 6);
            transCtx.lineTo(x, templateY - 6);
            transCtx.stroke();
            transCtx.setLineDash([]);
        }

        // --- Backbone connections ---
        if (i > 0) {
            const prevX = startX + (i - 1) * spacing;
            // Coding strand backbone
            let prevUnzip = 0;
            if (transProgress >= 0) {
                const d = transProgress - (i - 1);
                if (d > 0 && d < 3) prevUnzip = 1 - (d / 3);
                else if (d >= -1.5 && d <= 0) prevUnzip = Math.max(0, 1 + d / 1.5);
            }
            const prevGap = strandGap + (unzipGap - strandGap) * prevUnzip;

            transCtx.strokeStyle = 'rgba(255,255,255,0.1)';
            transCtx.lineWidth = 1.5;
            transCtx.beginPath();
            transCtx.moveTo(prevX, midY - prevGap);
            transCtx.lineTo(x, codingY);
            transCtx.stroke();

            transCtx.beginPath();
            transCtx.moveTo(prevX, midY + prevGap);
            transCtx.lineTo(x, templateY);
            transCtx.stroke();
        }

        // --- Base nodes ---
        const nodeR = 8;

        // Coding strand node (top)
        transCtx.beginPath();
        transCtx.arc(x, codingY, nodeR, 0, Math.PI * 2);
        transCtx.fillStyle = baseColor[codingStrand[i]];
        transCtx.fill();
        transCtx.fillStyle = '#000';
        transCtx.font = 'bold 8px monospace';
        transCtx.textAlign = 'center';
        transCtx.textBaseline = 'middle';
        transCtx.fillText(codingStrand[i], x, codingY);

        // Template strand node (bottom)
        transCtx.beginPath();
        transCtx.arc(x, templateY, nodeR, 0, Math.PI * 2);
        transCtx.fillStyle = baseColor[templateStrand[i]];
        transCtx.fill();
        transCtx.fillStyle = '#000';
        transCtx.fillText(templateStrand[i], x, templateY);
        transCtx.textBaseline = 'alphabetic';

        // --- mRNA being built below template (only for read bases) ---
        if (i < polyIdx || (i === polyIdx && polyFrac > 0.5)) {
            const rnaBase = toRNA(templateStrand[i]);
            const rnaY = templateY + 35;

            // mRNA backbone link
            if (i > 0 && (i - 1 < polyIdx || (i - 1 === polyIdx && polyFrac > 0.5))) {
                const prevRnaX = startX + (i - 1) * spacing;
                // Use the previous template position for accurate linking
                let pUnz = 0;
                if (transProgress >= 0) {
                    const d = transProgress - (i - 1);
                    if (d > 0 && d < 3) pUnz = 1 - d / 3;
                    else if (d >= -1.5 && d <= 0) pUnz = Math.max(0, 1 + d / 1.5);
                }
                const pGap = strandGap + (unzipGap - strandGap) * pUnz;
                transCtx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
                transCtx.lineWidth = 1.5;
                transCtx.beginPath();
                transCtx.moveTo(prevRnaX, midY + pGap + 35);
                transCtx.lineTo(x, rnaY);
                transCtx.stroke();
            }

            // mRNA node
            transCtx.beginPath();
            transCtx.arc(x, rnaY, nodeR, 0, Math.PI * 2);
            transCtx.fillStyle = baseColor[rnaBase];
            transCtx.fill();
            transCtx.fillStyle = '#000';
            transCtx.font = 'bold 8px monospace';
            transCtx.textAlign = 'center';
            transCtx.textBaseline = 'middle';
            transCtx.fillText(rnaBase, x, rnaY);
            transCtx.textBaseline = 'alphabetic';

            // Temporary hydrogen bond to template (fades as polymerase moves on)
            const distBehind = transProgress - i;
            if (distBehind < 2) {
                const alpha = Math.max(0, 1 - distBehind / 2);
                transCtx.strokeStyle = `rgba(168, 85, 247, ${alpha * 0.3})`;
                transCtx.setLineDash([1, 2]);
                transCtx.beginPath();
                transCtx.moveTo(x, templateY + 6);
                transCtx.lineTo(x, rnaY - 6);
                transCtx.stroke();
                transCtx.setLineDash([]);
            }
        }
    }

    // --- RNA Polymerase enzyme body ---
    if (transProgress >= 0 && transProgress < numBases) {
        const polyX = startX + transProgress * spacing;
        const polyW = 50, polyH = 55;

        // Enzyme glow
        const glow = transCtx.createRadialGradient(polyX, midY, 0, polyX, midY, polyH);
        glow.addColorStop(0, 'rgba(0, 200, 100, 0.08)');
        glow.addColorStop(1, 'rgba(0, 200, 100, 0)');
        transCtx.fillStyle = glow;
        transCtx.fillRect(polyX - polyH, midY - polyH, polyH * 2, polyH * 2);

        // Main body
        transCtx.fillStyle = 'rgba(34, 120, 80, 0.35)';
        transCtx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
        transCtx.lineWidth = 1.5;
        transCtx.beginPath();
        transCtx.roundRect(polyX - polyW / 2, midY - polyH / 2, polyW, polyH, 12);
        transCtx.fill();
        transCtx.stroke();

        // Label
        transCtx.fillStyle = 'rgba(0, 255, 136, 0.6)';
        transCtx.font = 'bold 6px monospace';
        transCtx.textAlign = 'center';
        transCtx.fillText('RNA POL II', polyX, midY - 3);
        transCtx.fillText('→', polyX, midY + 8);
    }

    // --- Strand labels ---
    transCtx.font = '8px monospace';
    transCtx.textAlign = 'right';
    transCtx.fillStyle = 'rgba(255,255,255,0.15)';
    transCtx.fillText('CODING STRAND', startX - 5, midY - strandGap + 3);
    transCtx.fillText('TEMPLATE STRAND', startX - 5, midY + strandGap + 3);
    if (transProgress > 1) {
        transCtx.fillStyle = 'rgba(168, 85, 247, 0.3)';
        transCtx.fillText('mRNA (NEW)', startX - 5, midY + strandGap + 38);
    }

    // --- Progress ---
    if (isTranscribing) {
        if (transProgress < numBases - 0.5) {
            transProgress += 0.015;
        } else {
            isTranscribing = false;
        }
    }

    requestAnimationFrame(drawTranscription);
}

document.getElementById('transcription-run-btn').addEventListener('click', () => {
    transProgress = 0;
    isTranscribing = true;
});

// --- Section 4: Protein Translation & Folding Simulator ---
const translateCanvas = document.getElementById('translationCanvas');
const translateCtx = translateCanvas.getContext('2d');

const mRNASequence = ['AUG', 'GCU', 'CCG', 'GAU', 'UGC', 'AAA', 'UGC', 'GCU', 'CCG', 'UAG'];
const aminoAcids = ['Met', 'Ala', 'Pro', 'Asp', 'Cys', 'Lys', 'Cys', 'Ala', 'Pro', 'STOP'];
const aaColors = ['#fbbf24', '#34d399', '#a78bfa', '#f87171', '#38bdf8', '#fb923c', '#38bdf8', '#34d399', '#a78bfa', '#ef4444'];
// Hydrophobic residues fold inward; polar residues stay on the surface
const hydrophobic = [false, true, true, false, false, false, false, true, true, false];

let chain = [];
let assembledCount = 0;
let isTranslating = false;
let isFolding = false;        // Phase 2: self-folding
let foldTimer = 0;
let assembleTimer = 0;
const ASSEMBLE_INTERVAL = 60;

function createNode(index) {
    // Nodes emerge from the ribosome exit channel (center-bottom of folding area)
    return {
        x: 300 + (Math.random() - 0.5) * 6,
        y: 180 + chain.length * 3,  // Stagger vertically so the chain starts extended
        vx: (Math.random() - 0.5) * 0.3,
        vy: -1.5 - Math.random() * 0.5,
        radius: 9,
        label: aminoAcids[index],
        color: aaColors[index],
        index: index,
        isHydrophobic: hydrophobic[index]
    };
}

function simulatePhysics() {
    const restLength = 22;
    const springK = 0.04;
    const damping = isFolding ? 0.96 : 0.90;
    const baseRepulsion = isFolding ? 60 : 150;  // Weaker repulsion during fold

    // 1. Backbone springs (sequential bonds)
    for (let i = 1; i < chain.length; i++) {
        const a = chain[i - 1], b = chain[i];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - restLength) * springK;
        const fx = (dx / dist) * force, fy = (dy / dist) * force;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
    }

    // 2. Steric repulsion (nodes can't overlap)
    for (let i = 0; i < chain.length; i++) {
        for (let j = i + 2; j < chain.length; j++) {
            const a = chain[i], b = chain[j];
            const dx = b.x - a.x, dy = b.y - a.y;
            const distSq = dx * dx + dy * dy || 1;
            if (distSq < baseRepulsion * baseRepulsion) {
                const dist = Math.sqrt(distSq);
                const force = (baseRepulsion / distSq) * 0.5;
                const fx = (dx / dist) * force, fy = (dy / dist) * force;
                a.vx -= fx; a.vy -= fy;
                b.vx += fx; b.vy += fy;
            }
        }
    }

    // 3. FOLDING FORCES (active only after translation completes)
    if (isFolding) {
        // --- Hydrophobic collapse: all hydrophobic residues attract toward center of mass ---
        let cx = 0, cy = 0;
        chain.forEach(n => { cx += n.x; cy += n.y; });
        cx /= chain.length; cy /= chain.length;

        chain.forEach(n => {
            if (n.isHydrophobic) {
                const dx = cx - n.x, dy = cy - n.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const pullStrength = 0.015;
                n.vx += (dx / dist) * pullStrength * dist * 0.05;
                n.vy += (dy / dist) * pullStrength * dist * 0.05;
            }
        });

        // --- Disulfide bonds: Cys residues attract each other strongly ---
        const cysIndices = chain.filter(n => n.label === 'Cys').map(n => n.index);
        for (let i = 0; i < cysIndices.length; i++) {
            for (let j = i + 1; j < cysIndices.length; j++) {
                const a = chain.find(n => n.index === cysIndices[i]);
                const b = chain.find(n => n.index === cysIndices[j]);
                if (a && b) {
                    const dx = b.x - a.x, dy = b.y - a.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const bondForce = 0.02;
                    a.vx += (dx / dist) * bondForce * dist * 0.03;
                    a.vy += (dy / dist) * bondForce * dist * 0.03;
                    b.vx -= (dx / dist) * bondForce * dist * 0.03;
                    b.vy -= (dy / dist) * bondForce * dist * 0.03;
                }
            }
        }

        foldTimer++;
    }

    // 4. Integrate & boundary
    const w = translateCanvas.width, h = translateCanvas.height;
    chain.forEach(n => {
        n.vx *= damping; n.vy *= damping;
        n.x += n.vx; n.y += n.vy;
        if (n.x < 20) { n.x = 20; n.vx *= -0.5; }
        if (n.x > w - 20) { n.x = w - 20; n.vx *= -0.5; }
        if (n.y < 20) { n.y = 20; n.vy *= -0.5; }
        if (n.y > h - 60) { n.y = h - 60; n.vy *= -0.5; }
    });
}

function drawTranslation() {
    const w = translateCanvas.width, h = translateCanvas.height;
    translateCtx.clearRect(0, 0, w, h);

    // --- mRNA Strip at the bottom ---
    translateCtx.fillStyle = 'rgba(168, 85, 247, 0.08)';
    translateCtx.fillRect(0, h - 45, w, 45);
    const codonW = w / mRNASequence.length;
    for (let i = 0; i < mRNASequence.length; i++) {
        const cx = codonW * i + codonW / 2;
        const isRead = i < assembledCount;
        const isActive = i === assembledCount && isTranslating;
        if (isActive) {
            translateCtx.fillStyle = 'rgba(168, 85, 247, 0.25)';
            translateCtx.fillRect(codonW * i, h - 45, codonW, 45);
        }
        translateCtx.fillStyle = isRead ? '#a855f7' : (isActive ? '#fff' : '#555');
        translateCtx.font = 'bold 10px monospace';
        translateCtx.textAlign = 'center';
        translateCtx.fillText(mRNASequence[i], cx, h - 27);
        translateCtx.fillStyle = isRead ? aaColors[i] : '#333';
        translateCtx.font = '8px monospace';
        translateCtx.fillText(aminoAcids[i], cx, h - 12);
    }

    // --- Ribosome indicator ---
    if (isTranslating && assembledCount < mRNASequence.length - 1) {
        translateCtx.strokeStyle = 'rgba(100, 200, 100, 0.6)';
        translateCtx.lineWidth = 2;
        translateCtx.strokeRect(codonW * assembledCount - 2, h - 47, codonW + 4, 49);
    }

    // --- Physics ---
    if (chain.length > 1) simulatePhysics();

    // --- Draw disulfide bonds (dashed cyan lines between Cys pairs) ---
    if (isFolding) {
        const cysNodes = chain.filter(n => n.label === 'Cys');
        for (let i = 0; i < cysNodes.length; i++) {
            for (let j = i + 1; j < cysNodes.length; j++) {
                const a = cysNodes[i], b = cysNodes[j];
                const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
                if (dist < 80) {
                    translateCtx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                    translateCtx.setLineDash([3, 3]);
                    translateCtx.lineWidth = 1.5;
                    translateCtx.beginPath();
                    translateCtx.moveTo(a.x, a.y);
                    translateCtx.lineTo(b.x, b.y);
                    translateCtx.stroke();
                    translateCtx.setLineDash([]);
                    // "S-S" label
                    translateCtx.fillStyle = 'rgba(0, 255, 255, 0.7)';
                    translateCtx.font = 'bold 7px monospace';
                    translateCtx.fillText('S-S', (a.x + b.x) / 2, (a.y + b.y) / 2 - 5);
                }
            }
        }
    }

    // --- Peptide bonds ---
    for (let i = 1; i < chain.length; i++) {
        const a = chain[i - 1], b = chain[i];
        translateCtx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
        translateCtx.lineWidth = 2;
        translateCtx.beginPath();
        translateCtx.moveTo(a.x, a.y);
        translateCtx.lineTo(b.x, b.y);
        translateCtx.stroke();
    }

    // --- Amino acid nodes ---
    chain.forEach(n => {
        // Hydrophobic marker (filled ring)
        if (n.isHydrophobic && isFolding) {
            translateCtx.beginPath();
            translateCtx.arc(n.x, n.y, n.radius + 5, 0, Math.PI * 2);
            translateCtx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            translateCtx.lineWidth = 1;
            translateCtx.stroke();
        }
        // Glow
        translateCtx.beginPath();
        translateCtx.arc(n.x, n.y, n.radius + 3, 0, Math.PI * 2);
        translateCtx.fillStyle = `${n.color}18`;
        translateCtx.fill();
        // Body
        translateCtx.beginPath();
        translateCtx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        translateCtx.fillStyle = n.color;
        translateCtx.fill();
        // Label
        translateCtx.fillStyle = '#000';
        translateCtx.font = 'bold 7px monospace';
        translateCtx.textAlign = 'center';
        translateCtx.textBaseline = 'middle';
        translateCtx.fillText(n.label, n.x, n.y);
        translateCtx.textBaseline = 'alphabetic';
    });

    // --- Assembly logic ---
    if (isTranslating && assembledCount < mRNASequence.length - 1) {
        assembleTimer++;
        if (assembleTimer >= ASSEMBLE_INTERVAL) {
            assembleTimer = 0;
            chain.push(createNode(assembledCount));
            assembledCount++;
            if (assembledCount >= mRNASequence.length - 1) {
                isTranslating = false;
                isFolding = true;  // Begin self-folding phase
                foldTimer = 0;
            }
        }
    }

    // --- Status ---
    translateCtx.fillStyle = 'rgba(255,255,255,0.2)';
    translateCtx.font = '9px monospace';
    translateCtx.textAlign = 'left';
    if (isTranslating) {
        translateCtx.fillText(`TRANSLATING... ${assembledCount}/${mRNASequence.length - 1} RESIDUES`, 10, 15);
    } else if (isFolding) {
        const foldPct = Math.min(100, Math.floor(foldTimer / 3));
        translateCtx.fillStyle = 'rgba(0, 255, 136, 0.4)';
        translateCtx.fillText(`SELF-FOLDING... ${foldPct}%`, 10, 15);
        if (foldPct >= 100) {
            translateCtx.fillStyle = 'rgba(0, 255, 255, 0.5)';
            translateCtx.fillText('NATIVE CONFORMATION REACHED', 10, 28);
        }
    } else if (assembledCount > 0) {
        translateCtx.fillStyle = 'rgba(0, 255, 136, 0.3)';
        translateCtx.fillText(`FOLDED — ${assembledCount} RESIDUES`, 10, 15);
    }

    requestAnimationFrame(drawTranslation);
}

document.getElementById('translation-run-btn').addEventListener('click', () => {
    chain = [];
    assembledCount = 0;
    assembleTimer = 0;
    foldTimer = 0;
    isTranslating = true;
    isFolding = false;
});

// --- Section 8: Protein Folding ---
const foldCanvas = document.getElementById('foldingCanvas');
const foldCtx = foldCanvas ? foldCanvas.getContext('2d') : null;
const foldBtn = document.getElementById('folding-run-btn');
const foldResetBtn = document.getElementById('folding-reset-btn');

let aaChain = [];
let isFoldingSim = false;

function initFolding() {
    aaChain = [];
    if (!foldCanvas) return;
    const w = foldCanvas.width;
    const h = foldCanvas.height;
    for(let i=0; i<40; i++) {
        // Give it slight zigzag so it's not perfectly straight to avoid local minima
        aaChain.push({
            x: 50 + i * (w - 100) / 40,
            y: h / 2 + (i % 2 === 0 ? 5 : -5),
            vx: 0,
            vy: 0,
            type: Math.random() > 0.4 ? 'hydrophobic' : 'hydrophilic' // 60% hydrophobic for good collapse
        });
    }
    isFoldingSim = false;
}

function drawFoldingCanvas() {
    if (!foldCtx) return;
    const w = foldCanvas.width;
    const h = foldCanvas.height;
    foldCtx.clearRect(0, 0, w, h);

    if (isFoldingSim) {
        const center = { x: w/2, y: h/2 };
        
        for(let i=0; i<aaChain.length; i++) {
            let p1 = aaChain[i];
            
            // 1. Hydrophobic effect 
            if (p1.type === 'hydrophobic') {
                const dx = center.x - p1.x;
                const dy = center.y - p1.y;
                const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                // Strong pull to center
                p1.vx += (dx / dist) * 0.3;
                p1.vy += (dy / dist) * 0.3;
            } else {
                // Hydrophilic slight push from center
                const dx = p1.x - center.x;
                const dy = p1.y - center.y;
                const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                p1.vx += (dx / dist) * 0.05;
                p1.vy += (dy / dist) * 0.05;
            }

            // 2. Spring chains
            if (i > 0) {
                let p0 = aaChain[i-1];
                let dx = p0.x - p1.x;
                let dy = p0.y - p1.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                let diff = dist - 12; 
                let force = diff * 0.2;
                p1.vx += (dx / dist) * force;
                p1.vy += (dy / dist) * force;
                p0.vx -= (dx / dist) * force;
                p0.vy -= (dy / dist) * force;
            }

            // 3. Repulsion
            for(let j=i+2; j<aaChain.length; j++) {
                let p2 = aaChain[j];
                let dx = p1.x - p2.x;
                let dy = p1.y - p2.y;
                let dist = Math.sqrt(dx*dx + dy*dy) || 1;
                if (dist < 15) {
                    let force = (15 - dist) * 0.1;
                    p1.vx += (dx / dist) * force;
                    p1.vy += (dy / dist) * force;
                    p2.vx -= (dx / dist) * force;
                    p2.vy -= (dy / dist) * force;
                }
            }
            
            p1.vx *= 0.8;
            p1.vy *= 0.8;

            p1.x += p1.vx;
            p1.y += p1.vy;
        }
    }

    // Draw backbone
    foldCtx.beginPath();
    foldCtx.moveTo(aaChain[0].x, aaChain[0].y);
    for(let i=1; i<aaChain.length; i++) {
        foldCtx.lineTo(aaChain[i].x, aaChain[i].y);
    }
    foldCtx.strokeStyle = '#555';
    foldCtx.lineWidth = 2;
    foldCtx.stroke();

    // Draw nodes
    for(let i=0; i<aaChain.length; i++) {
        let p = aaChain[i];
        foldCtx.fillStyle = p.type === 'hydrophobic' ? '#fbbf24' : '#00aaff';
        foldCtx.beginPath();
        foldCtx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        foldCtx.fill();
        foldCtx.strokeStyle = '#222';
        foldCtx.lineWidth = 1;
        foldCtx.stroke();
    }

    requestAnimationFrame(drawFoldingCanvas);
}

if (foldCanvas) {
    initFolding();
    drawFoldingCanvas();
    if (foldBtn) foldBtn.addEventListener('click', () => isFoldingSim = true);
    if (foldResetBtn) foldResetBtn.addEventListener('click', () => initFolding());
}

// --- Section 5: Gene Regulation (Lac Operon) ---
const regCanvas = document.getElementById('regulationCanvas');
const regCtx = regCanvas.getContext('2d');
const regBtn = document.getElementById('regulation-toggle-btn');
let inducerPresent = false;
let regTime = 0;
let polProgress = 0;        // RNA Polymerase position along genes
let repX = 0, repY = 0;     // Repressor animation position
let repDocked = true;
let mRNAParticles = [];

// DNA Segment definitions (x positions relative to canvas)
const DNA_Y = 160;
const segments = [
    { label: 'CAP', x: 30, w: 60, color: '#334155' },
    { label: 'PROMOTER', x: 95, w: 80, color: '#065f46' },
    { label: 'OPERATOR', x: 180, w: 60, color: '#7f1d1d' },
    { label: 'lacZ', x: 245, w: 90, color: '#1e3a5f' },
    { label: 'lacY', x: 340, w: 70, color: '#1e3a5f' },
    { label: 'lacA', x: 415, w: 70, color: '#1e3a5f' },
];

function drawRegulation() {
    const w = regCanvas.width;
    const h = regCanvas.height;
    regCtx.clearRect(0, 0, w, h);
    regTime += 0.016;

    // --- DNA backbone ---
    regCtx.strokeStyle = '#333';
    regCtx.lineWidth = 3;
    regCtx.beginPath();
    regCtx.moveTo(20, DNA_Y);
    regCtx.lineTo(w - 20, DNA_Y);
    regCtx.stroke();

    // --- DNA Segments ---
    segments.forEach(seg => {
        // Segment block
        regCtx.fillStyle = seg.color;
        regCtx.fillRect(seg.x, DNA_Y - 14, seg.w, 28);
        regCtx.strokeStyle = 'rgba(255,255,255,0.1)';
        regCtx.lineWidth = 1;
        regCtx.strokeRect(seg.x, DNA_Y - 14, seg.w, 28);

        // Label
        regCtx.fillStyle = 'rgba(255,255,255,0.5)';
        regCtx.font = 'bold 7px monospace';
        regCtx.textAlign = 'center';
        regCtx.fillText(seg.label, seg.x + seg.w / 2, DNA_Y + 3);
    });

    // --- Repressor Protein ---
    const opSeg = segments[2]; // Operator
    const repTargetX = opSeg.x + opSeg.w / 2;
    const repTargetY = DNA_Y - 35;
    const repUndockedX = 500;
    const repUndockedY = 60;

    if (inducerPresent && repDocked) {
        repDocked = false;
    } else if (!inducerPresent && !repDocked) {
        repDocked = true;
    }

    // Animate repressor position
    const goalX = repDocked ? repTargetX : repUndockedX;
    const goalY = repDocked ? repTargetY : repUndockedY;
    repX += (goalX - repX) * 0.04;
    repY += (goalY - repY) * 0.04;

    // Draw repressor (tetrameric shape — 4 circles)
    const rr = 10;
    const offsets = [[-rr, -rr], [rr, -rr], [-rr, rr], [rr, rr]];
    offsets.forEach(([ox, oy]) => {
        regCtx.beginPath();
        regCtx.arc(repX + ox, repY + oy, rr, 0, Math.PI * 2);
        regCtx.fillStyle = repDocked ? '#ef4444' : 'rgba(239, 68, 68, 0.4)';
        regCtx.fill();
        regCtx.strokeStyle = 'rgba(255,255,255,0.15)';
        regCtx.lineWidth = 1;
        regCtx.stroke();
    });
    // Repressor label
    regCtx.fillStyle = '#fff';
    regCtx.font = 'bold 6px monospace';
    regCtx.textAlign = 'center';
    regCtx.fillText('REPRESSOR', repX, repY + 2);

    // --- Inducer molecules ---
    if (inducerPresent) {
        // Draw inducer molecules floating near the repressor and binding
        for (let i = 0; i < 3; i++) {
            const ix = repX + Math.sin(regTime * 2 + i * 2.1) * 30 - 10;
            const iy = repY + Math.cos(regTime * 1.5 + i * 2.5) * 20;
            regCtx.beginPath();
            regCtx.arc(ix, iy, 5, 0, Math.PI * 2);
            regCtx.fillStyle = '#22d3ee';
            regCtx.fill();
        }
        regCtx.fillStyle = 'rgba(34, 211, 238, 0.5)';
        regCtx.font = '7px monospace';
        regCtx.fillText('LACTOSE', repX, repY + 30);

        // --- RNA Polymerase advancing along genes ---
        const geneSeg = segments[3]; // lacZ start
        const geneEnd = segments[5].x + segments[5].w;
        const geneStart = geneSeg.x;
        const geneLen = geneEnd - geneStart;

        polProgress += 0.003;
        if (polProgress > 1) polProgress = 0;

        const polX = geneStart + polProgress * geneLen;

        // Polymerase body
        regCtx.fillStyle = 'rgba(34, 120, 80, 0.5)';
        regCtx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
        regCtx.lineWidth = 1.5;
        regCtx.beginPath();
        regCtx.roundRect(polX - 18, DNA_Y - 18, 36, 36, 8);
        regCtx.fill();
        regCtx.stroke();

        regCtx.fillStyle = 'rgba(0, 255, 136, 0.7)';
        regCtx.font = 'bold 5px monospace';
        regCtx.textAlign = 'center';
        regCtx.fillText('RNA', polX, DNA_Y - 3);
        regCtx.fillText('POL', polX, DNA_Y + 5);

        // Emit mRNA particles
        if (Math.random() > 0.85) {
            mRNAParticles.push({
                x: polX,
                y: DNA_Y + 25,
                vy: 0.4 + Math.random() * 0.3,
                vx: (Math.random() - 0.5) * 0.5,
                life: 1
            });
        }
    } else {
        polProgress = 0;

        // "BLOCKED" label on operator
        if (Math.abs(repX - repTargetX) < 5) {
            regCtx.fillStyle = 'rgba(239, 68, 68, 0.4)';
            regCtx.font = '7px monospace';
            regCtx.textAlign = 'center';
            regCtx.fillText('BLOCKED', repTargetX, DNA_Y + 35);
        }
    }

    // --- mRNA Particles ---
    mRNAParticles = mRNAParticles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.008;
        regCtx.globalAlpha = p.life;
        regCtx.fillStyle = '#a855f7';
        regCtx.beginPath();
        regCtx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        regCtx.fill();
        regCtx.globalAlpha = 1;
        return p.life > 0;
    });

    // --- Status text ---
    regCtx.font = '8px monospace';
    regCtx.textAlign = 'left';
    if (inducerPresent) {
        regCtx.fillStyle = 'rgba(0, 255, 136, 0.5)';
        regCtx.fillText('GENE EXPRESSION: ON — mRNA BEING PRODUCED', 10, 15);
    } else {
        regCtx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        regCtx.fillText('GENE EXPRESSION: OFF — REPRESSOR BLOCKING OPERATOR', 10, 15);
    }

    // --- Legend ---
    regCtx.fillStyle = 'rgba(255,255,255,0.12)';
    regCtx.font = '7px monospace';
    regCtx.textAlign = 'left';
    regCtx.fillText('DNA →', 20, h - 15);
    regCtx.fillStyle = '#ef4444'; regCtx.fillRect(65, h - 20, 8, 8);
    regCtx.fillStyle = 'rgba(255,255,255,0.12)'; regCtx.fillText('REPRESSOR', 78, h - 13);
    regCtx.fillStyle = '#22d3ee'; regCtx.fillRect(145, h - 20, 8, 8);
    regCtx.fillStyle = 'rgba(255,255,255,0.12)'; regCtx.fillText('INDUCER', 158, h - 13);
    regCtx.fillStyle = '#a855f7'; regCtx.fillRect(210, h - 20, 8, 8);
    regCtx.fillStyle = 'rgba(255,255,255,0.12)'; regCtx.fillText('mRNA', 223, h - 13);

    requestAnimationFrame(drawRegulation);
}

regBtn.addEventListener('click', () => {
    inducerPresent = !inducerPresent;
    regBtn.innerText = inducerPresent ? 'TURN OFF' : 'TURN ON';
    if (!inducerPresent) mRNAParticles = [];
});

// --- Section 6: CRISPR-Cas9 (Molecular Scissors) ---
const crisprCanvas = document.getElementById('crisprCanvas');
const crisprCtx = crisprCanvas.getContext('2d');
const cutBtn = document.getElementById('crispr-cut-btn');
const resetBtn = document.getElementById('crispr-reset-btn');

let crisprTime = 0;
let isCutting = false;
let hasCut = false;
let cutAnimProgress = 0;
let dnaScroll = 0;

const crisprDNA = "ATGCGTAGCTAGCTAGCTAGCATGCGTAGCTAG".split('');
const targetSeq = "TAGCTAG"; // The sequence the gRNA matches
const targetIdx = 10;      // Index in crisprDNA where match starts

function drawCRISPR() {
    const w = crisprCanvas.width;
    const h = crisprCanvas.height;
    crisprCtx.clearRect(0, 0, w, h);

    const midY = h / 2;
    const spacing = 25;
    const startX = 50;

    // --- Scrolling DNA ---
    if (!isCutting && !hasCut) {
        dnaScroll = (dnaScroll + 1) % (crisprDNA.length * spacing);
    }

    const currentX = (i) => startX + i * spacing - dnaScroll;

    // --- Draw DNA Strand ---
    crisprDNA.forEach((base, i) => {
        let x = currentX(i);
        if (x < -20 || x > w + 20) return;

        let yGap = 25;
        let xOffset = 0;

        // If cut, push segments apart
        if (hasCut) {
            if (i >= targetIdx + 3) {
                xOffset = cutAnimProgress * 150;
            } else {
                xOffset = -cutAnimProgress * 50;
            }
        }

        const finalX = x + xOffset;

        // Backbone
        crisprCtx.strokeStyle = 'rgba(255,255,255,0.1)';
        crisprCtx.lineWidth = 2;
        if (i > 0) {
            const prevX = currentX(i - 1) + (i > targetIdx + 3 && hasCut ? cutAnimProgress * 150 : (i <= targetIdx + 3 && hasCut ? -cutAnimProgress * 50 : 0));
            // Only draw backbone if not at the cut point
            if (!hasCut || i !== targetIdx + 4) {
                crisprCtx.beginPath();
                crisprCtx.moveTo(prevX, midY - yGap);
                crisprCtx.lineTo(finalX, midY - yGap);
                crisprCtx.stroke();
                crisprCtx.beginPath();
                crisprCtx.moveTo(prevX, midY + yGap);
                crisprCtx.lineTo(finalX, midY + yGap);
                crisprCtx.stroke();
            }
        }

        // Rungs
        crisprCtx.strokeStyle = 'rgba(255,255,255,0.05)';
        crisprCtx.beginPath();
        crisprCtx.moveTo(finalX, midY - yGap);
        crisprCtx.lineTo(finalX, midY + yGap);
        crisprCtx.stroke();

        // Nodes
        const r = 6;
        crisprCtx.beginPath();
        crisprCtx.arc(finalX, midY - yGap, r, 0, Math.PI * 2);
        crisprCtx.fillStyle = baseColor[base] || '#888';
        crisprCtx.fill();

        crisprCtx.beginPath();
        crisprCtx.arc(finalX, midY + yGap, r, 0, Math.PI * 2);
        crisprCtx.fillStyle = baseColor[toRNA(base)] || '#888';
        crisprCtx.fill();
    });

    // --- Cas9 Enzyme ---
    const casX = w / 2;
    const casY = midY;
    const casW = 140, casH = 100;

    // Enzyme Body (Semi-transparent blob)
    crisprCtx.save();
    crisprCtx.translate(casX, casY);
    if (isCutting) {
        crisprCtx.scale(1 + Math.sin(crisprTime * 10) * 0.05, 1);
    }

    crisprCtx.beginPath();
    crisprCtx.roundRect(-casW / 2, -casH / 2, casW, casH, 30);
    crisprCtx.fillStyle = 'rgba(100, 100, 110, 0.4)';
    crisprCtx.strokeStyle = 'rgba(200, 200, 210, 0.2)';
    crisprCtx.lineWidth = 2;
    crisprCtx.fill();
    crisprCtx.stroke();

    // Guide RNA (Red strand inside)
    crisprCtx.strokeStyle = 'rgba(255, 77, 77, 0.8)';
    crisprCtx.lineWidth = 4;
    crisprCtx.beginPath();
    crisprCtx.moveTo(-40, 0);
    crisprCtx.bezierCurveTo(-20, -20, 20, 20, 40, 0);
    crisprCtx.stroke();

    crisprCtx.fillStyle = '#fff';
    crisprCtx.font = 'bold 8px monospace';
    crisprCtx.textAlign = 'center';
    crisprCtx.fillText('CAS9 ENZYME', 0, -35);
    crisprCtx.fillStyle = 'rgba(255, 77, 77, 0.9)';
    crisprCtx.fillText('GUIDE RNA', 0, 20);
    crisprCtx.restore();

    // --- Interaction Logic ---
    if (isCutting) {
        cutAnimProgress += 0.02;
        if (cutAnimProgress >= 1) {
            isCutting = false;
            hasCut = true;
        }

        // Flash effect at cut point
        crisprCtx.beginPath();
        crisprCtx.arc(casX, casY, cutAnimProgress * 100, 0, Math.PI * 2);
        crisprCtx.strokeStyle = `rgba(255, 255, 255, ${1 - cutAnimProgress})`;
        crisprCtx.stroke();
    }

    if (hasCut && cutAnimProgress < 2) {
        cutAnimProgress += 0.01;
    }

    crisprTime += 0.02;
    requestAnimationFrame(drawCRISPR);
}

cutBtn.addEventListener('click', () => {
    if (!hasCut && !isCutting) {
        isCutting = true;
        cutAnimProgress = 0;
        cutBtn.disabled = true;
    }
});

resetBtn.addEventListener('click', () => {
    hasCut = false;
    isCutting = false;
    cutAnimProgress = 0;
    dnaScroll = 0;
    cutBtn.disabled = false;
});

// --- Section 1: The Container (Cell Membrane) ---
const membraneCanvas = document.getElementById('membraneCanvas');
const membraneCtx = membraneCanvas.getContext('2d');
const membraneBtn = document.getElementById('membrane-permeability-btn');

let channelsOpen = false;
let membraneParticles = [];

// Initialize particles inside and outside
for (let i = 0; i < 80; i++) {
    membraneParticles.push({
        x: Math.random() * 600,
        y: Math.random() * 300,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        type: Math.random() > 0.5 ? 'charged' : 'neutral'
    });
}

function drawMembrane() {
    const w = membraneCanvas.width;
    const h = membraneCanvas.height;
    membraneCtx.clearRect(0, 0, w, h);

    // Membrane in the middle vertical
    const memX = w / 2 - 15;
    const memWidth = 30;

    // Membrane visual
    membraneCtx.fillStyle = '#ff005544';
    membraneCtx.fillRect(memX, 0, memWidth, h);

    // Channels
    const channels = [h * 0.25, h * 0.75];
    channels.forEach(y => {
        membraneCtx.fillStyle = channelsOpen ? '#00ff8888' : '#ff005588';
        membraneCtx.fillRect(memX, y - 20, memWidth, 40);
        if (channelsOpen) {
            membraneCtx.clearRect(memX + 10, y - 20, 10, 40);
        }
    });

    // Update & draw particles
    membraneParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off canvas edges
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Interaction with membrane
        const hitMembrane = p.x > memX && p.x < memX + memWidth;
        if (hitMembrane) {
            let pass = false;
            if (p.type === 'neutral') {
                pass = true; // Neutrals cross freely
            } else {
                if (channelsOpen) {
                    // Check if near channel
                    if (Math.abs(p.y - channels[0]) < 20 || Math.abs(p.y - channels[1]) < 20) {
                        pass = true;
                    }
                }
            }
            if (!pass) {
                p.vx *= -1; // Bounce
                p.x += p.vx * 2; // Extra push out
            }
        }

        membraneCtx.beginPath();
        membraneCtx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        membraneCtx.fillStyle = p.type === 'charged' ? '#00aaff' : '#00ff88';
        membraneCtx.fill();
    });

    requestAnimationFrame(drawMembrane);
}

membraneBtn.addEventListener('click', () => {
    channelsOpen = !channelsOpen;
    membraneBtn.innerText = channelsOpen ? 'TOGGLE CHANNELS: OPEN' : 'TOGGLE CHANNELS: CLOSED';
});

// --- Section 2: Thermodynamics (ATP) ---
const atpCanvas = document.getElementById('atpCanvas');
const atpCtx = atpCanvas.getContext('2d');
let atpCharged = false;
let atpTime = 0;
let motorX = 50;

function drawATP() {
    const w = atpCanvas.width;
    const h = atpCanvas.height;
    atpCtx.clearRect(0, 0, w, h);
    atpTime++;

    // Draw Mitochondrion
    atpCtx.fillStyle = '#ff4d4d22';
    atpCtx.beginPath();
    atpCtx.ellipse(w * 0.75, h / 2, 80, 50, 0, 0, Math.PI * 2);
    atpCtx.fill();
    atpCtx.strokeStyle = '#ff4d4d88';
    atpCtx.stroke();

    // Draw Motor Protein
    atpCtx.fillStyle = '#00aaff88';
    atpCtx.fillRect(motorX, h * 0.7, 40, 40);
    atpCtx.fillStyle = '#fff';
    atpCtx.font = '10px monospace';
    atpCtx.fillText('MOTOR', motorX + 5, h * 0.7 + 24);

    // Draw ATP/ADP
    const cx = w / 2;
    const cy = h * 0.3;
    atpCtx.fillStyle = atpCharged ? '#fbbf24' : '#555';
    atpCtx.beginPath();
    atpCtx.arc(cx, cy, 20, 0, Math.PI * 2);
    atpCtx.fill();

    atpCtx.fillStyle = '#fff';
    atpCtx.fillText(atpCharged ? 'ATP' : 'ADP', cx - 10, cy + 4);

    if (atpCharged) {
        // Sparkle
        atpCtx.fillStyle = '#fbbf24';
        atpCtx.beginPath();
        atpCtx.arc(cx + Math.sin(atpTime * 0.2) * 25, cy + Math.cos(atpTime * 0.2) * 25, 3, 0, Math.PI * 2);
        atpCtx.fill();
    }

    requestAnimationFrame(drawATP);
}

document.getElementById('atp-charge-btn').addEventListener('click', () => {
    atpCharged = true;
});
document.getElementById('atp-use-btn').addEventListener('click', () => {
    if (atpCharged) {
        atpCharged = false;
        motorX += 50;
        if (motorX > w - 50) motorX = 50;
    }
});

// --- Section 8: Evolution (Energy/Foraging Trade-off) ---
const evoCanvas = document.getElementById('evolutionCanvas');
const evoCtx = evoCanvas.getContext('2d');
const evoGenVal = document.getElementById('evo-gen-val');

let cells = [];
let foods = [];
let generation = 1;
let dayTimer = 0;
const DAY_LENGTH = 600;

function spawnFood(count) {
    for (let i = 0; i < count; i++) {
        foods.push({
            x: 20 + Math.random() * (evoCanvas.width - 40),
            y: 20 + Math.random() * (evoCanvas.height - 40)
        });
    }
}

function initEvo() {
    cells = [];
    foods = [];
    generation = 1;
    dayTimer = 0;
    evoGenVal.innerText = generation;

    // Spawn initial diverse population
    for (let i = 0; i < 30; i++) {
        cells.push(createCell(
            Math.random() * evoCanvas.width,
            Math.random() * evoCanvas.height,
            0.5 + Math.random() * 2.5, // Speed: 0.5 to 3.0
            20 + Math.random() * 80    // Sense: 20 to 100
        ));
    }
    spawnFood(60);
}

function createCell(x, y, speed, sense) {
    return {
        x: x, y: y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        speed: Math.max(0.5, speed),
        sense: Math.max(10, sense),
        energy: 100,
        foodEaten: 0,
        dead: false
    };
}

function nextGeneration() {
    // Survivors reproduce based on food eaten
    const survivors = cells.filter(c => !c.dead && c.foodEaten > 0);
    cells = [];

    if (survivors.length === 0) {
        // Extinction - restart
        initEvo();
        return;
    }

    // Reproduction with mutation
    survivors.forEach(p => {
        // Parent survives if it ate enough, otherwise just reproduces and dies. 
        // Let's say it makes 1 offspring per food eaten.
        for (let i = 0; i < p.foodEaten; i++) {
            cells.push(createCell(
                p.x + (Math.random() - 0.5) * 20,
                p.y + (Math.random() - 0.5) * 20,
                p.speed + (Math.random() - 0.5) * 0.4, // Mutate speed
                p.sense + (Math.random() - 0.5) * 10   // Mutate sense
            ));
        }
    });

    // Cap population
    while (cells.length > 50) {
        cells.splice(Math.floor(Math.random() * cells.length), 1);
    }

    generation++;
    evoGenVal.innerText = generation;
    dayTimer = 0;
    spawnFood(60);
}

function drawEvolution() {
    const w = evoCanvas.width;
    const h = evoCanvas.height;
    evoCtx.clearRect(0, 0, w, h);

    // Draw Food
    evoCtx.fillStyle = '#00ff88';
    foods.forEach(f => {
        evoCtx.beginPath();
        evoCtx.arc(f.x, f.y, 3, 0, Math.PI * 2);
        evoCtx.fill();
    });

    // Update & Draw Cells
    cells.forEach(c => {
        if (c.dead) {
            // Draw corpse
            evoCtx.fillStyle = '#333';
            evoCtx.beginPath();
            evoCtx.arc(c.x, c.y, 4, 0, Math.PI * 2);
            evoCtx.fill();
            return;
        }

        // --- Energy Cost ---
        // Cost scales with speed squared and sense radius linearly
        const cost = 0.05 + (c.speed * c.speed * 0.01) + (c.sense * 0.001);
        c.energy -= cost;
        if (c.energy <= 0) {
            c.dead = true;
            return;
        }

        // --- Foraging / Sense ---
        let targetFood = null;
        let minDist = c.sense;

        foods.forEach(f => {
            const dist = Math.sqrt((c.x - f.x) ** 2 + (c.y - f.y) ** 2);
            if (dist < minDist) {
                targetFood = f;
                minDist = dist;
            }
        });

        if (targetFood) {
            // Steer towards food
            const dx = targetFood.x - c.x;
            const dy = targetFood.y - c.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            c.vx = (dx / len);
            c.vy = (dy / len);

            // Eat food
            if (minDist < 6) {
                foods = foods.filter(f => f !== targetFood);
                c.energy = Math.min(200, c.energy + 40); // Restore energy
                c.foodEaten++;
            }
        } else {
            // Random wander
            c.vx += (Math.random() - 0.5) * 0.2;
            c.vy += (Math.random() - 0.5) * 0.2;
            const len = Math.sqrt(c.vx * c.vx + c.vy * c.vy) || 1;
            c.vx /= len;
            c.vy /= len;
        }

        // Move
        c.x += c.vx * c.speed;
        c.y += c.vy * c.speed;

        // Bounce
        if (c.x < 5 || c.x > w - 5) c.vx *= -1;
        if (c.y < 5 || c.y > h - 5) c.vy *= -1;

        // --- Draw ---
        // Sense Aura (larger radius = more transparent outline)
        evoCtx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0.05, 0.3 - c.sense / 400)})`;
        evoCtx.beginPath();
        evoCtx.arc(c.x, c.y, c.sense, 0, Math.PI * 2);
        evoCtx.stroke();

        // Body color based on speed (blue=slow, red=fast)
        const hue = 240 - Math.min(240, (c.speed - 0.5) * 100);
        evoCtx.fillStyle = `hsl(${hue}, 80%, 60%)`;
        evoCtx.beginPath();
        evoCtx.arc(c.x, c.y, 5, 0, Math.PI * 2);
        evoCtx.fill();

        // Energy indicator (inner dot gets smaller as energy drops)
        evoCtx.fillStyle = '#fff';
        evoCtx.beginPath();
        evoCtx.arc(c.x, c.y, Math.max(0, (c.energy / 100) * 2), 0, Math.PI * 2);
        evoCtx.fill();
    });

    // Time progress
    dayTimer++;
    evoCtx.fillStyle = 'rgba(255,255,255,0.2)';
    evoCtx.fillRect(0, h - 5, (dayTimer / DAY_LENGTH) * w, 5);

    if (dayTimer >= DAY_LENGTH) {
        nextGeneration();
    }

    requestAnimationFrame(drawEvolution);
}

document.getElementById('evo-spawn-btn').addEventListener('click', () => {
    // Manually progress to next generation or spawn food early
    nextGeneration();
});

// Start the simulation
initEvo();

// --- Section 9: Rogue Code (Viruses) ---
const virusCanvas = document.getElementById('virusCanvas');
const virusCtx = virusCanvas.getContext('2d');
const infectBtn = document.getElementById('virus-infect-btn');

let virusState = 'idle'; // idle, injecting, replicating, lysis
let virusTimer = 0;
let viralParticles = [];
let hostHealth = 100;

function drawVirus() {
    const w = virusCanvas.width;
    const h = virusCanvas.height;
    virusCtx.clearRect(0, 0, w, h);

    // Host Cell (Large circle covering bottom right)
    const cellX = w * 0.7;
    const cellY = h * 0.8;
    const cellR = 150;

    virusCtx.beginPath();
    virusCtx.arc(cellX, cellY, cellR, 0, Math.PI * 2);
    virusCtx.strokeStyle = virusState === 'lysis' ? '#555' : '#00aaff';
    virusCtx.lineWidth = 4;

    if (virusState === 'lysis') {
        virusCtx.setLineDash([10, 15]);
    } else {
        virusCtx.setLineDash([]);
    }
    virusCtx.stroke();
    virusCtx.fillStyle = '#0f172a';
    virusCtx.fill();
    virusCtx.setLineDash([]);

    // Host Nucleus / Ribosomes area
    if (virusState !== 'lysis') {
        virusCtx.fillStyle = 'rgba(0, 170, 255, 0.1)';
        virusCtx.beginPath();
        virusCtx.arc(cellX, cellY, 60, 0, Math.PI * 2);
        virusCtx.fill();
        virusCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        virusCtx.font = '10px monospace';
        virusCtx.textAlign = 'center';
        virusCtx.fillText('HOST RIBOSOMES', cellX, cellY);
        virusCtx.textAlign = 'left';
    }

    // The Bacteriophage (Attacking from top left of cell)
    const phageX = cellX - 120;
    const phageY = cellY - 120;

    if (virusState !== 'lysis') {
        // Draw Phage
        virusCtx.strokeStyle = '#a3e635';
        virusCtx.lineWidth = 2;

        // Head (Hexagon)
        virusCtx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const hx = phageX - 20 + Math.cos(angle) * 15;
            const hy = phageY - 20 + Math.sin(angle) * 15;
            if (i === 0) virusCtx.moveTo(hx, hy);
            else virusCtx.lineTo(hx, hy);
        }
        virusCtx.closePath();
        virusCtx.stroke();

        // DNA inside head (if not injected)
        if (virusState === 'idle' || (virusState === 'injecting' && virusTimer < 50)) {
            virusCtx.fillStyle = '#a3e635';
            virusCtx.beginPath();
            virusCtx.arc(phageX - 20, phageY - 20, 5, 0, Math.PI * 2);
            virusCtx.fill();
        }

        // Tail
        virusCtx.beginPath();
        virusCtx.moveTo(phageX - 10, phageY - 10);
        virusCtx.lineTo(phageX + 10, phageY + 10);
        virusCtx.stroke();

        // Legs
        virusCtx.beginPath();
        virusCtx.moveTo(phageX + 10, phageY + 10);
        virusCtx.lineTo(phageX + 25, phageY);
        virusCtx.moveTo(phageX + 10, phageY + 10);
        virusCtx.lineTo(phageX + 5, phageY + 25);
        virusCtx.stroke();
    }

    // Injection Animation
    if (virusState === 'injecting') {
        virusTimer++;
        if (virusTimer > 20) {
            // DNA traveling down
            const progress = (virusTimer - 20) / 40;
            const dnaX = phageX - 10 + progress * 80;
            const dnaY = phageY - 10 + progress * 80;
            if (progress <= 1) {
                virusCtx.fillStyle = '#a3e635';
                virusCtx.beginPath();
                virusCtx.arc(dnaX, dnaY, 4, 0, Math.PI * 2);
                virusCtx.fill();
            } else {
                virusState = 'replicating';
                virusTimer = 0;
            }
        }
    }

    // Replicating Animation
    if (virusState === 'replicating') {
        virusTimer++;

        // Add new viral particles over time
        if (virusTimer % 20 === 0 && viralParticles.length < 50) {
            viralParticles.push({
                x: cellX + (Math.random() - 0.5) * 100,
                y: cellY + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2
            });
        }

        if (viralParticles.length >= 40) {
            hostHealth -= 2;
        }

        if (hostHealth <= 0) {
            virusState = 'lysis';
            virusTimer = 0;
        }
    }

    // Lysis Animation (Explosion)
    if (virusState === 'lysis') {
        viralParticles.forEach(p => {
            p.vx *= 1.05; // accelerate outward
            p.vy *= 1.05;
        });

        // Reset after a while
        virusTimer++;
        if (virusTimer > 200) {
            virusState = 'idle';
            virusTimer = 0;
            viralParticles = [];
            infectBtn.disabled = false;
        }
    }

    // Draw viral particles inside/outside
    viralParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce if still inside cell during replication
        if (virusState === 'replicating') {
            const dist = Math.sqrt((p.x - cellX) ** 2 + (p.y - cellY) ** 2);
            if (dist > cellR - 10) {
                p.vx *= -1;
                p.vy *= -1;
            }
        }

        // Draw mini phage
        virusCtx.strokeStyle = '#a3e635';
        virusCtx.beginPath();
        virusCtx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        virusCtx.stroke();
    });

    requestAnimationFrame(drawVirus);
}

infectBtn.addEventListener('click', () => {
    if (virusState === 'idle' || virusState === 'lysis') {
        virusState = 'injecting';
        virusTimer = 0;
        viralParticles = [];
        hostHealth = 100;
        infectBtn.disabled = true;
    }
});

// --- Section 10: Self vs. Non-Self (Immunology) ---
const immuneCanvas = document.getElementById('immuneCanvas');
const immuneCtx = immuneCanvas.getContext('2d');
const immuneSpawnBtn = document.getElementById('immune-spawn-btn');
const abBtns = document.querySelectorAll('.ab-select-btn');

let activeAntibody = 'triangle';
let pathogens = [];
let antibodies = [];

abBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        abBtns.forEach(b => b.style.background = 'transparent');
        e.target.style.background = 'var(--immune-cyan)';
        e.target.style.color = '#000';
        activeAntibody = e.target.dataset.shape;

        // Recolor others
        abBtns.forEach(b => {
            if (b !== e.target) b.style.color = '#fff';
        });

        // Spawn an antibody fleet
        for (let i = 0; i < 5; i++) {
            antibodies.push({
                x: immuneCanvas.width / 2,
                y: immuneCanvas.height / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                shape: activeAntibody,
                life: 100
            });
        }
    });
});
if (abBtns.length > 0) abBtns[0].click(); // Select first by default

function spawnPathogen() {
    const shapes = ['triangle', 'square', 'circle', 'star'];
    pathogens.push({
        x: Math.random() < 0.5 ? 0 : immuneCanvas.width,
        y: Math.random() * immuneCanvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        antigen: shapes[Math.floor(Math.random() * shapes.length)],
        repTimer: 0
    });
}

function drawShape(ctx, shape, x, y, size) {
    ctx.beginPath();
    if (shape === 'triangle') {
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x - size, y + size);
    } else if (shape === 'square') {
        ctx.rect(x - size, y - size, size * 2, size * 2);
    } else if (shape === 'circle') {
        ctx.arc(x, y, size, 0, Math.PI * 2);
    } else if (shape === 'star') {
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(x + Math.cos((18 + i * 72) * Math.PI / 180) * size, y - Math.sin((18 + i * 72) * Math.PI / 180) * size);
            ctx.lineTo(x + Math.cos((54 + i * 72) * Math.PI / 180) * size / 2, y - Math.sin((54 + i * 72) * Math.PI / 180) * size / 2);
        }
    }
    ctx.closePath();
}

function drawImmune() {
    const w = immuneCanvas.width;
    const h = immuneCanvas.height;
    immuneCtx.clearRect(0, 0, w, h);

    // Update & Draw Pathogens
    for (let i = pathogens.length - 1; i >= 0; i--) {
        const p = pathogens[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Draw Pathogen Body (Red)
        immuneCtx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        immuneCtx.beginPath();
        immuneCtx.arc(p.x, p.y, 15, 0, Math.PI * 2);
        immuneCtx.fill();

        // Draw Antigen Surface Markers
        immuneCtx.strokeStyle = '#fff';
        immuneCtx.lineWidth = 1;
        drawShape(immuneCtx, p.antigen, p.x, p.y, 6);
        immuneCtx.stroke();

        // Replication
        p.repTimer++;
        if (p.repTimer > 300 && pathogens.length < 20) {
            p.repTimer = 0;
            pathogens.push({
                x: p.x + 10, y: p.y + 10,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                antigen: p.antigen,
                repTimer: 0
            });
        }
    }

    // Update & Draw Antibodies
    for (let i = antibodies.length - 1; i >= 0; i--) {
        const ab = antibodies[i];
        ab.x += ab.vx;
        ab.y += ab.vy;
        ab.life -= 0.5;

        // Draw Y-shape
        immuneCtx.strokeStyle = 'var(--immune-cyan)';
        immuneCtx.lineWidth = 2;
        immuneCtx.beginPath();
        immuneCtx.moveTo(ab.x, ab.y);
        immuneCtx.lineTo(ab.x - 5, ab.y - 5);
        immuneCtx.moveTo(ab.x, ab.y);
        immuneCtx.lineTo(ab.x + 5, ab.y - 5);
        immuneCtx.moveTo(ab.x, ab.y);
        immuneCtx.lineTo(ab.x, ab.y + 8);
        immuneCtx.stroke();

        // Draw paratope shape (tips)
        immuneCtx.fillStyle = 'var(--immune-cyan)';
        drawShape(immuneCtx, ab.shape, ab.x, ab.y - 8, 3);
        immuneCtx.fill();

        // Collision detection with pathogens
        let hit = false;
        for (let j = pathogens.length - 1; j >= 0; j--) {
            const p = pathogens[j];
            const dist = Math.sqrt((p.x - ab.x) ** 2 + (p.y - ab.y) ** 2);
            if (dist < 20) {
                if (ab.shape === p.antigen) {
                    // Match! Destroy pathogen
                    pathogens.splice(j, 1);
                    hit = true;
                    // Spawn explosion particles
                    break;
                } else {
                    // Bounce off
                    ab.vx *= -1;
                    ab.vy *= -1;
                }
            }
        }

        if (hit || ab.life <= 0 || ab.x < 0 || ab.x > w || ab.y < 0 || ab.y > h) {
            antibodies.splice(i, 1);
        }
    }

    requestAnimationFrame(drawImmune);
}

immuneSpawnBtn.addEventListener('click', spawnPathogen);

// Initialize
drawHeroDNA();
drawMembrane();
drawATP();
drawDnaSection();
updateCodonReader();
drawTranscription();
drawTranslation();
drawRegulation();
drawEvolution();
drawVirus();
drawImmune();
drawCRISPR();
