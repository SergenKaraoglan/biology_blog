// Computer Science Visuals - First Principles

function startInitializers() {
    const initializers = [
        initHero, initBinary, initTransistorVisualizer, initLogic, initALUVisualizer, initCPUVisualizer, initGPUVisualizer, initRAMVisualizer,
        initOSVisualizer, initKernelVisualizer, initStructs, initComplexityVisualizer, initPvsNPVisualizer,
        initKnightsTourVisualizer, initBeamSearchVisualizer, initPenTestVisualizer, initProgramSynthesis, initLLVMVisualizer,
        initInterpreterVisualizer, initCompilerVisualizer
    ];
    initializers.forEach(init => {
        try { if (typeof init === 'function') init(); } catch (e) { console.error(e); }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startInitializers);
} else {
    startInitializers();
}

// --- 5. COMPUTATIONAL COMPLEXITY (Big O Curves) ---
function initComplexityVisualizer() {
    const canvas = document.getElementById('complexityCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('complexity-start-btn');

    let progress = 0;
    let animating = false;

    function draw() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Axes
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, 20); ctx.lineTo(50, 250); ctx.lineTo(550, 250);
        ctx.stroke();

        ctx.fillStyle = '#888';
        ctx.font = '10px Courier New';
        ctx.fillText('TIME (t)', 20, 30);
        ctx.fillText('DATA (n)', 280, 275);

        const drawCurve = (fn, color, label) => {
            ctx.strokeStyle = color;
            ctx.beginPath();
            for (let n = 0; n <= progress; n += 5) {
                const x = 50 + n;
                const y = 250 - fn(n);
                if (n === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            if (progress > 50) {
                ctx.fillStyle = color;
                ctx.fillText(label, 50 + progress, 250 - fn(progress) - 10);
            }
        };

        drawCurve(n => 30, '#00ffff', 'O(1)');
        drawCurve(n => n * 0.4, '#ccff00', 'O(n)');
        drawCurve(n => (n * n) * 0.001, '#ff3333', 'O(n²)');
    }

    startBtn.addEventListener('click', () => {
        if (animating) return;
        animating = true;
        progress = 0;
        const animate = () => {
            progress += 5;
            draw();
            if (progress < 500) requestAnimationFrame(animate);
            else animating = false;
        };
        animate();
    });

    draw();
}

// --- 8. COMPILER (Translation Pipeline) ---
function initCompilerVisualizer() {
    const canvas = document.getElementById('compilerCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const runBtn = document.getElementById('compiler-run-btn');
    const resetBtn = document.getElementById('compiler-reset-btn');

    let phase = 0; // 0: Idle, 1: Lex, 2: AST, 3: Opt, 4: CodeGen
    let progress = 0;

    const stages = [
        { name: 'SOURCE', code: 'x = 5 + 3', color: '#fff' },
        { name: 'TOKENS', code: '[ID:x] [OP:=] [NUM:5] [OP:+] [NUM:3]', color: '#00ffff' },
        { name: 'AST', code: '(Assign x (Add 5 3))', color: '#ccff00' },
        { name: 'ASM', code: 'MOV R1, 5\nADD R1, 3\nSTR R1, [x]', color: '#ff3333' }
    ];

    function draw() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const stageW = 120;
        const spacing = (canvas.width - (stages.length * stageW)) / (stages.length + 1);

        stages.forEach((s, i) => {
            const x = spacing + i * (stageW + spacing);
            const y = 80;

            // Box
            ctx.strokeStyle = phase > i ? s.color : '#222';
            if (phase === i + 1) ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, stageW, 100);

            // Label
            ctx.fillStyle = ctx.strokeStyle;
            ctx.font = '10px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(s.name, x + stageW/2, y - 10);

            // Code snippet
            ctx.fillStyle = '#fff';
            ctx.font = '8px Courier New';
            const lines = s.code.split('\n');
            lines.forEach((line, li) => {
                ctx.fillText(line, x + stageW/2, y + 40 + li * 12);
            });

            // Arrow
            if (i < stages.length - 1) {
                ctx.strokeStyle = phase > i + 1 ? '#444' : '#111';
                ctx.beginPath();
                ctx.moveTo(x + stageW + 5, y + 50);
                ctx.lineTo(x + stageW + spacing - 5, y + 50);
                ctx.stroke();
            }
        });

        if (phase > 0 && phase <= stages.length) {
            // Draw "compiling" beam
            const activeX = spacing + (phase - 1) * (stageW + spacing) + stageW / 2;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.moveTo(activeX, 180);
            ctx.lineTo(activeX, 220);
            ctx.stroke();
        }
    }

    runBtn.addEventListener('click', () => {
        if (phase >= stages.length) return;
        const interval = setInterval(() => {
            phase++;
            draw();
            if (phase >= stages.length) clearInterval(interval);
        }, 800);
    });

    resetBtn.addEventListener('click', () => {
        phase = 0;
        draw();
    });

    draw();
}

// --- 7. INTERPRETER (AST / Execution lifecycle) ---
function initInterpreterVisualizer() {
    const canvas = document.getElementById('interpreterCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const stepBtn = document.getElementById('interpreter-step-btn');
    const resetBtn = document.getElementById('interpreter-reset-btn');
    const status = document.getElementById('interpreter-status');

    let phase = 0; // 0: Idle, 1: Lexing, 2: Parsing, 3: Evaluation
    const tokens = [
        { type: 'ID', val: 'x' }, { type: 'OP', val: '=' }, 
        { type: 'NUM', val: '8' }, { type: 'OP', val: '+' }, 
        { type: 'NUM', val: '4' }, { type: 'OP', val: '*' }, 
        { type: 'NUM', val: '2' }
    ];

    const ast = {
        type: 'Assign',
        left: 'x',
        right: {
            type: 'Add',
            left: '8',
            right: {
                type: 'Mul',
                left: '4',
                right: '2'
            }
        }
    };

    function draw() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (phase === 1) { // Lexing
            const startX = 50;
            tokens.forEach((t, i) => {
                const x = startX + i * 75;
                ctx.strokeStyle = '#00ffff';
                ctx.strokeRect(x, 100, 60, 40);
                ctx.fillStyle = '#fff';
                ctx.font = '12px Courier New';
                ctx.textAlign = 'center';
                ctx.fillText(t.type, x + 30, 115);
                ctx.fillStyle = '#00ffff';
                ctx.fillText(`"${t.val}"`, x + 30, 130);
            });
        } else if (phase >= 2) { // Parsing & Eval
            function drawNode(node, x, y, level) {
                ctx.beginPath();
                ctx.arc(x, y, 25, 0, Math.PI * 2);
                ctx.strokeStyle = phase === 3 && node.result ? '#ccff00' : '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.fillStyle = ctx.strokeStyle;
                ctx.font = '10px Courier New';
                ctx.textAlign = 'center';
                ctx.fillText(node.type || node, x, y + 5);

                if (node.left) {
                    ctx.beginPath();
                    ctx.moveTo(x - 15, y + 20);
                    ctx.lineTo(x - 50, y + 60);
                    ctx.stroke();
                    drawNode(node.left, x - 60, y + 80, level + 1);
                }
                if (node.right) {
                    ctx.beginPath();
                    ctx.moveTo(x + 15, y + 20);
                    ctx.lineTo(x + 50, y + 60);
                    ctx.stroke();
                    drawNode(node.right, x + 60, y + 80, level + 1);
                }

                if (phase === 3 && node.result) {
                    ctx.fillStyle = '#ccff00';
                    ctx.fillText(` -> ${node.result}`, x, y - 30);
                }
            }

            // Simple annotation for eval phase
            if (phase === 3) {
                ast.right.right.result = '8';
                ast.right.result = '16';
                ast.result = 'x = 16';
            }

            drawNode(ast, canvas.width / 2, 50, 0);
        }
    }

    stepBtn.addEventListener('click', () => {
        phase++;
        if (phase === 1) {
            status.innerText = "PHASE 1: Lexical Analysis (Tokens generated)";
        } else if (phase === 2) {
            status.innerText = "PHASE 2: Parsing (Abstract Syntax Tree built)";
        } else if (phase === 3) {
            status.innerText = "PHASE 3: Evaluation (Executing instructions)";
        } else {
            phase = 3;
        }
        draw();
    });

    resetBtn.addEventListener('click', () => {
        phase = 0;
        status.innerText = "Awaiting Source Code...";
        ast.result = null;
        ast.right.result = null;
        ast.right.right.result = null;
        draw();
    });

    draw();
}
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

// --- 5.5 P VERSUS NP (Sudoku Example) ---
function initPvsNPVisualizer() {
    const canvas = document.getElementById('pvnpCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const solveBtn = document.getElementById('pvnp-solve-btn');
    const verifyBtn = document.getElementById('pvnp-verify-btn');
    const resetBtn = document.getElementById('pvnp-reset-btn');

    let grid = [
        1, 0, 0, 0,
        0, 0, 2, 0,
        0, 3, 0, 0,
        0, 0, 0, 4
    ];
    let state = 'idle'; // 'idle', 'solving', 'verifying'

    function checkConstraints(g) {
        let errs = [];
        // Rows
        for (let r = 0; r < 4; r++) {
            let seen = new Set();
            for (let c = 0; c < 4; c++) {
                let val = g[r * 4 + c];
                if (val !== 0) {
                    if (seen.has(val)) errs.push({type:'row', idx:r});
                    seen.add(val);
                }
            }
        }
        // Cols
        for (let c = 0; c < 4; c++) {
            let seen = new Set();
            for (let r = 0; r < 4; r++) {
                let val = g[r * 4 + c];
                if (val !== 0) {
                    if (seen.has(val)) errs.push({type:'col', idx:c});
                    seen.add(val);
                }
            }
        }
        // Subgrids (2x2)
        for (let b = 0; b < 4; b++) {
            let seen = new Set();
            let startR = Math.floor(b / 2) * 2;
            let startC = (b % 2) * 2;
            for (let r = 0; r < 2; r++) {
                for (let c = 0; c < 2; c++) {
                    let val = g[(startR + r) * 4 + (startC + c)];
                    if (val !== 0) {
                        if (seen.has(val)) errs.push({type:'box', idx:b});
                        seen.add(val);
                    }
                }
            }
        }
        return errs;
    }

    function isPerfect(g) {
        if (g.includes(0)) return false;
        return checkConstraints(g).length === 0;
    }

    function draw() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cellSize = 60;
        const totalSize = 4 * cellSize;
        const startX = (canvas.width - totalSize) / 2;
        const startY = (canvas.height - totalSize) / 2 + 20;

        // Draw cells
        for (let i = 0; i < 16; i++) {
            const r = Math.floor(i / 4);
            const c = i % 4;
            const x = startX + c * cellSize;
            const y = startY + r * cellSize;

            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cellSize, cellSize);

            if (grid[i] !== 0) {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 24px Outfit';
                ctx.textAlign = 'center';
                ctx.fillText(grid[i], x + cellSize/2, y + cellSize/2 + 8);
            }
        }

        // Draw 2x2 borders
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(startX, startY, totalSize, totalSize);
        ctx.beginPath();
        ctx.moveTo(startX + 2 * cellSize, startY);
        ctx.lineTo(startX + 2 * cellSize, startY + totalSize);
        ctx.moveTo(startX, startY + 2 * cellSize);
        ctx.lineTo(startX + totalSize, startY + 2 * cellSize);
        ctx.stroke();

        if (state === 'verifying') {
            const perfect = isPerfect(grid);
            ctx.fillStyle = perfect ? '#ccff00' : '#ff3333';
            ctx.font = '20px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText(perfect ? 'SUDOKU VALID!' : 'CONSTRAINTS FAILED', canvas.width / 2, startY - 30);
        } else if (state === 'solving') {
            ctx.fillStyle = '#00ffff';
            ctx.font = '16px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('NP BACKTRACKING...', canvas.width / 2, startY - 30);
        }
    }

    solveBtn.addEventListener('click', () => {
        if (state === 'solving') return;
        
        // Initial check: is the current user setup even valid?
        const initialErrs = checkConstraints(grid);
        if (initialErrs.length > 0) {
            state = 'verifying';
            draw();
            setTimeout(() => { state = 'idle'; draw(); }, 2000);
            return;
        }

        const initialGrid = [...grid];
        state = 'solving';
        
        let solveIdx = 0;
        function backtrack() {
            if (state !== 'solving') return;
            
            // Skip cells that were already filled by the user
            while (solveIdx < 16 && initialGrid[solveIdx] !== 0) {
                solveIdx++;
            }

            if (solveIdx >= 16) {
                state = 'idle';
                draw();
                return;
            }
            
            let possible = [1, 2, 3, 4].sort(() => Math.random() - 0.5);
            let found = false;
            for (let val of possible) {
                grid[solveIdx] = val;
                if (checkConstraints(grid).length === 0) {
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                // If stuck, reset only the cells the solver filled and restart
                for(let i=0; i<16; i++) {
                    if (initialGrid[i] === 0) grid[i] = 0;
                }
                solveIdx = 0;
            } else {
                solveIdx++;
            }

            draw();
            setTimeout(() => requestAnimationFrame(backtrack), 50);
        }
        backtrack();
    });

    verifyBtn.addEventListener('click', () => {
        state = 'verifying';
        draw();
        setTimeout(() => { state = 'idle'; draw(); }, 2000);
    });

    resetBtn.addEventListener('click', () => {
        state = 'idle';
        grid = [
            1, 0, 0, 0,
            0, 0, 2, 0,
            0, 3, 0, 0,
            0, 0, 0, 4
        ];
        draw();
    });

    canvas.addEventListener('click', (e) => {
        if (state !== 'idle') return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const cellSize = 60;
        const totalSize = 4 * cellSize;
        const startX = (canvas.width - totalSize) / 2;
        const startY = (canvas.height - totalSize) / 2 + 20;

        for (let i = 0; i < 16; i++) {
            const r = Math.floor(i / 4);
            const c = i % 4;
            const x = startX + c * cellSize;
            const y = startY + r * cellSize;

            if (mouseX >= x && mouseX <= x + cellSize && mouseY >= y && mouseY <= y + cellSize) {
                grid[i] = (grid[i] % 4) + 1;
                draw();
                break;
            }
        }
    });

    draw();
}

// --- 5.7 HAMILTONIAN PATH (Knight's Tour) ---
function initKnightsTourVisualizer() {
    const canvas = document.getElementById('knightsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const solveBtn = document.getElementById('knights-solve-btn');
    const resetBtn = document.getElementById('knights-reset-btn');

    if (!solveBtn || !resetBtn) return;

    const size = 5;
    let cellSize = canvas.width / size;
    let board = Array(size * size).fill(-1);
    let currentPos = { r: -1, c: -1 };
    let stepCount = 0;
    let isSolving = false;
    let solveInterval = null;

    function getMoves(r, c) {
        const moves = [
            {r: r-2, c: c-1}, {r: r-2, c: c+1},
            {r: r-1, c: c-2}, {r: r-1, c: c+2},
            {r: r+1, c: c-2}, {r: r+1, c: c+2},
            {r: r+2, c: c-1}, {r: r+2, c: c+1}
        ];
        return moves.filter(m => m.r >= 0 && m.r < size && m.c >= 0 && m.c < size);
    }

    function draw() {
        cellSize = canvas.width / size;
        ctx.fillStyle = '#0f0f0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const x = c * cellSize;
                const y = r * cellSize;
                
                ctx.fillStyle = (r + c) % 2 === 0 ? '#1a1a1a' : '#111';
                if (board[r * size + c] !== -1) ctx.fillStyle = '#003333';
                if (r === currentPos.r && c === currentPos.c) ctx.fillStyle = '#00ffff';
                
                ctx.fillRect(x, y, cellSize, cellSize);
                ctx.strokeStyle = '#222';
                ctx.strokeRect(x, y, cellSize, cellSize);

                if (board[r * size + c] !== -1) {
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 20px Outfit, sans-serif';
                    ctx.textAlign = 'center';
                    const num = board[r * size + c] + 1;
                    ctx.fillText(num, x + cellSize/2, y + cellSize/2 + 8);
                }
            }
        }

        if (currentPos.r !== -1) {
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffff';
            ctx.font = '44px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('♞', currentPos.c * cellSize + cellSize/2, currentPos.r * cellSize + cellSize/2 + 15);
            ctx.shadowBlur = 0;
        }
    }

    function findSolution() {
        // Fast Warnsdorff's solver (non-async)
        const startR = 0; // Fixed start for 5x5 consistency
        const startC = 0;
        const tempBoard = Array(size * size).fill(-1);
        const path = [];

        function backtrack(r, c, step) {
            tempBoard[r * size + c] = step;
            path.push({r, c});
            if (step === size * size - 1) return true;

            const moves = getMoves(r, c).filter(m => tempBoard[m.r * size + m.c] === -1);
            moves.sort((a, b) => {
                const countA = getMoves(a.r, a.c).filter(m => tempBoard[m.r * size + m.c] === -1).length;
                const countB = getMoves(b.r, b.c).filter(m => tempBoard[m.r * size + m.c] === -1).length;
                return countA - countB;
            });

            for (const m of moves) {
                if (backtrack(m.r, m.c, step + 1)) return true;
            }

            tempBoard[r * size + c] = -1;
            path.pop();
            return false;
        }

        if (backtrack(startR, startC, 0)) return path;
        return null;
    }

    function solve() {
        if (isSolving) {
            stopSolving();
            return;
        }

        const path = findSolution();
        if (!path) return;

        reset();
        isSolving = true;
        solveBtn.innerText = 'STOP SOLVING';
        
        let step = 0;
        solveInterval = setInterval(() => {
            if (step >= path.length) {
                stopSolving(true);
                return;
            }
            const pos = path[step];
            board[pos.r * size + pos.c] = step;
            currentPos = pos;
            draw();
            step++;
        }, 150);
    }

    function stopSolving(complete = false) {
        isSolving = false;
        if (solveInterval) clearInterval(solveInterval);
        solveInterval = null;
        solveBtn.innerText = complete ? 'TOUR COMPLETE!' : 'ANIMATE SOLVE';
        if (complete) {
            setTimeout(() => { if (!isSolving) solveBtn.innerText = 'ANIMATE SOLVE'; }, 3000);
        }
    }

    function reset() {
        stopSolving();
        board = Array(size * size).fill(-1);
        currentPos = { r: -1, c: -1 };
        stepCount = 0;
        draw();
    }

    canvas.addEventListener('click', (e) => {
        if (isSolving) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        const c = Math.floor(mouseX / cellSize);
        const r = Math.floor(mouseY / cellSize);

        if (r < 0 || r >= size || c < 0 || c >= size) return;

        if (stepCount === 0) {
            board[r * size + c] = stepCount++;
            currentPos = { r, c };
        } else {
            const moves = getMoves(currentPos.r, currentPos.c);
            if (moves.some(m => m.r === r && m.c === c) && board[r * size + c] === -1) {
                board[r * size + c] = stepCount++;
                currentPos = { r, c };
            }
        }
        draw();
    });

    solveBtn.addEventListener('click', solve);
    resetBtn.addEventListener('click', reset);

    draw();
}

