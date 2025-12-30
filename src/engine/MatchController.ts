import { GameState } from "./GameState";
import { MatchHistoryEntry, CommentaryEntry } from "../types";
import { StatsEngine } from "./StatsEngine";
import { CommentaryEngine } from "./CommentaryEngine";
import { BallOutcome } from "./SimulationEngine";
import { MatchSetupService } from "./MatchSetupService";
import { GameplayService } from "./GameplayService";

export class MatchController {
    private setup: MatchSetupService;
    private gameplay: GameplayService;

    constructor(private stats: StatsEngine, private commentary: CommentaryEngine) {
        this.setup = new MatchSetupService(stats, commentary);
        this.gameplay = new GameplayService(
            stats,
            commentary,
            this.addCommentary.bind(this),
            this.endMatch.bind(this),
            this.switchInnings.bind(this)
        );
    }

    /* --- SETUP & TOSS (Delegated) --- */

    async loadTeams(t1Id: string, t2Id: string) {
        return this.setup.loadTeams(t1Id, t2Id);
    }

    selectRoster(format: string) {
        return this.setup.selectRoster(format);
    }

    performToss() {
        return this.setup.performToss(this.addCommentary.bind(this));
    }

    /* --- MATCH CONTROL --- */

    stopMatch() {
        GameState.isRunning.value = false;
    }

    startMatch(t1: string | null, t2: string | null, loopCallback: () => void) {
        const boostPlayer = (squad: any) => {
            if (!squad || squad.length === 0) return null;
            const p = squad[Math.floor(Math.random() * squad.length)];
            const factor = 1 + (Math.random() * 0.2 + 0.1);
            const ecoFactor = 1 - (Math.random() * 0.2 + 0.1);

            p.aggression = Math.floor((p.aggression || 75) * factor);
            p.economy = (p.economy || 8.0) * ecoFactor;
            return p;
        };

        const t1Data = GameState.teams.team1.value;
        const t2Data = GameState.teams.team2.value;

        const p1 = t1Data ? boostPlayer(t1Data.players) : null;
        const p2 = t2Data ? boostPlayer(t2Data.players) : null;

        if (p1 && p2) {
            console.log(`🔥 Match Winners (Boosted): ${p1.name} & ${p2.name}`);
            this.addCommentary(`Experts are keeping a close eye on ${p1.name} and ${p2.name} today - they looked in supreme touch during the warmups!`, "info");
        }

        GameState.view.value = "live";
        GameState.isRunning.value = true;
        loopCallback();
    }

    resumeMatch(loopCallback: () => void) {
        GameState.isRunning.value = true;
        loopCallback();
    }

    resetToConfig() {
        this.stopMatch();
        GameState.view.value = "config";
        GameState.score.value = 0;
        GameState.wickets.value = 0;
        GameState.balls.value = 0;
        GameState.innings.value = 1;
        GameState.timeline.value = [];
        GameState.commentary.value = [];
        GameState.matchResult.value = null;
        GameState.history.value = [];
        GameState.inningsTimeline.value = [];
        GameState.totalTeam1Score.value = 0;
        GameState.totalTeam2Score.value = 0;
        GameState.target.value = null;
        GameState.winProbability.value = 50;
        GameState.tossResult.value = "";
        GameState.battingTeamName.value = "";
        GameState.bowlingTeamName.value = "";
        GameState.battingSquad.value = [];
        GameState.bowlingSquad.value = [];
        GameState.lastMilestone.value = null;
        GameState.allOut.value = false;
        GameState.overRuns.value = 0;
        GameState.lastOverWasMaiden.value = false;
        GameState.nextBatterIndex.value = 2;
    }

    resetPlayerStats() {
        const resetStats = (p: any) => {
            p.batStats = { runs: 0, balls: 0, fours: 0, sixes: 0, out: false };
            p.bowlStats = { runsConceded: 0, wicketsTaken: 0, maidens: 0, balls: 0 };
        };
        if (GameState.teams.team1.value) GameState.teams.team1.value.players.forEach(resetStats);
        if (GameState.teams.team2.value) GameState.teams.team2.value.players.forEach(resetStats);
    }

    rematch(loopCallback: () => void) {
        this.stopMatch();
        this.resetToConfig();
        this.resetPlayerStats();
        this.performToss();
        GameState.view.value = "live";
        GameState.isRunning.value = true;
        loopCallback();
    }

