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
