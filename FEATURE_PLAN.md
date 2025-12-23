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

---

## 2. Enhanced Result Messages
- **Status**: ✅ COMPLETED (ResultScreen Update)
- **Features**: "Top Performer" Logic, Dynamic Description.


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

## 4. Phased Gameplay (Powerplays)
- **Status**: ✅ COMPLETED
- **Features**: 
    - **T20**: Powerplay (0-5), Middle (6-15), Death (16-20).
    - **ODI**: P1 (0-9), P2 (10-39), P3 (40-49).
    - **Dynamic Modifiers**: Aggression, Boundary, and Wicket probabilities shift per phase.

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

