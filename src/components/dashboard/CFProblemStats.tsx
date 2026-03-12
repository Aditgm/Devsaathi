"use client";

interface RatingBuckets {
    [key: string]: number;
}

interface TopTag {
    tag: string;
    count: number;
}

interface Props {
    ratingBuckets: RatingBuckets;
    topTags: TopTag[];
    totalSolved: number;
    avgProblemRating: number;
}

const BUCKET_COLORS: Record<string, string> = {
    "≤ 1200": "#77ff77",
    "1200–1599": "#6495ed",
    "1600–1999": "#b16db0",
    "2000–2399": "#f79a00",
    "2400+": "#ff3333",
};

export function CFProblemStats({ ratingBuckets, topTags, totalSolved, avgProblemRating }: Props) {
    const maxBucket = Math.max(...Object.values(ratingBuckets), 1);
    const maxTag = Math.max(...topTags.map(t => t.count), 1);

    return (
        <div className="h-full bg-zinc-950 border border-white/5 rounded-2xl p-5 flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-zinc-300">Problem Stats</h3>
                <div className="text-right">
                    <p className="text-xs text-zinc-500">Total AC · Avg Rating</p>
                    <p className="font-bold text-sm text-white">
                        {totalSolved} <span className="text-zinc-600">|</span> <span className="text-orange-400">{avgProblemRating || "?"}</span>
                    </p>
                </div>
            </div>

            <div>
                <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">By Difficulty</p>
                <div className="space-y-2">
                    {Object.entries(ratingBuckets).map(([bucket, count]) => (
                        <div key={bucket} className="flex items-center gap-3">
                            <span className="text-xs text-zinc-400 w-20 shrink-0">{bucket}</span>
                            <div className="flex-1 bg-zinc-800/50 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${(count / maxBucket) * 100}%`,
                                        backgroundColor: BUCKET_COLORS[bucket] ?? "#9ca3af",
                                    }}
                                />
                            </div>
                            <span className="text-xs font-medium text-zinc-300 w-6 text-right">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {topTags.length > 0 && (
                <div>
                    <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Top Topics</p>
                    <div className="space-y-1.5">
                        {topTags.slice(0, 5).map(({ tag, count }) => (
                            <div key={tag} className="flex items-center gap-3">
                                <span className="text-xs text-zinc-400 w-28 shrink-0 truncate">{tag}</span>
                                <div className="flex-1 bg-zinc-800/50 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-orange-500/60 transition-all duration-700"
                                        style={{ width: `${(count / maxTag) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs text-zinc-500 w-5 text-right">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
