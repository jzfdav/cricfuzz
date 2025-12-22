# CricFuzz Requirements & Constraints

## Project Overview
CricFuzz is a premium cricket match simulation engine built with Vanilla JS and Tailwind CSS. It focuses on realistic, ball-by-ball simulations across multiple match formats.

## Core Features
- **Branding**: The app is named **CricFuzz** (a play on Cricbuzz).
- **Match Formats**:
  - **T20**: 20 overs per innings, 2 innings total. High aggression.
  - **ODI**: 50 overs per innings, 2 innings total. Balanced approach.
  - **TEST**: Up to 400 overs (2400 balls) per innings, 4 innings total. Measured/Defensive approach.
- **Simulation Engine**:
  - Probability-based outcomes using weighted random selection.
  - Dynamic modifiers based on:
    - **Match Format**: Each format adjusts dot ball likelyhood, boundary frequency, and wicket risk.
    - **Player Attributes**: `skill`, `aggression` (batsmen), and `economy` (bowlers).
  - **Over Notation**: 6th ball is displayed as `.6` (e.g., `0.5` -> `0.6` -> `1.1`).
- **Real-time UI**:
  - Live Scoreboard (Score, Wickets, Overs, RR).
  - Live Player Stats (Striker/Non-Striker names, runs, balls).
  - Live Bowler Display.
  - Ball-by-ball Timeline (Color-coded).
  - Narrative Commentary Feed.
  - Intensity/Speed Slider (500ms to 4000ms delay).

## Constraints & Requirements
- **Aesthetics**: Modern, premium dark mode (`#0B0E14` background), high-contrast amber accents.
- **Vanilla Tech**: Must use Vanilla JavaScript, HTML5, and Tailwind CSS. No heavy frameworks.
- **Offline/Single-Page**: Data is loaded from local JSON team files. All state is managed in-memory (no persistence required).
- **Haptics**: Vibrate on boundaries and wickets for compatible devices.
- **Post-Match**:
  - Display a full "Cricbuzz-style" scorecard after the match.
  - Provide a concise match summary (e.g., "India won by 40 runs").
  - Allow returning to the configuration screen without a page reload.

## Scoring Logic Modifiers
- **T20**: Aggression Mod: `1.2x`, Boundary Mod: `1.2x`, Dot Mod: `0.8x`.
- **ODI**: Baseline (`1.0x`).
- **TEST**: Aggression Mod: `0.6x`, Boundary Mod: `0.7x`, Dot Mod: `1.5x`.
