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
        ODI: { balls: 300, innings: 2, aggMod: 1.0, boundaryMod: 1.0, wicketMod: 1.0, dotMod: 1.0 },
        TEST: { balls: 2400, innings: 4, aggMod: 0.6, boundaryMod: 0.7, wicketMod: 0.7, dotMod: 1.5 }
    },

    // Dynamic Game State
    view: signal("config"), // config, live, result
    isRunning: signal(false),
    speed: signal(50), // 1-100 scale (UX Fix: 100=Fast, 1=Slow)

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
