import { useState } from 'preact/hooks';
import { GameState, FormatType } from '../engine/GameState';
import { GameEngine } from '../engine/GameEngine';
import { getTeamFlag } from "../utils";

interface ConfigScreenProps {
    engine: GameEngine;
}

export function ConfigScreen({ engine }: ConfigScreenProps) {
    const [t1, setT1] = useState('ind');
    const [t2, setT2] = useState('aus');
    const [format, setFormat] = useState<FormatType>('T20');
    const [loading, setLoading] = useState(false);

    const handleStart = async () => {
        setLoading(true);
        try {
            await engine.loadTeams(t1, t2);
            engine.performToss();
            GameState.format.value = format;
            engine.startMatch(t1, t2);
        } catch (e: any) {
            alert("Failed to load teams: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const preventSame = (val: string, isT1: boolean) => {
        if (isT1) {
            setT1(val);
            if (val === t2) setT2(val === 'ind' ? 'aus' : 'ind');
        } else {
            setT2(val);
            if (val === t1) setT1(val === 'ind' ? 'aus' : 'ind');
        }
    };

    const teams = [
        { id: 'ind', name: 'India' }, { id: 'aus', name: 'Australia' }, { id: 'eng', name: 'England' },
        { id: 'afg', name: 'Afghanistan' }, { id: 'ban', name: 'Bangladesh' }, { id: 'ire', name: 'Ireland' },
        { id: 'nz', name: 'New Zealand' }, { id: 'sl', name: 'Sri Lanka' }, { id: 'wi', name: 'West Indies' },
        { id: 'zim', name: 'Zimbabwe' }
    ];

    const randomizeTeams = () => {
        const idx1 = Math.floor(Math.random() * teams.length);
        let idx2 = Math.floor(Math.random() * teams.length);
        while (idx2 === idx1) idx2 = Math.floor(Math.random() * teams.length);
        setT1(teams[idx1].id);
        setT2(teams[idx2].id);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-xs uppercase tracking-[0.3em] text-amber-500 font-bold mb-2">Vibe Coded Simulation</h2>
                <h1 className="text-5xl font-black italic text-white">CRICFUZZ</h1>
            </div>

            <div className="w-full max-w-md space-y-4">
                {/* Team Selection */}
                <div className="bg-[#161B22] p-6 rounded-2xl border border-gray-800 space-y-4">
                    <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase font-bold">
                        <span>Home Team</span>
                        <button
                            onClick={randomizeTeams}
                            className="bg-gray-800 hover:bg-gray-700 text-amber-500 p-1 rounded transition-colors"
                            title="Randomize Teams"
                        >
                            🎲 Randomize
                        </button>
                        <span>Away Team</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TeamSelect value={t1} onChange={(v) => preventSame(v, true)} teams={teams} />
                        <span className="font-black text-gray-600 text-sm">VS</span>
                        <TeamSelect value={t2} onChange={(v) => preventSame(v, false)} teams={teams} alignRight />
                    </div>
                </div>

                {/* Format and Speed */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#161B22] rounded-2xl border border-gray-800">
                        <label className="text-[10px] text-gray-500 uppercase block mb-2">Format</label>
                        <select
                            value={format}
                            onChange={(e) => setFormat((e.target as HTMLSelectElement).value as FormatType)}
                            className="w-full bg-transparent text-amber-500 font-bold outline-none text-xl"
                        >
                            <option value="T20">T20</option>
                            <option value="ODI">ODI</option>
                            <option value="TEST">Test Match</option>
                        </select>
                    </div>
                    <div className="p-4 bg-[#161B22] rounded-2xl border border-gray-800">
                        <label className="text-[10px] text-gray-500 uppercase block mb-2 flex justify-between">
                            <span>Sim Speed</span>
                            <span className="text-amber-500">{GameState.speed.value}x</span>
                        </label>
                        <input
                            type="range" min="1" max="100"
                            value={GameState.speed.value}
                            onInput={(e) => engine.setSpeed(parseInt((e.target as HTMLInputElement).value))}
                            className="w-full accent-amber-500"
                        />
                    </div>
                </div>

                <button
                    onClick={handleStart}
                    disabled={loading}
                    className="w-full bg-amber-500 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xl shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                >
                    {loading ? "Loading..." : "Start Match"}
                </button>
            </div>
        </div>
    );
}

interface TeamSelectProps {
    value: string;
    onChange: (val: string) => void;
    teams: { id: string; name: string; }[];
    alignRight?: boolean;
}

function TeamSelect({ value, onChange, teams, alignRight }: TeamSelectProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange((e.target as HTMLSelectElement).value)}
            className={`w-full bg-transparent text-lg sm:text-2xl font-black text-amber-500 outline-none truncate ${alignRight ? 'text-right' : 'text-left'}`}
        >
            {teams.map(t => <option key={t.id} value={t.id}>{getTeamFlag(t.id)} {t.name}</option>)}
        </select>
    );
}
