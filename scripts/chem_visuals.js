// Chemistry First Principles Visualizations

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

// 1. Hero Visualization (Electron Probability Mesh)
function initHero() {
    const s = setupCanvas('heroCanvas');
    if (!s) return;
    const { ctx, width, height } = s;

    let points = [];
    for (let i = 0; i < 60; i++) {
        points.push({
            x: width / 2,
            y: height / 2,
            angle: Math.random() * Math.PI * 2,
            dist: 50 + Math.random() * 100,
            speed: 0.01 + Math.random() * 0.02
        });
    }

    function animate() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(255, 0, 255, 0.2)';
        ctx.lineWidth = 1;

        points.forEach(p => {
            p.angle += p.speed;
            const x = width / 2 + Math.cos(p.angle) * p.dist;
            const y = height / 2 + Math.sin(p.angle) * p.dist * 0.5;
            
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fillStyle = '#ff00ff';
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

// 2. Atomic Shell Model
const ELEMENTS = [
    { name: "Hydrogen", count: 1 }, { name: "Helium", count: 2 },
    { name: "Lithium", count: 3 }, { name: "Beryllium", count: 4 },
    { name: "Boron", count: 5 }, { name: "Carbon", count: 6 },
    { name: "Nitrogen", count: 7 }, { name: "Oxygen", count: 8 },
    { name: "Fluorine", count: 9 }, { name: "Neon", count: 10 },
    { name: "Sodium", count: 11 }, { name: "Magnesium", count: 12 },
    { name: "Aluminum", count: 13 }, { name: "Silicon", count: 14 },
    { name: "Phosphorus", count: 15 }, { name: "Sulfur", count: 16 },
    { name: "Chlorine", count: 17 }, { name: "Argon", count: 18 }
];

function initShells() {
    const s = setupCanvas('shellCanvas');
    if (!s) return;
    const { ctx, width, height } = s;

    const slider = document.getElementById('shell-count-slider');
    const label = document.getElementById('shell-count-val');
    let count = 6;

    slider.oninput = (e) => {
        count = parseInt(e.target.value);
        const element = ELEMENTS[count - 1];
        label.innerText = `${count} (${element.name})`;
    };

    function animate() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;

        // Nucleus
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fill();

        const shellRadii = [60, 100, 140];
        const shellCapacities = [2, 8, 8];
        let remainingElectrons = count;

        shellRadii.forEach((r, i) => {
            ctx.strokeStyle = '#222';
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();

            const electronsInShell = Math.min(remainingElectrons, shellCapacities[i]);
            for (let j = 0; j < electronsInShell; j++) {
                const angle = (j / shellCapacities[i]) * Math.PI * 2 + (Date.now() * 0.001 * (1 / (i + 1)));
                const ex = cx + Math.cos(angle) * r;
                const ey = cy + Math.sin(angle) * r;
                
                ctx.fillStyle = '#00ffd5';
                ctx.beginPath();
                ctx.arc(ex, ey, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            remainingElectrons -= electronsInShell;
        });

        requestAnimationFrame(animate);
    }
    animate();
}

// 3. Bonding Visualizer
function initBonding() {
    const s = setupCanvas('bondCanvas');
    if (!s) return;
    const { ctx, width, height } = s;

    const toggle = document.getElementById('bond-toggle');
    let isCovalent = false;
    toggle.oninput = (e) => isCovalent = e.target.checked;

    function animate() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        const leftX = width / 4 + 50;
        const rightX = 3 * width / 4 - 50;
        const cy = height / 2;

        // Nuclei
        ctx.fillStyle = '#333';
        ctx.beginPath(); ctx.arc(leftX, cy, 15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rightX, cy, 15, 0, Math.PI * 2); ctx.fill();

        if (!isCovalent) {
            // Ionic
            const x = rightX + Math.cos(Date.now() * 0.01) * 30;
            const y = cy + Math.sin(Date.now() * 0.01) * 30;
            ctx.fillStyle = '#ff00ff';
            ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
        } else {
            // Covalent
            const time = Date.now() * 0.005;
            const x = (leftX + rightX) / 2 + Math.cos(time) * 100;
            const y = cy + Math.sin(time * 2) * 20; // Figure 8 or pulse
            ctx.fillStyle = '#00ffd5';
            ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
            
            const x2 = (leftX + rightX) / 2 - Math.cos(time) * 100;
            const y2 = cy - Math.sin(time * 2) * 20;
            ctx.beginPath(); ctx.arc(x2, y2, 5, 0, Math.PI * 2); ctx.fill();
        }

        requestAnimationFrame(animate);
    }
    animate();
}

// 4. Polarity visualization
function initPolarity() {
    const s = setupCanvas('polarityCanvas');
    if (!s) return;
    const { ctx, width, height } = s;

    let dipoles = [];
    for(let i=0; i<30; i++) {
        dipoles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            angle: Math.random() * Math.PI * 2,
            targetAngle: Math.random() * Math.PI * 2
        });
    }

    document.getElementById('polarity-align-btn').onclick = () => {
        dipoles.forEach(d => d.targetAngle = 0);
    };

    function animate() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        dipoles.forEach(d => {
            d.angle += (d.targetAngle - d.angle) * 0.05;
            
            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(d.angle);
            
            // Draw H2O dipole
            ctx.fillStyle = 'blue';
            ctx.beginPath(); ctx.arc(-10, 0, 5, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'red';
            ctx.beginPath(); ctx.arc(10, 0, 8, 0, Math.PI*2); ctx.fill();
            
            ctx.restore();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

window.onload = () => {
    initHero();
    initShells();
    initBonding();
    initPolarity();
};
