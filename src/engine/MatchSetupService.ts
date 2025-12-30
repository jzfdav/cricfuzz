import type { Player, Squad, TeamData } from "../types";
import type { CommentaryEngine } from "./CommentaryEngine";
import { GameState } from "./GameState";
import type { StatsEngine } from "./StatsEngine";

export class MatchSetupService {
	constructor(
		private stats: StatsEngine,
		private commentary: CommentaryEngine,
	) {}

	async loadTeams(t1Id: string, t2Id: string) {
		const baseUrl = import.meta.env.BASE_URL;
		const [d1, d2] = await Promise.all([
			fetch(`${baseUrl}teams/${t1Id}.json`).then((r) => r.json()),
			fetch(`${baseUrl}teams/${t2Id}.json`).then((r) => r.json()),
		]);

		GameState.teams.team1Data.value = d1;
		GameState.teams.team2Data.value = d2;
		GameState.teams.team1Name.value = d1.name;
		GameState.teams.team2Name.value = d2.name;

		this.selectRoster(GameState.format.value);
	}

	selectRoster(format: string) {
		const d1 = GameState.teams.team1Data.value;
		const d2 = GameState.teams.team2Data.value;
		if (!d1 || !d2) return;

		const fmtKey = format.toLowerCase() as "t20" | "odi" | "test";

		const getSquad = (d: TeamData): Squad => {
			if (d.rosters?.[fmtKey]) {
				return d.rosters[fmtKey];
			}
			return d.players || [];
		};

		const initStats = (p: Partial<Player>): Player => {
			return {
				...(p as Player),
				bowlingStyle: p.bowlingStyle || "Pace",
				batStats: { runs: 0, balls: 0, fours: 0, sixes: 0, out: false },
				bowlStats: { runsConceded: 0, wicketsTaken: 0, maidens: 0, balls: 0 },
			};
		};

		const p1: Squad = getSquad(d1)
			.map(initStats)
			.sort(
				(a: Player, b: Player) => (b.battingSkill || 0) - (a.battingSkill || 0),
			);
		const p2: Squad = getSquad(d2)
			.map(initStats)
			.sort(
				(a: Player, b: Player) => (b.battingSkill || 0) - (a.battingSkill || 0),
			);

		GameState.teams.team1.value = {
			id: d1.id,
			name: d1.name,
			color: d1.color,
			players: p1,
		};
		GameState.teams.team2.value = {
			id: d2.id,
			name: d2.name,
			color: d2.color,
			players: p2,
		};
	}

	performToss(
		addCommentary: (
			text: string,
			type: "info" | "wicket" | "four" | "six",
		) => void,
	) {
		const pitches = ["Flat", "Green", "Dusty", "Balanced", "Dry"] as const;
		const p = pitches[Math.floor(Math.random() * pitches.length)];
		GameState.pitch.value = p;

		let bowlProb = 0.5;
		if (p === "Green") bowlProb = 0.7;
		else if (p === "Flat") bowlProb = 0.3;
		else if (p === "Dusty") bowlProb = 0.4;

		const winnerIdx = Math.random() > 0.5 ? 1 : 2;
		const decision = Math.random() < bowlProb ? "BOWL" : "BAT";

		const winnerName =
			winnerIdx === 1
				? GameState.teams.team1Name.value
				: GameState.teams.team2Name.value;
		GameState.tossResult.value = `${winnerName} won the toss and elected to ${decision}`;

		const t1 = GameState.teams.team1.value;
		const t2 = GameState.teams.team2.value;

		if (!t1 || !t2) return;

		let batSquad: Squad, bowlSquad: Squad, batName: string, bowlName: string;

		if (
			(winnerIdx === 1 && decision === "BAT") ||
			(winnerIdx === 2 && decision === "BOWL")
		) {
			batSquad = t1.players;
			bowlSquad = t2.players;
			batName = t1.name;
			bowlName = t2.name;
		} else {
			batSquad = t2.players;
			bowlSquad = t1.players;
			batName = t2.name;
			bowlName = t1.name;
		}

		GameState.battingSquad.value = batSquad;
		GameState.bowlingSquad.value = bowlSquad;
		GameState.battingTeamName.value = batName;
		GameState.bowlingTeamName.value = bowlName;

		GameState.striker.value = batSquad[0];
		GameState.nonStriker.value = batSquad[1];
		GameState.nextBatterIndex.value = 2;

		this.stats.selectBestBowler();
		addCommentary(
			this.commentary.getIntroCommentary(winnerName, decision, p),
			"intro" as "info",
		);
	}
}
