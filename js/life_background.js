/**
 * Game of Life Background Simulation
 * Optimized for fullscreen coverage and subtle aesthetics.
 */

class GameOfLife {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 10;
        this.cols = 0;
        this.rows = 0;
        this.grid = [];
        this.nextGrid = [];
        this.fps = 20; // Increased from 10 to 20
        this.lastUpdateTime = 0;

        window.addEventListener('resize', () => this.init());
        this.init();
        this.animate(0);
    }

    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.cols = Math.floor(this.canvas.width / this.cellSize);
        this.rows = Math.floor(this.canvas.height / this.cellSize);

        this.grid = this.createGrid();
        this.nextGrid = this.createGrid();

        // Seed with random noise (increased density)
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j] = Math.random() > 0.8 ? 1 : 0;
            }
        }

        // Mouse interaction
        window.addEventListener('mousemove', (e) => {
            const x = Math.floor(e.clientX / this.cellSize);
            const y = Math.floor(e.clientY / this.cellSize);
            if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
                // Spawn a 3x3 pattern
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const nx = x + i;
                        const ny = y + j;
                        if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
                            this.grid[nx][ny] = 1;
                        }
                    }
                }
            }
        });
    }

    createGrid() {
        return Array.from({ length: this.cols }, () => Array(this.rows).fill(0));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; // Whiter color

        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                if (this.grid[i][j] === 1) {
                    this.ctx.fillRect(i * this.cellSize, j * this.cellSize, this.cellSize - 1, this.cellSize - 1);
                }
            }
        }
    }

    update() {
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                const neighbors = this.countNeighbors(i, j);
                const state = this.grid[i][j];

                if (state === 0 && neighbors === 3) {
                    this.nextGrid[i][j] = 1;
                } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
                    this.nextGrid[i][j] = 0;
                } else {
                    this.nextGrid[i][j] = state;
                }
            }
        }

        // Swap grids
        const temp = this.grid;
        this.grid = this.nextGrid;
        this.nextGrid = temp;

        // Occasionally re-seed to prevent static states (increased probability)
        if (Math.random() < 0.05) {
            const rx = Math.floor(Math.random() * this.cols);
            const ry = Math.floor(Math.random() * this.rows);
            this.grid[rx][ry] = 1;
        }
    }

    countNeighbors(x, y) {
        let sum = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                const col = (x + i + this.cols) % this.cols;
                const row = (y + j + this.rows) % this.rows;
                sum += this.grid[col][row];
            }
        }
        sum -= this.grid[x][y];
        return sum;
    }

    animate(timestamp) {
        const delta = timestamp - this.lastUpdateTime;
        if (delta > 1000 / this.fps) {
            this.update();
            this.draw();
            this.lastUpdateTime = timestamp;
        }
        requestAnimationFrame((t) => this.animate(t));
    }
}

// Immediate initialization to ensure it starts as soon as script loads
new GameOfLife('life-bg-canvas');
