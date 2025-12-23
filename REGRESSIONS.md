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
