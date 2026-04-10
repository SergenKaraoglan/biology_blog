/**
 * PlayStation Hardware — Interactive Visuals
 * Part of the Polymath Series
 */

// =====================================================================
// HERO VISUAL: Polygon Mesh Flow
// =====================================================================
(() => {
    const canvas = document.getElementById('hero-ps1-canvas');
    const ctx = canvas.getContext('2d');
    let t = 0;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = 400;
    }
    window.addEventListener('resize', resize);
    resize();

    const particles = [];
    for (let i = 0; i < 120; i++) {
        particles.push({
            x: Math.random(),
            y: Math.random(),
            vx: (Math.random() - 0.5) * 0.0005,
            vy: (Math.random() - 0.5) * 0.0005,
            size: Math.random() * 2 + 1
        });
    }

    function animate() {
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#06080e';
        ctx.fillRect(0, 0, w, h);

        // Update particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > 1) p.vx *= -1;
            if (p.y < 0 || p.y > 1) p.vy *= -1;
        });

        // Draw connection lines
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = (particles[i].x - particles[j].x) * w;
                const dy = (particles[i].y - particles[j].y) * h;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const alpha = (1 - dist / 120) * 0.25;
                    ctx.strokeStyle = `rgba(30, 144, 255, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x * w, particles[i].y * h);
                    ctx.lineTo(particles[j].x * w, particles[j].y * h);
                    ctx.stroke();
                }
            }
        }

        // Draw vertices
        particles.forEach(p => {
            const pulse = Math.sin(t + p.x * 10) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(30, 144, 255, ${pulse * 0.8})`;
            ctx.beginPath();
            ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        t += 0.015;
        requestAnimationFrame(animate);
    }
    animate();
})();

// =====================================================================
// 1. CPU PIPELINE VISUALIZER
// =====================================================================
(() => {
    const canvas = document.getElementById('pipeline-canvas');
    const ctx = canvas.getContext('2d');
    const pcEl = document.getElementById('pipe-pc');
    const cycleEl = document.getElementById('pipe-cycle');
    const ipcEl = document.getElementById('pipe-ipc');

    const STAGES = ['FETCH', 'DECODE', 'EXEC', 'MEM', 'WB'];
    const STAGE_COLORS = ['#1e90ff', '#00c8ff', '#ff4060', '#ffa040', '#40ff80'];

    const INSTRUCTIONS = [
        'LUI $t0, 0x8001',
        'ORI $t0, $t0, 0x0040',
        'LW  $t1, 0($t0)',
        'ADD $t2, $t1, $t0',
        'SW  $t2, 4($t0)',
        'ADDI $t3, $zero, 10',
        'SLT $t4, $t1, $t3',
        'BNE $t4, $zero, -3',
        'NOP (delay slot)',
        'JR  $ra'
    ];

    let cycle = 0;
    let pc = 0x80010000;
    let instrIndex = 0;
    let pipeline = []; // each: { name, stage, born }
    let completed = 0;
    let running = false;
    let animId = null;

    function stepCycle() {
        // Advance existing instructions
        for (let i = pipeline.length - 1; i >= 0; i--) {
            pipeline[i].stage++;
            if (pipeline[i].stage >= 5) {
                pipeline.splice(i, 1);
                completed++;
            }
        }

        // Issue new instruction
        if (instrIndex < INSTRUCTIONS.length) {
            pipeline.push({ name: INSTRUCTIONS[instrIndex], stage: 0, born: cycle });
            instrIndex++;
            pc += 4;
        }

        cycle++;
        updateUI();
        draw();
    }

    function updateUI() {
        pcEl.textContent = '0x' + pc.toString(16).toUpperCase().padStart(8, '0');
        cycleEl.textContent = cycle;
        ipcEl.textContent = cycle > 0 ? (completed / cycle).toFixed(2) : '0.00';
    }

    function draw() {
        const w = canvas.width, h = canvas.height;
        const dpr = window.devicePixelRatio || 1;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';

        ctx.fillStyle = '#050810';
        ctx.fillRect(0, 0, w, h);

        const colW = w / 6;
        const rowH = 40;
        const topPad = 60;

        // Draw stage headers
        ctx.font = 'bold 12px Outfit';
        ctx.textAlign = 'center';
        for (let s = 0; s < 5; s++) {
            ctx.fillStyle = STAGE_COLORS[s];
            ctx.fillRect(colW * (s + 0.5) + 2, 10, colW - 4, 30);
            ctx.fillStyle = '#050810';
            ctx.fillText(STAGES[s], colW * (s + 1), 30);
        }

        // Draw pipeline contents
        pipeline.forEach((instr, idx) => {
            const x = colW * (instr.stage + 0.5);
            const y = topPad + idx * rowH;
            if (y + rowH > h) return;

            const color = STAGE_COLORS[instr.stage];
            ctx.fillStyle = color + '30';
            ctx.fillRect(x + 4, y + 2, colW - 8, rowH - 4);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 4, y + 2, colW - 8, rowH - 4);

            ctx.fillStyle = '#e0e8f0';
            ctx.font = '11px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(instr.name, x + colW / 2, y + rowH / 2 + 4);
        });

        // Cycle marker
        ctx.fillStyle = '#1e90ff20';
        ctx.fillRect(0, 0, 8, h);
        ctx.fillStyle = '#1e90ff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`C${cycle}`, 12, h - 10);
    }

    function reset() {
        cycle = 0; pc = 0x80010000; instrIndex = 0; pipeline = []; completed = 0;
        if (animId) { cancelAnimationFrame(animId); animId = null; running = false; }
        updateUI(); draw();
    }

    function autoRun() {
        if (running) { cancelAnimationFrame(animId); animId = null; running = false; return; }
        running = true;
        let lastTime = 0;
        function tick(ts) {
            if (ts - lastTime > 400) {
                lastTime = ts;
                if (instrIndex < INSTRUCTIONS.length || pipeline.length > 0) {
                    stepCycle();
                } else {
                    running = false; return;
                }
            }
            animId = requestAnimationFrame(tick);
        }
        animId = requestAnimationFrame(tick);
    }

    document.getElementById('pipe-step').onclick = stepCycle;
    document.getElementById('pipe-run').onclick = autoRun;
    document.getElementById('pipe-reset').onclick = reset;

    updateUI();
    draw();
})();

