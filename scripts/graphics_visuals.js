/**
 * Graphics Visuals - Polymath Series
 * Implementation of 3D transformations, rasterization, and shader-like effects.
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeroCube();
    initCartesianPlane();
    initVertexTransformer();
    initRasterVisualizer();
    initAntialiasing();
    initShaderPlayground();
    initRayTracer();
});

// --- 1.5 CARTESIAN PLANE ---

function initCartesianPlane() {
    const canvas = document.getElementById('cartesianCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const toggleBtn = document.getElementById('toggle-dimensions');
    const sliderX = document.getElementById('slider-cx');
    const sliderY = document.getElementById('slider-cy');
    const sliderZ = document.getElementById('slider-cz');
    
    const labelX = document.getElementById('coord-x');
    const labelY = document.getElementById('coord-y');
    const labelZ = document.getElementById('coord-z');
    const groupZ = document.getElementById('group-cz');

    let is3D = false;

    toggleBtn.addEventListener('click', () => {
        is3D = !is3D;
        toggleBtn.textContent = is3D ? 'Switch to 2D Space' : 'Switch to 3D Space';
        groupZ.style.display = is3D ? 'flex' : 'none';
        draw();
    });

    function draw() {
        const xVal = parseFloat(sliderX.value);
        const yVal = parseFloat(sliderY.value);
        const zVal = is3D ? parseFloat(sliderZ.value) : 0;

        labelX.textContent = xVal.toFixed(1);
        labelY.textContent = yVal.toFixed(1);
        if (is3D) labelZ.textContent = zVal.toFixed(1);

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const scale = 15; // pixels per unit

        if (!is3D) {
            // 2D Grid
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 1;
            for (let i = 0; i <= canvas.width; i += scale) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
            }
            for (let j = 0; j <= canvas.height; j += scale) {
                ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
            }

            // 2D Axes
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height); ctx.stroke();

            // 2D Target point
            const px = cx + xVal * scale;
            const py = cy - yVal * scale;

            // 2D coordinate lines
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = '#ccff00';
            ctx.beginPath();
            ctx.moveTo(px, cy);
            ctx.lineTo(px, py);
            ctx.lineTo(cx, py);
            ctx.stroke();
            ctx.setLineDash([]);

            // 2D Point
            ctx.fillStyle = '#ccff00';
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, Math.PI * 2);
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ccff00';
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // 2D Text
            ctx.fillStyle = '#fff';
            ctx.font = '14px Courier New';
            ctx.fillText(`(${xVal.toFixed(1)}, ${yVal.toFixed(1)})`, px + 10, py - 10);
        } else {
            // 3D Logic
            const fov = 400;
            const angleX = 0.4;
            const angleY = -0.6;

            function processPoint(px, py, pz) {
                let p = new Point3D(px * scale, py * scale, pz * scale);
                p = rotateX(p, angleX);
                p = rotateY(p, angleY);
                return project(p, canvas.width, canvas.height, fov);
            }

            // 3D Axes
            const origin = processPoint(0, 0, 0);

            // X axis (red)
            const xAx1 = processPoint(-15, 0, 0);
            const xAx2 = processPoint(15, 0, 0);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ff3333';
            ctx.beginPath(); ctx.moveTo(xAx1.x, xAx1.y); ctx.lineTo(origin.x, origin.y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(xAx2.x, xAx2.y); ctx.stroke();

            // Y axis (green)  (+Y is technically up in project helper by inverting)
            const yAx1 = processPoint(0, -10, 0);
            const yAx2 = processPoint(0, 10, 0);
            ctx.strokeStyle = '#33ff33';
            ctx.beginPath(); ctx.moveTo(yAx1.x, yAx1.y); ctx.lineTo(origin.x, origin.y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(yAx2.x, yAx2.y); ctx.stroke();

            // Z axis (blue)
            const zAx1 = processPoint(0, 0, -15);
            const zAx2 = processPoint(0, 0, 15);
            ctx.strokeStyle = '#3366ff';
            ctx.beginPath(); ctx.moveTo(zAx1.x, zAx1.y); ctx.lineTo(origin.x, origin.y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(zAx2.x, zAx2.y); ctx.stroke();

            // 3D Target point
            const pt = processPoint(xVal, yVal, zVal);
            
            // Projections onto planes
            const pxz = processPoint(xVal, 0, zVal);
            const pxy = processPoint(xVal, yVal, 0);
            const pyz = processPoint(0, yVal, zVal);
            const px = processPoint(xVal, 0, 0);
            const py = processPoint(0, yVal, 0);
            const pz = processPoint(0, 0, zVal);

            // Draw connecting lines
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = 'rgba(204, 255, 0, 0.6)';
            
            // Box edges to point
            ctx.beginPath(); ctx.moveTo(pt.x, pt.y); ctx.lineTo(pxz.x, pxz.y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(pt.x, pt.y); ctx.lineTo(pxy.x, pxy.y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(pt.x, pt.y); ctx.lineTo(pyz.x, pyz.y); ctx.stroke();

            // Box edges on XZ plane
            ctx.beginPath(); ctx.moveTo(pxz.x, pxz.y); ctx.lineTo(px.x, px.y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(pxz.x, pxz.y); ctx.lineTo(pz.x, pz.y); ctx.stroke();

            // Box edges on XY plane
            ctx.beginPath(); ctx.moveTo(pxy.x, pxy.y); ctx.lineTo(px.x, px.y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(pxy.x, pxy.y); ctx.lineTo(py.x, py.y); ctx.stroke();
            
            // Box edges on YZ plane
            ctx.beginPath(); ctx.moveTo(pyz.x, pyz.y); ctx.lineTo(py.x, py.y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(pyz.x, pyz.y); ctx.lineTo(pz.x, pz.y); ctx.stroke();

            ctx.setLineDash([]);

            // 3D Point
            ctx.fillStyle = '#ccff00';
            ctx.beginPath(); ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2); 
            ctx.shadowBlur = 10; ctx.shadowColor = '#ccff00'; ctx.fill(); ctx.shadowBlur = 0;

            // 3D Text
            ctx.fillStyle = '#fff';
            ctx.font = '14px Courier New';
            ctx.fillText(`(${xVal.toFixed(1)}, ${yVal.toFixed(1)}, ${zVal.toFixed(1)})`, pt.x + 10, pt.y - 10);
        }
    }

    sliderX.addEventListener('input', draw);
    sliderY.addEventListener('input', draw);
    if(sliderZ) sliderZ.addEventListener('input', draw);
    draw();
}

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
        ctx.moveTo(0, canvas.height / 2); ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height);
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
        const p2 = { x: 450 + Math.sin(t * 0.5) * 50, y: 300 };
        const p3 = { x: 150, y: 300 - Math.cos(t * 0.8) * 40 };

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

// --- 3.5 ANTI-ALIASING VISUALIZER (Bresenham vs Wu) ---

function initAntialiasing() {
    const canvas = document.getElementById('aa-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const toggleBtn = document.getElementById('toggle-aa');
    const angleSlider = document.getElementById('aa-angle');
    const angleDisplay = document.getElementById('aa-angle-display');

    let aaEnabled = false;

    toggleBtn.addEventListener('click', () => {
        aaEnabled = !aaEnabled;
        toggleBtn.textContent = aaEnabled ? "Disable Anti-Aliasing (Bresenham)" : "Enable Anti-Aliasing (Wu's Algorithm)";
        draw();
    });

    // Helper functions for Wu's algorithm
    function ipart(x) { return Math.floor(x); }
    function round(x) { return ipart(x + 0.5); }
    function fpart(x) { return x - Math.floor(x); }
    function rfpart(x) { return 1 - fpart(x); }

    function draw() {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const angleDeg = parseFloat(angleSlider.value);
        angleDisplay.textContent = angleDeg;
        
        const angle = angleDeg * (Math.PI / 180);
        const pixelSize = 10;
        
        const cxGrid = Math.floor(canvas.width / 2 / pixelSize);
        const cyGrid = Math.floor(canvas.height / 2 / pixelSize);
        const lengthGrid = 15;

        // Line endpoints
        const x0 = cxGrid - Math.cos(angle) * lengthGrid;
        const y0 = cyGrid + Math.sin(angle) * lengthGrid;
        const x1 = cxGrid + Math.cos(angle) * lengthGrid;
        const y1 = cyGrid - Math.sin(angle) * lengthGrid;

        function plot(x, y, c) {
            ctx.fillStyle = `rgba(204, 255, 0, ${c})`;
            ctx.fillRect(Math.floor(x) * pixelSize, Math.floor(y) * pixelSize, pixelSize, pixelSize);
        }

        function drawLineBresenham(x0, y0, x1, y1) {
            let x0i = Math.round(x0), y0i = Math.round(y0);
            let x1i = Math.round(x1), y1i = Math.round(y1);
            let dx = Math.abs(x1i - x0i), sx = x0i < x1i ? 1 : -1;
            let dy = Math.abs(y1i - y0i), sy = y0i < y1i ? 1 : -1;
            let err = (dx > dy ? dx : -dy) / 2, e2; 
            
            while (true) {
                plot(x0i, y0i, 1);
                if (x0i === x1i && y0i === y1i) break;
                e2 = err;
                if (e2 > -dx) { err -= dy; x0i += sx; }
                if (e2 < dy) { err += dx; y0i += sy; }
            }
        }

        function drawLineWu(x0, y0, x1, y1) {
            let steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
            let temp;
            if (steep) {
                temp = x0; x0 = y0; y0 = temp;
                temp = x1; x1 = y1; y1 = temp;
            }
            if (x0 > x1) {
                temp = x0; x0 = x1; x1 = temp;
                temp = y0; y0 = y1; y1 = temp;
            }

            let dx = x1 - x0;
            let dy = y1 - y0;
            let gradient = dx === 0 ? 1 : dy / dx;

            let xend = round(x0);
            let yend = y0 + gradient * (xend - x0);
            let xgap = rfpart(x0 + 0.5);
            let xpxl1 = xend;
            let ypxl1 = ipart(yend);

            if (steep) {
                plot(ypxl1, xpxl1, rfpart(yend) * xgap);
                plot(ypxl1 + 1, xpxl1, fpart(yend) * xgap);
            } else {
                plot(xpxl1, ypxl1, rfpart(yend) * xgap);
                plot(xpxl1, ypxl1 + 1, fpart(yend) * xgap);
            }

            let intery = yend + gradient;
            xend = round(x1);
            yend = y1 + gradient * (xend - x1);
            xgap = fpart(x1 + 0.5);
            let xpxl2 = xend;
            let ypxl2 = ipart(yend);

            if (steep) {
                plot(ypxl2, xpxl2, rfpart(yend) * xgap);
                plot(ypxl2 + 1, xpxl2, fpart(yend) * xgap);
            } else {
                plot(xpxl2, ypxl2, rfpart(yend) * xgap);
                plot(xpxl2, ypxl2 + 1, fpart(yend) * xgap);
            }

            if (steep) {
                for (let x = xpxl1 + 1; x <= xpxl2 - 1; x++) {
                    plot(ipart(intery), x, rfpart(intery));
                    plot(ipart(intery) + 1, x, fpart(intery));
                    intery += gradient;
                }
            } else {
                for (let x = xpxl1 + 1; x <= xpxl2 - 1; x++) {
                    plot(x, ipart(intery), rfpart(intery));
                    plot(x, ipart(intery) + 1, fpart(intery));
                    intery += gradient;
                }
            }
        }

        // Run the algorithms
        if (aaEnabled) {
            drawLineWu(x0, y0, x1, y1);
        } else {
            drawLineBresenham(x0, y0, x1, y1);
        }

        // Draw mathematical vector line on top (subpixel layout)
        ctx.strokeStyle = 'rgba(255, 62, 62, 0.8)'; // Neon Red line
        ctx.lineWidth = 2;
        ctx.beginPath();
        // offset by half a pixel so the geometric line rides the center of the grid coordinate
        ctx.moveTo(x0 * pixelSize + pixelSize/2, y0 * pixelSize + pixelSize/2);
        ctx.lineTo(x1 * pixelSize + pixelSize/2, y1 * pixelSize + pixelSize/2);
        ctx.stroke();

        // Draw grid outline overlay
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += pixelSize) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        }
        for (let j = 0; j < canvas.height; j += pixelSize) {
            ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
        }
    }

    angleSlider.addEventListener('input', draw);
    draw();
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
                const b = Math.sin(v * Math.PI + Math.PI / 2) * 127 + 128;

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

// --- 5. RAY TRACING VISUALIZER ---

function initRayTracer() {
    const canvas = document.getElementById('raytrace-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const lightXInput = document.getElementById('rt-light-x');
    const raysInput = document.getElementById('rt-rays');
    const bouncesInput = document.getElementById('rt-bounces');

    // Define scene obstacles (polygons)
    const obstacles = [
        // Walls
        { p1: {x: 0, y: 0}, p2: {x: 600, y: 0} },
        { p1: {x: 600, y: 0}, p2: {x: 600, y: 400} },
        { p1: {x: 600, y: 400}, p2: {x: 0, y: 400} },
        { p1: {x: 0, y: 400}, p2: {x: 0, y: 0} },
        // A diamond shape
        { p1: {x: 300, y: 250}, p2: {x: 350, y: 200} },
        { p1: {x: 350, y: 200}, p2: {x: 400, y: 250} },
        { p1: {x: 400, y: 250}, p2: {x: 350, y: 300} },
        { p1: {x: 350, y: 300}, p2: {x: 300, y: 250} },
        // A wall/mirror
        { p1: {x: 500, y: 100}, p2: {x: 550, y: 280} },
        // Small block
        { p1: {x: 100, y: 150}, p2: {x: 180, y: 150} },
        { p1: {x: 180, y: 150}, p2: {x: 180, y: 190} },
        { p1: {x: 180, y: 190}, p2: {x: 100, y: 190} },
        { p1: {x: 100, y: 190}, p2: {x: 100, y: 150} }
    ];

    function getIntersection(ray, segment) {
        const r_px = ray.o.x;
        const r_py = ray.o.y;
        const r_dx = ray.d.x;
        const r_dy = ray.d.y;
        const s_px = segment.p1.x;
        const s_py = segment.p1.y;
        const s_dx = segment.p2.x - segment.p1.x;
        const s_dy = segment.p2.y - segment.p1.y;

        const cross = r_dx * s_dy - r_dy * s_dx;
        if (Math.abs(cross) < 0.0001) return null; // Parallel

        const t1 = ((s_px - r_px) * s_dy - (s_py - r_py) * s_dx) / cross;
        const t2 = ((s_px - r_px) * r_dy - (s_py - r_py) * r_dx) / cross;

        if (t1 > 0.0001 && t2 >= 0 && t2 <= 1.0) {
            // Calculate normal
            let nx = -s_dy;
            let ny = s_dx;
            const len = Math.hypot(nx, ny);
            nx /= len;
            ny /= len;
            
            // Fix normal direction to face the ray
            if (nx * r_dx + ny * r_dy > 0) {
                nx = -nx;
                ny = -ny;
            }

            return {
                x: r_px + t1 * r_dx,
                y: r_py + t1 * r_dy,
                t: t1,
                normal: { x: nx, y: ny }
            };
        }
        return null;
    }

    function traceRay(origin, direction, bouncesLeft) {
        let closest = null;
        let minDist = Infinity;

        // Find closest intersection
        obstacles.forEach(segment => {
            const hit = getIntersection({o: origin, d: direction}, segment);
            if (hit && hit.t < minDist) {
                minDist = hit.t;
                closest = hit;
            }
        });

        if (closest) {
            ctx.beginPath();
            ctx.moveTo(origin.x, origin.y);
            ctx.lineTo(closest.x, closest.y);
            // Alpha fades with bounces
            ctx.strokeStyle = `rgba(204, 255, 0, ${0.1 + (bouncesLeft * 0.15)})`;
            ctx.stroke();

            if (bouncesLeft > 0) {
                // Reflect ray
                const dot = direction.x * closest.normal.x + direction.y * closest.normal.y;
                const reflectDir = {
                    x: direction.x - 2 * dot * closest.normal.x,
                    y: direction.y - 2 * dot * closest.normal.y
                };
                
                // Advance origin slightly to prevent self-intersection
                const newOrigin = {
                    x: closest.x + closest.normal.x * 0.1,
                    y: closest.y + closest.normal.y * 0.1
                };

                traceRay(newOrigin, reflectDir, bouncesLeft - 1);
            }
        } else {
            // Ray escapes screen (won't happen with enclosing walls)
            ctx.beginPath();
            ctx.moveTo(origin.x, origin.y);
            ctx.lineTo(origin.x + direction.x * 1000, origin.y + direction.y * 1000);
            ctx.strokeStyle = `rgba(204, 255, 0, ${0.1 + (bouncesLeft * 0.15)})`;
            ctx.stroke();
        }
    }

    let t = 0;

    function render() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const lightXOffset = parseFloat(lightXInput.value);
        const lightYOffset = 80 + Math.sin(t * 0.8) * 40; // Add some bobbing

        const origin = { x: lightXOffset, y: lightYOffset };
        const numRays = parseInt(raysInput.value, 10);
        const maxBounces = parseInt(bouncesInput.value, 10);

        // Draw obstacles
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        obstacles.forEach(segment => {
            ctx.beginPath();
            ctx.moveTo(segment.p1.x, segment.p1.y);
            ctx.lineTo(segment.p2.x, segment.p2.y);
            ctx.stroke();
        });

        // Draw light source
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(origin.x, origin.y, 6, 0, Math.PI * 2);
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ccff00';
        ctx.fill();
        ctx.fill(); // fill twice to intensify center
        ctx.shadowBlur = 0;

        // Cast rays
        ctx.lineWidth = 1;
        for (let i = 0; i < numRays; i++) {
            const angle = (i / numRays) * Math.PI * 2 + (t * 0.05); // Global spin
            const dir = { x: Math.cos(angle), y: Math.sin(angle) };
            traceRay(origin, dir, maxBounces);
        }

        t += 0.02;
        requestAnimationFrame(render);
    }

    render();
}
