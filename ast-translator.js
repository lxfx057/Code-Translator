(function (root) {
  "use strict";

  function expression(value, target) {
    let s = value.trim();
    if (target === "javascript") {
      s = s.replace(/\bTrue\b/g, "true").replace(/\bFalse\b/g, "false").replace(/\bNone\b/g, "null")
        .replace(/\band\b/g, "&&").replace(/\bor\b/g, "||").replace(/\bnot\b/g, "!")
        .replace(/(^|[^=!<>])==([^=])/g, "$1===$2").replace(/!=/g, "!==");
    } else {
      s = s.replace(/\btrue\b/g, "True").replace(/\bfalse\b/g, "False").replace(/\bnull\b|\bundefined\b/g, "None")
        .replace(/&&/g, " and ").replace(/\|\|/g, " or ").replace(/!==/g, "!=").replace(/===/g, "==")
        .replace(/!(?!=)/g, "not ");
    }
    return s.replace(/\s+/g, " ").trim();
  }

  function parsePython(code) {
    const lines = code.replace(/\r\n/g, "\n").split("\n");
    const rootNode = { type: "block", body: [] };
    const stack = [{ indent: -1, body: rootNode.body, node: rootNode }];
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i], text = raw.trim();
      if (!text) continue;
      const indent = raw.match(/^[ \t]*/)[0].replace(/\t/g, "    ").length;
      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
      const parent = stack[stack.length - 1].body;
      let m, node;
      if (text.startsWith("#")) node = { type: "comment", value: text.slice(1).trim() };
      else if ((m = text.match(/^if\s+(.+):$/))) node = { type: "if", test: m[1], body: [] };
      else if ((m = text.match(/^elif\s+(.+):$/))) {
        const previous = parent[parent.length - 1];
        if (!previous || previous.type !== "if") throw new Error("elif senza if corrispondente alla riga " + (i + 1));
        node = { type: "if", test: m[1], body: [] };
        previous.alternate = [node];
      } else if (/^else\s*:$/.test(text)) {
        const previous = parent[parent.length - 1];
        if (!previous || !["if", "while", "for", "function"].includes(previous.type)) throw new Error("else senza blocco corrispondente alla riga " + (i + 1));
        previous.alternate = [];
        node = { type: "alternate-container", body: previous.alternate };
      } else if ((m = text.match(/^while\s+(.+):$/))) node = { type: "while", test: m[1], body: [] };
      else if ((m = text.match(/^for\s+([A-Za-z_]\w*)\s+in\s+range\(\s*(?:(-?\d+)\s*,\s*)?(-?\d+)\s*\):$/))) node = { type: "range", variable: m[1], start: m[2] || "0", end: m[3], body: [] };
      else if ((m = text.match(/^def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:$/))) node = { type: "function", name: m[1], params: m[2].split(",").map(x => x.trim()).filter(Boolean), body: [] };
      else if ((m = text.match(/^print\s*\((.*)\)\s*$/))) node = { type: "print", value: m[1] };
      else if ((m = text.match(/^return(?:\s+(.+))?$/))) node = { type: "return", value: m[1] || "" };
      else if ((m = text.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/))) node = { type: "assign", name: m[1], value: m[2] };
      else if (text === "pass") node = { type: "pass" };
      else throw new Error("Costrutto Python non supportato alla riga " + (i + 1) + ": " + text);
      if (node.type === "alternate-container") {
        stack.push({ indent, body: node.body, node });
      } else {
        parent.push(node);
        if (node.body) stack.push({ indent, body: node.body, node });
      }
    }
    return rootNode;
  }

  function parseJavaScript(code) {
    const lines = code.replace(/\r\n/g, "\n").split("\n");
    const rootNode = { type: "block", body: [] };
    const stack = [{ body: rootNode.body, node: rootNode }];
    for (let i = 0; i < lines.length; i++) {
      const text = lines[i].trim();
      if (!text) continue;
      let m, parent = stack[stack.length - 1].body;
      if (/^}\s*;?$/.test(text)) {
        if (stack.length === 1) throw new Error("Graffa di chiusura inattesa alla riga " + (i + 1));
        stack.pop(); continue;
      }
      if ((m = text.match(/^}\s*else\s+if\s*\((.*)\)\s*{\s*$/))) {
        if (stack.length === 1) throw new Error("else if senza if alla riga " + (i + 1));
        const closed = stack.pop().node;
        const alt = { type: "if", test: m[1], body: [] };
        closed.alternate = [alt];
        stack.push({ body: alt.body, node: alt }); continue;
      }
      if (/^}\s*else\s*{\s*$/.test(text)) {
        if (stack.length === 1) throw new Error("else senza if alla riga " + (i + 1));
        const closed = stack.pop().node;
        closed.alternate = [];
        const alt = { type: "alternate-container", body: closed.alternate };
        stack.push({ body: alt.body, node: alt }); continue;
      }
      let node;
      if (text.startsWith("//")) node = { type: "comment", value: text.slice(2).trim() };
      else if ((m = text.match(/^if\s*\((.*)\)\s*{\s*$/))) node = { type: "if", test: m[1], body: [] };
      else if ((m = text.match(/^while\s*\((.*)\)\s*{\s*$/))) node = { type: "while", test: m[1], body: [] };
      else if ((m = text.match(/^for\s*\(\s*(?:let|var|const)\s+([A-Za-z_]\w*)\s*=\s*(-?\d+)\s*;\s*\1\s*<\s*(-?\d+)\s*;\s*\1\+\+\s*\)\s*{\s*$/))) node = { type: "range", variable: m[1], start: m[2], end: m[3], body: [] };
      else if ((m = text.match(/^(?:function)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*{\s*$/))) node = { type: "function", name: m[1], params: m[2].split(",").map(x => x.trim()).filter(Boolean), body: [] };
      else if ((m = text.match(/^console\.log\s*\((.*)\)\s*;?$/))) node = { type: "print", value: m[1] };
      else if ((m = text.match(/^return(?:\s+(.+?))?;?$/))) node = { type: "return", value: (m[1] || "").replace(/;\s*$/, "") };
      else if ((m = text.match(/^(?:let|const|var)\s+([A-Za-z_]\w*)\s*=\s*(.+?);?$/))) node = { type: "assign", name: m[1], value: m[2].replace(/;\s*$/, "") };
      else if ((m = text.match(/^([A-Za-z_]\w*)\s*=\s*(.+?);?$/))) node = { type: "assign", name: m[1], value: m[2].replace(/;\s*$/, "") };
      else if (text === ";") node = { type: "pass" };
      else throw new Error("Costrutto JavaScript non supportato alla riga " + (i + 1) + ": " + text);
      parent.push(node);
      if (node.body) stack.push({ body: node.body, node });
    }
    if (stack.length !== 1) throw new Error("Blocco JavaScript non chiuso: manca una graffa }.");
    return rootNode;
  }

  function emit(nodes, target, depth) {
    const pad = "    ".repeat(depth);
    const out = [];
    for (const n of nodes) {
      if (n.type === "comment") out.push(pad + (target === "python" ? "# " : "// ") + n.value);
      else if (n.type === "print") out.push(pad + (target === "python" ? "print(" + expression(n.value, target) + ")" : "console.log(" + expression(n.value, target) + ");"));
      else if (n.type === "assign") out.push(pad + (target === "python" ? n.name + " = " + expression(n.value, target) : "let " + n.name + " = " + expression(n.value, target) + ";"));
      else if (n.type === "return") out.push(pad + "return" + (n.value ? " " + expression(n.value, target) : "") + (target === "python" ? "" : ";"));
      else if (n.type === "pass") out.push(pad + (target === "python" ? "pass" : ";"));
      else if (n.type === "if") {
        out.push(pad + (target === "python" ? "if " + expression(n.test, target) + ":" : "if (" + expression(n.test, target) + ") {"));
        out.push(...emit(n.body, target, depth + 1));
        if (n.alternate) {
          if (n.alternate.length === 1 && n.alternate[0].type === "if") {
            const alt = n.alternate[0];
            out.push(pad + (target === "python" ? "elif " + expression(alt.test, target) + ":" : "} else if (" + expression(alt.test, target) + ") {"));
            out.push(...emit(alt.body, target, depth + 1));
            if (alt.alternate) out.push(...emitAlternate(alt.alternate, target, depth));
            if (target === "javascript") out.push(pad + "}");
          } else {
            out.push(pad + (target === "python" ? "else:" : "} else {"));
            out.push(...emit(n.alternate, target, depth + 1));
            if (target === "javascript") out.push(pad + "}");
          }
        } else if (target === "javascript") out.push(pad + "}");
      } else if (n.type === "while" || n.type === "range") {
        const header = n.type === "while"
          ? (target === "python" ? "while " + expression(n.test, target) + ":" : "while (" + expression(n.test, target) + ") {")
          : (target === "python" ? "for " + n.variable + " in range(" + n.start + ", " + n.end + "):" : "for (let " + n.variable + " = " + n.start + "; " + n.variable + " < " + n.end + "; " + n.variable + "++) {");
        out.push(pad + header, ...emit(n.body, target, depth + 1));
        if (target === "javascript") out.push(pad + "}");
      } else if (n.type === "function") {
        out.push(pad + (target === "python" ? "def " + n.name + "(" + n.params.join(", ") + "):" : "function " + n.name + "(" + n.params.join(", ") + ") {"));
        out.push(...emit(n.body, target, depth + 1));
        if (target === "javascript") out.push(pad + "}");
      }
    }
    return out;
  }

  function emitAlternate(nodes, target, depth) {
    if (nodes.length === 1 && nodes[0].type === "if") return emit(nodes, target, depth);
    return [ "    ".repeat(depth) + (target === "python" ? "else:" : "} else {"), ...emit(nodes, target, depth + 1), ...(target === "javascript" ? ["    ".repeat(depth) + "}"] : []) ];
  }

  function translate(code, source, target) {
    try {
      const ast = source === "python" ? parsePython(code) : parseJavaScript(code);
      return { code: emit(ast.body, target, 0).join("\n"), warnings: [], confidence: 0.9, parser: source + "-ast" };
    } catch (error) {
      return { code: "", warnings: [error.message + ". Nessun output parziale è stato generato: usa la conversione conservativa oppure semplifica il frammento."], confidence: 0, error: true, parser: source + "-ast" };
    }
  }

  root.CodeTranslatorAST = { translate };
  if (typeof module !== "undefined" && module.exports) module.exports = root.CodeTranslatorAST;
})(typeof globalThis !== "undefined" ? globalThis : this);
