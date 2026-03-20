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

window.onload = () => {
    if (document.getElementById('actionPotentialCanvas')) new ActionPotentialVis('actionPotentialCanvas');
    if (document.getElementById('synapseCanvas')) new SynapseVis('synapseCanvas');
    if (document.getElementById('networkCanvas')) new NeuralNetworkVis('networkCanvas');
};
