// Physics First Principles Visualizations

const canvasDPI = window.devicePixelRatio || 1;

function setupCanvas(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * canvasDPI;
    canvas.height = rect.height * canvasDPI;
    ctx.scale(canvasDPI, canvasDPI);
    return { canvas, ctx, width: rect.width, height: rect.height };
}

// 1. Hero Visualization (Particle Mesh / Grid)
function initHero() {
    const s = setupCanvas('heroCanvas');
    if (!s) return;
    const { ctx, width, height } = s;

    let particles = [];
    for (let i = 0; i < 40; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
        });
    }

    function animate() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = '#332200';
        ctx.lineWidth = 0.5;

        for (let i = 0; i < particles.length; i++) {
            let p1 = particles[i];
            p1.x += p1.vx;
            p1.y += p1.vy;

            if (p1.x < 0 || p1.x > width) p1.vx *= -1;
            if (p1.y < 0 || p1.y > height) p1.vy *= -1;

            for (let j = i + 1; j < particles.length; j++) {
                let p2 = particles[j];
                let dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// 2. Entropy Simulation
function initEntropy() {
    const s = setupCanvas('entropyCanvas');
    if (!s) return;
    const { ctx, width, height } = s;

    let particles = [];
    function reset() {
        particles = [];
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: 10 + Math.random() * 50,
                y: height / 2 + (Math.random() - 0.5) * 50,
                vx: Math.random() * 2 + 1,
                vy: (Math.random() - 0.5) * 2,
                color: '#ffaa00'
            });
        }
    }
    reset();

    document.getElementById('entropy-shake-btn').onclick = reset;

    function animate() {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, 0, width, height);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// 3. Wave Collapse
function initWave() {
    const s = setupCanvas('waveCanvas');
    if (!s) return;
    const { ctx, width, height } = s;

    let time = 0;
    let collapsed = false;
    let collapsePos = { x: 0, y: 0 };

    document.getElementById('wave-observe-btn').onclick = () => {
        collapsed = !collapsed;
        if (collapsed) {
            collapsePos = { x: width / 2 + (Math.random() - 0.5) * 100, y: height / 2 };
        }
    };

    function animate() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        if (!collapsed) {
            ctx.strokeStyle = '#9d00ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = 0; x < width; x += 5) {
                let amplitude = Math.exp(-((x - width / 2) ** 2) / 2000);
                let y = height / 2 + amplitude * 50 * Math.sin(x * 0.1 - time * 0.05);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            time++;
        } else {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(collapsePos.x, collapsePos.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#fff';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// 4. Gravity Warp
function initGravity() {
    const s = setupCanvas('gravityCanvas');
    if (!s) return;
    const { ctx, width, height } = s;

    let mass = 50;
    const massSlider = document.getElementById('gravity-mass-slider');
    const massVal = document.getElementById('gravity-mass-val');

    massSlider.oninput = (e) => {
        mass = parseInt(e.target.value);
        massVal.innerText = mass;
    };

    function animate() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;
        const spacing = 25;

        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;

        for (let x = 0; x <= width; x += spacing) {
            ctx.beginPath();
            for (let y = 0; y <= height; y += 5) {
                let dx = x - centerX;
                let dy = y - centerY;
                let dist = Math.sqrt(dx * dx + dy * dy);
                let dip = mass * 1500 / (dist + 50) ** 1.5;

                // Project 3D to 2D
                let pY = y + dip;
                if (y === 0) ctx.moveTo(x, pY);
                else ctx.lineTo(x, pY);
            }
            ctx.stroke();
        }

        for (let y = 0; y <= height; y += spacing) {
            ctx.beginPath();
            for (let x = 0; x <= width; x += 5) {
                let dx = x - centerX;
                let dy = y - centerY;
                let dist = Math.sqrt(dx * dx + dy * dy);
                let dip = mass * 1500 / (dist + 50) ** 1.5;

                let pY = y + dip;
                if (x === 0) ctx.moveTo(x, pY);
                else ctx.lineTo(x, pY);
            }
            ctx.stroke();
        }

        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.arc(centerX, centerY + (mass * 1500 / (50) ** 1.5), 10, 0, Math.PI * 2);
        ctx.fill();

        requestAnimationFrame(animate);
    }
    animate();
}

// 5. Relativistic Light Clock
function initLightClock() {
    const s = setupCanvas('lightClockCanvas');
    if (!s) return;
    const { ctx, width, height } = s;

    let velocity = 0; // v/c
    const vSlider = document.getElementById('light-v-slider');
    const vVal = document.getElementById('light-v-val');

    vSlider.oninput = (e) => {
        velocity = parseFloat(e.target.value);
        vVal.innerText = velocity.toFixed(2);
    };

    let time = 0;
    const mirrL = 100; // Distance between mirrors
    const mirrW = 80;  // Mirror width
    const centerX = width / 2;
    const centerY = height / 2;

    function animate() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        const drawClock = (x, v, label) => {
            const relX = x;
            const topY = centerY - mirrL / 2;
            const botY = centerY + mirrL / 2;

            // Draw Mirrors
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(relX - mirrW / 2, topY);
            ctx.lineTo(relX + mirrW / 2, topY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(relX - mirrW / 2, botY);
            ctx.lineTo(relX + mirrW / 2, botY);
            ctx.stroke();

            // Calculate photon position
            // In stationary frame, light goes up and down with period 2L/c
            // Let's say c = 2 pixels/frame for visualization
            const c = 3; 
            const period = (2 * mirrL) / c;
            const tMod = time % (period / Math.sqrt(1 - v * v));
            
            // To make it look right, we'll calculate the sawtooth wave
            // In the stationary frame:
            let photonY;
            const progress = (time * c) % (2 * mirrL);
            if (progress < mirrL) {
                photonY = botY - progress;
            } else {
                photonY = topY + (progress - mirrL);
            }

            // In moving frame, we need to show the zigzag
            // But actually, we just want to show the TIME DILATION effect.
            // A better way is to have a "local time" for each clock.
            const localTime = time * Math.sqrt(1 - v * v);
            const localProgress = (localTime * c) % (2 * mirrL);
            let localY;
            if (localProgress < mirrL) {
                localY = botY - localProgress;
            } else {
                localY = topY + (localProgress - mirrL);
            }

            // Draw Photon
            ctx.fillStyle = '#ffaa00';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ffaa00';
            ctx.beginPath();
            ctx.arc(relX, localY, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw Label
            ctx.fillStyle = '#888';
            ctx.font = '12px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(label, relX, botY + 30);
            
            // Calculate and show time dilation factor
            const gamma = 1 / Math.sqrt(1 - v * v);
            ctx.fillText(`Δt' = ${gamma.toFixed(2)} Δt₀`, relX, botY + 50);
        };

        drawClock(width * 0.25, 0, "STATIONARY (v=0)");
        drawClock(width * 0.75, velocity, `MOVING (v=${velocity}c)`);

        time++;
        requestAnimationFrame(animate);
    }
    animate();
}

// Initialize all
window.onload = () => {
    initHero();
    initEntropy();
    initWave();
    initGravity();
    initLightClock();
};