// --- 4. THE MEMORY PALACE (RAM) ---
function initRAMVisualizer() {
    const canvas = document.getElementById('ramCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const addrInput = document.getElementById('ram-addr');
    const dataInput = document.getElementById('ram-data');
    const writeBtn = document.getElementById('ram-write-btn');
    const readBtn = document.getElementById('ram-read-btn');
    const cpuReg = document.getElementById('cpu-reg');

    const rows = 8;
    const cols = 8;
    const cellSize = canvas.width / cols;
    const cellHeight = canvas.height / rows;
    
    let memory = new Array(rows * cols).fill(0);
    let activeCell = -1;
    let animation = null;

    function draw() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < memory.length; i++) {
            const r = Math.floor(i / cols);
            const c = i % cols;
            const x = c * cellSize;
            const y = r * cellHeight;

            // Cell background
            ctx.fillStyle = (i === activeCell) ? 'rgba(0, 255, 255, 0.2)' : '#000';
            ctx.fillRect(x + 2, y + 2, cellSize - 4, cellHeight - 4);
            
            // Border
            ctx.strokeStyle = (i === activeCell) ? '#00ffff' : '#222';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellHeight - 4);

            // Address (Hex)
            ctx.fillStyle = '#444';
            ctx.font = '8px Courier New';
            ctx.textAlign = 'left';
            ctx.fillText('0x' + i.toString(16).toUpperCase().padStart(2, '0'), x + 6, y + 12);

            // Value (Dec/Hex)
            ctx.fillStyle = memory[i] > 0 ? '#ccff00' : '#888';
            ctx.font = '12px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(memory[i].toString(16).toUpperCase().padStart(2, '0'), x + cellSize/2, y + cellHeight/2 + 5);
        }

        if (animation) {
            ctx.fillStyle = animation.color;
            ctx.beginPath();
            ctx.arc(animation.x, animation.y, 10, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    function animate(startX, startY, endX, endY, color, callback) {
        const duration = 500;
        const startTime = performance.now();

        function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            animation = {
                x: startX + (endX - startX) * progress,
                y: startY + (endY - startY) * progress,
                color: color
            };
            draw();

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                animation = null;
                callback();
                draw();
            }
        }
        requestAnimationFrame(step);
    }

    writeBtn.addEventListener('click', () => {
        const addr = parseInt(addrInput.value, 16);
        const data = parseInt(dataInput.value);

        if (isNaN(addr) || addr < 0 || addr >= memory.length) {
            alert('Invalid Address (0x00 - 0x3F)');
            return;
        }
        if (isNaN(data) || data < 0 || data > 255) {
            alert('Invalid Data (0 - 255)');
            return;
        }

        activeCell = addr;
        const r = Math.floor(addr / cols);
        const c = addr % cols;
        const targetX = c * cellSize + cellSize / 2;
        const targetY = r * cellHeight + cellHeight / 2;

        animate(canvas.width + 50, canvas.height / 2, targetX, targetY, '#ccff00', () => {
            memory[addr] = data;
            activeCell = -1;
        });
    });

    readBtn.addEventListener('click', () => {
        const addr = parseInt(addrInput.value, 16);
        if (isNaN(addr) || addr < 0 || addr >= memory.length) {
            alert('Invalid Address (0x00 - 0x3F)');
            return;
        }

        activeCell = addr;
        const r = Math.floor(addr / cols);
        const c = addr % cols;
        const startX = c * cellSize + cellSize / 2;
        const startY = r * cellHeight + cellHeight / 2;

        animate(startX, startY, canvas.width + 50, canvas.height / 2, '#00ffff', () => {
            const val = memory[addr].toString(16).toUpperCase().padStart(2, '0');
            cpuReg.innerText = val;
            activeCell = -1;
        });
    });

    draw();
}

