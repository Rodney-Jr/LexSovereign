---
description: Ensure development continuity across different Antigravity accounts.
---

## 📅 Session Start: "Warming the Brain"
When starting a new session with a different Antigravity account, follow these steps to instantly restore context:

1. **Check State**: Look in `.agents/state/` to see the last saved `task.md`, `implementation_plan.md`, and `walkthrough.md`.
2. **Restore Brain**: If the session's brain artifacts are empty or outdated, copy the content from `.agents/state/` to the corresponding brain artifact path.
3. **Synchronize**: Read `SESSION_HANDOFF.md` for a narrative summary of the last session.

## 🏁 Session End: "Preserving State"
Before switching accounts or ending a long session, follow these steps:

1. **Mirror Artifacts**: Copy current `task.md`, `walkthrough.md`, and `implementation_plan.md` from the brain to `.agents/state/`.
2. **Update Handoff**: Append or update `SESSION_HANDOFF.md` with:
   - High-level changes made.
   - Any new architectural decisions.
   - Pending bugs or "Next Priority" items.
3. **Commit**: Git add, commit, and push all changes including those in `.agents/state/` and `SESSION_HANDOFF.md`.

// turbo
4. Run `git add . && git commit -m "chore: save development state for continuity" && git push origin master`
