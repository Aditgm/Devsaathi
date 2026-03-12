export async function computeFaangScore(profile: any, repos: any[], totalCommits: number = 0) {
    let totalStars = 0;
    let totalForks = 0;
    const languages = new Set<string>();
    const languageCounts: Record<string, number> = {};

    repos.forEach((repo) => {
        totalStars += repo.stargazers_count;
        totalForks += repo.forks_count;
        if (repo.language) {
            languages.add(repo.language);
            languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
        }
    });

    const stats = {
        totalStars,
        totalRepos: repos.length,
        languages: Array.from(languages),
        languageFrequencies: languageCounts,
    };

    const commitScore = Math.min(15, (totalCommits / 1000) * 15);
    const starScore = Math.min(20, (totalStars / 500) * 20);
    const repoScore = Math.min(10, (repos.length / 50) * 10);
    const diversityScore = Math.min(10, languages.size * 2);
    const influenceScore = Math.min(15, ((profile.followers * 2 + totalForks) / 500) * 15);

    let completeness = 0;
    if (profile.bio) completeness += 2;
    if (profile.blog) completeness += 2;
    if (profile.location) completeness += 1;
    if (profile.twitter_username) completeness += 1;
    if (profile.hireable) completeness += 4;

    const baseScore = 20;
    const calculatedScore = Math.max(10, Math.min(100, Math.round(baseScore + commitScore + starScore + repoScore + diversityScore + influenceScore + completeness)));

    return {
        score: calculatedScore,
        breakdown: {
            commits: Math.round(commitScore),
            quality: Math.round(starScore + repoScore),
            diversity: Math.round(diversityScore),
            oss: Math.round(influenceScore),
        },
        ...stats,
    };
}

export async function computeCPScore(profile: any, stats: any, contest: any, calendar: any, skillsData: any = null) {
    const totalSolved = stats?.solved?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0;
    const hardSolved = stats?.solved?.find((x: any) => x.difficulty === 'Hard')?.count || 0;
    const mediumSolved = stats?.solved?.find((x: any) => x.difficulty === 'Medium')?.count || 0;
    const easySolved = stats?.solved?.find((x: any) => x.difficulty === 'Easy')?.count || 0;

    const rating = contest?.rating ? Math.round(contest.rating) : 0;
    const topPercentage = contest?.topPercentage || 100;
    const attendedContests = contest?.attendedContestsCount || 0;

    const streak = calendar?.streak || 0;
    const activeYears = calendar?.activeYears?.length || 1;
    const totalActiveDays = calendar?.totalActiveDays || 0;

    const advancedTagsCount = skillsData?.advanced?.length || 0;

    let algos = 0;
    if (rating > 0) {
        algos = Math.min(40, ((rating - 1200) / 1000) * 40);
        if (topPercentage < 5) algos += 3;
        if (topPercentage < 1) algos += 5;
    } else {
        algos = Math.min(25, (hardSolved / 100) * 25);
    }
    algos = Math.max(0, Math.min(40, algos));

    let mastery = 0;
    if (totalSolved > 0) {
        const difficultyScore = (hardSolved * 3) + (mediumSolved * 1.5) + (easySolved * 0.5);
        const expectedScore = totalSolved * 2;
        mastery = Math.min(20, (difficultyScore / expectedScore) * 20);
    }

    if (advancedTagsCount > 5) mastery += 2;
    if (advancedTagsCount > 15) mastery += 4;
    mastery = Math.max(0, Math.min(20, mastery));

    const volumeScore = Math.min(10, (totalSolved / 500) * 10);
    const streakScore = Math.min(5, (streak / 100) * 5);
    const longevityScore = Math.min(5, (activeYears / 3) * 5);

    let persistence = volumeScore + streakScore + longevityScore;
    persistence = Math.max(0, Math.min(20, persistence));

    let speed = 0;
    if (attendedContests > 0) {
        speed = Math.min(20, (attendedContests / 20) * 20);
    } else {
        speed = Math.min(10, (totalActiveDays / 365) * 10);
    }
    speed = Math.max(0, Math.min(20, speed));

    let rawScore = algos + mastery + persistence + speed;

    if (rating === 0 && hardSolved < 10) {
        rawScore = rawScore * 0.6;
    }

    const calculatedScore = Math.max(10, Math.min(100, Math.round(rawScore)));

    return {
        score: calculatedScore,
        breakdown: {
            algos: Math.round(algos),
            mastery: Math.round(mastery),
            persistence: Math.round(persistence),
            speed: Math.round(speed),
        }
    };
}

export function computeCFScore(profile: any, ratingHistory: any[], solvedStats: any) {
    const currentRating = profile?.rating || 0;
    const contestsAttended = ratingHistory?.length || 0;
    const totalSolved = solvedStats?.totalSolved || 0;
    const avgProblemRating = solvedStats?.avgProblemRating || 0;

    let ratingScore = 0;
    if (currentRating >= 3000) ratingScore = 40;
    else if (currentRating >= 2400) ratingScore = Math.min(40, 30 + ((currentRating - 2400) / 600) * 10);
    else if (currentRating >= 1900) ratingScore = Math.min(30, 20 + ((currentRating - 1900) / 500) * 10);
    else if (currentRating >= 1600) ratingScore = Math.min(20, 13 + ((currentRating - 1600) / 300) * 7);
    else if (currentRating >= 1200) ratingScore = Math.min(13, (currentRating / 1200) * 13);
    else ratingScore = Math.min(8, (currentRating / 800) * 8);
    ratingScore = Math.max(0, Math.min(40, ratingScore));

    const volumeScore = Math.min(20, (totalSolved / 600) * 20);

    let skillScore = 0;
    if (avgProblemRating >= 2400) skillScore = 20;
    else if (avgProblemRating >= 1900) skillScore = Math.min(20, 14 + ((avgProblemRating - 1900) / 500) * 6);
    else if (avgProblemRating >= 1600) skillScore = Math.min(14, 9 + ((avgProblemRating - 1600) / 300) * 5);
    else if (avgProblemRating >= 1200) skillScore = Math.min(9, (avgProblemRating / 1200) * 9);
    else skillScore = Math.min(5, (avgProblemRating / 800) * 5);
    skillScore = Math.max(0, Math.min(20, skillScore));

    const contestScore = Math.min(20, (contestsAttended / 30) * 20);

    const rawScore = ratingScore + volumeScore + skillScore + contestScore;
    const calculatedScore = Math.max(10, Math.min(100, Math.round(rawScore)));

    return {
        score: calculatedScore,
        breakdown: {
            algos: Math.round(ratingScore),
            mastery: Math.round(skillScore),
            persistence: Math.round(volumeScore),
            speed: Math.round(contestScore),
        }
    };
}
