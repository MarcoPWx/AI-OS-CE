#!/usr/bin/env python3
"""
Clean Code Advisor (Community Edition - read-only suggestions)
- Provides pragmatic, language-aware guidance based on established books:
  * The Pragmatic Programmer, Clean Code, Clean Architecture, Refactoring, Effective* series
- Uses simple heuristics + Language Detector to emit actionable suggestions
- No auto-fixes; Pro may propose structured refactors under policy gate
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from pathlib import Path
import re

from tools.agent.utils.lang_detector import detect_language

@dataclass
class Suggestion:
    rule_id: str
    message: str
    severity: str  # info|warn|error
    lines: Optional[List[int]] = None
    details: Optional[Dict[str, Any]] = None

PRINCIPLES = {
    "general": [
        ("names_intent", "Names should reveal intent; avoid vague abbreviations."),
        ("small_functions", "Functions should be small and do one thing."),
        ("no_duplication", "Eliminate duplication (DRY). Extract helpers or modules."),
        ("pure_functions", "Favor pure functions; isolate side-effects."),
        ("guard_clauses", "Use guard clauses to reduce nesting and complexity."),
        ("fail_fast", "Fail fast with explicit, actionable errors."),
        ("tests_first", "Add minimal but meaningful tests (Given/When/Then)."),
    ],
    "python": [
        ("pep8_style", "Follow PEP8: naming, line length, imports, spacing."),
        ("typing", "Add type hints for clarity and tooling support."),
        ("logging", "Use logging not print; structure messages; no secrets."),
    ],
    "typescript": [
        ("types_first", "Prefer explicit types and interfaces; avoid any."),
        ("immutability", "Favor immutability; avoid in-place mutation where possible."),
        ("separation", "Separate presentation and data-fetch concerns."),
    ],
    "javascript": [
        ("strict", "Use strict linting; avoid implicit globals; prefer const/let."),
        ("modules", "Use modules; avoid large monolith files; extract utilities."),
    ],
}

class CleanCodeAdvisor:
    def analyze_file(self, file_path: str | Path) -> List[Suggestion]:
        path = Path(file_path)
        try:
            code = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            return [Suggestion(rule_id="io_error", message=f"Cannot read {path}", severity="error")]
        lang = detect_language(path, code)
        return self._analyze(code, lang)

    def _analyze(self, code: str, lang: str) -> List[Suggestion]:
        suggestions: List[Suggestion] = []
        # General heuristics
        if self._has_long_function(code):
            suggestions.append(Suggestion(
                rule_id="small_functions",
                message="Long function detected; extract helpers and reduce branching.",
                severity="warn"
            ))
        if self._has_deep_nesting(code):
            suggestions.append(Suggestion(
                rule_id="guard_clauses",
                message="Deep nesting detected; consider guard clauses or early returns.",
                severity="info"
            ))
        if self._has_duplication(code):
            suggestions.append(Suggestion(
                rule_id="no_duplication",
                message="Repeated code detected; extract shared helpers (DRY).",
                severity="info"
            ))
        # Language-specific principles
        for rid, msg in PRINCIPLES.get(lang, []):
            suggestions.append(Suggestion(rule_id=rid, message=msg, severity="info"))
        # General principles
        for rid, msg in PRINCIPLES["general"]:
            suggestions.append(Suggestion(rule_id=rid, message=msg, severity="info"))
        return suggestions

    # --- Heuristics (simple, fast) ---
    def _has_long_function(self, code: str) -> bool:
        # naive heuristic: any function/method body exceeding ~60 lines
        patterns = [r"def\s+\w+\([^)]*\):", r"function\s+\w*\s*\([^)]*\)\s*{", r"\w+\s*\([^)]*\)\s*{\s*//"]
        lines = code.splitlines()
        for i, line in enumerate(lines):
            if any(re.search(p, line) for p in patterns):
                body_len = 0
                for j in range(i + 1, min(i + 200, len(lines))):
                    body_len += 1
                    if re.match(r"^[}\)]", lines[j].strip()):
                        break
                if body_len > 60:
                    return True
        return False

    def _has_deep_nesting(self, code: str) -> bool:
        depth = 0
        max_depth = 0
        for ch in code:
            if ch in "{[(:":
                depth += 1
                max_depth = max(max_depth, depth)
            elif ch in "]})":
                depth = max(0, depth - 1)
        return max_depth >= 6

    def _has_duplication(self, code: str) -> bool:
        # naive heuristic: any 5-line chunk repeating 3+ times
        lines = [l.strip() for l in code.splitlines() if l.strip()]
        seen: Dict[str, int] = {}
        for i in range(0, max(0, len(lines) - 5)):
            chunk = "\n".join(lines[i : i + 5])
            seen[chunk] = seen.get(chunk, 0) + 1
            if seen[chunk] >= 3:
                return True
        return False

if __name__ == "__main__":
    import sys, json
    cca = CleanCodeAdvisor()
    out = []
    for fp in sys.argv[1:]:
        out.append({"file": fp, "suggestions": [s.__dict__ for s in cca.analyze_file(fp)]})
    print(json.dumps(out, indent=2))

