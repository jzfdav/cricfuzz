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

## 14. Persistent Target (New Match)
- **Issue**: The target from the previous game was visible in the 1st innings of the next game.
- **Reason**: `GameState.target` was not being reset to `null` in the `resetToConfig` method.
- **Status**: ✅ Fixed (Added explicit reset for `target`).

## 15. Stale State Cleanup
- **Issue**: Potential for stale data (toss results, team names) to persist if the app state wasn't fully cleared on restart.
- **Reason**: `resetToConfig` omitted several state properties (`tossResult`, `lastMilestone`, `squads`).
- **Status**: ✅ Fixed (Added comprehensive state cleanup in `resetToConfig`).

## 16. ODI Early Collapses
- **Issue**: ODI innings were ending prematurely (20-25 overs) due to frequent wickets.
- **Reason**: The combination of `wicketMod: 1.1` and high dot ball pressure was too lethal.
- **Status**: ✅ Fixed (Reduced `wicketMod` to `0.9`, increased `boundaryMod` to `0.75`).

## 17. Commentary Over Timestamp
- **Issue**: The last ball of an over (e.g., 0.6) was displaying as "1.0" in the commentary feed.
- **Reason**: The `balls` counter was incremented before the string generation, causing an off-by-one error for the 6th ball.
- **Status**: ✅ Fixed (Adjusted over calculation to use `(balls-1)` logic).

## 18. Missing Contextual Commentary
- **Issue**: "Close Game" and "Death Overs" commentary lines were never triggered.
- **Reason**: `commentary.js` was trying to access `target` and `score` directly from the `GameState` object, but they are Signals and require `.value`.
- **Status**: ✅ Fixed (Added proper signal destructuring in `getCommentary`).

## 19. Flag Swap Bug (Live Match)
- **Issue**: The flag displayed next to the score in the live match header did not match the batting team.
- **Reason**: The `Scoreboard` component was assuming `innings === 1` meant Team 1, but the batting team depends on the toss decision.
- **Status**: ✅ Fixed (Updated logic to check `battingTeamName` against team names).

## 20. Missing Worm Graph Wickets (Render Issue)
- **Issue**: Red dots indicating wickets were only appearing for one team or were inconsistent.
- **Reason**: The wicket rendering logic in `WormGraph.tsx` wasn't correctly iterating over the `targetData` set.
- **Status**: ✅ Fixed (Added dedicated wicket rendering loops for both main and target lines).

## 21. Result Screen Worm Graph Colors
- **Issue**: The Worm Graph on the post-match summary screen defaulted to Team 1's color for the main line, even if Team 2 batted first.
- **Reason**: The `ResultScreen` component hardcoded `team1Name` and `team1Color` as the primary dataset props, ignoring the actual `history` order.
- **Status**: ✅ Fixed (Implemented dynamic logic to match `history[0]` team to its correct color).

## 22. Missing Team Colors (Match Controller)
- **Issue**: Teams were displaying default colors (Blue/Yellow) in match instead of their custom JSON colors (e.g., Black for NZ).
- **Reason**: `MatchController.loadTeams` was constructing `TeamStructure` objects by cherry-picking `id`, `name`, and `players`, explicitly omitting the `color` property from the fetched data.
- **Status**: ✅ Fixed (Added `color: d.color` to the team state assignment).

## 23. Result Screen Type Safety
- **Issue**: TypeScript error `Property 'name' does not exist on type 'never'` due to poor type inference for `topPerformer` variable.
- **Reason**: The variable was initialized to null and implicitly typed, confusing the compiler.
- **Status**: ✅ Fixed (Defined explicit `Performer` interface).

## 24. Broken Maiden Over Logic (Match Controller)
- **Issue**: Every over was potentially being recorded as a maiden over, and code contained "ghost comments" (my internal notes).
- **Reason**: `GameState.overRuns.value` was never being incremented when runs were scored, so the End-of-Over check always saw 0 runs.
- **Status**: ✅ Fixed (Added `GameState.overRuns.value += res` logic and removed ghost comments).

## 25. Broken Bowling Spells (Bowling Engine)
- **Issue**: Bowlers were never completing long spells because their spell count was reset every time they didn't bowl an over (i.e., every alternate over).
- **Reason**: `updateSpells` logic was too aggressive, resetting `currentSpellBalls` effectively every over for the non-active bowler.
- **Status**: ✅ Fixed (Modified logic to only reset spell if gap > 12 balls).

