import { signal, computed } from "@preact/signals";

export const GameState = {
    // Configuration
    format: signal("T20"),
    pitch: signal("Balanced"),
    teams: {
        team1: signal(null), // { name, players: [] }
        team2: signal(null),
        team1Name: signal(""),
        team2Name: signal(""),
    },

    // Configs
    formatConfigs: {
        T20: { balls: 120, innings: 2, aggMod: 1.1, boundaryMod: 1.1, wicketMod: 1.1, dotMod: 0.9 },
        ODI: { balls: 300, innings: 2, aggMod: 0.80, boundaryMod: 0.75, wicketMod: 0.9, dotMod: 1.5 },
        TEST: { balls: 2400, innings: 4, aggMod: 0.6, boundaryMod: 0.7, wicketMod: 0.7, dotMod: 1.5 },
        phases: {
            T20: [
                { name: "Powerplay", start: 0, end: 5, agg: 1.2, bound: 1.2, wick: 1.0, dot: 1.1 },
                { name: "Middle Overs", start: 6, end: 15, agg: 0.9, bound: 0.8, wick: 0.8, dot: 0.9 },
                { name: "Death Overs", start: 16, end: 20, agg: 1.4, bound: 1.3, wick: 1.5, dot: 0.8 }
            ],
            ODI: [
                { name: "Powerplay 1", start: 0, end: 9, agg: 1.1, bound: 1.0, wick: 1.2, dot: 1.1 },
                { name: "Powerplay 2", start: 10, end: 39, agg: 0.9, bound: 0.7, wick: 0.8, dot: 1.3 },
                { name: "Powerplay 3", start: 40, end: 49, agg: 1.5, bound: 1.4, wick: 1.5, dot: 0.8 }
            ],
            TEST: [] // No explicit phases for now
        }
    },

    // Dynamic Game State
    view: signal("config"), // config, live, result
    isRunning: signal(false),
    speed: signal(50), // 1-100 scale (UX Fix: 100=Fast, 1=Slow)

    totalTeam1Score: signal(0),
    totalTeam2Score: signal(0),

    innings: signal(1),
    score: signal(0),
    wickets: signal(0),
    balls: signal(0),
    target: signal(null),

    // Current Players
    striker: signal({ name: "Striker", batStats: { runs: 0, balls: 0, fours: 0, sixes: 0, out: false } }),
    nonStriker: signal({ name: "Non-Striker", batStats: { runs: 0, balls: 0, fours: 0, sixes: 0, out: false } }),
    bowler: signal("Bowler"),

    // Active Teams (Swapped based on toss/innings)
    battingTeamName: signal(""),
    bowlingTeamName: signal(""),
    battingSquad: signal([]),
    bowlingSquad: signal([]),

    // Events & History
    timeline: signal([]), // Array of recent ball results
    commentary: signal([]), // Array of { text, style } objects
    history: signal([]), // Past innings data
    inningsTimeline: signal([]), // [{ over, score, wickets }] for graph

    // Status Flags
    lastOverWasMaiden: signal(false),
    lastMilestone: signal(null),
    matchResult: signal(null),
    tossResult: signal(""),
    allOut: signal(false),
    overRuns: signal(0),
    nextBatterIndex: signal(2)
};

// Computed Helpers
export const currentOver = computed(() => {
    const b = GameState.balls.value;
    if (b === 0) return "0.0";
    const over = Math.floor(b / 6);
    const ball = b % 6;
    if (ball === 0) return `${over - 1}.6`;
    return `${over}.${ball}`;
});

export const runRate = computed(() => {
    const b = GameState.balls.value;
    if (b === 0) return "0.00";
    return (GameState.score.value / (b / 6)).toFixed(2);
});

export const currentPhase = computed(() => {
    const format = GameState.format.value;
    const b = GameState.balls.value;
    const cov = Math.floor(b / 6);
    const phases = GameState.formatConfigs[format]?.phases?.[format];

    if (!phases) return null;
    const p = phases.find(ph => cov >= ph.start && cov <= ph.end);
    return p ? p.name : null;
});
