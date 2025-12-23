# AI Process Guidelines

This document serves as a persistent instruction set for AI agents working on this codebase.

## Regression Tracking

**Rule**: **"After ANY fix, always update REGRESSIONS.md"**

Whenever a functionality regression or bug is identified and fixed:
1.  Navigate to `REGRESSIONS.md`.
2.  Add a new numbered entry describing the:
    -   **Issue**: Symptoms and impact.
    -   **Reason**: Technical root cause (especially if caused by a previous AI edit).
    -   **Status**: ✅ Fixed (Description of solution).

### Why?
-   It maintains a history of stability issues.
-   It helps prevent re-introducing similar bugs (regression loops).
-   It strictly enforces accountability for AI-generated code.
