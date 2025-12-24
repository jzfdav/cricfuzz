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
    const [selectedLegend, setSelectedLegend] = useState<'main' | 'target' | null>(null);

    // Config - Compact Defaults
    const width = expanded ? 700 : 300;
    const height = expanded ? 400 : 120; // Reduced height in expanded to make room for FOW
    const padding = expanded ? 40 : 25;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    // Scales
    const currentDataOver = data[data.length - 1]?.over || 0;
    let maxOvers = totalOvers || 20;

    // If it's the 1st innings (no targetData), scale dynamically
    if (!targetData) {
        const dynamicCeiling = Math.ceil((currentDataOver + 0.1) / 10) * 10;
        maxOvers = Math.min(dynamicCeiling, totalOvers);
    }
    maxOvers = Math.max(10, maxOvers);
    const maxScore = Math.max(
        data[data.length - 1]?.score || 0,
        targetData ? targetData[targetData.length - 1]?.score || 0 : 0,
        100
    );

    const getX = (over: number) => padding + (over / maxOvers) * graphWidth;
    const getY = (score: number) => height - padding - (score / maxScore) * graphHeight;

    // Build Paths
    const buildPath = (pts: DataPoint[]) => {
        if (!pts.length) return "";
        let d = `M ${getX(0)} ${getY(0)} `;
        pts.forEach(p => {
            d += `L ${getX(p.over)} ${getY(p.score)} `;
        });
        return d;
    };

    const mainLine = buildPath(data);
    const targetLine = targetData ? buildPath(targetData) : "";

    // Wicket Dots Calculation (Helper)
    const getWicketDots = (pts: DataPoint[]) => {
        return pts.filter((p, i) => i > 0 && p.wickets > pts[i - 1].wickets).map(p => ({
            cx: getX(p.over),
            cy: getY(p.score),
            over: p.over,
            score: p.score,
            wicketNo: p.wickets
        }));
    };

    const mainWickets = getWicketDots(data);
    const targetWickets = targetData ? getWicketDots(targetData) : [];

    // FOW Data Extraction (only when expanded)
    const getFOWList = (pts: DataPoint[]) => {
        return pts.filter((p, i) => i > 0 && p.wickets > pts[i - 1].wickets);
    }

    // Default to main team if none selected
    const activeFOW = (selectedLegend === 'target' && targetData) ? getFOWList(targetData) : getFOWList(data);
    const activeTeamName = (selectedLegend === 'target' && legend?.target) ? legend.target : legend?.main;

    return (
        <div
            className={`transition-all duration-300 ${expanded ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm' : 'relative mt-2'}`}
            onClick={() => setExpanded(!expanded)}
        >
            <div
                className={`bg-[#161B22] border border-gray-700 rounded-xl overflow-hidden transition-all duration-300 relative ${expanded ? 'w-[750px] p-6 shadow-2xl flex flex-col gap-4' : 'w-full hover:border-amber-500/50 cursor-pointer shadow-sm'}`}
                onClick={(e) => {
                    if (expanded) e.stopPropagation();
                }}
            >
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

                <div className="flex justify-between items-center px-4 pt-2 absolute w-full top-0 left-0">
                    {!expanded && <h3 className="font-bold uppercase tracking-widest text-gray-500 text-[9px]">Worm Graph</h3>}
                    {!expanded && <span className="text-[9px] text-amber-500 opacity-60">Click to Expand</span>}
                </div>

                {expanded && <h3 className="font-black uppercase tracking-[0.2em] text-amber-500 text-sm text-center mt-2">Match Analysis</h3>}

                <div className="relative">
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
                                        <text x={x} y={height - padding + (expanded ? 20 : 12)} fill="#666" style={{ fontSize: expanded ? '12px' : '8px' }} textAnchor="middle" fontWeight="bold">{tick}</text>
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
                                        <text x={padding - (expanded ? 10 : 6)} y={y + (expanded ? 4 : 3)} fill="#666" style={{ textAnchor: 'end', fontSize: expanded ? '12px' : '8px' }} fontWeight="bold">{tick}</text>
                                    </g>
                                );
                            })}
                            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#555" strokeWidth="1" />
                            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#555" strokeWidth="1" />
                        </>

                        {/* Lines */}
                        {targetLine && <path d={targetLine} fill="none" stroke={legend?.targetColor || "#555"} strokeWidth="1.5" strokeDasharray="3" />}
                        <path d={mainLine} fill="none" stroke={color} strokeWidth={expanded ? 2.5 : 1.5} />

                        {/* Wicket Dots (Target) */}
                        {targetWickets.map((p, i) => (
                            <g key={`t-${i}`}>
                                <circle
                                    cx={p.cx}
                                    cy={p.cy}
                                    r={expanded ? 4 : 2}
                                    fill="#ef4444"
                                    stroke={legend?.targetColor || "#555"}
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

                {/* Expanded FOW Section */}
                {expanded && (
                    <div className="border-t border-gray-700 pt-4 px-4">
                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Fall of Wickets - <span style={{ color: selectedLegend === 'target' ? legend?.targetColor : legend?.mainColor }}>{activeTeamName}</span></h4>
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
                {legend && (
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
                                    <path d="M 0 3 L 25 3" fill="none" stroke={legend.targetColor || "#555"} strokeWidth="1.5" strokeDasharray="3" strokeLinecap="round" />
                                </svg>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}
