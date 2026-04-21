const assert = require("assert");
const { getOpenQuestIssues, planQuestIssueReset } = require("./quest-issue-utils");

// getOpenQuestIssues: empty or invalid input returns empty array
(() => {
  assert.deepStrictEqual(getOpenQuestIssues(null), []);
  assert.deepStrictEqual(getOpenQuestIssues(undefined), []);
  assert.deepStrictEqual(getOpenQuestIssues([]), []);
})();

// getOpenQuestIssues: only keeps quest issues and sorts by number
(() => {
  const issues = [
    { number: 10, title: "Quest: Copilot", html_url: "https://example.com/10" },
    { number: 3, title: "Bug report", html_url: "https://example.com/3" },
    { number: 7, title: "Quest: Ducky", html_url: "https://example.com/7" },
    { number: 2, title: "Quest: PR mirror", pull_request: {}, html_url: "https://example.com/2" },
  ];

  assert.deepStrictEqual(
    getOpenQuestIssues(issues).map((issue) => issue.number),
    [7, 10]
  );
})();

// planQuestIssueReset: no open quest issues means a new issue should be created
(() => {
  assert.deepStrictEqual(planQuestIssueReset([{ number: 1, title: "Bug report" }]), {
    shouldCreate: true,
    issueNumber: "",
    issueUrl: "",
    duplicateIssueNumbers: [],
  });
})();

// planQuestIssueReset: chooses the oldest quest issue and marks extras for closure
(() => {
  const issues = [
    { number: 12, title: "Quest: Copilot", html_url: "https://example.com/12" },
    { number: 5, title: "Quest: Mona", html_url: "https://example.com/5" },
    { number: 9, title: "Quest: Ducky", html_url: "https://example.com/9" },
  ];

  assert.deepStrictEqual(planQuestIssueReset(issues), {
    shouldCreate: false,
    issueNumber: "5",
    issueUrl: "https://example.com/5",
    duplicateIssueNumbers: ["9", "12"],
  });
})();

console.log("All tests passed");
