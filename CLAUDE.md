# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment

- **Python**: 3.12 (CPython)
- **Package manager**: `uv` (v0.9.11) — use `uv` instead of `pip` for all dependency management
- **Virtual environment**: `.venv/` (already initialized)

## Common Commands

```bash
# Activate the virtual environment
source .venv/bin/activate

# Install dependencies
uv pip install <package>

# Run a Python script
uv run python <script.py>
```
