/**
 * Hardware Alchemy: Emulator Visuals
 * Part of the Polymath Series
 */

// --- HERO VISUAL: BINARY FLOW ---
const heroCanvas = document.getElementById('hero-emu-canvas');
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
    heroCtx.fillStyle = '#0a0510';
    heroCtx.fillRect(0, 0, w, h);

    heroCtx.font = '10px monospace';
    const columns = Math.ceil(w / 20);
    const rows = Math.ceil(h / 20);

    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            const opacity = Math.sin(time + i * 0.1 + j * 0.1) * 0.5 + 0.5;
            heroCtx.fillStyle = `rgba(124, 77, 255, ${opacity * 0.15})`;
            const char = Math.random() > 0.5 ? '1' : '0';
            heroCtx.fillText(char, i * 20, j * 20);
        }
    }
    time += 0.02;
    requestAnimationFrame(animateHero);
}
animateHero();

// --- CPU VISUALIZER ---
const cpuCanvas = document.getElementById('cpu-canvas');
const cpuCtx = cpuCanvas.getContext('2d');
const regPC = document.getElementById('reg-pc');
const regA = document.getElementById('reg-a');
const regX = document.getElementById('reg-x');
const regY = document.getElementById('reg-y');

let pc = 0x8000;
let a = 0, x = 0, y = 0;

const ROM = [
    0xA9, 0x10, // LDA #$10
    0x85, 0x20, // STA $20
    0xE8,       // INX
    0x88,       // DEY (wait, 6502 doesn't have DEY in ROM here, but let's just make a mock)
    0xC8,       // INY
    0x4C, 0x00, 0x80 // JMP $8000
];

function updateRegs() {
    regPC.innerText = `0x${pc.toString(16).toUpperCase().padStart(4, '0')}`;
    regA.innerText = `0x${a.toString(16).toUpperCase().padStart(2, '0')}`;
    regX.innerText = `0x${x.toString(16).toUpperCase().padStart(2, '0')}`;
    regY.innerText = `0x${y.toString(16).toUpperCase().padStart(2, '0')}`;
}

function drawCPU() {
    cpuCtx.fillStyle = '#0a0510';
    cpuCtx.fillRect(0, 0, cpuCanvas.width, cpuCanvas.height);

    const centerX = cpuCanvas.width / 2;
    const centerY = cpuCanvas.height / 2;

    // Draw PC Arrow
    cpuCtx.strokeStyle = '#00e5ff';
    cpuCtx.lineWidth = 2;
    cpuCtx.beginPath();
    cpuCtx.moveTo(centerX - 50, centerY);
    cpuCtx.lineTo(centerX + 50, centerY);
    cpuCtx.stroke();

    // Draw Opcode
    cpuCtx.fillStyle = '#f3e5f5';
    cpuCtx.font = 'bold 20px Outfit';
    cpuCtx.textAlign = 'center';
    const opcode = ROM[(pc - 0x8000) % ROM.length] || 0x00;
    cpuCtx.fillText(`FETCH: 0x${opcode.toString(16).toUpperCase()}`, centerX, centerY - 30);

    // Draw status circles
    const colors = ['#7c4dff', '#00e5ff', '#b39ddb'];
    for(let i=0; i<3; i++) {
        cpuCtx.beginPath();
        cpuCtx.arc(centerX + (i-1)*100, centerY + 50, 20, 0, Math.PI*2);
        cpuCtx.strokeStyle = colors[i];
        cpuCtx.stroke();
    }
}

document.getElementById('step-cpu').onclick = () => {
    const opcode = ROM[(pc - 0x8000) % ROM.length];
    pc++;
    if (opcode === 0xA9) { a = ROM[(pc - 0x8000) % ROM.length]; pc++; }
    else if (opcode === 0xE8) { x = (x + 1) & 0xFF; }
    else if (opcode === 0xC8) { y = (y + 1) & 0xFF; }
    else if (opcode === 0x4C) { pc = 0x8000; }
    
    updateRegs();
    drawCPU();
};

