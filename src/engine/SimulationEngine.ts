import { GameState } from "./GameState";
import { Player } from "../types";

export class SimulationEngine {

    // Simulate a single ball
    simulateBall(striker: Player, bowler: Player): number | 'W' {
        const format = GameState.format.value;
        const config = GameState.formatConfigs[format];
        const pitch = GameState.pitch.value;

        // Weights: [0, 1, 2, 4, 6, W]
        let weights = [35, 30, 10, 15, 5, 5];

        let batterSkill = striker.battingSkill || 75;
        let batterAggression = (striker as any).aggression || 70;
        let bowlerSkill = bowler.bowlingSkill || 75;
        let bowlerEconomy = (bowler as any).economy || 8.0;

        // Pitch Modifiers
        if (pitch === "Flat") { batterSkill *= 1.1; bowlerSkill *= 0.9; }
        else if (pitch === "Green") { batterSkill *= 0.95; bowlerSkill *= 1.15; }
        else if (pitch === "Dusty") { batterSkill *= 0.9; bowlerSkill *= 1.1; }

        const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
        let aggFactor = clamp((batterAggression / 90) * config.aggMod, 0.5, 1.8);
        const skillFactor = clamp(batterSkill / 90, 0.6, 1.4);
        const bowlSkillFactor = clamp(bowlerSkill / 90, 0.6, 1.4);
        const ecoFactor = clamp((10 - bowlerEconomy) / 3, 0.4, 1.8);

        // --- Phase Logic ---
        const b = GameState.balls.value; // Accessing signal directly since this is engine code
        const currentOver = Math.floor(b / 6);
        const phases = GameState.formatConfigs.phases[format];
        const activePhase = phases ? phases.find((p: any) => currentOver >= p.start && currentOver <= p.end) : null;

        if (activePhase) {
            aggFactor *= activePhase.agg;
            weights[0] *= activePhase.dot;   // Dot Ball
            weights[3] *= activePhase.bound; // Fours
            weights[4] *= activePhase.bound; // Sixes
            weights[5] *= activePhase.wick;  // Wickets
        }
        // -------------------

        weights[0] *= config.dotMod * ecoFactor / skillFactor;
        weights[1] *= skillFactor;
        weights[3] *= config.boundaryMod * aggFactor / ecoFactor;
        weights[4] *= config.boundaryMod * aggFactor * 1.1 / ecoFactor;
        weights[5] *= config.wicketMod * bowlSkillFactor * aggFactor / skillFactor;

        // Weighted Random
        const outcomes = [0, 1, 2, 4, 6, 'W'] as const;
        let total = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        let result: number | 'W' = outcomes[0];

        for (let i = 0; i < weights.length; i++) {
            if (r < weights[i]) { result = outcomes[i]; break; }
            r -= weights[i];
        }

        return result;
    }
}
