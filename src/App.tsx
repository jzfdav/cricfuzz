import { CommentaryFeed } from "./components/CommentaryFeed";
import { ConfigScreen } from "./components/ConfigScreen";
import { Controls } from "./components/Controls";
import { ResultScreen } from "./components/ResultScreen";
import { Scoreboard } from "./components/Scoreboard";
import { GameEngine } from "./engine/GameEngine";
import { GameState } from "./engine/GameState";

const engine = new GameEngine();

import { EffectsOverlay, ShakeWrapper } from "./components/EffectsOverlay";

export function App() {
	const view = GameState.view.value;

	if (view === "config") return <ConfigScreen engine={engine} />;

	if (view === "result") return <ResultScreen engine={engine} />;

	// Live View
	if (!GameState.teams.team1.value)
		return (
			<div className="p-10 text-center text-amber-500">Initializing...</div>
		);

	return (
		<ShakeWrapper>
			<div className="flex flex-col h-screen bg-[#0B0E14] text-white">
				<EffectsOverlay />
				<Scoreboard />
				<CommentaryFeed />
				<div className="p-4 bg-[#0B0E14] border-t border-gray-800">
					<Controls engine={engine} />
				</div>
			</div>
		</ShakeWrapper>
	);
}
