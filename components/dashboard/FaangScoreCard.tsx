"use client";

import { motion } from "framer-motion";
import { Zap, Trophy, TrendingUp, GitCommit, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FaangScoreProps {
    score: number;
    breakdown: {
        commits: number;
        quality: number;
        diversity: number;
        oss: number;
    };
    isCPMode?: boolean;
}

export function FaangScoreCard({ score = 78, breakdown, isCPMode = false }: Partial<FaangScoreProps>) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative col-span-1 rounded-2xl bg-zinc-950/80 border border-white/10 p-6 overflow-hidden flex flex-col justify-between"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 ${isCPMode ? 'bg-cyan-500/10' : 'bg-purple-500/10'} blur-3xl rounded-full`} data-html2canvas-ignore="true" />

            <div className="flex justify-between items-start z-10 w-full mb-6 relative">
                <div className="flex items-center gap-2">
                    <div className={`p-2 ${isCPMode ? 'bg-cyan-500/20' : 'bg-purple-500/20'} rounded-lg`}>
                        <Trophy className={`w-5 h-5 ${isCPMode ? 'text-cyan-400' : 'text-purple-400'}`} />
                    </div>
                    <h2 className="text-xl font-bold font-mono tracking-tight text-zinc-100">{isCPMode ? "Algorithmic Score" : "FAANG Score"}</h2>
                </div>
                <div className="text-right">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-6xl font-black text-white"
                    >
                        {score}
                    </motion.div>
                    <div className="text-sm font-medium text-zinc-500 uppercase tracking-widest mt-1">/ 100</div>
                </div>
            </div>

            <div className="space-y-4 z-10 w-full">
                {/* Progress Breakdown */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2 text-zinc-400"><GitCommit className={`w-4 h-4 ${isCPMode ? 'text-cyan-400' : 'text-emerald-400'}`} /> {isCPMode ? "Algos Prowess" : "Commit Consistency"}</span>
                        <span className="font-mono">{breakdown?.commits || (isCPMode ? 20 : 12)}/{isCPMode ? 40 : 15}</span>
                    </div>
                    <Progress value={((breakdown?.commits || (isCPMode ? 20 : 12)) / (isCPMode ? 40 : 15)) * 100} className="h-1.5 bg-zinc-800" indicatorClassName={isCPMode ? 'bg-cyan-400' : 'bg-emerald-400'} />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2 text-zinc-400"><Zap className={`w-4 h-4 ${isCPMode ? 'text-blue-400' : 'text-orange-400'}`} /> {isCPMode ? "Contest Speed" : "Project Quality"}</span>
                        <span className="font-mono">{breakdown?.oss || (isCPMode ? 10 : 18)}/{isCPMode ? 20 : 20}</span>
                    </div>
                    <Progress value={((breakdown?.oss || (isCPMode ? 10 : 18)) / 20) * 100} className="h-1.5 bg-zinc-800" indicatorClassName={isCPMode ? 'bg-blue-400' : 'bg-orange-400'} />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2 text-zinc-400"><TrendingUp className={`w-4 h-4 ${isCPMode ? 'text-indigo-400' : 'text-blue-400'}`} /> {isCPMode ? "Pattern Mastery" : "Impact Score"}</span>
                        <span className="font-mono">{breakdown?.quality || 10}/{isCPMode ? 20 : 15}</span>
                    </div>
                    <Progress value={((breakdown?.quality || 10) / (isCPMode ? 20 : 15)) * 100} className="h-1.5 bg-zinc-800" indicatorClassName={isCPMode ? 'bg-indigo-400' : 'bg-blue-400'} />
                </div>

                {isCPMode && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2 text-zinc-400"><Flame className="w-4 h-4 text-orange-500" /> Grind / Consistency</span>
                            <span className="font-mono">{breakdown?.diversity || 10}/20</span>
                        </div>
                        <Progress value={((breakdown?.diversity || 10) / 20) * 100} className="h-1.5 bg-zinc-800" indicatorClassName="bg-orange-500" />
                    </div>
                )}
            </div>
        </motion.div>
    );
}
