# Regression Log - Preact Migration

This document records functionality regressions and issues identified during the migration from Vanilla JS to Preact, along with their causes and resolutions.

## 1. Missing Haptic Feedback (Vibration)
- **Issue**: The device did not vibrate on wickets or boundaries as it did in the legacy version.
- **Reason**: The `navigator.vibrate` calls present in `main.js` were overlooked during the initial logic port to `GameEngine.js`.
- **Status**: ✅ Fixed (Restored calls in `updateState`).

## 2. Unstyled Components (Tailwind)
- **Issue**: The application UI rendered as unstyled HTML after deployment.
- **Reason**: `tailwind.config.js` was configured to scan only `.js` and `.html` files, ignoring the new `.jsx` components.
- **Status**: ✅ Fixed (Updated config to include `jsx` and `tsx`).

## 3. Test Match Logic Gap
- **Issue**: Test matches effectively functioned as 2-innings games without Draw logic or Follow-on checks.
- **Reason**: The initial migration focused on T20/ODI parity and left Test match rules as "TODO" placeholders in `GameEngine.js`.
- **Status**: ✅ Fixed (Ported full Test logic from `main.js`).

## 4. Missing Timeline Ticker
- **Issue**: The horizontal scrolling list of recent ball outcomes ("pills") was missing from the UI.
- **Reason**: The feature was present in the legacy `index.html` DOM manipulation but was not rewritten into the initial `Scoreboard.jsx` component.
- **Status**: ✅ Fixed (Implemented timeline component in Scoreboard).

## 5. Mobile Layout (Truncated Text)
- **Issue**: Team names (e.g., "Australia") were truncated on mobile devices (OnePlus 13).
- **Reason**: Fixed `text-2xl` font size was too large for the flex container on narrow screens.
- **Status**: ✅ Fixed (Responsive typography `text-lg sm:text-2xl` and reduced gaps).

## 6. Crash on Innings Switch (Missing Signals)
- **Issue**: The match froze/stopped at the end of the 1st innings.
- **Reason**: The `GameEngine` logic was updated to use `GameState.totalTeam1Score`, but the corresponding update to `GameState.js` failed (tool error), leaving the signals undefined.
- **Status**: ✅ Fixed (Added missing signals to `GameState.js`).

## 7. Match Stop / Engine Crash (Missing Function)
- **Issue**: `Uncaught TypeError: this.stopMatch is not a function` in the browser console.
- **Reason**: During the manual rewrite of `GameEngine.js` to add Test logic, the `stopMatch` helper method was accidentally deleted.
- **Status**: ✅ Fixed (Restored `stopMatch` method).

## 8. UI Typo (Innings Label)
- **Issue**: Scoreboard displayed "1st INNINGS", "2st INNINGS", "3st INNINGS".
- **Reason**: Developing shortcut using naive string interpolation `${innings}st`.
- **Status**: ✅ Fixed (Implemented proper ordinal suffix logic).

## 9. Malformed HTML Header
- **Issue**: Visible HTML text `href="..."` appeared at the top of the page.
- **Status**: ✅ Fixed (Restored `<link>` tag structure).

## 10. File Corruption (Markdown Artifacts)
- **Issue**: `ResultScreen.jsx` contained ` ```javascript ` and ` ``` ` lines, likely breaking the build.
- **Reason**: Tool usage error where code blocks were pasted directly into the file content during a rewrite.
- **Status**: ✅ Fixed (Removed artifacts).

## 11. State Persistence (1-Ball Innings)
- **Issue**: Starting a new match immediately after one ended (via "New Simulation") caused the 1st innings to end after just 1 ball if the previous match ended with an "All Out".
- **Reason**: The `resetToConfig` method failed to reset the `allOut` flag to `false`. The new match inherited the "All Out" status of the old match.
- **Status**: ✅ Fixed (Ensured full state reset on new match start).

## 12. Missing Match Summary (MoM)
- **Issue**: The "Match Summary" paragraph and "Man of the Match" (Top Performer) callout were missing from the Results screen.
- **Reason**: The logic for generating the summary string was present in the deleted `main.js` but was not ported to `ResultScreen.jsx` during the migration.
- **Status**: ✅ Fixed (Restored `getMatchDescription` logic in `ResultScreen.jsx`).

## 13. High ODI Scores (Balancing)
- **Issue**: ODI matches were consistently producing unrealistic totals (390+), indicating an imbalance in the simulation engine for 50-over formats.
- **Reason**: The base engine values were too aggressive for the longer format.
- **Status**: ✅ Fixed (Aggressively tuned ODI modifiers: Dot Balls +50%, Boundaries -30%).
