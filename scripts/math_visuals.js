// Mathematics Visualizations

document.addEventListener('DOMContentLoaded', () => {
    initHero();
    initPatternsViz();
    initGeometryViz();
    initFractalViz();
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
