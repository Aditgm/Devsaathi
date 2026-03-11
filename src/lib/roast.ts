import { GoogleGenAI } from '@google/genai';
import Groq from "groq-sdk";

export async function generateRoast(username: string, profile: any, scoreData: any) {
    const aiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOOGLE_GENAI_API_KEY;

    if (aiKey) {
        try {
            const ai = new GoogleGenAI({ apiKey: aiKey });

            const prompt = `
You are a witty, brutally honest, but highly credible senior FAANG recruiter and engineering manager. 
Your job is to analyze a developer's GitHub profile stats and deliver a "Roast" that is both funny and actually insightful about their career phase.

Profile Name: ${profile.name || username}
Bio: ${profile.bio || "None"}
Followers: ${profile.followers}
Public Repos: ${profile.public_repos}

Metrics you parsed:
- Total Repos Scanned: ${scoreData.totalRepos}
- Total Stars Earned: ${scoreData.totalStars}
- Top Languages Used: ${scoreData.languages.slice(0, 3).join(", ")}
- FAANG Score (out of 100): ${scoreData.score}
  (Commit Consistency: ${scoreData.breakdown.commits}/15)
  (Project Quality: ${scoreData.breakdown.quality}/20)
  (Language Diversity: ${scoreData.breakdown.diversity}/10)
  (Open Source/PR proxy: ${scoreData.breakdown.oss}/15)

Write a 3-4 sentence roast that specifically references the data above. Be creative, sharp, and credible. If their score is low, roast their lack of commits or reliance on tutorials. If their score is high, call them a try-hard or point out they need to touch grass. Do NOT use emojis.
`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            if (response.text) {
                return response.text;
            }
        } catch (error: any) {
            console.error("Gemini Generation Error:", error.message || error);

            const groqKey = process.env.GROQ_API_KEY;
            if (groqKey && (error?.status === 429 || error?.status === 503 || error?.message?.includes("429") || error?.message?.includes("503"))) {
                try {
                    const groq = new Groq({ apiKey: groqKey });
                    const prompt = `
You are a witty, brutally honest, but highly credible senior FAANG recruiter and engineering manager. 
Your job is to analyze a developer's GitHub profile stats and deliver a "Roast" that is both funny and actually insightful about their career phase.

Profile Name: ${profile.name || username}
Bio: ${profile.bio || "None"}
Followers: ${profile.followers}
Public Repos: ${profile.public_repos}

Metrics you parsed:
- Total Repos Scanned: ${scoreData.totalRepos}
- Total Stars Earned: ${scoreData.totalStars}
- Top Languages Used: ${scoreData.languages.slice(0, 3).join(", ")}
- FAANG Score (out of 100): ${scoreData.score}
  (Commit Consistency: ${scoreData.breakdown.commits}/15)
  (Project Quality: ${scoreData.breakdown.quality}/20)
  (Language Diversity: ${scoreData.breakdown.diversity}/10)
  (Open Source/PR proxy: ${scoreData.breakdown.oss}/15)

Write a 3-4 sentence roast that specifically references the data above. Be creative, sharp, and credible. If their score is low, roast their lack of commits or reliance on tutorials. If their score is high, call them a try-hard or point out they need to touch grass. Do NOT use emojis.
`;
                    const chatCompletion = await groq.chat.completions.create({
                        messages: [{ role: "user", content: prompt }],
                        model: "llama-3.3-70b-versatile",
                        temperature: 0.7,
                    });

                    return chatCompletion.choices[0]?.message?.content || "";
                } catch (groqError: any) {
                    console.error("Groq Generation Error:", groqError.message || groqError);
                }
            }
        }
    }

    const lowScore = scoreData.score < 50;
    const manyRepos = scoreData.totalRepos > 30;
    const fewCommits = scoreData.breakdown.commits < 8;

    let roastText = "";

    if (lowScore) {
        roastText = `Scanning repositories for ${username}... Your FAANG score of ${scoreData.score} is lower than my room temperature. I see you've pinned some repositories, but honestly, you should unpin them before a recruiter sees your 2021 tutorial projects.`;
    } else if (fewCommits && manyRepos) {
        roastText = `Ah, ${profile.name || username}... The classic "I'll finish this project tomorrow" developer. Let me guess, ${scoreData.totalRepos} repositories of "initial commit" and absolutely nothing else? The FAANG recruiters are weeping.`;
    } else if (scoreData.score > 80) {
        roastText = `Okay ${username}, a score of ${scoreData.score} isn't terrible. You clearly know what a pull request is. But let's be real, half of those ${scoreData.totalStars} stars are from your college friends.`;
    } else {
        const topLang = scoreData.languages[0] || 'code';
        roastText = `${username}, your GitHub is like a graveyard of abandoned dreams. Your ${topLang} repositories look like they were written by a confused AI. If your code was a spice, it would be flour.`;
    }

    return roastText;
}

