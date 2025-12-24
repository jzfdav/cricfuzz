import { useMemo } from 'preact/hooks';

interface DataPoint {
    over: number;
    score: number;
    wickets: number;
}

interface ScaleOptions {
    data: DataPoint[];
    targetData?: DataPoint[] | null;
    totalOvers: number;
    width: number;
    height: number;
    padding: number;
}

export function useWormGraphScales({ data, targetData, totalOvers, width, height, padding }: ScaleOptions) {
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    const { maxOvers, maxScore } = useMemo(() => {
        const currentDataOver = data[data.length - 1]?.over || 0;
        let mOvers = totalOvers || 20;

        if (!targetData) {
            const dynamicCeiling = Math.ceil((currentDataOver + 0.1) / 10) * 10;
            mOvers = Math.min(dynamicCeiling, totalOvers);
        }
        mOvers = Math.max(10, mOvers);

        const mScore = Math.max(
            data[data.length - 1]?.score || 0,
            targetData ? targetData[targetData.length - 1]?.score || 0 : 0,
            100
        );

        return { maxOvers: mOvers, maxScore: mScore };
    }, [data, targetData, totalOvers]);

    const getX = (over: number) => padding + (over / maxOvers) * graphWidth;
    const getY = (score: number) => height - padding - (score / maxScore) * graphHeight;

    const buildPath = (pts: DataPoint[]) => {
        if (!pts.length) return "";
        let d = `M ${getX(0)} ${getY(0)} `;
        pts.forEach(p => {
            d += `L ${getX(p.over)} ${getY(p.score)} `;
        });
        return d;
    };

    const getWicketDots = (pts: DataPoint[]) => {
        return pts.filter((p, i) => i > 0 && p.wickets > pts[i - 1].wickets).map(p => ({
            cx: getX(p.over),
            cy: getY(p.score),
            over: p.over,
            score: p.score,
            wicketNo: p.wickets
        }));
    };

    return {
        getX,
        getY,
        maxOvers,
        maxScore,
        mainLine: buildPath(data),
        targetLine: targetData ? buildPath(targetData) : "",
        mainWickets: getWicketDots(data),
        targetWickets: targetData ? getWicketDots(targetData) : []
    };
}
