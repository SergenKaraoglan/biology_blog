// Physics Quiz Logic - Pyodide Integration

const QUIZ_CHALLENGES = {
    entropy: {
        id: "entropy",
        title: "01. ENTROPY LOGIC",
        description: "Write a function that calculates total entropy using Boltzmann's formula: S = k * ln(W). Assume k = 1 for this exercise.",
        initialCode: "import math\n\ndef calculate_entropy(arrangements):\n    # Return the entropy of the system\n    return 0\n\n# Test cases\nprint(calculate_entropy(100))",
        solution: (code) => code.includes("math.log")
    },
    quantum: {
        id: "quantum",
        title: "02. PROBABILITY WAVE",
        description: "Normalize a probability wave. Ensure the sum of probabilities equals 1.0.",
        initialCode: "def normalize_probabilities(probs):\n    # Divide each probability by the sum of all probabilities\n    return []\n\n# Test\nprint(normalize_probabilities([0.5, 0.5, 0.5]))",
        solution: (code) => code.includes("sum(probs)")
    },
    gravity: {
        id: "gravity",
        title: "03. ORBITAL MECHANICS",
        description: "Calculate the orbital velocity: v = sqrt(G * M / r). Use G = 1 for simplicity.",
        initialCode: "import math\n\ndef orbital_velocity(mass, radius):\n    # Calculate required velocity for a stable orbit\n    return 0\n\n# Test\nprint(orbital_velocity(100, 10))",
        solution: (code) => code.includes("math.sqrt")
    },
    light: {
        id: "light",
        title: "04. TIME DILATION",
        description: "Calculate the time dilation factor (gamma): γ = 1 / sqrt(1 - v²/c²). Assume c = 1.",
        initialCode: "import math\n\ndef calculate_gamma(velocity):\n    # Return the Lorentz factor γ\n    return 0\n\n# Test cases\nprint(calculate_gamma(0.6))  # Expected ~1.25",
        solution: (code) => code.includes("math.sqrt") && code.includes("velocity**2")
    }
};

let pyodideInstance = null;
const editor = document.getElementById('quiz-editor');
const output = document.getElementById('quiz-output');
const runBtn = document.getElementById('quiz-run-btn');
const select = document.getElementById('quiz-select');

async function initPyodide() {
    try {
        pyodideInstance = await loadPyodide();
        runBtn.innerText = "RUN CODE";
        runBtn.disabled = false;
        output.innerText = "Python Kernel Ready.";
    } catch (err) {
        output.innerText = "Error loading Pyodide: " + err.message;
    }
}

function updateChallenge() {
    const challenge = QUIZ_CHALLENGES[select.value];
    editor.value = challenge.initialCode;
    output.innerText = challenge.description;
}

runBtn.onclick = async () => {
    output.innerText = "Executing...";
    try {
        // Redirect stdout to capture print statements
        await pyodideInstance.runPythonAsync(`
            import sys
            import io
            sys.stdout = io.StringIO()
        `);
        
        await pyodideInstance.runPythonAsync(editor.value);
        
        const stdout = await pyodideInstance.runPythonAsync("sys.stdout.getvalue()");
        output.innerText = stdout || "Code executed successfully (no output).";
        
    } catch (err) {
        output.innerText = "Traceback:\n" + err.message;
    }
};

select.onchange = updateChallenge;

// Start
initPyodide();
updateChallenge();
