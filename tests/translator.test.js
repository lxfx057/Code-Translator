const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../translator-engine.js");

test("detects Python snippets", () => {
  const result = engine.detectLanguage('for i in range(3):\n    print(i)');
  assert.equal(result.language, "python");
});

test("translates a basic Python loop and print to JavaScript", () => {
  const result = engine.translate('for i in range(3):\n    print(i)', "python", "javascript");
  assert.match(result.code, /for \(let i = 0; i < 3; i\+\+\) \{/);
  assert.match(result.code, /console\.log\(i\);/);
  assert.match(result.code, /\n\}/);
});

test("translates JavaScript blocks to indented Python", () => {
  const result = engine.translate('if (ready) {\n  console.log("go");\n}', "javascript", "python");
  assert.equal(result.code, 'if ready:\n    print("go")');
});

test("does not pretend SQL can be translated to application code", () => {
  const result = engine.translate("SELECT * FROM users;", "sql", "python");
  assert.equal(result.confidence, 0);
  assert.match(result.warnings.join(" "), /SQL/);
});

test("rejects empty input", () => {
  const result = engine.translate("   ", "python", "javascript");
  assert.equal(result.code, "");
  assert.ok(result.errors.length);
});

test("AST parser translates Python conditionals and boolean operators", () => {
  const result = engine.translate('ready = True\nif ready and count > 2:\n    print("ok")\nelse:\n    print("wait")', "python", "javascript");
  assert.equal(result.parser, "python-ast");
  assert.match(result.code, /if \(ready && count > 2\)/);
  assert.match(result.code, /} else \{/);
  assert.match(result.code, /console\.log\("wait"\);/);
});

test("AST parser translates JavaScript functions and loops", () => {
  const result = engine.translate('function greet(name) {\n  console.log(name);\n}\nfor (let i = 0; i < 3; i++) {\n  greet(i);\n}', "javascript", "python");
  assert.equal(result.parser, "javascript-ast");
  assert.match(result.code, /def greet\(name\):/);
  assert.match(result.code, /for i in range\(0, 3\):/);
});

test("AST parser refuses unsupported syntax instead of returning a misleading partial conversion", () => {
  const result = engine.translate('const fn = (x) => x + 1;', "javascript", "python");
  assert.equal(result.code, "");
  assert.equal(result.confidence, 0);
  assert.match(result.warnings.join(" "), /non supportato/);
});
