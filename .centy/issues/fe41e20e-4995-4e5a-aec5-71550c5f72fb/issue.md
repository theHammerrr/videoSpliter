# Refactor: Improve Code Structure and Clarity

\\## Goal

Refactor existing code to improve **readability, structure, and maintainability** without changing behavior.

This issue must not add new features.

Everything should have a single responsibility, a file should not export multiple things (add to eslint) and a test file will be for a specific utility and not multiple functions/classes and more.  
  
Classes should be in control of a flow and not logic itself

Add to eslint a limit to 200 lines and disable multiple exports (ignore cases like types and stuff like that)

\\---

\\## Scope

\\### In Scope

\\- Rename files, folders, and symbols for clarity

\\- Move code to more appropriate locations

\\- Reduce duplication

\\- Simplify complex logic

\\- Improve typing and interfaces

\\- Add small internal helpers if needed

\\### Out of Scope

\\- New features

\\- Behavior changes

\\- UI/UX changes

\\- Performance optimizations (unless trivial and safe)

\\---

\\## Rules

\\- Public APIs must remain unchanged

\\- Behavior must stay the same

\\- Existing functionality must continue to work

\\- Changes should be incremental and easy to review

\\---

\\## Definition of Done

\\- Code is easier to read and navigate

\\- No functionality changed

\\- App builds successfully

\\- Tests (if present) still pass
