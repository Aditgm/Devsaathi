"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ChartNoAxesColumn } from "lucide-react";

interface TopTopicsChartProps {
    skills: {
        advanced: { tagName: string; problemsSolved: number }[];
        intermediate: { tagName: string; problemsSolved: number }[];
        fundamental: { tagName: string; problemsSolved: number }[];
    } | null;
}

export function TopTopicsChart({ skills }: TopTopicsChartProps) {
    if (!skills) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-1 rounded-2xl bg-zinc-950/80 border border-white/10 p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px]"
            >
                <ChartNoAxesColumn className="w-12 h-12 text-zinc-700 mb-4" />
                <h3 className="text-xl font-bold font-mono text-zinc-400">No Skills Data</h3>
                <p className="text-sm text-zinc-600 mt-2 max-w-xs">
                    This user hasn't solved enough problems to generate a skill distribution.
                </p>
            </motion.div>
        );
    }


    const allTags = [
        ...(skills.advanced || []),
        ...(skills.intermediate || []),
        ...(skills.fundamental || [])
    ];

    // Tags can appear in multiple categories — sum them up
    const tagMap = new Map<string, number>();
    allTags.forEach(tag => {
        tagMap.set(tag.tagName, (tagMap.get(tag.tagName) || 0) + tag.problemsSolved);
    });


    const topTagsData = Array.from(tagMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    if (topTagsData.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-1 rounded-2xl bg-zinc-950 border border-white/10 p-6 flex flex-col h-full min-h-[300px] shadow-xl relative overflow-hidden"
        >
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full" data-html2canvas-ignore="true" />

            <div className="flex items-center gap-2 mb-6 z-10">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <ChartNoAxesColumn className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold font-mono tracking-tight text-white">Top Problem Tags</h2>
            </div>

            <div className="flex-1 w-full z-10">
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                    <BarChart data={topTagsData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#a1a1aa", fontSize: 13 }}
                            width={100}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                            contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", borderRadius: "8px", color: "#fff" }}
                            itemStyle={{ color: "#22d3ee", fontWeight: "bold" }}
                        />
                        <Bar
                            dataKey="count"
                            fill="#22d3ee"
                            radius={[0, 4, 4, 0]}
                            barSize={20}
                            animationDuration={1500}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
