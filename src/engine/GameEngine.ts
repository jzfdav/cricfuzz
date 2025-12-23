/// <reference types="vite/client" />
import { GameState, FormatType } from "./GameState";
import { CommentaryEngine } from "../CommentaryEngine";
import { Player, Squad, MatchHistoryEntry, CommentaryEntry } from "../types";

export class GameEngine {
    commentary: CommentaryEngine;
    timer: ReturnType<typeof setTimeout> | null;
    pauseMultiplier: number;

    constructor() {
        this.commentary = new CommentaryEngine();
        this.timer = null;
        this.pauseMultiplier = 1;
    }

    /* --- SETUP & TOSS --- */

    async loadTeams(t1Id: string, t2Id: string) {
        const baseUrl = import.meta.env.BASE_URL;
        const [d1, d2] = await Promise.all([
            fetch(`${baseUrl}teams/${t1Id}.json`).then(r => r.json()),
            fetch(`${baseUrl}teams/${t2Id}.json`).then(r => r.json())
        ]);

        const initStats = (p: any): Player => ({
            ...p,
            batStats: { runs: 0, balls: 0, fours: 0, sixes: 0, out: false },
            bowlStats: { runsConceded: 0, wicketsTaken: 0, maidens: 0, balls: 0 }
        });

        // Initialize and Sort by Batting Skill
        // We assume d1.players matches the Player shape roughly except stats
        const p1: Squad = d1.players.map(initStats).sort((a: Player, b: Player) => (b.battingSkill || 0) - (a.battingSkill || 0));
        const p2: Squad = d2.players.map(initStats).sort((a: Player, b: Player) => (b.battingSkill || 0) - (a.battingSkill || 0));

        GameState.teams.team1Name.value = d1.name;
        GameState.teams.team2Name.value = d2.name;
        GameState.teams.team1.value = { name: d1.name, players: p1 };
        GameState.teams.team2.value = { name: d2.name, players: p2 };
    }

