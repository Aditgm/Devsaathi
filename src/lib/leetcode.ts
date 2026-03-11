const LEETCODE_API_URL = "https://leetcode.com/graphql";

// User Profile Query
const USER_PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      githubUrl
      twitterUrl
      profile {
        realName
        userAvatar
        aboutMe
        school
        company
        countryName
        ranking
      }
      languageProblemCount {
        languageName
        problemsSolved
      }
    }
  }
`;

// Solved Problems Query
const SUBMIT_STATS_QUERY = `
  query userProblemsSolved($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;

// Contest Ranking Query
const CONTEST_RANKING_QUERY = `
  query userContestRankingInfo($username: String!) {
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      totalParticipants
      topPercentage
    }
  }
`;

// Calendar / Activity Query
const USER_CALENDAR_QUERY = `
  query userProfileCalendar($username: String!) {
    matchedUser(username: $username) {
      userCalendar {
        activeYears
        streak
        totalActiveDays
        submissionCalendar
      }
    }
  }
`;

// Skill/Tag Stats Query
const SKILL_STATS_QUERY = `
  query skillStats($username: String!) {
    matchedUser(username: $username) {
      tagProblemCounts {
        advanced {
          tagName
          problemsSolved
        }
        intermediate {
          tagName
          problemsSolved
        }
        fundamental {
          tagName
          problemsSolved
        }
      }
    }
  }
`;

async function fetchGraphQL(query: string, variables: any) {
  try {
    const response = await fetch(LEETCODE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      next: { revalidate: 3600 } // Cache API responses to avoid rate limits
    });

    if (!response.ok) {
      throw new Error(`LeetCode API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching from LeetCode GraphQL API:", error);
    return null;
  }
}

export async function fetchLeetCodeProfile(username: string) {
  const data = await fetchGraphQL(USER_PROFILE_QUERY, { username });
  if (!data || !data.matchedUser) return null;
  return data.matchedUser;
}

export async function fetchLeetCodeStats(username: string) {
  const data = await fetchGraphQL(SUBMIT_STATS_QUERY, { username });
  if (!data || !data.matchedUser) return null;

  const acSubmissions = data.matchedUser.submitStatsGlobal.acSubmissionNum.filter(
    (item: any) => item.difficulty !== 'All'
  );
  const allQuestions = data.allQuestionsCount;;

  return {
    solved: acSubmissions,
    total: allQuestions
  };
}

export async function fetchLeetCodeContest(username: string) {
  const data = await fetchGraphQL(CONTEST_RANKING_QUERY, { username });
  if (!data || !data.userContestRanking) return null;
  return data.userContestRanking;
}

export async function fetchLeetCodeCalendar(username: string) {
  const data = await fetchGraphQL(USER_CALENDAR_QUERY, { username });
  if (!data || !data.matchedUser) return null;
  return data.matchedUser.userCalendar;
}

export async function fetchLeetCodeSkills(username: string) {
  const data = await fetchGraphQL(SKILL_STATS_QUERY, { username });
  if (!data || !data.matchedUser || !data.matchedUser.tagProblemCounts) return null;
  return data.matchedUser.tagProblemCounts;
}
