import { GameState } from "./GameState";
import { Player } from "../types";
import { clamp } from "../utils";
import { BattingEngine } from "./BattingEngine";

export interface BallOutcome {
    runs: number;
    isWicket: boolean;
    wicketType?: 'bowled' | 'caught' | 'lbw' | 'runout';
    shotType: 'drive' | 'pull' | 'cut' | 'flick' | 'slog' | 'defense' | 'leave' | 'edge';
    deliveryType: 'bouncer' | 'yorker' | 'length' | 'full' | 'slow';
    timing: 'perfect' | 'good' | 'average' | 'poor' | 'edge' | 'missed';
}

export class SimulationEngine {
    private battingEngine: BattingEngine;

    constructor() {
        this.battingEngine = new BattingEngine();
    }

    // Helper to get random item
    private pick<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // Simulate a single ball
    simulateBall(striker: Player, bowler: Player): BallOutcome {
        const format = GameState.format.value;
        const config = GameState.formatConfigs[format];
        const pitch = GameState.pitch.value;

        // Weights: [0, 1, 2, 4, 6, W]
        let weights = [35, 30, 10, 15, 5, 5];

        let batterSkill = striker.battingSkill || 75;
        let bowlerSkill = bowler.bowlingSkill || 75;
        let bowlerEconomy = bowler.economy || 8.0;

        // New: Get Dynamic Aggression from BattingEngine
        const wicketsDown = GameState.wickets.value;
        const ballsThrown = GameState.balls.value;
        const totalBalls = config.balls;
        const oversLeft = (totalBalls - ballsThrown) / 6;

        let aggFactor = this.battingEngine.getAggressionFactor(striker, wicketsDown, oversLeft);
        GameState.currentMindset.value = this.battingEngine.getMindset(aggFactor);

        // Pitch Modifiers
        if (pitch === "Flat") { batterSkill *= 1.1; bowlerSkill *= 0.9; }
        else if (pitch === "Green") { batterSkill *= 0.95; bowlerSkill *= 1.15; }
        else if (pitch === "Dusty") { batterSkill *= 0.9; bowlerSkill *= 1.1; }

        const skillFactor = clamp(batterSkill / 90, 0.6, 1.4);
        const bowlSkillFactor = clamp(bowlerSkill / 90, 0.6, 1.4);
        const ecoFactor = clamp((10 - bowlerEconomy) / 3, 0.4, 1.8);

        // --- Phase Logic ---
        const b = GameState.balls.value;
        const currentOver = Math.floor(b / 6);
        const phases = GameState.formatConfigs.phases[format];
        const activePhase = phases ? phases.find((p) => currentOver >= p.start && currentOver <= p.end) : null;

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
        let resultRaw: number | 'W' = outcomes[0];

        for (let i = 0; i < weights.length; i++) {
            if (r < weights[i]) { resultRaw = outcomes[i]; break; }
            r -= weights[i];
        }

        // --- Metadata Generation ---
        const outcome: BallOutcome = {
            runs: typeof resultRaw === 'number' ? resultRaw : 0,
            isWicket: resultRaw === 'W',
            shotType: 'defense',
            deliveryType: 'length',
            timing: 'average',
            wicketType: undefined
        };

        // Determine Delivery Type
        const randD = Math.random();
        const style = bowler.bowlingStyle || 'Pace';

        if (style === 'Spin') {
            // Spin Distribution
            if (randD > 0.95) outcome.deliveryType = 'yorker'; // Faster/Arm ball
            else if (randD > 0.90) outcome.deliveryType = 'bouncer'; // Short ball/Drag down
            else if (randD > 0.60) outcome.deliveryType = 'full'; // Flighted
            else if (randD > 0.45) outcome.deliveryType = 'slow'; // Slower through air
            else outcome.deliveryType = 'length'; // Stock ball
        } else {
            // Pace Distribution
            if (randD > 0.85) outcome.deliveryType = 'yorker';
            else if (randD > 0.70) outcome.deliveryType = 'bouncer';
            else if (randD > 0.50) outcome.deliveryType = 'full';
            else outcome.deliveryType = 'length';
        }

        // Determine Shot & Timing
        if (outcome.isWicket) {
            outcome.timing = this.pick(['edge', 'poor', 'missed']) as any;
            outcome.shotType = this.pick(['slog', 'defense', 'drive', 'pull']);

            // Adjust Shot for Spin
            if (style === 'Spin' && outcome.shotType === 'pull') {
                // Pulling spin is rarer, maybe swap to Sweep/Slog sweep context (mapped to Slog/Pull)
                // Let's keep it but reduce probability of 'edge' on pull, maybe 'missed' (bowled) or 'poor' (caught deep)
            }

            // Wicket Type Logic
            if (outcome.deliveryType === 'yorker' || outcome.timing === 'missed') outcome.wicketType = 'bowled';
            else if (outcome.timing === 'edge') outcome.wicketType = 'caught';
            else outcome.wicketType = 'caught';
        } else {
            if (outcome.runs === 6) {
                outcome.timing = 'perfect';
                outcome.shotType = outcome.deliveryType === 'bouncer' ? 'pull' : 'slog';
            } else if (outcome.runs === 4) {
                outcome.timing = this.pick(['perfect', 'good']);
                if (outcome.deliveryType === 'full') outcome.shotType = 'drive';
                else if (outcome.deliveryType === 'bouncer') outcome.shotType = Math.random() > 0.5 ? 'pull' : 'cut';
                else outcome.shotType = this.pick(['drive', 'cut', 'flick']);
            } else if (outcome.runs > 0) {
                outcome.timing = 'good';
                outcome.shotType = this.pick(['flick', 'drive', 'defense']);
            } else {
                outcome.timing = this.pick(['average', 'good']);
                outcome.shotType = 'defense';
            }
        }

        return outcome;
    }
}
