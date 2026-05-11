# AGENTS.md — Repository guidance for AI coding agents

Purpose
- Short, actionable instructions to help AI agents and contributors become productive quickly.

What I found
- Primary repo note: the project idea and roadmap are in [plan.txt](plan.txt#L1).
- No README.md, no build or test scripts, and no existing agent customization files were found.

How agents should behave
- Inspect [plan.txt](plan.txt#L1) first to learn project goals and scope.
- Ask the user before making architectural changes or adding new top-level files (README, package.json, etc.).
- If adding runnable code, include a minimal README and a simple script (`start`/`test`) so the project is runnable.

Recommended follow-ups for maintainers (ask before doing)
- Add a `README.md` with quickstart and required dependencies.
- Add a `CONTRIBUTING.md` or developer notes with preferred terminals/OS (Windows PowerShell noted).
- Add simple run/test scripts (e.g., `package.json` or `Makefile`) so agents can run automated checks.

Notes for future agent-customization files
- Prefer creating `AGENTS.md` at repo root rather than copying long docs into `.github/copilot-instructions.md`.
- Keep instructions minimal and link to fuller docs (link, don't embed).

If you want, I can create a minimal `README.md` and `CONTRIBUTING.md` now — tell me which to start.
