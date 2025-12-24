export interface BatStats {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    out: boolean;
}

export interface BowlStats {
    runsConceded: number;
    wicketsTaken: number;
    maidens: number;
    balls: number;
}

export interface Player {
    name: string;
    role: 'Batter' | 'Bowler' | 'All-Rounder' | 'WicketKeeper';
    battingSkill: number;
    bowlingSkill: number;
    bowlingStyle?: 'Pace' | 'Spin';
    aggression?: number;
    economy?: number;
    batStats: BatStats;
    bowlStats: BowlStats;
}

export type Squad = Player[];



export interface MatchHistoryEntry {
    team: string;
    score: number;
    wickets: number;
    overs: number;
    timeline: { over: number; score: number; wickets: number }[]; // Graph data

    batting: Squad;
    bowling: Squad;
}

export interface CommentaryEntry {
    id: number;
    text: string;
    type: 'event' | 'wicket' | 'boundary' | 'milestone' | 'info' | 'intro' | 'maiden' | 'four' | 'six' | 'dot' | 'run';

    over: string;
}
