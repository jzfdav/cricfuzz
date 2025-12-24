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
    };
}

export function WormGraph({ data, targetData, totalOvers, color = "#fbbf24", legend }: WormGraphProps) {
    if (!data || data.length === 0) return null;

    const [expanded, setExpanded] = useState(false);

    // Config - Compact Defaults
    const width = expanded ? 700 : 300;
    const height = expanded ? 500 : 120; // Increased height slightly to accommodate padding
    const padding = expanded ? 40 : 25;  // Increased padding to clear title overlap
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    // Scales
    const currentDataOver = data[data.length - 1]?.over || 0;

    // Dynamic Scaling Logic
    let maxOvers = totalOvers || 20;

    // If it's the 1st innings (no targetData), scale dynamically
    if (!targetData) {
        // Round up to nearest 10
        const dynamicCeiling = Math.ceil((currentDataOver + 0.1) / 10) * 10;
        maxOvers = Math.min(dynamicCeiling, totalOvers);
    }

    // Safety lower bound
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

    return (
        <div
            className={`transition-all duration-300 ${expanded ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm' : 'relative mt-2'}`}
            onClick={() => setExpanded(!expanded)}
        >
            <div
                className={`bg-[#161B22] border border-gray-700 rounded-xl overflow-hidden transition-all duration-300 relative ${expanded ? 'w-[750px] p-6 shadow-2xl' : 'w-full hover:border-amber-500/50 cursor-pointer shadow-sm'}`}
                onClick={(e) => {
                    if (expanded) e.stopPropagation();
                }}
            >
                {expanded && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(false);
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

                {expanded && <h3 className="font-black uppercase tracking-[0.2em] text-amber-500 text-sm mb-4 text-center">Match Analysis</h3>}

                <svg width="100%" height={expanded ? 500 : 120} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                    {/* Axes & Grid */}
                    <>
                        {/* Grid & Ticks */}
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
                            if (tick === 0) return null; // Skip 0
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

                    {/* Target Line (if 2nd innings) */}
                    {targetLine && (
                        <path d={targetLine} fill="none" stroke="#555" strokeWidth="1.5" strokeDasharray="3" />
                    )}

                    {/* Main Line */}
                    <path d={mainLine} fill="none" stroke={color} strokeWidth={expanded ? 2.5 : 1.5} />

                    {/* Wickets */}
                    {data.filter(p => p.wickets > (data[data.indexOf(p) - 1]?.wickets || 0)).map((p, i) => (
                        <circle
                            key={i}
                            cx={getX(p.over)}
                            cy={getY(p.score)}
                            r={expanded ? 3 : 1.5}
                            fill="#ef4444"
                            stroke="#161B22"
                            strokeWidth="1"
                        />
                    ))}
                </svg>

                {/* Legend Footer */}
                {legend && (
                    <div className="flex justify-between items-center px-4 mt-1 pb-2">
                        {/* Main Team (Left) */}
                        <div className="flex items-center gap-2">
                            <svg width="25" height="6" className="overflow-visible">
                                <line x1="0" y1="3" x2="25" y2="3" stroke={color} strokeWidth={expanded ? 2.5 : 1.5} strokeLinecap="round" />
                            </svg>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{legend.main}</span>
                        </div>

                        {/* Target Team (Right) */}
                        {legend.target && targetData && (
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{legend.target}</span>
                                <svg width="25" height="6" className="overflow-visible">
                                    <path d="M 0 3 L 25 3" fill="none" stroke="#555" strokeWidth="1.5" strokeDasharray="3" strokeLinecap="round" />
                                </svg>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}
