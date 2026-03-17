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

// --- Section 3: Transcription Animation ---
const transCanvas = document.getElementById('transcriptionCanvas');
const transCtx = transCanvas.getContext('2d');
let transProgress = 0;
let isTranscribing = false;

function drawTranscription() {
    const w = transCanvas.width;
    const h = transCanvas.height;
    transCtx.clearRect(0, 0, w, h);
    
    const dnaSeq = "ATGCCGTAGCTA";
    const rnaSeq = "AUGCCGUAGCUA";
    const spacing = 40;
    
    // Polymerase (Grey box)
    const polyX = 50 + transProgress * spacing;
    transCtx.fillStyle = "rgba(100, 100, 100, 0.4)";
    transCtx.fillRect(polyX - 20, h/2 - 40, 60, 80);
    
    for(let i=0; i<dnaSeq.length; i++) {
        const x = 50 + i * spacing;
        
        // DNA
        transCtx.fillStyle = "#555";
        transCtx.font = "14px monospace";
        transCtx.fillText(dnaSeq[i], x, h/2 - 50);
        
        // RNA
        if (i < transProgress) {
            transCtx.fillStyle = "#a855f7";
            transCtx.font = "bold 16px monospace";
            transCtx.fillText(rnaSeq[i], x, h/2 + 20);
            
            // Link
            if (i > 0) {
                transCtx.beginPath();
                transCtx.moveTo(x - spacing + 5, h/2 + 15);
                transCtx.lineTo(x, h/2 + 15);
                transCtx.strokeStyle = "#a855f744";
                transCtx.stroke();
            }
        }
    }
    
    if (isTranscribing) {
        if (transProgress < dnaSeq.length) {
            transProgress += 0.02;
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

// --- Section 4: Translation Animation (High Fidelity) ---
const translateCanvas = document.getElementById('translationCanvas');
const translateCtx = translateCanvas.getContext('2d');
let translateProgress = 0;
let isTranslating = false;

// Background particles for immersion
const bioParticles = Array.from({ length: 20 }, () => ({
    x: Math.random() * 600,
    y: Math.random() * 300,
    size: Math.random() * 2 + 1,
    speed: Math.random() * 0.2 + 0.1,
    offset: Math.random() * Math.PI * 2
}));

function drawTranslation() {
    const w = translateCanvas.width;
    const h = translateCanvas.height;
    translateCtx.clearRect(0, 0, w, h);
    
    // 0. Draw Background Particles
    bioParticles.forEach(p => {
        p.y -= p.speed;
        if (p.y < 0) p.y = h;
        const xShift = Math.sin(time + p.offset) * 10;
        translateCtx.fillStyle = "rgba(0, 255, 136, 0.05)";
        translateCtx.beginPath();
        translateCtx.arc(p.x + xShift, p.y, p.size, 0, Math.PI * 2);
        translateCtx.fill();
    });

    const codons = ["AUG", "CCG", "UAG", "CUA"];
    const anticodons = ["UAC", "GGC", "AUC", "GAU"];
    const proteinSeq = ["Met", "Pro", "Val", "Ala"];
    const spacing = 70;
    
    // mRNA Backbone (Sliding)
    const offsetX = -translateProgress * spacing;
    translateCtx.strokeStyle = "#a855f7";
    translateCtx.setLineDash([5, 5]);
    translateCtx.lineWidth = 1;
    translateCtx.beginPath();
    translateCtx.moveTo(0, h - 60);
    translateCtx.lineTo(w, h - 60);
    translateCtx.stroke();
    translateCtx.setLineDash([]);
    
    // Ribosome - Small Subunit (bottom)
    translateCtx.fillStyle = "rgba(40, 80, 40, 0.3)";
    translateCtx.strokeStyle = "rgba(100, 200, 100, 0.4)";
    translateCtx.lineWidth = 2;
    translateCtx.beginPath();
    translateCtx.roundRect(w/2 - 90, h - 85, 180, 45, [10, 10, 20, 20]);
    translateCtx.fill();
    translateCtx.stroke();
    
    // Ribosome - Large Subunit (top) with A, P, E sites labels
    translateCtx.fillStyle = "rgba(40, 80, 40, 0.45)";
    translateCtx.beginPath();
    translateCtx.roundRect(w/2 - 110, h - 240, 220, 160, [50, 50, 10, 10]);
    translateCtx.fill();
    translateCtx.stroke();

    // Site Labels inside Ribosome
    translateCtx.fillStyle = "rgba(255,255,255,0.1)";
    translateCtx.font = "bold 10px monospace";
    translateCtx.fillText("E-SITE", w/2 - 70, h - 110);
    translateCtx.fillText("P-SITE", w/2, h - 110);
    translateCtx.fillText("A-SITE", w/2 + 70, h - 110);

    const idx = Math.floor(translateProgress);
    const fraction = translateProgress % 1;

    // 1. Draw mRNA Codons
    for(let i=0; i < codons.length; i++) {
        const x = w/2 + (i * spacing) + offsetX;
        if (x < -50 || x > w + 50) continue;
        
        translateCtx.fillStyle = (i === idx) ? "#fff" : "#a855f777";
        translateCtx.font = "12px monospace";
        translateCtx.textAlign = "center";
        translateCtx.fillText(codons[i], x, h - 45);
    }

    // 2. Draw tRNAs
    for (let i = Math.max(0, idx - 1); i <= idx + 1; i++) {
        if (i >= codons.length) continue;
        
        const xBase = w/2 + (i * spacing) + offsetX;
        let tRNA_Y = h - 65;
        let opacity = 1;
        let showAmino = true;
        
        if (i > idx) {
            // Incoming (A-site bound)
            tRNA_Y = 20 + (1 - fraction) * (h - 140);
            opacity = fraction;
        } else if (i < idx) {
            // Outgoing (E-site exit)
            opacity = 1 - fraction;
            tRNA_Y = h - 140 - fraction * 100;
            showAmino = false; // Left behind
        } else {
            // Active codon (P-site)
            tRNA_Y = h - 140;
        }

        if (xBase > 0 && xBase < w) {
            translateCtx.save();
            translateCtx.globalAlpha = opacity;
            
            // tRNA Body (T-shape)
            translateCtx.fillStyle = "#00aaff33";
            translateCtx.strokeStyle = "#00aaff";
            translateCtx.lineWidth = 1;
            translateCtx.beginPath();
            translateCtx.moveTo(xBase - 15, tRNA_Y - 40);
            translateCtx.lineTo(xBase + 15, tRNA_Y - 40);
            translateCtx.lineTo(xBase, tRNA_Y);
            translateCtx.closePath();
            translateCtx.fill();
            translateCtx.stroke();

            // Anticodon
            translateCtx.fillStyle = "#fff";
            translateCtx.font = "9px monospace";
            translateCtx.fillText(anticodons[i], xBase, tRNA_Y - 5);

            // Amino Acid
            if (showAmino && i < proteinSeq.length) {
                translateCtx.fillStyle = "var(--protein-gold)";
                translateCtx.beginPath();
                translateCtx.arc(xBase, tRNA_Y - 55, 10, 0, Math.PI * 2);
                translateCtx.fill();
                
                // Peptide Bond Sparkle if just added
                if (i === idx && fraction < 0.2) {
                    translateCtx.fillStyle = "#fff";
                    const sparkSize = (0.2 - fraction) * 100;
                    translateCtx.beginPath();
                    translateCtx.arc(xBase, tRNA_Y - 70, sparkSize, 0, Math.PI * 2);
                    translateCtx.fill();
                }
            }
            translateCtx.restore();
        }
    }

    // 3. Growing Peptide Chain
    for(let i=0; i <= idx; i++) {
        const x = w/2 - (idx - i) * 18;
        const y = h - 250 - (Math.sin(i * 0.5 + time) * 8);
        
        translateCtx.fillStyle = "var(--protein-gold)";
        translateCtx.beginPath();
        translateCtx.arc(x, y, 7, 0, Math.PI * 2);
        translateCtx.fill();
        
        if (i > 0) {
            const prevX = w/2 - (idx - (i-1)) * 18;
            const prevY = h - 250 - (Math.sin((i-1) * 0.5 + time) * 8);
            translateCtx.beginPath();
            translateCtx.moveTo(prevX, prevY);
            translateCtx.lineTo(x, y);
            translateCtx.strokeStyle = "rgba(251, 191, 36, 0.4)";
            translateCtx.stroke();
        }
    }

    // 4. Global UI Labels
    translateCtx.fillStyle = "rgba(255,255,255,0.2)";
    translateCtx.font = "9px monospace";
    translateCtx.textAlign = "left";
    translateCtx.fillText("RIBOSOME (80S)", w/2 + 115, h - 160);
    translateCtx.fillText("MESSENGER RNA", 20, h - 70);
    translateCtx.fillText("PEPTIDE CHAIN", w/2 - 100, h - 265);

    if (isTranslating) {
        if (translateProgress < codons.length - 0.1) {
            translateProgress += 0.004; // Slower for detail
        } else {
            isTranslating = false;
        }
    }
    requestAnimationFrame(drawTranslation);
}

document.getElementById('translation-run-btn').addEventListener('click', () => {
    translateProgress = 0;
    isTranslating = true;
});

// --- Section 5: Gene Regulation (Lac Operon) ---
const regCanvas = document.getElementById('regulationCanvas');
const regCtx = regCanvas.getContext('2d');
const regBtn = document.getElementById('regulation-toggle-btn');
let inducerPresent = false;
let regAlpha = 0;

function drawRegulation() {
    const w = regCanvas.width;
    const h = regCanvas.height;
    regCtx.clearRect(0, 0, w, h);
    
    // DNA Line
    regCtx.strokeStyle = "#333";
    regCtx.lineWidth = 4;
    regCtx.beginPath();
    regCtx.moveTo(50, h/2);
    regCtx.lineTo(w - 50, h/2);
    regCtx.stroke();
    
    // Promoter/Gene labels
    regCtx.fillStyle = "#555";
    regCtx.font = "12px monospace";
    regCtx.fillText("PROMOTER", 100, h/2 + 30);
    regCtx.fillText("LACZ GENE", 300, h/2 + 30);
    
    // Repressor (Red block)
    if (!inducerPresent) {
        regCtx.fillStyle = "#ff0055";
        regCtx.fillRect(100, h/2 - 20, 40, 40);
        regAlpha = 0;
    } else {
        // Floating inducer
        regCtx.fillStyle = "#00aaff";
        regCtx.beginPath();
        regCtx.arc(80, h/2, 10, 0, Math.PI * 2);
        regCtx.fill();
        
        // Fade in RNA
        regAlpha = Math.min(regAlpha + 0.01, 1);
        regCtx.strokeStyle = `rgba(168, 85, 247, ${regAlpha})`;
        regCtx.beginPath();
        regCtx.moveTo(150, h/2 - 10);
        regCtx.lineTo(w - 100, h/2 - 10);
        regCtx.stroke();
        regCtx.fillStyle = `rgba(255, 255, 255, ${regAlpha})`;
        regCtx.fillText("RNA PRODUCED", 250, h/2 - 25);
    }
    
    requestAnimationFrame(drawRegulation);
}

regBtn.addEventListener('click', () => {
    inducerPresent = !inducerPresent;
    regBtn.innerText = inducerPresent ? "TURN OFF" : "TURN ON";
});

// Initialize
drawHeroDNA();
drawDnaSection();
updateCodonReader();
drawTranscription();
drawTranslation();
drawRegulation();
