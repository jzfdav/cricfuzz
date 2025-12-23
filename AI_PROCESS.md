# AI Process Guidelines

This document serves as a persistent instruction set for AI agents working on this codebase.

## Context Gathering

Before starting complex tasks, valid AI agents should review the following documentation to ensure informed decision-making:

-   **`README.md`**: Project overview, tech stack, and quick start guide.
-   **`FEATURE_PLAN.md`**: Comprehensive roadmap, completed features, and future goals. Use this to align new work with the broader vision.
-   **`DEPLOYMENT.md`**: Guide for building and deploying to GitHub Pages. Critical for release-related tasks.
-   **`REGRESSIONS.md`**: A history of past bugs and regressions. **Must be reviewed** to avoid repeating mistakes (e.g., missing signals, unstyled components).

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
