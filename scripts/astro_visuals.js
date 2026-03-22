// Astronomy Visualizations

document.addEventListener('DOMContentLoaded', () => {
    initHero();
    initScaleViz();
    initStellarViz();
    initGravityViz();
    initSolarSystemViz();
});

// --- Hero Animation (Starfield) ---
function initHero() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let stars = [];
    const numStars = 200;

    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.5,
                speed: Math.random() * 0.2 + 0.1,
                opacity: Math.random()
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        
        stars.forEach(star => {
            ctx.globalAlpha = star.opacity;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            
            star.y += star.speed;
            if (star.y > canvas.height) star.y = 0;
            
            // Subtle twinkle
            star.opacity += (Math.random() - 0.5) * 0.05;
            if (star.opacity < 0.1) star.opacity = 0.1;
            if (star.opacity > 1) star.opacity = 1;
        });

        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
        resize();
        createStars();
    });

    resize();
    createStars();
    draw();
}

// --- Scale Visualization ---
function initScaleViz() {
    const canvas = document.getElementById('scaleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const slider = document.getElementById('scale-slider');
    const valDisplay = document.getElementById('scale-val');

    const objects = [
        { name: 'Earth', radius: 1, color: '#4facfe' },
        { name: 'Jupiter', radius: 11.2, color: '#ffaf7b' },
        { name: 'Sun', radius: 109, color: '#fff3a3' },
        { name: 'Betelgeuse', radius: 1000, color: '#ff7e5f' }
    ];

    function draw() {
        const zoom = Math.pow(10, parseFloat(slider.value));
        valDisplay.textContent = `Zoom: ${zoom.toFixed(2)}x`;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        objects.forEach(obj => {
            const screenRadius = obj.radius * zoom;
            if (screenRadius < 0.5) return;

            ctx.beginPath();
            ctx.arc(centerX, centerY, screenRadius, 0, Math.PI * 2);
            ctx.strokeStyle = obj.color;
            ctx.lineWidth = 1;
            ctx.stroke();
            
            if (screenRadius > 10) {
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.font = '10px Courier New';
                ctx.fillText(obj.name, centerX + screenRadius + 5, centerY);
            }
        });
    }

    slider.addEventListener('input', draw);
    draw();
}

// --- Stellar Evolution ---
function initStellarViz() {
    const canvas = document.getElementById('stellarCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const massSlider = document.getElementById('mass-slider');
    const massVal = document.getElementById('mass-val');

    function draw() {
        const mass = parseFloat(massSlider.value);
        massVal.textContent = `${mass} Solar Masses`;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        let color = '#fff3a3'; // Sun-like
        let size = 20;

        if (mass < 0.5) {
            color = '#ffa3a3'; // Red Dwarf
            size = 10;
        } else if (mass > 8) {
            color = '#a3d9ff'; // Blue Giant
            size = 40;
        }

        // Glow
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = '14px Outfit';
        ctx.textAlign = 'center';
        let type = mass < 0.5 ? 'Red Dwarf' : (mass > 8 ? 'Supergiant' : 'Main Sequence Star');
        ctx.fillText(type, centerX, centerY + size + 30);
    }

    massSlider.addEventListener('input', draw);
    draw();
}

// --- Gravity & Orbits ---
function initGravityViz() {
    const canvas = document.getElementById('gravityCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const planets = [
        { name: 'Inner', dist: 60, size: 4, speed: 0.04, angle: Math.random() * Math.PI * 2, color: '#ffcc00' },
        { name: 'Middle', dist: 100, size: 6, speed: 0.02, angle: Math.random() * Math.PI * 2, color: '#00ffaa' },
        { name: 'Outer', dist: 160, size: 8, speed: 0.01, angle: Math.random() * Math.PI * 2, color: '#00e5ff' }
    ];

    function draw() {
        ctx.fillStyle = 'rgba(3, 3, 5, 0.2)'; // Motion blur effect
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Draw Sun
        const sunGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20);
        sunGlow.addColorStop(0, '#fff3a3');
        sunGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff3a3';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
        ctx.fill();

        // Draw Orbits & Planets
        planets.forEach(p => {
            // Orbit path
            ctx.strokeStyle = 'rgba(138, 43, 226, 0.1)';
            ctx.beginPath();
            ctx.arc(centerX, centerY, p.dist, 0, Math.PI * 2);
            ctx.stroke();

            // Planet
            const x = centerX + Math.cos(p.angle) * p.dist;
            const y = centerY + Math.sin(p.angle) * p.dist;

            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Subtle glow for planet
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.shadowBlur = 0;

            p.angle += p.speed;
        });

        requestAnimationFrame(draw);
    }

    draw();
}

// --- Solar System Viz ---
function initSolarSystemViz() {
    const canvas = document.getElementById('solarSystemCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const innerBtn = document.getElementById('ss-inner-btn');
    const outerBtn = document.getElementById('ss-outer-btn');

    let mode = 'inner'; // 'inner' or 'outer'
    
    // Orbital distances scaled for visualization purposes
    const innerPlanets = [
        { name: 'Mercury', dist: 40, size: 3, speed: 0.04, angle: 0, color: '#b0b0b0' },
        { name: 'Venus', dist: 70, size: 5, speed: 0.03, angle: 2, color: '#e0c080' },
        { name: 'Earth', dist: 100, size: 5.5, speed: 0.02, angle: 4, color: '#4facfe' },
        { name: 'Mars', dist: 130, size: 4, speed: 0.015, angle: 1, color: '#ff6b6b' }
    ];

    const outerPlanets = [
        { name: 'Jupiter', dist: 60, size: 14, speed: 0.01, angle: 0, color: '#ffaf7b' },
        { name: 'Saturn', dist: 100, size: 11, speed: 0.007, angle: 2, color: '#eaddb0', ring: true },
        { name: 'Uranus', dist: 140, size: 8, speed: 0.005, angle: 4, color: '#a0ffff' },
        { name: 'Neptune', dist: 180, size: 7.5, speed: 0.004, angle: 1, color: '#4060ff' }
    ];

    function renderLoop() {
        ctx.fillStyle = 'rgba(5, 5, 8, 0.2)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const sunRadius = mode === 'inner' ? 15 : 20;
        ctx.fillStyle = '#fff3a3';
        ctx.beginPath();
        ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#fff3a3';
        ctx.fill();
        ctx.shadowBlur = 0;

        const planets = mode === 'inner' ? innerPlanets : outerPlanets;

        planets.forEach(p => {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.arc(centerX, centerY, p.dist, 0, Math.PI * 2);
            ctx.stroke();

            const x = centerX + Math.cos(p.angle) * p.dist;
            const y = centerY + Math.sin(p.angle) * p.dist;

            if (p.ring) {
                ctx.strokeStyle = 'rgba(234, 221, 176, 0.6)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.ellipse(x, y, p.size * 1.8, p.size * 0.6, Math.PI / 8, 0, Math.PI * 2);
                ctx.stroke();
                ctx.lineWidth = 1;
            }

            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fill();

            p.angle += p.speed;
        });

        requestAnimationFrame(renderLoop);
    }
    
    // reset trails
    innerBtn.addEventListener('click', () => { 
        if(mode !== 'inner') {
            mode = 'inner'; 
            ctx.fillStyle = '#050508';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    });
    
    outerBtn.addEventListener('click', () => { 
        if(mode !== 'outer') {
            mode = 'outer'; 
            ctx.fillStyle = '#050508';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    });

    // Initial clear
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    renderLoop();
}
