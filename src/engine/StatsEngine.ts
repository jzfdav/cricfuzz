import { GameState } from "./GameState";
import { Player } from "../types";
import { clamp } from "../utils";
import { BowlingEngine } from "./BowlingEngine";
import { BallOutcome } from "./SimulationEngine";

export class StatsEngine {

    calculateWinProbability() {
        const inn = GameState.innings.value;
        const format = GameState.format.value;

        // Win probability for: 
        // 1. Chasing in Limited Overs (Innings 2)
        // 2. Chasing in Test Match (Innings 4)
        if (inn !== 2 && !(format === 'TEST' && inn === 4)) return;

        let target = GameState.target.value;
        if (format === 'TEST' && inn === 4) {
            // In Test 4th innings, target is lead from first 3 innings + 1
            const lead = GameState.totalTeam1Score.value - GameState.totalTeam2Score.value;
            target = lead + 1;
        }

        if (!target) {
            GameState.winProbability.value = 50;
            return;
        }

        const current = GameState.score.value;
        const wickets = GameState.wickets.value;
        const ballsThrown = GameState.balls.value;
        const totalBalls = GameState.formatConfigs[format].balls;

        const runsNeeded = target - current;
        const ballsLeft = totalBalls - ballsThrown;
        const wicketsInHand = 10 - wickets;

        if (runsNeeded <= 0) {
            GameState.winProbability.value = 100;
            return;
        }
        if (wicketsInHand <= 0 || (format !== 'TEST' && ballsLeft <= 0)) {
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

    bowlingEngine: BowlingEngine;

    constructor() {
        this.bowlingEngine = new BowlingEngine();
    }

    selectBestBowler() {
        // First, update spell data for the PREVIOUS over (managed implicitly by who was 'current')
        // But wait, this is called BEFORE the new over starts.
        // The last bowler was GameState.bowler.value.
        if (GameState.bowler.value) {
            this.bowlingEngine.updateSpells(GameState.bowler.value);
        }

        const format = GameState.format.value;
        const limit = format === 'T20' ? 4 : format === 'ODI' ? 10 : 999;
        const current = GameState.bowler.value;
        const squad = GameState.bowlingSquad.value;

        const eligible = squad.filter((p: Player) => {
            if (p.role !== 'Bowler' && p.role !== 'All-Rounder') return false;
            if (((p.bowlStats?.balls || 0) / 6) >= limit) return false;
            return true;
        });

        const candidates = eligible.length ? eligible : squad.filter((p: Player) => p.name !== current);

        candidates.sort((a, b) => {
            // New Scoring Logic via Bowling Engine
            const scoreA = this.bowlingEngine.getSelectionScore(a, current);
            const scoreB = this.bowlingEngine.getSelectionScore(b, current);
            return scoreB - scoreA;
        });

        if (candidates.length) {
            GameState.bowler.value = candidates[0].name;
        } else if (squad.length > 0) {
            const fallback = squad.find(p => p.name !== current) || squad[0];
            GameState.bowler.value = fallback.name;
        }
    }
    updateStats(result: BallOutcome, striker: Player, bowlerName: string) {
        // Runs & Balls
        const runs = result.runs;

        // Global State Update
        GameState.balls.value++;
        GameState.score.value += runs;
        GameState.overRuns.value += runs; // Updated here
        if (result.isWicket) GameState.wickets.value++;

        // Striker Stats
        striker.batStats.balls++;
        striker.batStats.runs += runs;
        if (runs === 4) striker.batStats.fours++;
        if (runs === 6) striker.batStats.sixes++;
        if (result.isWicket) striker.batStats.out = true;

        // Bowler Stats
        const bowlerObj = GameState.bowlingSquad.value.find(p => p.name === bowlerName);
        if (bowlerObj) {
            bowlerObj.bowlStats.balls++;
            bowlerObj.bowlStats.runsConceded += runs;
            if (result.isWicket) bowlerObj.bowlStats.wicketsTaken++;
        } else {
            console.error(`Bowler not found: ${bowlerName}`);
            this.selectBestBowler();
        }

        // Timeline Update (Visual Feed)
        // Store simple visual representation for now ('W', '4', '6', '0', '1', etc.)
        const visual = result.isWicket ? 'W' : result.runs;
        GameState.timeline.value = [visual, ...GameState.timeline.value].slice(0, 12);

        // Innings Timeline (Graph Data) - End of Over
        if (GameState.balls.value % 6 === 0) {
            GameState.inningsTimeline.value = [
                ...GameState.inningsTimeline.value,
                {
                    over: GameState.balls.value / 6,
                    score: GameState.score.value,
                    wickets: GameState.wickets.value
                }
            ];
        }

        this.calculateWinProbability();
    }
}
