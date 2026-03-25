// Computer Science Visuals - First Principles

document.addEventListener('DOMContentLoaded', () => {
    initHero();
    initBinary();
    initLogic();
    initGPUVisualizer();
    initStructs();
    initComplexityVisualizer();
    initPvsNPVisualizer();
    initPenTestVisualizer();
    initProgramSynthesis();
    initInterpreterVisualizer();
    initCompilerVisualizer();
});

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