    performToss() {
        // Random Pitch
        const pitches = ["Flat", "Green", "Dusty", "Balanced"] as const;
        const p = pitches[Math.floor(Math.random() * pitches.length)];
        GameState.pitch.value = p;

        // Toss Logic
        let bowlProb = 0.5;
        if (p === "Green") bowlProb = 0.7;
        else if (p === "Flat") bowlProb = 0.3;
        else if (p === "Dusty") bowlProb = 0.4;

        const winnerIdx = Math.random() > 0.5 ? 1 : 2;
        const decision = Math.random() < bowlProb ? "BOWL" : "BAT";

        const winnerName = winnerIdx === 1 ? GameState.teams.team1Name.value : GameState.teams.team2Name.value;
        GameState.tossResult.value = `${winnerName} won the toss and elected to ${decision}`;

        // Set Batting/Bowling Sides
        let batSquad: Squad, bowlSquad: Squad, batName: string, bowlName: string;

        // Assert non-null since loadTeams fills these
        const t1 = GameState.teams.team1.value!;
        const t2 = GameState.teams.team2.value!;

        if ((winnerIdx === 1 && decision === "BAT") || (winnerIdx === 2 && decision === "BOWL")) {
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

        // Init Runners
        GameState.striker.value = batSquad[0];
        GameState.nonStriker.value = batSquad[1];
        GameState.nextBatterIndex.value = 2;

        this.selectBestBowler();

        // Add Intro Commentary
        this.addCommentary(this.commentary.getIntroCommentary(winnerName, decision, p), 'intro');
    }

    /* --- GAME LOOP --- */

    stopMatch() {
        if (this.timer) clearTimeout(this.timer);
        GameState.isRunning.value = false;
    }

    startMatch(t1: string | null, t2: string | null) {
        if (t1) GameState.teams.team1.value = null; // Reset if new

        // --- Match Winner Mechanic (X-Factor) ---
        const boostPlayer = (squad: Squad | undefined) => {
            if (!squad || squad.length === 0) return null;
            const p = squad[Math.floor(Math.random() * squad.length)];
            const factor = 1 + (Math.random() * 0.2 + 0.1); // 1.10 to 1.30
            const ecoFactor = 1 - (Math.random() * 0.2 + 0.1); // 0.90 to 0.70 (Lower is better)

            p.battingSkill = Math.floor((p.battingSkill || 75) * factor);
            p.bowlingSkill = Math.floor((p.bowlingSkill || 75) * factor);
            // Dynamic prop check if exists on Player type, assume strict for now
            // p.aggression is not on Player interface currently? 
            // In JS code: p.aggression = ...
            // I should add optional props to Player interface or use extend.
            // For now, I'll assume they might exist or cast to any if strict.
            // Let's use cleaner approach:
            (p as any).aggression = Math.floor(((p as any).aggression || 75) * factor);
            (p as any).economy = ((p as any).economy || 8.0) * ecoFactor;
            return p;
        };

        const t1Data = GameState.teams.team1.value;
        const t2Data = GameState.teams.team2.value;

        const p1 = t1Data ? boostPlayer(t1Data.players) : null;
        const p2 = t2Data ? boostPlayer(t2Data.players) : null;

        if (p1 && p2) {
            console.log(`🔥 Match Winners (Boosted): ${p1.name} & ${p2.name}`);
            this.addCommentary(`Experts are keeping a close eye on ${p1.name.split(' ').pop()} and ${p2.name.split(' ').pop()} today - they looked in supreme touch during the warmups!`, "info");
        }
        // ----------------------------------------

        GameState.view.value = "live";
        GameState.isRunning.value = true;
        this.loop();
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

        // Full State Cleanup
        GameState.tossResult.value = "";
        GameState.battingTeamName.value = "";
        GameState.bowlingTeamName.value = "";
        GameState.battingSquad.value = [];
        GameState.bowlingSquad.value = [];
        GameState.lastMilestone.value = null;

        // Missing Resets
        GameState.allOut.value = false;
        GameState.overRuns.value = 0;
        GameState.lastOverWasMaiden.value = false;
        GameState.nextBatterIndex.value = 2;
    }

    resetPlayerStats() {
        // Helper to zero out all stats for a fresh start with same teams
        const resetStats = (p: Player) => {
            p.batStats = { runs: 0, balls: 0, fours: 0, sixes: 0, out: false };
            p.bowlStats = { runsConceded: 0, wicketsTaken: 0, maidens: 0, balls: 0 };
        };

        if (GameState.teams.team1.value) GameState.teams.team1.value.players.forEach(resetStats);
        if (GameState.teams.team2.value) GameState.teams.team2.value.players.forEach(resetStats);
    }

    // Override rematch to include player reset
    rematch() {
        this.stopMatch();
        this.resetToConfig();
        this.resetPlayerStats();
        this.performToss();
        GameState.isRunning.value = true;
        this.loop();
    }

    switchInnings() {
        this.stopMatch();

        // Save History
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

        // Aggregate Scores (Test Match Logic)
        if (GameState.innings.value % 2 !== 0) GameState.totalTeam1Score.value += GameState.score.value;
        else GameState.totalTeam2Score.value += GameState.score.value;

        // Innings Victory Check (Test)
        if (GameState.format.value === 'TEST' && GameState.innings.value === 3) {
            const lead = GameState.totalTeam1Score.value - GameState.totalTeam2Score.value;
            if (lead < 0) {
                const margin = Math.abs(lead);
                if (lead < 0) {
                    this.endMatch(`${GameState.teams.team2Name.value} WINS by an innings and ${margin} runs!`);
                    return;
                }
            }
        }

        GameState.innings.value++;

        // Target Logic
        if (GameState.format.value !== 'TEST' && GameState.innings.value === 2) {
            const t1Score = GameState.score.value;
            GameState.target.value = t1Score + 1;
        }

        // Reset State
        GameState.score.value = 0;
        GameState.wickets.value = 0;
        GameState.balls.value = 0;
        GameState.allOut.value = false;
        GameState.overRuns.value = 0;
        GameState.lastOverWasMaiden.value = false;
        GameState.overRuns.value = 0; // Duplicate, kept for safety
        GameState.lastOverWasMaiden.value = false; // Duplicate
        GameState.nextBatterIndex.value = 2;
        GameState.inningsTimeline.value = [];
        GameState.winProbability.value = 50;

        // Swap Teams
        const oldBat = GameState.battingSquad.value;
        const oldBowl = GameState.bowlingSquad.value;
        const oldBatName = GameState.battingTeamName.value;
        const oldBowlName = GameState.bowlingTeamName.value;

        GameState.battingSquad.value = oldBowl;
        GameState.bowlingSquad.value = oldBat;
        GameState.battingTeamName.value = oldBowlName;
        GameState.bowlingTeamName.value = oldBatName;

        // Reset Player Stats
        GameState.battingSquad.value.forEach((p: Player) => p.batStats = { runs: 0, balls: 0, fours: 0, sixes: 0, out: false });
        GameState.bowlingSquad.value.forEach((p: Player) => p.bowlStats = { runsConceded: 0, wicketsTaken: 0, maidens: 0, balls: 0 });

        // Init Strikers
        GameState.striker.value = GameState.battingSquad.value[0];
        GameState.nonStriker.value = GameState.battingSquad.value[1];

        this.selectBestBowler();

        // Resume
        setTimeout(() => {
            GameState.isRunning.value = true;
            this.loop();
        }, 2000);
    }

    endMatch(msg: string) {
        this.stopMatch();
        GameState.matchResult.value = msg;
        // Save final history
        GameState.history.value = [...GameState.history.value, {
            team: GameState.battingTeamName.value,
            score: GameState.score.value,
            wickets: GameState.wickets.value,
            overs: GameState.balls.value,
            batting: JSON.parse(JSON.stringify(GameState.battingSquad.value)),
            bowling: JSON.parse(JSON.stringify(GameState.bowlingSquad.value)),
            timeline: JSON.parse(JSON.stringify(GameState.inningsTimeline.value))
        }];
        setTimeout(() => {
            GameState.view.value = "result";
        }, 3000);
    }

    checkGameStatus() {
        // Explicitly get format-specific config
        const format = GameState.format.value;
        const config = GameState.formatConfigs[format];
        const balls = GameState.balls.value;
        const wickets = GameState.wickets.value;
        const score = GameState.score.value;
        const target = GameState.target.value;
        const inn = GameState.innings.value;
        const inningsEnded = GameState.allOut.value || wickets >= 10 || balls >= config.balls;

        // Test Match Logic
        if (format === 'TEST') {
            if (inn === 4) {
                const lead = GameState.totalTeam1Score.value - GameState.totalTeam2Score.value;
                // If Team 2 (batting now) passes lead
                if (score > lead) {
                    this.endMatch(`${GameState.battingTeamName.value} WINS by ${10 - wickets} wickets!`);
                    return;
                }
                if (inningsEnded) {
                    if (score < lead) this.endMatch(`${GameState.bowlingTeamName.value} WINS by ${lead - score} runs!`);
                    else if (score === lead) this.endMatch("MATCH TIED!");
                    else this.endMatch("MATCH DRAWN!"); // Time/Overs up
                    return;
                }
            } else {
                if (inningsEnded) {
                    this.addCommentary(`End of Innings ${inn}.`, "intro");
                    this.switchInnings();
                }
            }
            return;
        }

        // Limited Overs Logic
        if (inn === 1) {
            if (inningsEnded) {
                this.addCommentary("End of 1st Innings.", "intro");
                this.switchInnings();
            }
        } else if (inn === 2) {
            if (target && score >= target) {
                this.endMatch(`${GameState.battingTeamName.value} WINS by ${10 - wickets} wickets!`);
            } else if (inningsEnded) {
                if (target && score === target - 1) this.endMatch("MATCH TIED!");
                else if (target) this.endMatch(`${GameState.bowlingTeamName.value} WINS by ${target - 1 - score} runs!`);
            }
        }
    }

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
        const crr = current / (ballsThrown / 6 || 1);
        const momentum = Math.max(0.8, Math.min(1.2, crr / rrr));

        let finalProb = baseProb * resourceFactor * momentum;

        // Clamp
        finalProb = Math.min(99, Math.max(1, finalProb));

        GameState.winProbability.value = Math.round(finalProb);
    }

