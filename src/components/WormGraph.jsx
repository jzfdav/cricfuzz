
import { useState } from 'preact/hooks';

export function WormGraph({ data, targetData, totalOvers, color = "#fbbf24" }) {
    if (!data || data.length === 0) return null;

    const [expanded, setExpanded] = useState(false);

    // Config
    const width = expanded ? 600 : 200;
    const height = expanded ? 300 : 100;
    const padding = expanded ? 40 : 10;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    // Scales
    const maxOvers = totalOvers || 20;
    const maxScore = Math.max(
        data[data.length - 1]?.score || 0,
        targetData ? targetData[targetData.length - 1]?.score || 0 : 0,
        100
    );

    const getX = (over) => padding + (over / maxOvers) * graphWidth;
    const getY = (score) => height - padding - (score / maxScore) * graphHeight;

    // Build Paths
    const buildPath = (pts) => {
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
            className={`transition-all duration-300 ${expanded ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm' : 'relative'}`}
            onClick={() => !expanded && setExpanded(true)}
        >
            <div
                className={`bg-[#161B22] border border-gray-700 rounded-xl overflow-hidden transition-all duration-300 relative ${expanded ? 'w-[700px] p-8' : 'w-full hover:border-amber-500/50 cursor-pointer'}`}
                onClick={(e) => {
                    if (expanded) e.stopPropagation();
                }}
            >
                {expanded && (
                    <button
                        onClick={() => setExpanded(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>
                )}

                <div className="flex justify-between items-center mb-2 px-2 pt-2">
                    <h3 className={`font-bold uppercase tracking-widest text-gray-400 ${expanded ? 'text-lg' : 'text-[10px]'}`}>Worm Graph</h3>
                    {!expanded && <span className="text-[10px] text-amber-500">Click to Expand</span>}
                </div>

                <svg width="100%" height={expanded ? 400 : 120} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                    {/* Axes (Expanded Only) */}
                    {expanded && (
                        <>
                            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#333" strokeWidth="1" />
                            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#333" strokeWidth="1" />
                            <text x={width - padding} y={height - padding + 20} fill="#666" fontSize="12" textAnchor="middle">Overs</text>
                            <text x={padding - 10} y={padding} fill="#666" fontSize="12" textAnchor="end">Runs</text>
                        </>
                    )}

                    {/* Target Line (if 2nd innings) */}
                    {targetLine && (
                        <path d={targetLine} fill="none" stroke="#555" strokeWidth="2" strokeDasharray="4" />
                    )}

                    {/* Main Line */}
                    <path d={mainLine} fill="none" stroke={color} strokeWidth={expanded ? 3 : 2} />

                    {/* Wickets */}
                    {data.filter(p => p.wickets > (data[data.indexOf(p) - 1]?.wickets || 0)).map((p, i) => (
                        <circle
                            key={i}
                            cx={getX(p.over)}
                            cy={getY(p.score)}
                            r={expanded ? 4 : 2}
                            fill="#ef4444"
                            stroke="#161B22"
                            strokeWidth="1"
                        />
                    ))}
                </svg>
            </div>
        </div>
    );
}
