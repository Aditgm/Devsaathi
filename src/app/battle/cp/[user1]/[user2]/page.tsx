import { Suspense } from "react";
import { ArrowLeft, Swords, Code2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchLeetCodeProfile, fetchLeetCodeStats, fetchLeetCodeContest, fetchLeetCodeCalendar, fetchLeetCodeSkills } from "@/lib/leetcode";
import { computeCPScore } from "@/lib/scoring";
import { generateBattleRoast } from "@/lib/roast";
import { FaangScoreCard } from "@/components/dashboard/FaangScoreCard";
import { FadeIn } from "@/components/animations/FadeIn";
import { ShareBattleButton } from "@/components/battle/ShareBattleButton";
import Image from "next/image";

export default async function CPBattle({ params }: { params: { user1: string, user2: string } }) {
    const { user1, user2 } = params;


    const profile1 = await fetchLeetCodeProfile(user1);
    const stats1 = profile1 ? await fetchLeetCodeStats(user1) : null;
    const contest1 = profile1 ? await fetchLeetCodeContest(user1) : null;
    const calendar1 = profile1 ? await fetchLeetCodeCalendar(user1) : null;
    const skills1 = profile1 ? await fetchLeetCodeSkills(user1) : null;


    const profile2 = await fetchLeetCodeProfile(user2);
    const stats2 = profile2 ? await fetchLeetCodeStats(user2) : null;
    const contest2 = profile2 ? await fetchLeetCodeContest(user2) : null;
    const calendar2 = profile2 ? await fetchLeetCodeCalendar(user2) : null;
    const skills2 = profile2 ? await fetchLeetCodeSkills(user2) : null;

    if (!profile1 || !profile2) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <Swords className="w-16 h-16 text-red-600 mb-6" />
                <h1 className="text-3xl font-bold mb-2">Battle Cancelled</h1>
                <p className="text-zinc-400 mb-8">One or both LeetCode users could not be found.</p>
                <Link href="/">
                    <Button variant="outline" className="border-white/10 hover:bg-white/10">Back to Arena</Button>
                </Link>
            </div>
        );
    }


    const scoreData1 = await computeCPScore(profile1, stats1, contest1, calendar1);
    const scoreData2 = await computeCPScore(profile2, stats2, contest2, calendar2);

    const winner = scoreData1.score > scoreData2.score ? 1 : scoreData2.score > scoreData1.score ? 2 : 0;


    const battleRoast = await generateBattleRoast(
        "cp",
        profile1.profile?.realName || user1, scoreData1.score,
        profile2.profile?.realName || user2, scoreData2.score
    );

    const mapBreakdown = (sd: any) => ({
        commits: sd.breakdown?.algos || 0,
        quality: sd.breakdown?.mastery || 0,
        diversity: sd.breakdown?.persistence || 0,
        oss: sd.breakdown?.speed || 0
    });

    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-500/30 pb-24">
            {/* Dynamic Background for CP Battle */}
            <div className="fixed inset-0 z-0" data-html2canvas-ignore="true">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_center,rgba(56,189,248,0.15),transparent_40%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_right_center,rgba(59,130,246,0.15),transparent_40%)]" />
            </div>

            <div id="battle-result-card" className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
                {/* Navigation */}
                <nav className="flex items-center justify-between mb-12">
                    <Link href="/">
                        <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/10 gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Abandon Match
                        </Button>
                    </Link>
                    <div className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Swords className="w-5 h-5 text-red-500" />
                        <span className="text-red-400">Battle</span> Arena
                    </div>
                </nav>

                <FadeIn delay={0.1} direction="up" className="text-center mb-16">
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500">
                        LeetCode Showdown
                    </h1>
                </FadeIn>

                {/* Profiles & Scores Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 relative">

                    {/* Player 1 */}
                    <div className="flex flex-col items-center">
                        <FadeIn delay={0.2} direction="left" className="w-full h-full">
                            <div className={`flex flex-col items-center justify-between h-full p-8 rounded-3xl bg-zinc-950 border-2 transition-colors duration-500 ${winner === 1 ? 'border-cyan-500 shadow-[0_0_40px_rgba(34,211,238,0.3)]' : 'border-white/5 opacity-50'}`}>

                                {winner === 1 && (
                                    <div className="bg-cyan-500 text-black text-xs font-black uppercase px-4 py-1 rounded-full mb-6 tracking-widest animate-pulse">
                                        Winner
                                    </div>
                                )}

                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-900 shadow-xl relative mb-4">
                                    {profile1.profile?.userAvatar ? (
                                        <Image src={profile1.profile.userAvatar} alt={user1} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800" />
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold mb-1">{profile1.profile?.realName || user1}</h2>
                                <p className="text-zinc-400 font-mono mb-4">@{user1}</p>

                                <div className="text-sm font-mono text-cyan-400 mb-8">
                                    {stats1?.solved?.reduce((a: number, c: any) => a + c.count, 0) || 0} Solved
                                    • Rating {contest1?.rating ? Math.round(contest1.rating) : 'N/A'}
                                </div>

                                <div className="w-full mt-auto">
                                    <FaangScoreCard score={scoreData1.score} breakdown={mapBreakdown(scoreData1)} isCPMode={true} />
                                </div>
                            </div>
                        </FadeIn>
                    </div>

                    {/* VS BADGE (Desktop Center) */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center">
                        <div className="bg-red-500 text-black w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border-4 border-black shadow-[0_0_50px_rgba(239,68,68,0.5)] z-50">
                            VS
                        </div>
                    </div>

                    {/* Player 2 */}
                    <div className="flex flex-col items-center">
                        <FadeIn delay={0.3} direction="right" className="w-full h-full">
                            <div className={`flex flex-col items-center justify-between h-full p-8 rounded-3xl bg-zinc-950 border-2 transition-colors duration-500 ${winner === 2 ? 'border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.3)]' : 'border-white/5 opacity-50'}`}>

                                {winner === 2 && (
                                    <div className="bg-blue-500 text-white text-xs font-black uppercase px-4 py-1 rounded-full mb-6 tracking-widest animate-pulse">
                                        Winner
                                    </div>
                                )}

                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-900 shadow-xl relative mb-4">
                                    {profile2.profile?.userAvatar ? (
                                        <Image src={profile2.profile.userAvatar} alt={user2} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800" />
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold mb-1">{profile2.profile?.realName || user2}</h2>
                                <p className="text-zinc-400 font-mono mb-4">@{user2}</p>

                                <div className="text-sm font-mono text-blue-400 mb-8">
                                    {stats2?.solved?.reduce((a: number, c: any) => a + c.count, 0) || 0} Solved
                                    • Rating {contest2?.rating ? Math.round(contest2.rating) : 'N/A'}
                                </div>

                                <div className="w-full mt-auto">
                                    <FaangScoreCard score={scoreData2.score} breakdown={mapBreakdown(scoreData2)} isCPMode={true} />
                                </div>
                            </div>
                        </FadeIn>
                    </div>

                </div>

                {/* Shared AI Battle Roast Panel */}
                <FadeIn delay={0.4} direction="up" className="mt-16 w-full max-w-4xl mx-auto">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                        <div className="relative bg-zinc-950 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-cyan-400">
                                <Swords className="w-5 h-5" /> The Verdict
                            </h3>
                            <div className="text-lg md:text-xl text-zinc-300 leading-relaxed italic border-l-4 border-cyan-500/50 pl-6 bg-white/[0.02] py-4 pr-4 rounded-r-xl">
                                "{battleRoast}"
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* Share Battle Result */}
                <ShareBattleButton user1={user1} user2={user2} mode="cp" />
            </div>
        </div>
    );
}
