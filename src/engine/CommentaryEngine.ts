import {
	type CommentaryTemplates,
	commentaryTemplates,
} from "../data/commentaryTemplates";
import { GameState } from "./GameState";
import type { BallOutcome } from "./SimulationEngine";

export class CommentaryEngine {
	templates: CommentaryTemplates;

	constructor() {
		this.templates = commentaryTemplates;
	}

	getSurname(fullName: string | null | undefined): string {
		if (!fullName) return "The batter";
		const parts = fullName.trim().split(" ");
		return parts.length > 1 ? parts[parts.length - 1] : fullName;
	}

	getCommentary(
		result: BallOutcome,
		bowlerName: string,
		batterName: string,
	): string | undefined {
		const state = GameState;
		const score = state.score.value;
		const balls = state.balls.value;
		const target = state.target.value;
		const format = state.format.value;
		const config =
			format === "T20"
				? { balls: 120 }
				: format === "ODI"
					? { balls: 300 }
					: { balls: 2400 };

		if (target && target - score < 20 && config.balls - balls < 18) {
			if (Math.random() > 0.6) return this.getRandom(this.templates.closeGame);
		}

		let templatePool: string[] = [];
		const bowlerObj = GameState.bowlingSquad.value.find(
			(p) => p.name === bowlerName,
		);
		const style = bowlerObj?.bowlingStyle || "Pace";

		if (result.isWicket) {
			if (style === "Spin" && Math.random() > 0.5)
				templatePool = this.templates.wicket.spin;
			else if (result.wicketType === "bowled")
				templatePool = this.templates.wicket.bowled;
			else if (result.wicketType === "lbw")
				templatePool = this.templates.wicket.lbw;
			else if (result.wicketType === "runout")
				templatePool = this.templates.wicket.runout;
			else templatePool = this.templates.wicket.caught;

			if (!templatePool || templatePool.length === 0)
				templatePool = this.templates.wicket.default;
		} else if (result.runs === 6) {
			if (style === "Spin" && Math.random() > 0.6)
				templatePool = this.templates.six.spin;
			else if (result.shotType === "pull")
				templatePool = this.templates.six.pull;
			else if (result.shotType === "slog")
				templatePool = this.templates.six.slog;
			else if (result.shotType === "drive")
				templatePool = this.templates.six.drive;
			else templatePool = this.templates.six.default;
		} else if (result.runs === 4) {
			if (result.shotType === "drive") templatePool = this.templates.four.drive;
			else if (result.shotType === "pull" || result.shotType === "cut")
				templatePool = this.templates.four.cutPull;
			else if (result.shotType === "edge")
				templatePool = this.templates.four.edge;
			else templatePool = this.templates.four.default;
		} else if (result.runs === 0) {
			if (
				style === "Spin" &&
				(result.deliveryType === "full" || result.deliveryType === "length")
			) {
				if (Math.random() > 0.4) templatePool = this.templates.dot.spin;
				else templatePool = this.templates.dot.default;
			} else if (result.deliveryType === "bouncer")
				templatePool = this.templates.dot.bouncer;
			else if (result.deliveryType === "yorker")
				templatePool = this.templates.dot.yorker;
			else if (result.timing === "missed" || result.timing === "poor")
				templatePool = this.templates.dot.beaten;
			else templatePool = this.templates.dot.default;
		} else {
			templatePool = this.templates.single;
		}

		const rawLine = this.getRandom(templatePool);
		const bName = this.getSurname(batterName);
		const boName = this.getSurname(bowlerName);

		if (!rawLine) return undefined;

		return rawLine.replace(/{batter}/g, bName).replace(/{bowler}/g, boName);
	}

	getRandom(arr: string[]): string {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	getMaidenCommentary(bowlerName?: string): string {
		const line = this.getRandom(this.templates.maiden);
		return line.replace(
			/{bowler}/g,
			this.getSurname(bowlerName) || "the bowler",
		);
	}

	getIntroCommentary(winner: string, decision: string, pitch: string): string {
		const templates = [
			`Welcome everyone! ${winner} has won the toss and decided to ${decision} first. The pitch looks ${pitch}.`,
			`We are live! ${winner} wins the coin flip. They will ${decision} on this ${pitch} surface.`,
			`Toss news: ${winner} elects to ${decision}. Pitch report suggests it is ${pitch}.`,
		];
		return this.getRandom(templates);
	}

	getMilestoneCommentary(
		milestone: "fifty" | "century",
		batterName: string,
	): string | null {
		const bName = this.getSurname(batterName);
		let lines: string[] = [];
		if (milestone === "fifty") lines = this.templates.fifty;
		if (milestone === "century") lines = this.templates.century;
		if (!lines.length) return null;

		return this.getRandom(lines).replace(/{batter}/g, bName);
	}

	getNewBatterCommentary(batterName: string): string {
		const bName = this.getSurname(batterName);
		const line = this.getRandom(this.templates.newBatter);
		return line.replace(/{batter}/g, bName).replace(/{style}/g, "aggressive");
	}

	getSituationCommentary(): string {
		return this.getRandom(this.templates.situation);
	}
}
