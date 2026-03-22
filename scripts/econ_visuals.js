// Economics Visuals - First Principles

document.addEventListener('DOMContentLoaded', () => {
    initHero();
    initMarket();
    initOpportunity();
    initMarginal();
    initGameTheory();
    initSumGames();
});

// --- 1. HERO VISUAL (Flow of Value) ---
function initHero() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.size = Math.random() * 2 + 1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        draw() {
            ctx.fillStyle = '#ffcc0033';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < 50; i++) particles.push(new Particle());

    function animate() {
        ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw node connections
        ctx.strokeStyle = '#ffcc0011';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// --- 2. MARKET EQUILIBRIUM (Supply & Demand) ---
function initMarket() {
    const canvas = document.getElementById('marketCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dSlider = document.getElementById('demand-slider');
    const sSlider = document.getElementById('supply-slider');
    const dVal = document.getElementById('demand-val');
    const sVal = document.getElementById('supply-val');

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const padding = 50;
        const w = canvas.width - padding * 2;
        const h = canvas.height - padding * 2;

        // Axes
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, padding + h);
        ctx.lineTo(padding + w, padding + h);
        ctx.stroke();

        ctx.fillStyle = '#888';
        ctx.font = '12px Courier New';
        ctx.fillText('PRICE', padding - 40, padding);
        ctx.fillText('QUANTITY', padding + w - 50, padding + h + 30);

        const dPos = parseInt(dSlider.value) / 100;
        const sPos = parseInt(sSlider.value) / 100;

        dVal.innerText = dSlider.value;
        sVal.innerText = sSlider.value;

        // Demand Curve (Blue)
        ctx.strokeStyle = '#00e5ff';
        ctx.beginPath();
        ctx.moveTo(padding + (1 - dPos) * w * 0.2, padding + (1 - dPos) * h * 0.2);
        ctx.lineTo(padding + w - (1 - dPos) * w * 0.2, padding + h - (1 - dPos) * h * 0.2);
        ctx.stroke();

        // Supply Curve (Green)
        ctx.strokeStyle = '#00ff88';
        ctx.beginPath();
        ctx.moveTo(padding + (1 - sPos) * w * 0.2, padding + h - (1 - sPos) * h * 0.2);
        ctx.lineTo(padding + w - (1 - sPos) * w * 0.2, padding + (1 - sPos) * h * 0.2);
        ctx.stroke();

        // Intersection (Equilibrium) - Approx for visual
        const intersectX = padding + w / 2 + (dPos - sPos) * w * 0.5;
        const intersectY = padding + h / 2 + ((1 - dPos) - (1 - sPos)) * h * 0.5;

        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(intersectX, intersectY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#ffcc0088';
        ctx.beginPath();
        ctx.moveTo(padding, intersectY);
        ctx.lineTo(intersectX, intersectY);
        ctx.lineTo(intersectX, padding + h);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    dSlider.addEventListener('input', draw);
    sSlider.addEventListener('input', draw);
    draw();
}

// --- 3. OPPORTUNITY COST ---
function initOpportunity() {
    const canvas = document.getElementById('opportunityCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const btnA = document.getElementById('alloc-a-btn');
    const btnB = document.getElementById('alloc-b-btn');

    let countA = 5;
    let countB = 5;
    const max = 10;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = 40;
        const spacing = 10;
        const startX = (canvas.width - (max * (barWidth + spacing))) / 2;

        for (let i = 0; i < max; i++) {
            ctx.fillStyle = i < countA ? '#00e5ff33' : '#111';
            ctx.strokeStyle = i < countA ? '#00e5ff' : '#444';
            ctx.fillRect(startX + i * (barWidth + spacing), 50, barWidth, 100);
            ctx.strokeRect(startX + i * (barWidth + spacing), 50, barWidth, 100);

            ctx.fillStyle = i < countB ? '#ffcc0033' : '#111';
            ctx.strokeStyle = i < countB ? '#ffcc00' : '#444';
            ctx.fillRect(startX + i * (barWidth + spacing), 170, barWidth, 100);
            ctx.strokeRect(startX + i * (barWidth + spacing), 170, barWidth, 100);
        }

        ctx.fillStyle = '#fff';
        ctx.font = '14px Courier New';
        ctx.fillText(`PATH A: ${countA}`, startX, 40);
        ctx.fillText(`PATH B: ${countB}`, startX, 160);
    }

    btnA.addEventListener('click', () => {
        if (countA < max) {
            countA++;
            countB = max - countA;
            draw();
        }
    });

    btnB.addEventListener('click', () => {
        if (countB < max) {
            countB++;
            countA = max - countB;
            draw();
        }
    });

    draw();
}

// --- 4. MARGINAL UTILITY ---
function initMarginal() {
    const canvas = document.getElementById('marginalCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const btn = document.getElementById('drink-btn');

    let consumed = [];

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const padding = 40;
        const w = canvas.width - padding * 2;
        const h = canvas.height - padding * 2;

        ctx.strokeStyle = '#444';
        ctx.strokeRect(padding, padding, w, h);

        consumed.forEach((utility, i) => {
            const x = padding + (i * 40);
            const y = padding + h - (utility * h / 10);
            ctx.fillStyle = '#ff3366';
            ctx.fillRect(x, y, 30, (utility * h / 10));
        });

        ctx.fillStyle = '#fff';
        ctx.font = '12px Courier New';
        ctx.fillText('UTILITY PER UNIT', padding, padding - 10);
    }

    btn.addEventListener('click', () => {
        const lastUtility = consumed.length === 0 ? 10 : consumed[consumed.length - 1] * 0.7;
        if (consumed.length < 12) {
            consumed.push(lastUtility);
            draw();
        }
    });

    draw();
}

// --- 5. GAME THEORY ---
function initGameTheory() {
    const playBtn = document.getElementById('game-play-btn');
    const cells = [
        document.getElementById('cell-0-0'),
        document.getElementById('cell-0-1'),
        document.getElementById('cell-1-0'),
        document.getElementById('cell-1-1')
    ];

    playBtn.addEventListener('click', () => {
        cells.forEach(c => c.classList.remove('active'));
        // Simulated Nash Equilibrium bias (1,1)
        const rand = Math.random();
        let index;
        if (rand < 0.6) index = 3; // Betray/Betray
        else if (rand < 0.8) index = 2; // B/C
        else if (rand < 0.9) index = 1; // C/B
        else index = 0; // C/C

        cells[index].classList.add('active');
    });
}

// --- 6. ZERO-SUM VS POSITIVE-SUM ---
function initSumGames() {
    const canvas = document.getElementById('sumGamesCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const btnZero = document.getElementById('zero-sum-btn');
    const btnPos = document.getElementById('pos-sum-btn');

    let mode = 'zero'; // 'zero' or 'pos'
    let t = 0;
    
    function render() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 - 20;
        const baseRadius = 100;

        if (mode === 'zero') {
            const splitAngle = Math.PI + Math.sin(t * 0.03) * Math.PI * 0.4;

            // Player 1 (Blue)
            ctx.fillStyle = '#00e5ff';
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, baseRadius, 0, splitAngle);
            ctx.fill();

            // Player 2 (Red)
            ctx.fillStyle = '#ff3366';
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, baseRadius, splitAngle, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.font = '16px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('FIXED TOTAL VALUE (100%)', centerX, centerY + baseRadius + 40);
            
        } else {
            const growth = 1 + (Math.sin(t * 0.03) * 0.5 + 0.5); // 1 to 2
            const r1 = baseRadius * 0.6 * growth;
            const r2 = baseRadius * 0.6 * growth;

            // Player 1 (Blue)
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = '#00e5ff';
            ctx.beginPath();
            ctx.arc(centerX - 40, centerY, r1, 0, Math.PI * 2);
            ctx.fill();

            // Player 2 (Red)
            ctx.fillStyle = '#ff3366';
            ctx.beginPath();
            ctx.arc(centerX + 40, centerY, r2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';

            ctx.fillStyle = '#fff';
            ctx.font = '16px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('GROWING TOTAL VALUE (>100%)', centerX, centerY + baseRadius * 1.5 + 40);
        }

        t++;
        requestAnimationFrame(render);
    }

    btnZero.addEventListener('click', () => { mode = 'zero'; t = 0; });
    btnPos.addEventListener('click', () => { mode = 'pos'; t = 0; });

    render();
}
