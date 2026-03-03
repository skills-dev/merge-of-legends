/**
 * Parse mermaid graph node labels from the first mermaid code block found in text.
 * Extracts content inside square brackets (e.g. [ANALYSIS]) in the order they appear.
 * Duplicate labels are de-duplicated while preserving first occurrence order, to support
 * both chain syntax (A[X] --> B[Y] --> C[Z]) and multi-line connection syntax.
 *
 * @param {string} text
 * @returns {string[]} array of uppercased node labels in order of appearance
 */
function parseMermaidLabels(text) {
  if (typeof text !== "string" || text.length === 0) return [];

  const results = [];
  const seen = new Set();
  const mermaidBlockRe = /```mermaid([\s\S]*?)```/gi;
  let blockMatch;

  while ((blockMatch = mermaidBlockRe.exec(text)) !== null) {
    const blockContent = blockMatch[1];
    const labelRe = /\[([^\]]+)\]/g;
    let match;
    while ((match = labelRe.exec(blockContent)) !== null) {
      const label = match[1].trim().toUpperCase();
      if (!seen.has(label)) {
        seen.add(label);
        results.push(label);
      }
    }
  }

  return results;
}

/**
 * Check whether the provided labels match the correct Software Developer Lifecycle order:
 * ANALYSIS → DESIGN → DEVELOPMENT → TESTING → DEPLOYMENT → MAINTENANCE
 *
 * @param {string[]} labels
 * @returns {boolean}
 */
function checkSDLCOrder(labels) {
  const expected = [
    "ANALYSIS",
    "DESIGN",
    "DEVELOPMENT",
    "TESTING",
    "DEPLOYMENT",
    "MAINTENANCE",
  ];
  if (!Array.isArray(labels) || labels.length !== expected.length) return false;
  return labels.every((label, i) => label === expected[i]);
}

module.exports = { parseMermaidLabels, checkSDLCOrder };
