/// <reference types="vite/client" />

import { CommentaryEngine } from "./CommentaryEngine";
import { GameState } from "./GameState";
import { MatchController } from "./MatchController";
import { SimulationEngine } from "./SimulationEngine";
import { StatsEngine } from "./StatsEngine";

export class GameEngine {
	commentary: CommentaryEngine;
	simulation: SimulationEngine;
	stats: StatsEngine;
	match: MatchController;

	timer: ReturnType<typeof setTimeout> | null;
	pauseMultiplier: number;

	constructor() {
		this.commentary = new CommentaryEngine();
		this.simulation = new SimulationEngine();
		this.stats = new StatsEngine();
		this.match = new MatchController(this.stats, this.commentary);

		this.timer = null;
		this.pauseMultiplier = 1;
	}

	// Facade Methods (UI calls these)
	loadTeams(t1Id: string, t2Id: string) {
		return this.match.loadTeams(t1Id, t2Id);
	}

	performToss() {
		this.match.performToss();
	}

	startMatch(t1: string | null, t2: string | null) {
		this.match.startMatch(t1, t2, () => this.loop());
	}

	rematch() {
		this.match.rematch(() => this.loop());
	}

	resetToConfig() {
		this.match.resetToConfig();
	}

	stopMatch() {
		this.match.stopMatch();
	}

	resumeMatch() {
		this.match.resumeMatch(() => this.loop());
	}

	setSpeed(val: number) {
		GameState.speed.value = val;
	}

	getDelay() {
		const val = GameState.speed.value;
		const delay = 2020 - val * 19.7;
		return Math.max(50, delay);
	}

	loop() {
		if (!GameState.isRunning.value) return;

		// Core Tick
		this.playBall();

		if (GameState.matchResult.value) return;

		const delay = this.getDelay() * (this.pauseMultiplier || 1);
		this.pauseMultiplier = 1; // Reset for next ball
		this.timer = setTimeout(() => this.loop(), delay);
	}

	playBall() {
		const batter = GameState.striker.value;
		const bowlerObj = GameState.bowlingSquad.value.find(
			(p) => p.name === GameState.bowler.value,
		);

		if (!batter || !bowlerObj) {
			console.error("Missing batter or bowler");
			this.match.stopMatch();
			return;
		}

		// 1. Simulate
		const result = this.simulation.simulateBall(batter, bowlerObj);

		// 2. Process Result (Update Stats, Commentary)
		if (result.isWicket) {
			// Side-effect: Pause is handled by pauseMultiplier which lives here.
			this.pauseMultiplier = 4;
		}

		this.match.processOutcome(result);

		// 3. Check Rules (Win/Loss/Transition)
		this.match.checkGameStatus(() => this.loop());
	}
}
