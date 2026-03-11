const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
};

if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
}

export async function fetchGitHubProfile(username: string) {
    const res = await fetch(`https://api.github.com/users/${username}`, {
        headers,
        next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Profile not found");
    return res.json();
}

export async function fetchGitHubRepos(username: string) {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
        headers,
        next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Repos not found");
    return res.json();
}

import * as cheerio from 'cheerio';

export interface DayActivity {
    date: string;
    level: number;
}

export interface ContributionData {
    total: number;
    days: DayActivity[];
}

export async function fetchGitHubContributions(username: string): Promise<ContributionData | null> {
    try {
        const response = await fetch(`https://github.com/users/${username}/contributions`, {
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            return null; // Fall back to empty data if scrape fails
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const days: DayActivity[] = [];

        // Parse the table structure containing data-level attributes
        $('td.ContributionCalendar-day').each((_, element) => {
            const levelAttr = $(element).attr('data-level');
            const dateAttr = $(element).attr('data-date');
            if (levelAttr !== undefined && dateAttr) {
                const level = parseInt(levelAttr, 10);
                if (!isNaN(level)) {
                    days.push({
                        date: dateAttr,
                        level: level
                    });
                }
            }
        });

        days.sort((a, b) => a.date.localeCompare(b.date));

        const totalText = $('h2.f4.text-normal.mb-2').text().trim();
        const totalMatch = totalText.match(/([\d,]+)\s+contributions/);
        const total = totalMatch ? parseInt(totalMatch[1].replace(/,/g, ''), 10) : 0;

        return { total, days };

    } catch (error) {
        console.error("Failed to fetch GitHub contributions:", error);
        return null;
    }
}
