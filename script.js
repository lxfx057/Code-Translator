const inputCode = document.getElementById("inputCode");
const outputCode = document.getElementById("outputCode");
const sourceLang = document.getElementById("sourceLang");
const targetLang = document.getElementById("targetLang");
const translateBtn = document.getElementById("translateBtn");

function highlightError() {
    outputCode.style.backgroundColor = '#ff4d4d'; // rosso
    setTimeout(() => {
        outputCode.style.backgroundColor = 'rgba(40, 40, 60, 0.6)'; // colore normale
    }, 1200);
}

/**
 * Traduzione deterministica tra Python, JS, C, Java, Go, SQL
 */
function translateCode(code, source, target) {
    if (source === target) return code;
    let translated = code;
    let mappingExists = true;

    // --- Python as source ---
    if (source === "python") {
        if (target === "javascript") {
            translated = translated
                .replace(/print\((.*)\)/g, 'console.log($1)')
                .replace(/for (.+) in range\((.+)\):/g, 'for(let $1=0; $1<$2; $1++){')
                .replace(/:$/g, '{')
                .replace(/^\s+$/gm, '}');
        } else if (target === "c") {
            translated = translated
                .replace(/print\((.*)\)/g, 'printf("%s\\n",$1);')
                .replace(/for (.+) in range\((.+)\):/g, 'for(int $1=0;$1<$2;$1++){')
                .replace(/:$/g, '{')
                .replace(/^\s+$/gm, '}');
        } else if (target === "java") {
            translated = translated
                .replace(/print\((.*)\)/g, 'System.out.println($1);')
                .replace(/for (.+) in range\((.+)\):/g, 'for(int $1=0;$1<$2;$1++){')
                .replace(/:$/g, '{')
                .replace(/^\s+$/gm, '}');
        } else if (target === "go") {
            translated = translated
                .replace(/print\((.*)\)/g, 'fmt.Println($1)')
                .replace(/for (.+) in range\((.+)\):/g, 'for $1:=0;$1<$2;$1++ {')
                .replace(/:$/g, '{')
                .replace(/^\s+$/gm, '}');
        } else if (target === "sql") {
            translated = '/* Python → SQL mapping not available */';
        } else mappingExists = false;
    }

    // --- JavaScript as source ---
    else if (source === "javascript") {
        if (target === "python") {
            translated = translated
                .replace(/console\.log\((.*)\)/g, 'print($1)')
                .replace(/for\s*\(\s*let\s*(.+)=0;\s*\1<(.+);\s*\1\+\+\)/g, 'for $1 in range($2):')
                .replace(/{/g, '')
                .replace(/}/g, '');
        } else if (target === "c") {
            translated = translated
                .replace(/console\.log\((.*)\)/g, 'printf("%s\\n",$1);')
                .replace(/for\s*\(\s*let\s*(.+)=0;\s*\1<(.+);\s*\1\+\+\)/g, 'for(int $1=0;$1<$2;$1++){');
        } else if (target === "java") {
            translated = translated
                .replace(/console\.log\((.*)\)/g, 'System.out.println($1);')
                .replace(/for\s*\(\s*let\s*(.+)=0;\s*\1<(.+);\s*\1\+\+\)/g, 'for(int $1=0;$1<$2;$1++){');
        } else if (target === "go") {
            translated = translated
                .replace(/console\.log\((.*)\)/g, 'fmt.Println($1)')
                .replace(/for\s*\(\s*let\s*(.+)=0;\s*\1<(.+);\s*\1\+\+\)/g, 'for $1:=0;$1<$2;$1++ {');
        } else if (target === "sql") {
            translated = '/* JavaScript → SQL mapping not available */';
        } else mappingExists = false;
    }

    // --- C as source ---
    else if (source === "c") {
        if (target === "python") {
            translated = translated
                .replace(/printf\("%s\\n",(.*)\);/g, 'print($1)')
                .replace(/for\s*\(int\s*(.+)=0;\s*\1<(.+);\s*\1\+\+\)/g, 'for $1 in range($2):')
                .replace(/{/g, '')
                .replace(/}/g, '');
        } else if (target === "javascript") {
            translated = translated
                .replace(/printf\("%s\\n",(.*)\);/g, 'console.log($1)')
                .replace(/for\s*\(int\s*(.+)=0;\s*\1<(.+);\s*\1\+\+\)/g, 'for(let $1=0; $1<$2; $1++){')
                .replace(/{/g, '')
                .replace(/}/g, '');
        } else if (target === "java") {
            translated = translated
                .replace(/printf\("%s\\n",(.*)\);/g, 'System.out.println($1)')
                .replace(/for\s*\(int\s*(.+)=0;\s*\1<(.+);\s*\1\+\+\)/g, 'for(int $1=0;$1<$2;$1++){')
                .replace(/{/g, '')
                .replace(/}/g, '');
        } else if (target === "go") {
            translated = translated
                .replace(/printf\("%s\\n",(.*)\);/g, 'fmt.Println($1)')
                .replace(/for\s*\(int\s*(.+)=0;\s*\1<(.+);\s*\1\+\+\)/g, 'for $1:=0;$1<$2;$1++ {');
        } else if (target === "sql") {
            translated = '/* C → SQL mapping not available */';
        } else mappingExists = false;
    }

    // --- Java as source ---
    else if (source === "java") {
        if (target === "python") translated = translated.replace(/System\.out\.println\((.*)\);/g, 'print($1)');
        else if (target === "javascript") translated = translated.replace(/System\.out\.println\((.*)\);/g, 'console.log($1)');
        else if (target === "c") translated = translated.replace(/System\.out\.println\((.*)\);/g, 'printf("%s\\n",$1);');
        else if (target === "go") translated = translated.replace(/System\.out\.println\((.*)\);/g, 'fmt.Println($1)');
        else if (target === "sql") translated = '/* Java → SQL mapping not available */';
        else mappingExists = false;
    }

    // --- Go as source ---
    else if (source === "go") {
        if (target === "python") translated = translated.replace(/fmt\.Println\((.*)\)/g, 'print($1)');
        else if (target === "javascript") translated = translated.replace(/fmt\.Println\((.*)\)/g, 'console.log($1)');
        else if (target === "c") translated = translated.replace(/fmt\.Println\((.*)\)/g, 'printf("%s\\n",$1);');
        else if (target === "java") translated = translated.replace(/fmt\.Println\((.*)\)/g, 'System.out.println($1);');
        else if (target === "sql") translated = '/* Go → SQL mapping not available */';
        else mappingExists = false;
    }

    // --- SQL as source ---
    else if (source === "sql") {
        translated = '/* SQL → Other languages mapping not available */';
        mappingExists = false;
    }

    if (!mappingExists || translated.includes('not available')) {
        highlightError();
        return 'No valid result';
    }

    return translated;
}

