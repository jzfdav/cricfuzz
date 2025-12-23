import { GameState } from "./GameState";
import { CommentaryEngine } from "../commentary.js";

export class GameEngine {
    constructor() {
        this.commentary = new CommentaryEngine();
        this.timer = null;
    }

    /* --- SETUP & TOSS --- */

    async loadTeams(t1Id, t2Id) {
        const baseUrl = import.meta.env.BASE_URL;
        const [d1, d2] = await Promise.all([
            fetch(`${baseUrl}teams/${t1Id}.json`).then(r => r.json()),
            fetch(`${baseUrl}teams/${t2Id}.json`).then(r => r.json())
        ]);

        const initStats = (p) => ({
            ...p,
            batStats: { runs: 0, balls: 0, fours: 0, sixes: 0, out: false },
            bowlStats: { runsConceded: 0, wicketsTaken: 0, maidens: 0, balls: 0 }
        });

        // Initialize and Sort by Batting Skill
        const p1 = d1.players.map(initStats).sort((a, b) => (b.battingSkill || 0) - (a.battingSkill || 0));
        const p2 = d2.players.map(initStats).sort((a, b) => (b.battingSkill || 0) - (a.battingSkill || 0));

        GameState.teams.team1Name.value = d1.name;
        GameState.teams.team2Name.value = d2.name;
        GameState.teams.team1.value = p1;
        GameState.teams.team2.value = p2;
    }

