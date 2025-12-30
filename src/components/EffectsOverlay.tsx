import { type ComponentChildren, useEffect, useState } from "preact/hooks";
import { GameState } from "../engine/GameState";
import "../styles/effects.css";

export function EffectsOverlay() {
	const [activeEvent, setActiveEvent] = useState<{
		type: string | null;
		timestamp: number;
	} | null>(null);

	useEffect(() => {
		if (!GameState.immersiveEffects.value) return;
		const ev = GameState.lastEvent.value;
		if (ev && ev.timestamp !== activeEvent?.timestamp) {
			setActiveEvent(ev);
			// Auto-clear after animation
			const timer = setTimeout(() => setActiveEvent(null), 2000);
			return () => clearTimeout(timer);
		}
	}, [GameState.lastEvent.value]);

	if (!activeEvent) return null;

	const getFlashClass = () => {
		switch (activeEvent.type) {
			case "four":
				return "animate-flash-four";
			case "six":
				return "animate-flash-six";
			case "wicket":
				return "animate-flash-wicket";
			default:
				return "";
		}
	};

	return (
		<div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
			<div className={`w-full h-full ${getFlashClass()}`} />
			{activeEvent.type === "wicket" && (
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="text-white font-black text-6xl uppercase tracking-tighter opacity-20 select-none">
						WICKET!
					</div>
				</div>
			)}
		</div>
	);
}

export function ShakeWrapper({ children }: { children: ComponentChildren }) {
	const [shake, setShake] = useState(false);

	useEffect(() => {
		if (!GameState.immersiveEffects.value) return;
		const ev = GameState.lastEvent.value;
		if (ev?.type === "wicket" || ev?.type === "six") {
			setShake(true);
			const timer = setTimeout(() => setShake(false), 500);
			return () => clearTimeout(timer);
		}
	}, [GameState.lastEvent.value]);

	return (
		<div className={shake ? "animate-shake h-full w-full" : "h-full w-full"}>
			{children}
		</div>
	);
}
