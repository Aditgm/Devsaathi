"use client";

import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Layers } from "lucide-react";

interface TechStackChartProps {
    data?: { subject: string; A: number; fullMark: number }[];
}

const mockData = [
    { subject: "TypeScript", A: 120, fullMark: 150 },
    { subject: "React", A: 98, fullMark: 150 },
    { subject: "Python", A: 86, fullMark: 150 },
    { subject: "SQL", A: 99, fullMark: 150 },
    { subject: "Go", A: 85, fullMark: 150 },
    { subject: "Docker", A: 65, fullMark: 150 },
];

export function TechStackChart({ data = mockData }: TechStackChartProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-2xl bg-zinc-950/80 border border-white/10 p-6 overflow-hidden flex flex-col items-center justify-center h-[350px]"
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex justify-between items-start z-10 w-full mb-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Layers className="w-5 h-5 text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold font-mono tracking-tight text-blue-100">Stack Fingerprint</h2>
                </div>
            </div>

            <div className="w-full h-full min-h-[250px] z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#3f3f46" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", color: "#fff", borderRadius: "8px" }}
                            itemStyle={{ color: "#60a5fa" }}
                        />
                        <Radar
                            name="Usage"
                            dataKey="A"
                            stroke="#60a5fa"
                            fill="#3b82f6"
                            fillOpacity={0.4}
                            isAnimationActive={true}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