document.getElementById('reset-cpu').onclick = () => {
    pc = 0x8000; a = 0; x = 0; y = 0;
    updateRegs();
    drawCPU();
};

updateRegs();
drawCPU();

// --- MEMORY VISUALIZER ---
const memCanvas = document.getElementById('memory-canvas');
const memCtx = memCanvas.getContext('2d');
let memory = new Uint8Array(256);

function drawMemory() {
    const w = memCanvas.width;
    const h = memCanvas.height;
    memCtx.fillStyle = '#080310';
    memCtx.fillRect(0, 0, w, h);

    const cols = 16, rows = 16;
    const cellW = w / cols;
    const cellH = h / rows;

    for (let i = 0; i < 256; i++) {
        const x = (i % cols) * cellW;
        const y = Math.floor(i / rows) * cellH;
        const val = memory[i];
        
        memCtx.fillStyle = `rgba(124, 77, 255, ${val/255})`;
        memCtx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);
        
        if (cellW > 30) {
            memCtx.fillStyle = val > 128 ? '#000' : '#f3e5f5';
            memCtx.font = '10px monospace';
            memCtx.textAlign = 'center';
            memCtx.fillText(val.toString(16).toUpperCase().padStart(2, '0'), x + cellW/2, y + cellH/2 + 4);
        }
    }
}

document.getElementById('random-ram').onclick = () => {
    for(let i=0; i<memory.length; i++) memory[i] = Math.random() * 255;
    drawMemory();
};

document.getElementById('clear-ram').onclick = () => {
    memory.fill(0);
    drawMemory();
};

drawMemory();

// --- PPU SCANLINE VISUALIZER ---
const ppuCanvas = document.getElementById('ppu-canvas');
const ppuCtx = ppuCanvas.getContext('2d');
const scanSpeedInput = document.getElementById('scan-speed');
let scanY = 0;

function drawPPU() {
    const w = ppuCanvas.width;
    const h = ppuCanvas.height;
    const speed = parseInt(scanSpeedInput.value);

    // Dim existing screen
    ppuCtx.fillStyle = 'rgba(8, 3, 16, 0.05)';
    ppuCtx.fillRect(0, 0, w, h);

    // Draw scanline
    ppuCtx.strokeStyle = '#00e5ff';
    ppuCtx.lineWidth = 2;
    ppuCtx.beginPath();
    ppuCtx.moveTo(0, scanY);
    ppuCtx.lineTo(w, scanY);
    ppuCtx.stroke();

    // Draw mock "pixels"
    for(let i=0; i<w; i += 20) {
        if (Math.random() > 0.8) {
            ppuCtx.fillStyle = '#7c4dff';
            ppuCtx.fillRect(i, scanY, 15, 2);
        }
    }

    scanY = (scanY + speed) % h;
    requestAnimationFrame(drawPPU);
}

drawPPU();

