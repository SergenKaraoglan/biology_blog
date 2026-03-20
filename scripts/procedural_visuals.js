/**
 * Procedural Generation Visuals
 * Part of the Polymath Series
 */

// --- UTILS: Simple Perlin Noise ---
const Perlin = (function() {
    const p = new Uint8Array(512);
    const permutation = new Uint8Array([151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180]);
    for (let i=0; i < 256; i++) p[256+i] = p[i] = permutation[i];

    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function lerp(t, a, b) { return a + t * (b - a); }
    function grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    return {
        noise2D: function(x, y) {
            const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
            x -= Math.floor(x); y -= Math.floor(y);
            const u = fade(x), v = fade(y);
            const A = p[X]+Y, AA = p[A], AB = p[A+1], B = p[X+1]+Y, BA = p[B], BB = p[B+1];
            return lerp(v, lerp(u, grad(p[AA], x, y, 0), grad(p[BA], x-1, y, 0)),
                           lerp(u, grad(p[AB], x, y-1, 0), grad(p[BB], x-1, y-1, 0)));
        }
    };
})();

// --- HERO VISUAL: FLOWING NOISE ---
const heroCanvas = document.getElementById('hero-noise-canvas');
const heroCtx = heroCanvas.getContext('2d');
let time = 0;

function resizeHero() {
    heroCanvas.width = window.innerWidth;
    heroCanvas.height = 400;
}

window.addEventListener('resize', resizeHero);
resizeHero();

function animateHero() {
    const w = heroCanvas.width;
    const h = heroCanvas.height;
    heroCtx.fillStyle = '#0a110d';
    heroCtx.fillRect(0, 0, w, h);

    const step = 8;
    for (let x = 0; x < w; x += step) {
        for (let y = 0; y < h; y += step) {
            const val = Perlin.noise2D(x * 0.005, y * 0.005 + time);
            const alpha = (val + 1) / 2;
            heroCtx.fillStyle = `rgba(0, 230, 118, ${alpha * 0.2})`;
            heroCtx.fillRect(x, y, step, step);
        }
    }
    time += 0.005;
    requestAnimationFrame(animateHero);
}
animateHero();

// --- NOISE VISUALIZER ---
const noiseCanvas = document.getElementById('noise-canvas');
const noiseCtx = noiseCanvas.getContext('2d');
const scaleInput = document.getElementById('noise-scale');
const octavesInput = document.getElementById('noise-octaves');
const persistenceInput = document.getElementById('noise-persistence');

function drawNoise() {
    const w = noiseCanvas.width;
    const h = noiseCanvas.height;
    const imgData = noiseCtx.createImageData(w, h);
    const scale = parseFloat(scaleInput.value);
    const octaves = parseInt(octavesInput.value);
    const persistence = parseFloat(persistenceInput.value);

    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            let total = 0;
            let frequency = 1 / scale;
            let amplitude = 1;
            let maxValue = 0;
            for (let i = 0; i < octaves; i++) {
                total += Perlin.noise2D(x * frequency, y * frequency) * amplitude;
                maxValue += amplitude;
                amplitude *= persistence;
                frequency *= 2;
            }
            const val = (total / maxValue + 1) / 2;
            const idx = (x + y * w) * 4;
            // Emerald green palette
            imgData.data[idx] = 0;
            imgData.data[idx + 1] = val * 230;
            imgData.data[idx + 2] = val * 118;
            imgData.data[idx + 3] = 255;
        }
    }
    noiseCtx.putImageData(imgData, 0, 0);
}

[scaleInput, octavesInput, persistenceInput].forEach(el => el.oninput = drawNoise);
drawNoise();

// --- CAVE GENERATOR (CELLULAR AUTOMATA) ---
const caveCanvas = document.getElementById('cave-canvas');
const caveCtx = caveCanvas.getContext('2d');
const cols = 60, rows = 40;
const cellSize = 10;
let grid = [];

function initCave() {
    grid = [];
    for (let y = 0; y < rows; y++) {
        grid[y] = [];
        for (let x = 0; x < cols; x++) {
            grid[y][x] = Math.random() < 0.45 ? 1 : 0;
        }
    }
    drawCave();
}

