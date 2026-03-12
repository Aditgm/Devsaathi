"use client";

import { CFRatingChange, getRankColor } from "@/lib/codeforces";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface Props {
    ratingHistory: CFRatingChange[] | null;
    currentRating?: number;
    maxRating?: number;
}

const RANK_THRESHOLDS = [
    { rating: 3000, label: "Legendary GM", color: "#ff0000" },
    { rating: 2600, label: "International GM", color: "#ff3333" },
    { rating: 2400, label: "Grandmaster", color: "#ff3333" },
    { rating: 2300, label: "International Master", color: "#f79a00" },
    { rating: 2100, label: "Master", color: "#f79a00" },
    { rating: 1900, label: "Candidate Master", color: "#b16db0" },
    { rating: 1600, label: "Expert", color: "#6495ed" },
    { rating: 1400, label: "Specialist", color: "#03c03c" },
    { rating: 1200, label: "Pupil", color: "#77ff77" },
];

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const color = getRankColor(
        RANK_THRESHOLDS.find(t => d.newRating >= t.rating)?.label
    );
    return (
        <div className="bg-zinc-900 border border-white/10 rounded-lg p-3 text-xs shadow-xl">
            <p className="text-zinc-400 mb-1">{d.contestName}</p>
            <p style={{ color }} className="font-bold text-sm">{d.newRating}</p>
            <p className="text-zinc-500">{d.oldRating} → {d.newRating} ({d.newRating - d.oldRating >= 0 ? "+" : ""}{d.newRating - d.oldRating})</p>
            <p className="text-zinc-600 mt-1">Rank #{d.rank}</p>
        </div>
    );
};

export function CFRatingChart({ ratingHistory, currentRating, maxRating }: Props) {
    if (!ratingHistory || ratingHistory.length === 0) {
        return (
            <div className="h-full bg-zinc-950 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center">
                <p className="text-zinc-500 text-sm">No contest history found.</p>
            </div>
        );
    }

    const data = ratingHistory.map(r => ({
        ...r,
        date: new Date(r.ratingUpdateTimeSeconds * 1000).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    }));

    const allRatings = data.map(d => d.newRating);
    const minY = Math.max(0, Math.min(...allRatings) - 100);
    const maxY = Math.max(...allRatings) + 100;

    const currentRankColor = getRankColor(
        RANK_THRESHOLDS.find(t => (currentRating ?? 0) >= t.rating)?.label
    );

    return (
        <div className="h-full bg-zinc-950 border border-white/5 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-zinc-300">Rating History</h3>
                <div className="text-right">
                    <p className="text-xs text-zinc-500">Current / Peak</p>
                    <p className="font-bold text-sm">
                        <span style={{ color: currentRankColor }}>{currentRating ?? "Unrated"}</span>
                        <span className="text-zinc-600"> / </span>
                        <span className="text-zinc-400">{maxRating ?? "—"}</span>
                    </p>
                </div>
            </div>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                        <defs>
                            <linearGradient id="cfRatingGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={currentRankColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={currentRankColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                        <YAxis domain={[minY, maxY]} tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        {RANK_THRESHOLDS.map(t => (
                            t.rating > minY && t.rating < maxY ? (
                                <ReferenceLine key={t.rating} y={t.rating} stroke={t.color} strokeOpacity={0.2} strokeDasharray="3 3" />
                            ) : null
                        ))}
                        <Area type="monotone" dataKey="newRating" stroke={currentRankColor} strokeWidth={2} fill="url(#cfRatingGradient)" dot={false} activeDot={{ r: 4, fill: currentRankColor }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
