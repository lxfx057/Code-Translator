# 🧠 Offline Code Translator Pro

## Description 📔

**Offline Code Translator Pro** is an advanced web app that allows you to **translate code between 10+ programming languages** entirely **offline**.  
The system uses a **hybrid semantic + deterministic rule engine**, with **automatic language detection** and support for local **AST parsers**.

### 🔤 Supported Languages

- Python  
- JavaScript / TypeScript  
- C / C++  
- Java  
- Go  
- SQL (on working)

---

## 🧩 Key Features

- 🔁 **Bidirectional translation** — any language can be translated to any other.  
- 🧠 **Automatic language detection** — the source language is detected in real-time.  
- 🧬 **Semantic translation (AST-based)** — interprets the logical structure of the code.  
- ⚙️ **Offline parsing** via local libraries such as `luaparse`, `acorn`, `tree-sitter`, `uniter`, etc.  
- 💡 **Fallback regex translator** for simple conversions (print, loops, functions).  
- 🎨 **Modern UI** — dark mode, blur effects, padding, hover/click animations, and colored warnings if translation fails.  
- 🧭 **Real-time translation (optional)** — continuously translates while typing.

---

## 🧱 Technologies Used

| Language | Offline Library / Parser |
|----------|-------------------------|
| **Python** | Skulpt / Transcrypt |
| **JavaScript** | Acorn.js |
| **C / C++** | Emscripten / Clang WASM |
| **Java** | CheerpJ |
| **Go** | GopherJS |
| **SQL** | node-sql-parser |

All libraries are loaded **locally** and work **completely offline**.

---

## ⚡ Installation

1. Clone the repository:
```
git clone https://github.com/your-username/Offline-Code-Translator.git
```
Open index.html in your browser.

💡 No local server required — the app works entirely offline.

🧪 Usage
Select the source and target language.

Write or paste code into the left editor.

Press Translate (or enable real-time auto-translation).

The translated code will appear in the right editor.

If no valid rules apply, a red warning will appear:

⚠️ No valid translation rules found

💻 Example

Python → JavaScript

```
for i in range(3):
    print("Hello", i)
```
Translated to JavaScript:

```
for(let i=0; i<3; i++){
    console.log("Hello", i);
}
```
Translated to C:
```
for(int i=0;i<3;i++){
    printf("%s\n","Hello", i);
}
```
Translated to GO
```
for i:=0;i<3;i++ {
    fmt.Println("Hello", i)
}
```
Bidirectional example:

Python

```
for i in range(3):
    print("Hello", i)
```
→ JavaScript

```

for(let i=0; i<3; i++){
    console.log("Hello", i);
}
```
→ Back to Python

```
for i in range(3):
    print("Hello", i)
```

🎨 Styling
Dark mode with soft colors.

Blur effect on containers and textareas (backdrop-filter).

10px uniform padding.

Rounded borders and soft shadows.

Hover and click effects on buttons and textareas.

👥 Contributing
Thank you for your interest in contributing to Offline Code Translator Pro! 💻🎉

Your ideas, bug fixes, and improvements are very welcome. Follow these steps:

Fork the repository
Click Fork at the top-right of GitHub.
Clone your fork locally:

git clone ```https://github.com/your-username/Offline-Code-Translator.git```

Create a branch

git checkout -b feature/your-feature-name
Make changes

Add new translation rules between languages.

Improve HTML/CSS/JS interface, effects, dark mode, blur, etc.

Update documentation or README.

Keep your code clean and well-commented.

Test your changes

Open index.html to make sure new features or rules work offline.

Ensure all supported language combinations still function correctly.

Commit and push
```
git add .
git commit -m "Describe your changes"
git push origin feature/your-feature-name
Open a Pull Request (PR)
```

Go to the original repository on GitHub.

Open a PR from your branch to the main branch.

Provide a detailed description and screenshots/examples if needed.

📃 Contribution Guidelines
Keep your code readable and consistent with project style.

Do not remove existing functionality without valid reason.

Test all new features across all supported languages.

Use clear naming for branches (feature/feature-name, bugfix/bug-name).
