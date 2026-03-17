/* bio_quiz.js — Pyodide-based Biology Quiz */

(async function () {
    const select = document.getElementById('quiz-select');
    const runBtn = document.getElementById('quiz-run-btn');
    const output = document.getElementById('quiz-output');
    let pyodide = null;

    const editor = CodeMirror.fromTextArea(document.getElementById('quiz-editor'), {
        mode: "python", theme: "monokai", lineNumbers: true, indentUnit: 4, matchBrackets: true
    });

    const challenges = {
        pairing: { 
            template: "def get_complement(base):\n    # Return the complement of base (A->T, T->A, C->G, G->C)\n    pass", 
            test: "\ntest_result=''\ntry:\n    if get_complement('A')=='T' and get_complement('G')=='C': test_result='PASS: Base pairing logic correct.'\n    else: test_result='FAIL: Pairing logic incorrect.'\nexcept Exception as e: test_result='ERROR: '+str(e)" 
        },
        transcription: { 
            template: "def transcribe(dna_seq):\n    # Convert DNA string to mRNA string (Replace T with U)\n    pass", 
            test: "\ntest_result=''\ntry:\n    if transcribe('ATGC')=='AUGC': test_result='PASS: Transcription successful.'\n    else: test_result='FAIL: Logic mismatch.'\nexcept Exception as e: test_result='ERROR: '+str(e)" 
        },
        codon: { 
            template: "def is_start_codon(seq):\n    # Return True if sequence is 'ATG'\n    pass", 
            test: "\ntest_result=''\ntry:\n    if is_start_codon('ATG') == True and is_start_codon('GCC') == False: test_result='PASS: Start codon recognized. Sequence initiated.'\n    else: test_result='FAIL: Incorrect identification.'\nexcept Exception as e: test_result='ERROR: '+str(e)" 
        }
    };

    select.addEventListener('change', e => { 
        editor.setValue(challenges[e.target.value].template); 
        output.innerHTML = "SYSTEM READY."; 
    });

    try {
        pyodide = await loadPyodide();
        await pyodide.runPythonAsync("import sys\nimport io");
        runBtn.disabled = false; 
        runBtn.innerText = "EXECUTE CODE";
        output.innerHTML = "PYTHON KERNEL READY."; 
        editor.setValue(challenges.pairing.template);
    } catch (err) { 
        output.innerHTML = "<span style='color:#ff0055'>KERNEL INITIALIZATION FAILED.</span>"; 
    }

    runBtn.addEventListener('click', async () => {
        output.innerHTML = "EXECUTING...";
        try {
            await pyodide.runPythonAsync("sys.stdout = io.StringIO()");
            await pyodide.runPythonAsync(editor.getValue() + challenges[select.value].test);
            const stdout = await pyodide.runPythonAsync("sys.stdout.getvalue()");
            const res = pyodide.globals.get('test_result');

            let html = stdout ? `<div style='color:#00aaff; margin-bottom:0.5rem;'>[CONSOLE]\n${stdout}</div>` : '';
            if (res && res.startsWith("PASS")) html += `<span style='color:var(--bio-green)'>[SYSTEM] ${res}</span>`;
            else html += `<span style='color:#ff0055'>[SYSTEM] ${res || "FATAL ERROR."}</span>`;
            output.innerHTML = html;
        } catch (e) { 
            output.innerHTML = `<span style='color:#ff0055'>[SYNTAX ERROR]<br>${e.message}</span>`; 
        }
    });
})();
