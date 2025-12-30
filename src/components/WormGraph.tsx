import { useState } from "preact/hooks";
import { useWormGraphScales } from "../hooks/useWormGraphScales";
import { getColorDistance, getLuminance, isDark } from "../utils/colorUtils";

interface DataPoint {
	over: number;
	score: number;
	wickets: number;
}

interface WormGraphProps {
	data: DataPoint[];
	targetData?: DataPoint[] | null;
	totalOvers: number;
	color?: string;
	legend?: {
		main: string;
		target?: string;
		mainColor?: string;
		targetColor?: string;
	};
}

export function WormGraph({
	data,
	targetData,
	totalOvers,
	color = "#fbbf24",
	legend,
}: WormGraphProps) {
	if (!data || data.length === 0) return null;

	const [expanded, setExpanded] = useState(false);
	const [collapsed, setCollapsed] = useState(false);
	const [selectedLegend, setSelectedLegend] = useState<
		"main" | "target" | null
	>(null);

	// Config
	const width = expanded ? 700 : 300;
	const height = expanded ? 400 : 120;
	const padding = expanded ? 40 : 25;

	// Use Modular Scales Hook
	const {
		getX,
		getY,
		maxOvers,
		maxScore,
		mainLine,
		targetLine,
		mainWickets,
		targetWickets,
	} = useWormGraphScales({
		data,
		targetData,
		totalOvers,
		width,
		height,
		padding,
	});

	// Color Logic (Optimized with Utils)
	let effectiveTargetColor = legend?.targetColor || "#555";
	if (color && legend?.targetColor) {
		const dist = getColorDistance(color, legend.targetColor);
		if (dist < 60) {
			const mainIsDark = getLuminance(color) < 128;
			effectiveTargetColor = mainIsDark ? "#e2e8f0" : "#1e293b";
		}
	}

	const hasDarkTeam = isDark(color) || isDark(effectiveTargetColor);
	const graphBg = hasDarkTeam ? "#64748b" : "transparent";
	const graphClass = hasDarkTeam ? "rounded-lg shadow-inner" : "";

	// FOW Data Helpers
	const getFOWList = (pts: DataPoint[]) =>
		pts.filter((p, i) => i > 0 && p.wickets > pts[i - 1].wickets);
	const activeFOW =
		selectedLegend === "target" && targetData
			? getFOWList(targetData)
			: getFOWList(data);
	const activeTeamName =
		selectedLegend === "target" && legend?.target
			? legend.target
			: legend?.main;

	return (
		<div
			className={`transition-all duration-300 ${expanded ? "fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" : "relative mt-2"}`}
			onClick={() => !expanded && setExpanded(!expanded)}
		>
			<div
				className={`bg-[#161B22] border border-gray-700 rounded-xl overflow-hidden transition-all duration-300 relative ${expanded ? "w-[750px] p-6 shadow-2xl flex flex-col gap-4" : "w-full hover:border-amber-500/50 cursor-pointer shadow-sm"}`}
				onClick={(e) => {
					if (expanded) e.stopPropagation();
				}}
			>
				{/* Header Controls */}
				<div
					className={`flex justify-between items-center px-4 ${expanded ? "absolute w-full top-0 left-0 pt-0 h-10 z-10" : "relative h-10 border-b border-gray-800/50"}`}
					onClick={(e) => {
						if (!expanded) {
							// expansion is handled by parent
						}
					}}
				>
					{!expanded && (
						<div className="flex justify-between w-full items-center">
							<h3 className="font-bold uppercase tracking-widest text-gray-500 text-[9px]">
								Worm Graph
							</h3>
							<button
								onClick={(e) => {
									e.stopPropagation();
									setCollapsed(!collapsed);
								}}
								className="text-[9px] text-amber-500 hover:text-white uppercase font-black px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors border border-amber-500/20"
							>
								{collapsed ? "Show Graph" : "Hide Graph"}
							</button>
						</div>
					)}

					{expanded && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								setExpanded(false);
								setSelectedLegend(null);
							}}
							className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 z-10"
						>
							✕
						</button>
					)}
				</div>

				{expanded && (
					<h3 className="font-black uppercase tracking-[0.2em] text-amber-500 text-sm text-center mt-2">
						Match Analysis
					</h3>
				)}

				{/* Main Graph Content */}
				{(!collapsed || expanded) && (
					<div
						className={`relative ${expanded ? "mt-8" : "mt-2"} ${graphClass}`}
						style={{ backgroundColor: graphBg }}
					>
						<svg
							width="100%"
							height={height}
							viewBox={`0 0 ${width} ${height}`}
							className="overflow-visible"
						>
							{/* Grid (Modularly rendered) */}
							<>
								{Array.from({ length: Math.ceil(maxOvers / 5) + 1 }).map(
									(_, i) => {
										const tick = i * 5;
										if (tick > maxOvers) return null;
										const x = getX(tick);
										return (
											<g key={`x-${tick}`}>
												<line
													x1={x}
													y1={padding}
													x2={x}
													y2={height - padding}
													stroke="#333"
													strokeWidth="0.5"
													strokeDasharray="2"
												/>
												<text
													x={x}
													y={height - padding + (expanded ? 20 : 12)}
													fill={hasDarkTeam ? "#f1f5f9" : "#666"}
													style={{ fontSize: expanded ? "12px" : "8px" }}
													textAnchor="middle"
													fontWeight="bold"
												>
													{tick}
												</text>
											</g>
										);
									},
								)}
								{Array.from({ length: Math.ceil(maxScore / 50) + 1 }).map(
									(_, i) => {
										const tick = i * 50;
										if (tick > maxScore) return null;
										const y = getY(tick);
										if (tick === 0) return null;
										return (
											<g key={`y-${tick}`}>
												<line
													x1={padding}
													y1={y}
													x2={width - padding}
													y2={y}
													stroke="#333"
													strokeWidth="0.5"
													strokeDasharray="2"
												/>
												<text
													x={padding - (expanded ? 10 : 6)}
													y={y + (expanded ? 4 : 3)}
													fill={hasDarkTeam ? "#f1f5f9" : "#666"}
													style={{
														textAnchor: "end",
														fontSize: expanded ? "12px" : "8px",
													}}
													fontWeight="bold"
												>
													{tick}
												</text>
											</g>
										);
									},
								)}
								<line
									x1={padding}
									y1={height - padding}
									x2={width - padding}
									y2={height - padding}
									stroke={hasDarkTeam ? "#cbd5e1" : "#555"}
									strokeWidth="1"
								/>
								<line
									x1={padding}
									y1={padding}
									x2={padding}
									y2={height - padding}
									stroke={hasDarkTeam ? "#cbd5e1" : "#555"}
									strokeWidth="1"
								/>
							</>

							<defs>
								<filter id="shadow">
									<feDropShadow
										dx="0"
										dy="1"
										stdDeviation="1"
										floodOpacity="0.5"
									/>
								</filter>
							</defs>

							{targetLine && (
								<path
									d={targetLine}
									fill="none"
									stroke={effectiveTargetColor}
									strokeWidth="1.5"
									strokeDasharray="3"
									filter="url(#shadow)"
								/>
							)}
							<path
								d={mainLine}
								fill="none"
								stroke={color}
								strokeWidth={expanded ? 2.5 : 1.5}
								filter="url(#shadow)"
							/>

							{/* Target Wickets */}
							{targetWickets.map((p, i) => (
								<g key={`t-${i}`}>
									<circle
										cx={p.cx}
										cy={p.cy}
										r={expanded ? 4 : 2}
										fill="#ef4444"
										stroke={effectiveTargetColor}
										strokeWidth={expanded ? 2 : 1}
									/>
								</g>
							))}

							{/* Main Wickets */}
							{mainWickets.map((p, i) => (
								<g key={`m-${i}`}>
									<circle
										cx={p.cx}
										cy={p.cy}
										r={expanded ? 4 : 2}
										fill="#ef4444"
										stroke={legend?.mainColor || color}
										strokeWidth={expanded ? 2 : 1}
									/>
								</g>
							))}
						</svg>
					</div>
				)}

				{/* Expanded FOW Section */}
				{expanded && (
					<div className="border-t border-gray-700 pt-4 px-4">
						<h4 className="text-xs font-bold uppercase text-gray-400 mb-2">
							Fall of Wickets -{" "}
							<span
								style={{
									color:
										selectedLegend === "target"
											? effectiveTargetColor
											: legend?.mainColor,
								}}
							>
								{activeTeamName}
							</span>
						</h4>
						<div className="flex flex-wrap gap-2">
							{activeFOW.length === 0 ? (
								<span className="text-xs text-gray-600 italic">No Wickets</span>
							) : (
								activeFOW.map((p, i) => (
									<div
										key={i}
										className="bg-gray-800 px-2 py-1 rounded border border-gray-700 text-xs"
									>
										<span className="text-white font-bold">
											{p.score}-{p.wickets}
										</span>
										<span className="text-gray-500 ml-1 text-[10px]">
											({p.over} ov)
										</span>
									</div>
								))
							)}
						</div>
					</div>
				)}

				{/* Legend Footer */}
				{legend && (!collapsed || expanded) && (
					<div className="flex justify-between items-center px-4 mt-1 pb-2">
						<div
							className={`flex items-center gap-2 cursor-pointer ${expanded ? "hover:bg-gray-800 p-2 rounded" : ""} ${selectedLegend === "main" || (!selectedLegend && expanded) ? "ring-1 ring-gray-600" : ""}`}
							onClick={(e) => {
								if (expanded) {
									e.stopPropagation();
									setSelectedLegend("main");
								}
							}}
						>
							<svg width="25" height="6" className="overflow-visible">
								<line
									x1="0"
									y1="3"
									x2="25"
									y2="3"
									stroke={legend.mainColor || color}
									strokeWidth={expanded ? 2.5 : 1.5}
									strokeLinecap="round"
								/>
							</svg>
							<span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
								{legend.main}
							</span>
						</div>

						{legend.target && targetData && (
							<div
								className={`flex items-center gap-2 cursor-pointer ${expanded ? "hover:bg-gray-800 p-2 rounded" : ""} ${selectedLegend === "target" ? "ring-1 ring-gray-600" : ""}`}
								onClick={(e) => {
									if (expanded) {
										e.stopPropagation();
										setSelectedLegend("target");
									}
								}}
							>
								<span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
									{legend.target}
								</span>
								<svg width="25" height="6" className="overflow-visible">
									<path
										d="M 0 3 L 25 3"
										fill="none"
										stroke={effectiveTargetColor}
										strokeWidth="1.5"
										strokeDasharray="3"
										strokeLinecap="round"
									/>
								</svg>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
