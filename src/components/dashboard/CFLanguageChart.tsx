"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
    languageMap: Record<string, number>;
}

const COLORS = [
    "#f97316", "#fb923c", "#fdba74", "#fed7aa",
    "#ea580c", "#c2410c", "#9a3412", "#7c2d12",
    "#ff6b35", "#e85d04",
];

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const { name, value, percent } = payload[0];
    return (
        <div className="bg-zinc-900 border border-white/10 rounded-lg p-3 text-xs shadow-xl">
            <p className="text-orange-400 font-bold">{name}</p>
            <p className="text-zinc-300">{value} problems · {(percent * 100).toFixed(1)}%</p>
        </div>
    );
};

export function CFLanguageChart({ languageMap }: Props) {
    const entries = Object.entries(languageMap)
        .sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
        return (
            <div className="h-full bg-zinc-950 border border-white/5 rounded-2xl p-5 flex items-center justify-center">
                <p className="text-zinc-500 text-sm">No language data.</p>
            </div>
        );
    }

    // Show top 6, bundle the rest as "Other"
    const top = entries.slice(0, 6);
    const otherCount = entries.slice(6).reduce((sum, [, c]) => sum + c, 0);
    const data = top.map(([name, value]) => ({ name, value }));
    if (otherCount > 0) data.push({ name: "Other", value: otherCount });

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="h-full bg-zinc-950 border border-white/5 rounded-2xl p-5 flex flex-col">
            <h3 className="font-semibold text-sm text-zinc-300 mb-4">Languages Used</h3>
            <div className="flex-1 flex items-center gap-4">
                <div className="w-1/2 h-full min-h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius="55%"
                                outerRadius="85%"
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-1.5 overflow-y-auto max-h-[200px]">
                    {data.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-2 text-xs">
                            <div
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: COLORS[i % COLORS.length] }}
                            />
                            <span className="text-zinc-400 truncate flex-1">{d.name}</span>
                            <span className="text-zinc-500 shrink-0">{Math.round((d.value / total) * 100)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
