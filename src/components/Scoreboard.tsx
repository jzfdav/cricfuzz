import { Scale, Shield, Zap } from "lucide-preact";
import {
	ballsRemaining,
	currentOver,
	currentPhase,
	GameState,
	requiredRunRate,
	runRate,
} from "../engine/GameState";
import { MatchHistoryEntry, type Player } from "../types";
import { getTeamFlag } from "../utils";
import { WormGraph } from "./WormGraph";

export function Scoreboard() {
	return (
		<header className="bg-[#161B22] p-5 border-b border-amber-500/30 sticky top-0 z-20 shadow-lg">
			<div className="flex justify-between items-end mb-2">
				<div>
					<div className="flex items-center gap-2">
						<span className="text-3xl">
							{getTeamFlag(
								GameState.teams.team1Name.value ===
									GameState.battingTeamName.value
									? GameState.teams.team1.value?.id || ""
									: GameState.teams.team2.value?.id || "",
							)}
						</span>
						<h1 className="text-4xl font-black mono tracking-tighter text-white">
							{GameState.score.value}-{GameState.wickets.value}
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<p className="text-sm text-gray-400 font-bold">
							{currentOver.value} OVERS
						</p>
						{currentPhase.value && (
							<span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded border border-amber-500/30">
								{currentPhase.value}
							</span>
						)}
					</div>
				</div>
				<div className="text-right">
					<p
						className={`text-[10px] font-bold uppercase ${GameState.innings.value === 2 || (GameState.format.value === "TEST" && GameState.innings.value === 4) ? "text-amber-500" : "text-gray-500"}`}
					>
						{(() => {
							if (GameState.target.value)
								return `Target: ${GameState.target.value}`;
							return `${["1st", "2nd", "3rd", "4th"][GameState.innings.value - 1] || GameState.innings.value + "th"} INNINGS`;
						})()}
					</p>
					<p className="text-xs text-gray-400">RR: {runRate.value}</p>
					{(GameState.innings.value === 2 ||
						(GameState.format.value === "TEST" &&
							GameState.innings.value === 4)) && (
							<div className="mt-1 flex items-center justify-end gap-2">
								<div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
									<div
										className={`h-full transition-all duration-300 ${GameState.winProbability.value > 50 ? "bg-emerald-500" : "bg-red-500"}`}
										style={{ width: `${GameState.winProbability.value}%` }}
									/>
								</div>
								<p
									className={`text-[10px] font-black ${GameState.winProbability.value > 50 ? "text-emerald-500" : "text-red-500"}`}
								>
									{GameState.winProbability.value}% WIN
								</p>
							</div>
						)}
				</div>
			</div>
			{/* Chase Summary Bar */}
			{GameState.innings.value === 2 && GameState.target.value !== null && (
				<div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 text-[10px] sm:text-xs">
					<div className="flex items-center gap-1.5 flex-wrap">
						<span className="font-black text-amber-500 uppercase tracking-tighter whitespace-nowrap">
							{GameState.battingTeamName.value} need{" "}
							{GameState.target.value - GameState.score.value} runs
						</span>
						<span className="text-gray-500">in</span>
						<span className="font-bold text-white whitespace-nowrap">
							{Math.floor(ballsRemaining.value / 6)}.{ballsRemaining.value % 6}{" "}
							overs
						</span>
						<span className="text-gray-500 hidden xs:inline">to win</span>
					</div>
					<div className="flex items-center gap-3 font-mono self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-start">
						<span className="text-gray-400">
							CRR: <span className="text-white">{runRate.value}</span>
						</span>
						<span className="text-gray-500 hidden sm:inline">·</span>
						<span className="text-gray-400">
							RRR:{" "}
							<span className="text-amber-500 font-bold">
								{requiredRunRate.value}
							</span>
						</span>
					</div>
				</div>
			)}
			{/* Active Batter/Bowler Info Bar */}
			<div className="bg-[#0B0E14] rounded-lg p-3 border border-gray-800 grid grid-cols-2 gap-4 mb-3">
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2">
						<p className="text-sm font-bold text-white truncate max-w-[120px]">
							{GameState.striker.value.name}*
						</p>
						<span className="text-amber-400 font-mono text-sm leading-none pt-0.5">
							{GameState.striker.value.batStats.runs}(
							{GameState.striker.value.batStats.balls})
						</span>
					</div>
					<div className="flex items-center gap-1.5 opacity-80">
						{GameState.currentMindset.value === "Attacking" ? (
							<Zap size={10} className="text-amber-500" />
						) : GameState.currentMindset.value === "Defensive" ? (
							<Shield size={10} className="text-blue-400" />
						) : (
							<Scale size={10} className="text-gray-400" />
						)}
						<span className="text-[9px] font-black uppercase tracking-wider text-gray-500">
							{GameState.currentMindset.value}
						</span>
					</div>
					<div className="text-[10px] text-gray-500 mt-0.5">
						{GameState.nonStriker.value.name}{" "}
						<span className="text-gray-400 font-mono">
							{GameState.nonStriker.value.batStats.runs}(
							{GameState.nonStriker.value.batStats.balls})
						</span>
					</div>
				</div>
				<div className="text-right border-l border-gray-700 pl-4 flex flex-col justify-between">
					<div>
						<p className="text-sm font-bold text-gray-300 truncate">
							{GameState.bowler.value}
						</p>
						{(() => {
							const bowlerObj = GameState.bowlingSquad.value.find(
								(p: Player) => p.name === GameState.bowler.value,
							);
							if (!bowlerObj) return null;
							const cv = bowlerObj.bowlStats;
							return (
								<p className="text-xs text-amber-500 font-mono mt-0.5 leading-none">
									{cv.wicketsTaken}-{cv.runsConceded}{" "}
									<span className="text-gray-500">
										({Math.floor(cv.balls / 6)}.{cv.balls % 6})
									</span>
								</p>
							);
						})()}
					</div>
					<p className="text-[9px] text-gray-600 uppercase tracking-wider font-bold">
						Over: {GameState.overRuns.value}
					</p>
				</div>
			</div>

			{/* Timeline Ticker */}
			<div className="flex gap-2 overflow-x-auto py-2 px-1 mask-scroll no-scrollbar">
				{GameState.timeline.value.map((res, i) => (
					<div
						key={i}
						className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-xs font-black ball-pill animate-ball
                        ${res === "W"
								? "bg-red-600 text-white"
								: res === 4
									? "bg-emerald-500 text-black"
									: res === 6
										? "bg-emerald-600 text-white border border-emerald-400"
										: res === 0
											? "bg-gray-800 text-gray-500"
											: "bg-gray-700 text-white"
							}`}
					>
						{res}
					</div>
				))}
			</div>

			<WormGraph
				data={[
					{ over: 0, score: 0, wickets: 0 },
					...GameState.inningsTimeline.value,
				]}
				targetData={
					GameState.innings.value === 2 && GameState.history.value[0]
						? [
							{ over: 0, score: 0, wickets: 0 },
							...GameState.history.value[0].timeline,
						]
						: null
				}
				totalOvers={GameState.formatConfigs[GameState.format.value].balls / 6}
				color={
					GameState.battingTeamName.value === GameState.teams.team2Name.value
						? GameState.teams.team2.value?.color || "#ecc94b"
						: GameState.teams.team1.value?.color || "#60a5fa"
				}
				legend={{
					main: GameState.battingTeamName.value,
					target: GameState.bowlingTeamName.value,
					mainColor:
						GameState.battingTeamName.value === GameState.teams.team2Name.value
							? GameState.teams.team2.value?.color || "#ecc94b"
							: GameState.teams.team1.value?.color || "#60a5fa",
					targetColor:
						GameState.battingTeamName.value === GameState.teams.team1Name.value
							? GameState.teams.team2.value?.color || "#ecc94b"
							: GameState.teams.team1.value?.color || "#60a5fa",
				}}
			/>
		</header>
	);
}
