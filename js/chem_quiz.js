// Chemistry Quiz Logic - Pyodide Integration

const QUIZ_CHALLENGES = {
    valence: {
        id: "valence",
        title: "01. VALENCE CHECK",
        description: "Write a function that returns the number of valence electrons for the first 18 elements. Input is atomic number (1-18).",
        initialCode: "def get_valence(atomic_number):\n    # Shells: 2, 8, 8\n    # Return valence electrons (outer shell count)\n    return 0\n\n# Test\nprint(get_valence(6)) # Should be 4",
        solution: (code) => code.includes("%") || code.includes("-")
    },
    bonding: {
        id: "bonding",
        title: "02. BOND TYPE PREDICTOR",
        description: "Predict bond type based on electronegativity difference. > 1.7 is Ionic, else Covalent.",
        initialCode: "def predict_bond(en1, en2):\n    # Return 'Ionic' or 'Covalent'\n    return ''\n\n# Test\nprint(predict_bond(0.9, 3.0)) # Na and Cl",
        solution: (code) => code.includes("1.7")
    },
    stoichiometry: {
        id: "stoichiometry",
        title: "03. REACTION BALANCER",
        description: "A simple check: Is the reaction 2H2 + O2 -> 2H2O balanced? (Check atoms on both sides).",
        initialCode: "def is_balanced(reactants, products):\n    # reactants and products are dicts: {'H': 4, 'O': 2}\n    return reactants == products\n\n# Test\nr = {'H': 4, 'O': 2}\np = {'H': 4, 'O': 2}\nprint(is_balanced(r, p))",
        solution: (code) => code.includes("==")
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

initPyodide();
updateChallenge();