    performToss(t1Id, t2Id) {
        // Random Pitch
        const pitches = ["Flat", "Green", "Dusty", "Balanced"];
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
        let batSquad, bowlSquad, batName, bowlName;
        if ((winnerIdx === 1 && decision === "BAT") || (winnerIdx === 2 && decision === "BOWL")) {
            batSquad = GameState.teams.team1.value;
            bowlSquad = GameState.teams.team2.value;
            batName = GameState.teams.team1Name.value;
            bowlName = GameState.teams.team2Name.value;
        } else {
            batSquad = GameState.teams.team2.value;
            bowlSquad = GameState.teams.team1.value;
            batName = GameState.teams.team2Name.value;
            bowlName = GameState.teams.team1Name.value;
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

    startMatch(t1, t2, format) {
        if (t1) GameState.teams.team1.value = null; // Reset if new

        // --- Match Winner Mechanic (X-Factor) ---
        const boostPlayer = (squad) => {
            if (!squad || squad.length === 0) return null;
            const p = squad[Math.floor(Math.random() * squad.length)];
            const factor = 1 + (Math.random() * 0.2 + 0.1); // 1.10 to 1.30
            const ecoFactor = 1 - (Math.random() * 0.2 + 0.1); // 0.90 to 0.70 (Lower is better)

            p.battingSkill = Math.floor((p.battingSkill || 75) * factor);
            p.bowlingSkill = Math.floor((p.bowlingSkill || 75) * factor);
            p.aggression = Math.floor((p.aggression || 75) * factor);
            p.economy = (p.economy || 8.0) * ecoFactor;
            return p;
        };

        const p1 = boostPlayer(GameState.teams.team1.value);
        const p2 = boostPlayer(GameState.teams.team2.value);

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
        GameState.totalTeam1Score.value = 0;
        GameState.totalTeam2Score.value = 0;
        GameState.target.value = null;
        // Missing Resets
        GameState.allOut.value = false;
        GameState.overRuns.value = 0;
        GameState.lastOverWasMaiden.value = false;
        GameState.nextBatterIndex.value = 2;
    }

    switchInnings() {
        this.stopMatch();

        // Save History
        const entry = {
            team: GameState.battingTeamName.value,
            score: GameState.score.value,
            wickets: GameState.wickets.value,
            overs: GameState.balls.value,
            batting: JSON.parse(JSON.stringify(GameState.battingSquad.value)),
            bowling: JSON.parse(JSON.stringify(GameState.bowlingSquad.value))
        };
        GameState.history.value = [...GameState.history.value, entry];

        // Aggregate Scores (Test Match Logic)
        if (GameState.innings.value % 2 !== 0) GameState.totalTeam1Score.value += GameState.score.value;
        else GameState.totalTeam2Score.value += GameState.score.value;

        // Innings Victory Check (Test)
        if (GameState.format.value === 'TEST' && GameState.innings.value === 3) {
            const lead = GameState.totalTeam1Score.value - GameState.totalTeam2Score.value;
            if (lead < 0) { // Team 2 leads after 3 innings means Team 1 (bowling now) failed
                // Actually logic in main.js was: lead = t1 - t2. if lead < 0, T2 wins by innings.
                // Wait, logic depends on who batted first.
                // Simplified: If batting team (Team 1) is still behind Team 2's first innings score after their second innings...
                // main.js logic: `const lead = this.state.totalTeam1Score - this.state.totalTeam2Score; if (lead < 0) Win...`
                // We'll preserve strict main.js logic here if possible, or just standard flow.
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
        GameState.nextBatterIndex.value = 2;

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
        GameState.battingSquad.value.forEach(p => p.batStats = { runs: 0, balls: 0, fours: 0, sixes: 0, out: false });
        GameState.bowlingSquad.value.forEach(p => p.bowlStats = { runsConceded: 0, wicketsTaken: 0, maidens: 0, balls: 0 });

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

    endMatch(msg) {
        this.stopMatch();
        GameState.matchResult.value = msg;
        // Save final history
        GameState.history.value = [...GameState.history.value, {
            team: GameState.battingTeamName.value,
            score: GameState.score.value,
            wickets: GameState.wickets.value,
            overs: GameState.balls.value,
            batting: JSON.parse(JSON.stringify(GameState.battingSquad.value)),
            bowling: JSON.parse(JSON.stringify(GameState.bowlingSquad.value))
        }];
        setTimeout(() => {
            GameState.view.value = "result";
        }, 3000);
    }

    checkGameStatus() {
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
                if (score === target - 1) this.endMatch("MATCH TIED!");
                else this.endMatch(`${GameState.bowlingTeamName.value} WINS by ${target - 1 - score} runs!`);
            }
        }
    }

    setSpeed(val) {
        GameState.speed.value = val;
    }

    getDelay() {
        // 1 -> 2000ms, 100 -> 50ms
        const val = GameState.speed.value;
        const delay = 2020 - (val * 19.7);
        return Math.max(50, delay);
    }

    loop() {
        if (!GameState.isRunning.value) return;
        this.playBall();
        if (GameState.matchResult.value) return;
        this.timer = setTimeout(() => this.loop(), this.getDelay());
    }

    playBall() {
        const batter = GameState.striker.value;
        const bowlerObj = GameState.bowlingSquad.value.find(p => p.name === GameState.bowler.value);
        const format = GameState.format.value;
        const config = GameState.formatConfigs[format];
        const pitch = GameState.pitch.value;

        // Weights: [0, 1, 2, 4, 6, W]
        let weights = [35, 30, 10, 15, 5, 5];

        let batterSkill = batter.battingSkill || 75;
        let batterAggression = batter.aggression || 70;
        let bowlerSkill = bowlerObj?.bowlingSkill || 75;
        let bowlerEconomy = bowlerObj?.economy || 8.0;

        // Pitch Modifiers
        if (pitch === "Flat") { batterSkill *= 1.1; bowlerSkill *= 0.9; }
        else if (pitch === "Green") { batterSkill *= 0.95; bowlerSkill *= 1.15; }
        else if (pitch === "Dusty") { batterSkill *= 0.9; bowlerSkill *= 1.1; }

        const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
        const skillFactor = clamp(batterSkill / 90, 0.6, 1.4);
        const aggFactor = clamp((batterAggression / 90) * config.aggMod, 0.5, 1.8);
        const bowlSkillFactor = clamp(bowlerSkill / 90, 0.6, 1.4);
        const ecoFactor = clamp((10 - bowlerEconomy) / 3, 0.4, 1.8);

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

    updateState(res) {
        GameState.balls.value++;

        // Bowler
        const bowlerObj = GameState.bowlingSquad.value.find(p => p.name === GameState.bowler.value);
        if (bowlerObj) {
            bowlerObj.bowlStats.balls++;
            if (typeof res === 'number') {
                bowlerObj.bowlStats.runsConceded += res;
                GameState.overRuns.value += res;
            }
            if (res === 'W') bowlerObj.bowlStats.wicketsTaken++;
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
                const next = GameState.battingSquad.value[GameState.nextBatterIndex.value++];
                GameState.striker.value = next;
            } else {
                GameState.allOut.value = true;
            }
        } else {
            GameState.score.value += res;
            const oldRuns = striker.batStats.runs;
            striker.batStats.runs += res;
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

            if (res % 2 !== 0) this.swapBatters();
        }

        GameState.timeline.value = [res, ...GameState.timeline.value].slice(0, 12);

        if (GameState.balls.value % 6 === 0) {
            if (GameState.overRuns.value === 0 && !GameState.allOut.value) {
                if (bowlerObj) bowlerObj.bowlStats.maidens++;
                this.addCommentary(this.commentary.getMaidenCommentary(), 'maiden');
            }
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

        const eligible = squad.filter(p => {
            if (p.role !== 'Bowler' && p.role !== 'All-Rounder') return false;
            if ((p.bowlStats.balls / 6) >= limit) return false;
            if (p.name === current) return false;
            return true;
        });

        const candidates = eligible.length ? eligible : squad.filter(p => p.name !== current);

        candidates.sort((a, b) => {
            return ((b.bowlingSkill || 0) + Math.random()) - ((a.bowlingSkill || 0) + Math.random());
        });

        if (candidates.length) GameState.bowler.value = candidates[0].name;
    }

    addCommentary(text, type) {
        // ... (standard implementation)
        if (!text) return;
        // Import computed helpers locally or assume GameState imports them if needed, 
        // but here we need to recalculate currentOver since we can't easily import computed in class
        // Actually we can import it.
        // For simplicity:
        const b = GameState.balls.value;
        const overStr = `${Math.floor(b / 6)}.${b % 6}`;

        const entry = {
            id: Date.now() + Math.random(),
            text,
            type,
            over: overStr // simplified
        };
        GameState.commentary.value = [entry, ...GameState.commentary.value];
    }
}