function drawCave() {
    caveCtx.fillStyle = '#14231c';
    caveCtx.fillRect(0, 0, caveCanvas.width, caveCanvas.height);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (grid[y][x] === 1) {
                caveCtx.fillStyle = '#00e676';
                caveCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
}

function iterateCave() {
    const newGrid = [];
    for (let y = 0; y < rows; y++) {
        newGrid[y] = [];
        for (let x = 0; x < cols; x++) {
            let neighbors = 0;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    const ny = y + i, nx = x + j;
                    if (ny < 0 || ny >= rows || nx < 0 || nx >= cols) {
                        neighbors++;
                    } else if (grid[ny][nx] === 1) {
                        neighbors++;
                    }
                }
            }
            if (neighbors > 4) newGrid[y][x] = 1;
            else if (neighbors < 4) newGrid[y][x] = 0;
            else newGrid[y][x] = grid[y][x];
        }
    }
    grid = newGrid;
    drawCave();
}

document.getElementById('reset-cave').onclick = initCave;
document.getElementById('step-cave').onclick = iterateCave;
document.getElementById('auto-cave').onclick = () => {
    for (let i = 0; i < 5; i++) iterateCave();
};

initCave();

// --- L-SYSTEM TREE ---
const treeCanvas = document.getElementById('tree-canvas');
const treeCtx = treeCanvas.getContext('2d');
const depthInput = document.getElementById('tree-depth');
const angleInput = document.getElementById('tree-angle');

function drawTree() {
    treeCtx.clearRect(0, 0, treeCanvas.width, treeCanvas.height);
    const depth = parseInt(depthInput.value);
    const angle = parseFloat(angleInput.value) * Math.PI / 180;
    
    function branch(len, d) {
        treeCtx.beginPath();
        treeCtx.moveTo(0, 0);
        treeCtx.lineTo(0, -len);
        treeCtx.strokeStyle = `rgba(29, 233, 182, ${0.4 + (d/depth) * 0.6})`;
        treeCtx.lineWidth = d;
        treeCtx.stroke();
        
        treeCtx.translate(0, -len);
        if (d > 0) {
            treeCtx.save();
            treeCtx.rotate(angle);
            branch(len * 0.75, d - 1);
            treeCtx.restore();
            
            treeCtx.save();
            treeCtx.rotate(-angle);
            branch(len * 0.75, d - 1);
            treeCtx.restore();
        }
    }

    treeCtx.save();
    treeCtx.translate(treeCanvas.width / 2, treeCanvas.height);
    branch(100, depth);
    treeCtx.restore();
}

[depthInput, angleInput].forEach(el => el.oninput = drawTree);
document.getElementById('regenerate-tree').onclick = drawTree;
drawTree();

// --- WAVE FUNCTION COLLAPSE ---
const wfcCanvas = document.getElementById('wfc-canvas');
const wfcCtx = wfcCanvas.getContext('2d');
const wfcCols = 15, wfcRows = 10;
const wfcCellSize = 40;

const TILES = {
    WATER: { id: 0, color: '#00695c', name: 'Water', neighbors: [0, 1] }, // Water joins Water or Coast
    COAST: { id: 1, color: '#4db6ac', name: 'Coast', neighbors: [0, 1, 2] }, // Coast joins Water, Coast, or Grass
    GRASS: { id: 2, color: '#2e7d32', name: 'Grass', neighbors: [1, 2, 3] }, // Grass joins Coast, Grass, or Road
    ROAD:  { id: 3, color: '#546e7a', name: 'Road',  neighbors: [2, 3] }    // Road joins Grass or Road
};

let wfcGrid = [];

function initWFC() {
    wfcGrid = [];
    for (let y = 0; y < wfcRows; y++) {
        wfcGrid[y] = [];
        for (let x = 0; x < wfcCols; x++) {
            wfcGrid[y][x] = {
                collapsed: false,
                options: [0, 1, 2, 3] // All possibilities
            };
        }
    }
    drawWFC();
}

