        // ==========================================
        // 9. THE PYODIDE QUIZ
        // ==========================================
        (async function () {
            const select = document.getElementById('quiz-select');
            const runBtn = document.getElementById('quiz-run-btn');
            const output = document.getElementById('quiz-output');
            let pyodide = null;

            const editor = CodeMirror.fromTextArea(document.getElementById('quiz-editor'), {
                mode: "python", theme: "monokai", lineNumbers: true, indentUnit: 4, matchBrackets: true
            });

            const challenges = {
                linear: { template: "def linear_forward(X: np.ndarray, W: np.ndarray, b: float) -> np.ndarray:\n    # Calculate dot product of X and W, then add bias b\n    # Use print() to debug if needed!\n    pass", test: "\ntest_result=''\ntry:\n    res=linear_forward(np.array([[1,2]]), np.array([[0.5],[-0.5]]), 1.0)\n    if res is None: test_result='FAIL: Returned None. Did you forget to return?'\n    elif np.allclose(res, np.array([[0.5]])): test_result='PASS: Y = W*X + B successfully computed.'\n    else: test_result='FAIL: Math logic invalid.'\nexcept Exception as e: test_result='ERROR: '+str(e)" },
                relu: { template: "def relu(z: np.ndarray) -> np.ndarray:\n    # Apply ReLU (clip negatives to zero)\n    pass", test: "\ntest_result=''\ntry:\n    res=relu(np.array([-1, 2]))\n    if res is None: test_result='FAIL: Returned None.'\n    elif np.allclose(res, np.array([0, 2])): test_result='PASS: Non-linear hinge successfully applied.'\n    else: test_result='FAIL: Logic invalid.'\nexcept Exception as e: test_result='ERROR: '+str(e)" },
                mse: { template: "def mse_loss(preds: np.ndarray, targets: np.ndarray) -> float:\n    # Return Mean Squared Error between preds and targets\n    pass", test: "\ntest_result=''\ntry:\n    res=mse_loss(np.array([1., 2.]), np.array([1., 0.]))\n    if res is None: test_result='FAIL: Returned None.'\n    elif np.isclose(res, 2.0): test_result='PASS: Loss computed accurately.'\n    else: test_result='FAIL: Logic invalid.'\nexcept Exception as e: test_result='ERROR: '+str(e)" },
                relu_deriv: { template: "def relu_derivative(z: np.ndarray) -> np.ndarray:\n    # Return slope: 1 if >0 else 0\n    pass", test: "\ntest_result=''\ntry:\n    res=relu_derivative(np.array([-1, 1]))\n    if res is None: test_result='FAIL: Returned None.'\n    elif np.allclose(res, np.array([0, 1])): test_result='PASS: Gradient valid.'\n    else: test_result='FAIL: Logic invalid.'\nexcept Exception as e: test_result='ERROR: '+str(e)" },
                update: { template: "def update_weights(W: np.ndarray, dW: np.ndarray, lr: float) -> np.ndarray:\n    # Execute gradient descent step (step opposite to gradient)\n    pass", test: "\ntest_result=''\ntry:\n    res=update_weights(np.array([1.]), np.array([0.5]), 0.1)\n    if res is None: test_result='FAIL: Returned None.'\n    elif np.allclose(res, np.array([0.95])): test_result='PASS: Weights updated.'\n    else: test_result='FAIL: Logic invalid.'\nexcept Exception as e: test_result='ERROR: '+str(e)" },
                pipeline: { template: "def forward_and_loss(X, W, b, target):\n    # 1. z = linear_forward\n    # 2. a = relu(z)\n    # 3. loss = mse(a, target)\n    # return loss\n    pass", test: "\ntest_result=''\ntry:\n    res=forward_and_loss(np.array([[2., -1.]]), np.array([[0.5],[1.0]]), -0.5, 0.0)\n    if res is None: test_result='FAIL: Returned None.'\n    elif np.isclose(res, 0.0): test_result='PASS: Artificial Neuron verified. Boss puzzle complete.'\n    else: test_result='FAIL: Expected 0.0'\nexcept Exception as e: test_result='ERROR: '+str(e)" },
                backward: { template: "def backprop(d_out: np.ndarray, a_hidden: np.ndarray) -> np.ndarray:\n    # Calculate gradient of Weights (d_W) given d_out and hidden activations\n    # Hint: use np.dot with transpose\n    pass", test: "\ntest_result=''\ntry:\n    res=backprop(np.array([[0.5]]), np.array([[1.0, 2.0]]))\n    if res is None: test_result='FAIL: Returned None.'\n    elif np.allclose(res, np.array([[0.5], [1.0]])): test_result='PASS: Chain rule applied successfully.'\n    else: test_result='FAIL: Logic invalid.'\nexcept Exception as e: test_result='ERROR: '+str(e)" }
            };

            select.addEventListener('change', e => { editor.setValue(challenges[e.target.value].template); output.innerHTML = "SYSTEM READY."; });

            try {
                pyodide = await loadPyodide();
                await pyodide.loadPackage("numpy");
                await pyodide.runPythonAsync("import numpy as np\nimport sys\nimport io");
                runBtn.disabled = false; runBtn.innerText = "EXECUTE CODE";
                output.innerHTML = "PYTHON KERNEL READY."; editor.setValue(challenges.linear.template);
            } catch (err) { output.innerHTML = "<span style='color:red'>KERNEL INITIALIZATION FAILED.</span>"; }

            runBtn.addEventListener('click', async () => {
                output.innerHTML = "EXECUTING...";
                try {
                    await pyodide.runPythonAsync("sys.stdout = io.StringIO()");
                    await pyodide.runPythonAsync(editor.getValue() + challenges[select.value].test);
                    const stdout = await pyodide.runPythonAsync("sys.stdout.getvalue()");
                    const res = pyodide.globals.get('test_result');

                    let html = stdout ? `<div class='print-output'>[CONSOLE OUT]\n${stdout}</div>` : '';
                    if (res && res.startsWith("PASS")) html += `<span style='color:var(--success)'>[SYSTEM] ${res}</span>`;
                    else if (res && res.startsWith("FAIL")) html += `<span style='color:var(--apple)'>[SYSTEM] ${res}</span>`;
                    else html += `<span style='color:var(--apple)'>[SYSTEM] ${res || "FATAL ERROR."}</span>`;
                    output.innerHTML = html;
                } catch (e) { output.innerHTML = `<span style='color:var(--apple)'>[SYNTAX ERROR]<br>${e.message}</span>`; }
            });
        })();
