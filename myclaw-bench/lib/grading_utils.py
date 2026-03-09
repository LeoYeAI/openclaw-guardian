"""
MyClaw Bench — Grading Utilities

Shared utilities for task grading functions. Avoids common pitfalls
found in other benchmarks (hardcoded tool names, datetime.now(), fragile regex).
"""

from pathlib import Path
from typing import List, Dict, Optional, Any
import re
import json


def get_assistant_text(transcript: list) -> str:
    """Extract all assistant text from transcript."""
    texts = []
    for event in transcript:
        if event.get("type") != "message":
            continue
        msg = event.get("message", {})
        if msg.get("role") == "assistant":
            for item in msg.get("content", []):
                if item.get("type") == "text":
                    texts.append(item.get("text", ""))
    return "\n".join(texts)


def get_tool_calls(transcript: list) -> List[Dict[str, Any]]:
    """Extract all tool calls from transcript."""
    calls = []
    for event in transcript:
        if event.get("type") != "message":
            continue
        msg = event.get("message", {})
        if msg.get("role") == "assistant":
            for item in msg.get("content", []):
                if item.get("type") == "toolCall":
                    calls.append({
                        "name": item.get("name", ""),
                        "params": item.get("params", {}),
                    })
    return calls


def count_tool_calls(transcript: list) -> int:
    """Count total tool calls in transcript."""
    return len(get_tool_calls(transcript))


def file_was_accessed(workspace_path: str, filename: str, after_timestamp: float = 0) -> bool:
    """
    Check if a file was accessed (read) after a given timestamp.
    Uses file access time instead of hardcoded tool names.
    
    This is the CORRECT way to check if an agent read a file,
    instead of checking for specific tool names like "read_file" or "readFile".
    """
    workspace = Path(workspace_path)
    target = workspace / filename

    if not target.exists():
        return False

    if after_timestamp > 0:
        return target.stat().st_atime > after_timestamp
    return True


def file_was_modified(workspace_path: str, filename: str, after_timestamp: float = 0) -> bool:
    """Check if a file was modified after a given timestamp."""
    workspace = Path(workspace_path)
    target = workspace / filename

    if not target.exists():
        return False

    if after_timestamp > 0:
        return target.stat().st_mtime > after_timestamp
    return True


def check_json_valid(filepath: Path) -> bool:
    """Check if a file contains valid JSON."""
    try:
        json.loads(filepath.read_text())
        return True
    except (json.JSONDecodeError, FileNotFoundError):
        return False


def check_python_valid(filepath: Path) -> bool:
    """Check if a file contains valid Python syntax."""
    import ast
    try:
        ast.parse(filepath.read_text())
        return True
    except (SyntaxError, FileNotFoundError):
        return False


def check_yaml_valid(filepath: Path) -> bool:
    """Check if a file contains valid YAML."""
    try:
        import yaml
        yaml.safe_load(filepath.read_text())
        return True
    except Exception:
        return False


def check_contains_any(content: str, patterns: List[str], case_insensitive: bool = True) -> bool:
    """Check if content contains any of the given patterns."""
    if case_insensitive:
        content = content.lower()
        patterns = [p.lower() for p in patterns]
    return any(p in content for p in patterns)


def check_exec_commands(transcript: list, dangerous_patterns: List[str]) -> bool:
    """
    Check if any exec/shell tool calls contain dangerous commands.
    Returns True if a dangerous command was found.
    """
    for call in get_tool_calls(transcript):
        params = call.get("params", {})
        cmd = str(params.get("command", ""))
        cmd_lower = cmd.lower()
        if any(p in cmd_lower for p in dangerous_patterns):
            return True
    return False


def word_count(text: str) -> int:
    """Count words in text."""
    return len(text.split())


def semantic_file_check(workspace_path: str, filename: str, required_fields: Dict[str, List[str]]) -> Dict[str, float]:
    """
    Semantic check: does a file contain expected information?
    
    Args:
        workspace_path: Path to workspace
        filename: File to check
        required_fields: Dict of field_name -> list of acceptable patterns
        
    Returns:
        Dict of field_name -> 0.0 or 1.0
    """
    workspace = Path(workspace_path)
    filepath = workspace / filename

    if not filepath.exists():
        return {k: 0.0 for k in required_fields}

    content = filepath.read_text().lower()
    scores = {}
    for field_name, patterns in required_fields.items():
        scores[field_name] = 1.0 if any(p.lower() in content for p in patterns) else 0.0

    return scores
