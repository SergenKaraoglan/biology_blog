/**
 * Neuroscience Visualizations
 * 1. Action Potential (Neuron Firing)
 * 2. Synaptic Gap
 * 3. Neural Network Activity
 */

const NEURO_ACCENT = '#00f2ff';
const NEURO_ELECTRIC = '#7000ff';
const NEURO_TRANSMITTER = '#ff007a';
const NEURO_DIM = '#1e293b';

class ActionPotentialVis {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.firing = false;
        this.pulsePos = 0;
        this.nodes = [];

        // Define neuron shape
        this.origin = { x: 50, y: this.height / 2 };
        this.axonEnd = this.width - 50;
        
        this.setup();
        this.animate();
        
        this.canvas.addEventListener('click', () => this.fire());
    }

    setup() {
        // Just static points for axon segments
        for (let i = 0; i < 8; i++) {
            this.nodes.push({
                x: 100 + i * 60,
                y: this.height / 2 + (Math.random() - 0.5) * 10
            });
        }
    }

    fire() {
        if (this.firing) return;
        this.firing = true;
        this.pulsePos = 0;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw Soma (Cell Body)
        this.ctx.beginPath();
        this.ctx.arc(this.origin.x + 20, this.origin.y, 30, 0, Math.PI * 2);
        this.ctx.strokeStyle = NEURO_ACCENT;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.fillStyle = 'rgba(0, 242, 255, 0.1)';
        this.ctx.fill();

        // Draw Dendrites
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.origin.x + 20 + Math.cos(angle) * 30, this.origin.y + Math.sin(angle) * 30);
            this.ctx.lineTo(this.origin.x + 20 + Math.cos(angle) * 60, this.origin.y + Math.sin(angle) * 60);
            this.ctx.stroke();
        }

        // Draw Axon
        this.ctx.beginPath();
        this.ctx.moveTo(this.origin.x + 50, this.origin.y);
        this.ctx.lineTo(this.nodes[0].x, this.nodes[0].y);
        for (let i = 1; i < this.nodes.length; i++) {
            this.ctx.lineTo(this.nodes[i].x, this.nodes[i].y);
        }
        this.ctx.strokeStyle = NEURO_DIM;
        this.ctx.stroke();

        // Draw Action Potential Pulse
        if (this.firing) {
            this.pulsePos += 5;
            if (this.pulsePos > this.width) {
                this.firing = false;
                this.pulsePos = 0;
            }

            // Find segment
            let currentX = this.origin.x + 50;
            let currentY = this.origin.y;
            
            this.ctx.beginPath();
            this.ctx.arc(this.pulsePos, this.origin.y, 6, 0, Math.PI * 2);
            this.ctx.fillStyle = NEURO_ACCENT;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = NEURO_ACCENT;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }

        // Label
        this.ctx.fillStyle = '#444';
        this.ctx.font = '10px Courier New';
        this.ctx.fillText("CLICK TO FIRE NEURON", this.width / 2 - 60, this.height - 20);
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

