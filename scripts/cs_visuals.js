// Computer Science Visuals - First Principles

document.addEventListener('DOMContentLoaded', () => {
    initHero();
    initBinary();
    initLogic();
    initGPUVisualizer();
    initStructs();
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
