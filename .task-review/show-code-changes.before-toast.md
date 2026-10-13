---
name: show-code-changes
description: Apply this user's preference whenever editing code files. Show the actual changes with a diff and relevant code, alongside a brief explanation and validation results.
---

After editing code, always make the changes visible to the user without waiting for a follow-up request.

- Capture the pre-edit contents of affected files so a diff shows only changes made during the task, including when files already contain uncommitted edits.
- Show a focused before/after diff inline for small changes. For larger changes, save the complete diff as a reviewable artifact, open it in Codex when available, and include the key changed code inline.
- State the affected files, what changed, and the checks performed. Link to the complete diff and updated code where supported.
- Clearly label excerpts and distinguish a task-specific diff from a comparison against Git HEAD. Do not attribute earlier user edits to yourself.
- Do not replace the diff with only a prose summary or silently omit changes because the patch is long.

## UI test selectors

For this user's UI tests, use selectors independent of translated text, matching the create-account tests: select inputs by stable name attributes and submit buttons by type. Do not use getByLabelText or queries depending on translated labels, placeholders, button names, or other visible text to locate elements. For example, use container.querySelector('input[name="password1"]') and container.querySelector('button[type="submit"]').

Keep selectors shared across tests in one reusable render/setup helper at file scope (for example, renderForgotPassword). Query elements after each render and return them from the helper so individual tests can destructure email, emailError, and submit. Do not repeat these queries in each test or store DOM elements in module-level variables that outlive cleanup.
