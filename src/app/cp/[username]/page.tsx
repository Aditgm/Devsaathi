import { Suspense } from "react";
import { ArrowLeft, Share2, Briefcase, FileCode2, Code2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaangScoreCard } from "@/components/dashboard/FaangScoreCard";
import { AiRoastPanel } from "@/components/dashboard/AiRoastPanel";
import { LeetCodeStats } from "@/components/dashboard/LeetCodeStats";
import { ContestRatingChart } from "@/components/dashboard/ContestRatingChart";
import { TopTopicsChart } from "@/components/dashboard/TopTopicsChart";
import { fetchLeetCodeProfile, fetchLeetCodeStats, fetchLeetCodeContest, fetchLeetCodeCalendar, fetchLeetCodeSkills } from "@/lib/leetcode";
import { computeCPScore } from "@/lib/scoring";
import { generateCPRoast } from "@/lib/roast";
import { redis } from "@/lib/redis";
import { FadeIn } from "@/components/animations/FadeIn";
import Image from "next/image";

export default async function CPDashboard({ params }: { params: { username: string } }) {
    const username = params.username;

    let profileData: any = null;
    let statsData: any = null;
    let contestData: any = null;
    let calendarData: any = null;
    let skillsData: any = null;
    let scoreData: any = null;
    let roast = "";

    try {
        const cacheKey = `devsaathi:cp:v6:${username.toLowerCase()}`;

        // Check Redis cache first
        if (redis) {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                const parsed = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
                profileData = parsed.profileData;
                statsData = parsed.statsData;
                contestData = parsed.contestData;
                calendarData = parsed.calendarData;
                skillsData = parsed.skillsData;
                scoreData = parsed.scoreData;
                roast = parsed.roast;
            }
        }

        // No cache hit — fetch live data
        if (!profileData) {
            profileData = await fetchLeetCodeProfile(username);

            if (profileData) {
                statsData = await fetchLeetCodeStats(username);
                contestData = await fetchLeetCodeContest(username);
                calendarData = await fetchLeetCodeCalendar(username);
                skillsData = await fetchLeetCodeSkills(username);

                scoreData = await computeCPScore(profileData, statsData, contestData, calendarData);
                roast = await generateCPRoast(username, profileData, statsData, contestData, skillsData, scoreData);

                // Cache the results for 24 hours
                if (redis) {
                    await redis.setex(cacheKey, 86400, JSON.stringify({
                        profileData,
                        statsData,
                        contestData,
                        calendarData,
                        skillsData,
                        scoreData,
                        roast
                    }));
                }
            }
        }

    } catch (e) {
        console.error("Failed to load CP Data:", e);
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <Code2 className="w-16 h-16 text-zinc-600 mb-6" />
                <h1 className="text-3xl font-bold mb-2">User not found</h1>
                <p className="text-zinc-400 mb-8">Could not locate @{username} on LeetCode.</p>
                <Link href="/">
                    <Button variant="outline" className="border-white/10 hover:bg-white/10">Try another username</Button>
                </Link>
            </div>
        );
    }

    const totalSolved = statsData?.solved?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0;
    const rating = contestData?.rating ? Math.round(contestData.rating) : "Unrated";
    const ranking = profileData?.profile?.ranking || "Unranked";

    // Map CP-specific breakdown keys to the generic score card prop names
    const mappedBreakdown = scoreData ? {
        commits: scoreData.breakdown.algos,
        quality: scoreData.breakdown.mastery,
        diversity: scoreData.breakdown.persistence,
        oss: scoreData.breakdown.speed
    } : undefined;

    return (
        <div id="devsaathi-cp-dashboard" className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Dynamic Background with Cyan/Blue aesthetic */}
            <div className="fixed inset-0 z-0" data-html2canvas-ignore="true">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_40%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_40%)]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
                {/* Navigation */}
                <nav className="flex items-center justify-between mb-8">
                    <Link href="/">
                        <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/10 gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Search
                        </Button>
                    </Link>
                    <div className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-400">LeetCode</span> Roaster
                    </div>
                </nav>

                {/* Header Profile Section */}
                <FadeIn delay={0.1} direction="up">
                    <div className="mb-12 flex flex-col items-center md:items-start md:flex-row gap-6">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-900 shadow-[0_0_30px_rgba(56,189,248,0.3)] relative">
                            {profileData.profile?.userAvatar ? (
                                <Image src={profileData.profile.userAvatar} alt={username} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-zinc-800" />
                            )}
                        </div>
                        <div className="space-y-2 text-center md:text-left">
                            <h1 className="text-4xl font-bold flex items-center gap-3">
                                {profileData.profile?.realName || username}
                            </h1>
                            <p className="text-zinc-400 text-lg max-w-xl">{profileData.profile?.aboutMe || "Just another algorithmic monkey."}</p>
                            <div className="flex gap-4 items-center text-sm text-zinc-500 mt-2">
                                <span><strong className="text-white">{totalSolved}</strong> Problems Solved</span>
                                <span><strong className="text-white">#{ranking}</strong> Global Rank</span>
                                <span><strong className="text-white">{rating}</strong> Contest Rating</span>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
                    {/* Left Column (Main Stats + Roast) */}
                    <div className="lg:col-span-2 space-y-6 flex flex-col">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                            <FadeIn delay={0.2} direction="up" className="h-full">
                                {/* Temporarily reusing FaangScoreCard - we will update its labels passed as props to avoid changing GitHub mode */}
                                <FaangScoreCard score={scoreData?.score} breakdown={mappedBreakdown} isCPMode={true} />
                            </FadeIn>
                            <FadeIn delay={0.3} direction="up" className="h-full">
                                <AiRoastPanel roastText={roast} isCPMode={true} />
                            </FadeIn>
                        </div>

                        <FadeIn delay={0.4} direction="up" className="h-[300px]">
                            <LeetCodeStats stats={statsData} />
                        </FadeIn>
                    </div>

                    {/* Right Column (Side Stats) */}
                    <div className="space-y-6 flex flex-col">
                        <FadeIn delay={0.5} direction="up" className="flex-1 min-h-[300px]">
                            <ContestRatingChart contest={contestData} />
                        </FadeIn>
                        <FadeIn delay={0.6} direction="up" className="flex-1 min-h-[300px]">
                            <TopTopicsChart skills={skillsData} />
                        </FadeIn>
                    </div>
                </div>
            </div>
        </div>
    );
}
