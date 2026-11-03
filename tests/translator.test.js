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