export async function generateCPRoast(username: string, profile: any, stats: any, contest: any, skillsData: any, scoreData: any) {
    const aiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOOGLE_GENAI_API_KEY;

    const totalSolved = stats?.solved?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0;
    const easies = stats?.solved?.find((x: any) => x.difficulty === 'Easy')?.count || 0;
    const mediums = stats?.solved?.find((x: any) => x.difficulty === 'Medium')?.count || 0;
    const hards = stats?.solved?.find((x: any) => x.difficulty === 'Hard')?.count || 0;

    // Calculate "padding" ratio (if > 50% are easies, they are padding)
    const easyRatio = totalSolved > 0 ? (easies / totalSolved) * 100 : 0;
    const isPadding = easyRatio > 50;

    const rating = contest?.rating ? Math.round(contest.rating) : "Unrated";
    const contestsAttended = contest?.attendedContestsCount || 0;
    const topPercent = contest?.topPercentage ? contest.topPercentage.toFixed(1) : "N/A";

    const ranking = profile?.profile?.ranking || "Unranked";

    // Extract top tags to feed to the AI
    let topTagsString = "None";
    let worstTagsString = "None";
    if (skillsData) {
        const allTags = [
            ...(skillsData.advanced || []),
            ...(skillsData.intermediate || []),
            ...(skillsData.fundamental || [])
        ];

        const tagMap = new Map<string, number>();
        allTags.forEach(tag => {
            tagMap.set(tag.tagName, (tagMap.get(tag.tagName) || 0) + tag.problemsSolved);
        });

        const sortedTags = Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]);

        topTagsString = sortedTags.slice(0, 3).map(t => `${t[0]} (${t[1]})`).join(", ");
        worstTagsString = sortedTags.slice(-3).map(t => `${t[0]}`).join(", ");
    }

    if (aiKey) {
        try {
            const ai = new GoogleGenAI({ apiKey: aiKey });

            // Constructing a multifaceted pipeline prompt
            const prompt = `
You are a highly toxic, brutally elitist Competitive Programming Grandmaster and FAANG interviewer. 
Your job is to roast a developer's LeetCode stats. DO NOT USE EMOJIS. Make it 3-4 sentences long. Make it hurt, but make it clever and HIGHLY specific to the exact combination of their data below.

=== CANDIDATE DATA ===
Name/Handle: ${profile?.profile?.realName || username}
Global Rank: ${ranking}
Total Solved: ${totalSolved}
Difficulty Breakdown: ${easies} Easy, ${mediums} Medium, ${hards} Hard
Contest Elo Rating: ${rating} (across ${contestsAttended} contests)
Top Percentile: Top ${topPercent}%
Most Mastered Topics: ${topTagsString}
Least Practiced Topics: ${worstTagsString}
Algorithmic Core Score: ${scoreData.score}/100

=== ROAST GUIDELINES (PICK THE MOST EMBARRASSING ANGLE) ===
1. THE PADDER: If their Easy solve ratio is high (${easyRatio.toFixed(1)}%), absolutely destroy them for padding their stats with Two Sum and Array manipulation while avoiding real algorithms.
2. THE HARD-STUCK: If they have solved a lot of problems (>300) but their contest rating is below 1600 or unrated, mock them for grinding aimlessly without actually learning. Quote their "Mastered Topics" and ask why they can't solve a contest problem dynamically.
3. THE SWEAT: If their contest rating is actually high (>1900) and they have many Hards solved, call them out as a basement-dwelling try-hard who can invert a binary tree in Assembly but gets a panic attack talking to a real human. Tell them AI is going to replace them anyway.
4. THE FAKE GENIUS: If their most solved topics are "Math" or "Brainteaser", mock them for not doing actual software engineering.
`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            if (response.text) return response.text;
        } catch (error: any) {
            console.error("Gemini Generation Error:", error.message || error);

            const groqKey = process.env.GROQ_API_KEY;
            if (groqKey && (error?.status === 429 || error?.status === 503 || error?.message?.includes("429") || error?.message?.includes("503"))) {
                try {
                    const groq = new Groq({ apiKey: groqKey });
                    const prompt = `
You are a highly toxic, brutally elitist Competitive Programming Grandmaster and FAANG interviewer. 
Your job is to roast a developer's LeetCode stats. DO NOT USE EMOJIS. Make it 3-4 sentences long. Make it hurt, but make it clever and HIGHLY specific to the exact combination of their data below.

=== CANDIDATE DATA ===
Name/Handle: ${profile?.profile?.realName || username}
Global Rank: ${ranking}
Total Solved: ${totalSolved}
Difficulty Breakdown: ${easies} Easy, ${mediums} Medium, ${hards} Hard
Contest Elo Rating: ${rating} (across ${contestsAttended} contests)
Top Percentile: Top ${topPercent}%
Most Mastered Topics: ${topTagsString}
Least Practiced Topics: ${worstTagsString}
Algorithmic Core Score: ${scoreData.score}/100

=== ROAST GUIDELINES (PICK THE MOST EMBARRASSING ANGLE) ===
1. THE PADDER: If their Easy solve ratio is high (${easyRatio.toFixed(1)}%), absolutely destroy them for padding their stats with Two Sum and Array manipulation while avoiding real algorithms.
2. THE HARD-STUCK: If they have solved a lot of problems (>300) but their contest rating is below 1600 or unrated, mock them for grinding aimlessly without actually learning. Quote their "Mastered Topics" and ask why they can't solve a contest problem dynamically.
3. THE SWEAT: If their contest rating is actually high (>1900) and they have many Hards solved, call them out as a basement-dwelling try-hard who can invert a binary tree in Assembly but gets a panic attack talking to a real human. Tell them AI is going to replace them anyway.
4. THE FAKE GENIUS: If their most solved topics are "Math" or "Brainteaser", mock them for not doing actual software engineering.
`;
                    const chatCompletion = await groq.chat.completions.create({
                        messages: [{ role: "user", content: prompt }],
                        model: "llama-3.3-70b-versatile",
                        temperature: 0.8,
                    });

                    return chatCompletion.choices[0]?.message?.content || "";
                } catch (groqError: any) {
                    console.error("Groq Generation Error:", groqError.message || groqError);
                }
            }
        }
    }

    // Fallback Mock Roast
    if (scoreData.score < 40) {
        return `I'm looking at ${username}'s LeetCode and it's mostly Easy problems. Let me guess, you memorized Two Sum and thought you were ready for Google? Your algorithmic score is a ${scoreData.score}, go learn what a Hash Map is.`;
    } else if (scoreData.score > 80) {
        return `Wow ${username}, a rating of ${rating}. You're so good at inverting binary trees! Too bad you don't know how to vertically center a div or talk to a real human. Enjoy your FAANG job before AI replaces algorithmic monkeys.`;
    } else {
        return `${username}, you are the definition of average. ${totalSolved} problems solved and your contest rating is still stuck in elo hell. Stop watching NeetCode videos and actually try solving something without looking at the discussion tab.`;
    }
}