// --- 2. THE SILICON SWITCH (TRANSISTORS) ---
function initTransistorVisualizer() {
    const canvas = document.getElementById('transistorCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const toggleBtn = document.getElementById('transistor-toggle-btn');
    const autoBtn = document.getElementById('transistor-auto-btn');

    let gateOn = false;
    let autoInterval = null;
    let electrons = [];
    let animId = null;

    // Create electron particles
    function resetElectrons() {
        electrons = [];
        for (let i = 0; i < 12; i++) {
            electrons.push({
                x: 80 + Math.random() * 80,
                y: 200 + (Math.random() - 0.5) * 30,
                speed: 1.5 + Math.random() * 2,
                size: 3 + Math.random() * 2
            });
        }
    }
    resetElectrons();

    function draw() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = 180;

        // --- Silicon substrate ---
        ctx.fillStyle = '#111';
        ctx.fillRect(100, cy - 10, 400, 60);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(100, cy - 10, 400, 60);

        // Label substrate
        ctx.fillStyle = '#444';
        ctx.font = '10px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('SILICON SUBSTRATE', cx, cy + 70);

        // --- Source terminal (left) ---
        ctx.fillStyle = '#0088ff';
        ctx.fillRect(110, cy - 40, 80, 35);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('SOURCE', 150, cy - 18);

        // Source wire going up
        ctx.strokeStyle = '#0088ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(150, cy - 40);
        ctx.lineTo(150, cy - 70);
        ctx.stroke();

        // --- Drain terminal (right) ---
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(410, cy - 40, 80, 35);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('DRAIN', 450, cy - 18);

        // Drain wire going up
        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(450, cy - 40);
        ctx.lineTo(450, cy - 70);
        ctx.stroke();

        // --- Gate terminal (top center) ---
        const gateColor = gateOn ? '#ccff00' : '#333';
        ctx.fillStyle = gateColor;
        ctx.fillRect(cx - 50, cy - 80, 100, 30);
        ctx.fillStyle = gateOn ? '#000' : '#888';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('GATE', cx, cy - 60);

        // Gate wire going up
        ctx.strokeStyle = gateColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 80);
        ctx.lineTo(cx, cy - 110);
        ctx.stroke();

        // Gate voltage label
        ctx.fillStyle = gateOn ? '#ccff00' : '#666';
        ctx.font = '11px Courier New';
        ctx.fillText(gateOn ? 'V_G = HIGH' : 'V_G = LOW', cx, cy - 118);

        // --- Oxide layer (thin insulator below gate) ---
        ctx.fillStyle = '#222';
        ctx.fillRect(cx - 50, cy - 50, 100, 8);
        ctx.fillStyle = '#555';
        ctx.font = '8px Courier New';
        ctx.fillText('OXIDE', cx, cy - 44);

        // --- Channel region ---
        if (gateOn) {
            // Draw conductive channel
            ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
            ctx.fillRect(190, cy - 5, 220, 20);
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(190, cy - 5, 220, 20);
            ctx.setLineDash([]);

            ctx.fillStyle = '#00ffff';
            ctx.font = '9px Courier New';
            ctx.fillText('CHANNEL OPEN', cx, cy + 30);
        } else {
            ctx.fillStyle = '#ff3333';
            ctx.font = '9px Courier New';
            ctx.fillText('CHANNEL CLOSED', cx, cy + 30);

            // Draw barrier
            ctx.strokeStyle = '#ff3333';
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(cx, cy - 8);
            ctx.lineTo(cx, cy + 48);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // --- Electron particles ---
        electrons.forEach(e => {
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
            ctx.fillStyle = gateOn ? '#00ffff' : '#0066aa';
            ctx.fill();
            ctx.strokeStyle = gateOn ? 'rgba(0,255,255,0.5)' : 'transparent';
            ctx.lineWidth = 1;
            ctx.stroke();

            // "e-" label on larger particles
            if (e.size > 4) {
                ctx.fillStyle = '#000';
                ctx.font = '6px Courier New';
                ctx.textAlign = 'center';
                ctx.fillText('e⁻', e.x, e.y + 2);
            }
        });

        // --- Output bit indicator ---
        ctx.fillStyle = gateOn ? '#ccff00' : '#333';
        ctx.font = '28px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(gateOn ? 'BIT = 1' : 'BIT = 0', cx, canvas.height - 30);

        // Glow effect around the bit text when ON
        if (gateOn) {
            ctx.shadowColor = '#ccff00';
            ctx.shadowBlur = 20;
            ctx.fillText(gateOn ? 'BIT = 1' : 'BIT = 0', cx, canvas.height - 30);
            ctx.shadowBlur = 0;
        }
    }

    function animate() {
        if (gateOn) {
            electrons.forEach(e => {
                e.x += e.speed;
                if (e.x > 490) {
                    e.x = 110;
                    e.y = 200 + (Math.random() - 0.5) * 30;
                }
            });
        } else {
            // Jitter electrons in the source region
            electrons.forEach(e => {
                if (e.x > 200) e.x -= 2;
                e.x += (Math.random() - 0.5) * 1.5;
                e.y += (Math.random() - 0.5) * 1.5;
                e.x = Math.max(100, Math.min(190, e.x));
                e.y = Math.max(175, Math.min(225, e.y));
            });
        }
        draw();
        animId = requestAnimationFrame(animate);
    }

    toggleBtn.addEventListener('click', () => {
        gateOn = !gateOn;
        toggleBtn.innerText = `GATE VOLTAGE: ${gateOn ? 'ON' : 'OFF'}`;
    });

    autoBtn.addEventListener('click', () => {
        if (autoInterval) {
            clearInterval(autoInterval);
            autoInterval = null;
            autoBtn.innerText = 'AUTO SWITCH';
        } else {
            autoInterval = setInterval(() => {
                gateOn = !gateOn;
                toggleBtn.innerText = `GATE VOLTAGE: ${gateOn ? 'ON' : 'OFF'}`;
            }, 1500);
            autoBtn.innerText = 'STOP AUTO';
        }
    });

    animate();
}

// --- 6. THE CONDUCTOR (OPERATING SYSTEMS) ---
function initOSVisualizer() {
    const canvas = document.getElementById('osCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rrBtn = document.getElementById('os-rr-btn');
    const prBtn = document.getElementById('os-priority-btn');
    const addBtn = document.getElementById('os-add-btn');
    const resetBtn = document.getElementById('os-reset-btn');

    const COLORS = ['#00ffff', '#ccff00', '#ff3333', '#ff00ff', '#0088ff', '#ffa500', '#00ff88', '#ff6699'];
    const NAMES = ['Browser', 'Editor', 'Music', 'Backup', 'Mail', 'Terminal', 'Sync', 'Render'];
    let nextPid = 1;
    let readyQueue = [];
    let completed = [];
    let cpuProcess = null;
    let cpuProgress = 0;
    let mode = null;
    let animId = null;
    let quantum = 20;
    let tickCount = 0;
    let statusMsg = 'Scheduler idle. Choose a scheduling algorithm.';

    function makeProcess() {
        const pid = nextPid++;
        return {
            pid,
            name: NAMES[(pid - 1) % NAMES.length],
            color: COLORS[(pid - 1) % COLORS.length],
            burst: 30 + Math.floor(Math.random() * 70),
            remaining: 0,
            priority: Math.floor(Math.random() * 5) + 1
        };
    }

    function initProcesses() {
        nextPid = 1;
        readyQueue = [];
        completed = [];
        cpuProcess = null;
        cpuProgress = 0;
        tickCount = 0;
        mode = null;
        statusMsg = 'Scheduler idle. Choose a scheduling algorithm.';
        for (let i = 0; i < 4; i++) {
            const p = makeProcess();
            p.remaining = p.burst;
            readyQueue.push(p);
        }
    }

    function draw() {
        const W = canvas.width;
        const H = canvas.height;
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, W, H);

        const queueX = 20;
        const queueW = 170;
        const cpuX = 230;
        const cpuW = 200;
        const doneX = 475;
        const doneW = 210;
        const headerY = 20;
        const bodyY = 50;

        // ---- Ready Queue Column ----
        ctx.fillStyle = '#888';
        ctx.font = '11px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('READY QUEUE', queueX + queueW / 2, headerY);

        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        ctx.strokeRect(queueX, bodyY, queueW, H - bodyY - 40);

        readyQueue.forEach((p, i) => {
            const bx = queueX + 10;
            const by = bodyY + 10 + i * 46;
            if (by + 40 > H - 40) return;

            ctx.fillStyle = p.color + '22';
            ctx.fillRect(bx, by, queueW - 20, 38);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1;
            ctx.strokeRect(bx, by, queueW - 20, 38);

            ctx.fillStyle = p.color;
            ctx.font = '10px Courier New';
            ctx.textAlign = 'left';
            ctx.fillText(`P${p.pid} ${p.name}`, bx + 6, by + 14);

            ctx.fillStyle = '#888';
            ctx.font = '9px Courier New';
            ctx.textAlign = 'right';
            ctx.fillText(`PRI:${p.priority}`, bx + queueW - 26, by + 14);

            ctx.fillStyle = '#111';
            ctx.fillRect(bx + 6, by + 22, queueW - 32, 8);

            const pct = 1 - (p.remaining / p.burst);
            ctx.fillStyle = p.color;
            ctx.fillRect(bx + 6, by + 22, (queueW - 32) * pct, 8);

            ctx.fillStyle = '#666';
            ctx.font = '8px Courier New';
            ctx.textAlign = 'left';
            ctx.fillText(`${p.remaining}/${p.burst}`, bx + 6, by + 36);
        });

        // ---- CPU Core Column ----
        ctx.fillStyle = '#888';
        ctx.font = '11px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('CPU CORE', cpuX + cpuW / 2, headerY);

        const cpuActive = cpuProcess !== null;
        ctx.strokeStyle = cpuActive ? '#00ffff' : '#222';
        ctx.lineWidth = cpuActive ? 2 : 1;
        ctx.strokeRect(cpuX, bodyY, cpuW, H - bodyY - 40);

        if (cpuActive) {
            ctx.shadowColor = cpuProcess.color;
            ctx.shadowBlur = 15;
            ctx.fillStyle = cpuProcess.color + '11';
            ctx.fillRect(cpuX + 1, bodyY + 1, cpuW - 2, H - bodyY - 42);
            ctx.shadowBlur = 0;

            ctx.fillStyle = cpuProcess.color;
            ctx.font = 'bold 16px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(`P${cpuProcess.pid}`, cpuX + cpuW / 2, bodyY + 60);

            ctx.font = '12px Courier New';
            ctx.fillText(cpuProcess.name, cpuX + cpuW / 2, bodyY + 82);

            const cx = cpuX + cpuW / 2;
            const cy = bodyY + 150;
            const radius = 45;
            const pct = 1 - (cpuProcess.remaining / cpuProcess.burst);

            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 8;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
            ctx.strokeStyle = cpuProcess.color;
            ctx.lineWidth = 8;
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px Courier New';
            ctx.fillText(Math.round(pct * 100) + '%', cx, cy + 6);

            ctx.fillStyle = '#444';
            ctx.font = '10px Courier New';
            ctx.fillText(mode === 'rr' ? `QUANTUM: ${quantum}t` : `PRI: ${cpuProcess.priority}`, cpuX + cpuW / 2, bodyY + 220);
        } else {
            ctx.fillStyle = '#222';
            ctx.font = '12px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('IDLE', cpuX + cpuW / 2, bodyY + 130);
        }

        // ---- Completed Column ----
        ctx.fillStyle = '#888';
        ctx.font = '11px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('COMPLETED', doneX + doneW / 2, headerY);

        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        ctx.strokeRect(doneX, bodyY, doneW, H - bodyY - 40);

        completed.forEach((p, i) => {
            const bx = doneX + 10;
            const by = bodyY + 10 + i * 30;
            if (by + 24 > H - 40) return;

            ctx.fillStyle = p.color + '33';
            ctx.fillRect(bx, by, doneW - 20, 22);
            ctx.strokeStyle = p.color + '66';
            ctx.strokeRect(bx, by, doneW - 20, 22);

            ctx.fillStyle = p.color;
            ctx.font = '10px Courier New';
            ctx.textAlign = 'left';
            ctx.fillText(`P${p.pid} ${p.name} \u2014 ${p.burst}t \u2713`, bx + 6, by + 15);
        });

        // ---- Arrows ----
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        const arrowY = bodyY + (H - bodyY - 40) / 2;

        ctx.beginPath();
        ctx.moveTo(queueX + queueW + 5, arrowY);
        ctx.lineTo(cpuX - 5, arrowY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cpuX + cpuW + 5, arrowY);
        ctx.lineTo(doneX - 5, arrowY);
        ctx.stroke();

        ctx.setLineDash([]);

        drawArrow(cpuX - 5, arrowY, 8);
        drawArrow(doneX - 5, arrowY, 8);

        // ---- Status bar ----
        ctx.fillStyle = '#111';
        ctx.fillRect(0, H - 30, W, 30);
        ctx.fillStyle = '#00ffff';
        ctx.font = '10px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(statusMsg, W / 2, H - 12);
    }

    function drawArrow(x, y, size) {
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - size, y - size / 2);
        ctx.lineTo(x - size, y + size / 2);
        ctx.closePath();
        ctx.fill();
    }

    function tick() {
        if (!mode) return;
        if (readyQueue.length === 0 && cpuProcess === null) {
            stopScheduler();
            statusMsg = 'All processes completed.';
            draw();
            return;
        }

        tickCount++;

        if (cpuProcess === null && readyQueue.length > 0) {
            if (mode === 'priority') {
                readyQueue.sort((a, b) => a.priority - b.priority);
            }
            cpuProcess = readyQueue.shift();
            cpuProgress = 0;
            statusMsg = `[${mode.toUpperCase()}] Dispatching P${cpuProcess.pid} (${cpuProcess.name})`;
        }

        if (cpuProcess) {
            cpuProcess.remaining--;
            cpuProgress++;

            if (cpuProcess.remaining <= 0) {
                statusMsg = `P${cpuProcess.pid} (${cpuProcess.name}) completed!`;
                completed.push(cpuProcess);
                cpuProcess = null;
                cpuProgress = 0;
            } else if (mode === 'rr' && cpuProgress >= quantum) {
                statusMsg = `Quantum expired \u2014 preempting P${cpuProcess.pid}`;
                readyQueue.push(cpuProcess);
                cpuProcess = null;
                cpuProgress = 0;
            }
        }

        draw();
        animId = setTimeout(tick, 60);
    }

    function stopScheduler() {
        if (animId) { clearTimeout(animId); animId = null; }
    }

    function startScheduler(newMode) {
        stopScheduler();
        mode = newMode;
        statusMsg = `Starting ${mode === 'rr' ? 'Round Robin' : 'Priority'} scheduler...`;
        draw();
        animId = setTimeout(tick, 300);
    }

    rrBtn.addEventListener('click', () => {
        if (readyQueue.length === 0 && cpuProcess === null) initProcesses();
        startScheduler('rr');
    });

    prBtn.addEventListener('click', () => {
        if (readyQueue.length === 0 && cpuProcess === null) initProcesses();
        startScheduler('priority');
    });

    addBtn.addEventListener('click', () => {
        if (readyQueue.length + completed.length + (cpuProcess ? 1 : 0) >= 8) return;
        const p = makeProcess();
        p.remaining = p.burst;
        readyQueue.push(p);
        statusMsg = `Added P${p.pid} (${p.name}) to ready queue.`;
        draw();
    });

    resetBtn.addEventListener('click', () => {
        stopScheduler();
        initProcesses();
        draw();
    });

    initProcesses();
    draw();
}

