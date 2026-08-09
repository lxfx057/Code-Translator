# 🧠 Offline Code Translator

Translate code between 10+ programming languages **entirely offline**, using a hybrid engine (AST + deterministic rules) and a modern interface.

---

## 📔 Description

**Offline Code Translator** is a client-side web app that lets you translate code snippets between multiple languages without a server or internet connection.

- **Bidirectional translation** between all supported language pairs  
- **Automatic detection** of the source language  
- **Hybrid engine**:  
  - AST-based semantic analysis  
  - Deterministic rules with regex-based fallback  
- All parsers and libraries are loaded **locally** and work **100% offline**

---

## 🔤 Supported Languages

- Python  
- JavaScript / TypeScript  
- C / C++  
- Java  
- Go  
- SQL (in progress)

---

## 🧩 Key Features

- 🔁 **Bidirectional translation**: any supported language → any other supported language  
- 🧠 **Automatic source language detection** in real time  
- 🧬 **AST-based semantic translation**: interprets the logical structure of the code  
- ⚙️ **Offline parsing** using local libraries (e.g. `acorn`, `tree-sitter`, `luaparse`, `uniter`, etc.)  
- 💡 **Regex fallback** for simple conversions (print statements, loops, functions, etc.)  
- 🎨 **Modern UI**:  
  - dark mode  
  - blur effects (`backdrop-filter`)  
  - uniform padding (10px)  
  - rounded borders and soft shadows  
  - hover/click animations on buttons and editors  
- 🧭 **Real-time translation** (optional) while typing

---

## 🧱 Technologies and Parsers

| Language         | Offline Library / Parser           |
|------------------|------------------------------------|
| **Python**       | Skulpt / Transcrypt                |
| **JavaScript**   | Acorn.js                           |
| **C / C++**      | Emscripten / Clang WASM            |
| **Java**         | CheerpJ                            |
| **Go**           | GopherJS                           |
| **SQL**          | node-sql-parser                    |

All libraries are bundled locally and loaded by the browser, with no external requests.

---

## ⚡ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Offline-Code-Translator.git
   ```
2. Open `index.html` directly in your browser.

> 💡 No local server is required: the app works entirely offline.

---

## 🧪 Usage

1. Select:
   - **Source language** (or leave “Auto-detect”)
   - **Target language**
2. Write or paste your code in the left editor.
3. Press **Translate** or enable **real-time translation**.
4. The translated code appears in the right editor.

If no valid translation rules exist for the selected combination, a red warning is shown:

> ⚠️ No valid translation rules found

---

## 💻 Examples

### Python → JavaScript

**Python:**
```python
for i in range(3):
    print("Hello", i)
```

**JavaScript:**
```js
for(let i=0; i<3; i++){
    console.log("Hello", i);
}
```

### Python → C

**Python:**
```python
for i in range(3):
    print("Hello", i)
```

**C:**
```c
for(int i=0; i<3; i++){
    printf("%s %d\n", "Hello", i);
}
```

### Python → Go

**Python:**
```python
for i in range(3):
    print("Hello", i)
```

**Go:**
```go
for i := 0; i < 3; i++ {
    fmt.Println("Hello", i)
}
```

### Bidirectional translation

Python → JavaScript → Python:

```python
# Python
for i in range(3):
    print("Hello", i)
```

```js
// JavaScript
for(let i=0; i<3; i++){
    console.log("Hello", i);
}
```

```python
# Python (again)
for i in range(3):
    print("Hello", i)
```

---

## 🎨 Styling and UI

- Dark mode with soft colors  
- Blur effect on containers and textareas (`backdrop-filter`)  
- Uniform 10px padding  
- Rounded borders and light shadows  
- Hover and click effects on buttons and text areas  

---

## 👥 Contributing

Thanks for your interest in contributing to **Offline Code Translator**! 💻🎉  
Ideas, bug fixes, and improvements are welcome.

### How to contribute

1. **Fork the repository**  
   Use the **Fork** button at the top-right on GitHub.

2. **Clone your fork locally**
   ```bash
   git clone https://github.com/your-username/Offline-Code-Translator.git
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
   Use clear branch names, for example:
   - `feature/add-python-go-translation`
   - `bugfix/fix-language-detection`

4. **Make your changes**
   - Add new translation rules between languages  
   - Improve HTML/CSS/JS (interface, effects, dark mode, blur, etc.)  
   - Update documentation or the README  
   - Keep your code clean and well-commented  

5. **Test your changes**
   - Open `index.html` in your browser  
   - Verify that new features/rules work offline  
   - Ensure all supported language combinations still function correctly  

6. **Commit and push**
   ```bash
   git add .
   git commit -m "Describe your changes"
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request (PR)**
   - Go to the original repository on GitHub  
   - Open a PR from your branch to the `main` branch  
   - Provide a clear description and, if helpful, screenshots or examples  

---

## 📃 Contribution Guidelines

- Keep your code readable and consistent with the project style.  
- Do not remove existing functionality without a good reason.  
- Test all new features across all supported languages.  
- Use clear branch names (`feature/feature-name`, `bugfix/bug-name`).  