function drawWFC() {
    wfcCtx.clearRect(0, 0, wfcCanvas.width, wfcCanvas.height);
    for (let y = 0; y < wfcRows; y++) {
        for (let x = 0; x < wfcCols; x++) {
            const cell = wfcGrid[y][x];
            const px = x * wfcCellSize + (wfcCanvas.width - wfcCols * wfcCellSize) / 2;
            const py = y * wfcCellSize + (wfcCanvas.height - wfcRows * wfcCellSize) / 2;

            if (cell.collapsed) {
                const tileId = cell.options[0];
                const tile = Object.values(TILES).find(t => t.id === tileId);
                wfcCtx.fillStyle = tile.color;
                wfcCtx.fillRect(px, py, wfcCellSize, wfcCellSize);
            } else {
                // Show superposition (entropy)
                wfcCtx.strokeStyle = '#263238';
                wfcCtx.strokeRect(px, py, wfcCellSize, wfcCellSize);
                wfcCtx.fillStyle = '#14231c';
                wfcCtx.fillRect(px + 2, py + 2, wfcCellSize - 4, wfcCellSize - 4);
                
                // Entropy indicator (dots)
                wfcCtx.fillStyle = '#444';
                cell.options.forEach((opt, i) => {
                    const dx = (i % 2) * 10 + 10;
                    const dy = Math.floor(i / 2) * 10 + 10;
                    wfcCtx.beginPath();
                    wfcCtx.arc(px + dx, py + dy, 2, 0, Math.PI * 2);
                    wfcCtx.fill();
                });
            }
        }
    }
}

function getEntropy() {
    let minEntropy = Infinity;
    let candidates = [];
    for (let y = 0; y < wfcRows; y++) {
        for (let x = 0; x < wfcCols; x++) {
            const cell = wfcGrid[y][x];
            if (!cell.collapsed) {
                const entropy = cell.options.length;
                if (entropy < minEntropy) {
                    minEntropy = entropy;
                    candidates = [{x, y}];
                } else if (entropy === minEntropy) {
                    candidates.push({x, y});
                }
            }
        }
    }
    return candidates;
}

function propagate(x, y) {
    const stack = [{x, y}];
    while(stack.length > 0) {
        const current = stack.pop();
        const cell = wfcGrid[current.y][current.x];
        const neighbors = [
            {x: current.x, y: current.y - 1},
            {x: current.x, y: current.y + 1},
            {x: current.x - 1, y: current.y},
            {x: current.x + 1, y: current.y}
        ];

        for (const n of neighbors) {
            if (n.x >= 0 && n.x < wfcCols && n.y >= 0 && n.y < wfcRows) {
                const neighborCell = wfcGrid[n.y][n.x];
                if (!neighborCell.collapsed) {
                    // Possible tile IDs the current cell could have
                    const allowedInNeighbor = new Set();
                    cell.options.forEach(optId => {
                        const tile = Object.values(TILES).find(t => t.id === optId);
                        tile.neighbors.forEach(nId => allowedInNeighbor.add(nId));
                    });

                    // Filter neighbor options
                    const prevLength = neighborCell.options.length;
                    neighborCell.options = neighborCell.options.filter(optId => allowedInNeighbor.has(optId));
                    
                    if (neighborCell.options.length < prevLength) {
                        stack.push(n);
                    }
                }
            }
        }
    }
}

function stepWFC() {
    const candidates = getEntropy();
    if (candidates.length === 0) return true; // Done

    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    const cell = wfcGrid[choice.y][choice.x];
    const pick = cell.options[Math.floor(Math.random() * cell.options.length)];
    cell.options = [pick];
    cell.collapsed = true;

    propagate(choice.x, choice.y);
    drawWFC();
    return false;
}

document.getElementById('reset-wfc').onclick = initWFC;
document.getElementById('step-wfc').onclick = stepWFC;
document.getElementById('auto-wfc').onclick = () => {
    let done = false;
    while (!done) {
        done = stepWFC();
    }
};

initWFC();

// --- BINARY SPACE PARTITIONING (BSP) ---
const bspCanvas = document.getElementById('bsp-canvas');
const bspCtx = bspCanvas.getContext('2d');

class BSPNode {
    constructor(x, y, w, h) {
        this.x = x; this.y = y; this.w = w; this.h = h;
        this.left = null; this.right = null;
        this.room = null;
    }

    split() {
        if (this.left || this.right) return false;

        const minSize = 60;
        let splitH = Math.random() > 0.5;

        // Force split direction if one dimension is too small
        if (this.w > this.h && this.w / this.h >= 1.25) splitH = false;
        else if (this.h > this.w && this.h / this.w >= 1.25) splitH = true;

        const max = (splitH ? this.h : this.w) - minSize;
        if (max <= minSize) return false;

        const splitAt = Math.floor(Math.random() * (max - minSize)) + minSize;

        if (splitH) {
            this.left = new BSPNode(this.x, this.y, this.w, splitAt);
            this.right = new BSPNode(this.x, this.y + splitAt, this.w, this.h - splitAt);
        } else {
            this.left = new BSPNode(this.x, this.y, splitAt, this.h);
            this.right = new BSPNode(this.x + splitAt, this.y, this.w - splitAt, this.h);
        }
        return true;
    }

