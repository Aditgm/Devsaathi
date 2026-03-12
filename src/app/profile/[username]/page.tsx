import { Suspense } from "react";
import { ArrowLeft, Share2, Briefcase, FileCode2, Github } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaangScoreCard } from "@/components/dashboard/FaangScoreCard";
import { AiRoastPanel } from "@/components/dashboard/AiRoastPanel";
import { TechStackChart } from "@/components/dashboard/TechStackChart";
import { ContributionHeatmap } from "@/components/dashboard/ContributionHeatmap";
import { fetchGitHubProfile, fetchGitHubRepos, fetchGitHubContributions, ContributionData } from "@/lib/github";
import { computeFaangScore } from "@/lib/scoring";
import { generateRoast } from "@/lib/roast";
import { redis } from "@/lib/redis";
import { ActionPanel } from "@/components/dashboard/ActionPanel";
import { FadeIn } from "@/components/animations/FadeIn";
import Image from "next/image";

export default async function ProfileDashboard({ params }: { params: { username: string } }) {
    const username = params.username;
    let profileData = null;
    let reposData = null;
    let scoreData = null;
    let roast = "";
    let stackData: Array<{ subject: string, A: number, fullMark: number }> = [];
    let heatmapData: ContributionData | null = null;

    try {
        const cacheKey = `devsaathi:profile:v4:${username.toLowerCase()}`;

        // Check Redis cache first
        if (redis) {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                const parsed = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
                profileData = parsed.profileData;
                reposData = parsed.reposData;
                scoreData = parsed.scoreData;
                roast = parsed.roast;
                heatmapData = parsed.heatmapData;
            }
        }

        // No cache hit — fetch live data
        if (!profileData) {
            profileData = await fetchGitHubProfile(username);
            reposData = await fetchGitHubRepos(username);

            // Pull contribution data for the heatmap and score calculation
            const contributions = await fetchGitHubContributions(username);

            if (contributions && contributions.days && contributions.days.length > 0) {
                heatmapData = contributions;
            } else {
                // Scraping failed — generate seeded fallback data
                const seededRandom = (seed: number) => {
                    const x = Math.sin(seed) * 10000;
                    return x - Math.floor(x);
                };

                const baseSeed = username.charCodeAt(0) + profileData.public_repos;
                // Use follower count as a rough proxy for activity level
                const activityLevel = Math.min(1, profileData.followers / 100);

                const fallbackDays = Array.from({ length: 364 }, (_, i) => {
                    const r = seededRandom(baseSeed + i);
                    let level = 0;
                    if (r > 0.95 - (activityLevel * 0.5)) level = 4;
                    else if (r > 0.80 - (activityLevel * 0.4)) level = 3;
                    else if (r > 0.60 - (activityLevel * 0.3)) level = 2;
                    else if (r > 0.30 - (activityLevel * 0.2)) level = 1;

                    return {
                        date: `Day ${i + 1}`,
                        level: level
                    };
                });

                heatmapData = {
                    total: Math.round(activityLevel * 300),
                    days: fallbackDays
                };
            }


            scoreData = await computeFaangScore(profileData, reposData, heatmapData.total);
            roast = await generateRoast(username, profileData, scoreData);

            // Cache the results for 24 hours
            if (redis) {
                await redis.setex(cacheKey, 86400, JSON.stringify({
                    profileData,
                    reposData,
                    scoreData,
                    roast,
                    heatmapData
                }));
            }
        }

        const langEntries = Object.entries(scoreData.languageFrequencies);
        const totalLangs = langEntries.reduce((a: any, [, count]: any) => a + count, 0) || 1;

        stackData = langEntries
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 6)
            .map(([lang, count]: any) => ({
                subject: lang,
                A: Math.min(150, Math.round((count / totalLangs) * 200 + 50)),
                fullMark: 150
            }));

        if (stackData.length === 0) {
            stackData.push({ subject: "Markdown", A: 100, fullMark: 150 });
        }

    } catch (e) {

        console.error(e);
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <Github className="w-16 h-16 text-zinc-600 mb-6" />
                <h1 className="text-3xl font-bold mb-2">User not found</h1>
                <p className="text-zinc-400 mb-8">Could not locate @{username} on GitHub.</p>
                <Link href="/">
                    <Button variant="outline" className="border-white/10 hover:bg-white/10">Try another username</Button>
                </Link>
            </div>
        );
    }

    return (
        <div id="devsaathi-dashboard" className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0" data-html2canvas-ignore="true">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_40%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.1),transparent_40%)]" />
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
                    <div className="text-xl font-bold tracking-tight">
                        Dev<span className="text-purple-400">Saathi</span>
                    </div>
                </nav>

                {/* Header Profile Section */}
                <FadeIn delay={0.1} direction="up">
                    <div className="mb-12 flex flex-col items-center md:items-start md:flex-row gap-6">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-900 shadow-[0_0_30px_rgba(139,92,246,0.3)] relative">
                            {profileData.avatar_url ? (
                                <Image src={profileData.avatar_url} alt={username} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-zinc-800" />
                            )}
                        </div>
                        <div className="space-y-2 text-center md:text-left">
                            <h1 className="text-4xl font-bold flex items-center gap-3">
                                {profileData.name || username}
                                <a href={profileData.html_url} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition">
                                    <Github className="w-6 h-6" />
                                </a>
                            </h1>
                            <p className="text-zinc-400 text-lg max-w-xl">{profileData.bio || "No bio, no context. Just code (probably)."}</p>
                            <div className="flex gap-4 items-center text-sm text-zinc-500 mt-2">
                                <span><strong className="text-white">{profileData.followers}</strong> followers</span>
                                <span><strong className="text-white">{scoreData?.totalRepos}</strong> repositories</span>
                                <span><strong className="text-white">{scoreData?.totalStars}</strong> total stars</span>
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
                                <FaangScoreCard score={scoreData?.score} breakdown={scoreData?.breakdown} />
                            </FadeIn>
                            <FadeIn delay={0.3} direction="up" className="h-full">
                                <AiRoastPanel roastText={roast} />
                            </FadeIn>
                        </div>

                        <FadeIn delay={0.4} direction="up">
                            <ContributionHeatmap activityData={heatmapData} />
                        </FadeIn>
                    </div>

                    {/* Right Column (Side Stats + Stack) */}
                    <div className="space-y-6 flex flex-col">
                        <FadeIn delay={0.5} direction="up" className="flex-1">
                            <TechStackChart data={stackData} />
                        </FadeIn>

                        {/* Action Panel */}
                        <FadeIn delay={0.6} direction="up" className="flex-1">
                            <ActionPanel username={username} />
                        </FadeIn>
                    </div>
                </div>
            </div>
        </div>
    );
}
