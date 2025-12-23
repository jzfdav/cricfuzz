import { GameState } from "../engine/GameState";
import { GameEngine } from "../engine/GameEngine";

export function Controls({ engine }) {
    // Determine label based on speed value (1=Slow, 100=Fast)
    const speed = GameState.speed.value;
    const speedLabel = speed < 30 ? "Slow" : speed > 70 ? "Fast" : "Normal";

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#161B22] rounded-2xl border border-gray-800">
                <p className="text-[10px] text-gray-500 uppercase mb-2">Simulation Speed</p>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-mono">1x</span>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={speed}
                        onInput={(e) => engine.setSpeed(parseInt(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                    />
                    <span className="text-xs text-gray-500 font-mono">100x</span>
                </div>
                <p className="text-right text-[10px] text-amber-500 font-bold mt-1 uppercase">{speedLabel}</p>
            </div>

            <button
                onClick={() => GameState.isRunning.value ? engine.stopMatch() : engine.startMatch()}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-lg shadow-lg active:scale-95 transition-transform ${GameState.isRunning.value
                        ? "bg-red-900/50 text-red-500 border border-red-900 hover:bg-red-900"
                        : "bg-amber-500 text-black hover:bg-amber-400"
                    }`}
            >
                {GameState.isRunning.value ? "Pause" : "Start"}
            </button>
        </div>
    );
}
