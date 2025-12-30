import type { CommentaryEntry, Player } from "../types";
import type { CommentaryEngine } from "./CommentaryEngine";
import { GameState } from "./GameState";
import type { BallOutcome } from "./SimulationEngine";
import type { StatsEngine } from "./StatsEngine";

export class GameplayService {
	constructor(
		private stats: StatsEngine,
		private commentary: CommentaryEngine,
		private addCommentary: (
			text: string | null | undefined,
			type: CommentaryEntry["type"],
		) => void,
		private endMatch: (msg: string) => void,
		private switchInnings: (callback: () => void) => void,
	) {}

	swapBatters() {
		const s = GameState.striker.value;
		const ns = GameState.nonStriker.value;
		GameState.striker.value = ns;
		GameState.nonStriker.value = s;
	}

	processOutcome(res: BallOutcome) {
		const striker = GameState.striker.value;
		const oldRuns = striker.batStats.runs;

		this.stats.updateStats(res, striker, GameState.bowler.value);
		const newRuns = striker.batStats.runs;
		const runsScored = res.runs;

		if (res.isWicket) {
			GameState.lastEvent.value = { type: "wicket", timestamp: Date.now() };
			if (typeof window !== "undefined")
				window.navigator.vibrate?.([40, 30, 40]);
			this.addCommentary(
				this.commentary.getCommentary(
					res,
					GameState.bowler.value,
					striker.name,
				),
				"wicket",
			);

			if (
				GameState.nextBatterIndex.value < GameState.battingSquad.value.length
			) {
				const nextBatter =
					GameState.battingSquad.value[GameState.nextBatterIndex.value];
				if (nextBatter) {
					this.addCommentary(
						this.commentary.getNewBatterCommentary(nextBatter.name),
						"intro",
					);
				}
				if (Math.random() > 0.7) {
					this.addCommentary(this.commentary.getSituationCommentary(), "info");
				}
				const next =
					GameState.battingSquad.value[GameState.nextBatterIndex.value++];
				GameState.striker.value = next;
			} else {
				GameState.allOut.value = true;
			}
		} else {
			if (oldRuns < 50 && newRuns >= 50)
				this.addCommentary(
					this.commentary.getMilestoneCommentary("fifty", striker.name),
					"milestone",
				);
			if (oldRuns < 100 && newRuns >= 100)
				this.addCommentary(
					this.commentary.getMilestoneCommentary("century", striker.name),
					"milestone",
				);

			if (res.runs === 4) {
				GameState.lastEvent.value = { type: "four", timestamp: Date.now() };
				if (typeof window !== "undefined") window.navigator.vibrate?.([40]);
				this.addCommentary(
					this.commentary.getCommentary(
						res,
						GameState.bowler.value,
						striker.name,
					),
					"four",
				);
			} else if (res.runs === 6) {
				GameState.lastEvent.value = { type: "six", timestamp: Date.now() };
				if (typeof window !== "undefined")
					window.navigator.vibrate?.([40, 30, 40]);
				this.addCommentary(
					this.commentary.getCommentary(
						res,
						GameState.bowler.value,
						striker.name,
					),
					"six",
				);
			} else if (res.runs === 0) {
				this.addCommentary(
					this.commentary.getCommentary(
						res,
						GameState.bowler.value,
						striker.name,
					),
					"dot",
				);
			} else {
				this.addCommentary(
					this.commentary.getCommentary(
						res,
						GameState.bowler.value,
						striker.name,
					),
					"run",
				);
			}

			if (runsScored % 2 !== 0) this.swapBatters();
		}

		if (GameState.balls.value > 0 && GameState.balls.value % 6 === 0) {
			if (GameState.overRuns.value === 0 && !GameState.allOut.value) {
				const bowlerObj = GameState.bowlingSquad.value.find(
					(p: Player) => p.name === GameState.bowler.value,
				);
				if (bowlerObj) bowlerObj.bowlStats.maidens++;
				this.addCommentary(this.commentary.getMaidenCommentary(), "maiden");
			}
			GameState.overRuns.value = 0;
			this.swapBatters();
			this.stats.selectBestBowler();
		}
	}

	checkGameStatus(loopCallback: () => void) {
		const format = GameState.format.value;
		const config = GameState.formatConfigs[format];
		const balls = GameState.balls.value;
		const wickets = GameState.wickets.value;
		const score = GameState.score.value;
		const target = GameState.target.value;
		const inn = GameState.innings.value;
		const inningsEnded =
			GameState.allOut.value || wickets >= 10 || balls >= config.balls;

		if (format === "TEST") {
			if (inn === 4) {
				if (target && score >= target) {
					this.endMatch(
						`${GameState.battingTeamName.value} WINS by ${10 - wickets} wickets!`,
					);
					return;
				}
				if (inningsEnded) {
					if (target && score < target - 1)
						this.endMatch(
							`${GameState.bowlingTeamName.value} WINS by ${target - 1 - score} runs!`,
						);
					else if (target && score === target - 1) {
						if (GameState.allOut.value || wickets >= 10)
							this.endMatch("MATCH TIED!");
						else this.endMatch("MATCH DRAWN!");
					} else {
						this.endMatch("MATCH DRAWN!");
					}
					return;
				}
			} else {
				if (inningsEnded) {
					this.addCommentary(`End of Innings ${inn}.`, "intro");
					this.switchInnings(loopCallback);
				}
			}
			return;
		}

		if (inn === 1) {
			if (inningsEnded) {
				this.addCommentary("End of 1st Innings.", "intro");
				this.switchInnings(loopCallback);
			}
		} else if (inn === 2) {
			if (target && score >= target) {
				this.endMatch(
					`${GameState.battingTeamName.value} WINS by ${10 - wickets} wickets!`,
				);
			} else if (inningsEnded) {
				if (target && score === target - 1) this.endMatch("MATCH TIED!");
				else if (target)
					this.endMatch(
						`${GameState.bowlingTeamName.value} WINS by ${target - 1 - score} runs!`,
					);
			}
		}
	}
}
