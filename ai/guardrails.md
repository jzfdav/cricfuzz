# Guardrails – Regression & UX Safety

## Purpose
This document defines **mandatory guardrails** to prevent regressions in:
- Existing functionality
- User experience (UX)
- Non-obvious behaviors and flows

These guardrails must be followed **before and after any code edits**.

---

## Core Principle
> **Do not break what already works.**
>
> Any change must preserve existing behavior unless explicitly approved otherwise.

---

## Pre-Edit Checklist (MANDATORY)

Before making any edits, you must:

### 1. Understand Existing Behavior
- Identify the **primary user flow(s)** affected
- Identify **secondary or edge flows**
- Note any implicit behaviors (defaults, fallbacks, ordering, timing)

### 2. Identify Contracts
List all contracts that must remain unchanged:
- Public APIs (inputs, outputs, error formats)
- UI behaviors (labels, layout, navigation, interactions)
- Data formats (JSON shape, field names, ordering)
- Side effects (logging, events, persistence)

### 3. UX Baseline
Capture the current UX expectations:
- What the user sees
- What actions are possible
- What feedback/error states exist
- What *should not change* visually or behaviorally

### 4. Non-Goals
Explicitly list what this change is **not** supposed to affect.

---

## Allowed Changes

A change is allowed only if it:
- Is explicitly requested
- Is strictly additive
- Is a refactor with **no behavior change**
- Improves clarity/performance **without changing outputs**

If behavior changes, it must be **clearly called out**.

---

## Post-Edit Validation (MANDATORY)

After edits are complete, you must:

### 1. Functional Parity Check
Confirm that:
- All existing flows still work as before
- Inputs produce the same outputs
- Error cases behave the same
- No silent failures were introduced

### 2. UX Regression Check
Confirm that:
- UI layout is unchanged unless requested
- No additional clicks, steps, or delays were introduced
- Text, labels, and messages remain consistent
- Accessibility is not degraded

### 3. Edge Case Review
Re-evaluate:
- Empty states
- Invalid inputs
- Partial data
- Timing/order-dependent logic

### 4. Explicit Regression Statement
Produce a short statement:
- “No regressions detected” **OR**
- A precise list of deviations with justification

---

## Red Flags (STOP if any occur)

- “This *should* work” without verification
- Removing code without understanding why it exists
- Changing defaults implicitly
- Reordering logic that affects outcomes
- UX changes without being requested

If any red flag is detected, **pause and ask for confirmation**.

---

## Output Expectation from AI
When asked to edit code, the AI must:
1. State the **pre-edit understanding**
2. Perform the change
3. Explicitly confirm **post-edit regression status**

Failure to do all three is a violation of these guardrails.
