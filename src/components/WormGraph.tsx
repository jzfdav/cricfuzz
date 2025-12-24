import { useState } from 'preact/hooks';

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

export function WormGraph({ data, targetData, totalOvers, color = "#fbbf24", legend }: WormGraphProps) {
    if (!data || data.length === 0) return null;

    const [expanded, setExpanded] = useState(false);
    const [collapsed, setCollapsed] = useState(false); // New State
    const [selectedLegend, setSelectedLegend] = useState<'main' | 'target' | null>(null);

    // Config
    const width = expanded ? 700 : 300;
    const height = expanded ? 400 : 120;
    const padding = expanded ? 40 : 25;
    // ... rest of config

    // ... (keep scales and path logic)

    return (
        <div
            className={`transition-all duration-300 ${expanded ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm' : 'relative mt-2'}`}
            onClick={() => !expanded && setExpanded(!expanded)}
        >
            <div
                className={`bg-[#161B22] border border-gray-700 rounded-xl overflow-hidden transition-all duration-300 relative ${expanded ? 'w-[750px] p-6 shadow-2xl flex flex-col gap-4' : 'w-full hover:border-amber-500/50 cursor-pointer shadow-sm'}`}
                onClick={(e) => {
                    if (expanded) e.stopPropagation();
                }}
            >
                {/* Header Controls */}
                <div className={`flex justify-between items-center px-4 ${expanded ? 'pt-0' : 'pt-2'} absolute w-full top-0 left-0 h-10 z-10`}
                    onClick={(e) => {
                        if (!expanded) {
                            e.stopPropagation(); // Prevent expansion if clicking header controls directly (optional, but safer to let clicking anywhere expand)
                            // Actually user wants "Click to collapse" button alongside "Click to expand"
                        }
                    }}
                >
                    {!expanded && (
                        <div className="flex justify-between w-full items-center">
                            <h3 className="font-bold uppercase tracking-widest text-gray-500 text-[9px]">Worm Graph</h3>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCollapsed(!collapsed);
                                }}
                                className="text-[9px] text-gray-500 hover:text-white uppercase font-bold px-2 py-1 rounded hover:bg-gray-800 transition-colors"
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

                {expanded && <h3 className="font-black uppercase tracking-[0.2em] text-amber-500 text-sm text-center mt-2">Match Analysis</h3>}

                {/* Main Graph Content - Hidden if Collapsed (and not expanded) */}
                {(!collapsed || expanded) && (
                    <div className={`relative ${expanded ? 'mt-4' : 'mt-8'} ${graphClass}`} style={{ backgroundColor: graphBg }}>

                        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                            {/* Axes & Grid */}
                            <>
                                {Array.from({ length: Math.ceil(maxOvers / 5) + 1 }).map((_, i) => {
                                    const tick = i * 5;
                                    if (tick > maxOvers) return null;
                                    const x = getX(tick);
                                    return (
                                        <g key={`x-${tick}`}>
                                            <line x1={x} y1={padding} x2={x} y2={height - padding} stroke="#333" strokeWidth="0.5" strokeDasharray="2" />
                                            <text x={x} y={height - padding + (expanded ? 20 : 12)} fill={hasDarkTeam ? "#f1f5f9" : "#666"} style={{ fontSize: expanded ? '12px' : '8px' }} textAnchor="middle" fontWeight="bold">{tick}</text>
                                        </g>
                                    );
                                })}
                                {Array.from({ length: Math.ceil(maxScore / 50) + 1 }).map((_, i) => {
                                    const tick = i * 50;
                                    if (tick > maxScore) return null;
                                    const y = getY(tick);
                                    if (tick === 0) return null;
                                    return (
                                        <g key={`y-${tick}`}>
                                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#333" strokeWidth="0.5" strokeDasharray="2" />
                                            <text x={padding - (expanded ? 10 : 6)} y={y + (expanded ? 4 : 3)} fill={hasDarkTeam ? "#f1f5f9" : "#666"} style={{ textAnchor: 'end', fontSize: expanded ? '12px' : '8px' }} fontWeight="bold">{tick}</text>
                                        </g>
                                    );
                                })}
                                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={hasDarkTeam ? "#cbd5e1" : "#555"} strokeWidth="1" />
                                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke={hasDarkTeam ? "#cbd5e1" : "#555"} strokeWidth="1" />
                            </>

                            {/* Lines - Added drop shadow filter for pop */}
                            <defs>
                                <filter id="shadow">
                                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.5" />
                                </filter>
                            </defs>

                            {targetLine && <path d={targetLine} fill="none" stroke={effectiveTargetColor} strokeWidth="1.5" strokeDasharray="3" filter="url(#shadow)" />}
                            <path d={mainLine} fill="none" stroke={color} strokeWidth={expanded ? 2.5 : 1.5} filter="url(#shadow)" />

                            {/* Wicket Dots (Target) */}
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

                            {/* Wicket Dots (Main) */}
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
                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Fall of Wickets - <span style={{ color: selectedLegend === 'target' ? effectiveTargetColor : legend?.mainColor }}>{activeTeamName}</span></h4>
                        <div className="flex flex-wrap gap-2">
                            {activeFOW.length === 0 ? <span className="text-xs text-gray-600 italic">No Wickets</span> :
                                activeFOW.map((p, i) => (
                                    <div key={i} className="bg-gray-800 px-2 py-1 rounded border border-gray-700 text-xs">
                                        <span className="text-white font-bold">{p.score}-{p.wickets}</span>
                                        <span className="text-gray-500 ml-1 text-[10px]">({p.over} ov)</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Legend Footer */}
                {legend && (!collapsed || expanded) && (
                    <div className="flex justify-between items-center px-4 mt-1 pb-2">
                        <div
                            className={`flex items-center gap-2 cursor-pointer ${expanded ? 'hover:bg-gray-800 p-2 rounded' : ''} ${selectedLegend === 'main' || (!selectedLegend && expanded) ? 'ring-1 ring-gray-600' : ''}`}
                            onClick={(e) => {
                                if (expanded) {
                                    e.stopPropagation();
                                    setSelectedLegend('main');
                                }
                            }}
                        >
                            <svg width="25" height="6" className="overflow-visible">
                                <line x1="0" y1="3" x2="25" y2="3" stroke={legend.mainColor || color} strokeWidth={expanded ? 2.5 : 1.5} strokeLinecap="round" />
                            </svg>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{legend.main}</span>
                        </div>

                        {legend.target && targetData && (
                            <div
                                className={`flex items-center gap-2 cursor-pointer ${expanded ? 'hover:bg-gray-800 p-2 rounded' : ''} ${selectedLegend === 'target' ? 'ring-1 ring-gray-600' : ''}`}
                                onClick={(e) => {
                                    if (expanded) {
                                        e.stopPropagation();
                                        setSelectedLegend('target');
                                    }
                                }}
                            >
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{legend.target}</span>
                                <svg width="25" height="6" className="overflow-visible">
                                    <path d="M 0 3 L 25 3" fill="none" stroke={effectiveTargetColor} strokeWidth="1.5" strokeDasharray="3" strokeLinecap="round" />
                                </svg>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}