// --- 7. THE HEART OF THE MACHINE (THE KERNEL) ---
function initKernelVisualizer() {
    const canvas = document.getElementById('kernelCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const openBtn = document.getElementById('kernel-open-btn');
    const readBtn = document.getElementById('kernel-read-btn');
    const writeBtn = document.getElementById('kernel-write-btn');
    const mallocBtn = document.getElementById('kernel-malloc-btn');
    const resetBtn = document.getElementById('kernel-reset-btn');

    const W = canvas.width;
    const H = canvas.height;

    // Layer layout (top → bottom)
    const layers = [
        { name: 'USER SPACE', y: 0, h: 60, color: '#0088ff', bg: 'rgba(0,136,255,0.06)' },
        { name: 'SYSCALL INTERFACE', y: 70, h: 30, color: '#ffa500', bg: 'rgba(255,165,0,0.06)' },
        { name: 'KERNEL SPACE', y: 110, h: 140, color: '#ff3333', bg: 'rgba(255,51,51,0.05)' },
        { name: 'HARDWARE', y: 265, h: 55, color: '#ccff00', bg: 'rgba(204,255,0,0.06)' }
    ];

    const subsystems = [
        { name: 'File System', x: 30, w: 140, color: '#00ffff' },
        { name: 'Memory Mgr', x: 190, w: 140, color: '#ccff00' },
        { name: 'Net Stack', x: 350, w: 140, color: '#ff00ff' },
        { name: 'Device Drivers', x: 510, w: 160, color: '#ffa500' }
    ];

    const SYSCALLS = {
        'open':   { label: 'open("/data")',   subsystem: 0, result: 'fd=3',        hwLabel: 'DISK I/O' },
        'read':   { label: 'read(fd, buf)',   subsystem: 0, result: '128 bytes',   hwLabel: 'DISK I/O' },
        'write':  { label: 'write(fd, buf)',  subsystem: 0, result: 'OK',          hwLabel: 'DISK I/O' },
        'malloc': { label: 'malloc(4096)',    subsystem: 1, result: '0x7fA0',      hwLabel: 'DRAM' }
    };

    let packets = [];    // animated syscall packets
    let logLines = [];   // status log

    function addLog(msg) {
        logLines.push(msg);
        if (logLines.length > 4) logLines.shift();
    }

    function draw() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, W, H);

        // Draw layers
        layers.forEach(l => {
            ctx.fillStyle = l.bg;
            ctx.fillRect(0, l.y, W, l.h);
            ctx.strokeStyle = l.color + '44';
            ctx.lineWidth = 1;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(0, l.y);
            ctx.lineTo(W, l.y);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = l.color;
            ctx.font = '10px Courier New';
            ctx.textAlign = 'right';
            ctx.fillText(l.name, W - 10, l.y + 16);
        });

        // Draw privilege boundary (thick line between user and kernel)
        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(0, layers[1].y + layers[1].h);
        ctx.lineTo(W, layers[1].y + layers[1].h);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#ff3333';
        ctx.font = '9px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText('\u25bc PRIVILEGE BOUNDARY \u25bc', 10, layers[1].y + layers[1].h + 12);

        // Draw kernel subsystem boxes
        subsystems.forEach(s => {
            const sy = layers[2].y + 30;
            const sh = layers[2].h - 50;

            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(s.x, sy, s.w, sh);
            ctx.strokeStyle = s.color + '66';
            ctx.lineWidth = 1;
            ctx.strokeRect(s.x, sy, s.w, sh);

            ctx.fillStyle = s.color;
            ctx.font = '10px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(s.name, s.x + s.w / 2, sy + sh / 2 + 4);
        });

        // Draw hardware components
        const hwY = layers[3].y + 10;
        ['CPU', 'DRAM', 'DISK', 'NIC'].forEach((name, i) => {
            const hx = 60 + i * 170;
            ctx.fillStyle = '#111';
            ctx.fillRect(hx, hwY, 80, 30);
            ctx.strokeStyle = '#ccff0066';
            ctx.strokeRect(hx, hwY, 80, 30);
            ctx.fillStyle = '#ccff00';
            ctx.font = '10px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(name, hx + 40, hwY + 19);
        });

        // Draw packets
        packets.forEach(p => {
            // Glow
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 12;

            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;

            // Label
            ctx.fillStyle = '#fff';
            ctx.font = '9px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(p.label, p.x, p.y - 14);
        });

        // Draw log
        ctx.fillStyle = '#111';
        ctx.fillRect(0, H - 35, W, 35);
        logLines.forEach((msg, i) => {
            ctx.fillStyle = i === logLines.length - 1 ? '#00ffff' : '#444';
            ctx.font = '9px Courier New';
            ctx.textAlign = 'left';
            ctx.fillText('> ' + msg, 10, H - 22 + i * 0);
        });
        if (logLines.length > 0) {
            ctx.fillStyle = '#00ffff';
            ctx.font = '10px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(logLines[logLines.length - 1], W / 2, H - 12);
        }
    }

    function animatePacket(syscallKey) {
        const sc = SYSCALLS[syscallKey];
        const sub = subsystems[sc.subsystem];
        const packetX = sub.x + sub.w / 2;

        // Waypoints: user space → syscall → kernel subsystem → hardware → return
        const waypoints = [
            { x: packetX, y: 30, label: sc.label, color: '#0088ff' },
            { x: packetX, y: layers[1].y + 15, label: sc.label, color: '#ffa500' },
            { x: packetX, y: layers[2].y + 30 + (layers[2].h - 50) / 2, label: sc.label, color: sub.color },
            { x: packetX, y: layers[3].y + 25, label: sc.hwLabel, color: '#ccff00' },
            // Return journey
            { x: packetX, y: layers[2].y + 30 + (layers[2].h - 50) / 2, label: sc.result, color: sub.color },
            { x: packetX, y: layers[1].y + 15, label: sc.result, color: '#ffa500' },
            { x: packetX, y: 30, label: sc.result, color: '#0088ff' }
        ];

        const logMessages = [
            `User calls ${sc.label}`,
            `Trapped into syscall interface`,
            `Kernel: routing to ${sub.name}`,
            `${sub.name} \u2192 ${sc.hwLabel}`,
            `Hardware returns \u2192 ${sub.name}`,
            `Kernel returns result: ${sc.result}`,
            `${sc.label} \u2192 ${sc.result} (complete)`
        ];

        let step = 0;
        const packet = { x: waypoints[0].x, y: waypoints[0].y, label: waypoints[0].label, color: waypoints[0].color };
        packets.push(packet);

        function animStep() {
            if (step >= waypoints.length - 1) {
                packets.splice(packets.indexOf(packet), 1);
                draw();
                return;
            }

            const from = waypoints[step];
            const to = waypoints[step + 1];
            addLog(logMessages[step]);
            const duration = 400;
            const startTime = performance.now();

            function frame(now) {
                const t = Math.min((now - startTime) / duration, 1);
                const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                packet.x = from.x + (to.x - from.x) * ease;
                packet.y = from.y + (to.y - from.y) * ease;
                packet.label = to.label;
                packet.color = to.color;
                draw();

                if (t < 1) {
                    requestAnimationFrame(frame);
                } else {
                    step++;
                    setTimeout(animStep, 150);
                }
            }
            requestAnimationFrame(frame);
        }

        animStep();
    }

    openBtn.addEventListener('click', () => animatePacket('open'));
    readBtn.addEventListener('click', () => animatePacket('read'));
    writeBtn.addEventListener('click', () => animatePacket('write'));
    mallocBtn.addEventListener('click', () => animatePacket('malloc'));

    resetBtn.addEventListener('click', () => {
        packets = [];
        logLines = [];
        draw();
    });

    draw();
}

