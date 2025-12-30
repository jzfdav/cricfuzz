import { GameState } from "../engine/GameState";
import { GameEngine } from "../engine/GameEngine";

interface ControlsProps {
    engine: GameEngine;
}

export function Controls({ engine }: ControlsProps) {
    const speed = GameState.speed.value;
    const isRunning = GameState.isRunning.value;
    const effects = GameState.immersiveEffects.value;

    // Map speed to label (1=Slow, 100=Fast)
    const speedLabel = speed < 30 ? "Slow" : speed > 70 ? "Fast" : "Normal";

    return (
        <div className="flex items-center gap-4 bg-[#161B22]/90 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl">
            {/* Speed Control Section - Redesigned */}
            <div className="flex-grow flex flex-col gap-1 px-2">
                <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase text-gray-400 font-black tracking-widest">Simulation Speed</span>
                    <span className="text-[10px] text-amber-500 font-black uppercase tracking-tighter">{speedLabel}</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="100"
                    value={speed}
                    onInput={(e) => engine.setSpeed(parseInt((e.target as HTMLInputElement).value))}
                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                />
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-2">
                {/* Effects Toggle - Icon based */}
                <button
                    onClick={() => GameState.immersiveEffects.value = !GameState.immersiveEffects.value}
                    className={`p-2.5 rounded-xl border transition-all active:scale-90 ${effects
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        : "bg-gray-800/50 border-gray-700 text-gray-500"
                        }`}
                    title={effects ? "Effects On" : "Effects Off"}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </button>

                {/* Play/Pause Button - Icon based */}
                <button
                    onClick={() => isRunning ? engine.stopMatch() : engine.resumeMatch()}
                    className={`p-3 rounded-xl font-black transition-all active:scale-90 shadow-lg ${isRunning
                        ? "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20"
                        : "bg-emerald-500 text-black hover:bg-emerald-400 border border-emerald-400/50"
                        }`}
                    title={isRunning ? "Pause" : "Play"}
                >
                    {isRunning ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 translate-l-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
