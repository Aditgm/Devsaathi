"use client";

import { CFRecentSub } from "@/lib/codeforces";

interface Props {
    recentSubmissions: CFRecentSub[];
}

function getVerdictStyle(verdict: string): { color: string; bg: string; label: string } {
    const v = verdict.toUpperCase();
    if (v === "OK") return { color: "#22c55e", bg: "rgba(34,197,94,0.1)", label: "AC" };
    if (v === "WRONG_ANSWER") return { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "WA" };
    if (v === "TIME_LIMIT_EXCEEDED") return { color: "#eab308", bg: "rgba(234,179,8,0.1)", label: "TLE" };
    if (v === "MEMORY_LIMIT_EXCEEDED") return { color: "#a855f7", bg: "rgba(168,85,247,0.1)", label: "MLE" };
    if (v === "RUNTIME_ERROR") return { color: "#f97316", bg: "rgba(249,115,22,0.1)", label: "RE" };
    if (v === "COMPILATION_ERROR") return { color: "#64748b", bg: "rgba(100,116,139,0.1)", label: "CE" };
    return { color: "#6b7280", bg: "rgba(107,114,128,0.1)", label: verdict.slice(0, 3) };
}

function timeAgo(seconds: number): string {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - seconds;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 2592000)}mo ago`;
}

function getRatingBadgeColor(rating?: number): string {
    if (!rating) return "#52525b";
    if (rating >= 2400) return "#ff3333";
    if (rating >= 1900) return "#f79a00";
    if (rating >= 1600) return "#b16db0";
    if (rating >= 1400) return "#6495ed";
    if (rating >= 1200) return "#03c03c";
    return "#77ff77";
}

export function CFRecentSubmissions({ recentSubmissions }: Props) {
    if (!recentSubmissions || recentSubmissions.length === 0) {
        return (
            <div className="h-full bg-zinc-950 border border-white/5 rounded-2xl p-5 flex items-center justify-center">
                <p className="text-zinc-500 text-sm">No recent submissions.</p>
            </div>
        );
    }

    return (
        <div className="h-full bg-zinc-950 border border-white/5 rounded-2xl p-5 flex flex-col">
            <h3 className="font-semibold text-sm text-zinc-300 mb-3">Recent Submissions</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {recentSubmissions.map((sub, i) => {
                    const vs = getVerdictStyle(sub.verdict);
                    return (
                        <a
                            key={i}
                            href={sub.contestId ? `https://codeforces.com/contest/${sub.contestId}/problem/${sub.index}` : "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-200 group cursor-pointer"
                        >
                            {/* Verdict badge */}
                            <div
                                className="shrink-0 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase"
                                style={{ color: vs.color, backgroundColor: vs.bg }}
                            >
                                {vs.label}
                            </div>

                            {/* Problem info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-zinc-200 truncate group-hover:text-white transition-colors">
                                    {sub.contestId ? `${sub.contestId}${sub.index}` : sub.index}. {sub.problemName}
                                </p>
                                <p className="text-[10px] text-zinc-600 mt-0.5">
                                    {sub.language}
                                </p>
                            </div>

                            {/* Rating + time */}
                            <div className="shrink-0 text-right">
                                {sub.problemRating && (
                                    <span
                                        className="text-[10px] font-bold"
                                        style={{ color: getRatingBadgeColor(sub.problemRating) }}
                                    >
                                        {sub.problemRating}
                                    </span>
                                )}
                                <p className="text-[10px] text-zinc-600">{timeAgo(sub.timeSeconds)}</p>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
