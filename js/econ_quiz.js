// Economics Quiz Logic - Python Interaction

document.addEventListener('DOMContentLoaded', () => {
    initQuiz();
});

async function initQuiz() {
    const runBtn = document.getElementById('quiz-run-btn');
    const output = document.getElementById('quiz-output');
    const editor = document.getElementById('quiz-editor');
    const select = document.getElementById('quiz-select');

    const pyodide = await loadPyodide();
    runBtn.disabled = false;
    runBtn.innerText = 'EXECUTE CALCULATION';
    output.innerText = 'Python 3.x Kernel Ready.';

    const challenges = {
        equilibrium: `def calculate_equilibrium(demand_fn, supply_fn):
    # demand_fn: P = 100 - 2Q
    # supply_fn: P = 20 + 3Q
    # Solve 100 - 2Q = 20 + 3Q
    # 80 = 5Q -> Q = 16
    # P = 100 - 2(16) = 68
    
    # YOUR TURN: Find the price (P) if Demand is P=200-5Q and Supply is P=50+10Q
    # Write the logic below:
    Q = 0 # Calculate Q
    P = 0 # Calculate P
    return P, Q

print(f"Equilibrium Price: {calculate_equilibrium(None, None)[0]}")`,
        elasticity: `def calculate_elasticity(q1, q2, p1, p2):
    # Elasticity = % Change in Q / % Change in P
    # Use the Midpoint Formula
    avg_q = (q1 + q2) / 2
    avg_p = (p1 + p2) / 2
    
    pct_q = (q2 - q1) / avg_q
    pct_p = (p2 - p1) / avg_p
    
    return pct_q / pct_p

# Test with P1=10, Q1=100 -> P2=12, Q2=80
e = calculate_elasticity(100, 80, 10, 12)
print(f"Price Elasticity of Demand: {e:.2f}")`,
        marginal: `def find_max_profit(price, costs):
    # Profit is max when Marginal Revenue (Price) = Marginal Cost
    # costs is a list of total costs for each unit [0, 1, 2, ...]
    marginal_costs = [costs[i] - costs[i-1] for i in range(1, len(costs))]
    
    optimal_q = 0
    for q, mc in enumerate(marginal_costs, 1):
        if mc <= price:
            optimal_q = q
            
    return optimal_q

p = 50
c = [0, 40, 70, 110, 160, 220]
print(f"Optimal Quantity to Produce: {find_max_profit(p, c)}")`
    };

    editor.value = challenges[select.value];

    select.addEventListener('change', () => {
        editor.value = challenges[select.value];
    });

    runBtn.addEventListener('click', async () => {
        output.innerText = 'Calculating...';
        try {
            // Redirect stdout
            pyodide.runPython(`
import sys
import io
sys.stdout = io.String()
            `);
            
            await pyodide.runPythonAsync(editor.value);
            
            const result = pyodide.runPython("sys.stdout.getvalue()");
            output.innerText = result || 'Calculation complete (no output).';
        } catch (err) {
            output.innerText = 'ERROR: ' + err.message;
        }
    });

    // CodeMirror integration if available
    if (window.CodeMirror) {
        const cm = CodeMirror.fromTextArea(editor, {
            mode: 'python',
            theme: 'monokai',
            lineNumbers: true,
            indentUnit: 4
        });
        cm.on('change', () => {
            editor.value = cm.getValue();
        });
    }
}
