// --- SHARED UTILS ---
const EE_ACCENT = '#fbbf24';
const EE_GLOW = 'rgba(251, 191, 36, 0.2)';

// --- HERO CIRCUIT ANIMATION ---
const heroCanvas = document.getElementById('hero-ee-canvas');
if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let w, h;
    let particles = [];
    let traces = [];

    function initHero() {
        w = heroCanvas.width = heroCanvas.offsetWidth;
        h = heroCanvas.height = heroCanvas.offsetHeight;
        particles = [];
        traces = [];
        
        // Create a grid of traces
        const spacing = 40;
        for (let x = 0; x < w; x += spacing) {
            traces.push({ x, y1: 0, y2: h, horizontal: false });
        }
        for (let y = 0; y < h; y += spacing) {
            traces.push({ y, x1: 0, x2: w, horizontal: true });
        }

        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                speed: 0.5 + Math.random() * 2,
                dir: Math.random() > 0.5 ? 'h' : 'v'
            });
        }
    }

    function drawHero() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        traces.forEach(t => {
            ctx.beginPath();
            if (t.horizontal) {
                ctx.moveTo(t.x1, t.y);
                ctx.lineTo(t.x2, t.y);
            } else {
                ctx.moveTo(t.x, t.y1);
                ctx.lineTo(t.x, t.y2);
            }
            ctx.stroke();
        });

        particles.forEach(p => {
            if (p.dir === 'h') {
                p.x += p.speed;
                if (p.x > w) p.x = 0;
            } else {
                p.y += p.speed;
                if (p.y > h) p.y = 0;
            }

            ctx.fillStyle = EE_ACCENT;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
            ctx.shadowBlur = 10;
            ctx.shadowColor = EE_ACCENT;
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        requestAnimationFrame(drawHero);
    }

    window.addEventListener('resize', initHero);
    initHero();
    drawHero();
}

// --- OHM'S LAW SIMULATOR ---
const ohmCanvas = document.getElementById('ohm-canvas');
if (ohmCanvas) {
    const ctx = ohmCanvas.getContext('2d');
    const vSlider = document.getElementById('voltage-slider');
    const rSlider = document.getElementById('resistance-slider');
    const vVal = document.getElementById('v-val');
    const rVal = document.getElementById('r-val');
    const iVal = document.getElementById('i-val');

    let w, h;
    let electrons = [];
    let atoms = [];

    function initOhm() {
        w = ohmCanvas.width = ohmCanvas.offsetWidth;
        h = 160;
        ohmCanvas.height = h;
        
        atoms = [];
        const rows = 4;
        const cols = 20;
        const spacingX = w / cols;
        const spacingY = h / rows;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                atoms.push({
                    x: j * spacingX + spacingX / 2 + (Math.random() - 0.5) * 10,
                    y: i * spacingY + spacingY / 2 + (Math.random() - 0.5) * 10,
                    baseR: 5
                });
            }
        }

        electrons = Array.from({ length: 150 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: 1 + Math.random()
        }));
    }

    function drawOhm() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, w, h);

        const V = parseFloat(vSlider.value);
        const R = parseFloat(rSlider.value);
        const I = V / R;

        vVal.innerText = V.toFixed(1) + 'V';
        rVal.innerText = R.toFixed(0) + 'Ω';
        iVal.innerText = I.toFixed(3) + 'A';

        // Draw atoms (Resistance)
        const resistanceOpacity = 0.1 + (R / 500) * 0.4;
        const atomSize = 2 + (R / 500) * 8;
        atoms.forEach(a => {
            ctx.fillStyle = `rgba(148, 163, 184, ${resistanceOpacity})`;
            ctx.beginPath();
            ctx.arc(a.x, a.y, atomSize, 0, Math.PI * 2);
            ctx.fill();
        });

        // Current speed factor
        const speed = I * 100;

        electrons.forEach(e => {
            e.vx = speed + Math.random() * 0.5;
            e.x += e.vx;
            
            // Interaction with atoms (scattering)
            atoms.forEach(a => {
                const dx = e.x - a.x;
                const dy = e.y - a.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < atomSize + 2) {
                    e.y += (Math.random() - 0.5) * 4;
                }
            });

            if (e.x > w) e.x = 0;
            if (e.y < 0) e.y = h;
            if (e.y > h) e.y = 0;

            ctx.fillStyle = EE_ACCENT;
            ctx.beginPath();
            ctx.arc(e.x, e.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(drawOhm);
    }

    initOhm();
    drawOhm();
}

