// Computer Science Visuals - First Principles

document.addEventListener('DOMContentLoaded', () => {
    initHero();
    initBinary();
    initLogic();
    initGPUVisualizer();
    initStructs();
    initPenTestVisualizer();
    initProgramSynthesis();
});

// --- 1. HERO VISUAL (Circuit Stream) ---
function initHero() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let streams = [];

    function resize() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Stream {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = -100;
            this.speed = Math.random() * 5 + 2;
            this.chars = [];
            const len = Math.floor(Math.random() * 10) + 5;
            for(let i=0; i<len; i++) this.chars.push(Math.random() > 0.5 ? '1' : '0');
        }
        update() {
            this.y += this.speed;
            if (this.y > canvas.height + 100) this.reset();
        }
        draw() {
            ctx.font = '12px Courier New';
            this.chars.forEach((c, i) => {
                const alpha = (i / this.chars.length);
                ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.4})`;
                ctx.fillText(c, this.x, this.y - (i * 15));
            });
        }
    }

    for (let i = 0; i < 30; i++) streams.push(new Stream());

    function animate() {
        ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        streams.forEach(s => {
            s.update();
            s.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// --- 2. BINARY INTERACTIVE ---
function initBinary() {
    const grid = document.getElementById('binary-grid');
    const decimalDisplay = document.getElementById('decimal-val');
    if (!grid) return;

    let bits = [0,0,0,0,0,0,0,0];

    function update() {
        let decimal = 0;
        bits.forEach((b, i) => {
            if (b === 1) decimal += Math.pow(2, 7 - i);
        });
        decimalDisplay.innerText = decimal;
    }

    bits.forEach((bit, i) => {
        const el = document.createElement('div');
        el.className = 'bit-box';
        el.innerText = '0';
        el.addEventListener('click', () => {
            bits[i] = bits[i] === 0 ? 1 : 0;
            el.innerText = bits[i];
            el.classList.toggle('active');
            update();
        });
        grid.appendChild(el);
    });
}

// --- 3. LOGIC GATES ---
function initLogic() {
    const canvas = document.getElementById('logicCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const typeBtn = document.getElementById('gate-type-btn');
    const in1Btn = document.getElementById('toggle-in1-btn');
    const in2Btn = document.getElementById('toggle-in2-btn');

    let type = 'AND';
    let in1 = 0;
    let in2 = 0;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cw = canvas.width / 2;
        const ch = canvas.height / 2;

        // Draw Inputs
        ctx.lineWidth = 2;
        ctx.strokeStyle = in1 ? '#00ffff' : '#333';
        ctx.beginPath(); ctx.moveTo(50, ch - 40); ctx.lineTo(cw - 50, ch - 40); ctx.stroke();
        
        ctx.strokeStyle = in2 ? '#00ffff' : '#333';
        ctx.beginPath(); ctx.moveTo(50, ch + 40); ctx.lineTo(cw - 50, ch + 40); ctx.stroke();

        // Draw Gate
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(cw - 50, ch - 60, 100, 120);
        ctx.fillStyle = '#fff';
        ctx.font = '20px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(type, cw, ch + 8);

        // Draw Output
        let out = 0;
        if (type === 'AND') out = (in1 && in2) ? 1 : 0;
        else if (type === 'OR') out = (in1 || in2) ? 1 : 0;
        else if (type === 'XOR') out = (in1 !== in2) ? 1 : 0;

        ctx.strokeStyle = out ? '#00ffff' : '#333';
        ctx.beginPath(); ctx.moveTo(cw + 50, ch); ctx.lineTo(canvas.width - 50, ch); ctx.stroke();
        
        if (out) {
            ctx.fillStyle = '#00ffff';
            ctx.beginPath(); ctx.arc(canvas.width - 50, ch, 8, 0, Math.PI * 2); ctx.fill();
        }
    }

    typeBtn.addEventListener('click', () => {
        if (type === 'AND') type = 'OR';
        else if (type === 'OR') type = 'XOR';
        else type = 'AND';
        typeBtn.innerText = `GATE: ${type}`;
        draw();
    });

    in1Btn.addEventListener('click', () => {
        in1 = in1 ? 0 : 1;
        in1Btn.innerText = `INPUT A: ${in1}`;
        draw();
    });

    in2Btn.addEventListener('click', () => {
        in2 = in2 ? 0 : 1;
        in2Btn.innerText = `INPUT B: ${in2}`;
        draw();
    });

    draw();
}

// --- 3.5 PARALLEL REALITIES (GPU) ---
function initGPUVisualizer() {
    const canvas = document.getElementById('gpuCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cpuBtn = document.getElementById('cpu-mode-btn');
    const gpuBtn = document.getElementById('gpu-mode-btn');

    let mode = 'CPU'; 
    let grid = [];
    const cols = 50;
    const rows = 25;
    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;
    let animationId = null;

    function resetGrid() {
        grid = [];
        for(let r = 0; r < rows; r++) {
            for(let c = 0; c < cols; c++) {
                grid.push({ r, c, done: false });
            }
        }
    }

    function draw() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        grid.forEach(cell => {
            const x = cell.c * cellW;
            const y = cell.r * cellH;
            ctx.fillStyle = cell.done ? '#ccff00' : '#222';
            ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
        });
    }

    function animate() {
        let isDone = true;
        
        if (mode === 'CPU') {
            let processed = 0;
            for (let i = 0; i < grid.length; i++) {
                if (!grid[i].done) {
                    grid[i].done = true;
                    processed++;
                    isDone = false;
                    if (processed >= 6) break; // slow sequential speed
                }
            }
        } else if (mode === 'GPU') {
            let processed = 0;
            for (let i = 0; i < grid.length; i++) {
                if (!grid[i].done) {
                    grid[i].done = true;
                    processed++;
                    isDone = false;
                    if (processed >= 400) break; // extremely fast batch processing
                }
            }
        }

        draw();

        if (!isDone) {
            animationId = requestAnimationFrame(animate);
        }
    }

    cpuBtn.addEventListener('click', () => {
        mode = 'CPU';
        if(animationId) cancelAnimationFrame(animationId);
        resetGrid();
        animate();
    });

    gpuBtn.addEventListener('click', () => {
        mode = 'GPU';
        if(animationId) cancelAnimationFrame(animationId);
        resetGrid();
        animate();
    });

    resetGrid();
    draw();
}

// --- 4. DATA STRUCTURES ---
function initStructs() {
    const canvas = document.getElementById('structCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const modeBtn = document.getElementById('array-mode-btn');
    const searchBtn = document.getElementById('search-btn');

    let mode = 'ARRAY';
    let searching = -1;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const count = 6;
        const size = 50;
        const spacing = 10;
        const totalW = count * (size + spacing) + (mode === 'LIST' ? count * 40 : 0);
        const startX = (canvas.width - totalW) / 2;

        for (let i = 0; i < count; i++) {
            const x = startX + i * (size + (mode === 'ARRAY' ? spacing : spacing + 40));
            const y = canvas.height / 2 - size / 2;

            ctx.fillStyle = searching === i ? '#00ffff' : '#111';
            ctx.strokeStyle = searching === i ? '#00ffff' : '#444';
            ctx.fillRect(x, y, size, size);
            ctx.strokeRect(x, y, size, size);

            if (mode === 'LIST' && i < count - 1) {
                ctx.strokeStyle = '#888';
                ctx.beginPath();
                ctx.moveTo(x + size, y + size/2);
                ctx.lineTo(x + size + 40, y + size/2);
                ctx.stroke();
                // Arrow head
                ctx.lineTo(x + size + 30, y + size/2 - 5);
                ctx.stroke();
            }
        }
    }

    modeBtn.addEventListener('click', () => {
        mode = mode === 'ARRAY' ? 'LIST' : 'ARRAY';
        modeBtn.innerText = `MODE: ${mode}`;
        searching = -1;
        draw();
    });

    searchBtn.addEventListener('click', () => {
        let i = 0;
        const interval = setInterval(() => {
            searching = i;
            draw();
            i++;
            if (i >= 6) {
                clearInterval(interval);
                setTimeout(() => { searching = -1; draw(); }, 500);
            }
        }, 300);
    });

    draw();
}

// --- 5. PENETRATION TESTING (Network Intrusion Simulator) ---
function initPenTestVisualizer() {
    const canvas = document.getElementById('pentestCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reconBtn = document.getElementById('recon-btn');
    const scanBtn = document.getElementById('scan-btn');
    const exploitBtn = document.getElementById('exploit-btn');
    const resetBtn = document.getElementById('reset-pentest-btn');
    const log = document.getElementById('pentest-log');

    let phase = 0; // 0: Idle, 1: Recon, 2: Scan, 3: Exploit
    let nodes = [
        { id: 'Local', x: 100, y: 150, type: 'attacker', status: 'ready' },
        { id: 'SRV-01', x: 300, y: 80, type: 'target', status: 'unknown', info: 'Linux 5.10' },
        { id: 'DB-MAIN', x: 300, y: 220, type: 'target', status: 'unknown', info: 'PostgreSQL 12' },
        { id: 'WS-01', x: 500, y: 150, type: 'target', status: 'unknown', info: 'Win 10' }
    ];

    function writeLog(msg) {
        log.innerHTML += `<br>> ${msg}`;
        log.scrollTop = log.scrollHeight;
    }

    function draw() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Connections
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        nodes.forEach(n => {
            if (n.type === 'target') {
                ctx.strokeStyle = phase >= 1 ? '#444' : 'transparent';
                ctx.beginPath();
                ctx.moveTo(100, 150);
                ctx.lineTo(n.x, n.y);
                ctx.stroke();
            }
        });
        ctx.setLineDash([]);

        // Nodes
        nodes.forEach(n => {
            ctx.fillStyle = n.type === 'attacker' ? '#00ffff' : '#111';
            if (phase >= 2 && n.status === 'vulnerable') ctx.fillStyle = '#ff3333';
            if (phase === 3 && n.status === 'compromised') ctx.fillStyle = '#ff3333';
            
            ctx.strokeStyle = '#fff';
            if (phase >= 1 || n.type === 'attacker') {
                ctx.beginPath();
                ctx.arc(n.x, n.y, 25, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#fff';
                ctx.font = '10px Courier New';
                ctx.textAlign = 'center';
                ctx.fillText(n.id, n.x, n.y + 40);

                if (phase >= 2 && n.type === 'target') {
                    ctx.fillStyle = n.status === 'vulnerable' ? '#ff3333' : '#888';
                    ctx.fillText(n.status.toUpperCase(), n.x, n.y + 52);
                }
            }
        });

        if (phase === 3) {
            // Draw exploit animation
            ctx.strokeStyle = '#ff3333';
            ctx.setLineDash([2, 5]);
            ctx.beginPath();
            ctx.moveTo(100, 150);
            ctx.lineTo(300, 80);
            ctx.stroke();
        }
    }

    reconBtn.addEventListener('click', () => {
        phase = 1;
        writeLog("Starting reconnaissance... Network map acquired.");
        reconBtn.disabled = true;
        scanBtn.disabled = false;
        draw();
    });

    scanBtn.addEventListener('click', () => {
        phase = 2;
        writeLog("Scanning targets... Found high-risk vulnerability on SRV-01 (CVE-2023-XXXX).");
        nodes[1].status = 'vulnerable';
        nodes[2].status = 'secure';
        nodes[3].status = 'secure';
        scanBtn.disabled = true;
        exploitBtn.disabled = false;
        draw();
    });

    exploitBtn.addEventListener('click', () => {
        phase = 3;
        writeLog("Executing exploit... Payload delivered to SRV-01.");
        setTimeout(() => {
            nodes[1].status = 'compromised';
            writeLog("ROOT ACCESS GRANTED. System compromised.");
            exploitBtn.disabled = true;
            draw();
        }, 1000);
        draw();
    });

    resetBtn.addEventListener('click', () => {
        phase = 0;
        nodes.forEach(n => { n.status = 'unknown'; });
        reconBtn.disabled = false;
        scanBtn.disabled = true;
        exploitBtn.disabled = true;
        log.innerHTML = "> System Ready. Awaiting instructions...";
        draw();
    });

    draw();
}

// --- 6. PROGRAM SYNTHESIS (Deductive Synthesis Engine) ---
function initProgramSynthesis() {
    const canvas = document.getElementById('synthesisCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('synthesize-btn');
    const resetBtn = document.getElementById('reset-synthesis-btn');
    const codeDisplay = document.getElementById('synthesized-code');

    let isRunning = false;
    let candidates = [
        { formula: 'x + 2', status: 'pending' },
        { formula: 'x * 2', status: 'pending' },
        { formula: 'x ** 2', status: 'pending' },
        { formula: 'x / 2', status: 'pending' },
        { formula: 'x + 10', status: 'pending' },
        { formula: 'x * 4', status: 'pending' }
    ];
    let currentIndex = -1;

    function draw() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const spacing = 100;
        const startX = (canvas.width - (candidates.length * spacing)) / 2 + 50;

        candidates.forEach((c, i) => {
            const x = startX + i * spacing;
            const y = canvas.height / 2;

            // Box
            ctx.strokeStyle = '#333';
            if (i === currentIndex) ctx.strokeStyle = '#00ffff';
            if (c.status === 'fail') ctx.strokeStyle = '#ff3333';
            if (c.status === 'pass') ctx.strokeStyle = '#ccff00';
            
            ctx.lineWidth = 2;
            ctx.strokeRect(x - 40, y - 20, 80, 40);

            // Text
            ctx.fillStyle = ctx.strokeStyle;
            ctx.font = '12px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(c.formula, x, y + 5);

            if (c.status === 'fail') {
                ctx.font = '10px Courier New';
                ctx.fillText('PRUNED', x, y + 35);
            }
        });
    }

    function runSynthesis() {
        if (!isRunning) return;
        currentIndex++;

        if (currentIndex >= candidates.length) {
            isRunning = false;
            startBtn.disabled = false;
            return;
        }

        const c = candidates[currentIndex];
        const examples = [{i:2, o:4}, {i:3, o:9}, {i:4, o:16}];
        
        let pass = true;
        try {
            // Very simple "interpreter" for our DSL
            const func = new Function('x', `return ${c.formula}`);
            for (let ex of examples) {
                if (func(ex.i) !== ex.o) {
                    pass = false;
                    break;
                }
            }
        } catch(e) { pass = false; }

        setTimeout(() => {
            c.status = pass ? 'pass' : 'fail';
            if (pass) {
                codeDisplay.innerText = `f(x) = ${c.formula}`;
                isRunning = false;
                startBtn.disabled = false;
            }
            draw();
            if (isRunning) runSynthesis();
        }, 600);
        
        draw();
    }

    startBtn.addEventListener('click', () => {
        if (isRunning) return;
        isRunning = true;
        currentIndex = -1;
        candidates.forEach(c => c.status = 'pending');
        codeDisplay.innerText = '???';
        startBtn.disabled = true;
        runSynthesis();
    });

    resetBtn.addEventListener('click', () => {
        isRunning = false;
        currentIndex = -1;
        candidates.forEach(c => c.status = 'pending');
        codeDisplay.innerText = '???';
        startBtn.disabled = false;
        draw();
    });

    draw();
}