// --- 14. THE UNIVERSAL BACKBONE (LLVM) ---
function initLLVMVisualizer() {
    const canvas = document.getElementById('llvmCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cBtn = document.getElementById('llvm-c-btn');
    const rustBtn = document.getElementById('llvm-rust-btn');
    const swiftBtn = document.getElementById('llvm-swift-btn');
    const resetBtn = document.getElementById('llvm-reset-btn');

    const W = canvas.width;
    const H = canvas.height;

    const LANGS = {
        C:     { color: '#0088ff', snippet: 'int x = a + b;',     ir: '%x = add i32 %a, %b' },
        RUST:  { color: '#ff3333', snippet: 'let x = a + b;',     ir: '%x = add i32 %a, %b' },
        SWIFT: { color: '#ffa500', snippet: 'var x = a + b',      ir: '%x = add i32 %a, %b' }
    };

    const TARGETS = [
        { name: 'x86_64',  asm: 'ADD EAX, EBX',   color: '#00ffff' },
        { name: 'ARM64',   asm: 'ADD W0, W1, W2',  color: '#ccff00' },
        { name: 'RISC-V',  asm: 'add a0, a1, a2',  color: '#ff00ff' }
    ];

    let activeLang = null;
    let phase = 0;       // 0: idle, 1: frontend, 2: IR, 3: optimizer, 4: backends
    let animId = null;
    let particleProgress = 0;

    // Layout
    const COL_FRONT = 40;
    const COL_IR    = 240;
    const COL_OPT   = 390;
    const COL_BACK  = 540;
    const BOX_W     = 130;
    const BOX_H     = 45;

    function draw() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, W, H);

        // --- Column headers ---
        ctx.font = '10px Courier New';
        ctx.textAlign = 'center';

        const headers = [
            { x: COL_FRONT + BOX_W / 2, label: 'FRONT-ENDS', color: '#888' },
            { x: COL_IR + BOX_W / 2,    label: 'LLVM IR',     color: '#ffa500' },
            { x: COL_OPT + BOX_W / 2,   label: 'OPTIMIZER',   color: '#ccff00' },
            { x: COL_BACK + BOX_W / 2,  label: 'BACK-ENDS',   color: '#888' }
        ];
        headers.forEach(h => {
            ctx.fillStyle = h.color;
            ctx.fillText(h.label, h.x, 22);
        });

        // --- Front-end boxes (source languages) ---
        const langKeys = Object.keys(LANGS);
        langKeys.forEach((key, i) => {
            const lang = LANGS[key];
            const y = 40 + i * 65;
            const isActive = activeLang === key;

            ctx.fillStyle = isActive ? lang.color + '22' : '#0a0a0a';
            ctx.fillRect(COL_FRONT, y, BOX_W, BOX_H);
            ctx.strokeStyle = isActive ? lang.color : '#222';
            ctx.lineWidth = isActive ? 2 : 1;
            ctx.strokeRect(COL_FRONT, y, BOX_W, BOX_H);

            ctx.fillStyle = isActive ? lang.color : '#555';
            ctx.font = 'bold 12px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(key, COL_FRONT + BOX_W / 2, y + 18);

            ctx.font = '8px Courier New';
            ctx.fillStyle = isActive ? '#fff' : '#444';
            ctx.fillText(lang.snippet, COL_FRONT + BOX_W / 2, y + 34);
        });

        // --- IR box (middle) ---
        const irY = 40 + 65;
        const irActive = phase >= 2;
        ctx.fillStyle = irActive ? 'rgba(255,165,0,0.08)' : '#0a0a0a';
        ctx.fillRect(COL_IR, irY - 20, BOX_W, BOX_H + 40);
        ctx.strokeStyle = irActive ? '#ffa500' : '#222';
        ctx.lineWidth = irActive ? 2 : 1;
        ctx.strokeRect(COL_IR, irY - 20, BOX_W, BOX_H + 40);

        ctx.fillStyle = irActive ? '#ffa500' : '#555';
        ctx.font = 'bold 12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('LLVM IR', COL_IR + BOX_W / 2, irY + 5);

        if (irActive && activeLang) {
            ctx.font = '8px Courier New';
            ctx.fillStyle = '#fff';
            ctx.fillText(LANGS[activeLang].ir, COL_IR + BOX_W / 2, irY + 22);
        }

        // --- Optimizer box ---
        const optY = irY - 10;
        const optActive = phase >= 3;
        ctx.fillStyle = optActive ? 'rgba(204,255,0,0.06)' : '#0a0a0a';
        ctx.fillRect(COL_OPT, optY, BOX_W, BOX_H + 20);
        ctx.strokeStyle = optActive ? '#ccff00' : '#222';
        ctx.lineWidth = optActive ? 2 : 1;
        ctx.strokeRect(COL_OPT, optY, BOX_W, BOX_H + 20);

        ctx.fillStyle = optActive ? '#ccff00' : '#555';
        ctx.font = 'bold 11px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('PASS MANAGER', COL_OPT + BOX_W / 2, optY + 20);

        if (optActive) {
            ctx.font = '8px Courier New';
            ctx.fillStyle = '#888';
            ctx.fillText('DCE → Inline → Reg Alloc', COL_OPT + BOX_W / 2, optY + 38);
        }

        // --- Back-end boxes (targets) ---
        TARGETS.forEach((t, i) => {
            const y = 40 + i * 65;
            const tActive = phase >= 4;

            ctx.fillStyle = tActive ? t.color + '15' : '#0a0a0a';
            ctx.fillRect(COL_BACK, y, BOX_W, BOX_H);
            ctx.strokeStyle = tActive ? t.color : '#222';
            ctx.lineWidth = tActive ? 2 : 1;
            ctx.strokeRect(COL_BACK, y, BOX_W, BOX_H);

            ctx.fillStyle = tActive ? t.color : '#555';
            ctx.font = 'bold 11px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(t.name, COL_BACK + BOX_W / 2, y + 18);

            if (tActive) {
                ctx.font = '8px Courier New';
                ctx.fillStyle = '#fff';
                ctx.fillText(t.asm, COL_BACK + BOX_W / 2, y + 34);
            }
        });

        // --- Animated connection lines ---
        if (phase >= 1 && activeLang) {
            const langIdx = langKeys.indexOf(activeLang);
            const fromY = 40 + langIdx * 65 + BOX_H / 2;

            // Front-end → IR
            drawConnector(COL_FRONT + BOX_W, fromY, COL_IR, irY + 12, LANGS[activeLang].color, phase >= 2 ? 1 : particleProgress);
        }
        if (phase >= 2) {
            // IR → Optimizer
            drawConnector(COL_IR + BOX_W, irY + 12, COL_OPT, optY + 30, '#ffa500', phase >= 3 ? 1 : particleProgress);
        }
        if (phase >= 3) {
            // Optimizer → all back-ends
            TARGETS.forEach((t, i) => {
                const toY = 40 + i * 65 + BOX_H / 2;
                drawConnector(COL_OPT + BOX_W, optY + 30, COL_BACK, toY, t.color, phase >= 4 ? 1 : particleProgress);
            });
        }

        // --- Status bar ---
        ctx.fillStyle = '#111';
        ctx.fillRect(0, H - 30, W, 30);
        const msgs = [
            'Select a source language to begin.',
            `Compiling ${activeLang} source through front-end...`,
            'Front-end emitted LLVM IR.',
            'Running optimization passes...',
            'Back-ends generated native code for all targets!'
        ];
        ctx.fillStyle = '#00ffff';
        ctx.font = '10px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(msgs[phase] || msgs[0], W / 2, H - 12);
    }

    function drawConnector(x1, y1, x2, y2, color, progress) {
        ctx.strokeStyle = color + '44';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);

        if (progress > 0 && progress <= 1) {
            const px = x1 + (x2 - x1) * progress;
            const py = y1 + (y2 - y1) * progress;
            ctx.shadowColor = color;
            ctx.shadowBlur = 12;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    function runPipeline(lang) {
        if (animId) clearTimeout(animId);
        activeLang = lang;
        phase = 0;
        particleProgress = 0;

        function advancePhase() {
            phase++;
            particleProgress = 0;

            function animateParticle() {
                particleProgress += 0.04;
                draw();
                if (particleProgress < 1) {
                    animId = setTimeout(animateParticle, 20);
                } else {
                    particleProgress = 1;
                    draw();
                    if (phase < 4) {
                        animId = setTimeout(advancePhase, 300);
                    }
                }
            }
            animateParticle();
        }

        draw();
        animId = setTimeout(advancePhase, 200);
    }

    cBtn.addEventListener('click', () => runPipeline('C'));
    rustBtn.addEventListener('click', () => runPipeline('RUST'));
    swiftBtn.addEventListener('click', () => runPipeline('SWIFT'));

    resetBtn.addEventListener('click', () => {
        if (animId) clearTimeout(animId);
        activeLang = null;
        phase = 0;
        particleProgress = 0;
        draw();
    });

    draw();
}

