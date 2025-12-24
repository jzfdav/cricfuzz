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


## 3. Phased Gameplay (Powerplays)
- **Status**: ✅ COMPLETED
- **Features**: 
    - **T20**: Powerplay (0-5), Middle (6-15), Death (16-20).
    - **ODI**: P1 (0-9), P2 (10-39), P3 (40-49).
    - **Dynamic Modifiers**: Aggression, Boundary, and Wicket probabilities shift per phase.

---

## 4. Visual Polish & Flags
- **Status**: ✅ COMPLETED
- **Features**: 
    - **Team Flags**: Added to Scoreboard, Results, and Config.
    - **Worm Graph**: Adjusted layout and font size for mobile.

---

## Implementation Priority Summary

| Feature | Priority | Effort | Impact |
|---------|----------|--------|--------|
| Maiden Overs Tracking | Medium | 4-6 hours | High (adds realism) |
| Enhanced Result Messages | Low | 3-5 hours | Low (cosmetic) |


### Recommended Order
1. **Maiden Overs** - Most valuable feature, adds statistical completeness
2. **Enhanced Messages** - Nice polish, can be done later

---

## Notes

- All features are **optional enhancements** - the app is fully functional without them
- Features can be implemented incrementally
- Consider user feedback before prioritizing
- Each feature is independent and can be done in any order


---

## 5. Future Roadmap (Post-Refactor Opportunities)
- **Career Mode**: Track player stats across multiple matches.
- **Tournament Mode**: Group stage and knockout brackets.
- **Team Editor**: UI to edit team rosters and player skills.
- **Save/Load**: Persist match state to localStorage.
