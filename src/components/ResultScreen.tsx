import { useState } from 'preact/hooks';
import { GameState } from "../engine/GameState";
import { WormGraph } from "./WormGraph";
import { GameEngine } from "../engine/GameEngine";
import { MatchHistoryEntry, Player } from '../types';
import { getTeamFlag } from "../utils";

interface ResultScreenProps {
    engine: GameEngine;
}

export function ResultScreen({ engine }: ResultScreenProps) {
    const result = GameState.matchResult.value || "Match Ended";
    const history = GameState.history.value;
    const [expanded, setExpanded] = useState<number | null>(null); // Index of expanded card

    // Helper safely access team data even if history is partial
    const t1Name = GameState.teams.team1Name.value;
    const t2Name = GameState.teams.team2Name.value;
    const t1Id = GameState.teams.team1.value?.id || '';
    const t2Id = GameState.teams.team2.value?.id || '';

    return (
        <div className="min-h-screen p-6 flex flex-col items-center animate-fade-in bg-[#0B0E14] text-white">
            <div className="text-center mt-10 mb-8">
                <h2 className="text-xs uppercase tracking-[0.3em] text-amber-500 font-bold mb-2">Match Finished</h2>
                <h1 className="text-3xl font-black italic mb-2">{result}</h1>
                <p className="text-xs text-gray-400 italic mb-4">{GameState.tossResult.value}</p>
                <div className="max-w-xl mx-auto p-4 bg-gray-800/30 rounded-xl border border-gray-800">
                    <p className="text-sm text-gray-300 font-medium italic leading-relaxed">
                        {getMatchDescription(history, t1Name, t2Name, GameState.format.value)}
                    </p>
                </div>
            </div>

            {/* Top Performers Summary */}
            <div className="w-full max-w-2xl grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#161B22] p-4 rounded-xl border border-gray-800">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-3 border-b border-gray-700 pb-2">Best Batters</h3>
                    <div className="space-y-2">
                        {getTopPerformers(history).batters.slice(0, 3).map((p, i) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                                <span className={`${i === 0 ? 'text-white font-bold' : 'text-gray-400'}`}>{p.name.split(' ').pop()}</span>
                                <span className="font-mono text-gray-300">{p.batStats.runs} <span className="text-[9px] text-gray-600">({p.batStats.balls})</span></span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-[#161B22] p-4 rounded-xl border border-gray-800">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-3 border-b border-gray-700 pb-2">Best Bowlers</h3>
                    <div className="space-y-2">
                        {getTopPerformers(history).bowlers.slice(0, 3).map((p, i) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                                <span className={`${i === 0 ? 'text-white font-bold' : 'text-gray-400'}`}>{p.name.split(' ').pop()}</span>
                                <span className="font-mono text-gray-300">{p.bowlStats.wicketsTaken}/{p.bowlStats.runsConceded} <span className="text-[9px] text-gray-600">({Math.floor(p.bowlStats.balls / 6)}.{p.bowlStats.balls % 6})</span></span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>



            {/* Match Analysis Graph */}
            {(history.length >= 1) && (
                <div className="w-full max-w-2xl mb-6">
                    <WormGraph
                        data={[{ over: 0, score: 0, wickets: 0 }, ...(history[0]?.timeline || [])]}
                        targetData={history[1] ? [{ over: 0, score: 0, wickets: 0 }, ...(history[1]?.timeline || [])] : null}
                        totalOvers={GameState.formatConfigs[GameState.format.value].balls / 6}
                        color={GameState.teams.team1.value?.color || "#60a5fa"}
                        legend={{
                            main: t1Name,
                            target: t2Name,
                            mainColor: GameState.teams.team1.value?.color || "#60a5fa",
                            targetColor: GameState.teams.team2.value?.color || "#9ca3af" // Default gray for target if not provided, but we should probably use team 2 color
                        }}
                    />
                </div>
            )}

            <div className="w-full max-w-2xl space-y-6 flex-grow overflow-y-auto pb-10">
                {history.map((inn, i) => {
                    const isExpanded = expanded === i;
                    // Determine team name and flag for this innings
                    // Note: history[0] is innings 1 (team1 usually, unless chased?), history[1] is innings 2
                    // Actually, innings 1 is always the team that batted first.
                    const isTeam1Innings = inn.team === t1Name;
                    const flag = isTeam1Innings ? getTeamFlag(t1Id) : getTeamFlag(t2Id);

                    return (
                        <div key={i} className="bg-[#161B22] rounded-2xl border border-gray-800 overflow-hidden transition-all duration-300">
                            <div
                                onClick={() => setExpanded(isExpanded ? null : i)}
                                className="bg-gray-800/50 p-4 flex justify-between items-center border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{flag}</span>
                                    <div>
                                        <h3 className="font-black text-amber-500 uppercase tracking-widest text-[10px] mb-1">{inn.team}</h3>
                                        <p className="text-[9px] text-gray-400 uppercase font-bold">{['1st', '2nd', '3rd', '4th'][i] || (i + 1) + 'th'} INNINGS</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="mono font-black text-2xl text-white">{inn.score}/{inn.wickets}</span>
                                    <p className="text-[10px] text-gray-500 mono">{Math.floor(inn.overs / 6)}.{inn.overs % 6} OVS</p>
                                </div>
                            </div>

                            {/* Scorecard Grid - Visible only when expanded */}
                            {isExpanded && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 text-xs text-gray-400 animate-fade-in-down">
                                    <div>
                                        <p className="mb-2 font-bold uppercase text-[10px] text-amber-500/80">Batting</p>
                                        {inn.batting.map(p => (
                                            <div key={p.name} className={`flex justify-between border-b border-gray-800 py-1 ${p.batStats.out ? 'text-gray-500' : 'text-white'}`}>
                                                <span>{p.name.split(' ').pop()} {p.batStats.out ? '' : '*'}</span>
                                                <span className="font-mono">{p.batStats.runs} ({p.batStats.balls})</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <p className="mb-2 font-bold uppercase text-[10px] text-amber-500/80">Bowling</p>
                                        {inn.bowling.filter(p => p.bowlStats.balls > 0)
                                            .sort((a, b) => (b.bowlStats.wicketsTaken - a.bowlStats.wicketsTaken) || (a.bowlStats.runsConceded - b.bowlStats.runsConceded))
                                            .map(p => (
                                                <div key={p.name} className="flex justify-between border-b border-gray-800 py-1">
                                                    <span>{p.name.split(' ').pop()}</span>
                                                    <span className="font-mono text-white">
                                                        {p.bowlStats.wicketsTaken}-{p.bowlStats.runsConceded} <span className="text-gray-600 text-[9px]">({Math.floor(p.bowlStats.balls / 6)}.{p.bowlStats.balls % 6})</span>
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            <div
                                onClick={() => setExpanded(isExpanded ? null : i)}
                                className="bg-gray-900/50 p-2 text-center text-[10px] uppercase font-bold text-gray-500 hover:text-white cursor-pointer transition-colors"
                            >
                                {isExpanded ? "Collapse Scorecard" : "View Full Scorecard"}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="w-full max-w-md flex flex-col gap-3 mb-10">
                <button
                    onClick={() => engine.rematch()}
                    className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase tracking-widest text-sm active:scale-95 transition-transform shadow-lg hover:shadow-emerald-500/20"
                >
                    Rematch (Same Teams)
                </button>
                <button
                    onClick={() => engine.resetToConfig()}
                    className="w-full bg-gray-800 text-gray-400 py-3 rounded-xl font-bold uppercase tracking-widest text-xs active:scale-95 transition-transform hover:bg-gray-700 hover:text-white"
                >
                    New Simulation
                </button>
            </div>
        </div >
    );
}

function getMatchDescription(history: MatchHistoryEntry[], t1: string, t2: string, format: string) {
    // Calculate total maidens for description
    let totalMaidens = 0;
    history.forEach(inn => {
        inn.bowling.forEach(p => totalMaidens += (p.bowlStats.maidens || 0));
    });

    // Dynamic summary
    let topPerformer: { name: string; stat: string; type: 'bat' | 'bowl' } | null = null;
    let maxImpact = -1;

    history.forEach(inn => {
        inn.batting.forEach((p: Player) => {
            if (p.batStats.runs > maxImpact) {
                maxImpact = p.batStats.runs;
                topPerformer = { name: p.name, stat: `${p.batStats.runs}(${p.batStats.balls})`, type: 'bat' };
            }
        });
        inn.bowling.forEach((p: Player) => {
            const bowlImpact = (p.bowlStats.wicketsTaken * 25) + (p.bowlStats.maidens * 15) - p.bowlStats.runsConceded;
            if (bowlImpact > maxImpact) {
                maxImpact = bowlImpact;
                let statStr = `${p.bowlStats.wicketsTaken}/${p.bowlStats.runsConceded}`;
                if (p.bowlStats.maidens > 0) statStr += ` (${p.bowlStats.maidens}m)`;
                topPerformer = { name: p.name, stat: statStr, type: 'bowl' };
            }
        });
    });

    let description = `A thrilling ${format} encounter between ${t1} and ${t2}. `;
    if (totalMaidens > 0) description += `Defensive pressure was key with ${totalMaidens} maiden over${totalMaidens > 1 ? 's' : ''} bowled. `;
    if (topPerformer) {
        description += `${(topPerformer as any).name.split(' ').pop()}'s ${(topPerformer as any).stat} was the standout performance of the match.`;
    }
    return description;
}

function getTopPerformers(history: MatchHistoryEntry[]) {
    const allBatters: Player[] = [];
    const allBowlers: Player[] = [];

    history.forEach(inn => {
        allBatters.push(...inn.batting.filter(p => p.batStats.balls > 0 || p.batStats.out));
        allBowlers.push(...inn.bowling.filter(p => p.bowlStats.balls > 0));
    });

    // Sort Batters: Most Runs, then Fewest Balls
    allBatters.sort((a, b) => (b.batStats.runs - a.batStats.runs) || (a.batStats.balls - b.batStats.balls));

    // Sort Bowlers: Most Wickets, then Fewest Runs
    allBowlers.sort((a, b) => (b.bowlStats.wicketsTaken - a.bowlStats.wicketsTaken) || (a.bowlStats.runsConceded - b.bowlStats.runsConceded));

    return { batters: allBatters, bowlers: allBowlers };
}