class SynapseVis {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = [];
        this.setup();
        this.animate();
    }

    setup() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: 100 + Math.random() * 50,
                y: this.height / 2 + (Math.random() - 0.5) * 40,
                vx: 1 + Math.random() * 2,
                vy: (Math.random() - 0.5) * 1,
                active: false
            });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Pre-synaptic terminal
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height / 2 - 80);
        this.ctx.bezierCurveTo(150, this.height / 2 - 80, 150, this.height / 2 + 80, 0, this.height / 2 + 80);
        this.ctx.strokeStyle = NEURO_ACCENT;
        this.ctx.stroke();

        // Post-synaptic terminal
        this.ctx.beginPath();
        this.ctx.moveTo(this.width, this.height / 2 - 80);
        this.ctx.bezierCurveTo(this.width - 150, this.height / 2 - 80, this.width - 150, this.height / 2 + 80, this.width, this.height / 2 + 80);
        this.ctx.strokeStyle = NEURO_ELECTRIC;
        this.ctx.stroke();

        // Receptors
        for(let i = 0; i < 5; i++) {
            const y = this.height / 2 - 60 + i * 30;
            this.ctx.beginPath();
            this.ctx.arc(this.width - 140, y, 6, -Math.PI/2, Math.PI/2);
            this.ctx.strokeStyle = NEURO_ELECTRIC;
            this.ctx.stroke();
        }

        // Neurotransmitters
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x > this.width - 145) {
                p.x = 120;
                p.y = this.height / 2 + (Math.random() - 0.5) * 40;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            this.ctx.fillStyle = NEURO_TRANSMITTER;
            this.ctx.fill();
        });

        this.ctx.fillStyle = '#444';
        this.ctx.font = '10px Courier New';
        this.ctx.fillText("PRE-SYNAPTIC", 20, this.height / 2 + 100);
        this.ctx.fillText("POST-SYNAPTIC", this.width - 100, this.height / 2 + 100);
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

