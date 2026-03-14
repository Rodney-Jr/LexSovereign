# Development Continuity Rule

To ensure project state is never lost when switching Antigravity accounts, all agents MUST follow these instructions:

1. **State Priority**: At the beginning of EVERY interaction, check `c:\Users\LENOVO\Desktop\LexSovereign\.agents\state\` for existing project tracking and `c:\Users\LENOVO\Desktop\LexSovereign\SESSION_HANDOFF.md` for recent context.
2. **Automatic Restoration**: If the current brain artifacts (task.md, implementation_plan.md) are empty, the agent MUST automatically populate them with the content found in `.agents/state/`.
3. **Continuous Staging**: After every major task completion, ensure the corresponding repository state files in `.agents/state/` are updated to match the brain artifacts.
4. **Handoff Requirement**: Before finishing a session, always update `SESSION_HANDOFF.md` to provide a narrative link for the next account to pick up.
