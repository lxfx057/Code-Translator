# Offline Code Translator

A browser-based, local-first code conversion tool. It does not upload source code or require an account.

## What it currently does

- Detects likely source language among Python, JavaScript, C, Java, Go and SQL.
- Converts a deliberately limited set of common constructs between supported general-purpose languages.
- Supports basic Python print, assignments, if / elif / else, while, range() loops, simple function declarations and returns to JavaScript and Go-oriented syntax.
- Converts a subset of JavaScript blocks, console.log, simple declarations, if, else, while and canonical counter loops to Python.
- Converts common print statements and a small set of simple declarations between C, Java and Go.
- Reports uncertain or unsupported statements rather than claiming a complete semantic translation.
- Copies output and downloads it with the target file extension.
- Runs locally in the browser; no build step or runtime service is required.

## Important limitations

This is **not** a full compiler, parser, AST-based transpiler or AI translator. It does not yet preserve arbitrary program semantics, types, classes, exceptions, async code, complex expressions, imports, generics, pointers, macros or framework-specific APIs. C, Java and Go conversions are intentionally limited. SQL is not translated to or from application languages because the languages have different execution models.

The language detector is heuristic. A detected language and confidence estimate are suggestions, not proof. Unsupported lines are preserved or marked for review; always inspect and run generated code in the target environment before relying on it.

## Run

Open index.html in a modern browser. The application is static and requires no server.

## Tests

Requires Node.js 20 or newer:

```bash
npm test
```

The tests cover language detection, basic Python-to-JavaScript conversion, JavaScript-to-Python indentation, SQL limitation handling and empty input.

## Project structure

```text
.
├── index.html
├── style.css
├── script.js
├── translator-engine.js
├── package.json
└── tests/
    └── translator.test.js
```

## Privacy

All conversion happens in the browser. The application does not send snippets to a backend. The interface uses system font stacks and does not need a remote font service.

## License

See the repository license file, if present.
