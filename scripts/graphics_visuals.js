/**
 * Graphics Visuals - Polymath Series
 * Implementation of 3D transformations, rasterization, and shader-like effects.
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeroCube();
    initVertexTransformer();
    initRasterVisualizer();
    initShaderPlayground();
});

// --- HELPER: Simple 3D Engine from Scratch ---

class Point3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

function project(point, width, height, fov) {
    const factor = fov / (point.z + fov);
    const x = point.x * factor + width / 2;
    const y = -point.y * factor + height / 2;
    return { x, y };
}

function rotateX(point, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const y = point.y * cos - point.z * sin;
    const z = point.y * sin + point.z * cos;
    return new Point3D(point.x, y, z);
}

function rotateY(point, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = point.x * cos + point.z * sin;
    const z = -point.x * sin + point.z * cos;
    return new Point3D(x, point.y, z);
}

// --- 1. HERO CUBE ---

function initHeroCube() {
    const canvas = document.getElementById('hero-cube-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const vertices = [
        new Point3D(-1, 1, -1), new Point3D(1, 1, -1), new Point3D(1, -1, -1), new Point3D(-1, -1, -1),
        new Point3D(-1, 1, 1), new Point3D(1, 1, 1), new Point3D(1, -1, 1), new Point3D(-1, -1, 1)
    ];

    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    let angleX = 0;
    let angleY = 0;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        angleX += 0.01;
        angleY += 0.015;

        const transformed = vertices.map(v => {
            let p = rotateX(v, angleX);
            p = rotateY(p, angleY);
            p.x *= 100; p.y *= 100; p.z *= 100;
            return project(p, canvas.width, canvas.height, 400);
        });

        ctx.strokeStyle = '#ccff00';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(204, 255, 0, 0.5)';

        edges.forEach(edge => {
            const p1 = transformed[edge[0]];
            const p2 = transformed[edge[1]];
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

// --- 2. VERTEX TRANSFORMER ---

function initVertexTransformer() {
    const canvas = document.getElementById('vertex-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const rotXInput = document.getElementById('rot-x');
    const rotYInput = document.getElementById('rot-y');
    const fovInput = document.getElementById('fov');

    const vertices = [
        new Point3D(-1, 1, -1), new Point3D(1, 1, -1), new Point3D(1, -1, -1), new Point3D(-1, -1, -1),
        new Point3D(-1, 1, 1), new Point3D(1, 1, 1), new Point3D(1, -1, 1), new Point3D(-1, -1, 1)
    ];

    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    function draw() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const angleX = parseFloat(rotXInput.value);
        const angleY = parseFloat(rotYInput.value);
        const fov = parseFloat(fovInput.value);

        const transformed = vertices.map(v => {
            let p = rotateX(v, angleX);
            p = rotateY(p, angleY);
            p.x *= 100; p.y *= 100; p.z *= 100;
            return project(p, canvas.width, canvas.height, fov);
        });

        // Draw coordinate axes
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height/2); ctx.lineTo(canvas.width, canvas.height/2);
        ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw edges
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1.5;
        edges.forEach(edge => {
            const p1 = transformed[edge[0]];
            const p2 = transformed[edge[1]];
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        });

        // Draw vertex points
        ctx.fillStyle = '#fff';
        transformed.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    [rotXInput, rotYInput, fovInput].forEach(input => {
        input.addEventListener('input', draw);
    });

    draw();
}

// --- 3. RASTER VISUALIZER ---

function initRasterVisualizer() {
    const canvas = document.getElementById('raster-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const toggleGridBtn = document.getElementById('toggle-grid');
    const animateBtn = document.getElementById('animate-triangle');

    let showGrid = true;
    let t = 0;
    let animating = false;

    function drawTriangle(p1, p2, p3) {
        // Draw the math triangle
        ctx.strokeStyle = 'rgba(204, 255, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.stroke();

        // Rasterization (simplified scanline/sampling)
        const gridSize = 15;
        ctx.fillStyle = '#ccff00';
        for (let x = 0; x < canvas.width; x += gridSize) {
            for (let y = 0; y < canvas.height; y += gridSize) {
                if (isInside(x, y, p1, p2, p3)) {
                    ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
                }
            }
        }

        if (showGrid) {
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 0.5;
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            }
        }
    }

    function isInside(px, py, p1, p2, p3) {
        const area = 0.5 * (-p2.y * p3.x + p1.y * (-p2.x + p3.x) + p1.x * (p2.y - p3.y) + p2.x * p3.y);
        const s = 1 / (2 * area) * (p1.y * p3.x - p1.x * p3.y + (p3.y - p1.y) * px + (p1.x - p3.x) * py);
        const t = 1 / (2 * area) * (p1.x * p2.y - p1.y * p2.x + (p1.y - p2.y) * px + (p2.x - p1.x) * py);
        return s > 0 && t > 0 && (1 - s - t) > 0;
    }

    function render() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const p1 = { x: 300 + Math.cos(t) * 100, y: 150 + Math.sin(t) * 50 };
        const p2 = { x: 450 + Math.sin(t*0.5) * 50, y: 300 };
        const p3 = { x: 150, y: 300 - Math.cos(t*0.8) * 40 };

        drawTriangle(p1, p2, p3);

        if (animating) {
            t += 0.02;
            requestAnimationFrame(render);
        }
    }

    toggleGridBtn.addEventListener('click', () => {
        showGrid = !showGrid;
        if (!animating) render();
    });

    animateBtn.addEventListener('click', () => {
        animating = !animating;
        if (animating) render();
    });

    render();
}

// --- 4. SHADER PLAYGROUND (GLSL emulation via JS) ---

function initShaderPlayground() {
    const canvas = document.getElementById('shader-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const speedInput = document.getElementById('shader-speed');
    const complexInput = document.getElementById('shader-complexity');

    let time = 0;
    const res = 4; // Downsample for performance emulating fragment shaders in JS

    function renderPulse() {
        const speed = parseFloat(speedInput.value);
        const complexity = parseFloat(complexInput.value);
        
        const width = canvas.width;
        const height = canvas.height;
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        for (let y = 0; y < height; y += res) {
            for (let x = 0; x < width; x += res) {
                const nx = x / width - 0.5;
                const ny = y / height - 0.5;
                
                let v = 0;
                v += Math.sin(nx * complexity + time);
                v += Math.sin((ny * complexity + time) / 2.0);
                v += Math.sin((nx * complexity + ny * complexity + time) / 2.0);
                
                const cx = nx + 0.5 * Math.sin(time / 5.0);
                const cy = ny + 0.5 * Math.cos(time / 3.0);
                v += Math.sin(Math.sqrt(128.0 * (cx * cx + cy * cy) + 1.0) + time);
                
                const r = Math.sin(v * Math.PI) * 127 + 128;
                const g = Math.cos(v * Math.PI) * 127 + 128;
                const b = Math.sin(v * Math.PI + Math.PI/2) * 127 + 128;

                // Fill pixel block (emulating fragment shader output)
                for (let by = 0; by < res && (y + by) < height; by++) {
                    for (let bx = 0; bx < res && (x + bx) < width; bx++) {
                        const idx = ((y + by) * width + (x + bx)) * 4;
                        // Use Electric Lime tint
                        data[idx] = r * 0.5;
                        data[idx + 1] = g;
                        data[idx + 2] = b * 0.2;
                        data[idx + 3] = 255;
                    }
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
        time += 0.05 * speed;
        requestAnimationFrame(renderPulse);
    }

    renderPulse();
}
