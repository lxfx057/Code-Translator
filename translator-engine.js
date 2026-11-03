(function (root) {
  "use strict";

  const LANGUAGES = ["python", "javascript", "c", "java", "go", "sql"];
  const EXTENSIONS = { python: "py", javascript: "js", c: "c", java: "java", go: "go", sql: "sql" };
  const KEYWORDS = {
    python: /\b(def|elif|print|None|True|False|self|import|from|lambda|pass)\b/,
    javascript: /\b(const|let|var|console\.log|function|=>|undefined|null|async|await)\b/,
    c: /#include\s*[<"]|printf\s*\(|scanf\s*\(|\b(int|char|float|double|void|printf)\b/,
    java: /\b(public\s+static\s+void\s+main|System\.out\.|String|class\s+\w+)/,
    go: /\b(package\s+main|func\s+main|fmt\.Print|:=|go\s+func)\b/,
    sql: /\b(SELECT|INSERT\s+INTO|UPDATE\s+\w+\s+SET|CREATE\s+TABLE|DELETE\s+FROM)\b/i
  };

  function detectLanguage(code) {
    const text = String(code || "");
    if (!text.trim()) return { language: null, confidence: 0, reason: "Codice vuoto" };
    const scores = Object.fromEntries(LANGUAGES.map(lang => [lang, 0]));
    for (const [lang, pattern] of Object.entries(KEYWORDS)) {
      const matches = text.match(new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g"));
      scores[lang] += (matches || []).length * 3;
    }
    if (/^\s*for\s+\w+\s+in\s+range\s*\(/m.test(text)) scores.python += 5;
    if (/^\s*(if|while|for)\s*\(.*\)\s*\{/m.test(text)) scores.javascript += 2;
    if (/^\s*def\s+\w+\s*\(/m.test(text)) scores.python += 5;
    if (/^\s*func\s+\w+\s*\(/m.test(text)) scores.go += 5;
    if (/^\s*package\s+\w+/m.test(text)) scores.go += 4;
    if (/^\s*#include/m.test(text)) scores.c += 5;
    if (/^\s*SELECT\b/im.test(text)) scores.sql += 5;
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [language, score] = ranked[0];
    const second = ranked[1][1];
    if (!score) return { language: null, confidence: 0, reason: "Sintassi non riconosciuta" };
    const confidence = Math.min(0.99, 0.45 + (score - second) * 0.09 + Math.min(score, 8) * 0.04);
    return { language, confidence, reason: confidence >= 0.75 ? "Rilevamento affidabile" : "Rilevamento incerto" };
  }

  function stripSemicolon(line) { return line.replace(/;\s*$/, "").trim(); }
  function convertLiterals(text, target) {
    let out = text;
    if (target === "python") {
      out = out.replace(/\btrue\b/g, "True").replace(/\bfalse\b/g, "False").replace(/\bnull\b|\bundefined\b/g, "None");
    } else if (target !== "sql") {
      out = out.replace(/\bTrue\b/g, "true").replace(/\bFalse\b/g, "false").replace(/\bNone\b/g, "null");
    }
    return out;
  }

  function convertPrint(line, source, target) {
    let m;
    if (source === "python" && (m = line.match(/^(\s*)print\s*\((.*)\)\s*$/))) {
      const pad = m[1], value = m[2];
      if (target === "javascript") return pad + "console.log(" + value + ");";
      if (target === "c") return pad + 'printf("%s\\n", ' + value + ");";
      if (target === "java") return pad + "System.out.println(" + value + ");";
      if (target === "go") return pad + "fmt.Println(" + value + ")";
    }
    const patterns = [
      ["javascript", /^\s*console\.log\s*\((.*)\)\s*;?\s*$/, "console"],
      ["c", /^\s*printf\s*\(\s*"%s\\n"\s*,\s*(.*)\)\s*;\s*$/, "printf"],
      ["java", /^\s*System\.out\.println\s*\((.*)\)\s*;\s*$/, "java"],
      ["go", /^\s*fmt\.Println\s*\((.*)\)\s*$/, "go"]
    ];
    for (const [lang, re] of patterns) {
      if (source === lang && (m = line.match(re))) {
        const pad = line.match(/^\s*/)[0], value = m[1];
        if (target === "python") return pad + "print(" + value + ")";
        if (target === "javascript") return pad + "console.log(" + value + ");";
        if (target === "c") return pad + 'printf("%s\\n", ' + value + ");";
        if (target === "java") return pad + "System.out.println(" + value + ");";
        if (target === "go") return pad + "fmt.Println(" + value + ")";
      }
    }
    return null;
  }

  function translatePython(code, target, warnings) {
    const lines = code.replace(/\r\n/g, "\n").split("\n");
    const out = [];
    const stack = [];
    const closeTo = level => {
      while (stack.length && stack[stack.length - 1] >= level) {
        stack.pop();
        out.push("    ".repeat(stack.length) + "}");
      }
    };
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i], trimmed = raw.trim();
      if (!trimmed) { out.push(""); continue; }
      const indent = raw.match(/^\s*/)[0].replace(/\t/g, "    ").length;
      const level = Math.floor(indent / 4);
      const pad = "    ".repeat(level);
      if (/^(elif\s+.+|else)\s*:$/.test(trimmed)) {
        if (stack.length) stack.pop();
        const condition = trimmed.match(/^elif\s+(.+):$/);
        out.push(pad + (condition ? "} else if (" + convertLiterals(condition[1], target) + ") {" : "} else {"));
        stack.push(level);
        continue;
      }
      closeTo(level);
      if (trimmed.startsWith("#")) { out.push(pad + (target === "python" ? trimmed : "//" + trimmed.slice(1))); continue; }
      let m;
      if ((m = trimmed.match(/^if\s+(.+):$/))) { out.push(pad + "if (" + convertLiterals(m[1], target) + ") {"); stack.push(level); continue; }
      if ((m = trimmed.match(/^while\s+(.+):$/))) { out.push(pad + "while (" + convertLiterals(m[1], target) + ") {"); stack.push(level); continue; }
      if ((m = trimmed.match(/^for\s+(\w+)\s+in\s+range\(\s*(?:(\d+)\s*,\s*)?(\d+)\s*\):$/))) {
        const start = m[2] || "0", end = m[3], v = m[1];
        if (target === "go") out.push(pad + "for " + v + " := " + start + "; " + v + " < " + end + "; " + v + "++ {");
        else out.push(pad + "for (let " + v + " = " + start + "; " + v + " < " + end + "; " + v + "++) {");
        stack.push(level); continue;
      }
      if ((m = trimmed.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:$/))) {
        const params = m[2].trim();
        if (target === "go") out.push(pad + "func " + m[1] + "(" + params + ") {");
        else if (target === "java" || target === "c") { out.push(pad + "/* TODO: add return and parameter types */"); out.push(pad + "void " + m[1] + "(" + params + ") {"); }
        else out.push(pad + "function " + m[1] + "(" + params + ") {");
        stack.push(level); continue;
      }
      const print = convertPrint(pad + trimmed, "python", target);
      if (print) { out.push(print); continue; }
      if ((m = trimmed.match(/^return(?:\s+(.+))?$/))) { out.push(pad + "return" + (m[1] ? " " + convertLiterals(m[1], target) : "") + (target === "python" || target === "go" ? "" : ";")); continue; }
      if ((m = trimmed.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/))) {
        let value = convertLiterals(m[2], target);
        if (target === "javascript") out.push(pad + "let " + m[1] + " = " + value + ";");
        else if (target === "go") out.push(pad + m[1] + " := " + value);
        else if (target === "c" || target === "java") {
          const type = /^["']/.test(value) ? (target === "java" ? "String" : "char*") : (/^(true|false)$/.test(value) ? "bool" : "int");
          out.push(pad + type + " " + m[1] + " = " + value + ";");
        } else out.push(pad + m[1] + " = " + value);
        continue;
      }
      if (target === "python") out.push(raw);
      else if (/^(pass)$/.test(trimmed)) out.push(pad + ";");
      else { warnings.push("Riga " + (i + 1) + ": sintassi Python non convertita automaticamente."); out.push(pad + "// REVIEW: " + trimmed); }
    }
    closeTo(0);
    if (stack.length) warnings.push("Uno o più blocchi potrebbero richiedere una revisione.");
    if (target === "go" && out.some(x => /\bfmt\.Println/.test(x))) out.unshift('import "fmt"', "");
    if ((target === "c" || target === "java") && out.some(x => /\bprintf\(/.test(x))) out.unshift(target === "c" ? '#include <stdio.h>' : "/* Add class and main method as needed */", "");
    return out.join("\n");
  }

  function translateJavaScriptToPython(code, warnings) {
    const lines = code.replace(/\r\n/g, "\n").split("\n");
    const out = [];
    let depth = 0;
    lines.forEach((raw, index) => {
      const line = raw.trim();
      if (!line) { out.push(""); return; }
      let m;
      if ((m = line.match(/^}\s*else\s+if\s*\((.*)\)\s*{\s*$/))) {
        depth = Math.max(0, depth - 1);
        out.push("    ".repeat(depth) + "elif " + convertLiterals(m[1], "python") + ":");
        depth++; return;
      }
      if (/^}\s*else\s*{\s*$/.test(line)) {
        depth = Math.max(0, depth - 1);
        out.push("    ".repeat(depth) + "else:");
        depth++; return;
      }
      if (/^}\s*;?\s*$/.test(line)) { depth = Math.max(0, depth - 1); return; }
      const pad = "    ".repeat(depth);
      if ((m = line.match(/^if\s*\((.*)\)\s*{\s*$/))) { out.push(pad + "if " + convertLiterals(m[1], "python") + ":"); depth++; return; }
      if ((m = line.match(/^while\s*\((.*)\)\s*{\s*$/))) { out.push(pad + "while " + convertLiterals(m[1], "python") + ":"); depth++; return; }
      if ((m = line.match(/^for\s*\(\s*(?:let|var|const)\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<\s*(\d+)\s*;\s*\1\+\+\s*\)\s*{\s*$/))) {
        out.push(pad + "for " + m[1] + " in range(" + m[2] + ", " + m[3] + "):"); depth++; return;
      }
      if (line.startsWith("//")) { out.push(pad + "#" + line.slice(2)); return; }
      if ((m = line.match(/^console\.log\s*\((.*)\)\s*;?$/))) { out.push(pad + "print(" + m[1] + ")"); return; }
      if ((m = line.match(/^(?:const|let|var)\s+([A-Za-z_]\w*)\s*=\s*(.*);?$/))) { out.push(pad + m[1] + " = " + convertLiterals(m[2].replace(/;\s*$/, ""), "python")); return; }
      if ((m = line.match(/^return(?:\s+(.*))?;?$/))) { out.push(pad + "return" + (m[1] ? " " + m[1].replace(/;\s*$/, "") : "")); return; }
      if (/^[A-Za-z_]\w*\s*=/.test(line)) { out.push(pad + convertLiterals(line.replace(/;\s*$/, ""), "python")); return; }
      warnings.push("Riga " + (index + 1) + ": istruzione JavaScript non convertita; mantenuta come commento.");
      out.push(pad + "# REVIEW: " + line);
    });
    if (depth !== 0) warnings.push("Le parentesi graffe non risultano bilanciate; controlla la struttura dei blocchi.");
    return out.join("\n");
  }

  function translateSimple(code, source, target, warnings) {
    if (source === "python") return translatePython(code, target, warnings);
    if (source === "javascript" && target === "python") return translateJavaScriptToPython(code, warnings);
    const lines = code.replace(/\r\n/g, "\n").split("\n");
    const out = lines.map((raw, index) => {
      const trimmed = raw.trim();
      if (!trimmed) return "";
      if (source === target) return raw;
      if (source === "javascript" && target === "python") {
        const pad = raw.match(/^\s*/)[0];
        if (/^\/\//.test(trimmed)) return pad + "#" + trimmed.slice(2);
        if (/^}\s*else\s*{$/.test(trimmed)) return pad + "else:";
        if (/^}\s*else if\s*\((.*)\)\s*{$/.test(trimmed)) return pad + "elif " + RegExp.$1 + ":";
        if (/^}\s*$/.test(trimmed)) return "";
        let m;
        if ((m = trimmed.match(/^if\s*\((.*)\)\s*{$/))) return pad + "if " + m[1] + ":";
        if ((m = trimmed.match(/^while\s*\((.*)\)\s*{$/))) return pad + "while " + m[1] + ":";
        if ((m = trimmed.match(/^for\s*\(\s*(?:let|var|const)\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<\s*(\d+)\s*;\s*\1\+\+\s*\)\s*{$/))) return pad + "for " + m[1] + " in range(" + m[2] + ", " + m[3] + "):";
        if (/^(const|let|var)\s+/.test(trimmed)) return pad + trimmed.replace(/^(const|let|var)\s+/, "").replace(/;\s*$/, "");
      }
      const print = convertPrint(raw, source, target);
      if (print) return print;
      if (source === "javascript" && target !== "python") return convertLiterals(raw, target);
      if (source === "java" || source === "c" || source === "go") {
        const p = convertPrint(raw, source, target);
        if (p) return p;
        let m;
        if (source === "go" && (m = trimmed.match(/^([A-Za-z_]\w*)\s*:=\s*(.+)$/))) {
          if (target === "javascript") return "let " + m[1] + " = " + m[2] + ";";
          if (target === "python") return m[1] + " = " + m[2];
        }
        if ((m = trimmed.match(/^(?:int|float|double|String|char\*)\s+([A-Za-z_]\w*)\s*=\s*(.+);$/))) {
          if (target === "python") return m[1] + " = " + m[2];
          if (target === "javascript") return "let " + m[1] + " = " + m[2] + ";";
        }
      }
      if (source === "sql" || target === "sql") {
        warnings.push("SQL non è un linguaggio general-purpose: la conversione automatica di query in codice applicativo non è supportata.");
        return raw;
      }
      warnings.push("Riga " + (index + 1) + ": costrutto non riconosciuto; mantenuto invariato.");
      return raw;
    });
    return out.join("\n");
  }

  function translate(code, source, target) {
    const warnings = [];
    const errors = [];
    if (typeof code !== "string" || !code.trim()) return { code: "", warnings, errors: ["Inserisci del codice da convertire."], confidence: 0 };
    if (!LANGUAGES.includes(target)) return { code: "", warnings, errors: ["Linguaggio di destinazione non valido."], confidence: 0 };
    if (source === "auto") {
      const detected = detectLanguage(code);
      if (!detected.language) return { code, warnings: ["Rilevamento automatico non riuscito: seleziona manualmente il linguaggio sorgente."], errors: [], confidence: 0 };
      source = detected.language;
      if (detected.confidence < 0.7) warnings.push("Rilevamento sorgente incerto (" + source + "). Verifica il linguaggio prima di usare il risultato.");
    }
    if (!LANGUAGES.includes(source)) return { code: "", warnings, errors: ["Linguaggio sorgente non valido."], confidence: 0 };
    if (source === target) return { code, warnings: ["Sorgente e destinazione coincidono: il codice è stato lasciato invariato."], errors, confidence: 1 };
    if (source === "sql" || target === "sql") {
      return { code, warnings: ["SQL è un linguaggio di interrogazione dati, non un equivalente diretto di Python, JavaScript, C, Java o Go. La traduzione semantica tra SQL e questi linguaggi non viene simulata."], errors, confidence: 0 };
    }
    const result = translateSimple(code, source, target, warnings);
    if (!warnings.length) warnings.push("Conversione dei costrutti riconosciuti completata. Verifica e testa sempre il risultato.");
    return { code: result, warnings, errors, confidence: warnings.some(w => w.includes("non riconosciuto") || w.includes("non convertita")) ? 0.55 : 0.78, source };
  }

  const api = { translate, detectLanguage, languages: LANGUAGES.slice(), extensions: { ...EXTENSIONS } };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.CodeTranslator = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