const statusBar = document.getElementById("statusBar");
const swapBtn = document.getElementById("swapBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

translateBtn.addEventListener("click", () => {
    const code = inputCode.value;
    if (!code.trim()) {
        outputCode.value = "";
        statusBar.textContent = "Inserisci prima del codice da convertire.";
        return;
    }
    if (code.length > 100000) {
        statusBar.textContent = "Il codice supera il limite di 100.000 caratteri.";
        return;
    }
    const source = sourceLang.value;
    const target = targetLang.value;
    const translated = translateCode(code, source, target);
    outputCode.value = translated;
    statusBar.textContent = translated === "No valid result"
        ? "Conversione non disponibile per questa combinazione o per la sintassi inserita."
        : source === target
            ? "Le lingue selezionate coincidono: codice copiato senza modifiche."
            : "Conversione euristica completata. Controlla e testa il risultato prima di usarlo.";
});

swapBtn?.addEventListener("click", () => {
    const current = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = current;
    statusBar.textContent = "Linguaggi invertiti.";
});

copyBtn?.addEventListener("click", async () => {
    if (!outputCode.value.trim()) {
        statusBar.textContent = "Non c'è alcun risultato da copiare.";
        return;
    }
    try {
        await navigator.clipboard.writeText(outputCode.value);
        statusBar.textContent = "Risultato copiato negli appunti.";
    } catch {
        outputCode.focus();
        outputCode.select();
        statusBar.textContent = "Copia automatica non disponibile: seleziona il testo e copialo manualmente.";
    }
});

downloadBtn?.addEventListener("click", () => {
    if (!outputCode.value.trim()) {
        statusBar.textContent = "Non c'è alcun risultato da scaricare.";
        return;
    }
    const blob = new Blob([outputCode.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "converted-code.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    statusBar.textContent = "File di testo generato.";
});
