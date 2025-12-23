import { GameState } from "./GameState";
import { Player } from "../types";
import { clamp } from "../utils";

export class StatsEngine {

    calculateWinProbability() {
        if (GameState.innings.value !== 2) return;

        const target = GameState.target.value;
        if (!target) return;

        const current = GameState.score.value;
        const wickets = GameState.wickets.value;
        const ballsThrown = GameState.balls.value;
        const totalBalls = GameState.formatConfigs[GameState.format.value].balls;

        const runsNeeded = target - current;
        const ballsLeft = totalBalls - ballsThrown;
        const wicketsInHand = 10 - wickets;

        if (runsNeeded <= 0) {
            GameState.winProbability.value = 100;
            return;
        }
        if (ballsLeft <= 0 || wicketsInHand <= 0) {
            GameState.winProbability.value = 0;
            return;
        }

        const rrr = runsNeeded / (ballsLeft / 6);
        let baseProb = 50;

        // Base Probability based on RRR curve (heuristic)
        // Easy < 6, Par 8, Tough 10, Hard 12+
        if (rrr < 6) baseProb = 90;
        else if (rrr < 8) baseProb = 70;
        else if (rrr < 10) baseProb = 50;
        else if (rrr < 12) baseProb = 30;
        else if (rrr < 15) baseProb = 10;
        else baseProb = 1;

        const resourceFactor = Math.pow(wicketsInHand / 10, 1.2);
        const crr = ballsThrown > 0 ? (current / (ballsThrown / 6)) : 0;
        const momentum = rrr > 0 ? clamp(crr / rrr, 0.8, 1.2) : 1;

        let finalProb = baseProb * resourceFactor * momentum;

        // Clamp
        finalProb = Math.min(99, Math.max(1, finalProb));

        GameState.winProbability.value = Math.round(finalProb);
    }

    selectBestBowler() {
        const format = GameState.format.value;
        const limit = format === 'T20' ? 4 : format === 'ODI' ? 10 : 999;
        const current = GameState.bowler.value;
        const squad = GameState.bowlingSquad.value;

        const eligible = squad.filter((p: Player) => {
            if (p.role !== 'Bowler' && p.role !== 'All-Rounder') return false;
            // safe check balls in case undefined
            if (((p.bowlStats?.balls || 0) / 6) >= limit) return false;
            if (p.name === current) return false;
            return true;
        });

        const candidates = eligible.length ? eligible : squad.filter((p: Player) => p.name !== current);

        candidates.sort((a, b) => {
            return ((b.bowlingSkill || 0) + Math.random()) - ((a.bowlingSkill || 0) + Math.random());
        });

        if (candidates.length) {
            GameState.bowler.value = candidates[0].name;
        } else if (squad.length > 0) {
            // Panic fallback: just pick the first player if no one matches criteria
            // This prevents the 'bowler from previous innings' bug
            GameState.bowler.value = squad[0].name;
        }
    }
}
