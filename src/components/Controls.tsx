import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Zap } from "lucide-preact";
import type { GameEngine } from "../engine/GameEngine";
import { GameState } from "../engine/GameState";

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
		<div className="relative">
			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				className="flex items-center gap-4 bg-[#161B22]/90 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl"
			>
				{/* Speed Control Section - Redesigned */}
				<div className="flex-grow flex flex-col gap-1 px-2">
					<div className="flex justify-between items-center">
						<span className="text-[9px] uppercase text-gray-400 font-black tracking-widest">
							Simulation Speed
						</span>
						<motion.span
							key={speedLabel}
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							className="text-[10px] text-amber-500 font-black uppercase tracking-tighter"
						>
							{speedLabel}
						</motion.span>
					</div>
					<input
						type="range"
						min="1"
						max="100"
						value={speed}
						onInput={(e) =>
							engine.setSpeed(
								Number.parseInt((e.target as HTMLInputElement).value, 10),
							)
						}
						className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
					/>
				</div>

				{/* Actions Section */}
				<div className="flex items-center gap-2">
					{/* Effects Toggle - Icon based */}
					<motion.button
						type="button"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.9 }}
						onClick={() => {
							GameState.immersiveEffects.value =
								!GameState.immersiveEffects.value;
						}}
						className={`p-2.5 rounded-xl border transition-all ${
							effects
								? "bg-amber-500/20 border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
								: "bg-gray-800/50 border-gray-700 text-gray-500"
						} `}
						title={effects ? "Effects On" : "Effects Off"}
					>
						<Zap size={20} fill={effects ? "currentColor" : "none"} />
					</motion.button>

					{/* Play/Pause Button - Icon based */}
					<motion.button
						type="button"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.9 }}
						onClick={() =>
							isRunning ? engine.stopMatch() : engine.resumeMatch()
						}
						className={`p-3 rounded-xl font-black transition-all shadow-lg ${
							isRunning
								? "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20"
								: "bg-emerald-500 text-black hover:bg-emerald-400 border border-emerald-400/50"
						} `}
						title={isRunning ? "Pause" : "Play"}
					>
						<AnimatePresence mode="wait">
							<motion.div
								key={isRunning ? "pause" : "play"}
								initial={{ rotate: -90, opacity: 0 }}
								animate={{ rotate: 0, opacity: 1 }}
								exit={{ rotate: 90, opacity: 0 }}
								transition={{ duration: 0.15 }}
							>
								{isRunning ? (
									<Pause size={24} fill="currentColor" />
								) : (
									<Play size={24} fill="currentColor" />
								)}
							</motion.div>
						</AnimatePresence>
					</motion.button>
				</div>
			</motion.div>
		</div>
	);
}
