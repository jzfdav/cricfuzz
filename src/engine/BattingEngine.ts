import type { Player } from "../types";
import { clamp } from "../utils";
import { GameState } from "./GameState";

export class BattingEngine {
	getAggressionFactor(
		striker: Player,
		wicketsDown: number,
		oversLeft: number,
	): number {
		const format = GameState.format.value;
		const config = GameState.formatConfigs[format];

		// Base Aggression from Player Stats
		let baseAgg = (striker.aggression || 70) / 90; // 0.77 for 70 agg

		// 1. Settling In Logic
		// Reduce aggression for the first 10 balls a batter faces
		const ballsFaced = striker.batStats.balls;
		if (ballsFaced < 6) baseAgg *= 0.6;
		else if (ballsFaced < 12) baseAgg *= 0.8;

		// 2. Wickets Pressure (Collapse Logic)
		// If many wickets down, be careful
		if (wicketsDown >= 7)
			baseAgg *= 0.7; // Tailenders or collapse
		else if (wicketsDown >= 4 && oversLeft > (config.balls / 6) * 0.4)
			baseAgg *= 0.9; // Rebuilding

		// 3. Death Overs / Finish Logic (Acceleration)
		// Increase aggression if fewer overs remain and we have wickets
		const totalOvers = config.balls / 6;
		const deathPhaseStart = totalOvers * 0.8; // Last 20% of innings

		if (oversLeft <= totalOvers - deathPhaseStart) {
			// Death Overs
			if (wicketsDown < 6)
				baseAgg *= 1.5; // Good position, smash
			else if (wicketsDown < 8) baseAgg *= 1.2; // Slog
		}

		// Target Pressure (Chasing)
		if (GameState.innings.value === 2 && GameState.target.value) {
			const rrr =
				(GameState.target.value - GameState.score.value) / (oversLeft || 1);
			if (rrr > 10)
				baseAgg *= 1.4; // Desperate
			else if (rrr > 8) baseAgg *= 1.2;
			else if (rrr < 4) baseAgg *= 0.8; // Cruising
		}

		return clamp(baseAgg * config.aggMod, 0.2, 2.5);
	}

	getMindset(aggFactor: number): "Defensive" | "Balanced" | "Attacking" {
		if (aggFactor < 0.75) return "Defensive";
		if (aggFactor > 1.25) return "Attacking";
		return "Balanced";
	}
}
