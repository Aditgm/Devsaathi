import { NextResponse } from "next/server";
import { fetchGitHubProfile, fetchGitHubRepos } from "@/lib/github";
import { computeFaangScore } from "@/lib/scoring";
import { generateRoast } from "@/lib/roast";

export async function POST(req: Request) {
    try {
        const { username } = await req.json();

        if (!username) {
            return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }

        const profile = await fetchGitHubProfile(username);
        const repos = await fetchGitHubRepos(username);
        const scoreData = await computeFaangScore(profile, repos);

        const roast = await generateRoast(username, profile, scoreData);


        const stackData = scoreData.languages.slice(0, 6).map((lang: string) => {

            return {
                subject: lang,
                A: 80 + Math.floor(Math.random() * 60),
                fullMark: 150
            };
        });

        // Avoid an empty chart — add a placeholder if needed
        if (stackData.length === 0) {
            stackData.push({ subject: "Markdown", A: 100, fullMark: 150 });
        }


        const heatmapData = Array.from({ length: 364 }, () => {

            const r = Math.random();
            if (r > 0.8) return 4;
            if (r > 0.6) return 3;
            if (r > 0.4) return 2;
            if (r > 0.2) return 1;
            return 0;
        });

        return NextResponse.json({
            profile: {
                name: profile.name || username,
                avatarUrl: profile.avatar_url,
                bio: profile.bio,
            },
            scoreData,
            roast,
            stackData,
            heatmapData
        });

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to analyze profile" },
            { status: error.message === "Profile not found" ? 404 : 500 }
        );
    }
}
