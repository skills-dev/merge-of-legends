function getOpenQuestIssues(issues, titlePrefix = "Quest: ") {
  if (!Array.isArray(issues) || issues.length === 0) return [];

  return issues
    .filter((issue) => issue && !issue.pull_request && issue.title?.startsWith(titlePrefix))
    .sort((a, b) => a.number - b.number);
}

function planQuestIssueReset(issues, titlePrefix = "Quest: ") {
  const openQuestIssues = getOpenQuestIssues(issues, titlePrefix);

  if (openQuestIssues.length === 0) {
    return {
      shouldCreate: true,
      issueNumber: "",
      issueUrl: "",
      duplicateIssueNumbers: [],
    };
  }

  const [primaryIssue, ...duplicateIssues] = openQuestIssues;

  return {
    shouldCreate: false,
    issueNumber: String(primaryIssue.number),
    issueUrl: primaryIssue.html_url || "",
    duplicateIssueNumbers: duplicateIssues.map((issue) => String(issue.number)),
  };
}

module.exports = {
  getOpenQuestIssues,
  planQuestIssueReset,
};
