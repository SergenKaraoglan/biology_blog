/**
 * Game Boy Hardware — Interactive Visuals
 * Part of the Polymath Series
 */

// =====================================================================
// HERO VISUAL: Dot-Matrix Pixel Grid
// =====================================================================
(() => {
    const canvas = document.getElementById('hero-gb-canvas');
    const ctx = canvas.getContext('2d');
    let t = 0;

    // DMG palette
    const GB_PALETTE = ['#9bbc0f', '#8bac0f', '#306230', '#0f380f'];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = 400;
    }
    window.addEventListener('resize', resize);
    resize();

    const dots = [];
    const spacing = 16;

    function initDots() {
        dots.length = 0;
        const cols = Math.ceil(canvas.width / spacing) + 1;
        const rows = Math.ceil(canvas.height / spacing) + 1;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                dots.push({
                    baseX: c * spacing,
                    baseY: r * spacing,
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.3 + Math.random() * 0.5
                });
            }
        }
    }
    initDots();
    window.addEventListener('resize', initDots);

    function animate() {
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#060e06';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2, cy = h / 2;
        const maxDist = Math.sqrt(cx * cx + cy * cy);

        dots.forEach(d => {
            const dx = d.baseX - cx;
            const dy = d.baseY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const wave = Math.sin(t * d.speed + d.phase + dist * 0.02);
            const normDist = dist / maxDist;

            // Choose palette colour based on wave position
            const idx = Math.floor((wave + 1) * 1.99);
            const color = GB_PALETTE[idx];

            const size = 2 + wave * 1.5;
            const alpha = 0.3 + (1 - normDist) * 0.5 + wave * 0.2;

            ctx.globalAlpha = Math.max(0.05, Math.min(1, alpha));
            ctx.fillStyle = color;
            ctx.fillRect(d.baseX - size / 2, d.baseY - size / 2, size, size);
        });

        ctx.globalAlpha = 1;
        t += 0.015;
        requestAnimationFrame(animate);
    }
    animate();
})();

