import { GameState, currentOver, runRate, currentPhase } from "../engine/GameState";
import { WormGraph } from "./WormGraph";
import { Player } from "../types";
import { getTeamFlag } from "../utils";

export function Scoreboard() {
    return (
        <header className="bg-[#161B22] p-5 border-b border-amber-500/30 sticky top-0 z-20 shadow-lg">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">{getTeamFlag(GameState.teams[GameState.innings.value === 1 ? 'team1' : 'team2'].value?.id || '')}</span>
                        <h1 className="text-4xl font-black mono tracking-tighter text-white">
                            {GameState.score.value}-{GameState.wickets.value}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-400 font-bold">{currentOver.value} OVERS</p>
                        {currentPhase.value && (
                            <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded border border-amber-500/30">
                                {currentPhase.value}
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <p className={`text-[10px] font-bold uppercase ${GameState.innings.value === 2 ? 'text-amber-500' : 'text-gray-500'}`}>
                        {GameState.target.value ? `Target: ${GameState.target.value}` : `${['1st', '2nd', '3rd', '4th'][GameState.innings.value - 1] || GameState.innings.value + 'th'} INNINGS`}
                    </p>
                    <p className="text-xs text-gray-400">RR: {runRate.value}</p>
                    {GameState.innings.value === 2 && (
                        <div className="mt-1 flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${GameState.winProbability.value > 50 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                    style={{ width: `${GameState.winProbability.value}%` }}
                                />
                            </div>
                            <p className={`text-[10px] font-black ${GameState.winProbability.value > 50 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {GameState.winProbability.value}% WIN
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Active Batter/Bowler Info Bar */}
            <div className="bg-[#0B0E14] rounded-lg p-3 border border-gray-800 grid grid-cols-2 gap-4 mb-3">
                <div>
                    <p className="text-sm font-bold text-amber-400 italic">
                        {GameState.striker.value.name.split(' ').pop()}* <span className="text-white not-italic">{GameState.striker.value.batStats.runs}({GameState.striker.value.batStats.balls})</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {GameState.nonStriker.value.name.split(' ').pop()} <span className="text-gray-300">{GameState.nonStriker.value.batStats.runs}({GameState.nonStriker.value.batStats.balls})</span>
                    </p>
                </div>
                <div className="text-right border-l border-gray-700 pl-4">
                    <p className="text-sm font-bold text-gray-300">
                        {GameState.bowler.value.split(' ').pop()}
                    </p>
                    {(() => {
                        const bowlerObj = GameState.bowlingSquad.value.find((p: Player) => p.name === GameState.bowler.value);
                        if (!bowlerObj) return null;
                        const cv = bowlerObj.bowlStats;
                        return (
                            <p className="text-xs text-amber-500 font-mono mt-1">
                                {cv.wicketsTaken}-{cv.runsConceded} <span className="text-gray-500">({Math.floor(cv.balls / 6)}.{cv.balls % 6})</span>
                            </p>
                        );
                    })()}
                    <p className="text-[9px] text-gray-600 mt-1 uppercase tracking-wider">This Over: {GameState.overRuns.value}</p>
                </div>
            </div>

            {/* Timeline Ticker */}
            <div className="flex gap-2 overflow-x-auto py-2 px-1 mask-scroll no-scrollbar">
                {GameState.timeline.value.map((res, i) => (
                    <div key={i} className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-xs font-black ball-pill animate-ball
                        ${res === 'W' ? 'bg-red-600 text-white' :
                            res === 4 ? 'bg-emerald-500 text-black' :
                                res === 6 ? 'bg-emerald-600 text-white border border-emerald-400' :
                                    res === 0 ? 'bg-gray-800 text-gray-500' : 'bg-gray-700 text-white'}`}>
                        {res}
                    </div>
                ))}
            </div>

            <WormGraph
                data={[{ over: 0, score: 0, wickets: 0 }, ...GameState.inningsTimeline.value]}
                targetData={(GameState.innings.value === 2 && GameState.history.value[0])
                    ? [{ over: 0, score: 0, wickets: 0 }, ...GameState.history.value[0].timeline]
                    : null
                }
                totalOvers={GameState.formatConfigs[GameState.format.value].balls / 6}
                color={GameState.innings.value === 2 ? "#ecc94b" : "#60a5fa"}
            />
        </header>
    );
}