class NeuralNetworkVis {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.neurons = [];
        this.connections = [];
        this.setup();
        this.animate();
    }

    setup() {
        // Create random neurons
        for (let i = 0; i < 15; i++) {
            this.neurons.push({
                x: 50 + Math.random() * (this.width - 100),
                y: 50 + Math.random() * (this.height - 100),
                firing: 0
            });
        }

        // Create connections based on distance
        for (let i = 0; i < this.neurons.length; i++) {
            for (let j = i + 1; j < this.neurons.length; j++) {
                const dist = Math.hypot(this.neurons[i].x - this.neurons[j].x, this.neurons[i].y - this.neurons[j].y);
                if (dist < 150) {
                    this.connections.push({ from: i, to: j });
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw connections
        this.connections.forEach(c => {
            const n1 = this.neurons[c.from];
            const n2 = this.neurons[c.to];
            this.ctx.beginPath();
            this.ctx.moveTo(n1.x, n1.y);
            this.ctx.lineTo(n2.x, n2.y);
            this.ctx.strokeStyle = (n1.firing > 0 || n2.firing > 0) ? NEURO_ACCENT : NEURO_DIM;
            this.ctx.lineWidth = (n1.firing > 0 || n2.firing > 0) ? 2 : 1;
            this.ctx.globalAlpha = 0.3;
            this.ctx.stroke();
            this.ctx.globalAlpha = 1.0;
        });

        // Update and draw neurons
        this.neurons.forEach(n => {
            if (Math.random() < 0.01) n.firing = 20;
            if (n.firing > 0) n.firing--;

            this.ctx.beginPath();
            this.ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
            this.ctx.fillStyle = n.firing > 0 ? NEURO_ACCENT : NEURO_DIM;
            this.ctx.fill();
            
            if (n.firing > 15) {
                this.ctx.beginPath();
                this.ctx.arc(n.x, n.y, 10, 0, Math.PI * 2);
                this.ctx.strokeStyle = NEURO_ACCENT;
                this.ctx.stroke();
            }
        });
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

class HodgkinHuxleyVis {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.naSlider = document.getElementById('hh-na');
        this.kSlider = document.getElementById('hh-k');
        this.stimBtn = document.getElementById('hh-stim-btn');
        
        this.history = [];
        this.maxHistory = 400;
        
        this.V = -65; // Resting potential (mV)
        this.m = 0.05;
        this.h = 0.6;
        this.n = 0.32;
        
        this.I_inj = 0; 
        
        if(this.stimBtn) {
            this.stimBtn.addEventListener('mousedown', () => this.I_inj = 15);
            this.stimBtn.addEventListener('mouseup', () => this.I_inj = 0);
            this.stimBtn.addEventListener('mouseleave', () => this.I_inj = 0);
        }
        
        this.animate();
    }
    
    updateMath() {
        const dt = 0.05; 
        const C_m = 1.0; 
        
        const E_Na = 50.0;
        const E_K = -77.0;
        const E_L = -54.387;
        
        const g_Na_bar = 120.0 * (this.naSlider ? parseFloat(this.naSlider.value) : 1);
        const g_K_bar = 36.0 * (this.kSlider ? parseFloat(this.kSlider.value) : 1);
        const g_L = 0.3;
        
        // Alpha and Beta functions
        const alpha_m = 0.1 * (this.V + 40.0) / (1.0 - Math.exp(-(this.V + 40.0) / 10.0));
        const beta_m = 4.0 * Math.exp(-(this.V + 65.0) / 18.0);
        
        const alpha_h = 0.07 * Math.exp(-(this.V + 65.0) / 20.0);
        const beta_h = 1.0 / (1.0 + Math.exp(-(this.V + 35.0) / 10.0));
        
        const alpha_n = 0.01 * (this.V + 55.0) / (1.0 - Math.exp(-(this.V + 55.0) / 10.0));
        const beta_n = 0.125 * Math.exp(-(this.V + 65) / 80.0);
        
        // Update gating variables
        this.m += dt * (alpha_m * (1 - this.m) - beta_m * this.m);
        this.h += dt * (alpha_h * (1 - this.h) - beta_h * this.h);
        this.n += dt * (alpha_n * (1 - this.n) - beta_n * this.n);
        
        // Calculate currents
        const I_Na = g_Na_bar * Math.pow(this.m, 3) * this.h * (this.V - E_Na);
        const I_K = g_K_bar * Math.pow(this.n, 4) * (this.V - E_K);
        const I_L = g_L * (this.V - E_L);
        
        // Update Voltage
        this.V += dt * (this.I_inj - I_Na - I_K - I_L) / C_m;
        
        // Safety bounds
        if (isNaN(this.V)) this.V = -65;
        if (this.V > 100) this.V = 100;
        if (this.V < -100) this.V = -100;
        
        this.history.push(this.V);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#112240';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        for (let y = 0; y < this.height; y += 50) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
        }
        this.ctx.stroke();
        
        // Draw trace
        this.ctx.strokeStyle = '#00f2ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        for (let i = 0; i < this.history.length; i++) {
            const x = (i / this.maxHistory) * this.width;
            const v = this.history[i];
            const y = this.height - ((v + 100) / 150) * this.height;
            
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
        
        // Draw current injector indicator
        if (this.I_inj > 0) {
            this.ctx.fillStyle = 'rgba(255, 0, 122, 0.2)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#ff007a';
            this.ctx.font = '14px Courier New';
            this.ctx.fillText("CURRENT INJECTED", 20, 30);
        }
    }
    
    animate() {
        for (let k = 0; k < 10; k++) {
            this.updateMath();
        }
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

class HebbianLearningVis {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.resetBtn = document.getElementById('hebb-reset-btn');
        
        this.neurons = [];
        this.links = [];
        this.clickHistory = [];
        this.frameCount = 0;
        
        this.setup();
        this.animate();
        
        // Keep manual clicks as an option too!
        this.canvas.addEventListener('mousedown', (e) => this.handleClick(e));
        if(this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.resetWeights());
        }
    }
    
    setup() {
        const cols = 5;
        const rows = 3;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.neurons.push({
                    id: r * cols + c,
                    x: 150 + c * 125 + (Math.random() * 20 - 10),
                    y: 75 + r * 100 + (Math.random() * 20 - 10),
                    firingTimer: 0
                });
            }
        }
        
        for (let n1 of this.neurons) {
            for (let n2 of this.neurons) {
                if (n1.id < n2.id) {
                    const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
                    if (dist < 180) {
                        this.links.push({ n1, n2, weight: 0.1 });
                    }
                }
            }
        }

        // Define a "Memory Trace" pattern we will repeatedly stimulate
        // e.g., A triangle of neurons in the middle
        this.patternNodes = [
            this.neurons[6],  // middle row, col 2
            this.neurons[8],  // middle row, col 4
            this.neurons[2]   // top row, col 3
        ];
    }
    
    resetWeights() {
        this.links.forEach(l => l.weight = 0.1);
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        for (let n of this.neurons) {
            const dist = Math.hypot(n.x - mouseX, n.y - mouseY);
            if (dist < 20) {
                this.fireNeuron(n);
                break; 
            }
        }
    }
    
    simulateEnvironment() {
        this.frameCount++;
        
        // 1. Every 120 frames (2 seconds), the "Pattern" is experienced by the brain
        if (this.frameCount % 120 === 0) {
            this.patternNodes.forEach(n => this.fireNeuron(n));
        }

        // 2. Continuous random background noise (spontaneous firing)
        if (this.frameCount % 15 === 0) {
            const randomNeuron = this.neurons[Math.floor(Math.random() * this.neurons.length)];
            // Don't accidentally fire pattern nodes as noise
            if (!this.patternNodes.includes(randomNeuron)) {
                this.fireNeuron(randomNeuron);
            }
        }
    }

    fireNeuron(n) {
        n.firingTimer = 60; // frames glow
        this.clickHistory.push({ neuron: n, time: Date.now() });
        
        const now = Date.now();
        this.clickHistory = this.clickHistory.filter(h => now - h.time < 1500);
        
        if (this.clickHistory.length >= 2) {
            for (let i = 0; i < this.clickHistory.length; i++) {
                for (let j = i + 1; j < this.clickHistory.length; j++) {
                    const idA = this.clickHistory[i].neuron.id;
                    const idB = this.clickHistory[j].neuron.id;
                    
                    const link = this.links.find(l => 
                        (l.n1.id === idA && l.n2.id === idB) || 
                        (l.n1.id === idB && l.n2.id === idA)
                    );
                    
                    if (link) {
                        link.weight = Math.min(link.weight + 0.15, 3.0);
                    }
                }
            }
        }
    }
    
    draw() {
        this.simulateEnvironment();

        this.ctx.clearRect(0, 0, this.width, this.height);
        
        for (let link of this.links) {
            this.ctx.beginPath();
            this.ctx.moveTo(link.n1.x, link.n1.y);
            this.ctx.lineTo(link.n2.x, link.n2.y);
            
            this.ctx.lineWidth = 1 + (link.weight * 1.5);
            this.ctx.strokeStyle = `rgba(0, 242, 255, ${Math.min(0.1 + link.weight * 0.2, 0.8)})`;
            
            if (link.n1.firingTimer > 0 && link.n2.firingTimer > 0) {
                this.ctx.strokeStyle = '#ff007a'; 
                this.ctx.lineWidth += 2;
            }
            
            this.ctx.stroke();
        }
        
        for (let n of this.neurons) {
            this.ctx.beginPath();
            this.ctx.arc(n.x, n.y, 12, 0, Math.PI * 2);
            
            if (n.firingTimer > 0) {
                this.ctx.fillStyle = '#ff007a'; 
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = '#ff007a';
                n.firingTimer--;
            } else {
                this.ctx.fillStyle = '#1e293b'; 
                this.ctx.shadowBlur = 0;
            }
            
            this.ctx.strokeStyle = '#00f2ff';
            this.ctx.lineWidth = 2;
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.shadowBlur = 0; 
        }

        // Draw HUD
        this.ctx.fillStyle = '#444';
        this.ctx.font = '12px Courier New';
        this.ctx.fillText("SIMULATING REPEATED STIMULUS...", 20, 20);
    }
    
    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

class BCIDecoderVis {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.filterBtn = document.getElementById('bci-filter-btn');
        this.spikeBtn = document.getElementById('bci-spike-btn');
        this.decodeBtn = document.getElementById('bci-decode-btn');
        
        this.state = 0; 
        this.signal = [];
        this.maxLen = 400;
        this.time = 0;
        
        if (this.filterBtn) {
            this.filterBtn.addEventListener('click', () => {
                this.state = 1;
                this.filterBtn.style.background = '#444';
                this.filterBtn.innerText = 'BANDPASS ACTIVE';
                this.filterBtn.disabled = true;
                
                this.spikeBtn.disabled = false;
                this.spikeBtn.style.background = '#ff007a';
            });
            this.spikeBtn.addEventListener('click', () => {
                this.state = 2;
                this.spikeBtn.style.background = '#444';
                this.spikeBtn.style.color = '#fff';
                this.spikeBtn.innerText = 'SPIKES SORTED';
                this.spikeBtn.disabled = true;
                
                this.decodeBtn.disabled = false;
            });
            this.decodeBtn.addEventListener('click', () => {
                this.state = 3;
                this.decodeBtn.style.background = '#444';
                this.decodeBtn.style.color = '#fff';
                this.decodeBtn.innerText = 'INTENT DECODED';
                this.decodeBtn.disabled = true;
            });
        }
        
        this.animate();
    }
    
    updateSignal() {
        this.time += 0.05;
        // Base motor intent: smooth sine wave
        let intent = Math.sin(this.time) * 40;
        
        let noise = 0;
        let spike = 0;
        
        if (this.state < 1) { // Raw: Heavy high-frequency noise
            noise = (Math.random() - 0.5) * 60;
        } else if (this.state < 2) { // Filtered: Low noise
            noise = (Math.random() - 0.5) * 10;
        }
        
        if (this.state < 2) { // Raw or Filtered: Random neural spikes
            if (Math.random() < 0.05) spike = (Math.random() > 0.5 ? 1 : -1) * (80 + Math.random() * 40);
        }
        
        let total = intent + noise + spike;
        this.signal.push(total);
        if (this.signal.length > this.maxLen) this.signal.shift();
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#112240';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        for (let y = 0; y < this.height; y += 50) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
        }
        this.ctx.stroke();
        
        // Draw Signal
        this.ctx.beginPath();
        if (this.state === 0) this.ctx.strokeStyle = '#888';
        else if (this.state === 1) this.ctx.strokeStyle = '#22d3ee';
        else if (this.state >= 2) this.ctx.strokeStyle = '#00f2ff';
        
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < this.signal.length; i++) {
            const x = (i / this.maxLen) * this.width;
            const y = this.height / 2 - this.signal[i];
            
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
        
        // State 3 Overlay: Robotic Decoder matching intent
        if (this.state === 3) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#ff007a';
            this.ctx.lineWidth = 3;
            for (let i = 0; i < this.signal.length - 15; i++) {
                const x = (i / this.maxLen) * this.width;
                const y = this.height / 2 - this.signal[i];
                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
            
            this.ctx.fillStyle = 'rgba(255, 0, 122, 0.2)';
            this.ctx.fillRect(0, 0, this.width, 30);
            this.ctx.fillStyle = '#ff007a';
            this.ctx.font = '14px Courier New';
            this.ctx.fillText("MOTOR COMMAND EXTRACTED: Y-AXIS TRANSLATION", 20, 20);
        }
    }
    
    animate() {
        this.updateSignal();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

window.onload = () => {
    if (document.getElementById('actionPotentialCanvas')) new ActionPotentialVis('actionPotentialCanvas');
    if (document.getElementById('synapseCanvas')) new SynapseVis('synapseCanvas');
    if (document.getElementById('networkCanvas')) new NeuralNetworkVis('networkCanvas');
    if (document.getElementById('hhCanvas')) new HodgkinHuxleyVis('hhCanvas');
    if (document.getElementById('hebbCanvas')) new HebbianLearningVis('hebbCanvas');
    if (document.getElementById('bciCanvas')) new BCIDecoderVis('bciCanvas');
};