// =====================================================================
// 1. CPU INSTRUCTION STEPPER
// =====================================================================
(() => {
    const canvas = document.getElementById('cpu-canvas');
    const ctx = canvas.getContext('2d');

    // Register state — post-boot ROM values (DMG)
    let regs = {
        A: 0x01, F: 0xB0, B: 0x00, C: 0x13,
        D: 0x00, E: 0xD8, H: 0x01, L: 0x4D,
        SP: 0xFFFE, PC: 0x0100
    };
    let totalCycles = 0;
    let instrIndex = 0;
    let running = false;
    let animId = null;
    let executionLog = []; // {instr, pc, cycles}

    // Simulated program: a simple loop that sums values
    const PROGRAM = [
        { asm: 'LD A, 0x00',       op: () => { regs.A = 0x00; regs.F = (regs.A === 0 ? 0x80 : 0); }, cycles: 8 },
        { asm: 'LD B, 0x05',       op: () => { regs.B = 0x05; }, cycles: 8 },
        { asm: 'LD C, 0x03',       op: () => { regs.C = 0x03; }, cycles: 8 },
        { asm: 'LD D, 0x00',       op: () => { regs.D = 0x00; }, cycles: 8 },
        { asm: 'ADD A, B',         op: () => { const r = regs.A + regs.B; regs.F = ((r & 0xFF) === 0 ? 0x80 : 0) | ((regs.A & 0xF) + (regs.B & 0xF) > 0xF ? 0x20 : 0) | (r > 0xFF ? 0x10 : 0); regs.A = r & 0xFF; }, cycles: 4 },
        { asm: 'ADD A, C',         op: () => { const r = regs.A + regs.C; regs.F = ((r & 0xFF) === 0 ? 0x80 : 0) | ((regs.A & 0xF) + (regs.C & 0xF) > 0xF ? 0x20 : 0) | (r > 0xFF ? 0x10 : 0); regs.A = r & 0xFF; }, cycles: 4 },
        { asm: 'LD D, A',          op: () => { regs.D = regs.A; }, cycles: 4 },
        { asm: 'SUB B',            op: () => { const r = regs.A - regs.B; regs.F = ((r & 0xFF) === 0 ? 0x80 : 0) | 0x40 | ((regs.A & 0xF) < (regs.B & 0xF) ? 0x20 : 0) | (r < 0 ? 0x10 : 0); regs.A = r & 0xFF; }, cycles: 4 },
        { asm: 'CP 0x00',          op: () => { const r = regs.A - 0x00; regs.F = ((r & 0xFF) === 0 ? 0x80 : 0) | 0x40 | ((regs.A & 0xF) < 0 ? 0x20 : 0) | (r < 0 ? 0x10 : 0); }, cycles: 8 },
        { asm: 'PUSH DE',          op: () => { regs.SP = (regs.SP - 2) & 0xFFFF; }, cycles: 16 },
        { asm: 'POP DE',           op: () => { regs.SP = (regs.SP + 2) & 0xFFFF; }, cycles: 12 },
        { asm: 'SWAP A',           op: () => { regs.A = ((regs.A & 0x0F) << 4) | ((regs.A >> 4) & 0x0F); regs.F = regs.A === 0 ? 0x80 : 0; }, cycles: 8 },
        { asm: 'XOR A',            op: () => { regs.A = 0; regs.F = 0x80; }, cycles: 4 },
        { asm: 'INC B',            op: () => { regs.B = (regs.B + 1) & 0xFF; regs.F = (regs.F & 0x10) | (regs.B === 0 ? 0x80 : 0) | ((regs.B & 0xF) === 0 ? 0x20 : 0); }, cycles: 4 },
        { asm: 'DEC C',            op: () => { regs.C = (regs.C - 1) & 0xFF; regs.F = (regs.F & 0x10) | 0x40 | (regs.C === 0 ? 0x80 : 0) | ((regs.C & 0xF) === 0xF ? 0x20 : 0); }, cycles: 4 },
        { asm: 'LD HL, 0xC000',    op: () => { regs.H = 0xC0; regs.L = 0x00; }, cycles: 12 },
        { asm: 'LD [HL], D',       op: () => { /* write D to (HL) - simulated */ }, cycles: 8 },
        { asm: 'NOP',              op: () => { }, cycles: 4 },
    ];

    function hex8(v) { return '0x' + (v & 0xFF).toString(16).toUpperCase().padStart(2, '0'); }
    function hex16(v) { return '0x' + (v & 0xFFFF).toString(16).toUpperCase().padStart(4, '0'); }

    function flagStr() {
        const f = regs.F;
        return (f & 0x80 ? 'Z' : '-') + (f & 0x40 ? 'N' : '-') + (f & 0x20 ? 'H' : '-') + (f & 0x10 ? 'C' : '-');
    }

    function updateUI() {
        document.getElementById('reg-a').textContent = hex8(regs.A);
        document.getElementById('reg-f').textContent = hex8(regs.F);
        document.getElementById('reg-b').textContent = hex8(regs.B);
        document.getElementById('reg-c').textContent = hex8(regs.C);
        document.getElementById('reg-d').textContent = hex8(regs.D);
        document.getElementById('reg-e').textContent = hex8(regs.E);
        document.getElementById('reg-h').textContent = hex8(regs.H);
        document.getElementById('reg-l').textContent = hex8(regs.L);
        document.getElementById('reg-sp').textContent = hex16(regs.SP);
        document.getElementById('reg-pc').textContent = hex16(regs.PC);
        document.getElementById('reg-flags').textContent = flagStr();
        document.getElementById('reg-cycle').textContent = totalCycles;
    }

    function stepInstruction() {
        if (instrIndex >= PROGRAM.length) return;
        const instr = PROGRAM[instrIndex];
        const prevPC = regs.PC;
        instr.op();
        regs.PC = (regs.PC + (instr.cycles >= 12 ? 3 : instr.cycles >= 8 ? 2 : 1)) & 0xFFFF;
        totalCycles += instr.cycles;
        executionLog.push({ instr: instr.asm, pc: prevPC, cycles: instr.cycles });
        if (executionLog.length > 12) executionLog.shift();
        instrIndex++;
        updateUI();
        draw();
    }

    function draw() {
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#030803';
        ctx.fillRect(0, 0, w, h);

        // Draw execution log
        const logX = 30;
        const logY = 30;
        const lineH = 22;

        ctx.font = 'bold 11px Outfit';
        ctx.fillStyle = '#7a9b6a';
        ctx.textAlign = 'left';
        ctx.fillText('EXECUTION LOG', logX, logY - 8);

        executionLog.forEach((entry, i) => {
            const y = logY + i * lineH + 10;
            const isLast = i === executionLog.length - 1;

            // Highlight current
            if (isLast) {
                ctx.fillStyle = '#9bbc0f15';
                ctx.fillRect(logX - 5, y - 14, w - 50, lineH);
                ctx.strokeStyle = '#9bbc0f40';
                ctx.lineWidth = 1;
                ctx.strokeRect(logX - 5, y - 14, w - 50, lineH);
            }

            // PC
            ctx.fillStyle = isLast ? '#9bbc0f' : '#306230';
            ctx.font = '11px Courier New';
            ctx.textAlign = 'left';
            ctx.fillText(hex16(entry.pc), logX, y);

            // Instruction
            ctx.fillStyle = isLast ? '#d8e8d0' : '#7a9b6a';
            ctx.font = isLast ? 'bold 12px Courier New' : '11px Courier New';
            ctx.fillText(entry.instr, logX + 80, y);

            // Cycles
            ctx.fillStyle = isLast ? '#ff6b35' : '#7a9b6a60';
            ctx.font = '10px Courier New';
            ctx.textAlign = 'right';
            ctx.fillText(`${entry.cycles}T`, w - 35, y);
        });

        // Fetch-Decode-Execute state machine (right side)
        const fdex = w - 220;
        const fdey = 30;
        const stages = ['FETCH', 'DECODE', 'EXECUTE'];
        const stageColors = ['#9bbc0f', '#8bac0f', '#ff6b35'];
        const activeStage = instrIndex > 0 ? 2 : -1; // show last completed

        ctx.font = 'bold 10px Outfit';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#7a9b6a';
        ctx.fillText('SM83 CYCLE', fdex + 80, fdey - 8);

        stages.forEach((s, i) => {
            const bx = fdex;
            const by = fdey + i * 35 + 10;
            const bw = 160;
            const bh = 28;

            const active = (activeStage >= i);
            ctx.fillStyle = active ? stageColors[i] + '25' : '#1a301910';
            ctx.fillRect(bx, by, bw, bh);
            ctx.strokeStyle = active ? stageColors[i] : '#1a3019';
            ctx.lineWidth = 1;
            ctx.strokeRect(bx, by, bw, bh);

            ctx.fillStyle = active ? stageColors[i] : '#30623060';
            ctx.font = 'bold 11px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText(s, bx + bw / 2, by + bh / 2 + 4);

            // Arrow between stages
            if (i < 2) {
                ctx.strokeStyle = active ? stageColors[i] + '60' : '#1a301930';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(bx + bw / 2, by + bh);
                ctx.lineTo(bx + bw / 2, by + bh + 7);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(bx + bw / 2 - 4, by + bh + 3);
                ctx.lineTo(bx + bw / 2, by + bh + 7);
                ctx.lineTo(bx + bw / 2 + 4, by + bh + 3);
                ctx.fill();
            }
        });

        // Info
        ctx.fillStyle = '#7a9b6a';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Instructions: ${instrIndex}/${PROGRAM.length}  |  Total: ${totalCycles}T (${totalCycles / 4}M)`, 30, h - 12);
    }

    function reset() {
        regs = { A: 0x01, F: 0xB0, B: 0x00, C: 0x13, D: 0x00, E: 0xD8, H: 0x01, L: 0x4D, SP: 0xFFFE, PC: 0x0100 };
        totalCycles = 0;
        instrIndex = 0;
        executionLog = [];
        if (animId) { cancelAnimationFrame(animId); animId = null; running = false; }
        updateUI();
        draw();
    }

    function autoRun() {
        if (running) { cancelAnimationFrame(animId); animId = null; running = false; return; }
        running = true;
        let last = 0;
        function tick(ts) {
            if (ts - last > 350) {
                last = ts;
                if (instrIndex < PROGRAM.length) stepInstruction();
                else { running = false; return; }
            }
            animId = requestAnimationFrame(tick);
        }
        animId = requestAnimationFrame(tick);
    }

    document.getElementById('cpu-step').onclick = stepInstruction;
    document.getElementById('cpu-run').onclick = autoRun;
    document.getElementById('cpu-reset').onclick = reset;

    updateUI();
    draw();
})();

// =====================================================================
// 2. MEMORY MAP EXPLORER
// =====================================================================
(() => {
    const canvas = document.getElementById('memmap-canvas');
    const ctx = canvas.getContext('2d');
    const legendEl = document.getElementById('memmap-legend');

    const REGIONS = [
        { name: 'ROM Bank 0',    start: 0x0000, end: 0x3FFF, color: '#9bbc0f', size: '16 KB' },
        { name: 'ROM Bank N',    start: 0x4000, end: 0x7FFF, color: '#8bac0f', size: '16 KB (switchable)' },
        { name: 'VRAM',          start: 0x8000, end: 0x9FFF, color: '#ff6b35', size: '8 KB' },
        { name: 'External RAM',  start: 0xA000, end: 0xBFFF, color: '#c040ff', size: '8 KB (cartridge)' },
        { name: 'Work RAM',      start: 0xC000, end: 0xDFFF, color: '#40c8ff', size: '8 KB' },
        { name: 'Echo RAM',      start: 0xE000, end: 0xFDFF, color: '#40c8ff50', size: 'Mirror of WRAM' },
        { name: 'OAM',           start: 0xFE00, end: 0xFE9F, color: '#ff4060', size: '160 bytes' },
        { name: 'I/O Registers', start: 0xFF00, end: 0xFF7F, color: '#ffa040', size: '128 bytes' },
        { name: 'HRAM',          start: 0xFF80, end: 0xFFFE, color: '#ffcc00', size: '127 bytes' },
        { name: 'IE Register',   start: 0xFFFF, end: 0xFFFF, color: '#ff0080', size: '1 byte' },
    ];

    let busActivity = [];

    // Build legend
    REGIONS.forEach(r => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        const swatch = document.createElement('span');
        swatch.className = 'legend-swatch';
        swatch.style.backgroundColor = r.color;
        const label = document.createTextNode(`${r.name} (${r.size})`);
        item.appendChild(swatch);
        item.appendChild(label);
        legendEl.appendChild(item);
    });

    function draw() {
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#030803';
        ctx.fillRect(0, 0, w, h);

        const barH = 30;
        const gap = 6;
        const startY = 20;
        const totalAddr = 0x10000;

        ctx.font = 'bold 10px Outfit';
        ctx.textAlign = 'left';

        REGIONS.forEach((r, i) => {
            const y = startY + i * (barH + gap);
            const regionSize = r.end - r.start + 1;
            const barW = Math.max(40, (regionSize / totalAddr) * (w - 200));

            // Background bar (full width)
            ctx.fillStyle = r.color + '08';
            ctx.fillRect(30, y, w - 60, barH);
            ctx.strokeStyle = r.color + '30';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(30, y, w - 60, barH);

            // Proportional fill
            ctx.fillStyle = r.color + '35';
            ctx.fillRect(30, y, barW, barH);

            // Labels
            ctx.fillStyle = r.color;
            ctx.font = 'bold 10px Outfit';
            ctx.textAlign = 'left';
            ctx.fillText(r.name, 40, y + 13);

            ctx.fillStyle = '#7a9b6a';
            ctx.font = '9px Courier New';
            ctx.fillText(`${r.start.toString(16).toUpperCase().padStart(4, '0')}–${r.end.toString(16).toUpperCase().padStart(4, '0')}  |  ${r.size}`, 40, y + 25);

            // Bus activity flash
            busActivity.forEach(act => {
                if (act.regionIdx === i && act.age < 30) {
                    const alpha = 1 - act.age / 30;
                    ctx.fillStyle = act.type === 'R'
                        ? `rgba(155, 188, 15, ${alpha * 0.4})`
                        : `rgba(255, 107, 53, ${alpha * 0.4})`;
                    ctx.fillRect(30, y, w - 60, barH);

                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.font = 'bold 12px Outfit';
                    ctx.textAlign = 'right';
                    ctx.fillText(act.type === 'R' ? 'READ' : 'WRITE', w - 40, y + 20);
                    ctx.textAlign = 'left';
                }
            });
        });

        busActivity = busActivity.filter(a => { a.age++; return a.age < 30; });
        if (busActivity.length > 0) requestAnimationFrame(draw);
    }

    function simBus(type) {
        const idx = Math.floor(Math.random() * REGIONS.length);
        busActivity.push({ regionIdx: idx, type, age: 0 });
        draw();
        for (let i = 1; i <= 3; i++) {
            setTimeout(() => {
                const idx2 = Math.floor(Math.random() * REGIONS.length);
                busActivity.push({ regionIdx: idx2, type, age: 0 });
                draw();
            }, i * 150);
        }
    }

    document.getElementById('mem-read').onclick = () => simBus('R');
    document.getElementById('mem-write').onclick = () => simBus('W');
    document.getElementById('mem-reset').onclick = () => { busActivity = []; draw(); };

    draw();
})();

// =====================================================================
// 3. PPU SCANLINE TIMING VISUALIZER
// =====================================================================
(() => {
    const canvas = document.getElementById('ppu-canvas');
    const ctx = canvas.getContext('2d');

    const lyEl = document.getElementById('ppu-ly');
    const modeEl = document.getElementById('ppu-mode');
    const dotEl = document.getElementById('ppu-dot');
    const frameEl = document.getElementById('ppu-frame');

    const MODE_COLORS = {
        2: '#9bbc0f',   // OAM Scan
        3: '#ff6b35',   // Pixel Transfer
        0: '#40c8ff',   // H-Blank
        1: '#c040ff'    // V-Blank
    };
    const MODE_NAMES = {
        2: '2 (OAM Scan)',
        3: '3 (Pixel Transfer)',
        0: '0 (H-Blank)',
        1: '1 (V-Blank)'
    };

    let scanline = 0;
    let dot = 0;
    let frame = 0;
    let running = false;
    let animId = null;
    let scanlineHistory = []; // up to ~20 recent scanlines

    function getMode(ly, dotPos) {
        if (ly >= 144) return 1;
        if (dotPos < 80) return 2;
        if (dotPos < 252) return 3;
        return 0;
    }

    function stepScanline() {
        const mode2 = 80;
        const mode3 = 172; // variable in real hardware; fixed here for visualization
        const mode0 = 456 - mode2 - mode3;

        scanlineHistory.push({
            ly: scanline,
            mode2_end: mode2,
            mode3_end: mode2 + mode3,
            total: 456,
            isVBlank: scanline >= 144
        });
        if (scanlineHistory.length > 18) scanlineHistory.shift();

        scanline++;
        if (scanline >= 154) {
            scanline = 0;
            frame++;
        }

        dot = 0;
        updateUI();
        draw();
    }

    function updateUI() {
        const mode = getMode(scanline, dot);
        lyEl.textContent = scanline;
        modeEl.textContent = MODE_NAMES[mode];
        dotEl.textContent = dot;
        frameEl.textContent = frame;
    }

    function draw() {
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#030803';
        ctx.fillRect(0, 0, w, h);

        const padL = 70, padR = 20, padT = 30, padB = 30;
        const plotW = w - padL - padR;
        const lineH = 14;
        const maxLines = Math.min(scanlineHistory.length, Math.floor((h - padT - padB) / lineH));

        // Header
        ctx.font = 'bold 9px Outfit';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#7a9b6a';

        // Mode labels at top
        const m2w = (80 / 456) * plotW;
        const m3w = (172 / 456) * plotW;
        const m0w = plotW - m2w - m3w;

        ctx.fillStyle = MODE_COLORS[2];
        ctx.fillText('OAM', padL + m2w / 2, padT - 10);
        ctx.fillStyle = MODE_COLORS[3];
        ctx.fillText('PIXEL XFER', padL + m2w + m3w / 2, padT - 10);
        ctx.fillStyle = MODE_COLORS[0];
        ctx.fillText('H-BLANK', padL + m2w + m3w + m0w / 2, padT - 10);

        // T-cycle axis markers
        ctx.fillStyle = '#30623060';
        ctx.font = '8px Courier New';
        const markers = [0, 80, 252, 456];
        markers.forEach(tc => {
            const x = padL + (tc / 456) * plotW;
            ctx.strokeStyle = '#1a301940';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, padT);
            ctx.lineTo(x, padT + maxLines * lineH);
            ctx.stroke();
            ctx.fillStyle = '#306230';
            ctx.textAlign = 'center';
            ctx.fillText(`T${tc}`, x, h - 10);
        });

        // Draw scanline bars
        const startIdx = Math.max(0, scanlineHistory.length - maxLines);
        for (let i = startIdx; i < scanlineHistory.length; i++) {
            const entry = scanlineHistory[i];
            const row = i - startIdx;
            const y = padT + row * lineH;
            const isLast = i === scanlineHistory.length - 1;

            // LY label
            ctx.fillStyle = isLast ? '#9bbc0f' : '#7a9b6a';
            ctx.font = isLast ? 'bold 10px Courier New' : '9px Courier New';
            ctx.textAlign = 'right';
            ctx.fillText(`LY ${entry.ly.toString().padStart(3, ' ')}`, padL - 8, y + lineH - 3);

            if (entry.isVBlank) {
                // V-Blank: full bar in purple
                ctx.fillStyle = MODE_COLORS[1] + (isLast ? '60' : '25');
                ctx.fillRect(padL, y + 1, plotW, lineH - 2);
                if (isLast) {
                    ctx.strokeStyle = MODE_COLORS[1];
                    ctx.lineWidth = 1;
                    ctx.strokeRect(padL, y + 1, plotW, lineH - 2);
                }
                ctx.fillStyle = MODE_COLORS[1];
                ctx.font = '8px Outfit';
                ctx.textAlign = 'center';
                ctx.fillText('V-BLANK', padL + plotW / 2, y + lineH - 4);
            } else {
                // Mode 2
                const x2 = padL;
                const w2 = (entry.mode2_end / 456) * plotW;
                ctx.fillStyle = MODE_COLORS[2] + (isLast ? '50' : '20');
                ctx.fillRect(x2, y + 1, w2, lineH - 2);

                // Mode 3
                const x3 = padL + w2;
                const w3 = ((entry.mode3_end - entry.mode2_end) / 456) * plotW;
                ctx.fillStyle = MODE_COLORS[3] + (isLast ? '50' : '20');
                ctx.fillRect(x3, y + 1, w3, lineH - 2);

                // Mode 0
                const x0 = x3 + w3;
                const w0 = plotW - w2 - w3;
                ctx.fillStyle = MODE_COLORS[0] + (isLast ? '50' : '20');
                ctx.fillRect(x0, y + 1, w0, lineH - 2);

                if (isLast) {
                    ctx.strokeStyle = '#9bbc0f40';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(padL, y + 1, plotW, lineH - 2);
                }
            }
        }

        // Frame info
        ctx.fillStyle = '#7a9b6a';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`456 T-cycles/line × 154 lines = 70,224 T-cycles/frame ≈ 59.73 Hz`, padL, h - 10);
    }

    function autoRun() {
        if (running) { cancelAnimationFrame(animId); animId = null; running = false; return; }
        running = true;
        let last = 0;
        function tick(ts) {
            if (ts - last > 80) {
                last = ts;
                stepScanline();
            }
            animId = requestAnimationFrame(tick);
        }
        animId = requestAnimationFrame(tick);
    }

    function reset() {
        scanline = 0; dot = 0; frame = 0;
        scanlineHistory = [];
        if (animId) { cancelAnimationFrame(animId); animId = null; running = false; }
        updateUI();
        draw();
    }

    document.getElementById('ppu-step').onclick = stepScanline;
    document.getElementById('ppu-run').onclick = autoRun;
    document.getElementById('ppu-reset').onclick = reset;

    updateUI();
    draw();
})();

// =====================================================================
// 4. 2BPP TILE PIXEL EDITOR
// =====================================================================
(() => {
    const canvas = document.getElementById('tile-canvas');
    const ctx = canvas.getContext('2d');
    const hexOutput = document.getElementById('tile-hex-output');

    // DMG palette (lightest to darkest)
    const PALETTE = ['#9bbc0f', '#8bac0f', '#306230', '#0f380f'];

    // 8×8 tile data — colour indices 0–3
    let tileData = Array.from({ length: 8 }, () => Array(8).fill(0));

    function encode2bpp() {
        // Convert tile to 16 bytes of 2bpp planar data
        const bytes = [];
        for (let row = 0; row < 8; row++) {
            let lowByte = 0;
            let highByte = 0;
            for (let col = 0; col < 8; col++) {
                const pixel = tileData[row][col];
                const bit = 7 - col;
                if (pixel & 1) lowByte |= (1 << bit);
                if (pixel & 2) highByte |= (1 << bit);
            }
            bytes.push(lowByte, highByte);
        }
        return bytes;
    }

    function updateHex() {
        const bytes = encode2bpp();
        const lines = [];
        for (let i = 0; i < 16; i += 2) {
            lines.push(
                bytes[i].toString(16).toUpperCase().padStart(2, '0') + ' ' +
                bytes[i + 1].toString(16).toUpperCase().padStart(2, '0')
            );
        }
        hexOutput.textContent = lines.join('\n');
    }

    function draw() {
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#030803';
        ctx.fillRect(0, 0, w, h);

        // Tile grid (left side, large)
        const gridSize = Math.min(h - 40, 280);
        const cellSize = gridSize / 8;
        const gridX = 40;
        const gridY = (h - gridSize) / 2;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const x = gridX + col * cellSize;
                const y = gridY + row * cellSize;
                const colorIdx = tileData[row][col];

                ctx.fillStyle = PALETTE[colorIdx];
                ctx.fillRect(x, y, cellSize, cellSize);

                // Grid lines
                ctx.strokeStyle = '#060e0640';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, cellSize, cellSize);

                // Show colour index
                ctx.fillStyle = colorIdx < 2 ? '#0f380f80' : '#9bbc0f80';
                ctx.font = '10px Courier New';
                ctx.textAlign = 'center';
                ctx.fillText(colorIdx.toString(), x + cellSize / 2, y + cellSize / 2 + 4);
            }
        }

        // Palette key
        ctx.font = 'bold 9px Outfit';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#7a9b6a';
        ctx.fillText('PALETTE', gridX, gridY + gridSize + 25);

        for (let i = 0; i < 4; i++) {
            const px = gridX + i * 50;
            const py = gridY + gridSize + 35;
            ctx.fillStyle = PALETTE[i];
            ctx.fillRect(px, py, 16, 16);
            ctx.strokeStyle = '#7a9b6a';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(px, py, 16, 16);
            ctx.fillStyle = '#7a9b6a';
            ctx.font = '9px Courier New';
            ctx.fillText(i.toString(), px + 22, py + 12);
        }

        // Right side: 2bpp encoding explanation
        const infoX = gridX + gridSize + 80;
        const infoY = gridY + 10;

        ctx.font = 'bold 10px Outfit';
        ctx.fillStyle = '#9bbc0f';
        ctx.textAlign = 'left';
        ctx.fillText('2BPP PLANAR ENCODING', infoX, infoY);

        ctx.font = '10px Courier New';
        ctx.fillStyle = '#7a9b6a';

        // Show the binary for each row
        const bytes = encode2bpp();
        for (let row = 0; row < 8; row++) {
            const lowByte = bytes[row * 2];
            const highByte = bytes[row * 2 + 1];
            const ry = infoY + 20 + row * 28;

            ctx.fillStyle = '#306230';
            ctx.font = '9px Courier New';
            ctx.fillText(`Row ${row}:`, infoX, ry);

            ctx.fillStyle = '#9bbc0f';
            ctx.font = '10px Courier New';
            ctx.fillText(`Lo: ${lowByte.toString(2).padStart(8, '0')}`, infoX + 55, ry);
            ctx.fillStyle = '#ff6b35';
            ctx.fillText(`Hi: ${highByte.toString(2).padStart(8, '0')}`, infoX + 175, ry);

            // Hex
            ctx.fillStyle = '#7a9b6a';
            ctx.fillText(
                `= ${lowByte.toString(16).toUpperCase().padStart(2, '0')} ${highByte.toString(16).toUpperCase().padStart(2, '0')}`,
                infoX + 300, ry
            );
        }

        // Label explanation
        ctx.fillStyle = '#306230';
        ctx.font = '9px Courier New';
        const ey = infoY + 20 + 8 * 28 + 10;
        ctx.fillText('pixel_color = (hi_bit << 1) | lo_bit', infoX, ey);
    }

    // Handle clicks on the tile grid
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const sx = canvas.width / rect.width;
        const sy = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * sx;
        const my = (e.clientY - rect.top) * sy;

        const gridSize = Math.min(canvas.height - 40, 280);
        const cellSize = gridSize / 8;
        const gridX = 40;
        const gridY = (canvas.height - gridSize) / 2;

        const col = Math.floor((mx - gridX) / cellSize);
        const row = Math.floor((my - gridY) / cellSize);

        if (row >= 0 && row < 8 && col >= 0 && col < 8) {
            tileData[row][col] = (tileData[row][col] + 1) % 4;
            updateHex();
            draw();
        }
    });

    document.getElementById('tile-clear').onclick = () => {
        tileData = Array.from({ length: 8 }, () => Array(8).fill(0));
        updateHex();
        draw();
    };

    document.getElementById('tile-preset').onclick = () => {
        // Smiley face
        tileData = [
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 2, 2, 2, 2, 1, 0],
            [1, 2, 3, 2, 2, 3, 2, 1],
            [1, 2, 2, 2, 2, 2, 2, 1],
            [1, 2, 3, 2, 2, 3, 2, 1],
            [1, 2, 2, 3, 3, 2, 2, 1],
            [0, 1, 2, 2, 2, 2, 1, 0],
            [0, 0, 1, 1, 1, 1, 0, 0],
        ];
        updateHex();
        draw();
    };

    document.getElementById('tile-random').onclick = () => {
        tileData = Array.from({ length: 8 }, () =>
            Array.from({ length: 8 }, () => Math.floor(Math.random() * 4))
        );
        updateHex();
        draw();
    };

    updateHex();
    draw();
})();

// =====================================================================
// 5. APU PULSE WAVE SYNTHESIZER
// =====================================================================
(() => {
    const canvas = document.getElementById('apu-canvas');
    const ctx = canvas.getContext('2d');

    const dutyInput = document.getElementById('apu-duty');
    const freqInput = document.getElementById('apu-freq');
    const volInput = document.getElementById('apu-vol');
    const envInput = document.getElementById('apu-env');

    const DUTY_PATTERNS = [
        [0, 0, 0, 0, 0, 0, 0, 1],  // 12.5%
        [1, 0, 0, 0, 0, 0, 0, 1],  // 25%
        [1, 0, 0, 0, 0, 1, 1, 1],  // 50%
        [0, 1, 1, 1, 1, 1, 1, 0],  // 75%
    ];
    const DUTY_LABELS = ['12.5%', '25%', '50%', '75%'];

    let showNoise = false;
    let noiseState = [];
    let t = 0;
    let animId = null;

    // Generate noise LFSR output (15-bit LFSR)
    function generateNoise() {
        let lfsr = 0x7FFF;
        noiseState = [];
        for (let i = 0; i < 512; i++) {
            noiseState.push(lfsr & 1);
            const bit = (lfsr ^ (lfsr >> 1)) & 1;
            lfsr = (lfsr >> 1) | (bit << 14);
        }
    }
    generateNoise();

    function draw() {
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#030803';
        ctx.fillRect(0, 0, w, h);

        const padL = 50, padR = 20, padT = 40, padB = 40;
        const plotW = w - padL - padR;
        const plotH = h - padT - padB;

        // Grid
        ctx.strokeStyle = '#1a301920';
        ctx.lineWidth = 0.5;
        for (let gy = 0; gy <= 4; gy++) {
            const yy = padT + plotH * (1 - gy / 4);
            ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(padL + plotW, yy); ctx.stroke();
        }
        for (let gx = 0; gx <= 16; gx++) {
            const xx = padL + (gx / 16) * plotW;
            ctx.beginPath(); ctx.moveTo(xx, padT); ctx.lineTo(xx, padT + plotH); ctx.stroke();
        }

        const duty = parseInt(dutyInput.value);
        const freq = parseInt(freqInput.value);
        const vol = parseInt(volInput.value) / 15;
        const env = parseInt(envInput.value);

        if (showNoise) {
            // Draw noise LFSR output
            ctx.strokeStyle = '#c040ff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();

            const samplesPerPixel = 2;
            for (let px = 0; px < plotW; px++) {
                const sampleIdx = Math.floor((px * samplesPerPixel + t) % noiseState.length);
                const val = noiseState[sampleIdx];
                const amplitude = val * vol;
                const x = padL + px;
                const y = padT + plotH * (1 - amplitude);

                if (px === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Info
            ctx.fillStyle = '#c040ff';
            ctx.font = 'bold 10px Outfit';
            ctx.textAlign = 'left';
            ctx.fillText('CH4: NOISE (15-BIT LFSR)', padL, padT - 15);

            ctx.fillStyle = '#7a9b6a';
            ctx.font = '9px monospace';
            ctx.fillText(`LFSR: 15-bit  |  Vol: ${(vol * 15).toFixed(0)}/15  |  Polynomial: x^15 + x^1 + 1`, padL, h - 12);
        } else {
            // Draw pulse wave
            const pattern = DUTY_PATTERNS[duty];
            const period = (2048 - freq);
            const pixelsPerSample = Math.max(2, plotW / (period * 0.5));
            const samplesVisible = Math.floor(plotW / pixelsPerSample);

            ctx.strokeStyle = '#9bbc0f';
            ctx.lineWidth = 2;
            ctx.beginPath();

            let prevY = null;
            for (let i = 0; i < samplesVisible; i++) {
                const patternIdx = i % 8;
                const high = pattern[patternIdx];
                const amplitude = high * vol;
                const x = padL + i * pixelsPerSample;
                const y = padT + plotH * (1 - amplitude * 0.8) - plotH * 0.1;

                if (prevY !== null && prevY !== y) {
                    // Vertical edge for square wave
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(x + pixelsPerSample, y);
                prevY = y;
            }
            ctx.stroke();

            // Glow under waveform
            ctx.lineTo(padL + plotW, padT + plotH);
            ctx.lineTo(padL, padT + plotH);
            ctx.closePath();
            const grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
            grad.addColorStop(0, 'rgba(155, 188, 15, 0.1)');
            grad.addColorStop(1, 'rgba(155, 188, 15, 0.0)');
            ctx.fillStyle = grad;
            ctx.fill();

            // Envelope visualization (right side overlay)
            if (env > 0) {
                const envSteps = 8;
                const stepW = plotW / envSteps;
                ctx.strokeStyle = '#ff6b3560';
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                for (let s = 0; s <= envSteps; s++) {
                    const envVol = Math.max(0, vol - (s / envSteps) * vol);
                    const x = padL + s * stepW;
                    const y = padT + plotH * (1 - envVol * 0.8) - plotH * 0.1;
                    if (s === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Info
            ctx.fillStyle = '#9bbc0f';
            ctx.font = 'bold 10px Outfit';
            ctx.textAlign = 'left';
            ctx.fillText(`CH1: PULSE (DUTY ${DUTY_LABELS[duty]})`, padL, padT - 15);

            // Calculate actual frequency
            const actualHz = 131072 / (2048 - freq);
            ctx.fillStyle = '#7a9b6a';
            ctx.font = '9px monospace';
            ctx.fillText(`Freq: ${actualHz.toFixed(1)} Hz  |  Reg: ${freq}  |  Vol: ${(vol * 15).toFixed(0)}/15  |  Env Period: ${env}`, padL, h - 12);
        }

        // Y-axis labels
        ctx.fillStyle = '#306230';
        ctx.font = '9px Courier New';
        ctx.textAlign = 'right';
        ctx.fillText('HIGH', padL - 8, padT + 14);
        ctx.fillText('LOW', padL - 8, padT + plotH);
    }

    function animate() {
        t += 2;
        draw();
        animId = requestAnimationFrame(animate);
    }

    dutyInput.oninput = draw;
    freqInput.oninput = draw;
    volInput.oninput = draw;
    envInput.oninput = draw;

    document.getElementById('apu-ch1').onclick = () => {
        showNoise = false;
        if (animId) { cancelAnimationFrame(animId); animId = null; }
        draw();
    };

    document.getElementById('apu-ch4').onclick = () => {
        showNoise = true;
        generateNoise();
        if (!animId) animate();
    };

    document.getElementById('apu-reset').onclick = () => {
        showNoise = false;
        dutyInput.value = 2;
        freqInput.value = 1024;
        volInput.value = 12;
        envInput.value = 3;
        if (animId) { cancelAnimationFrame(animId); animId = null; }
        draw();
    };

    draw();
})();

// =====================================================================
// 6. INTERRUPT & DMA VISUALIZER
// =====================================================================
(() => {
    const canvas = document.getElementById('irq-canvas');
    const ctx = canvas.getContext('2d');

    let events = []; // { type, age, maxAge }
    let ime = true;
    let ie = 0x1F; // all enabled
    let ifReg = 0x00;
    let pc = 0x0150;
    let sp = 0xFFFE;
    let dmaActive = false;
    let dmaProgress = 0;

    const IRQ_VECTORS = {
        'V-Blank': { vector: 0x0040, bit: 0, color: '#9bbc0f' },
        'LCD STAT': { vector: 0x0048, bit: 1, color: '#8bac0f' },
        'Timer': { vector: 0x0050, bit: 2, color: '#ff6b35' },
        'Serial': { vector: 0x0058, bit: 3, color: '#40c8ff' },
        'Joypad': { vector: 0x0060, bit: 4, color: '#c040ff' }
    };

    function fireInterrupt(name) {
        const irq = IRQ_VECTORS[name];
        ifReg |= (1 << irq.bit);

        events.push({
            type: 'irq',
            name: name,
            phase: 0, // 0=pending, 1=push, 2=jump, 3=handler
            age: 0,
            maxAge: 120,
            vector: irq.vector,
            color: irq.color,
            oldPC: pc
        });

        // Simulate: push PC, clear IME, jump to vector
        setTimeout(() => {
            sp = (sp - 2) & 0xFFFF;
            ime = false;
            ifReg &= ~(1 << irq.bit);
            pc = irq.vector;
            draw();
        }, 400);

        // Return from handler
        setTimeout(() => {
            pc = 0x0150 + Math.floor(Math.random() * 0x100);
            sp = 0xFFFE;
            ime = true;
            draw();
        }, 1200);

        draw();
    }

    function triggerDMA() {
        dmaActive = true;
        dmaProgress = 0;
        events.push({
            type: 'dma',
            age: 0,
            maxAge: 160,
            color: '#ffcc00'
        });
        animateDMA();
    }

    function animateDMA() {
        if (dmaProgress <= 160) {
            dmaProgress += 2;
            draw();
            requestAnimationFrame(animateDMA);
        } else {
            dmaActive = false;
            draw();
        }
    }

    function draw() {
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#030803';
        ctx.fillRect(0, 0, w, h);

        // --- Left panel: Interrupt register state ---
        const panelX = 30;
        const panelY = 25;

        ctx.font = 'bold 10px Outfit';
        ctx.fillStyle = '#7a9b6a';
        ctx.textAlign = 'left';
        ctx.fillText('INTERRUPT STATE', panelX, panelY);

        // IME
        ctx.fillStyle = ime ? '#9bbc0f' : '#ff4060';
        ctx.font = '11px Courier New';
        ctx.fillText(`IME: ${ime ? '1 (enabled)' : '0 (disabled)'}`, panelX, panelY + 22);

        // IE register
        ctx.fillStyle = '#7a9b6a';
        ctx.fillText(`IE:  ${ie.toString(2).padStart(5, '0')}  (0x${ie.toString(16).toUpperCase().padStart(2, '0')})`, panelX, panelY + 40);

        // IF register
        ctx.fillStyle = ifReg > 0 ? '#ff6b35' : '#7a9b6a';
        ctx.fillText(`IF:  ${ifReg.toString(2).padStart(5, '0')}  (0x${ifReg.toString(16).toUpperCase().padStart(2, '0')})`, panelX, panelY + 58);

        // CPU state
        ctx.fillStyle = '#9bbc0f';
        ctx.fillText(`PC:  0x${pc.toString(16).toUpperCase().padStart(4, '0')}`, panelX, panelY + 82);
        ctx.fillText(`SP:  0x${sp.toString(16).toUpperCase().padStart(4, '0')}`, panelX, panelY + 100);

        // --- Right panel: Vector table ---
        const vtX = 280;
        const vtY = 25;

        ctx.font = 'bold 10px Outfit';
        ctx.fillStyle = '#7a9b6a';
        ctx.textAlign = 'left';
        ctx.fillText('VECTOR TABLE', vtX, vtY);

        let vi = 0;
        for (const [name, irq] of Object.entries(IRQ_VECTORS)) {
            const y = vtY + 20 + vi * 22;
            const pending = ifReg & (1 << irq.bit);
            const enabled = ie & (1 << irq.bit);

            ctx.fillStyle = pending ? irq.color : (enabled ? '#306230' : '#1a3019');
            ctx.fillRect(vtX, y, 8, 14);

            ctx.fillStyle = pending ? irq.color : '#7a9b6a';
            ctx.font = '10px Courier New';
            ctx.fillText(`0x${irq.vector.toString(16).toUpperCase().padStart(4, '0')}  ${name}`, vtX + 14, y + 11);

            vi++;
        }

        // --- Bottom panel: DMA status ---
        const dmaY = h - 80;
        ctx.font = 'bold 10px Outfit';
        ctx.fillStyle = '#7a9b6a';
        ctx.textAlign = 'left';
        ctx.fillText('OAM DMA TRANSFER', panelX, dmaY);

        if (dmaActive) {
            // DMA progress bar
            const barX = panelX;
            const barY = dmaY + 15;
            const barW = w - 60;
            const barH = 24;
            const progress = dmaProgress / 160;

            ctx.fillStyle = '#1a301920';
            ctx.fillRect(barX, barY, barW, barH);

            ctx.fillStyle = '#ffcc0040';
            ctx.fillRect(barX, barY, barW * progress, barH);

            ctx.strokeStyle = '#ffcc00';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barW, barH);

            // Byte counter
            ctx.fillStyle = '#ffcc00';
            ctx.font = 'bold 11px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(
                `Transferring: ${Math.min(160, dmaProgress)}/160 bytes  |  CPU locked to HRAM (0xFF80–0xFFFE)`,
                barX + barW / 2, barY + barH / 2 + 4
            );

            // Source → OAM arrow
            ctx.fillStyle = '#ffcc00';
            ctx.font = '9px Courier New';
            ctx.textAlign = 'left';
            ctx.fillText('SRC → 0xFE00 (OAM)', barX, barY + barH + 16);
            ctx.fillText(`${dmaProgress * 4} / 640 T-cycles`, barX + 250, barY + barH + 16);
        } else {
            ctx.fillStyle = '#306230';
            ctx.font = '10px Courier New';
            ctx.fillText('Idle — Write to 0xFF46 to initiate 160-byte transfer', panelX, dmaY + 20);
            ctx.fillText('Duration: 640 T-cycles (160 machine cycles)', panelX, dmaY + 38);
        }

        // Age out events
        events = events.filter(e => { e.age++; return e.age < e.maxAge; });
    }

    function reset() {
        events = [];
        ime = true;
        ie = 0x1F;
        ifReg = 0x00;
        pc = 0x0150;
        sp = 0xFFFE;
        dmaActive = false;
        dmaProgress = 0;
        draw();
    }

    document.getElementById('irq-vblank').onclick = () => fireInterrupt('V-Blank');
    document.getElementById('irq-timer').onclick = () => fireInterrupt('Timer');
    document.getElementById('irq-dma').onclick = triggerDMA;
    document.getElementById('irq-reset').onclick = reset;

    draw();
})();