// --- TRANSISTOR SWITCHING ---
const transCanvas = document.getElementById('transistor-canvas');
if (transCanvas) {
    const ctx = transCanvas.getContext('2d');
    const baseSlider = document.getElementById('base-slider');
    const baseStatus = document.getElementById('base-status');

    let w, h;
    function initTrans() {
        w = transCanvas.width = transCanvas.offsetWidth;
        h = 240;
        transCanvas.height = h;
    }

    function drawTrans() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, w, h);

        const baseInput = parseFloat(baseSlider.value);
        baseStatus.innerText = baseInput > 0.1 ? 'ACTIVE (' + (baseInput * 100).toFixed(0) + '%)' : 'OFF';
        
        const centerX = w / 2;
        const centerY = h / 2;

        // Draw symbol
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3;
        
        // Collector
        ctx.beginPath();
        ctx.moveTo(centerX + 50, centerY - 80);
        ctx.lineTo(centerX + 20, centerY - 30);
        ctx.stroke();

        // Emitter
        ctx.beginPath();
        ctx.moveTo(centerX + 50, centerY + 80);
        ctx.lineTo(centerX + 20, centerY + 30);
        ctx.stroke();

        // Arrows on emitter
        ctx.save();
        ctx.translate(centerX + 35, centerY + 55);
        ctx.rotate(Math.PI / 6);
        ctx.beginPath();
        ctx.moveTo(0,0); ctx.lineTo(-10,-5); ctx.lineTo(-10,5);
        ctx.fillStyle = '#475569';
        ctx.fill();
        ctx.restore();

        // Base
        ctx.beginPath();
        ctx.moveTo(centerX - 50, centerY);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();

        // Base Bar
        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(centerX + 20, centerY - 40);
        ctx.lineTo(centerX + 20, centerY + 40);
        ctx.stroke();

        // Animated Charge Flow
        const time = Date.now() / 1000;
        
        // Base Current (Control)
        if (baseInput > 0.05) {
            ctx.fillStyle = EE_ACCENT;
            for (let i = 0; i < 5; i++) {
                const pos = (time * 2 + i/5) % 1;
                const x = (centerX - 50) + pos * 50;
                ctx.beginPath();
                ctx.arc(x, centerY, 2 + baseInput * 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Collector to Emitter Flow
        const flowCapacity = baseInput > 0.2 ? baseInput : 0;
        if (flowCapacity > 0) {
            ctx.fillStyle = '#ef4444';
            for (let i = 0; i < 15; i++) {
                const pos = (time * 4 + i/15) % 1;
                let px, py;
                if (pos < 0.5) {
                    const localPos = pos * 2;
                    px = (centerX + 50) + (centerX + 20 - (centerX + 50)) * localPos;
                    py = (centerY - 80) + (centerY - 30 - (centerY - 80)) * localPos;
                } else {
                    const localPos = (pos - 0.5) * 2;
                    px = (centerX + 20) + (centerX + 50 - (centerX + 20)) * localPos;
                    py = (centerY + 30) + (centerY + 80 - (centerY + 30)) * localPos;
                }
                ctx.beginPath();
                ctx.arc(px, py, 2 + flowCapacity * 6, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Large text status
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 20px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText("ON", centerX + 100, centerY);
        } else {
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 20px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText("OFF", centerX + 100, centerY);
        }

        requestAnimationFrame(drawTrans);
    }

    initTrans();
    drawTrans();
}
