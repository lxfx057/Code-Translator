(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const input = $("inputCode"), output = $("outputCode");
  const source = $("sourceLang"), target = $("targetLang");
  const status = $("statusBar"), warnings = $("warningList");
  const count = $("inputCount"), outputCount = $("outputCount");
  const state = $("resultState");
  let lastResult = null;

  const examples = {
    python: 'name = "Luca"\nfor i in range(3):\n    print("Hello", name, i)',
    javascript: 'const name = "Luca";\nfor (let i = 0; i < 3; i++) {\n  console.log("Hello", name, i);\n}',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, world")\n}'
  };

  function setStatus(message, list = []) {
    status.textContent = message;
    warnings.replaceChildren();
    list.forEach(message => {
      const li = document.createElement("li");
      li.textContent = message;
      warnings.appendChild(li);
    });
  }
  function updateCounts() {
    count.textContent = input.value.length.toLocaleString() + " characters";
    outputCount.textContent = output.value.length.toLocaleString() + " characters";
    $("inputLanguageLabel").textContent = source.value === "auto" ? "AUTO DETECT" : source.value.toUpperCase();
    $("outputLanguageLabel").textContent = target.value.toUpperCase();
  }
  function translate() {
    updateCounts();
    if (!input.value.trim()) {
      output.value = "";
      lastResult = null;
      state.textContent = "WAITING FOR INPUT";
      setStatus("Inserisci codice sorgente prima di avviare la conversione.");
      updateCounts();
      return;
    }
    if (input.value.length > 100000) {
      output.value = "";
      lastResult = null;
      state.textContent = "INPUT TOO LARGE";
      setStatus("Il limite è di 100.000 caratteri. Riduci il codice e riprova.");
      updateCounts();
      return;
    }
    if (!window.CodeTranslator) {
      setStatus("Errore: motore di traduzione non caricato. Ricarica la pagina.");
      state.textContent = "ENGINE ERROR";
      return;
    }
    const result = window.CodeTranslator.translate(input.value, source.value, target.value);
    lastResult = result;
    output.value = result.code || "";
    const detected = result.source ? " Sorgente: " + result.source + "." : "";
    if (result.errors.length) {
      state.textContent = "CONVERSION ERROR";
      setStatus(result.errors.join(" "), result.warnings);
    } else if (!result.code) {
      state.textContent = "NOT SUPPORTED";
      setStatus("Nessuna conversione automatica affidabile disponibile." + detected, result.warnings);
    } else {
      state.textContent = result.warnings.length ? "REVIEW REQUIRED" : "CONVERTED";
      setStatus("Elaborazione terminata." + detected + " Affidabilità indicativa: " + Math.round(result.confidence * 100) + "%. " + "Controlla sempre il codice generato.", result.warnings);
    }
    updateCounts();
  }

  $("translateBtn").addEventListener("click", translate);
  $("swapBtn").addEventListener("click", () => {
    if (source.value === "auto") {
      const detected = window.CodeTranslator.detectLanguage(input.value);
      if (!detected.language) {
        setStatus("Non posso invertire i linguaggi: prima seleziona manualmente la sorgente o inserisci codice riconoscibile.");
        return;
      }
      source.value = target.value;
      target.value = detected.language;
    } else {
      const old = source.value;
      source.value = target.value;
      target.value = old;
    }
    updateCounts();
    if (input.value.trim()) translate();
    else setStatus("Linguaggi invertiti.");
  });
  $("clearBtn").addEventListener("click", () => {
    input.value = ""; output.value = ""; lastResult = null;
    state.textContent = "WAITING FOR INPUT";
    setStatus("Editor pulito. Inserisci un nuovo frammento di codice.");
    updateCounts(); input.focus();
  });
  $("sampleBtn").addEventListener("click", () => {
    const lang = source.value === "auto" ? "python" : source.value;
    input.value = examples[lang] || examples.python;
    if (source.value === "auto") source.value = "python";
    updateCounts(); translate();
  });
  $("copyBtn").addEventListener("click", async () => {
    if (!output.value.trim()) { setStatus("Non c'è alcun risultato da copiare."); return; }
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(output.value);
      else {
        output.focus(); output.select();
        const copied = document.execCommand("copy");
        if (!copied) throw new Error("Clipboard unavailable");
      }
      setStatus("Risultato copiato negli appunti.", lastResult?.warnings || []);
    } catch {
      output.focus(); output.select();
      setStatus("Copia automatica non disponibile: il testo è selezionato, usa Copia dal dispositivo.");
    }
  });
  $("downloadBtn").addEventListener("click", () => {
    if (!output.value.trim()) { setStatus("Non c'è alcun risultato da scaricare."); return; }
    const ext = window.CodeTranslator.extensions[target.value] || "txt";
    const blob = new Blob([output.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "translated-code." + ext;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("File translated-code." + ext + " pronto.", lastResult?.warnings || []);
  });
  input.addEventListener("input", updateCounts);
  source.addEventListener("change", updateCounts);
  target.addEventListener("change", updateCounts);
  input.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") translate();
  });
  updateCounts();
})();