const assert = require("assert");
const {
  REQUIRED_IMAGES,
  parseUncoveredCards,
  checkDuckyMatches,
} = require("./check-mermaid-order");

// Manually run these tests in the CLI:
// node .github/workflows/check-mermaid-order.test.js

const [IMAGE_1, IMAGE_2, IMAGE_3] = REQUIRED_IMAGES;

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

// checkDuckyMatches: raw image paths with pairs returns true
(() => {
  assert.strictEqual(
    checkDuckyMatches([IMAGE_1, IMAGE_2, IMAGE_3, IMAGE_1, IMAGE_2, IMAGE_3]),
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
// checkDuckyMatches: hidden card value returns false
(() => {
  assert.strictEqual(
    checkDuckyMatches([IMAGE_1, IMAGE_2, IMAGE_3, IMAGE_1, IMAGE_2, "`HIDDEN`"]),
    false
  );
})();

// checkDuckyMatches: plain text containing a valid local image path returns true
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
    true
  );
})();

// checkDuckyMatches: non-array input returns false
(() => {
  assert.strictEqual(checkDuckyMatches(null), false);
})();

// If nothing threw an exception, all tests passed
console.log("All tests passed");
