"use client";

import { useState, useEffect } from "react";

interface Props {
    submissionCalendar: Record<string, number>;
}

function getColor(count: number): string {
    if (count === 0) return "rgba(255,255,255,0.03)";
    if (count <= 2) return "rgba(249,115,22,0.25)";
    if (count <= 5) return "rgba(249,115,22,0.45)";
    if (count <= 10) return "rgba(249,115,22,0.65)";
    return "rgba(249,115,22,0.9)";
}

function getLast365Days(): string[] {
    const days: string[] = [];
    const now = new Date();
    const utcToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    for (let i = 364; i >= 0; i--) {
        const d = new Date(utcToday);
        d.setUTCDate(d.getUTCDate() - i);
        days.push(
            `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
        );
    }
    return days;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CELL_SIZE = 11; // px per cell
const GAP = 2; // px gap between cells

export function CFHeatmap({ submissionCalendar }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5 h-[200px] animate-pulse" />
        );
    }

    const days = getLast365Days();

    // Build weekly columns: 7 rows (Sun–Sat) × ~53 columns
    const weeks: { date: string; count: number }[][] = [];
    let currentWeek: { date: string; count: number }[] = [];

    // Count stats only within the visible 12-month window
    let totalSubs = 0;
    let activeDays = 0;
    for (const day of days) {
        const count = submissionCalendar[day] || 0;
        totalSubs += count;
        if (count > 0) activeDays++;
    }

    // Pad the first week so columns start on the right day
    const firstDayDate = new Date(`${days[0]}T12:00:00Z`);
    const startPad = firstDayDate.getUTCDay();
    for (let i = 0; i < startPad; i++) {
        currentWeek.push({ date: "", count: -1 });
    }

    for (const day of days) {
        const count = submissionCalendar[day] || 0;
        currentWeek.push({ date: day, count });
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) currentWeek.push({ date: "", count: -1 });
        weeks.push(currentWeek);
    }

    // Place month labels at the correct week columns
    const labels: { text: string; weekIndex: number }[] = [];
    let lastMonthYear = "";
    weeks.forEach((week, wi) => {
        for (const cell of week) {
            if (cell.date) {
                const parts = cell.date.split("-");
                const year = parts[0];
                const monthIdx = parseInt(parts[1]) - 1;
                const monthYear = `${year}-${monthIdx}`;
                if (monthYear !== lastMonthYear) {
                    // Include the year on January or the first label
                    const isJanOrFirst = monthIdx === 0 || labels.length === 0;
                    const labelText = isJanOrFirst
                        ? `${MONTHS[monthIdx]} '${year.slice(2)}`
                        : MONTHS[monthIdx];
                    labels.push({ text: labelText, weekIndex: wi });
                    lastMonthYear = monthYear;
                }
                break;
            }
        }
    });

    const colWidth = CELL_SIZE + GAP; // 13px per column

    return (
        <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-zinc-300">Submission Activity</h3>
                <div className="text-right">
                    <p className="text-xs text-zinc-500">Last 12 months</p>
                    <p className="font-bold text-sm text-white">
                        {totalSubs} <span className="text-zinc-500 font-normal">subs</span>
                        <span className="text-zinc-600 mx-1">·</span>
                        {activeDays} <span className="text-zinc-500 font-normal">active days</span>
                    </p>
                </div>
            </div>

            {/* Scrollable heatmap */}
            <div className="overflow-x-auto">
                <div style={{ minWidth: `${weeks.length * colWidth + 20}px` }}>
                    {/* Month/Year labels */}
                    <div style={{ position: "relative", height: "16px", marginLeft: "18px", marginBottom: "4px" }}>
                        {labels.map((lbl, i) => (
                            <span
                                key={i}
                                className="text-[10px] text-zinc-500 select-none"
                                style={{
                                    position: "absolute",
                                    left: `${lbl.weekIndex * colWidth}px`,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {lbl.text}
                            </span>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="flex gap-[2px]">
                        {/* Day labels */}
                        <div className="flex flex-col gap-[2px] mr-1">
                            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                                <div key={i} className="w-3 h-[11px] text-[9px] text-zinc-600 leading-[11px]">{d}</div>
                            ))}
                        </div>
                        {weeks.map((week, wi) => (
                            <div key={wi} className="flex flex-col gap-[2px]">
                                {week.map((cell, di) => (
                                    <div
                                        key={di}
                                        className="w-[11px] h-[11px] rounded-[2px] transition-colors duration-200"
                                        style={{
                                            backgroundColor: cell.count < 0 ? "transparent" : getColor(cell.count),
                                        }}
                                        title={cell.date ? `${cell.date}: ${cell.count} submission${cell.count !== 1 ? "s" : ""}` : ""}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-[10px] text-zinc-600">Less</span>
                {[0, 2, 5, 10, 15].map((v, i) => (
                    <div
                        key={i}
                        className="w-[11px] h-[11px] rounded-[2px]"
                        style={{ backgroundColor: getColor(v) }}
                    />
                ))}
                <span className="text-[10px] text-zinc-600">More</span>
            </div>
        </div>
    );
}
