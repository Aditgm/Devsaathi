"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Target } from "lucide-react";

interface ContestRatingProps {
    contest: {
        attendedContestsCount: number;
        rating: number;
        globalRanking: number;
        totalParticipants: number;
        topPercentage: number;
    };
}

export function ContestRatingChart({ contest }: ContestRatingProps) {
    if (!contest || contest.attendedContestsCount === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-1 rounded-2xl bg-zinc-950/80 border border-white/10 p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px]"
            >
                <TrendingUp className="w-12 h-12 text-zinc-700 mb-4" />
                <h3 className="text-xl font-bold font-mono text-zinc-400">No Contest Data</h3>
                <p className="text-sm text-zinc-600 mt-2 max-w-xs">
                    This user hasn't participated in any rated LeetCode contests yet.
                </p>
            </motion.div>
        );
    }

    const rating = Math.round(contest.rating);
    const topPercent = contest.topPercentage.toFixed(1);

    // Determine badge color based on rating tiers (approximate LC tiers)
    let badgeColor = "bg-zinc-500 text-zinc-100";
    let badgeBorder = "border-zinc-500/20";
    let badgeText = "Contestant";

    if (rating >= 2150) {
        badgeColor = "bg-red-500/20 text-red-400";
        badgeBorder = "border-red-500/30";
        badgeText = "Guardian";
    } else if (rating >= 1900) {
        badgeColor = "bg-amber-500/20 text-amber-400";
        badgeBorder = "border-amber-500/30";
        badgeText = "Knight";
    } else if (rating >= 1500) {
        badgeColor = "bg-blue-500/20 text-blue-400";
        badgeBorder = "border-blue-500/30";
        badgeText = "Advanced";
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-1 py-6 px-6 rounded-2xl bg-gradient-to-b from-[#0e1a2a] to-zinc-950/90 border border-blue-500/10 flex flex-col h-full relative overflow-hidden"
        >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full" data-html2canvas-ignore="true" />

            <div className="flex items-center justify-between mb-8 z-10">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-bold font-mono tracking-tight text-white">Contest Rating</h2>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${badgeColor} ${badgeBorder}`}>
                    {badgeText}
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center z-10 mb-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-blue-200"
                >
                    {rating}
                </motion.div>
                <div className="text-sm font-medium text-blue-400 mt-2">Elo Rating</div>
            </div>

            <div className="grid grid-cols-2 gap-4 z-10 mt-auto">
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col gap-1 items-center justify-center text-center">
                    <Target className="w-5 h-5 text-cyan-400 mb-1" />
                    <span className="text-2xl font-bold font-mono text-zinc-200">Top {topPercent}%</span>
                    <span className="text-xs text-zinc-500">Global Rank</span>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col gap-1 items-center justify-center text-center">
                    <Users className="w-5 h-5 text-indigo-400 mb-1" />
                    <span className="text-2xl font-bold font-mono text-zinc-200">{contest.attendedContestsCount}</span>
                    <span className="text-xs text-zinc-500">Contests Attended</span>
                </div>
            </div>
        </motion.div>
    );
}
