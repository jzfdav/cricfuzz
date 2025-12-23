// CRICFUZZ ENGINE LOGIC
import './style.css';

const app = {
    teams: {
        team1: [],
        team2: [],
        batting: [],
        bowling: []
    },
    formatConfigs: {
        T20: { balls: 120, innings: 2, aggMod: 1.1, boundaryMod: 1.1, wicketMod: 1.1, dotMod: 0.9 },
        ODI: { balls: 300, innings: 2, aggMod: 1.0, boundaryMod: 1.0, wicketMod: 1.0, dotMod: 1.0 },
        TEST: { balls: 2400, innings: 4, aggMod: 0.6, boundaryMod: 0.7, wicketMod: 0.7, dotMod: 1.5 }
    },
    state: {
        score: 0, wickets: 0, balls: 0,
        striker: { name: "Striker", runs: 0, balls: 0 },
        nonStriker: { name: "Non-Striker", runs: 0, balls: 0 },
        bowler: "Bowler",
        battingTeam: "",
        bowlingTeam: "",
        target: null,
        innings: 1,
        nextBatterIndex: 2,
        isRunning: false, speed: 2000,
        format: "T20",
        totalTeam1Score: 0,
        totalTeam2Score: 0,
        history: [], // Stores scorecard for each innings
        allOut: false,
        overRuns: 0,
        lastOverWasMaiden: false
    },

    preventSameTeam(selectedVal, otherDropdownId) {
        const otherDropdown = document.getElementById(otherDropdownId);
        if (otherDropdown.value === selectedVal) {
            for (let option of otherDropdown.options) {
                if (option.value !== selectedVal) {
                    otherDropdown.value = option.value;
                    break;
                }
            }
        }
    },

    formatOvers(balls) {
        if (balls === 0) return "0.0";
        const over = Math.floor(balls / 6);
        const ball = balls % 6;
        if (ball === 0) return `${over - 1}.6`;
        return `${over}.${ball}`;
    },

    async startMatch() {
        const t1 = document.getElementById('team1').value;
        const t2 = document.getElementById('team2').value;
        const format = document.getElementById('match-format').value;

        this.state.format = format;
        this.state.battingTeam = t1.toUpperCase();
        this.state.bowlingTeam = t2.toUpperCase();

        this.state.innings = 1;
        this.state.target = null;
        this.state.score = 0;
        this.state.wickets = 0;
        this.state.balls = 0;
        this.state.nextBatterIndex = 2;
        this.state.totalTeam1Score = 0;
        this.state.totalTeam2Score = 0;
        this.state.history = [];
        this.state.allOut = false;
        this.state.overRuns = 0;
        this.state.lastOverWasMaiden = false;

        const targetEl = document.getElementById('target-display');
        targetEl.innerText = "1st INNINGS";
        targetEl.classList.remove('text-amber-500');
        targetEl.classList.add('text-gray-500');

        await this.loadTeams(t1, t2);

        document.getElementById('config-screen').classList.add('hidden');
        document.getElementById('live-screen').classList.remove('hidden');
        document.getElementById('results-screen').classList.add('hidden');
        this.state.isRunning = true;

        const speedVal = parseInt(document.getElementById('speed-slider').value);
        this.state.speed = speedVal;
        document.getElementById('live-speed-slider').value = speedVal;

        this.loop();
    },

    async loadTeams(t1, t2) {
        try {
            // Use Vite's BASE_URL to handle GitHub Pages base path correctly
            const baseUrl = import.meta.env.BASE_URL;
            const [team1Data, team2Data] = await Promise.all([
                fetch(`${baseUrl}teams/${t1}.json`).then(res => {
                    if (!res.ok) throw new Error(`Failed to load team ${t1}`);
                    return res.json();
                }),
                fetch(`${baseUrl}teams/${t2}.json`).then(res => {
                    if (!res.ok) throw new Error(`Failed to load team ${t2}`);
                    return res.json();
                })
            ]);

            const validateTeam = (data, id) => {
                if (!data || !Array.isArray(data.players) || data.players.length === 0) {
                    throw new Error(`Invalid data for team ${id}`);
                }
                return data;
            };

            const safeTeam1 = validateTeam(team1Data, t1);
            const safeTeam2 = validateTeam(team2Data, t2);

            const initPlayers = (players) => players.map(p => ({
                ...p,
                batStats: { runs: 0, balls: 0, fours: 0, sixes: 0, out: false },
                bowlStats: { runsConceded: 0, wicketsTaken: 0, maidens: 0, balls: 0 }
            }));

            this.teams.team1 = initPlayers(safeTeam1.players);
            this.teams.team2 = initPlayers(safeTeam2.players);
            this.teams.team1Name = safeTeam1.name || t1.toUpperCase();
            this.teams.team2Name = safeTeam2.name || t2.toUpperCase();

            // Innings 1: Team 1 bats
            this.teams.batting = this.teams.team1;
            this.teams.bowling = this.teams.team2;

            this.state.striker = this.teams.batting[0];
            this.state.nonStriker = this.teams.batting[1] || this.teams.batting[0];
            const defaultBowler = this.teams.bowling.find(p => p.role === 'Bowler' || p.role === 'All-Rounder') || this.teams.bowling[0];
            this.state.bowler = defaultBowler ? defaultBowler.name : "Bowler";
        } catch (err) {
            console.error(err);
            this.state.isRunning = false;
            alert("Failed to load team data. Please check team files and try again.");
            throw err;
        }
    },

    loop() {
        if (!this.state.isRunning) return;
        this.playBall();
        setTimeout(() => this.loop(), this.state.speed);
    },

    playBall() {
        const batter = this.state.striker;
        const bowler = this.teams.bowling.find(p => p.name === this.state.bowler);
        const config = this.formatConfigs[this.state.format];

        // Base weights: [0, 1, 2, 4, 6, W]
        let weights = [35, 30, 10, 15, 5, 5];

        // Defensive defaults so missing data never breaks the engine
        const batterAggression = typeof batter.aggression === 'number' ? batter.aggression : 70;
        const batterSkill = typeof batter.skill === 'number' ? batter.skill : 75;
        const bowlerSkill = bowler && typeof bowler.skill === 'number' ? bowler.skill : 75;
        const bowlerEconomy = bowler && typeof bowler.economy === 'number' ? bowler.economy : 8.0;

        // Clamp values into sane ranges
        const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
        const skillFactor = clamp(batterSkill / 90, 0.6, 1.4);
        const aggFactor = clamp((batterAggression / 90) * config.aggMod, 0.5, 1.8);
        const bowlSkillFactor = clamp(bowlerSkill / 90, 0.6, 1.4);
        const ecoRaw = (10 - bowlerEconomy) / 3;
        const ecoFactor = clamp(ecoRaw, 0.4, 1.8);

        // Format adjustments
        weights[0] *= config.dotMod;
        weights[3] *= config.boundaryMod;
        weights[4] *= config.boundaryMod;
        weights[5] *= config.wicketMod;

        // Batter Aggression
        weights[3] *= aggFactor;
        weights[4] *= aggFactor * 1.1;
        weights[5] *= aggFactor;

        // Batter Skill
        weights[0] /= skillFactor;
        weights[1] *= skillFactor;
        weights[5] /= skillFactor;

        // Bowler effect
        weights[0] *= ecoFactor;
        weights[3] /= ecoFactor;
        weights[4] /= ecoFactor;
        weights[5] *= bowlSkillFactor;

        const outcomes = [0, 1, 2, 4, 6, 'W'];
        const result = this.weightedRandom(outcomes, weights);
        const currentStrikerName = this.state.striker.name;

        this.updateState(result);
        this.render(result, currentStrikerName);
        this.state.lastOverWasMaiden = false; // Reset after render
        this.checkGameStatus();
    },

    weightedRandom(items, weights) {
        let total = 0;
        for (let w of weights) total += w;
        let random = Math.random() * total;
        for (let i = 0; i < items.length; i++) {
            if (random < weights[i]) return items[i];
            random -= weights[i];
        }
        return items[0];
    },

    updateState(res) {
        this.state.balls++;
        const currentBowlerObj = this.teams.bowling.find(p => p.name === this.state.bowler);

        // Update Bowler Stats
        if (currentBowlerObj) {
            currentBowlerObj.bowlStats.balls++;
            if (typeof res === 'number') {
                currentBowlerObj.bowlStats.runsConceded += res;
                this.state.overRuns += res;
            }
            if (res === 'W') currentBowlerObj.bowlStats.wicketsTaken++;
        }

        // Update Batter Stats
        this.state.striker.batStats.balls++;
        if (res === 'W') {
            this.state.striker.batStats.out = true;
            this.state.wickets++;
            if (this.state.nextBatterIndex < this.teams.batting.length) {
                const nextPlayer = this.teams.batting[this.state.nextBatterIndex++];
                this.state.striker = nextPlayer;
            } else {
                // All out - mark flag so checkGameStatus and render can handle cleanly
                this.state.allOut = true;
            }
        } else {
            this.state.score += res;
            this.state.striker.batStats.runs += res;
            if (res === 4) this.state.striker.batStats.fours++;
            if (res === 6) this.state.striker.batStats.sixes++;
            if (res % 2 !== 0) [this.state.striker, this.state.nonStriker] = [this.state.nonStriker, this.state.striker];
        }

        if (this.state.balls % 6 === 0) {
            if (this.state.overRuns === 0) {
                if (currentBowlerObj) currentBowlerObj.bowlStats.maidens++;
                this.state.lastOverWasMaiden = true;
            }
            this.state.overRuns = 0;

            if (!this.state.allOut && (res !== 'W' || this.state.wickets < 10)) {
                [this.state.striker, this.state.nonStriker] = [this.state.nonStriker, this.state.striker];
            }

            // Determine realistic bowling rotation with simple over limits
            const config = this.formatConfigs[this.state.format];
            let maxOversPerBowler = Infinity;
            if (this.state.format === 'T20') maxOversPerBowler = 4;
            else if (this.state.format === 'ODI') maxOversPerBowler = 10;

            const currentName = this.state.bowler;
            const eligible = this.teams.bowling.filter(b => {
                if (!(b.role === 'Bowler' || b.role === 'All-Rounder')) return false;
                const oversBowled = Math.floor((b.bowlStats.balls || 0) / 6);
                return oversBowled < maxOversPerBowler;
            });

            let candidates = eligible.length > 0 ? eligible : this.teams.bowling.filter(b => (b.role === 'Bowler' || b.role === 'All-Rounder'));

            // Prefer not to bowl the same bowler in consecutive overs if alternatives exist
            const nonCurrent = candidates.filter(b => b.name !== currentName);
            if (nonCurrent.length > 0) {
                candidates = nonCurrent;
            }

            if (candidates.length > 0) {
                this.state.bowler = candidates[Math.floor(Math.random() * candidates.length)].name;
            }
        }
    },

    saveInningsHistory() {
        this.state.history.push({
            innings: this.state.innings,
            team: this.state.innings % 2 !== 0 ? this.teams.team1Name : this.teams.team2Name,
            score: this.state.score,
            wickets: this.state.wickets,
            balls: this.state.balls,
            batsmen: JSON.parse(JSON.stringify(this.teams.batting)),
            bowlers: JSON.parse(JSON.stringify(this.teams.bowling))
        });
    },

    switchInnings() {
        this.state.isRunning = false;

        this.saveInningsHistory();

        if (this.state.innings % 2 !== 0) this.state.totalTeam1Score += this.state.score;
        else this.state.totalTeam2Score += this.state.score;

        // Test-match only: after the 3rd innings, check for an innings victory.
        if (this.state.format === 'TEST' && this.state.innings === 3) {
            const lead = this.state.totalTeam1Score - this.state.totalTeam2Score;
            if (lead >= 0) {
                // Team 1 leads or is level; Team 2 will bat last.
                // If Team 2 is already behind after three innings, they must chase in the 4th.
                // No special handling needed here.
            } else {
                // Team 2 already ahead on aggregate after three innings -> innings victory, no 4th innings.
                const margin = Math.abs(lead);
                const winner = this.teams.team2Name;
                this.endMatch(`${winner} WINS by an innings and ${margin} runs!`);
                return;
            }
        }

        let breakMsg = `INNINGS BREAK!`;
        if (this.state.format !== 'TEST' && this.state.innings === 1) {
            this.state.target = this.state.score + 1;
            breakMsg += ` Target: ${this.state.target}`;
        }

        const comm = document.createElement('div');
        comm.className = "p-3 bg-blue-600 text-white font-black text-center uppercase tracking-widest rounded mb-4";
        comm.innerText = breakMsg;
        document.getElementById('commentary-feed').prepend(comm);

        setTimeout(() => {
            this.state.innings++;
            this.state.score = 0;
            this.state.wickets = 0;
            this.state.balls = 0;
            this.state.nextBatterIndex = 2;
            this.state.allOut = false;
            this.state.overRuns = 0;
            this.state.lastOverWasMaiden = false;

            // Swap Teams
            [this.teams.batting, this.teams.bowling] = [this.teams.bowling, this.teams.batting];
            [this.state.battingTeam, this.state.bowlingTeam] = [this.state.bowlingTeam, this.state.battingTeam];

            // Reset player stats for the new innings
            this.teams.batting.forEach(p => p.batStats = { runs: 0, balls: 0, fours: 0, sixes: 0, out: false });
            this.teams.bowling.forEach(p => p.bowlStats = { runsConceded: 0, wicketsTaken: 0, maidens: 0, balls: 0 });

            this.state.striker = this.teams.batting[0];
            this.state.nonStriker = this.teams.batting[1];
            const defaultBowler = this.teams.bowling.find(p => p.role === 'Bowler' || p.role === 'All-Rounder');
            this.state.bowler = defaultBowler ? defaultBowler.name : (this.teams.bowling[0]?.name || "Bowler");

            this.state.isRunning = true;
            this.loop();
        }, 2000);
    },

    checkGameStatus() {
        const config = this.formatConfigs[this.state.format];
        const isLastInnings = this.state.innings === config.innings;
        const inningsEnded = this.state.allOut || this.state.wickets >= 10 || this.state.balls >= config.balls;

        if (this.state.format !== 'TEST' && this.state.innings === 2) {
            if (this.state.score >= this.state.target) {
                this.endMatch(`${this.state.battingTeam} WINS by ${10 - this.state.wickets} wickets!`);
                return;
            }
            if (inningsEnded) {
                if (this.state.score === this.state.target - 1) this.endMatch("MATCH TIED!");
                else this.endMatch(`${this.state.bowlingTeam} WINS by ${this.state.target - 1 - this.state.score} runs!`);
                return;
            }
        }

        if (this.state.format === 'TEST' && this.state.innings === 4) {
            const lead = this.state.totalTeam1Score - this.state.totalTeam2Score;
            if (this.state.score > lead) {
                this.endMatch(`${this.state.battingTeam} WINS by ${10 - this.state.wickets} wickets!`);
                return;
            }
            if (inningsEnded) {
                if (this.state.score < lead) this.endMatch(`${this.state.bowlingTeam} WINS by ${lead - this.state.score} runs!`);
                else if (this.state.score === lead) this.endMatch("MATCH TIED!");
                else this.endMatch("MATCH DRAWN!");
                return;
            }
        }

        if (inningsEnded && !isLastInnings) {
            this.switchInnings();
        }
    },

    endMatch(msg) {
        this.state.isRunning = false;
        this.saveInningsHistory();

        const comm = document.createElement('div');
        comm.className = "p-3 bg-amber-500 text-black font-black text-center uppercase tracking-widest rounded mb-4";
        comm.innerText = msg;
        document.getElementById('commentary-feed').prepend(comm);

        setTimeout(() => {
            this.showResults(msg);
        }, 3000);
    },

    resetToConfig() {
        // Reset core state
        this.state.score = 0;
        this.state.wickets = 0;
        this.state.balls = 0;
        this.state.striker = { name: "Striker", runs: 0, balls: 0 };
        this.state.nonStriker = { name: "Non-Striker", runs: 0, balls: 0 };
        this.state.bowler = "Bowler";
        this.state.battingTeam = "";
        this.state.bowlingTeam = "";
        this.state.target = null;
        this.state.innings = 1;
        this.state.nextBatterIndex = 2;
        this.state.isRunning = false;
        this.state.totalTeam1Score = 0;
        this.state.totalTeam2Score = 0;
        this.state.history = [];
        this.state.allOut = false;
        this.state.overRuns = 0;
        this.state.lastOverWasMaiden = false;

        // Clear UI sections that are dynamically populated
        document.getElementById('timeline').innerHTML = "";
        document.getElementById('commentary-feed').innerHTML = "";
        document.getElementById('scorecard-container').innerHTML = "";
        document.getElementById('result-message').innerText = "";
        document.getElementById('match-description').innerText = "";

        // Reset basic displays
        document.getElementById('score-display').innerText = "0-0";
        document.getElementById('overs-display').innerText = "0.0 OVERS";
        document.getElementById('target-display').innerText = "1st INNINGS";
        document.getElementById('target-display').classList.remove('text-amber-500');
        document.getElementById('target-display').classList.add('text-gray-500');
        document.getElementById('rr-display').innerText = "RR: 0.00";
        document.getElementById('striker').innerText = "Striker...";
        document.getElementById('non-striker').innerText = "Non-Striker...";
        document.getElementById('bowler').innerText = "Bowler Name";

        // Return to config screen
        document.getElementById('live-screen').classList.add('hidden');
        document.getElementById('results-screen').classList.add('hidden');
        document.getElementById('config-screen').classList.remove('hidden');
    },

    showResults(msg) {
        document.getElementById('live-screen').classList.add('hidden');
        document.getElementById('results-screen').classList.remove('hidden');
        document.getElementById('result-message').innerText = msg;

        // Calculate total maidens for description
        let totalMaidens = 0;
        this.state.history.forEach(inn => {
            inn.bowlers.forEach(p => totalMaidens += (p.bowlStats.maidens || 0));
        });
        // Dynamic summary
        let topPerformer = null;
        let maxImpact = -1;

        this.state.history.forEach(inn => {
            inn.batsmen.forEach(p => {
                if (p.batStats.runs > maxImpact) {
                    maxImpact = p.batStats.runs;
                    topPerformer = { name: p.name, stat: `${p.batStats.runs}(${p.batStats.balls})`, type: 'bat' };
                }
            });
            inn.bowlers.forEach(p => {
                const bowlImpact = (p.bowlStats.wicketsTaken * 25) + (p.bowlStats.maidens * 15) - p.bowlStats.runsConceded;
                if (bowlImpact > maxImpact) {
                    maxImpact = bowlImpact;
                    let statStr = `${p.bowlStats.wicketsTaken}/${p.bowlStats.runsConceded}`;
                    if (p.bowlStats.maidens > 0) statStr += ` (${p.bowlStats.maidens}m)`;
                    topPerformer = { name: p.name, stat: statStr, type: 'bowl' };
                }
            });
        });

        let description = `A thrilling ${this.state.format} encounter between ${this.teams.team1Name} and ${this.teams.team2Name}. `;
        if (totalMaidens > 0) description += `Defensive pressure was key with ${totalMaidens} maiden over${totalMaidens > 1 ? 's' : ''} bowled. `;
        if (topPerformer) {
            description += `${topPerformer.name}'s ${topPerformer.stat} was the standout performance of the match.`;
        }
        document.getElementById('match-description').innerText = description;

        this.renderScorecard();
    },

    renderScorecard() {
        const container = document.getElementById('scorecard-container');
        container.innerHTML = "";

        this.state.history.forEach((inn) => {
            const innDiv = document.createElement('div');
            innDiv.className = "bg-[#161B22] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl transition-all hover:border-gray-600 mb-6";

            const header = `
                <div class="bg-gradient-to-r from-gray-800/80 to-transparent p-4 border-b border-gray-700 flex justify-between items-center">
                    <div>
                        <h3 class="font-black text-amber-500 uppercase tracking-widest text-[10px] mb-1">${inn.team}</h3>
                        <p class="text-[9px] text-gray-500 uppercase font-bold">${inn.innings}${this.getOrdinal(inn.innings)} INNINGS</p>
                    </div>
                    <div class="text-right">
                        <span class="mono font-black text-2xl text-white">${inn.score}/${inn.wickets}</span>
                        <p class="text-[10px] text-gray-500 mono">${this.formatOvers(inn.balls)} OVS</p>
                    </div>
                </div>
            `;

            let batsmenRows = inn.batsmen.filter(b => b.batStats.balls > 0 || b.batStats.out).map(b => {
                const isTop = b.batStats.runs >= 30;
                return `
                <div class="grid grid-cols-6 p-4 border-b border-gray-800/50 text-xs items-center hover:bg-gray-800/30">
                    <div class="col-span-3">
                        <p class="font-bold ${isTop ? 'text-amber-400' : 'text-white'}">${b.name} ${!b.batStats.out ? '*' : ''}</p>
                        <p class="text-[9px] ${b.batStats.out ? 'text-red-900/80 font-bold' : 'text-emerald-500/80 font-bold'} uppercase mt-0.5">${b.batStats.out ? 'out' : 'not out'}</p>
                    </div>
                    <div class="text-right font-black text-lg ${isTop ? 'text-amber-500' : 'text-gray-300'}">${b.batStats.runs}</div>
                    <div class="text-right text-gray-500 mono">${b.batStats.balls}</div>
                    <div class="text-right text-gray-500 mono font-bold">${((b.batStats.runs / b.batStats.balls) * 100 || 0).toFixed(0)}</div>
                </div>
            `}).join('');

            let bowlersRows = inn.bowlers.filter(b => b.bowlStats.balls > 0).map(b => {
                const isTop = b.bowlStats.wicketsTaken >= 2 || b.bowlStats.maidens >= 1;
                const isElite = b.bowlStats.maidens >= 2;
                return `
                <div class="grid grid-cols-6 p-4 border-b border-gray-800/50 text-xs bg-gray-900/30 items-center hover:bg-gray-800/50 transition-colors">
                    <div class="col-span-2 font-bold ${isTop ? 'text-emerald-400' : 'text-gray-400'}">${b.name}</div>
                    <div class="text-right text-gray-500 mono">${this.formatOvers(b.bowlStats.balls)}</div>
                    <div class="text-right ${isElite ? 'text-emerald-500 font-bold' : 'text-gray-500'} mono">${b.bowlStats.maidens}</div>
                    <div class="text-right text-gray-500 mono">${b.bowlStats.runsConceded}</div>
                    <div class="text-right font-black text-lg ${isTop ? 'text-emerald-500' : 'text-gray-400'}">${b.bowlStats.wicketsTaken}</div>
                </div>
            `}).join('');

            innDiv.innerHTML = `
                ${header}
                <div class="bg-gray-900/50 text-[10px] uppercase tracking-[0.2em] font-black text-gray-600 grid grid-cols-6 px-4 py-3 border-b border-gray-800">
                    <div class="col-span-3">Batter</div>
                    <div class="text-right">R</div>
                    <div class="text-right">B</div>
                    <div class="text-right">SR</div>
                </div>
                ${batsmenRows}
                <div class="bg-gray-900/50 text-[10px] uppercase tracking-[0.2em] font-black text-gray-600 grid grid-cols-6 px-4 py-3 border-b border-gray-800">
                    <div class="col-span-2">Bowler</div>
                    <div class="text-right">O</div>
                    <div class="text-right">M</div>
                    <div class="text-right">R</div>
                    <div class="text-right">W</div>
                </div>
                ${bowlersRows}
            `;
            container.appendChild(innDiv);
        });
    },

    render(res, batterName) {
        if (res === 'W' || res === 4 || res === 6) window.navigator.vibrate?.([40, 30, 40]);

        document.getElementById('score-display').innerText = `${this.state.score}-${this.state.wickets}`;
        document.getElementById('overs-display').innerText = `${this.formatOvers(this.state.balls)} OVERS`;

        const targetEl = document.getElementById('target-display');
        let inningsText = `${this.state.innings}${this.getOrdinal(this.state.innings)} INNINGS`;
        if (this.state.format !== 'TEST' && this.state.innings === 2) {
            targetEl.innerText = `TARGET: ${this.state.target}`;
            targetEl.classList.replace('text-gray-500', 'text-amber-500');
        } else {
            targetEl.innerText = inningsText;
            targetEl.classList.replace('text-amber-500', 'text-gray-500');
        }

        const rr = this.state.balls > 0 ? (this.state.score / (this.state.balls / 6)).toFixed(2) : "0.00";
        document.getElementById('rr-display').innerText = `RR: ${rr}`;
        document.getElementById('bowler').innerText = this.state.bowler;

        const strikerEl = document.getElementById('striker');
        const nonStrikerEl = document.getElementById('non-striker');
        if (this.state.allOut || this.state.wickets >= 10) {
            strikerEl.innerText = `Innings complete`;
            nonStrikerEl.innerText = ``;
        } else {
            strikerEl.innerText = `${this.state.striker.name}* ${this.state.striker.batStats.runs}(${this.state.striker.batStats.balls})`;
            nonStrikerEl.innerText = `${this.state.nonStriker.name} ${this.state.nonStriker.batStats.runs}(${this.state.nonStriker.batStats.balls})`;
        }

        const pill = document.createElement('span');
        pill.className = `px-3 py-1 rounded mono text-xs animate-ball ${res === 'W' ? 'bg-red-600' : res >= 4 ? 'bg-emerald-600' : 'bg-gray-700'}`;
        pill.innerText = res;
        const timeline = document.getElementById('timeline');
        timeline.prepend(pill);

        const comm = document.createElement('div');
        comm.className = "p-3 border-l-2 border-gray-800 text-sm animate-ball";
        comm.innerHTML = `<span class="text-gray-500 mono mr-2">${this.formatOvers(this.state.balls)}</span> 
                                      <strong>${this.state.bowler} to ${batterName}</strong>, 
                                      ${res === 'W' ? 'OUT! Massive wicket!' : res + ' runs. Shot! '}`;
        document.getElementById('commentary-feed').prepend(comm);

        if (this.state.lastOverWasMaiden) {
            const maidenComm = document.createElement('div');
            maidenComm.className = "p-3 bg-emerald-600/20 border-l-4 border-emerald-500 text-sm font-bold animate-ball text-emerald-400 italic mt-2";
            maidenComm.innerText = `MAIDEN OVER! Brilliant stuff from ${this.state.bowler}.`;
            document.getElementById('commentary-feed').prepend(maidenComm);
        }
    },

    getOrdinal(n) {
        let s = ["th", "st", "nd", "rd"], v = n % 100;
        return (s[(v - 20) % 10] || s[v] || s[0]);
    }
};

// Expose app globally for inline event handlers
window.app = app;