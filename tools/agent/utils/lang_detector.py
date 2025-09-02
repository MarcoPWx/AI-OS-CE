#!/usr/bin/env python3
"""
Language detector utility for the agent.
- Detects language by file extension, shebang, and simple content heuristics
- Used by CleanCodeAdvisor to apply language-specific practices
Community Edition: read-only utility (no external deps)
"""
from __future__ import annotations
from pathlib import Path
from typing import Optional
import re

EXT_MAP = {
    ".py": "python",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".js": "javascript",
    ".jsx": "javascript",
    ".go": "go",
    ".rs": "rust",
    ".java": "java",
    ".kt": "kotlin",
    ".swift": "swift",
    ".rb": "ruby",
    ".php": "php",
    ".cs": "csharp",
    ".cpp": "cpp",
    ".cxx": "cpp",
    ".cc": "cpp",
    ".c": "c",
    ".h": "c",
    ".m": "objective-c",
    ".mm": "objective-c++",
    ".sh": "shell",
    ".bash": "shell",
    ".zsh": "shell",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".json": "json",
    ".md": "markdown",
    ".mdx": "mdx",
}

SHEBANG_MAP = {
    "python": re.compile(r"^#!.*\bpython[0-9.]*\b"),
    "bash": re.compile(r"^#!.*\b(bash|sh|zsh)\b"),
    "node": re.compile(r"^#!.*\b(node)\b"),
}


def detect_language(file_path: str | Path, content: Optional[str] = None) -> str:
    path = Path(file_path)
    ext = path.suffix.lower()
    if ext in EXT_MAP:
        return EXT_MAP[ext]

    if content is None:
        try:
            content = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            content = ""

    # Shebang detection
    first_line = content.splitlines()[0] if content else ""
    for lang, pat in SHEBANG_MAP.items():
        if pat.search(first_line):
            return {"python": "python", "bash": "shell", "node": "javascript"}[lang]

    # Simple content heuristics
    if re.search(r"^\s*import\s+typing|def\s+\w+\(|from\s+\w+\s+import", content):
        return "python"
    if re.search(r"^\s*package\s+\w+|func\s+\w+\(|import\s+\(.+\)", content):
        return "go"
    if re.search(r"^\s*#include\s+<|std::|int\s+main\s*\(", content):
        return "cpp"
    if re.search(r"^\s*export\s+|import\s+\{?|const\s+\w+\s*=|let\s+\w+\s*=", content):
        return "typescript" if ".ts" in file_path.suffixes else "javascript"

    return "unknown"