    setSpeed(val: number) {
        GameState.speed.value = val;
    }

    getDelay() {
        const val = GameState.speed.value;
        const delay = 2020 - (val * 19.7);
        return Math.max(50, delay);
    }

    loop() {
        if (!GameState.isRunning.value) return;
        this.playBall();
        if (GameState.matchResult.value) return;

        const delay = this.getDelay() * (this.pauseMultiplier || 1);
        this.pauseMultiplier = 1; // Reset for next ball
        this.timer = setTimeout(() => this.loop(), delay);
    }

    playBall() {
        const batter = GameState.striker.value;
        const bowlerObj = GameState.bowlingSquad.value.find((p: Player) => p.name === GameState.bowler.value);
        const format = GameState.format.value;
        const config = GameState.formatConfigs[format]; // Now correctly typed via GameState
        const pitch = GameState.pitch.value;

        // Weights: [0, 1, 2, 4, 6, W]
        let weights = [35, 30, 10, 15, 5, 5];

        let batterSkill = batter.battingSkill || 75;
        let batterAggression = (batter as any).aggression || 70;
        let bowlerSkill = bowlerObj?.bowlingSkill || 75;
        let bowlerEconomy = (bowlerObj as any)?.economy || 8.0;

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
        const b = GameState.balls.value;
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
        const outcomes = [0, 1, 2, 4, 6, 'W'];
        let total = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        let result = outcomes[0];
        for (let i = 0; i < weights.length; i++) {
            if (r < weights[i]) { result = outcomes[i]; break; }
            r -= weights[i];
        }

        this.updateState(result);
    }

