import { ArrowLeft, Code2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaangScoreCard } from "@/components/dashboard/FaangScoreCard";
import { AiRoastPanel } from "@/components/dashboard/AiRoastPanel";
import { CFRatingChart } from "@/components/dashboard/CFRatingChart";
import { CFProblemStats } from "@/components/dashboard/CFProblemStats";
import { CFLanguageChart } from "@/components/dashboard/CFLanguageChart";
import { CFHeatmap } from "@/components/dashboard/CFHeatmap";
import { CFRecentSubmissions } from "@/components/dashboard/CFRecentSubmissions";
import { CFContestPerformance } from "@/components/dashboard/CFContestPerformance";
import { fetchCFProfile, fetchCFRatingHistory, fetchCFSubmissions, computeCFSolvedStats, computeContestPerformance, getRankColor } from "@/lib/codeforces";
import { computeCFScore } from "@/lib/scoring";
import { generateCPRoast } from "@/lib/roast";
import { redis } from "@/lib/redis";
import { FadeIn } from "@/components/animations/FadeIn";

export default async function CFDashboard({ params }: { params: { handle: string } }) {
    const handle = params.handle;

    let profileData: any = null;
    let ratingHistory: any = null;
    let solvedStats: any = null;
    let scoreData: any = null;
    let contestPerf: any = null;
    let roast = "";

    try {
        const cacheKey = `devsaathi:cf:v6:${handle.toLowerCase()}`;

        // Try cache first (isolated so a Redis failure doesn't block the fetch)
        if (redis) {
            try {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
                    profileData = parsed.profileData;
                    ratingHistory = parsed.ratingHistory;
                    solvedStats = parsed.solvedStats;
                    scoreData = parsed.scoreData;
                    contestPerf = parsed.contestPerf;
                    roast = parsed.roast;
                }
            } catch (redisErr) {
                console.error("[Redis Cache] Error reading cache:", redisErr);
            }
        }

        if (!profileData) {
            // Fetch with delays to respect Codeforces' rate limits
            const profile = await fetchCFProfile(handle);
            if (profile) {
                await new Promise(r => setTimeout(r, 500));
                const history = await fetchCFRatingHistory(handle);
                await new Promise(r => setTimeout(r, 500));
                const submissions = await fetchCFSubmissions(handle);

                profileData = profile;
                ratingHistory = history ?? [];
                solvedStats = submissions ? computeCFSolvedStats(submissions) : null;
                contestPerf = computeContestPerformance(ratingHistory);
                scoreData = computeCFScore(profileData, ratingHistory, solvedStats);

                // Translate CF rating buckets to Easy/Medium/Hard for the roast generator
                const mappedStats = solvedStats ? {
                    solved: [
                        { difficulty: 'Easy', count: (solvedStats.ratingBuckets["≤ 1200"] || 0) + (solvedStats.ratingBuckets["1200–1599"] || 0) },
                        { difficulty: 'Medium', count: (solvedStats.ratingBuckets["1600–1999"] || 0) + (solvedStats.ratingBuckets["2000–2399"] || 0) },
                        { difficulty: 'Hard', count: (solvedStats.ratingBuckets["2400+"] || 0) }
                    ]
                } : { solved: [] };

                const mappedSkills = solvedStats ? {
                    advanced: solvedStats.topTags.slice(0, 3).map((t: { tag: string, count: number }) => ({ tagName: t.tag, problemsSolved: t.count })),
                    intermediate: solvedStats.topTags.slice(3, 6).map((t: { tag: string, count: number }) => ({ tagName: t.tag, problemsSolved: t.count })),
                    fundamental: solvedStats.topTags.slice(6, 8).map((t: { tag: string, count: number }) => ({ tagName: t.tag, problemsSolved: t.count })),
                } : null;

                roast = await generateCPRoast(
                    handle,
                    { profile: { realName: `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || handle, ranking: profile.rating } },
                    mappedStats,
                    { rating: profile.rating, attendedContestsCount: ratingHistory?.length ?? 0 },
                    mappedSkills,
                    scoreData
                );

                if (redis) {
                    try {
                        await redis.setex(cacheKey, 86400, JSON.stringify({ profileData, ratingHistory, solvedStats, scoreData, contestPerf, roast }));
                    } catch (redisErr) {
                        console.error("[Redis Cache] Error writing cache:", redisErr);
                    }
                }
            }
        }
    } catch (e) {
        console.error("Failed to load CF data:", e);
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <Code2 className="w-16 h-16 text-zinc-600 mb-6" />
                <h1 className="text-3xl font-bold mb-2">Handle not found</h1>
                <p className="text-zinc-400 mb-8">Could not locate <span className="font-mono">@{handle}</span> on Codeforces.</p>
                <Link href="/"><Button variant="outline" className="border-white/10 hover:bg-white/10">Try another handle</Button></Link>
            </div>
        );
    }

    const rankColor = getRankColor(profileData.rank);
    const mappedBreakdown = scoreData ? {
        commits: scoreData.breakdown.algos,
        quality: scoreData.breakdown.mastery,
        diversity: scoreData.breakdown.persistence,
        oss: scoreData.breakdown.speed,
    } : undefined;

    return (
        <div className="min-h-screen bg-black text-white selection:bg-orange-500/30">
            <div className="fixed inset-0 z-0" data-html2canvas-ignore="true">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_40%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(239,68,68,0.08),transparent_40%)]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
                <nav className="flex items-center justify-between mb-8">
                    <Link href="/">
                        <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/10 gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Search
                        </Button>
                    </Link>
                    <div className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <span style={{ color: rankColor }}>Codeforces</span> Roaster
                    </div>
                </nav>

                {/* Profile Header */}
                <FadeIn delay={0.1} direction="up">
                    <div className="mb-12 flex flex-col items-center md:items-start md:flex-row gap-6">
                        <div
                            className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-900 flex items-center justify-center text-5xl font-bold"
                            style={{ boxShadow: `0 0 30px ${rankColor}44`, background: `radial-gradient(circle, ${rankColor}22, transparent)` }}
                        >
                            {profileData.avatar ? (

                                <img src={profileData.avatar} alt={handle} className="w-full h-full object-cover" />
                            ) : (
                                <span style={{ color: rankColor }}>{handle[0]?.toUpperCase()}</span>
                            )}
                        </div>
                        <div className="space-y-2 text-center md:text-left">
                            <h1 className="text-4xl font-bold">
                                {profileData.firstName || profileData.lastName
                                    ? `${profileData.firstName ?? ""} ${profileData.lastName ?? ""}`.trim()
                                    : handle}
                            </h1>
                            <p className="font-mono text-zinc-400">@{handle}</p>
                            <div className="flex gap-4 flex-wrap items-center text-sm text-zinc-500 mt-2">
                                <span style={{ color: rankColor }} className="font-semibold capitalize">{profileData.rank ?? "Unrated"}</span>
                                <span><strong className="text-white">{profileData.rating ?? "—"}</strong> Rating</span>
                                <span><strong className="text-white">{profileData.maxRating ?? "—"}</strong> Peak</span>
                                <span><strong className="text-white">{ratingHistory?.length ?? 0}</strong> Contests</span>
                                {solvedStats && <span><strong className="text-white">{solvedStats.totalSolved}</strong> Solved</span>}
                                {solvedStats && <span><strong className="text-white">{solvedStats.totalSubmissions}</strong> Submissions</span>}
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* Row 1: Score + Roast */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
                    <div className="lg:col-span-2 space-y-6 flex flex-col">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                            <FadeIn delay={0.2} direction="up" className="h-full">
                                <FaangScoreCard score={scoreData?.score} breakdown={mappedBreakdown} isCPMode={true} />
                            </FadeIn>
                            <FadeIn delay={0.3} direction="up" className="h-full">
                                <AiRoastPanel roastText={roast} isCPMode={true} />
                            </FadeIn>
                        </div>
                    </div>

                    {/* Contest Performance */}
                    <div className="space-y-6 flex flex-col">
                        <FadeIn delay={0.35} direction="up" className="flex-1">
                            <CFContestPerformance performance={contestPerf} />
                        </FadeIn>
                    </div>
                </div>

                {/* Row 2: Rating Chart */}
                <FadeIn delay={0.4} direction="up" className="h-[320px] mb-6">
                    <CFRatingChart ratingHistory={ratingHistory} currentRating={profileData.rating} maxRating={profileData.maxRating} />
                </FadeIn>

                {/* Row 3: Submission Heatmap */}
                {solvedStats?.submissionCalendar && (
                    <FadeIn delay={0.45} direction="up" className="mb-6">
                        <CFHeatmap submissionCalendar={solvedStats.submissionCalendar} />
                    </FadeIn>
                )}

                {/* Row 4: Problem Stats + Language Chart + Recent Submissions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
                    <FadeIn delay={0.5} direction="up" className="min-h-[300px]">
                        {solvedStats ? (
                            <CFProblemStats
                                ratingBuckets={solvedStats.ratingBuckets}
                                topTags={solvedStats.topTags}
                                totalSolved={solvedStats.totalSolved}
                                avgProblemRating={solvedStats.avgProblemRating}
                            />
                        ) : (
                            <div className="h-full bg-zinc-950 border border-white/5 rounded-2xl p-5 flex items-center justify-center">
                                <p className="text-zinc-500 text-sm">No submission data.</p>
                            </div>
                        )}
                    </FadeIn>

                    <FadeIn delay={0.55} direction="up" className="min-h-[300px]">
                        <CFLanguageChart languageMap={solvedStats?.languageMap ?? {}} />
                    </FadeIn>

                    <FadeIn delay={0.6} direction="up" className="min-h-[300px]">
                        <CFRecentSubmissions recentSubmissions={solvedStats?.recentSubmissions ?? []} />
                    </FadeIn>
                </div>
            </div>
        </div>
    );
}
