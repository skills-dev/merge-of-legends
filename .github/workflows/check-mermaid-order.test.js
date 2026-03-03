const assert = require("assert");
const { parseMermaidLabels, checkSDLCOrder } = require("./check-mermaid-order");

// Manually run these tests in the CLI:
// node .github/workflows/check-mermaid-order.test.js

// parseMermaidLabels: empty string returns empty array
(() => {
  assert.deepStrictEqual(parseMermaidLabels(""), []);
})();

// parseMermaidLabels: no mermaid block returns empty array
(() => {
  assert.deepStrictEqual(parseMermaidLabels("some text without mermaid"), []);
})();

// parseMermaidLabels: extracts labels in order from chain syntax
(() => {
  const text =
    "```mermaid\ngraph LR\n    A[ANALYSIS] --> B[DESIGN] --> C[DEVELOPMENT] --> D[TESTING] --> E[DEPLOYMENT] --> F[MAINTENANCE]\n```";
  const labels = parseMermaidLabels(text);
  assert.deepStrictEqual(labels, [
    "ANALYSIS",
    "DESIGN",
    "DEVELOPMENT",
    "TESTING",
    "DEPLOYMENT",
    "MAINTENANCE",
  ]);
})();

// parseMermaidLabels: extracts labels in order from scrambled chain
(() => {
  const text =
    "```mermaid\ngraph LR\n    A[ANALYSIS] --> B[TESTING] --> C[DESIGN] --> D[DEPLOYMENT] --> E[MAINTENANCE] --> F[DEVELOPMENT]\n```";
  const labels = parseMermaidLabels(text);
  assert.deepStrictEqual(labels, [
    "ANALYSIS",
    "TESTING",
    "DESIGN",
    "DEPLOYMENT",
    "MAINTENANCE",
    "DEVELOPMENT",
  ]);
})();

// parseMermaidLabels: deduplicates repeated labels (multi-line connection syntax)
(() => {
  const text =
    "```mermaid\ngraph LR\n    A[ANALYSIS] --> B[DESIGN]\n    B[DESIGN] --> C[DEVELOPMENT]\n```";
  const labels = parseMermaidLabels(text);
  assert.deepStrictEqual(labels, ["ANALYSIS", "DESIGN", "DEVELOPMENT"]);
})();

// parseMermaidLabels: handles lowercase labels by uppercasing
(() => {
  const text =
    "```mermaid\ngraph LR\n    A[analysis] --> B[design]\n```";
  const labels = parseMermaidLabels(text);
  assert.deepStrictEqual(labels, ["ANALYSIS", "DESIGN"]);
})();

// parseMermaidLabels: non-string input returns empty array
(() => {
  assert.deepStrictEqual(parseMermaidLabels(null), []);
  assert.deepStrictEqual(parseMermaidLabels(undefined), []);
})();

// checkSDLCOrder: correct order returns true
(() => {
  assert.strictEqual(
    checkSDLCOrder([
      "ANALYSIS",
      "DESIGN",
      "DEVELOPMENT",
      "TESTING",
      "DEPLOYMENT",
      "MAINTENANCE",
    ]),
    true
  );
})();

// checkSDLCOrder: scrambled order returns false
(() => {
  assert.strictEqual(
    checkSDLCOrder([
      "ANALYSIS",
      "TESTING",
      "DESIGN",
      "DEPLOYMENT",
      "MAINTENANCE",
      "DEVELOPMENT",
    ]),
    false
  );
})();

// checkSDLCOrder: wrong number of labels returns false
(() => {
  assert.strictEqual(
    checkSDLCOrder(["ANALYSIS", "DESIGN", "DEVELOPMENT"]),
    false
  );
})();

// checkSDLCOrder: empty array returns false
(() => {
  assert.strictEqual(checkSDLCOrder([]), false);
})();

// checkSDLCOrder: non-array input returns false
(() => {
  assert.strictEqual(checkSDLCOrder(null), false);
})();

// Full round-trip: correct diagram passes
(() => {
  const text = `Some intro text

\`\`\`mermaid
graph LR
    A[ANALYSIS] --> B[DESIGN] --> C[DEVELOPMENT] --> D[TESTING] --> E[DEPLOYMENT] --> F[MAINTENANCE]
\`\`\`

Some trailing text`;
  const labels = parseMermaidLabels(text);
  assert.strictEqual(checkSDLCOrder(labels), true);
})();

// Full round-trip: scrambled diagram fails
(() => {
  const text = `\`\`\`mermaid\ngraph LR\n    A[ANALYSIS] --> B[TESTING] --> C[DESIGN] --> D[DEPLOYMENT] --> E[MAINTENANCE] --> F[DEVELOPMENT]\n\`\`\``;
  const labels = parseMermaidLabels(text);
  assert.strictEqual(checkSDLCOrder(labels), false);
})();

// If nothing threw an exception, all tests passed
console.log("All tests passed");