    updateState(res: number | string) {
        GameState.balls.value++;

        // Bowler
        const bowlerObj = GameState.bowlingSquad.value.find((p: Player) => p.name === GameState.bowler.value);
        if (bowlerObj) {
            bowlerObj.bowlStats.balls++;
            if (typeof res === 'number') {
                bowlerObj.bowlStats.runsConceded += res;
                GameState.overRuns.value += res;
            }
            if (res === 'W') bowlerObj.bowlStats.wicketsTaken++;
        } else {
            console.error(`Bowler not found: ${GameState.bowler.value}`);
            // Force re-select for next ball
            this.selectBestBowler();
        }

        // Striker
        const striker = GameState.striker.value;
        striker.batStats.balls++;

        if (res === 'W') {
            if (typeof window !== 'undefined') window.navigator.vibrate?.([40, 30, 40]);
            striker.batStats.out = true;
            GameState.wickets.value++;
            this.addCommentary(this.commentary.getCommentary('W', GameState, GameState.bowler.value, striker.name), 'wicket');

            if (GameState.nextBatterIndex.value < GameState.battingSquad.value.length) {
                // Pause for dramatic effect
                this.pauseMultiplier = 4;

                // Get next batter name for preview
                const nextBatter = GameState.battingSquad.value[GameState.nextBatterIndex.value];
                if (nextBatter) { // TS check for undefined
                    this.addCommentary(this.commentary.getNewBatterCommentary(nextBatter.name), 'intro');
                }

                // Occasional situation update
                if (Math.random() > 0.7) {
                    this.addCommentary(this.commentary.getSituationCommentary(), 'info');
                }

                const next = GameState.battingSquad.value[GameState.nextBatterIndex.value++];
                GameState.striker.value = next;
            } else {
                GameState.allOut.value = true;
            }
        } else {
            // It's a run or boundary
            const runVal = typeof res === 'number' ? res : 0;
            GameState.score.value += runVal;
            const oldRuns = striker.batStats.runs;
            striker.batStats.runs += runVal;
            const newRuns = striker.batStats.runs;

            if (oldRuns < 50 && newRuns >= 50) this.addCommentary(this.commentary.getMilestoneCommentary('fifty', striker.name), 'milestone');
            if (oldRuns < 100 && newRuns >= 100) this.addCommentary(this.commentary.getMilestoneCommentary('century', striker.name), 'milestone');

            if (res === 4) {
                if (typeof window !== 'undefined') window.navigator.vibrate?.([40]);
                striker.batStats.fours++;
                this.addCommentary(this.commentary.getCommentary(4, GameState, GameState.bowler.value, striker.name), 'four');
            } else if (res === 6) {
                if (typeof window !== 'undefined') window.navigator.vibrate?.([40, 30, 40]);
                striker.batStats.sixes++;
                this.addCommentary(this.commentary.getCommentary(6, GameState, GameState.bowler.value, striker.name), 'six');
            } else if (res === 0) {
                this.addCommentary(this.commentary.getCommentary(0, GameState, GameState.bowler.value, striker.name), 'dot');
            } else {
                this.addCommentary(this.commentary.getCommentary(res, GameState, GameState.bowler.value, striker.name), 'run');
            }

            if (runVal % 2 !== 0) this.swapBatters();
        }

        GameState.timeline.value = [res, ...GameState.timeline.value].slice(0, 12);

        if (GameState.balls.value % 6 === 0) {
            // Record Graph Data
            GameState.inningsTimeline.value = [
                ...GameState.inningsTimeline.value,
                {
                    over: GameState.balls.value / 6,
                    score: GameState.score.value,
                    wickets: GameState.wickets.value
                }
            ];
            // Recalculate Win Prob 
        }

        // Recalculate every ball
        this.calculateWinProbability();

        if (GameState.overRuns.value === 0 && !GameState.allOut.value && GameState.balls.value > 0 && GameState.balls.value % 6 === 0) {
            // Check balls > 0 to prevent 0.0 maiden glitch
            if (bowlerObj) bowlerObj.bowlStats.maidens++;
            this.addCommentary(this.commentary.getMaidenCommentary(), 'maiden');
        }

        if (GameState.balls.value > 0 && GameState.balls.value % 6 === 0) {
            GameState.overRuns.value = 0;
            this.swapBatters();
            this.selectBestBowler();
        }

        this.checkGameStatus();
    }

    swapBatters() {
        const s = GameState.striker.value;
        const ns = GameState.nonStriker.value;
        GameState.striker.value = ns;
        GameState.nonStriker.value = s;
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

    addCommentary(text: string | null | undefined, type: CommentaryEntry['type']) {
        if (!text) return;

        const b = GameState.balls.value;
        const ballIndex = b > 0 ? b - 1 : 0;
        const overStr = `${Math.floor(ballIndex / 6)}.${(ballIndex % 6) + 1}`;

        const entry: CommentaryEntry = {
            id: Date.now() + Math.random(),
            text,
            type,
            over: overStr
        };
        GameState.commentary.value = [entry, ...GameState.commentary.value];
    }
}
