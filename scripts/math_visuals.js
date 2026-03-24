// Mathematics Visualizations

document.addEventListener('DOMContentLoaded', () => {
    initHero();
    initPatternsViz();
    initGeometryViz();
    initFractalViz();
    initStatsViz();
    initBayesViz();
});

// --- Hero Animation (Number Flow) ---
function initHero() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    const digits = "0123456789πφεiΣ∫√∞";

    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                text: digits[Math.floor(Math.random() * digits.length)],
                size: Math.random() * 20 + 10,
                speedX: (Math.random() - 0.5) * 1,
                speedY: (Math.random() - 0.5) * 1,
                opacity: Math.random() * 0.5
            });
        }
    }

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            ctx.fillStyle = `rgba(255, 62, 62, ${p.opacity})`;
            ctx.font = `${p.size}px Outfit`;
            ctx.fillText(p.text, p.x, p.y);
            
            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        });

        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    createParticles();
    draw();
}

// --- Patterns (Fibonacci Spiral) ---
function initPatternsViz() {
    const canvas = document.getElementById('patternsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const slider = document.getElementById('patterns-slider');
    const valDisplay = document.getElementById('patterns-val');

    function draw() {
        const count = parseInt(slider.value);
        valDisplay.textContent = count;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);

        let phi = (1 + Math.sqrt(5)) / 2;
        let angle = 2 * Math.PI * (1 - 1 / phi);

        for (let i = 0; i < count; i++) {
            let r = 5 * Math.sqrt(i);
            let a = i * angle;
            let x = r * Math.cos(a);
            let y = r * Math.sin(a);

            ctx.fillStyle = i % 2 === 0 ? '#ffcc00' : '#ff3e3e';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    slider.addEventListener('input', draw);
    draw();
}

// --- Geometry (Interactive Triangle) ---
function initGeometryViz() {
    const canvas = document.getElementById('geometryCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const sliderA = document.getElementById('side-a');
    const sliderB = document.getElementById('side-b');
    const resDisplay = document.getElementById('side-c');

    function draw() {
        const a = parseInt(sliderA.value);
        const b = parseInt(sliderB.value);
        const c = Math.sqrt(a*a + b*b);
        resDisplay.textContent = c.toFixed(2);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const offsetX = 50;
        const offsetY = canvas.height - 50;

        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        ctx.lineTo(offsetX + a, offsetY);
        ctx.lineTo(offsetX, offsetY - b);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '12px Courier New';
        ctx.fillText(`a=${a}`, offsetX + a/2, offsetY + 20);
        ctx.fillText(`b=${b}`, offsetX - 30, offsetY - b/2);
        ctx.fillText(`c=${c.toFixed(1)}`, offsetX + a/2 + 5, offsetY - b/2 - 5);
    }

    sliderA.addEventListener('input', draw);
    sliderB.addEventListener('input', draw);
    draw();
}

// --- Chaos (Julia Set Fragment) ---
function initFractalViz() {
    const canvas = document.getElementById('chaosCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const res = 2; // Pixel size
    const width = canvas.width;
    const height = canvas.height;

    let cx = -0.7;
    let cy = 0.27015;

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        cx = ((e.clientX - rect.left) / width) * 2 - 1;
        cy = ((e.clientY - rect.top) / height) * 2 - 1;
        draw();
    });

    function draw() {
        for (let x = 0; x < width; x += res) {
            for (let y = 0; y < height; y += res) {
                let zx = 1.5 * (x - width / 2) / (0.5 * width);
                let zy = (y - height / 2) / (0.5 * height);
                let i = 64;
                while (zx * zx + zy * zy < 4 && i > 0) {
                    let tmp = zx * zx - zy * zy + cx;
                    zy = 2.0 * zx * zy + cy;
                    zx = tmp;
                    i--;
                }
                ctx.fillStyle = `rgb(${i * 4}, 0, ${i * 2})`;
                ctx.fillRect(x, y, res, res);
            }
        }
    }

    draw();
}

// --- Statistics (Galton Board) ---
function initStatsViz() {
    const canvas = document.getElementById('statsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const drop10Btn = document.getElementById('drop-ball-btn');
    const drop100Btn = document.getElementById('drop-multi-btn');
    const resetBtn = document.getElementById('reset-stats-btn');

    const numRows = 12;
    const bins = new Array(numRows + 1).fill(0);
    let balls = [];
    const pegRadius = 3;
    const ballRadius = 4;
    const pegSpacingX = 40;
    const pegSpacingY = 25;

    function reset() {
        balls = [];
        bins.fill(0);
    }

    function dropBall() {
        balls.push({
            x: canvas.width / 2,
            y: 20,
            row: 0,
            col: 0,
            active: true
        });
    }

    function update() {
        balls.forEach(b => {
            if (!b.active) return;

            // Simple "discrete" jump animation
            b.y += 2;
            
            // Check if we hit a row of pegs
            const rowY = 50 + b.row * pegSpacingY;
            if (b.y >= rowY && b.row < numRows) {
                // Bounce left or right
                const rand = Math.random() < 0.5 ? -1 : 1;
                b.col += rand;
                b.row++;
                b.x = (canvas.width / 2) + (b.col * (pegSpacingX / 2));
            }

            // Hit bottom
            if (b.row === numRows && b.y > 50 + numRows * pegSpacingY + 10) {
                const binIdx = Math.floor((b.col + numRows) / 2);
                if (binIdx >= 0 && binIdx < bins.length) {
                    bins[binIdx]++;
                }
                b.active = false;
            }
        });
        
        // Remove inactive balls periodically or keep them? 
        // Let's keep a limit to avoid performance issues
        if (balls.length > 200) balls.shift();
    }

    function draw() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Pegs
        ctx.fillStyle = '#333';
        for (let r = 0; r < numRows; r++) {
            for (let c = 0; c <= r; c++) {
                const px = (canvas.width / 2) + (c - r / 2) * pegSpacingX;
                const py = 50 + r * pegSpacingY;
                ctx.beginPath();
                ctx.arc(px, py, pegRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw Bins/Histogram
        const binWidth = pegSpacingX;
        const binStartX = (canvas.width / 2) - (numRows / 2) * binWidth;
        const bottomY = canvas.height - 20;

        bins.forEach((count, i) => {
            const bx = binStartX + i * binWidth;
            const bh = Math.min(count * 5, 150); // Scale height
            
            // Bin outline
            ctx.strokeStyle = '#222';
            ctx.strokeRect(bx - binWidth/2, bottomY - 150, binWidth, 150);

            // Fill bar
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(bx - binWidth/2 + 2, bottomY - bh, binWidth - 4, bh);
        });

        // Draw Balls
        ctx.fillStyle = '#ff3e3e';
        balls.forEach(b => {
            if (b.active) {
                ctx.beginPath();
                ctx.arc(b.x, b.y, ballRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Draw Bell Curve Overlay (Target)
        if (balls.length > 50) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            for (let x = 0; x < canvas.width; x++) {
                const normX = (x - canvas.width/2) / (numRows * 5);
                const y = bottomY - 140 * Math.exp(-0.5 * normX * normX);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }

        requestAnimationFrame(draw);
    }

    // Animation Loop
    function animate() {
        update();
        // draw() is called by requestAnimationFrame
    }
    
    // We'll use a single rAF for both update and draw
    function run() {
        update();
        draw();
        requestAnimationFrame(run);
    }

    drop10Btn.addEventListener('click', () => {
        for (let i = 0; i < 10; i++) setTimeout(dropBall, i * 100);
    });

    drop100Btn.addEventListener('click', () => {
        for (let i = 0; i < 100; i++) setTimeout(dropBall, i * 20);
    });

    resetBtn.addEventListener('click', reset);

    run();
}

// --- Bayesian Probability (Logic of Belief) ---
function initBayesViz() {
    const canvas = document.getElementById('bayesCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const priorSlider = document.getElementById('prior-slider');
    const evidenceSlider = document.getElementById('evidence-slider');
    const priorValDisplay = document.getElementById('prior-val');
    const evidenceValDisplay = document.getElementById('evidence-val');
    const posteriorValDisplay = document.getElementById('posterior-val');

    function calculateBayes() {
        const prior = parseInt(priorSlider.value) / 100;
        const sensitivity = parseInt(evidenceSlider.value) / 100;
        const fpr = 0.1; // False Positive Rate fixed at 10% for simplicity

        // Bayes Theorem: P(H|E) = P(E|H)*P(H) / [P(E|H)*P(H) + P(E|~H)*P(~H)]
        const numerator = sensitivity * prior;
        const denominator = (sensitivity * prior) + (fpr * (1 - prior));
        const posterior = numerator / denominator;

        priorValDisplay.textContent = priorSlider.value;
        evidenceValDisplay.textContent = evidenceSlider.value;
        posteriorValDisplay.textContent = (posterior * 100).toFixed(1);

        return { prior, posterior };
    }

    function draw() {
        const { prior, posterior } = calculateBayes();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerY = canvas.height / 2;
        const barWidth = 300;
        const barHeight = 40;
        const startX = (canvas.width - barWidth) / 2;

        // Draw Prior Bar
        ctx.fillStyle = '#222';
        ctx.fillRect(startX, centerY - 50, barWidth, barHeight);
        ctx.fillStyle = '#ff00ff';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(startX, centerY - 50, barWidth * prior, barHeight);
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = '#ff00ff';
        ctx.strokeRect(startX, centerY - 50, barWidth, barHeight);

        ctx.fillStyle = '#fff';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText(`PRIOR BELIEF: ${(prior * 100).toFixed(0)}%`, startX, centerY - 60);

        // Draw Posterior Bar
        ctx.fillStyle = '#222';
        ctx.fillRect(startX, centerY + 10, barWidth, barHeight);
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(startX, centerY + 10, barWidth * posterior, barHeight);
        ctx.strokeStyle = '#ff00ff';
        ctx.strokeRect(startX, centerY + 10, barWidth, barHeight);

        ctx.fillStyle = '#fff';
        ctx.fillText(`POSTERIOR (UPDATED): ${(posterior * 100).toFixed(1)}%`, startX, centerY + 65);

        // Draw arrow/connection
        ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(startX + (barWidth * prior), centerY - 10);
        ctx.lineTo(startX + (barWidth * posterior), centerY + 10);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.font = '10px Courier New';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#aaa';
        ctx.fillText("EVIDENCE APPLIED", canvas.width / 2, centerY + 5);
    }

    priorSlider.addEventListener('input', draw);
    evidenceSlider.addEventListener('input', draw);
    draw();
}