// =====================================================================
// 2. GTE PERSPECTIVE PROJECTOR
// =====================================================================
(() => {
    const canvas = document.getElementById('gte-canvas');
    const ctx = canvas.getContext('2d');
    const rxInput = document.getElementById('gte-rx');
    const ryInput = document.getElementById('gte-ry');
    const fovInput = document.getElementById('gte-fov');

    // Cube vertices (fixed-point style: integer coords)
    const VERTS = [
        [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
        [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]
    ];
    const EDGES = [
        [0,1],[1,2],[2,3],[3,0],
        [4,5],[5,6],[6,7],[7,4],
        [0,4],[1,5],[2,6],[3,7]
    ];

    function draw() {
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#050810';
        ctx.fillRect(0, 0, w, h);

        const rx = parseInt(rxInput.value) / 100;
        const ry = parseInt(ryInput.value) / 100;
        const fov = parseInt(fovInput.value);

        const cosX = Math.cos(rx), sinX = Math.sin(rx);
        const cosY = Math.cos(ry), sinY = Math.sin(ry);

        // Transform vertices (emulate GTE: rotate then project)
        const projected = VERTS.map(([vx, vy, vz]) => {
            // Rotate around Y
            let x1 = vx * cosY - vz * sinY;
            let z1 = vx * sinY + vz * cosY;
            let y1 = vy;
            // Rotate around X
            let y2 = y1 * cosX - z1 * sinX;
            let z2 = y1 * sinX + z1 * cosX;
            let x2 = x1;

            // Perspective projection (GTE-style: screenX = x * h / (z + h))
            const zOffset = z2 + 4;
            const scale = fov / (zOffset > 0.1 ? zOffset : 0.1);
            const sx = w / 2 + x2 * scale;
            const sy = h / 2 + y2 * scale;
            return { sx, sy, z: z2 };
        });

        // Draw grid
        ctx.strokeStyle = '#1a254020';
        ctx.lineWidth = 0.5;
        for (let gx = 0; gx < w; gx += 40) {
            ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
        }
        for (let gy = 0; gy < h; gy += 40) {
            ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
        }

        // Draw edges
        EDGES.forEach(([a, b]) => {
            const pa = projected[a], pb = projected[b];
            const avgZ = (pa.z + pb.z) / 2;
            const brightness = Math.max(0.2, Math.min(1, 1 - avgZ * 0.15));
            ctx.strokeStyle = `rgba(30, 144, 255, ${brightness})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pa.sx, pa.sy);
            ctx.lineTo(pb.sx, pb.sy);
            ctx.stroke();
        });

        // Draw vertices
        projected.forEach((p, i) => {
            const brightness = Math.max(0.3, Math.min(1, 1 - p.z * 0.15));
            ctx.fillStyle = `rgba(255, 64, 96, ${brightness})`;
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, 4, 0, Math.PI * 2);
            ctx.fill();

            // Show coord labels
            ctx.fillStyle = `rgba(224, 232, 240, ${brightness * 0.6})`;
            ctx.font = '9px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`V${i}`, p.sx + 6, p.sy - 4);
        });

        // Info overlay
        ctx.fillStyle = '#8a9bb5';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`FOV_D: ${fov}  RX: ${(rx).toFixed(2)}  RY: ${(ry).toFixed(2)}`, 10, h - 10);
    }

    rxInput.oninput = draw;
    ryInput.oninput = draw;
    fovInput.oninput = draw;

    // Auto-rotate
    let autoT = 0;
    function autoRotate() {
        autoT += 0.008;
        rxInput.value = Math.floor((Math.sin(autoT * 0.7) + 1) * 314);
        ryInput.value = Math.floor(autoT * 100 % 628);
        draw();
        requestAnimationFrame(autoRotate);
    }
    autoRotate();
})();

// =====================================================================
// 3. MEMORY MAP EXPLORER
// =====================================================================
(() => {
    const canvas = document.getElementById('memmap-canvas');
    const ctx = canvas.getContext('2d');
    const legendEl = document.getElementById('memmap-legend');

    const REGIONS = [
        { name: 'Main RAM',    start: 0x00000000, size: 0x200000,  color: '#1e90ff', shortSize: '2 MB' },
        { name: 'Scratchpad',  start: 0x1F800000, size: 0x400,     color: '#ff4060', shortSize: '1 KB' },
        { name: 'I/O Ports',   start: 0x1F801000, size: 0x2000,    color: '#ffa040', shortSize: '8 KB' },
        { name: 'BIOS ROM',    start: 0x1FC00000, size: 0x80000,   color: '#40ff80', shortSize: '512 KB' },
        { name: 'VRAM (GPU)',   start: 0xA0000000, size: 0x100000,  color: '#c040ff', shortSize: '1 MB' },
        { name: 'Sound RAM',   start: 0xB0000000, size: 0x80000,   color: '#ffcc00', shortSize: '512 KB' },
    ];

    let busActivity = []; // { regionIdx, type, age }

    // Build legend
    REGIONS.forEach((r) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        const swatch = document.createElement('span');
        swatch.className = 'legend-swatch';
        swatch.style.backgroundColor = r.color;
        const label = document.createTextNode(`${r.name} (${r.shortSize})`);
        item.appendChild(swatch);
        item.appendChild(label);
        legendEl.appendChild(item);
    });

    function draw() {
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#050810';
        ctx.fillRect(0, 0, w, h);

        const barH = 50;
        const gap = 12;
        const startY = 30;

        ctx.font = 'bold 11px Outfit';
        ctx.textAlign = 'left';

        REGIONS.forEach((r, i) => {
            const y = startY + i * (barH + gap);
            const barW = Math.max(80, (Math.log2(r.size + 1) / 25) * (w - 200));

            // Background bar
            ctx.fillStyle = r.color + '15';
            ctx.fillRect(40, y, w - 80, barH);
            ctx.strokeStyle = r.color + '40';
            ctx.lineWidth = 1;
            ctx.strokeRect(40, y, w - 80, barH);

            // Filled portion (proportional to log size)
            ctx.fillStyle = r.color + '50';
            ctx.fillRect(40, y, barW, barH);

            // Label
            ctx.fillStyle = r.color;
            ctx.fillText(r.name, 50, y + 20);
            ctx.fillStyle = '#8a9bb5';
            ctx.font = '10px Courier New';
            ctx.fillText(`0x${r.start.toString(16).toUpperCase().padStart(8, '0')}  |  ${r.shortSize}`, 50, y + 38);
            ctx.font = 'bold 11px Outfit';

            // Bus activity flash
            busActivity.forEach(act => {
                if (act.regionIdx === i && act.age < 30) {
                    const alpha = 1 - act.age / 30;
                    ctx.fillStyle = act.type === 'R'
                        ? `rgba(30, 144, 255, ${alpha * 0.4})`
                        : `rgba(255, 64, 96, ${alpha * 0.4})`;
                    ctx.fillRect(40, y, w - 80, barH);

                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.font = 'bold 14px Outfit';
                    ctx.textAlign = 'right';
                    ctx.fillText(act.type === 'R' ? 'READ' : 'WRITE', w - 50, y + 30);
                    ctx.textAlign = 'left';
                    ctx.font = 'bold 11px Outfit';
                }
            });
        });

        // Age out bus activity
        busActivity = busActivity.filter(a => { a.age++; return a.age < 30; });
        if (busActivity.length > 0) requestAnimationFrame(draw);
    }

    function simBus(type) {
        const idx = Math.floor(Math.random() * REGIONS.length);
        busActivity.push({ regionIdx: idx, type, age: 0 });
        draw();
        // Chain a few more for visual effect
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
// 4. GPU GOURAUD TRIANGLE RASTERIZER
// =====================================================================
(() => {
    const canvas = document.getElementById('gpu-canvas');
    const ctx = canvas.getContext('2d');

    let verts = [
        { x: 200, y: 60,  r: 255, g: 30,  b: 60 },
        { x: 600, y: 120, r: 30,  g: 144, b: 255 },
        { x: 350, y: 360, r: 64,  g: 255, b: 128 }
    ];

    let dragging = -1;

    function edgeFn(ax, ay, bx, by, px, py) {
        return (bx - ax) * (py - ay) - (by - ay) * (px - ax);
    }

    function draw() {
        const w = canvas.width, h = canvas.height;
        const imgData = ctx.createImageData(w, h);
        const data = imgData.data;

        const [v0, v1, v2] = verts;
        const area = edgeFn(v0.x, v0.y, v1.x, v1.y, v2.x, v2.y);
        if (Math.abs(area) < 1) { ctx.putImageData(imgData, 0, 0); return; }

        // Bounding box
        const minX = Math.max(0, Math.floor(Math.min(v0.x, v1.x, v2.x)));
        const maxX = Math.min(w - 1, Math.ceil(Math.max(v0.x, v1.x, v2.x)));
        const minY = Math.max(0, Math.floor(Math.min(v0.y, v1.y, v2.y)));
        const maxY = Math.min(h - 1, Math.ceil(Math.max(v0.y, v1.y, v2.y)));

        // Fill background with dark CRT look
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 5; data[i + 1] = 8; data[i + 2] = 16; data[i + 3] = 255;
        }

        // Rasterize with barycentric interpolation
        for (let py = minY; py <= maxY; py++) {
            for (let px = minX; px <= maxX; px++) {
                const w0 = edgeFn(v1.x, v1.y, v2.x, v2.y, px, py);
                const w1 = edgeFn(v2.x, v2.y, v0.x, v0.y, px, py);
                const w2 = edgeFn(v0.x, v0.y, v1.x, v1.y, px, py);

                if ((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0)) {
                    const b0 = w0 / area, b1 = w1 / area, b2 = w2 / area;
                    const r = Math.round(b0 * v0.r + b1 * v1.r + b2 * v2.r);
                    const g = Math.round(b0 * v0.g + b1 * v1.g + b2 * v2.g);
                    const b = Math.round(b0 * v0.b + b1 * v1.b + b2 * v2.b);

                    const idx = (py * w + px) * 4;
                    data[idx] = r;
                    data[idx + 1] = g;
                    data[idx + 2] = b;
                    data[idx + 3] = 255;
                }
            }
        }

        // CRT scanline overlay
        for (let sy = 0; sy < h; sy += 3) {
            for (let sx = 0; sx < w; sx++) {
                const idx = (sy * w + sx) * 4;
                data[idx] = Math.max(0, data[idx] - 15);
                data[idx + 1] = Math.max(0, data[idx + 1] - 15);
                data[idx + 2] = Math.max(0, data[idx + 2] - 15);
            }
        }

        ctx.putImageData(imgData, 0, 0);

        // Draw wireframe overlay and vertex handles
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(v0.x, v0.y);
        ctx.lineTo(v1.x, v1.y);
        ctx.lineTo(v2.x, v2.y);
        ctx.closePath();
        ctx.stroke();

        verts.forEach((v, i) => {
            ctx.fillStyle = `rgb(${v.r}, ${v.g}, ${v.b})`;
            ctx.beginPath();
            ctx.arc(v.x, v.y, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`V${i}`, v.x, v.y - 12);
        });
    }

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const sx = canvas.width / rect.width;
        const sy = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * sx;
        const my = (e.clientY - rect.top) * sy;
        for (let i = 0; i < 3; i++) {
            const dx = mx - verts[i].x, dy = my - verts[i].y;
            if (dx * dx + dy * dy < 400) { dragging = i; break; }
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (dragging < 0) return;
        const rect = canvas.getBoundingClientRect();
        const sx = canvas.width / rect.width;
        const sy = canvas.height / rect.height;
        verts[dragging].x = (e.clientX - rect.left) * sx;
        verts[dragging].y = (e.clientY - rect.top) * sy;
        draw();
    });

    document.addEventListener('mouseup', () => { dragging = -1; });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        const rect = canvas.getBoundingClientRect();
        const sx = canvas.width / rect.width;
        const sy = canvas.height / rect.height;
        const mx = (e.touches[0].clientX - rect.left) * sx;
        const my = (e.touches[0].clientY - rect.top) * sy;
        for (let i = 0; i < 3; i++) {
            const dx = mx - verts[i].x, dy = my - verts[i].y;
            if (dx * dx + dy * dy < 600) { dragging = i; e.preventDefault(); break; }
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (dragging < 0) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const sx = canvas.width / rect.width;
        const sy = canvas.height / rect.height;
        verts[dragging].x = (e.touches[0].clientX - rect.left) * sx;
        verts[dragging].y = (e.touches[0].clientY - rect.top) * sy;
        draw();
    }, { passive: false });

    document.addEventListener('touchend', () => { dragging = -1; });

    document.getElementById('gpu-shade').onclick = () => {
        verts.forEach(v => { v.r = Math.random()*255|0; v.g = Math.random()*255|0; v.b = Math.random()*255|0; });
        draw();
    };
    document.getElementById('gpu-move').onclick = () => {
        verts.forEach(v => {
            v.x = 80 + Math.random() * (canvas.width - 160);
            v.y = 40 + Math.random() * (canvas.height - 80);
        });
        draw();
    };
    document.getElementById('gpu-clear').onclick = () => {
        ctx.fillStyle = '#050810';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setTimeout(draw, 600);
    };

    draw();
})();

// =====================================================================
// 5. SPU ADSR ENVELOPE EDITOR
// =====================================================================
(() => {
    const canvas = document.getElementById('spu-canvas');
    const ctx = canvas.getContext('2d');
    const aSlider = document.getElementById('adsr-a');
    const dSlider = document.getElementById('adsr-d');
    const sSlider = document.getElementById('adsr-s');
    const rSlider = document.getElementById('adsr-r');

    let envelope = []; // normalized array of amplitudes
    let animProgress = -1; // -1 = not animating
    let animId = null;

    function buildEnvelope() {
        const A = parseInt(aSlider.value);
        const D = parseInt(dSlider.value);
        const S = parseInt(sSlider.value) / 100;
        const R = parseInt(rSlider.value);

        const total = A + D + 80 + R; // sustain hold = 80 steps
        envelope = [];

        // Attack: 0 → 1
        for (let i = 0; i < A; i++) envelope.push(i / A);

        // Decay: 1 → S
        for (let i = 0; i < D; i++) envelope.push(1 - (1 - S) * (i / D));

        // Sustain hold
        for (let i = 0; i < 80; i++) envelope.push(S);

        // Release: S → 0
        for (let i = 0; i < R; i++) envelope.push(S * (1 - i / R));

        return total;
    }

    function draw() {
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#050810';
        ctx.fillRect(0, 0, w, h);

        if (envelope.length === 0) buildEnvelope();

        const padL = 50, padR = 20, padT = 20, padB = 40;
        const plotW = w - padL - padR;
        const plotH = h - padT - padB;

        // Grid
        ctx.strokeStyle = '#1a254030';
        ctx.lineWidth = 0.5;
        for (let gy = 0; gy <= 4; gy++) {
            const yy = padT + plotH * (1 - gy / 4);
            ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(padL + plotW, yy); ctx.stroke();
            ctx.fillStyle = '#8a9bb5';
            ctx.font = '9px monospace';
            ctx.textAlign = 'right';
            ctx.fillText((gy * 25) + '%', padL - 8, yy + 3);
        }

        // Phase labels
        const A = parseInt(aSlider.value);
        const D = parseInt(dSlider.value);
        const R = parseInt(rSlider.value);
        const total = envelope.length;
        const phases = [
            { label: 'ATTACK', end: A },
            { label: 'DECAY', end: A + D },
            { label: 'SUSTAIN', end: A + D + 80 },
            { label: 'RELEASE', end: total }
        ];

        let phaseStart = 0;
        ctx.font = '9px Outfit';
        ctx.textAlign = 'center';
        phases.forEach((ph) => {
            const x1 = padL + (phaseStart / total) * plotW;
            const x2 = padL + (ph.end / total) * plotW;
            ctx.fillStyle = '#1e90ff30';
            ctx.fillRect(x1, padT, x2 - x1, plotH);
            ctx.fillStyle = '#1e90ff';
            ctx.fillText(ph.label, (x1 + x2) / 2, h - 12);

            // Divider
            ctx.strokeStyle = '#1e90ff40';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath(); ctx.moveTo(x2, padT); ctx.lineTo(x2, padT + plotH); ctx.stroke();
            ctx.setLineDash([]);

            phaseStart = ph.end;
        });

        // Envelope curve
        ctx.strokeStyle = '#1e90ff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < envelope.length; i++) {
            const x = padL + (i / total) * plotW;
            const y = padT + plotH * (1 - envelope[i]);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Glow fill under curve
        ctx.lineTo(padL + plotW, padT + plotH);
        ctx.lineTo(padL, padT + plotH);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
        grad.addColorStop(0, 'rgba(30, 144, 255, 0.15)');
        grad.addColorStop(1, 'rgba(30, 144, 255, 0.0)');
        ctx.fillStyle = grad;
        ctx.fill();

        // Animation playhead
        if (animProgress >= 0 && animProgress < envelope.length) {
            const ax = padL + (animProgress / total) * plotW;
            const ay = padT + plotH * (1 - envelope[Math.floor(animProgress)]);
            ctx.strokeStyle = '#ff4060';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(ax, padT); ctx.lineTo(ax, padT + plotH); ctx.stroke();

            ctx.fillStyle = '#ff4060';
            ctx.beginPath();
            ctx.arc(ax, ay, 5, 0, Math.PI * 2);
            ctx.fill();

            // Amplitude readout
            ctx.fillStyle = '#ff4060';
            ctx.font = 'bold 11px Courier New';
            ctx.textAlign = 'left';
            const amp = envelope[Math.floor(animProgress)];
            ctx.fillText(`AMP: ${(amp * 100).toFixed(0)}%`, ax + 10, ay - 8);
        }
    }

    function triggerVoice() {
        buildEnvelope();
        animProgress = 0;
        if (animId) cancelAnimationFrame(animId);
        function tick() {
            animProgress += 1.5;
            draw();
            if (animProgress < envelope.length) animId = requestAnimationFrame(tick);
            else { animProgress = -1; draw(); }
        }
        animId = requestAnimationFrame(tick);
    }

    aSlider.oninput = () => { buildEnvelope(); draw(); };
    dSlider.oninput = () => { buildEnvelope(); draw(); };
    sSlider.oninput = () => { buildEnvelope(); draw(); };
    rSlider.oninput = () => { buildEnvelope(); draw(); };

    document.getElementById('spu-trigger').onclick = triggerVoice;
    document.getElementById('spu-preset').onclick = () => {
        aSlider.value = 40; dSlider.value = 30; sSlider.value = 70; rSlider.value = 80;
        buildEnvelope(); draw();
    };
    document.getElementById('spu-reset').onclick = () => {
        aSlider.value = 10; dSlider.value = 20; sSlider.value = 60; rSlider.value = 40;
        animProgress = -1;
        if (animId) cancelAnimationFrame(animId);
        buildEnvelope(); draw();
    };

    buildEnvelope();
    draw();
})();
