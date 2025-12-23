import { GameEngine } from './engine/GameEngine';
import { GameState } from './engine/GameState';
import { Scoreboard } from './components/Scoreboard';
// @ts-ignore - Allowing JS import for now
import { CommentaryFeed } from './components/CommentaryFeed';
import { Controls } from './components/Controls';
// @ts-ignore - Allowing JS import for now
import { ConfigScreen } from './components/ConfigScreen';
import { ResultScreen } from './components/ResultScreen';

const engine = new GameEngine();

export function App() {
    const view = GameState.view.value;

    if (view === 'config') return <ConfigScreen engine={engine} />;

    if (view === 'result') return <ResultScreen engine={engine} />;

    // Live View
    if (!GameState.teams.team1.value) return <div className="p-10 text-center text-amber-500">Initializing...</div>;

    return (
        <div className="flex flex-col h-screen bg-[#0B0E14] text-white">
            <Scoreboard />
            <CommentaryFeed />
            <div className="p-4 bg-[#0B0E14] border-t border-gray-800">
                <Controls engine={engine} />
            </div>
        </div>
    );
}
