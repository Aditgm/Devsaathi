"use client";

import { TrendingUp, TrendingDown, Trophy, Target, Flame, Hash } from "lucide-react";

interface ContestPerf {
    totalContests: number;
    avgRank: number;
    bestGain: { contest: string; delta: number; newRating: number };
    worstLoss: { contest: string; delta: number; newRating: number };
    currentStreak: number;
    streakType: "win" | "loss";
}

interface Props {
    performance: ContestPerf | null;
}

export function CFContestPerformance({ performance }: Props) {
    if (!performance) {
        return (
            <div className="h-full bg-zinc-950 border border-white/5 rounded-2xl p-5 flex items-center justify-center">
                <p className="text-zinc-500 text-sm">No contest data.</p>
            </div>
        );
    }

    const { totalContests, avgRank, bestGain, worstLoss, currentStreak, streakType } = performance;

    return (
        <div className="h-full bg-zinc-950 border border-white/5 rounded-2xl p-5 flex flex-col">
            <h3 className="font-semibold text-sm text-zinc-300 mb-4">Contest Performance</h3>

            <div className="grid grid-cols-2 gap-3 flex-1">
                {/* Total Contests */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center">
                    <Trophy className="w-4 h-4 text-orange-400 mb-1.5" />
                    <p className="text-xl font-bold text-white">{totalContests}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Contests</p>
                </div>

                {/* Avg Rank */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center">
                    <Hash className="w-4 h-4 text-blue-400 mb-1.5" />
                    <p className="text-xl font-bold text-white">{avgRank}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Avg Rank</p>
                </div>

                {/* Best Gain */}
                <div className="bg-emerald-500/[0.05] border border-emerald-500/10 rounded-xl p-3 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Best</span>
                    </div>
                    <p className="text-lg font-bold text-emerald-400">+{bestGain.delta}</p>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5" title={bestGain.contest}>{bestGain.contest}</p>
                </div>

                {/* Worst Loss */}
                <div className="bg-red-500/[0.05] border border-red-500/10 rounded-xl p-3 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-1">
                        <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-[10px] text-red-400 uppercase tracking-wider font-semibold">Worst</span>
                    </div>
                    <p className="text-lg font-bold text-red-400">{worstLoss.delta}</p>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5" title={worstLoss.contest}>{worstLoss.contest}</p>
                </div>

                {/* Current Streak - spans full width */}
                <div className="col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Flame className={`w-4 h-4 ${streakType === "win" ? "text-emerald-400" : "text-red-400"}`} />
                        <span className="text-xs text-zinc-400">Current Streak</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className={`text-lg font-bold ${streakType === "win" ? "text-emerald-400" : "text-red-400"}`}>
                            {currentStreak}
                        </span>
                        <span className={`text-[10px] uppercase tracking-wider font-semibold ${streakType === "win" ? "text-emerald-400" : "text-red-400"}`}>
                            {streakType === "win" ? "wins" : "losses"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
