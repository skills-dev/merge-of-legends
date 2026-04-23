const assert = require("assert");
const {
  REQUIRED_IMAGES,
  parseUncoveredCards,
  checkDuckyMatches,
} = require("./check-ducky-match");

// Manually run these tests in the CLI:
// node .github/workflows/check-ducky-match.test.js

const [IMAGE_1, IMAGE_2, IMAGE_3] = REQUIRED_IMAGES;
const ORIGINAL_GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const ORIGINAL_GITHUB_SERVER_URL = process.env.GITHUB_SERVER_URL;

function withGitHubContext({ repository, serverUrl }, callback) {
  process.env.GITHUB_REPOSITORY = repository;
  process.env.GITHUB_SERVER_URL = serverUrl;

  try {
    callback();
  } finally {
    process.env.GITHUB_REPOSITORY = ORIGINAL_GITHUB_REPOSITORY;
    process.env.GITHUB_SERVER_URL = ORIGINAL_GITHUB_SERVER_URL;
  }
}

// parseUncoveredCards: empty string returns empty array
(() => {
  assert.deepStrictEqual(parseUncoveredCards(""), []);
})();

// parseUncoveredCards: missing section returns empty array
(() => {
  assert.deepStrictEqual(parseUncoveredCards("some text without cards"), []);
})();

// parseUncoveredCards: extracts six cards in order
(() => {
  const text = `
### Uncovered Cards

- Card 1: ${IMAGE_1}
- Card 2: ${IMAGE_2}
- Card 3: ${IMAGE_3}
- Card 4: ${IMAGE_1}
- Card 5: ${IMAGE_2}
- Card 6: ${IMAGE_3}
`;
  const cards = parseUncoveredCards(text);
  assert.deepStrictEqual(cards, [IMAGE_1, IMAGE_2, IMAGE_3, IMAGE_1, IMAGE_2, IMAGE_3]);
})();

// parseUncoveredCards: non-string input returns empty array
(() => {
  assert.deepStrictEqual(parseUncoveredCards(null), []);
  assert.deepStrictEqual(parseUncoveredCards(undefined), []);
})();

// checkDuckyMatches: required markdown image entries with pairs returns true
(() => {
  assert.strictEqual(
    checkDuckyMatches([
      `![Ducky](${IMAGE_1})`,
      `![Mona](${IMAGE_2})`,
      `![Copilot](${IMAGE_3})`,
      `![Ducky](${IMAGE_1})`,
      `![Mona](${IMAGE_2})`,
      `![Copilot](${IMAGE_3})`,
    ]),
    true
  );
})();

// checkDuckyMatches: supports markdown image syntax
(() => {
  assert.strictEqual(
    checkDuckyMatches([
      `![one](${IMAGE_1})`,
      `![two](${IMAGE_2})`,
      `![three](${IMAGE_3})`,
      `![one again](${IMAGE_1})`,
      `![two again](${IMAGE_2})`,
      `![three again](${IMAGE_3})`,
    ]),
    true
  );
})();

// checkDuckyMatches: supports raw.githubusercontent.com URLs for the current repository
(() => {
  withGitHubContext(
    {
      repository: "octo-org/quest-repo",
      serverUrl: "https://github.com",
    },
    () => {
      assert.strictEqual(
        checkDuckyMatches([
          "![Ducky](https://raw.githubusercontent.com/octo-org/quest-repo/main/.github/images/ducky-intro.png)",
          "![Mona](https://raw.githubusercontent.com/octo-org/quest-repo/main/.github/images/mona-intro.png)",
          "![Copilot](https://raw.githubusercontent.com/octo-org/quest-repo/main/.github/images/copilot-intro.png)",
          "![Ducky](https://raw.githubusercontent.com/octo-org/quest-repo/main/.github/images/ducky-intro.png)",
          "![Mona](https://raw.githubusercontent.com/octo-org/quest-repo/main/.github/images/mona-intro.png)",
          "![Copilot](https://raw.githubusercontent.com/octo-org/quest-repo/main/.github/images/copilot-intro.png)",
        ]),
        true
      );
    }
  );
})();

// checkDuckyMatches: supports github.com raw/blob URLs with refs containing slashes
(() => {
  withGitHubContext(
    {
      repository: "octo-org/quest-repo",
      serverUrl: "https://github.com",
    },
    () => {
      assert.strictEqual(
        checkDuckyMatches([
          "![Ducky](https://github.com/octo-org/quest-repo/raw/release/v1/.github/images/ducky-intro.png)",
          "![Mona](https://github.com/octo-org/quest-repo/blob/release/v1/.github/images/mona-intro.png)",
          "![Copilot](https://github.com/octo-org/quest-repo/raw/release/v1/.github/images/copilot-intro.png)",
          "![Ducky](https://github.com/octo-org/quest-repo/blob/release/v1/.github/images/ducky-intro.png)",
          "![Mona](https://github.com/octo-org/quest-repo/raw/release/v1/.github/images/mona-intro.png)",
          "![Copilot](https://github.com/octo-org/quest-repo/blob/release/v1/.github/images/copilot-intro.png)",
        ]),
        true
      );
    }
  );
})();

