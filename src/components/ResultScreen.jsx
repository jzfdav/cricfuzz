import { GameState } from "../engine/GameState";

export function ResultScreen({ engine }) {
    const result = GameState.matchResult.value || "Match Ended";
    const history = GameState.history.value;

    return (
        <div className="min-h-screen p-6 flex flex-col items-center animate-fade-in bg-[#0B0E14] text-white">
            <div className="text-center mt-10 mb-8">
                <h2 className="text-xs uppercase tracking-[0.3em] text-amber-500 font-bold mb-2">Match Finished</h2>
                <h1 className="text-3xl font-black italic mb-2">{result}</h1>
                <p className="text-xs text-gray-400 italic">{GameState.tossResult.value}</p>
            </div>

            <div className="w-full max-w-2xl space-y-6 flex-grow overflow-y-auto pb-10">
                {history.map((inn, i) => (
                    <div key={i} className="bg-[#161B22] rounded-2xl border border-gray-800 overflow-hidden">
                        <div className="bg-gray-800/50 p-4 flex justify-between items-center border-b border-gray-700">
                            <div>
                                <h3 className="font-black text-amber-500 uppercase tracking-widest text-[10px] mb-1">{inn.team}</h3>
                                <p className="text-[9px] text-gray-400 uppercase font-bold">{['1st', '2nd', '3rd', '4th'][i] || (i + 1) + 'th'} INNINGS</p>
                            </div>
                            <div className="text-right">
                                <span className="mono font-black text-2xl text-white">{inn.score}/{inn.wickets}</span>
                                <p className="text-[10px] text-gray-500 mono">{Math.floor(inn.overs / 6)}.{inn.overs % 6} OVS</p>
                            </div>
                        </div>

                        {/* Top Performers Grid */}
                        <div className="grid grid-cols-2 gap-4 p-4 text-xs text-gray-400">
                            <div>
                                <p className="mb-2 font-bold uppercase text-[10px] text-amber-500/80">Batting</p>
                                {inn.batting.sort((a, b) => b.batStats.runs - a.batStats.runs).slice(0, 3).map(p => (
                                    <div key={p.name} className="flex justify-between border-b border-gray-800 py-1">
                                        <span>{p.name.split(' ').pop()}</span>
                                        <span className="font-mono text-white">{p.batStats.runs} ({p.batStats.balls})</span>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="mb-2 font-bold uppercase text-[10px] text-amber-500/80">Bowling</p>
                                {inn.bowling
                                    .filter(p => p.bowlStats.balls > 0)
                                    .sort((a, b) => (b.bowlStats.wicketsTaken - a.bowlStats.wicketsTaken) || (a.bowlStats.runsConceded - b.bowlStats.runsConceded))
                                    .slice(0, 3)
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
                    </div>
                ))}
            </div>

            <button
                onClick={() => engine.resetToConfig()}
                className="w-full max-w-md bg-amber-500 text-black py-4 rounded-xl font-black uppercase tracking-widest text-sm active:scale-95 transition-transform mb-10"
            >
                New Simulation
            </button>
        </div>
    );
}
