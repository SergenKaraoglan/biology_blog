// Computer Science Quiz Logic

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
    output.innerText = 'Pyodide Computer Science Module Active.';

    const challenges = {
        bubble: `def bubble_sort(arr):
    n = len(arr)
    # Implement the bubble sort algorithm here
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

test_list = [64, 34, 25, 12, 22, 11, 90]
print(f"Original: {test_list}")
print(f"Sorted:   {bubble_sort(test_list)}")`,
        complexity: `import time

def slow_function(n):
    # O(N^2) complexity
    total = 0
    for i in range(n):
        for j in range(n):
            total += 1
    return total

def fast_function(n):
    # O(N) complexity
    total = 0
    for i in range(n):
        total += 1
    return total

n = 1000
start = time.time()
slow_function(n)
mid = time.time()
fast_function(n)
end = time.time()

print(f"N = {n}")
print(f"O(N^2) Time: {mid - start:.5f}s")
print(f"O(N) Time:   {end - mid:.5f}s")`,
        binary_search: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

data = sorted([1, 5, 8, 12, 15, 23, 38, 45, 56, 72])
target = 23
print(f"Searching for {target} in sorted data...")
index = binary_search(data, target)
print(f"Found at index: {index}")`,
        compiler: `def generate_asm(op, left, right):
    # Very basic "compiler" backend
    asm = f"MOV R1, {left}\\n"
    if op == '+':
        asm += f"ADD R1, {right}\\n"
    elif op == '*':
        asm += f"MUL R1, {right}\\n"
    asm += "STR R1, [result]"
    return asm

print("Compiling expression: 5 + 3")
print(generate_asm('+', 5, 3))`,
        interpreter: `def evaluate(expr):
    # Base interpreter logic: split by '+' and sum components
    parts = expr.split('+')
    total = sum(int(p.strip()) for p in parts)
    return total

expression = "8 + 4 + 2"
print(f"Interpreting: {expression}")
print(f"Result: {evaluate(expression)}")`
    };

    editor.value = challenges[select.value];

    select.addEventListener('change', () => {
        editor.value = challenges[select.value];
    });

    runBtn.addEventListener('click', async () => {
        output.innerText = 'Running simulation...';
        try {
            pyodide.runPython(`
import sys
import io
sys.stdout = io.String()
            `);
            await pyodide.runPythonAsync(editor.value);
            const result = pyodide.runPython("sys.stdout.getvalue()");
            output.innerText = result || 'Executed successfully.';
        } catch (err) {
            output.innerText = 'EXECUTION ERROR: ' + err.message;
        }
    });

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
