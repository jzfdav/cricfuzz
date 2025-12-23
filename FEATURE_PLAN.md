# CricFuzz Feature Plan

This document outlines planned and in-progress features for the CricFuzz simulation engine.

---

## 🚀 Engine Overhaul (✅ COMPLETED)

### Features
1. **Separate Skills**: Transitioning from a single `skill` to `battingSkill` and `bowlingSkill`.
2. **Setup Intelligence**: 
   - **Pitch Report**: Randomized pitch types (Flat, Seamer, Spinner) with performance modifiers.
   - **Toss Logic**: Randomized toss winner and decision (Bat/Bowl).
3. **Strategic AI**:
   - **Batting Order**: Lineup sorted by `battingSkill`.
   - **Bowling Rotation**: Prioritizing bowlers with high `bowlingSkill`.
4. **Narrative Commentary**: A situational engine using real-world cricket terminology and famous lines.

---

## 1. Maiden Overs Tracking
- **Status**: ✅ COMPLETED
- **Features**: 6-ball dot over detection, highlight in scorecard, unique commentary.

### What is a Maiden Over?
A maiden over is an over (6 balls) in which no runs are scored off the bat (extras like wides/no-balls don't count against it).

### Implementation Plan

#### Phase 1: Tracking Logic
1. **Add maiden detection in `updateState()`**:
   - Track runs conceded per over for each bowler
   - When an over completes (6 balls), check if runs = 0
   - Increment `bowlStats.maidens` if condition met
   - Reset per-over counter for next over

2. **Handle edge cases**:
   - Wickets don't reset maiden tracking (only runs do)
   - Extras (wides, no-balls) should be tracked separately
   - Maiden is only valid if bowler completes the full over

#### Phase 2: Display
1. **Update scorecard** (`renderScorecard()`):
   - Add "M" column to bowler statistics table
   - Display `bowlStats.maidens` value
   - Highlight maiden overs (e.g., green text for 2+ maidens)

2. **Live commentary**:
   - Add commentary message when a maiden over is bowled
   - Example: "Maiden over! Excellent bowling from [Bowler Name]"

#### Phase 3: Statistics
1. **Match summary**:
   - Include total maiden overs in match description
   - Highlight bowlers with most maidens

### Estimated Effort
- **Phase 1**: 2-3 hours (tracking logic + edge cases)
- **Phase 2**: 1-2 hours (UI updates)
- **Phase 3**: 1 hour (summary integration)
- **Total**: 4-6 hours

### Priority
**Medium** - Nice-to-have feature that adds realism but not critical for core functionality.

---

## 2. Enhanced Result Messages

### Current State
- **Status**: Basic implementation, enhancement prepared but not used
- **Location**: `src/main.js` line 308 (unused `loser` variable)
- **What exists**: Winner and margin are displayed, but loser name is prepared but unused

### Current Implementation
```javascript
const winner = this.teams.team2Name;
this.endMatch(`${winner} WINS by an innings and ${margin} runs!`);
```

### Enhancement Plan

#### Phase 1: Detailed Messages
1. **Include loser in all result messages**:
   - "Team X WINS by an innings and Y runs against Team Z"
   - "Team X WINS by Z wickets against Team Y"
   - "Team X WINS by Y runs against Team Z"

2. **Format variations**:
   - Short format: "IND wins by 5 wickets"
   - Long format: "India wins by 5 wickets against Australia"
   - Configurable via user preference (future)

#### Phase 2: Contextual Messages
1. **Add match context**:
   - Include match format in message
   - Add venue/date if tracking added later
   - Highlight close finishes ("thrilling finish", "nail-biter")

2. **Special achievements**:
   - "Record-breaking performance"
   - "Dominant victory"
   - "Comeback win"

### Implementation Steps
1. Update `endMatch()` to accept both winner and loser
2. Modify all `endMatch()` call sites to pass both teams
3. Create message formatting function
4. Update UI to display enhanced messages

### Estimated Effort
- **Phase 1**: 1-2 hours (message updates)
- **Phase 2**: 2-3 hours (contextual enhancements)
- **Total**: 3-5 hours

### Priority
**Low** - Cosmetic improvement, current messages are functional.

---

## 3. Ball Pill Styling Refactor

### Current State
- **Status**: CSS class exists but unused, inline Tailwind classes used instead
- **Location**: `src/style.css` line 20-22 (`.ball-pill` class)
- **What exists**: Custom CSS class defined but never applied; code uses inline Tailwind utilities

### Current Implementation
```javascript
pill.className = `px-3 py-1 rounded mono text-xs animate-ball ${res === 'W' ? 'bg-red-600' : res >= 4 ? 'bg-emerald-600' : 'bg-gray-700'}`;
```

### Refactor Plan

#### Option A: Use Custom Class (Recommended)
1. **Update CSS**:
   - Keep `.ball-pill` base styles
   - Add modifier classes: `.ball-pill--wicket`, `.ball-pill--boundary`, `.ball-pill--normal`
   - Or use CSS variables for dynamic colors

2. **Update JavaScript**:
   ```javascript
   pill.className = 'ball-pill';
   if (res === 'W') pill.classList.add('ball-pill--wicket');
   else if (res >= 4) pill.classList.add('ball-pill--boundary');
   else pill.classList.add('ball-pill--normal');
   ```

#### Option B: Remove Unused CSS
- Simply delete `.ball-pill` class if Tailwind approach is preferred
- Cleaner if maintaining Tailwind-only styling

### Benefits of Option A
- Better separation of concerns
- Easier to maintain consistent styling
- Can add animations/transitions in CSS
- More performant (single class vs multiple utilities)

### Estimated Effort
- **Option A**: 1 hour (CSS + JS updates)
- **Option B**: 5 minutes (delete unused CSS)

### Priority
**Low** - Code works fine as-is, refactor is optional.

---

## Implementation Priority Summary

| Feature | Priority | Effort | Impact |
|---------|----------|--------|--------|
| Maiden Overs Tracking | Medium | 4-6 hours | High (adds realism) |
| Enhanced Result Messages | Low | 3-5 hours | Low (cosmetic) |
| Ball Pill Styling Refactor | Low | 1 hour | Low (code quality) |

### Recommended Order
1. **Maiden Overs** - Most valuable feature, adds statistical completeness
2. **Ball Pill Refactor** - Quick win, improves code maintainability
3. **Enhanced Messages** - Nice polish, can be done later

---

## Notes

- All features are **optional enhancements** - the app is fully functional without them
- Features can be implemented incrementally
- Consider user feedback before prioritizing
- Each feature is independent and can be done in any order

