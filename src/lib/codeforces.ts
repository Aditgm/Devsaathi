const CF_BASE = "https://codeforces.com/api";

export interface CFProfile {
    handle: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    rank?: string;
    maxRank?: string;
    rating?: number;
    maxRating?: number;
    contribution?: number;
    friendOfCount?: number;
    registrationTimeSeconds?: number;
}

export interface CFRatingChange {
    contestId: number;
    contestName: string;
    handle: string;
    rank: number;
    ratingUpdateTimeSeconds: number;
    oldRating: number;
    newRating: number;
}

export interface CFSubmission {
    id: number;
    creationTimeSeconds?: number;
    verdict?: string;
    programmingLanguage: string;
    problem: {
        contestId?: number;
        index: string;
        name: string;
        rating?: number;
        tags: string[];
    };
}

export interface CFRecentSub {
    problemName: string;
    problemRating?: number;
    verdict: string;
    language: string;
    timeSeconds: number;
    contestId?: number;
    index: string;
}

async function cfFetch<T>(endpoint: string): Promise<T | null> {
    const url = `${CF_BASE}/${endpoint}`;
    console.log(`[CF API] Fetching: ${url}`);
    try {
        const res = await fetch(url, {
            next: { revalidate: 3600 }
        });

        if (!res.ok) {
            console.error(`[CF API] Error: ${res.status} ${res.statusText} for ${url}`);
            const text = await res.text();
            console.error(`[CF API] Response body: ${text.slice(0, 200)}`);
            return null;
        }

        const json = await res.json();
        if (json.status !== "OK") {
            console.warn(`[CF API] Non-OK status: ${json.status} for ${url}. Comment: ${json.comment}`);
            return null;
        }

        console.log(`[CF API] Success: ${url}`);
        return json.result as T;
    } catch (err: any) {
        console.error(`[CF API] Exception: ${err.message} for ${url}`);
        return null;
    }
}

export async function fetchCFProfile(handle: string): Promise<CFProfile | null> {
    const result = await cfFetch<CFProfile[]>(`user.info?handles=${handle}`);
    return result?.[0] ?? null;
}

export async function fetchCFRatingHistory(handle: string): Promise<CFRatingChange[] | null> {
    return cfFetch<CFRatingChange[]>(`user.rating?handle=${handle}`);
}

export async function fetchCFSubmissions(handle: string): Promise<CFSubmission[] | null> {

    return cfFetch<CFSubmission[]>(`user.status?handle=${handle}`);
}

export function getRankColor(rank: string | undefined): string {
    if (!rank) return "#9ca3af";
    const r = rank.toLowerCase();
    if (r.includes("legendary grandmaster")) return "#ff0000";
    if (r.includes("international grandmaster")) return "#ff0000";
    if (r.includes("grandmaster")) return "#ff3333";
    if (r.includes("international master")) return "#f79a00";
    if (r.includes("master")) return "#f79a00";
    if (r.includes("candidate master")) return "#b16db0";
    if (r.includes("expert")) return "#6495ed";
    if (r.includes("specialist")) return "#03c03c";
    if (r.includes("pupil")) return "#77ff77";
    return "#9ca3af";
}

export function computeCFSolvedStats(submissions: CFSubmission[]) {
    const solved = new Set<string>();
    const ratingBuckets: Record<string, number> = {
        "≤ 1200": 0,
        "1200–1599": 0,
        "1600–1999": 0,
        "2000–2399": 0,
        "2400+": 0,
    };
    const tagMap: Record<string, number> = {};
    const languageMap: Record<string, number> = {};
    const submissionCalendar: Record<string, number> = {};
    let totalRatingSum = 0;
    let ratedCount = 0;

    // Grab the 10 most recent submissions (already sorted newest-first by the API)
    const recentSubmissions: CFRecentSub[] = submissions.slice(0, 10).map(sub => ({
        problemName: sub.problem.name,
        problemRating: sub.problem.rating,
        verdict: sub.verdict || "UNKNOWN",
        language: sub.programmingLanguage,
        timeSeconds: sub.creationTimeSeconds || 0,
        contestId: sub.problem.contestId,
        index: sub.problem.index,
    }));

    for (const sub of submissions) {
        // Log every submission date for the heatmap (UTC)
        if (sub.creationTimeSeconds) {
            const date = new Date(sub.creationTimeSeconds * 1000);
            const dateKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
            submissionCalendar[dateKey] = (submissionCalendar[dateKey] || 0) + 1;
        }

        if (sub.verdict !== "OK") continue;
        const key = `${sub.problem.contestId}_${sub.problem.index}`;
        if (solved.has(key)) continue;
        solved.add(key);


        languageMap[sub.programmingLanguage] = (languageMap[sub.programmingLanguage] || 0) + 1;

        const rating = sub.problem.rating;
        if (rating) {
            totalRatingSum += rating;
            ratedCount++;
            if (rating <= 1200) ratingBuckets["≤ 1200"]++;
            else if (rating <= 1599) ratingBuckets["1200–1599"]++;
            else if (rating <= 1999) ratingBuckets["1600–1999"]++;
            else if (rating <= 2399) ratingBuckets["2000–2399"]++;
            else ratingBuckets["2400+"]++;
        }

        for (const tag of sub.problem.tags) {
            tagMap[tag] = (tagMap[tag] || 0) + 1;
        }
    }

    return {
        totalSolved: solved.size,
        totalSubmissions: submissions.length,
        ratingBuckets,
        avgProblemRating: ratedCount > 0 ? Math.round(totalRatingSum / ratedCount) : 0,
        topTags: Object.entries(tagMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([tag, count]) => ({ tag, count })),
        languageMap,
        submissionCalendar,
        recentSubmissions,
    };
}

export function computeContestPerformance(ratingHistory: CFRatingChange[]) {
    if (!ratingHistory || ratingHistory.length === 0) return null;

    let bestGain = { contest: "", delta: -Infinity, newRating: 0 };
    let worstLoss = { contest: "", delta: Infinity, newRating: 0 };
    let totalRank = 0;
    let currentStreak = 0;
    let streakType: "win" | "loss" | null = null;

    for (const r of ratingHistory) {
        const delta = r.newRating - r.oldRating;
        totalRank += r.rank;

        if (delta > bestGain.delta) {
            bestGain = { contest: r.contestName, delta, newRating: r.newRating };
        }
        if (delta < worstLoss.delta) {
            worstLoss = { contest: r.contestName, delta, newRating: r.newRating };
        }
    }

    // Walk backwards through contests to find the current win/loss streak
    for (let i = ratingHistory.length - 1; i >= 0; i--) {
        const delta = ratingHistory[i].newRating - ratingHistory[i].oldRating;
        const isWin = delta >= 0;
        if (streakType === null) {
            streakType = isWin ? "win" : "loss";
            currentStreak = 1;
        } else if ((isWin && streakType === "win") || (!isWin && streakType === "loss")) {
            currentStreak++;
        } else {
            break;
        }
    }

    return {
        totalContests: ratingHistory.length,
        avgRank: Math.round(totalRank / ratingHistory.length),
        bestGain,
        worstLoss,
        currentStreak,
        streakType: streakType as "win" | "loss",
    };
}
