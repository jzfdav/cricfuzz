import { signal, computed, Signal } from "@preact/signals";
import { Player, Squad, MatchHistoryEntry, CommentaryEntry, TeamData } from "../types";

export type FormatType = "T20" | "ODI" | "TEST";
export type PitchType = "Green" | "Dry" | "Balanced" | "Flat" | "Dusty";

export interface PhaseConfig {
    name: string;
    start: number;
    end: number;
    agg: number;
    bound: number;
    wick: number;
    dot: number;
}

interface FormatConfig {
    balls: number;
    innings: number;
    aggMod: number;
    boundaryMod: number;
    wicketMod: number;
    dotMod: number;
    phases?: {
        [key in FormatType]?: PhaseConfig[];
    }
}

export const GameState = {
    // Configuration
    format: signal<FormatType>("T20"),
    pitch: signal<PitchType>("Balanced"),
    teams: {
        team1: signal<TeamStructure | null>(null),
        team2: signal<TeamStructure | null>(null),
        team1Data: signal<TeamData | null>(null), // Raw Data
        team2Data: signal<TeamData | null>(null), // Raw Data
        team1Name: signal<string>(""),
        team2Name: signal<string>(""),
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
    } as Record<FormatType, FormatConfig> & { phases: Record<FormatType, PhaseConfig[]> },

    // Dynamic Game State
    view: signal<"config" | "live" | "result">("config"),
    isRunning: signal<boolean>(false),
    speed: signal<number>(50),

    totalTeam1Score: signal<number>(0),
    totalTeam2Score: signal<number>(0),

    innings: signal<number>(1),
    score: signal<number>(0),
    wickets: signal<number>(0),
    balls: signal<number>(0),
    target: signal<number | null>(null),

    // Current Players
    // Using explicit defined objects to avoid empty init issues
    striker: signal<Player>({ name: "Striker", role: "Batter", battingSkill: 0, bowlingSkill: 0, batStats: { runs: 0, balls: 0, fours: 0, sixes: 0, out: false }, bowlStats: { runsConceded: 0, wicketsTaken: 0, maidens: 0, balls: 0 } }),
    nonStriker: signal<Player>({ name: "Non-Striker", role: "Batter", battingSkill: 0, bowlingSkill: 0, batStats: { runs: 0, balls: 0, fours: 0, sixes: 0, out: false }, bowlStats: { runsConceded: 0, wicketsTaken: 0, maidens: 0, balls: 0 } }),
    bowler: signal<string>("Bowler"),

    // Active Teams
    battingTeamName: signal<string>(""),
    bowlingTeamName: signal<string>(""),
    battingSquad: signal<Squad>([]),
    bowlingSquad: signal<Squad>([]),

    // Events & History
    timeline: signal<(string | number)[]>([]),
    commentary: signal<CommentaryEntry[]>([]),
    history: signal<MatchHistoryEntry[]>([]),
    inningsTimeline: signal<{ over: number; score: number; wickets: number }[]>([]),
    winProbability: signal<number>(50),

    // Status Flags
    lastOverWasMaiden: signal<boolean>(false),
    lastMilestone: signal<string | null>(null),
    matchResult: signal<string | null>(null),
    tossResult: signal<string>(""),
    allOut: signal<boolean>(false),
    overRuns: signal<number>(0),
    nextBatterIndex: signal<number>(2)
};

export interface TeamStructure {
    id: string; // Added id
    name: string;
    color?: string;
    players: Player[];
}

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

export const ballsRemaining = computed(() => {
    const format = GameState.format.value;
    const totalBalls = GameState.formatConfigs[format].balls;
    return Math.max(0, totalBalls - GameState.balls.value);
});

export const requiredRunRate = computed(() => {
    const target = GameState.target.value;
    if (target === null) return null;
    const runsNeeded = target - GameState.score.value;
    const b = ballsRemaining.value;
    if (b === 0) return runsNeeded > 0 ? "∞" : "0.00";
    return ((runsNeeded / b) * 6).toFixed(2);
});

export const currentPhase = computed(() => {
    const format = GameState.format.value;
    const b = GameState.balls.value;
    const cov = Math.floor(b / 6);
    const phases = GameState.formatConfigs.phases[format]; // Using direct access since we typed it

    if (!phases) return null;
    const p = phases.find(ph => cov >= ph.start && cov <= ph.end);
    return p ? p.name : null;
});