// --- ATARI 2600 TIA VISUALIZER ---
(() => {
    // NTSC Palette (128 colours — 16 hues × 8 luminances)
    const NTSC_PALETTE = [
        '#000000','#404040','#6c6c6c','#909090','#b0b0b0','#c8c8c8','#dcdcdc','#ececec',
        '#444400','#646410','#848424','#a0a034','#b8b840','#d0d050','#e8e85c','#fcfc68',
        '#702800','#844414','#985c28','#ac783c','#bc8c4c','#cca05c','#dcb468','#ecc878',
        '#841800','#983418','#ac5030','#c06848','#d0805c','#e09470','#eca880','#fcbc94',
        '#880000','#9c2020','#b03c3c','#c05858','#d07070','#e08888','#eca0a0','#fcb4b4',
        '#78005c','#8c2074','#a03c88','#b0589c','#c070b0','#d084c0','#dc9cd0','#ecb0e0',
        '#480078','#602090','#783ca4','#8c58b8','#a070cc','#b484dc','#c49cec','#d4b0fc',
        '#140098','#302ca8','#4c48b8','#6864c8','#7c80d4','#9098e0','#a4b0ec','#b8c8fc',
        '#000088','#1c209c','#3840b0','#505cc0','#6874d0','#7c8ce0','#90a4ec','#a4b8fc',
        '#00187c','#1c3890','#3854a8','#5070bc','#6888cc','#7c9cdc','#90b4ec','#a4c8fc',
        '#002c5c','#1c4c78','#386890','#5084ac','#689cc0','#7cb4d4','#90cce8','#a4e0fc',
        '#003c2c','#1c5c48','#387c64','#509c80','#68b494','#7cd0ac','#90e4c0','#a4fcd4',
        '#003c00','#205c20','#407c40','#5c9c5c','#74b474','#8cd08c','#a4e4a4','#b8fcb8',
        '#143800','#345c1c','#507c38','#6c9850','#84b468','#9ccc7c','#b4e490','#c8fca4',
        '#2c3000','#4c501c','#687034','#848c4c','#9ca864','#b4c078','#ccd488','#e0ec9c',
        '#442800','#644818','#846830','#a08444','#b89c58','#d0b46c','#e8cc7c','#fce08c'
    ];

    const pfGrid = document.getElementById('tia-pf-grid');
    const tiaCanvas = document.getElementById('tia-canvas');
    const tiaCtx = tiaCanvas.getContext('2d');

    // State
    let pfBits = new Array(20).fill(false);
    let reflectMode = true;
    let colorPF = 38;   // orange-ish
    let colorP0 = 68;   // blue-ish
    let colorBK = 0;    // black
    let playerX = 80;   // player sprite horizontal position (0-159)
    let draggingPlayer = false;

    // Player sprite pattern (simple spaceship)
    const playerPattern = [0,1,1,1,1,1,1,0];

    // --- Build Playfield Grid ---
    const pfRegLabels = [
        'PF0.4','PF0.5','PF0.6','PF0.7',
        'PF1.7','PF1.6','PF1.5','PF1.4','PF1.3','PF1.2','PF1.1','PF1.0',
        'PF2.0','PF2.1','PF2.2','PF2.3','PF2.4','PF2.5','PF2.6','PF2.7'
    ];

    for (let i = 0; i < 20; i++) {
        const cell = document.createElement('div');
        cell.className = 'tia-cell';
        cell.dataset.index = i;

        const label = document.createElement('span');
        label.className = 'bit-label';
        label.textContent = i;
        cell.appendChild(label);

        cell.addEventListener('click', () => {
            pfBits[i] = !pfBits[i];
            cell.classList.toggle('on', pfBits[i]);
            renderTIA();
        });
        pfGrid.appendChild(cell);
    }

    // --- Colour Swatch Logic ---
    function setSwatchColor(id, paletteIndex) {
        document.getElementById(id).style.backgroundColor = NTSC_PALETTE[paletteIndex];
    }
    setSwatchColor('swatch-pf', colorPF);
    setSwatchColor('swatch-p0', colorP0);
    setSwatchColor('swatch-bk', colorBK);

    let activePopup = null;

    function openPalette(swatchId, currentVal, onPick) {
        closePalette();
        const swatch = document.getElementById(swatchId);
        const rect = swatch.getBoundingClientRect();
        const popup = document.createElement('div');
        popup.className = 'ntsc-palette-popup';

        NTSC_PALETTE.forEach((color, idx) => {
            const cell = document.createElement('div');
            cell.className = 'ntsc-cell';
            cell.style.backgroundColor = color;
            if (idx === currentVal) cell.style.borderColor = '#fff';
            cell.addEventListener('click', (e) => {
                e.stopPropagation();
                onPick(idx);
                closePalette();
            });
            popup.appendChild(cell);
        });

        popup.style.position = 'fixed';
        popup.style.left = `${rect.left}px`;
        popup.style.top = `${rect.bottom + 4}px`;
        document.body.appendChild(popup);
        activePopup = popup;

        // Clamp within viewport
        const pRect = popup.getBoundingClientRect();
        if (pRect.right > window.innerWidth) {
            popup.style.left = `${window.innerWidth - pRect.width - 8}px`;
        }
        if (pRect.bottom > window.innerHeight) {
            popup.style.top = `${rect.top - pRect.height - 4}px`;
        }
    }

    function closePalette() {
        if (activePopup) { activePopup.remove(); activePopup = null; }
    }

    document.addEventListener('click', (e) => {
        if (activePopup && !activePopup.contains(e.target) && !e.target.classList.contains('color-swatch')) {
            closePalette();
        }
    });

    document.getElementById('swatch-pf').addEventListener('click', () => {
        openPalette('swatch-pf', colorPF, (idx) => { colorPF = idx; setSwatchColor('swatch-pf', idx); renderTIA(); });
    });
    document.getElementById('swatch-p0').addEventListener('click', () => {
        openPalette('swatch-p0', colorP0, (idx) => { colorP0 = idx; setSwatchColor('swatch-p0', idx); renderTIA(); });
    });
    document.getElementById('swatch-bk').addEventListener('click', () => {
        openPalette('swatch-bk', colorBK, (idx) => { colorBK = idx; setSwatchColor('swatch-bk', idx); renderTIA(); });
    });

    // --- Mode Toggle ---
    const reflectBtn = document.getElementById('tia-reflect-btn');
    const repeatBtn = document.getElementById('tia-repeat-btn');

    reflectBtn.addEventListener('click', () => {
        reflectMode = true;
        reflectBtn.classList.add('active');
        repeatBtn.classList.remove('active');
        renderTIA();
    });
    repeatBtn.addEventListener('click', () => {
        reflectMode = false;
        repeatBtn.classList.add('active');
        reflectBtn.classList.remove('active');
        renderTIA();
    });

    // --- Buttons ---
    document.getElementById('tia-clear').addEventListener('click', () => {
        pfBits.fill(false);
        pfGrid.querySelectorAll('.tia-cell').forEach(c => c.classList.remove('on'));
        renderTIA();
    });

    document.getElementById('tia-preset').addEventListener('click', () => {
        // Classic "mountain" preset
        const preset = [0,0,0,1,0,0,1,1,0,1,1,1,1,1,0,0,1,0,0,0];
        for (let i = 0; i < 20; i++) {
            pfBits[i] = !!preset[i];
        }
        const cells = pfGrid.querySelectorAll('.tia-cell');
        cells.forEach((c, i) => c.classList.toggle('on', pfBits[i]));
        renderTIA();
    });

    // --- Player Sprite Dragging on Canvas ---
    tiaCanvas.addEventListener('mousedown', (e) => {
        const rect = tiaCanvas.getBoundingClientRect();
        const scaleX = tiaCanvas.width / rect.width;
        const mx = (e.clientX - rect.left) * scaleX;
        const px = (playerX / 160) * tiaCanvas.width;
        if (Math.abs(mx - px) < 30) { draggingPlayer = true; }
    });

    tiaCanvas.addEventListener('mousemove', (e) => {
        if (!draggingPlayer) return;
        const rect = tiaCanvas.getBoundingClientRect();
        const scaleX = tiaCanvas.width / rect.width;
        const mx = (e.clientX - rect.left) * scaleX;
        playerX = Math.round((mx / tiaCanvas.width) * 160);
        playerX = Math.max(0, Math.min(152, playerX));
        renderTIA();
    });

    document.addEventListener('mouseup', () => { draggingPlayer = false; });

    // Touch support
    tiaCanvas.addEventListener('touchstart', (e) => {
        const rect = tiaCanvas.getBoundingClientRect();
        const scaleX = tiaCanvas.width / rect.width;
        const mx = (e.touches[0].clientX - rect.left) * scaleX;
        const px = (playerX / 160) * tiaCanvas.width;
        if (Math.abs(mx - px) < 40) { draggingPlayer = true; e.preventDefault(); }
    }, { passive: false });

    tiaCanvas.addEventListener('touchmove', (e) => {
        if (!draggingPlayer) return;
        e.preventDefault();
        const rect = tiaCanvas.getBoundingClientRect();
        const scaleX = tiaCanvas.width / rect.width;
        const mx = (e.touches[0].clientX - rect.left) * scaleX;
        playerX = Math.round((mx / tiaCanvas.width) * 160);
        playerX = Math.max(0, Math.min(152, playerX));
        renderTIA();
    }, { passive: false });

    document.addEventListener('touchend', () => { draggingPlayer = false; });

    // --- TIA Render ---
    function buildScanline() {
        const line = new Array(160).fill(0); // 0 = BK

        // Left half: PF bits 0-19, each bit covers 4 TIA pixels
        for (let i = 0; i < 20; i++) {
            if (pfBits[i]) {
                for (let p = 0; p < 4; p++) {
                    line[i * 4 + p] = 1; // 1 = PF
                }
            }
        }

        // Right half: reflect or repeat
        if (reflectMode) {
            for (let i = 0; i < 20; i++) {
                const srcBit = pfBits[19 - i];
                if (srcBit) {
                    for (let p = 0; p < 4; p++) {
                        line[80 + i * 4 + p] = 1;
                    }
                }
            }
        } else {
            for (let i = 0; i < 20; i++) {
                if (pfBits[i]) {
                    for (let p = 0; p < 4; p++) {
                        line[80 + i * 4 + p] = 1;
                    }
                }
            }
        }

        // Player sprite
        for (let i = 0; i < 8; i++) {
            if (playerPattern[i] && (playerX + i) < 160) {
                line[playerX + i] = 2; // 2 = P0
            }
        }

        return line;
    }

    let animScanY = 0;

    function renderTIA() {
        const w = tiaCanvas.width;
        const h = tiaCanvas.height;
        const scanline = buildScanline();
        const pixW = w / 160;

        // Background
        tiaCtx.fillStyle = NTSC_PALETTE[colorBK];
        tiaCtx.fillRect(0, 0, w, h);

        const totalScanlines = 192; // NTSC visible scanlines
        const scanH = h / totalScanlines;

        // Draw scanlines
        for (let sy = 0; sy < totalScanlines; sy++) {
            const y = sy * scanH;
            for (let px = 0; px < 160; px++) {
                const val = scanline[px];
                let color;
                if (val === 1) color = NTSC_PALETTE[colorPF];
                else if (val === 2) color = NTSC_PALETTE[colorP0];
                else color = NTSC_PALETTE[colorBK];
                tiaCtx.fillStyle = color;
                tiaCtx.fillRect(px * pixW, y, pixW + 0.5, scanH + 0.5);
            }
        }

        // CRT scanline overlay
        tiaCtx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        for (let sy = 0; sy < h; sy += 3) {
            tiaCtx.fillRect(0, sy, w, 1);
        }

        // Phosphor glow on animated beam
        tiaCtx.fillStyle = 'rgba(0, 229, 255, 0.06)';
        tiaCtx.fillRect(0, animScanY, w, 3);

        // Player position indicator
        const indicatorX = (playerX / 160) * w;
        tiaCtx.strokeStyle = NTSC_PALETTE[colorP0];
        tiaCtx.lineWidth = 1;
        tiaCtx.setLineDash([4, 4]);
        tiaCtx.beginPath();
        tiaCtx.moveTo(indicatorX, 0);
        tiaCtx.lineTo(indicatorX, h);
        tiaCtx.stroke();
        tiaCtx.setLineDash([]);

        // Label
        tiaCtx.fillStyle = 'rgba(255,255,255,0.6)';
        tiaCtx.font = '10px monospace';
        tiaCtx.fillText(`P0 @ ${playerX}`, indicatorX + 4, 12);
    }

    // Animate beam
    function animateBeam() {
        const h = tiaCanvas.height;
        animScanY = (animScanY + 1.5) % h;
        renderTIA();
        requestAnimationFrame(animateBeam);
    }

    renderTIA();
    animateBeam();
})();