## 26. Missing Pitch Details (Result Screen)
- **Issue**: Users lacked context on why a team might have batted/bowled first, as Pitch Condition was not visible in the summary.
- **Reason**: Feature request.
- **Status**: ✅ Added (Pitch condition now displayed alongside Toss result).

## 27. Double Counted Over Runs (Match Controller)
- **Issue**: `overRuns` was being incremented in both `StatsEngine` and `MatchController`. While effective `overRuns` were reset every over, this theoretical double-counting could lead to issues if logic changed or if we displayed "Runs this over" in real-time.
- **Reason**: Redundant logic during previous bug fix.
- **Status**: ✅ Fixed (Removed duplicate increment in `MatchController`).

## 28. Worm Graph Obscuring Commentary (UI)
- **Issue**: The Worm Graph took up significant space in live view, preventing users from reading commentary while the match auto-played.
- **Reason**: Feature request.
- **Status**: ✅ Fixed (Added "Click to Collapse" / "Hide Graph" toggle).

## 29. Commentary Engine Revamp (Refactor)
- **Issue**: Commentary was repetitive and lacked context (e.g. generic "Four runs" for all shots).
- **Reason**: Engine only knew the run value, not the shot or delivery type.
- **Status**: ✅ Fixed (Implemented `BallOutcome` interface with rich metadata: Shot Type, Delivery Type, Timing. Updated entire pipeline to propagate this data). Verified with green build.

## 30. Spinner Support (New Feature)
- **Feature**: Added `Pace` vs `Spin` bowling styles.
- **Changes**: 
    - `BowlingEngine`: Spinners preferred in middle overs (T20: 7-15, ODI: 10-40).
    - `SimulationEngine`: Spinners bowl 'full' (flighted) and 'length' (turn), rarely 'bouncer'.
    - `CommentaryEngine`: Added spin-specific context ("Foxed him!", "Turn and bounce").
    - `MatchController`: Randomly assigns `bowlingStyle` (40% spin chance for bowlers).
- **Verification**: `npm run build` passed. Type safety confirmed.

## 31. Data-Driven Bowling Styles (Migration)
- **Feature**: Removed randomization of bowler styles.
- **Changes**: 
    - Updated 10 Team JSON files (`ind`, `aus`, `eng`, etc.) with explicit `bowlingStyle` for every player.
    - Updated `MatchController` to use JSON data directly.
- **Verification**: `npm run build` passed. JSON syntax validated via tool usage. Matches now reflect real-world bowler types.

## 32. Realistic Player Stats Calibration
- **Feature**: Recalibrated stats for all 10 teams based on real-world tiers.
- **Changes**:
    - **Batting**: Elite (95-99), High (90-95), Good (85-90).
    - **Bowling**: Elite (95-99), High (90-95), Good (85-90).
    - **Economy**: Elite (5.5-6.5), Standard (7.0-8.5).
    - **Aggression**: Power Hitters (95-99).
- **Verification**: `npm run build` passed. JSON files are valid.

## 33. Multi-Format Roster Support
- **Feature**: Separate squads for T20, ODI, and Test matches.
- **Changes**:
    - **Refactor**: Replaced `players` array with `rosters: { t20: [], odi: [], test: [] }` in all 10 team JSON files.
    - **Logic**: `MatchController` now dynamically loads the correct roster based on `GameState.format`.
    - **Legacy Support**: Included fallback to `players` key if `rosters` is missing.
- **Verification**: `npm run build` passed. JSON restructuring is complete for all teams. Squads like India now correctly show Kohli/Rohit in ODI/Test but not T20.

- **Verification**: `npm run build` passed. JSON restructuring is complete for all teams. Squads like India now correctly show Kohli/Rohit in ODI/Test but not T20.

## 34. Missing Test Match Target (4th Innings)
- **Issue**: The target was not displaying in the scoreboard during the 4th innings of Test matches.
- **Reason**: `GameState.target` was not being set at the start of the 4th innings in `MatchController.ts`.
- **Status**: ✅ Fixed (Added target calculation in `switchInnings`).

## 35. Incorrect Winner Name (Innings Order Bug)
- **Issue**: Cumulative scores were tracked via `totalTeam1Score` based on innings count (odd/even), leading to incorrect winner names if the toss winner chose to bowl.
- **Reason**: The engine assumed "Team 1" always batted first/third.
- **Status**: ✅ Fixed (Refactored `switchInnings` to accumulate scores into team-specific signals based on `battingTeamName`).