    switchInnings(loopCallback: () => void) {
        this.stopMatch();

        const entry: MatchHistoryEntry = {
            team: GameState.battingTeamName.value,
            score: GameState.score.value,
            wickets: GameState.wickets.value,
            overs: GameState.balls.value,
            batting: JSON.parse(JSON.stringify(GameState.battingSquad.value)),
            bowling: JSON.parse(JSON.stringify(GameState.bowlingSquad.value)),
            timeline: JSON.parse(JSON.stringify(GameState.inningsTimeline.value))
        };
        GameState.history.value = [...GameState.history.value, entry];

        if (GameState.battingTeamName.value === GameState.teams.team1Name.value) {
            GameState.totalTeam1Score.value += GameState.score.value;
        } else {
            GameState.totalTeam2Score.value += GameState.score.value;
        }

        if (GameState.format.value === 'TEST' && GameState.innings.value === 3) {
            const team1Total = GameState.totalTeam1Score.value;
            const team2Total = GameState.totalTeam2Score.value;
            const battingFirst = GameState.history.value[0].team;

            let lead: number;
            let leader: string;

            if (battingFirst === GameState.teams.team1Name.value) {
                lead = team1Total - team2Total;
                leader = GameState.teams.team1Name.value;
            } else {
                lead = team2Total - team1Total;
                leader = GameState.teams.team2Name.value;
            }

            if (lead < 0) {
                this.endMatch(`${GameState.battingTeamName.value} WINS by an innings and ${Math.abs(lead)} runs!`);
                return;
            }
        }

        GameState.innings.value++;

        if (GameState.format.value !== 'TEST' && GameState.innings.value === 2) {
            GameState.target.value = GameState.score.value + 1;
        } else if (GameState.format.value === 'TEST' && GameState.innings.value === 4) {
            const team1Total = GameState.totalTeam1Score.value;
            const team2Total = GameState.totalTeam2Score.value;
            const battingFirst = GameState.history.value[0].team;

            if (battingFirst === GameState.teams.team1Name.value) {
                // Team 1 batted 1st and 3rd. Team 2 batting 4th.
                GameState.target.value = team1Total - team2Total + 1;
            } else {
                // Team 2 batted 1st and 3rd. Team 1 batting 4th.
                GameState.target.value = team2Total - team1Total + 1;
            }
        }

        GameState.score.value = 0;
        GameState.wickets.value = 0;
        GameState.balls.value = 0;
        GameState.allOut.value = false;
        GameState.overRuns.value = 0;
        GameState.lastOverWasMaiden.value = false;
        GameState.nextBatterIndex.value = 2;
        GameState.inningsTimeline.value = [];
        GameState.winProbability.value = 50;

        const oldBat = GameState.battingSquad.value;
        const oldBowl = GameState.bowlingSquad.value;
        const oldBatName = GameState.battingTeamName.value;
        const oldBowlName = GameState.bowlingTeamName.value;

        GameState.battingSquad.value = oldBowl;
        GameState.bowlingSquad.value = oldBat;
        GameState.battingTeamName.value = oldBowlName;
        GameState.bowlingTeamName.value = oldBatName;

        GameState.battingSquad.value.forEach((p: any) => p.batStats = { runs: 0, balls: 0, fours: 0, sixes: 0, out: false });
        GameState.bowlingSquad.value.forEach((p: any) => p.bowlStats = { runsConceded: 0, wicketsTaken: 0, maidens: 0, balls: 0 });

        GameState.striker.value = GameState.battingSquad.value[0];
        GameState.nonStriker.value = GameState.battingSquad.value[1];

        this.stats.selectBestBowler();

        setTimeout(() => {
            GameState.isRunning.value = true;
            loopCallback();
        }, 2000);
    }

    endMatch(msg: string) {
        this.stopMatch();
        const entry: MatchHistoryEntry = {
            team: GameState.battingTeamName.value,
            score: GameState.score.value,
            wickets: GameState.wickets.value,
            overs: GameState.balls.value,
            batting: JSON.parse(JSON.stringify(GameState.battingSquad.value)),
            bowling: JSON.parse(JSON.stringify(GameState.bowlingSquad.value)),
            timeline: JSON.parse(JSON.stringify(GameState.inningsTimeline.value))
        };
        GameState.history.value = [...GameState.history.value, entry];
        GameState.matchResult.value = msg;
        setTimeout(() => {
            GameState.view.value = "result";
        }, 3000);
    }

    checkGameStatus(loopCallback: () => void) {
        return this.gameplay.checkGameStatus(loopCallback);
    }

    swapBatters() {
        return this.gameplay.swapBatters();
    }

    processOutcome(res: BallOutcome) {
        return this.gameplay.processOutcome(res);
    }

    private addCommentary(text: string | null | undefined, type: CommentaryEntry['type']) {
        if (!text) return;
        const b = GameState.balls.value;
        const ballIndex = b > 0 ? b - 1 : 0;
        const overStr = `${Math.floor(ballIndex / 6)}.${(ballIndex % 6) + 1}`;

        const entry = {
            id: Date.now() + Math.random(),
            text,
            type,
            over: overStr
        };
        GameState.commentary.value = [entry, ...GameState.commentary.value].slice(0, 100);
    }
}
