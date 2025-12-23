import { GameState, currentOver, runRate } from "../engine/GameState";

export function Scoreboard() {
    return (
        <header className="bg-[#161B22] p-5 border-b border-amber-500/30 sticky top-0 z-20 shadow-lg">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h1 className="text-4xl font-black mono tracking-tighter text-white">
                        {GameState.score.value}-{GameState.wickets.value}
                    </h1>
                    <p className="text-sm text-gray-400 font-bold">{currentOver.value} OVERS</p>
                </div>
                <div className="text-right">
                    <p className={`text-[10px] font-bold uppercase ${GameState.innings.value === 2 ? 'text-amber-500' : 'text-gray-500'}`}>
                        {GameState.target.value ? `Target: ${GameState.target.value}` : `${GameState.innings.value}st INNINGS`}
                    </p>
                    <p className="text-xs text-gray-400">RR: {runRate.value}</p>
                </div>
            </div>

            {/* Active Batter/Bowler Info Bar */}
            <div className="bg-[#0B0E14] rounded-lg p-3 border border-gray-800 grid grid-cols-2 gap-4 mb-3">
                <div>
                    <p className="text-sm font-bold text-amber-400 italic">
                        {GameState.striker.value.name}* <span className="text-white not-italic">{GameState.striker.value.batStats.runs}({GameState.striker.value.batStats.balls})</span>
                    </p>
                </div>
                <div className="text-right border-l border-gray-700 pl-4">
                    <p className="text-sm font-bold text-gray-300">
                        {GameState.bowler.value} <span className="text-xs text-gray-500 font-normal">{GameState.overRuns.value} runs off over</span>
                    </p>
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
        </header>
    );
}