// checkDuckyMatches: supports GHES raw URLs for the current repository
(() => {
  withGitHubContext(
    {
      repository: "octo-org/quest-repo",
      serverUrl: "https://git.example.com",
    },
    () => {
      assert.strictEqual(
        checkDuckyMatches([
          "![Ducky](https://git.example.com/octo-org/quest-repo/raw/trunk/.github/images/ducky-intro.png)",
          "![Mona](https://git.example.com/octo-org/quest-repo/raw/trunk/.github/images/mona-intro.png)",
          "![Copilot](https://git.example.com/octo-org/quest-repo/raw/trunk/.github/images/copilot-intro.png)",
          "![Ducky](https://git.example.com/octo-org/quest-repo/raw/trunk/.github/images/ducky-intro.png)",
          "![Mona](https://git.example.com/octo-org/quest-repo/raw/trunk/.github/images/mona-intro.png)",
          "![Copilot](https://git.example.com/octo-org/quest-repo/raw/trunk/.github/images/copilot-intro.png)",
        ]),
        true
      );
    }
  );
})();

// checkDuckyMatches: rejects absolute URLs from a different host
(() => {
  withGitHubContext(
    {
      repository: "octo-org/quest-repo",
      serverUrl: "https://github.com",
    },
    () => {
      assert.strictEqual(
        checkDuckyMatches([
          "![Ducky](https://example.com/octo-org/quest-repo/raw/main/.github/images/ducky-intro.png)",
          "![Mona](https://example.com/octo-org/quest-repo/raw/main/.github/images/mona-intro.png)",
          "![Copilot](https://example.com/octo-org/quest-repo/raw/main/.github/images/copilot-intro.png)",
          "![Ducky](https://example.com/octo-org/quest-repo/raw/main/.github/images/ducky-intro.png)",
          "![Mona](https://example.com/octo-org/quest-repo/raw/main/.github/images/mona-intro.png)",
          "![Copilot](https://example.com/octo-org/quest-repo/raw/main/.github/images/copilot-intro.png)",
        ]),
        false
      );
    }
  );
})();

// checkDuckyMatches: wrong number of cards returns false
(() => {
  assert.strictEqual(checkDuckyMatches([IMAGE_1, IMAGE_2, IMAGE_3]), false);
})();

// checkDuckyMatches: wrong distribution returns false
(() => {
  assert.strictEqual(
    checkDuckyMatches([IMAGE_1, IMAGE_1, IMAGE_1, IMAGE_2, IMAGE_2, IMAGE_3]),
    false
  );
})();

// checkDuckyMatches: unknown image returns false
(() => {
  assert.strictEqual(
    checkDuckyMatches([IMAGE_1, IMAGE_2, IMAGE_3, IMAGE_1, IMAGE_2, "../images/not-real.png"]),
    false
  );
})();

// checkDuckyMatches: card containing a required image URL plus an extra URL returns false
(() => {
  assert.strictEqual(
    checkDuckyMatches([
      IMAGE_1,
      IMAGE_2,
      IMAGE_3,
      IMAGE_1,
      IMAGE_2,
      `${IMAGE_3} https://example.com/x.png`,
    ]),
    false
  );
})();

// checkDuckyMatches: bare local image path (no markdown image syntax) returns false
(() => {
  assert.strictEqual(
    checkDuckyMatches([IMAGE_1, IMAGE_2, IMAGE_3, IMAGE_1, IMAGE_2, IMAGE_3]),
    false
  );
})();
// checkDuckyMatches: hidden card value returns false
(() => {
  assert.strictEqual(
    checkDuckyMatches([IMAGE_1, IMAGE_2, IMAGE_3, IMAGE_1, IMAGE_2, "`HIDDEN`"]),
    false
  );
})();

// checkDuckyMatches: plain text containing a valid local image path returns false
(() => {
  assert.strictEqual(
    checkDuckyMatches([
      `Use this ${IMAGE_1}`,
      IMAGE_2,
      IMAGE_3,
      IMAGE_1,
      IMAGE_2,
      IMAGE_3,
    ]),
    false
  );
})();

// checkDuckyMatches: non-array input returns false
(() => {
  assert.strictEqual(checkDuckyMatches(null), false);
})();

// If nothing threw an exception, all tests passed
console.log("All tests passed");
