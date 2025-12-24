import { GameState } from "../engine/GameState";
import { GameEngine } from "../engine/GameEngine";

interface ControlsProps {
    engine: GameEngine;
}

export function Controls({ engine }: ControlsProps) {
    const speed = GameState.speed.value;
    // Map speed to label (1=Slow, 100=Fast)
    const speedLabel = speed < 30 ? "Slow" : speed > 70 ? "Fast" : "Normal";

    return (
        <div className="flex items-center gap-3 bg-[#161B22] p-2 rounded-xl border border-gray-800">
            {/* Speed Control Section - Compact */}
            <div className="flex-grow flex items-center gap-3 px-2">
                <span className="text-[10px] uppercase text-gray-500 font-bold whitespace-nowrap">Speed</span>
                <input
                    type="range"
                    min="1"
                    max="100"
                    value={speed}
                    onInput={(e) => engine.setSpeed(parseInt((e.target as HTMLInputElement).value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-[10px] text-amber-500 font-bold w-12 text-right uppercase">{speedLabel}</span>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-700"></div>

            {/* Effects Toggle */}
            <button
                onClick={() => GameState.immersiveEffects.value = !GameState.immersiveEffects.value}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${GameState.immersiveEffects.value
                    ? "bg-amber-500/10 border-amber-500/50 text-amber-500"
                    : "bg-gray-800 border-gray-700 text-gray-500"
                    }`}
            >
                <span className="text-[10px] font-black uppercase tracking-wider">
                    {GameState.immersiveEffects.value ? "Effects On" : "Effects Off"}
                </span>
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-700"></div>

            {/* Play/Pause Button - Compact */}
            <button
                onClick={() => GameState.isRunning.value ? engine.stopMatch() : engine.resumeMatch()}
                className={`px-6 py-2 rounded-lg font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all ${GameState.isRunning.value
                    ? "bg-red-900/40 text-red-500 border border-red-900/50 hover:bg-red-900/60"
                    : "bg-amber-500 text-black hover:bg-amber-400"
                    }`}
            >
                {GameState.isRunning.value ? "Pause" : "Play"}
            </button>
        </div>
    );
}