// --- 4. THE CALCULATOR CORE (ALU) ---
function initALUVisualizer() {
    const canvas = document.getElementById('aluCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const opBtn = document.getElementById('alu-op-btn');
    const stepBtn = document.getElementById('alu-step-btn');
    const resetBtn = document.getElementById('alu-reset-btn');

    const W = canvas.width;
    const H = canvas.height;
    const BITS = 8;

    const OPS = ['ADD', 'SUB', 'AND', 'OR', 'XOR'];
    let opIdx = 0;
    let regA = new Array(BITS).fill(0);
    let regB = new Array(BITS).fill(0);
    let regOut = new Array(BITS).fill(0);
    let carryFlag = 0;
    let zeroFlag = 0;
    let computing = false;
    let computeStep = -1; // -1 = idle, 0..7 = bit index being processed
    let computeAnimId = null;
    let particleTrails = []; // animated data path particles

    function bitsToInt(bits) {
        let v = 0;
        for (let i = 0; i < BITS; i++) v += bits[i] * Math.pow(2, BITS - 1 - i);
        return v;
    }

    function intToBits(val) {
        const bits = new Array(BITS).fill(0);
        for (let i = 0; i < BITS; i++) bits[BITS - 1 - i] = (val >> i) & 1;
        return bits;
    }

    function computeResult() {
        const a = bitsToInt(regA);
        const b = bitsToInt(regB);
        let result;
        const op = OPS[opIdx];

        if (op === 'ADD') result = a + b;
        else if (op === 'SUB') result = a - b;
        else if (op === 'AND') result = a & b;
        else if (op === 'OR') result = a | b;
        else if (op === 'XOR') result = a ^ b;

        carryFlag = (op === 'ADD' && result > 255) || (op === 'SUB' && result < 0) ? 1 : 0;
        const masked = ((result % 256) + 256) % 256;
        zeroFlag = masked === 0 ? 1 : 0;
        return intToBits(masked);
    }

    // Layout constants
    const REG_Y_A = 30;
    const REG_Y_B = 110;
    const ALU_Y = 160;
    const ALU_H = 80;
    const REG_Y_OUT = 280;
    const BIT_W = 42;
    const BIT_H = 32;
    const REG_START_X = (W - BITS * (BIT_W + 4)) / 2;

    function drawBitRegister(bits, y, label, color, activeIdx) {
        // Label
        ctx.fillStyle = color;
        ctx.font = 'bold 11px Courier New';
        ctx.textAlign = 'right';
        ctx.fillText(label, REG_START_X - 10, y + BIT_H / 2 + 4);

        // Decimal value
        ctx.fillStyle = '#888';
        ctx.font = '10px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText('= ' + bitsToInt(bits), REG_START_X + BITS * (BIT_W + 4) + 8, y + BIT_H / 2 + 4);

        for (let i = 0; i < BITS; i++) {
            const x = REG_START_X + i * (BIT_W + 4);
            const isActive = i === activeIdx;

            // Bit box
            ctx.fillStyle = bits[i] ? (isActive ? color : color + '44') : '#0a0a0a';
            ctx.fillRect(x, y, BIT_W, BIT_H);

            ctx.strokeStyle = isActive ? '#fff' : (bits[i] ? color : '#333');
            ctx.lineWidth = isActive ? 2 : 1;
            ctx.strokeRect(x, y, BIT_W, BIT_H);

            // Bit value
            ctx.fillStyle = bits[i] ? '#fff' : '#555';
            ctx.font = 'bold 16px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(bits[i], x + BIT_W / 2, y + BIT_H / 2 + 6);

            // Bit weight label
            ctx.fillStyle = '#333';
            ctx.font = '7px Courier New';
            ctx.fillText('2' + String.fromCharCode(0x2070 + (BITS - 1 - i > 3 ? (BITS - 1 - i > 9 ? 0x2070 : 0x2070) : 0x2070)), x + BIT_W / 2, y - 4);
            // Simpler: just show bit position index
            ctx.fillText(BITS - 1 - i, x + BIT_W / 2, y - 4);
        }
    }

    function drawALUBlock() {
        const cx = W / 2;
        const aluW = 200;

        // Trapezoid shape (wider at top, narrower at bottom)
        ctx.beginPath();
        ctx.moveTo(cx - aluW / 2, ALU_Y);          // top-left
        ctx.lineTo(cx + aluW / 2, ALU_Y);          // top-right
        ctx.lineTo(cx + aluW / 3, ALU_Y + ALU_H);  // bottom-right
        ctx.lineTo(cx - aluW / 3, ALU_Y + ALU_H);  // bottom-left
        ctx.closePath();

        ctx.fillStyle = computing ? 'rgba(0, 255, 255, 0.08)' : '#0a0a0a';
        ctx.fill();
        ctx.strokeStyle = computing ? '#00ffff' : '#444';
        ctx.lineWidth = 2;
        ctx.stroke();

        // ALU label
        ctx.fillStyle = computing ? '#00ffff' : '#888';
        ctx.font = 'bold 18px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('ALU', cx, ALU_Y + 32);

        // Operation
        ctx.fillStyle = '#ccff00';
        ctx.font = 'bold 14px Courier New';
        ctx.fillText(OPS[opIdx], cx, ALU_Y + 54);

        // Glow when computing
        if (computing) {
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 20;
            ctx.strokeStyle = '#00ffff';
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    function drawFlags() {
        const flagX = W - 80;
        const flagY = ALU_Y + 10;

        // Carry flag
        ctx.fillStyle = carryFlag ? '#ff3333' : '#222';
        ctx.fillRect(flagX, flagY, 60, 24);
        ctx.strokeStyle = carryFlag ? '#ff3333' : '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(flagX, flagY, 60, 24);
        ctx.fillStyle = carryFlag ? '#fff' : '#555';
        ctx.font = '10px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('CARRY', flagX + 30, flagY + 10);
        ctx.fillText(carryFlag, flagX + 30, flagY + 21);

        // Zero flag
        ctx.fillStyle = zeroFlag ? '#ccff00' : '#222';
        ctx.fillRect(flagX, flagY + 34, 60, 24);
        ctx.strokeStyle = zeroFlag ? '#ccff00' : '#333';
        ctx.strokeRect(flagX, flagY + 34, 60, 24);
        ctx.fillStyle = zeroFlag ? '#000' : '#555';
        ctx.fillText('ZERO', flagX + 30, flagY + 44);
        ctx.fillText(zeroFlag, flagX + 30, flagY + 55);
    }

    function drawDataPaths() {
        const cx = W / 2;

        // Input A → ALU (vertical lines from register A down to ALU top)
        ctx.strokeStyle = computing ? '#00ffff33' : '#1a1a1a';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cx, REG_Y_A + BIT_H);
        ctx.lineTo(cx, ALU_Y);
        ctx.stroke();

        // Input B → ALU
        ctx.beginPath();
        ctx.moveTo(cx - 40, REG_Y_B + BIT_H);
        ctx.lineTo(cx - 40, ALU_Y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx + 40, REG_Y_B + BIT_H);
        ctx.lineTo(cx + 40, ALU_Y);
        ctx.stroke();

        // ALU → Output
        ctx.beginPath();
        ctx.moveTo(cx, ALU_Y + ALU_H);
        ctx.lineTo(cx, REG_Y_OUT);
        ctx.stroke();

        ctx.setLineDash([]);

        // Draw animated particles
        particleTrails.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    function draw() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, W, H);

        drawDataPaths();
        drawBitRegister(regA, REG_Y_A, 'REG A', '#00ffff', computing ? computeStep : -1);
        drawBitRegister(regB, REG_Y_B, 'REG B', '#ff3333', computing ? computeStep : -1);
        drawALUBlock();
        drawFlags();
        drawBitRegister(regOut, REG_Y_OUT, 'OUT', '#ccff00', computing ? computeStep : -1);
    }

    function animateCompute() {
        if (computeStep >= BITS) {
            computing = false;
            computeStep = -1;
            particleTrails = [];
            draw();
            return;
        }

        computing = true;
        const finalBits = computeResult();

        // Set the current output bit
        regOut[computeStep] = finalBits[computeStep];

        // Create particle trails for this step
        const cx = W / 2;
        const bitX = REG_START_X + computeStep * (BIT_W + 4) + BIT_W / 2;

        particleTrails = [
            { x: bitX, y: REG_Y_A + BIT_H + 10, color: '#00ffff' },
            { x: bitX, y: REG_Y_B + BIT_H + 10, color: '#ff3333' },
            { x: bitX, y: ALU_Y + ALU_H + 10, color: '#ccff00' }
        ];

        draw();

        computeStep++;
        computeAnimId = setTimeout(animateCompute, 180);
    }

    // Handle clicks on register bits
    canvas.addEventListener('click', (e) => {
        if (computing) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        // Check Register A clicks
        for (let i = 0; i < BITS; i++) {
            const x = REG_START_X + i * (BIT_W + 4);
            if (mx >= x && mx <= x + BIT_W && my >= REG_Y_A && my <= REG_Y_A + BIT_H) {
                regA[i] = regA[i] ? 0 : 1;
                draw();
                return;
            }
        }

        // Check Register B clicks
        for (let i = 0; i < BITS; i++) {
            const x = REG_START_X + i * (BIT_W + 4);
            if (mx >= x && mx <= x + BIT_W && my >= REG_Y_B && my <= REG_Y_B + BIT_H) {
                regB[i] = regB[i] ? 0 : 1;
                draw();
                return;
            }
        }
    });

    opBtn.addEventListener('click', () => {
        if (computing) return;
        opIdx = (opIdx + 1) % OPS.length;
        opBtn.innerText = 'OP: ' + OPS[opIdx];
        draw();
    });

    stepBtn.addEventListener('click', () => {
        if (computing) return;
        regOut = new Array(BITS).fill(0);
        carryFlag = 0;
        zeroFlag = 0;
        computeStep = 0;
        computing = true;
        animateCompute();
    });

    resetBtn.addEventListener('click', () => {
        if (computeAnimId) clearTimeout(computeAnimId);
        computing = false;
        computeStep = -1;
        regA = new Array(BITS).fill(0);
        regB = new Array(BITS).fill(0);
        regOut = new Array(BITS).fill(0);
        carryFlag = 0;
        zeroFlag = 0;
        particleTrails = [];
        draw();
    });

    draw();
}

// --- 13. THE GUIDED FRONTIER (BEAM SEARCH) ---
function initBeamSearchVisualizer() {
    const canvas = document.getElementById('beamCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const k1Btn = document.getElementById('beam-k1-btn');
    const k2Btn = document.getElementById('beam-k2-btn');
    const k3Btn = document.getElementById('beam-k3-btn');
    const startBtn = document.getElementById('beam-start-btn');
    const resetBtn = document.getElementById('beam-reset-btn');

    const W = canvas.width;
    const H = canvas.height;
    const DEPTH = 4;
    const BRANCH = 3;
    let beamWidth = 2;
    let tree = [];
    let searchLevel = -1;
    let animId = null;
    let bestPath = [];
    let statusMsg = 'Select beam width and press START.';

    const TOKENS = [
        ['the', 'a', 'one'],
        ['quick', 'slow', 'red'],
        ['fox', 'cat', 'dog'],
        ['jumps', 'runs', 'sits']
    ];

    function buildTree() {
        tree = [];
        let id = 0;
        tree.push({ id: id++, depth: 0, parent: -1, score: 1.0, cumScore: 1.0, label: '<s>', active: true, selected: false, children: [] });

        for (let d = 0; d < DEPTH; d++) {
            const parents = tree.filter(n => n.depth === d);
            for (const p of parents) {
                for (let b = 0; b < BRANCH; b++) {
                    const score = Math.round((0.1 + Math.random() * 0.85) * 100) / 100;
                    const child = {
                        id: id++,
                        depth: d + 1,
                        parent: p.id,
                        score,
                        cumScore: Math.round(p.cumScore * score * 100) / 100,
                        label: TOKENS[d][b],
                        active: false,
                        selected: false,
                        children: []
                    };
                    p.children.push(child.id);
                    tree.push(child);
                }
            }
        }
    }

    function getNodePos(node) {
        const nodesAtDepth = tree.filter(n => n.depth === node.depth);
        const idx = nodesAtDepth.indexOf(node);
        const count = nodesAtDepth.length;

        const levelX = 80 + node.depth * ((W - 120) / DEPTH);
        const availH = H - 80;
        const spacing = count > 1 ? availH / (count - 1) : 0;
        const startY = count > 1 ? 40 : H / 2;
        const levelY = startY + idx * spacing;

        return { x: levelX, y: levelY };
    }

    function draw() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, W, H);

        // Draw edges
        for (const node of tree) {
            if (node.parent === -1) continue;
            const parent = tree[node.parent];
            const pPos = getNodePos(parent);
            const nPos = getNodePos(node);

            let edgeColor = '#1a1a1a';
            if (node.selected && parent.selected) edgeColor = '#ccff00';
            else if (node.active) edgeColor = '#00ffff44';

            ctx.strokeStyle = edgeColor;
            ctx.lineWidth = (node.selected && parent.selected) ? 3 : 1;
            ctx.beginPath();
            ctx.moveTo(pPos.x + 14, pPos.y);
            ctx.bezierCurveTo(pPos.x + 50, pPos.y, nPos.x - 50, nPos.y, nPos.x - 14, nPos.y);
            ctx.stroke();
        }

        // Draw nodes
        for (const node of tree) {
            const pos = getNodePos(node);
            const radius = 14;

            let fillColor = '#111';
            let strokeColor = '#333';
            let textColor = '#555';

            if (node.depth === 0) {
                fillColor = '#222';
                strokeColor = '#888';
                textColor = '#fff';
            } else if (node.selected) {
                fillColor = '#ccff0022';
                strokeColor = '#ccff00';
                textColor = '#ccff00';
            } else if (node.active) {
                fillColor = '#00ffff15';
                strokeColor = '#00ffff';
                textColor = '#fff';
            }

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = fillColor;
            ctx.fill();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = node.selected ? 2.5 : 1;
            ctx.stroke();

            if (node.selected) {
                ctx.shadowColor = '#ccff00';
                ctx.shadowBlur = 12;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            ctx.fillStyle = textColor;
            ctx.font = '9px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(node.label, pos.x, pos.y + 3);

            if (node.depth > 0 && (node.active || node.selected)) {
                ctx.fillStyle = node.selected ? '#ccff00' : '#00ffff';
                ctx.font = '8px Courier New';
                ctx.fillText(node.score.toFixed(2), pos.x, pos.y + radius + 12);

                ctx.fillStyle = '#666';
                ctx.font = '7px Courier New';
                ctx.fillText('\u03a3' + node.cumScore.toFixed(2), pos.x, pos.y + radius + 22);
            }
        }

        // Depth labels
        ctx.fillStyle = '#444';
        ctx.font = '9px Courier New';
        ctx.textAlign = 'center';
        for (let d = 0; d <= DEPTH; d++) {
            const x = 80 + d * ((W - 120) / DEPTH);
            ctx.fillText(d === 0 ? 'START' : 't=' + d, x, H - 10);
        }

        // Beam width indicator
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 11px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText('BEAM WIDTH: k=' + beamWidth, 10, 20);

        // Status bar
        ctx.fillStyle = '#111';
        ctx.fillRect(0, H - 28, W, 28);
        ctx.fillStyle = '#00ffff';
        ctx.font = '10px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(statusMsg, W / 2, H - 10);
    }

    function runBeamSearch() {
        if (searchLevel >= DEPTH) {
            const leaves = tree.filter(n => n.depth === DEPTH && n.active);
            leaves.sort((a, b) => b.cumScore - a.cumScore);
            if (leaves.length > 0) {
                let node = leaves[0];
                while (node) {
                    node.selected = true;
                    bestPath.unshift(node.id);
                    node = node.parent >= 0 ? tree[node.parent] : null;
                }
                const tokens = bestPath.map(id => tree[id].label).join(' \u2192 ');
                statusMsg = 'Best: ' + tokens + ' (score: ' + leaves[0].cumScore.toFixed(3) + ')';
            }
            draw();
            return;
        }

        searchLevel++;

        if (searchLevel === 0) {
            searchLevel++;
        }

        const currentActive = tree.filter(n => n.depth === searchLevel - 1 && n.active);
        const candidates = [];
        for (const p of currentActive) {
            for (const cid of p.children) {
                const child = tree[cid];
                child.active = true;
                candidates.push(child);
            }
        }

        candidates.sort((a, b) => b.cumScore - a.cumScore);
        const kept = candidates.slice(0, beamWidth);
        const pruned = candidates.slice(beamWidth);

        for (const p of pruned) {
            p.active = false;
        }

        statusMsg = 'Level ' + searchLevel + ': expanded ' + candidates.length + ' candidates, kept top ' + kept.length;
        draw();

        animId = setTimeout(runBeamSearch, 900);
    }

    function setBeamWidth(k) {
        if (searchLevel >= 0) return;
        beamWidth = k;
        [k1Btn, k2Btn, k3Btn].forEach((btn, i) => {
            btn.style.borderColor = (i + 1 === k) ? '#00ffff' : '';
        });
        statusMsg = 'Beam width set to k=' + k + '. Press START.';
        draw();
    }

    function resetVis() {
        if (animId) clearTimeout(animId);
        searchLevel = -1;
        bestPath = [];
        statusMsg = 'Select beam width and press START.';
        buildTree();
        tree[0].active = true;
        draw();
    }

    k1Btn.addEventListener('click', () => setBeamWidth(1));
    k2Btn.addEventListener('click', () => setBeamWidth(2));
    k3Btn.addEventListener('click', () => setBeamWidth(3));

    startBtn.addEventListener('click', () => {
        if (searchLevel >= 0) return;
        resetVis();
        searchLevel = 0;
        statusMsg = 'Starting beam search with k=' + beamWidth + '...';
        draw();
        animId = setTimeout(runBeamSearch, 600);
    });

    resetBtn.addEventListener('click', resetVis);

    buildTree();
    tree[0].active = true;
    setBeamWidth(2);
    draw();
}

// --- 5. THE INSTRUCTION ENGINE (CPU) ---
function initCPUVisualizer() {
    const canvas = document.getElementById('cpuCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const fetchBtn = document.getElementById('cpu-fetch-btn');
    const decodeBtn = document.getElementById('cpu-decode-btn');
    const executeBtn = document.getElementById('cpu-execute-btn');
    const autoBtn = document.getElementById('cpu-auto-btn');
    const resetBtn = document.getElementById('cpu-reset-btn');

    const W = canvas.width;
    const H = canvas.height;

    const PROGRAM = [
        { raw: 'LOAD R1, 42', opcode: 'LOAD', args: ['R1', '42'], desc: 'R1 ← 42' },
        { raw: 'LOAD R2, 18', opcode: 'LOAD', args: ['R2', '18'], desc: 'R2 ← 18' },
        { raw: 'ADD R1, R2',  opcode: 'ADD',  args: ['R1', 'R2'], desc: 'R1 ← R1 + R2' },
        { raw: 'STORE R1, 0A', opcode: 'STORE', args: ['R1', '0x0A'], desc: 'MEM[0x0A] ← R1' }
    ];

    let pc = 0;
    let ir = '';
    let decodedOp = null;
    let r1 = 0;
    let r2 = 0;
    let phase = 'idle'; // 'idle', 'fetched', 'decoded', 'executed'
    let autoCycling = false;
    let autoTimeout = null;
    let particle = null; // animated data-flow particle

    // Layout
    const MEM_X = 30;
    const MEM_Y = 30;
    const MEM_W = 160;
    const MEM_CELL_H = 46;

    const CPU_X = 260;
    const CPU_Y = 20;
    const CPU_W = 410;
    const CPU_H = 340;

    const PC_X = CPU_X + 30;
    const PC_Y = CPU_Y + 40;
    const PC_W = 80;
    const PC_H = 40;

    const IR_X = CPU_X + 140;
    const IR_Y = CPU_Y + 40;
    const IR_W = 240;
    const IR_H = 40;

    const REG_X = CPU_X + 60;
    const REG_Y = CPU_Y + 200;
    const REG_W = 120;
    const REG_H = 50;
    const REG_GAP = 60;

    const DECODE_Y = CPU_Y + 120;

    function updateButtons() {
        fetchBtn.disabled = phase !== 'idle' && phase !== 'executed';
        decodeBtn.disabled = phase !== 'fetched';
        executeBtn.disabled = phase !== 'decoded';
        if (pc >= PROGRAM.length && phase === 'executed') {
            fetchBtn.disabled = true;
        }
    }

    function drawBackground() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, W, H);
    }

    function drawMemory() {
        // Header
        ctx.fillStyle = '#888';
        ctx.font = 'bold 10px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('PROGRAM MEMORY', MEM_X + MEM_W / 2, MEM_Y - 8);

        for (let i = 0; i < PROGRAM.length; i++) {
            const y = MEM_Y + i * MEM_CELL_H;
            const isActive = (phase === 'idle' || phase === 'executed') && i === pc && pc < PROGRAM.length;
            const isFetched = i < pc || (i === pc && (phase === 'fetched' || phase === 'decoded'));
            const isCurrentExec = i === pc && phase === 'executed';
            const isPastExec = i < pc;

            // Cell background
            ctx.fillStyle = isActive ? 'rgba(0, 255, 255, 0.1)' : '#0a0a0a';
            if (isPastExec || isCurrentExec) ctx.fillStyle = 'rgba(204, 255, 0, 0.05)';
            ctx.fillRect(MEM_X, y, MEM_W, MEM_CELL_H - 4);

            // Border
            ctx.strokeStyle = isActive ? '#00ffff' : (isPastExec || isCurrentExec ? '#333' : '#222');
            ctx.lineWidth = isActive ? 2 : 1;
            ctx.strokeRect(MEM_X, y, MEM_W, MEM_CELL_H - 4);

            // Address
            ctx.fillStyle = '#555';
            ctx.font = '9px Courier New';
            ctx.textAlign = 'left';
            ctx.fillText('0x' + i.toString(16).toUpperCase().padStart(2, '0'), MEM_X + 6, y + 14);

            // Instruction
            ctx.fillStyle = isPastExec || isCurrentExec ? '#666' : (isActive ? '#00ffff' : '#aaa');
            ctx.font = '12px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(PROGRAM[i].raw, MEM_X + MEM_W / 2, y + 32);

            // Checkmark for executed
            if (isPastExec || isCurrentExec) {
                ctx.fillStyle = '#ccff00';
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText('✓', MEM_X + MEM_W - 8, y + 16);
            }
        }
    }

    function drawCPUBox() {
        // CPU border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(CPU_X, CPU_Y, CPU_W, CPU_H);
        ctx.setLineDash([]);

        // CPU label
        ctx.fillStyle = '#555';
        ctx.font = 'bold 11px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText('CPU', CPU_X + 10, CPU_Y + 16);

        // Phase indicator
        let phaseLabel = 'IDLE';
        let phaseColor = '#444';
        if (phase === 'fetched') { phaseLabel = '● FETCH'; phaseColor = '#00ffff'; }
        else if (phase === 'decoded') { phaseLabel = '● DECODE'; phaseColor = '#ffa500'; }
        else if (phase === 'executed') { phaseLabel = '● EXECUTE'; phaseColor = '#ccff00'; }
        ctx.fillStyle = phaseColor;
        ctx.font = 'bold 12px Courier New';
        ctx.textAlign = 'right';
        ctx.fillText(phaseLabel, CPU_X + CPU_W - 10, CPU_Y + 16);
    }

    function drawPC() {
        ctx.fillStyle = phase === 'fetched' ? 'rgba(0, 255, 255, 0.15)' : '#0a0a0a';
        ctx.fillRect(PC_X, PC_Y, PC_W, PC_H);
        ctx.strokeStyle = phase === 'fetched' ? '#00ffff' : '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(PC_X, PC_Y, PC_W, PC_H);

        ctx.fillStyle = '#888';
        ctx.font = '9px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('PC', PC_X + PC_W / 2, PC_Y - 6);

        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 20px Courier New';
        ctx.fillText(pc < PROGRAM.length ? pc.toString() : 'END', PC_X + PC_W / 2, PC_Y + 28);
    }

    function drawIR() {
        const isFetched = phase === 'fetched' || phase === 'decoded';
        ctx.fillStyle = isFetched ? 'rgba(0, 255, 255, 0.08)' : '#0a0a0a';
        ctx.fillRect(IR_X, IR_Y, IR_W, IR_H);
        ctx.strokeStyle = isFetched ? '#00ffff' : '#333';
        ctx.lineWidth = isFetched ? 2 : 1;
        ctx.strokeRect(IR_X, IR_Y, IR_W, IR_H);

        ctx.fillStyle = '#888';
        ctx.font = '9px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('INSTRUCTION REGISTER (IR)', IR_X + IR_W / 2, IR_Y - 6);

        ctx.fillStyle = ir ? '#fff' : '#333';
        ctx.font = 'bold 14px Courier New';
        ctx.fillText(ir || '— EMPTY —', IR_X + IR_W / 2, IR_Y + 26);
    }

    function drawDecodeZone() {
        if (phase !== 'decoded' && phase !== 'executed') return;
        if (!decodedOp) return;

        const zoneW = 300;
        const zoneH = 50;
        const zoneX = CPU_X + (CPU_W - zoneW) / 2;

        // Decode box
        ctx.fillStyle = phase === 'decoded' ? 'rgba(255, 165, 0, 0.08)' : 'rgba(204, 255, 0, 0.05)';
        ctx.fillRect(zoneX, DECODE_Y, zoneW, zoneH);
        ctx.strokeStyle = phase === 'decoded' ? '#ffa500' : '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(zoneX, DECODE_Y, zoneW, zoneH);

        ctx.fillStyle = '#888';
        ctx.font = '9px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('DECODED', zoneX + zoneW / 2, DECODE_Y - 6);

        // Opcode
        ctx.fillStyle = '#ffa500';
        ctx.font = 'bold 14px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText('OP: ' + decodedOp.opcode, zoneX + 12, DECODE_Y + 20);

        // Operands
        ctx.fillStyle = '#fff';
        ctx.font = '12px Courier New';
        ctx.fillText('ARGS: ' + decodedOp.args.join(', '), zoneX + 12, DECODE_Y + 40);

        // Description
        ctx.fillStyle = '#ccff00';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'right';
        ctx.fillText(decodedOp.desc, zoneX + zoneW - 12, DECODE_Y + 30);

        // Arrow from IR to decode
        ctx.strokeStyle = '#ffa50055';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(IR_X + IR_W / 2, IR_Y + IR_H);
        ctx.lineTo(zoneX + zoneW / 2, DECODE_Y);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function drawRegisters() {
        const regs = [
            { name: 'R1', val: r1, color: '#00ffff' },
            { name: 'R2', val: r2, color: '#ff3333' }
        ];

        ctx.fillStyle = '#888';
        ctx.font = 'bold 10px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('GENERAL REGISTERS', REG_X + REG_W + REG_GAP / 2, REG_Y - 10);

        regs.forEach((reg, i) => {
            const x = REG_X + i * (REG_W + REG_GAP);
            const isActive = phase === 'executed' && decodedOp &&
                ((decodedOp.opcode === 'LOAD' && decodedOp.args[0] === reg.name) ||
                 (decodedOp.opcode === 'ADD' && reg.name === 'R1') ||
                 (decodedOp.opcode === 'STORE' && decodedOp.args[0] === reg.name));

            ctx.fillStyle = isActive ? reg.color + '22' : '#0a0a0a';
            ctx.fillRect(x, REG_Y, REG_W, REG_H);
            ctx.strokeStyle = isActive ? reg.color : '#333';
            ctx.lineWidth = isActive ? 2 : 1;
            ctx.strokeRect(x, REG_Y, REG_W, REG_H);

            // Label
            ctx.fillStyle = reg.color;
            ctx.font = 'bold 10px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(reg.name, x + REG_W / 2, REG_Y + 16);

            // Value
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 22px Courier New';
            ctx.fillText(reg.val, x + REG_W / 2, REG_Y + 42);

            // Glow when active
            if (isActive) {
                ctx.shadowColor = reg.color;
                ctx.shadowBlur = 12;
                ctx.fillText(reg.val, x + REG_W / 2, REG_Y + 42);
                ctx.shadowBlur = 0;
            }
        });
    }

    function drawDataFlow() {
        // Arrow from memory to IR (fetch path)
        if (phase === 'fetched') {
            ctx.strokeStyle = '#00ffff44';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            const startX = MEM_X + MEM_W;
            const startY = MEM_Y + (pc > 0 ? pc - 1 : 0) * MEM_CELL_H + MEM_CELL_H / 2;
            const endX = IR_X;
            const endY = IR_Y + IR_H / 2;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Arrowhead
            const angle = Math.atan2(endY - startY, endX - startX);
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - 10 * Math.cos(angle - 0.3), endY - 10 * Math.sin(angle - 0.3));
            ctx.lineTo(endX - 10 * Math.cos(angle + 0.3), endY - 10 * Math.sin(angle + 0.3));
            ctx.closePath();
            ctx.fill();
        }

        // Arrow from decode to registers (execute path)
        if (phase === 'executed' && decodedOp) {
            ctx.strokeStyle = '#ccff0044';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            const startX2 = CPU_X + CPU_W / 2;
            const startY2 = DECODE_Y + 50;
            const endX2 = REG_X + REG_W / 2;
            const endY2 = REG_Y;
            ctx.beginPath();
            ctx.moveTo(startX2, startY2);
            ctx.lineTo(endX2, endY2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Particle effect
        if (particle) {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    function drawCycleIndicator() {
        const cx = CPU_X + CPU_W / 2;
        const cy = CPU_Y + CPU_H - 35;
        const phases = ['FETCH', 'DECODE', 'EXECUTE'];
        const colors = ['#00ffff', '#ffa500', '#ccff00'];
        const activeIdx = phase === 'fetched' ? 0 : phase === 'decoded' ? 1 : phase === 'executed' ? 2 : -1;

        const totalW = 280;
        const segW = totalW / 3;
        const startX = cx - totalW / 2;

        phases.forEach((p, i) => {
            const x = startX + i * segW;
            const isActive = i === activeIdx;

            // Box
            ctx.fillStyle = isActive ? colors[i] + '33' : '#0a0a0a';
            ctx.fillRect(x + 2, cy, segW - 4, 24);
            ctx.strokeStyle = isActive ? colors[i] : '#222';
            ctx.lineWidth = isActive ? 2 : 1;
            ctx.strokeRect(x + 2, cy, segW - 4, 24);

            // Text
            ctx.fillStyle = isActive ? colors[i] : '#444';
            ctx.font = (isActive ? 'bold ' : '') + '10px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(p, x + segW / 2, cy + 16);

            // Arrow between phases
            if (i < phases.length - 1) {
                ctx.fillStyle = '#333';
                ctx.font = '14px sans-serif';
                ctx.fillText('→', x + segW - 1, cy + 16);
            }
        });
    }

    function draw() {
        drawBackground();
        drawMemory();
        drawCPUBox();
        drawPC();
        drawIR();
        drawDecodeZone();
        drawRegisters();
        drawDataFlow();
        drawCycleIndicator();
    }

    function animateParticle(startX, startY, endX, endY, color, callback) {
        const duration = 350;
        const startTime = performance.now();

        function step(now) {
            const t = Math.min((now - startTime) / duration, 1);
            const ease = t * (2 - t); // ease-out
            particle = {
                x: startX + (endX - startX) * ease,
                y: startY + (endY - startY) * ease,
                color: color
            };
            draw();
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                particle = null;
                callback();
            }
        }
        requestAnimationFrame(step);
    }

    function doFetch() {
        if (pc >= PROGRAM.length) return;
        const instr = PROGRAM[pc];
        const memY = MEM_Y + pc * MEM_CELL_H + MEM_CELL_H / 2;

        animateParticle(
            MEM_X + MEM_W, memY,
            IR_X + IR_W / 2, IR_Y + IR_H / 2,
            '#00ffff',
            () => {
                ir = instr.raw;
                phase = 'fetched';
                updateButtons();
                draw();
            }
        );
    }

    function doDecode() {
        const instr = PROGRAM[pc];
        decodedOp = instr;
        phase = 'decoded';
        updateButtons();
        draw();
    }

    function doExecute() {
        const instr = PROGRAM[pc];

        if (instr.opcode === 'LOAD') {
            if (instr.args[0] === 'R1') r1 = parseInt(instr.args[1]);
            else if (instr.args[0] === 'R2') r2 = parseInt(instr.args[1]);
        } else if (instr.opcode === 'ADD') {
            r1 = r1 + r2;
        } else if (instr.opcode === 'STORE') {
            // Visual only; we just show the value was stored
        }

        phase = 'executed';
        pc++;
        updateButtons();
        draw();
    }

    function autoCycle() {
        if (!autoCycling) return;
        if (pc >= PROGRAM.length && phase === 'executed') {
            autoCycling = false;
            autoBtn.innerText = 'AUTO CYCLE';
            return;
        }

        if (phase === 'idle' || phase === 'executed') {
            doFetch();
            autoTimeout = setTimeout(() => {
                if (!autoCycling) return;
                doDecode();
                autoTimeout = setTimeout(() => {
                    if (!autoCycling) return;
                    doExecute();
                    autoTimeout = setTimeout(autoCycle, 600);
                }, 600);
            }, 600);
        }
    }

    function reset() {
        autoCycling = false;
        if (autoTimeout) clearTimeout(autoTimeout);
        autoTimeout = null;
        pc = 0;
        ir = '';
        decodedOp = null;
        r1 = 0;
        r2 = 0;
        phase = 'idle';
        particle = null;
        autoBtn.innerText = 'AUTO CYCLE';
        updateButtons();
        draw();
    }

    fetchBtn.addEventListener('click', () => {
        if (autoCycling) return;
        doFetch();
    });

    decodeBtn.addEventListener('click', () => {
        if (autoCycling) return;
        doDecode();
    });

    executeBtn.addEventListener('click', () => {
        if (autoCycling) return;
        doExecute();
    });

    autoBtn.addEventListener('click', () => {
        if (autoCycling) {
            autoCycling = false;
            if (autoTimeout) clearTimeout(autoTimeout);
            autoBtn.innerText = 'AUTO CYCLE';
            updateButtons();
            return;
        }
        if (pc >= PROGRAM.length) reset();
        autoCycling = true;
        autoBtn.innerText = 'STOP';
        autoCycle();
    });

    resetBtn.addEventListener('click', reset);

    updateButtons();
    draw();
}
