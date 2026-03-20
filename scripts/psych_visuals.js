// Psychology Visualizations

document.addEventListener('DOMContentLoaded', () => {
    initHero();
    initNeuronViz();
    initPerceptionViz();
    initDecisionViz();
});

// --- Hero Animation (Neural Map) ---
function initHero() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let nodes = [];
    const numNodes = 40;

    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }

    function createNodes() {
        nodes = [];
        for (let i = 0; i < numNodes; i++) {
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                pulse: 0
            });
        }
    }

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        nodes.forEach((n, i) => {
            n.x += n.vx;
            n.y += n.vy;

            if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
            if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 0, 128, ${0.5 + Math.sin(n.pulse) * 0.5})`;
            ctx.fill();
            n.pulse += 0.02;

            // Connect to nearby nodes
            for (let j = i + 1; j < nodes.length; j++) {
                const n2 = nodes[j];
                const dx = n.x - n2.x;
                const dy = n.y - n2.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 100) {
                    ctx.strokeStyle = `rgba(138, 43, 226, ${1 - dist/100})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(n.x, n.y);
                    ctx.lineTo(n2.x, n2.y);
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    createNodes();
    draw();
}

// --- Biological Machine (Neuron Firing) ---
function initNeuronViz() {
    const canvas = document.getElementById('neuronCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const fireBtn = document.getElementById('fire-neuron');

    let pulse = -1;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Neuron Structure
        ctx.strokeStyle = '#331122';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX - 100, centerY, 30, 0, Math.PI * 2);
        ctx.moveTo(centerX - 70, centerY);
        ctx.lineTo(centerX + 70, centerY);
        ctx.arc(centerX + 100, centerY, 30, 0, Math.PI * 2);
        ctx.stroke();

        if (pulse >= 0) {
            pulse += 5;
            ctx.fillStyle = '#ff0080';
            ctx.beginPath();
            ctx.arc(centerX - 100 + pulse, centerY, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff0080';
            ctx.fill();
            ctx.shadowBlur = 0;

            if (pulse > 200) {
                pulse = -1;
            }
        }
        requestAnimationFrame(draw);
    }

    fireBtn.addEventListener('click', () => {
        if (pulse < 0) pulse = 0;
    });
    draw();
}

// --- Perception (Hering Illusion Interactive) ---
function initPerceptionViz() {
    const canvas = document.getElementById('perceptionCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const slider = document.getElementById('illusion-slider');

    function draw() {
        const distort = parseFloat(slider.value);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Vanishing point lines
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        for (let i = 0; i < 40; i++) {
            const angle = (i / 40) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(angle) * 1000, centerY + Math.sin(angle) * 1000);
            ctx.stroke();
        }

        // Parallel lines (that look curved)
        ctx.strokeStyle = '#ff0080';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(centerX - 50, 0);
        ctx.bezierCurveTo(centerX - 50 - distort, centerY, centerX - 50 - distort, centerY, centerX - 50, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX + 50, 0);
        ctx.bezierCurveTo(centerX + 50 + distort, centerY, centerX + 50 + distort, centerY, centerX + 50, canvas.height);
        ctx.stroke();
    }

    slider.addEventListener('input', draw);
    draw();
}

// --- Decision (Response Delay) ---
function initDecisionViz() {
    const canvas = document.getElementById('decisionCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-test');
    const resultDisplay = document.getElementById('test-result');

    let state = 'idle'; // idle, waiting, active, finished
    let startTime = 0;
    let waitTimer = 0;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (state === 'idle') {
            ctx.fillStyle = '#333';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = '20px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText('Press Start', canvas.width/2, canvas.height/2);
        } else if (state === 'waiting') {
            ctx.fillStyle = '#ff0080';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (state === 'active') {
            ctx.fillStyle = '#00ffaa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000';
            ctx.fillText('CLICK NOW!', canvas.width/2, canvas.height/2);
        }
        requestAnimationFrame(draw);
    }

    startBtn.addEventListener('click', () => {
        if (state === 'idle' || state === 'finished') {
            state = 'waiting';
            resultDisplay.textContent = 'Wait for green...';
            waitTimer = setTimeout(() => {
                state = 'active';
                startTime = Date.now();
            }, 1000 + Math.random() * 3000);
        }
    });

    canvas.addEventListener('click', () => {
        if (state === 'active') {
            const diff = Date.now() - startTime;
            state = 'finished'; // Go back to idle or finished
            resultDisplay.textContent = `Response time: ${diff}ms`;
            setTimeout(() => { state = 'idle'; }, 2000);
        } else if (state === 'waiting') {
            clearTimeout(waitTimer);
            state = 'idle';
            resultDisplay.textContent = 'Too early!';
        }
    });

    draw();
}
