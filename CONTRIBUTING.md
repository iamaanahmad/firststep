# Contributing

Developer notes for contributors and AI agents:

- Read `plan.txt` first to understand goals and scope.  
- Ask the project owner before making architectural changes or adding top-level frameworks (e.g., switching to a monorepo, adding a new backend).  
- Preferred terminal: Windows PowerShell is known to be used in this workspace. Cross-platform commands are preferred where possible.

When adding runnable code

- Include a minimal `README.md` and a small `package.json` script (`start` / `test`) so CI/agents can run checks.  
- Keep changes small and focused; open an issue for larger refactors before implementing.

Using `solana.new`

- Inspect the GitHub repository at https://github.com/sendaifun/solana-new before running any install script.  
- Avoid blindly running `curl https://www.solana.new/setup.sh | bash`; clone and review scripts first.

Contact

If unsure, leave a short issue or ask maintainers for guidance before making large changes.
