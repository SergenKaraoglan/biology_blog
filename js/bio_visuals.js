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
const templateStrand =    ['T','A','C','G','G','C','A','T','C','G','A','T'];
const codingStrand =      ['A','T','G','C','C','G','T','A','G','C','T','A'];
// mRNA is complementary to template: A→U, T→A, C→G, G→C
function toRNA(base) {
    return { 'T':'A', 'A':'U', 'C':'G', 'G':'C' }[base];
}

const baseColor = { 'A':'#00ff88', 'T':'#ff0055', 'C':'#fbbf24', 'G':'#00aaff', 'U':'#a855f7' };

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

const mRNASequence = ['AUG','GCU','CCG','GAU','UGC','AAA','UGC','GCU','CCG','UAG'];
const aminoAcids   = ['Met','Ala','Pro','Asp','Cys','Lys','Cys','Ala','Pro','STOP'];
const aaColors     = ['#fbbf24','#34d399','#a78bfa','#f87171','#38bdf8','#fb923c','#38bdf8','#34d399','#a78bfa','#ef4444'];
// Hydrophobic residues fold inward; polar residues stay on the surface
const hydrophobic  = [false, true, true, false, false, false, false, true, true, false];

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
    { label: 'CAP',      x: 30,  w: 60,  color: '#334155' },
    { label: 'PROMOTER', x: 95,  w: 80,  color: '#065f46' },
    { label: 'OPERATOR', x: 180, w: 60,  color: '#7f1d1d' },
    { label: 'lacZ',     x: 245, w: 90,  color: '#1e3a5f' },
    { label: 'lacY',     x: 340, w: 70,  color: '#1e3a5f' },
    { label: 'lacA',     x: 415, w: 70,  color: '#1e3a5f' },
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

// Initialize
drawHeroDNA();
drawDnaSection();
updateCodonReader();
drawTranscription();
drawTranslation();
drawRegulation();
