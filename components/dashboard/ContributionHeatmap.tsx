"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

import { ContributionData } from "@/lib/github";

interface ContributionHeatmapProps {
    activityData?: ContributionData | null;
}

export function ContributionHeatmap({ activityData }: ContributionHeatmapProps) {
    // Determine color based on intensity
    const getColor = (level: number) => {
        switch (level) {
            case 0: return "bg-zinc-900 border-zinc-800/50";
            case 1: return "bg-emerald-900 border-emerald-800";
            case 2: return "bg-emerald-600 border-emerald-500";
            case 3: return "bg-emerald-400 border-emerald-300";
            case 4: return "bg-emerald-300 border-emerald-200 shadow-[0_0_8px_rgba(52,211,153,0.5)]";
            default: return "bg-zinc-900 border-zinc-800";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="col-span-1 rounded-2xl bg-zinc-950/80 border border-white/10 p-6 overflow-hidden flex flex-col justify-between"
        >
            <div className="flex justify-between items-start z-10 w-full mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Activity className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold font-mono tracking-tight text-emerald-100">Activity Heatmap</h2>
                </div>
                <div className="text-sm font-medium text-zinc-400 mt-1">
                    {activityData ? (
                        <span className="text-emerald-400">{activityData.total.toLocaleString()} contributions</span>
                    ) : (
                        <span>Last 365 Days</span>
                    )}
                    <span className="text-zinc-500 uppercase tracking-widest ml-2">in the last year</span>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
                {/* Render columns representing weeks */}
                {(() => {
                    const days = activityData?.days || [];

                    // If less than 364 days, pad or use just the available
                    // GitHub usually has around 371 squares (53 columns x 7 rows)
                    const totalDays = days.length;
                    const weeksCount = Math.ceil(totalDays / 7) || 52;

                    return Array.from({ length: weeksCount }).map((_, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1 flex-shrink-0">
                            {Array.from({ length: 7 }).map((_, dayIndex) => {
                                const dayOffset = (weekIndex * 7) + dayIndex;
                                const dayData = days[dayOffset];

                                // Skip rendering if we run out of days
                                if (dayOffset >= totalDays && totalDays > 0) return <div key={dayIndex} className="w-3 h-3 md:w-[14px] md:h-[14px]" />;

                                const level = dayData ? dayData.level : 0;
                                const dateStr = dayData ? dayData.date : 'Unknown';

                                return (
                                    <div
                                        key={dayIndex}
                                        className={`w-3 h-3 md:w-[14px] md:h-[14px] rounded-[2px] border flex-shrink-0 ${getColor(level)} transition-colors hover:border-white hover:z-10 relative group duration-300`}
                                    >
                                        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none z-50">
                                            {level > 0 ? `${level} contributions` : 'No contributions'} on {dateStr}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ));
                })()}
            </div>
            {/* 
      <div className="flex justify-end gap-2 items-center text-xs text-zinc-500 mt-4">
        <span>Less</span>
        <div className="w-3 h-3 rounded-[2px] bg-zinc-900 border border-zinc-800/50" />
        <div className="w-3 h-3 rounded-[2px] bg-emerald-900 border border-emerald-800" />
        <div className="w-3 h-3 rounded-[2px] bg-emerald-600 border border-emerald-500" />
        <div className="w-3 h-3 rounded-[2px] bg-emerald-400 border border-emerald-300" />
        <div className="w-3 h-3 rounded-[2px] bg-emerald-300 border border-emerald-200" />
        <span>More</span>
      </div> */}
        </motion.div>
    );
}
