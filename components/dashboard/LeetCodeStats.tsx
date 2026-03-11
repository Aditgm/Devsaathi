"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CheckCircle2 } from "lucide-react";

interface LeetCodeStatsProps {
    stats: {
        solved: { difficulty: string; count: number }[];
        total: { difficulty: string; count: number }[];
    };
}

export function LeetCodeStats({ stats }: LeetCodeStatsProps) {
    if (!stats || !stats.solved) return null;

    const easySolved = stats.solved.find(s => s.difficulty === "Easy")?.count || 0;
    const mediumSolved = stats.solved.find(s => s.difficulty === "Medium")?.count || 0;
    const hardSolved = stats.solved.find(s => s.difficulty === "Hard")?.count || 0;

    const easyTotal = stats.total.find(t => t.difficulty === "Easy")?.count || 1;
    const mediumTotal = stats.total.find(t => t.difficulty === "Medium")?.count || 1;
    const hardTotal = stats.total.find(t => t.difficulty === "Hard")?.count || 1;

    const totalSolved = easySolved + mediumSolved + hardSolved;

    const data = [
        { name: "Easy", value: easySolved, color: "#10b981" },   // Emerald 500
        { name: "Medium", value: mediumSolved, color: "#f59e0b" }, // Amber 500
        { name: "Hard", value: hardSolved, color: "#ef4444" },   // Red 500
    ].filter(d => d.value > 0);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative col-span-1 rounded-2xl bg-zinc-950/80 border border-white/10 p-6 flex flex-col justify-between h-full"
        >
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold font-mono tracking-tight text-white">Problem Stats</h2>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 flex-1">
                {/* Donut Chart */}
                <div className="w-40 h-40 relative flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", borderRadius: "8px", color: "#fff" }}
                                itemStyle={{ color: "#fff" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black text-white">{totalSolved}</span>
                        <span className="text-xs text-zinc-500 font-medium">Solved</span>
                    </div>
                </div>

                {/* Breakdown List */}
                <div className="flex-1 w-full space-y-4">
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                            <span className="text-emerald-400 font-medium">Easy</span>
                            <span className="font-mono text-zinc-300">
                                {easySolved} <span className="text-zinc-600">/ {easyTotal}</span>
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (easySolved / easyTotal) * 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-emerald-500 rounded-full"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                            <span className="text-amber-400 font-medium">Medium</span>
                            <span className="font-mono text-zinc-300">
                                {mediumSolved} <span className="text-zinc-600">/ {mediumTotal}</span>
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (mediumSolved / mediumTotal) * 100)}%` }}
                                transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
                                className="h-full bg-amber-500 rounded-full"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                            <span className="text-red-400 font-medium">Hard</span>
                            <span className="font-mono text-zinc-300">
                                {hardSolved} <span className="text-zinc-600">/ {hardTotal}</span>
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (hardSolved / hardTotal) * 100)}%` }}
                                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                                className="h-full bg-red-500 rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