export async function generateBattleRoast(
    mode: "github" | "cp",
    u1Name: string, u1Score: number,
    u2Name: string, u2Score: number
) {
    const aiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOOGLE_GENAI_API_KEY;

    if (aiKey) {
        try {
            const ai = new GoogleGenAI({ apiKey: aiKey });

            const scoreLabel = mode === "github" ? "FAANG Developer Score" : "Algorithmic LeetCode Score";
            const githubContext = `You are a savage tech comedy roast host comparing two GitHub developer profiles in a brutal head-to-head showdown. Focus on their CODING PROJECTS, COMMIT HISTORY, OPEN SOURCE CONTRIBUTIONS, REPOSITORY QUALITY, and STARS. Do NOT mention algorithms, LeetCode, or competitive programming.`;
            const cpContext = `You are a toxic Competitive Programming Grandmaster hosting a LeetCode Deathmatch. Focus on their CONTEST RATING, PROBLEMS SOLVED, HARD vs EASY ratio, and ALGORITHMIC SKILLS.`;
            const promptContext = mode === "github" ? githubContext : cpContext;

            const prompt = `
${promptContext}

Player 1: ${u1Name} (${scoreLabel}: ${u1Score}/100)
Player 2: ${u2Name} (${scoreLabel}: ${u2Score}/100)

Write a 4 sentence combined roast that is EXTREMELY witty, sharp, and uses clever tech-culture references. Think Silicon Valley TV show level humor.
1. ${mode === "github" ? "Open with a devastating comparison of their GitHub profiles. Reference their repos, commits, stars, or lack thereof." : "Open with a devastating comparison of their LeetCode stats. Reference their contest rating or problem-solving ability."}
2. If it's a blowout (score difference > 15), absolutely DESTROY the loser with surgical precision. Mock the winner too for being a tryhard.
3. If it's close, call them both tragically mid-tier developers who would get auto-rejected by any FAANG recruiter.
4. Declare the winner with a punchline so sharp it could cut glass. DO NOT USE EMOJIS. Be genuinely funny.
`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            if (response.text) return response.text;
        } catch (error: any) {
            console.error("Gemini Generation Error:", error.message || error);

            const groqKey = process.env.GROQ_API_KEY;
            if (groqKey && (error?.status === 429 || error?.status === 503 || error?.message?.includes("429") || error?.message?.includes("503"))) {
                try {
                    const groq = new Groq({ apiKey: groqKey });
                    const scoreLabel = mode === "github" ? "FAANG Developer Score" : "Algorithmic LeetCode Score";
                    const githubCtx = `You are a savage tech comedy roast host comparing two GitHub developer profiles in a brutal head-to-head showdown. Focus on their CODING PROJECTS, COMMIT HISTORY, OPEN SOURCE CONTRIBUTIONS, REPOSITORY QUALITY, and STARS. Do NOT mention algorithms, LeetCode, or competitive programming.`;
                    const cpCtx = `You are a toxic Competitive Programming Grandmaster hosting a LeetCode Deathmatch. Focus on their CONTEST RATING, PROBLEMS SOLVED, HARD vs EASY ratio, and ALGORITHMIC SKILLS.`;
                    const promptCtx = mode === "github" ? githubCtx : cpCtx;

                    const prompt = `
${promptCtx}

Player 1: ${u1Name} (${scoreLabel}: ${u1Score}/100)
Player 2: ${u2Name} (${scoreLabel}: ${u2Score}/100)

Write a 4 sentence combined roast that is EXTREMELY witty, sharp, and uses clever tech-culture references. Think Silicon Valley TV show level humor.
1. ${mode === "github" ? "Open with a devastating comparison of their GitHub profiles. Reference their repos, commits, stars, or lack thereof." : "Open with a devastating comparison of their LeetCode stats. Reference their contest rating or problem-solving ability."}
2. If it's a blowout (score difference > 15), absolutely DESTROY the loser with surgical precision. Mock the winner too for being a tryhard.
3. If it's close, call them both tragically mid-tier developers who would get auto-rejected by any FAANG recruiter.
4. Declare the winner with a punchline so sharp it could cut glass. DO NOT USE EMOJIS. Be genuinely funny.
`;
                    const chatCompletion = await groq.chat.completions.create({
                        messages: [{ role: "user", content: prompt }],
                        model: "llama-3.3-70b-versatile",
                        temperature: 0.8,
                    });

                    return chatCompletion.choices[0]?.message?.content || "";
                } catch (groqError: any) {
                    console.error("Groq Generation Error:", groqError.message || groqError);
                }
            }
        }
    }

    if (u1Score > u2Score) return `In a shocking display of mediocrity, ${u1Name} beat ${u2Name} ${u1Score} to ${u2Score}. Neither of you are getting into Google, but at least ${u1Name} doesn't write absolute spaghetti code.`;
    if (u2Score > u1Score) return `${u2Name} crushed ${u1Name} ${u2Score} to ${u1Score}. ${u1Name}, please delete your repository and consider a career in farming.`;
    return `A tie of ${u1Score} to ${u2Score}. You are both equally terrible.`;
}