    createRooms() {
        if (this.left || this.right) {
            this.room = null; // Clear room if it's no longer a leaf
            if (this.left) this.left.createRooms();
            if (this.right) this.right.createRooms();
        } else {
            if (this.room) return; // Don't recreate if already exists
            // Room size: 40-80% of node size, at least 20px
            const rw = Math.max(20, Math.floor(this.w * (0.4 + Math.random() * 0.4)));
            const rh = Math.max(20, Math.floor(this.h * (0.4 + Math.random() * 0.4)));
            // Room position: centered-ish with padding
            const rx = Math.floor((this.w - rw) / 2);
            const ry = Math.floor((this.h - rh) / 2);
            this.room = { x: this.x + rx, y: this.y + ry, w: rw, h: rh };
        }
    }

    getRoom() {
        if (this.room) return this.room;
        let leftRoom = this.left ? this.left.getRoom() : null;
        let rightRoom = this.right ? this.right.getRoom() : null;
        if (!leftRoom && !rightRoom) return null;
        if (!leftRoom) return rightRoom;
        if (!rightRoom) return leftRoom;
        return Math.random() > 0.5 ? leftRoom : rightRoom;
    }
}

let rootNode = null;

function initBSP() {
    rootNode = new BSPNode(10, 10, bspCanvas.width - 20, bspCanvas.height - 20);
    drawBSP();
}

function drawBSP() {
    bspCtx.fillStyle = '#0a110d';
    bspCtx.fillRect(0, 0, bspCanvas.width, bspCanvas.height);
    
    function drawNode(node) {
        // Draw partitioning boundaries (very faint)
        bspCtx.strokeStyle = 'rgba(0, 230, 118, 0.05)';
        bspCtx.strokeRect(node.x, node.y, node.w, node.h);
        
        if (node.left) drawNode(node.left);
        if (node.right) drawNode(node.right);
        
        if (node.room) {
            // Room shadow
            bspCtx.fillStyle = 'rgba(0,0,0,0.3)';
            bspCtx.fillRect(node.room.x + 2, node.room.y + 2, node.room.w, node.room.h);
            // Room
            bspCtx.fillStyle = '#1de9b6';
            bspCtx.fillRect(node.room.x, node.room.y, node.room.w, node.room.h);
            // Room inner glow
            bspCtx.strokeStyle = 'rgba(255,255,255,0.1)';
            bspCtx.strokeRect(node.room.x + 1, node.room.y + 1, node.room.w - 2, node.room.h - 2);
        }
    }
    
    function drawCorridors(node) {
        if (node.left && node.right) {
            const r1 = node.left.getRoom();
            const r2 = node.right.getRoom();
            
            if (r1 && r2) {
                const p1 = { x: r1.x + r1.w/2, y: r1.y + r1.w/2 };
                const p2 = { x: r2.x + r2.w/2, y: r2.y + r2.h/2 };
                
                bspCtx.beginPath();
                bspCtx.moveTo(p1.x, p1.y);
                bspCtx.lineTo(p2.x, p2.y);
                bspCtx.strokeStyle = 'rgba(29, 233, 182, 0.6)';
                bspCtx.lineWidth = 6;
                bspCtx.stroke();
            }
            drawCorridors(node.left);
            drawCorridors(node.right);
        }
    }
    
    if (rootNode) {
        drawCorridors(rootNode);
        drawNode(rootNode);
    }
}

function stepBSP() {
    function splitAllLeaves(node) {
        if (!node.left && !node.right) {
            return node.split();
        } else {
            const s1 = splitAllLeaves(node.left);
            const s2 = splitAllLeaves(node.right);
            return s1 || s2;
        }
    }
    splitAllLeaves(rootNode);
    rootNode.createRooms();
    drawBSP();
}

document.getElementById('reset-bsp').onclick = initBSP;
document.getElementById('step-bsp').onclick = stepBSP;
document.getElementById('auto-bsp').onclick = () => {
    initBSP();
    for (let i = 0; i < 6; i++) {
        stepBSP();
    }
};

initBSP();
