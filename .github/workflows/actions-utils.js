function getCheckboxes(text) {
  if (typeof text !== "string" || text.length === 0) return [];

  return [...text.matchAll(/- \[([ xX])\] (.+)/g)];
}

function getCheckedValue(checkboxes) {
  if (!checkboxes || checkboxes.length === 0) return null;

  for (const checkbox of checkboxes) {
    if (checkbox[1].toLowerCase() === "x") {
      return checkbox[2].trim();
    }
  }
  return null;
}

function disableCheckboxes(text) {
  if (typeof text !== "string" || text.length === 0) return text;

  return text.replace(/- \[([ xX])\] (.+)/g, (match, checked, label) => {
    const emoji = String(checked).toLowerCase() === "x" ? "✅" : "⬜️";
    return `${emoji} ${label}`;
  });
}

function resetCheckboxes(text) {
  // If input is not a string (for example null), return as-is to keep behaviour
  if (typeof text !== "string" || text.length === 0) return text;

  // Replace any checked or unchecked markdown checkbox with an unchecked one
  return text.replace(/- \[[ xX]\] (.+)/g, (match, label) => {
    return `- [ ] ${label}`;
  });
}

function removeAlerts(text) {
  // If input is not a string (for example null), return as-is to keep behaviour
  if (typeof text !== "string" || text.length === 0) return text;

  // Match an alert block that starts with a blockquote line containing [!TYPE]
  // and includes any following contiguous blockquote lines. Examples:
  // > [!Caution]
  // > ❌ This is a bad idea.
  // or a single-line: > [!note] Some text
  // Allow optional leading whitespace before the blockquote marker so indented
  // alerts are also matched (common in markdown inside lists or fenced blocks)
  const alertBlockRegex = /^\s*> ?\[![^\]]+\][^\n]*(?:\n|$)(?:^\s*>.*(?:\n|$))*/gim;

  const cleaned = text.replace(alertBlockRegex, "");

  // Collapse multiple blank lines introduced by removals to at most two
  return cleaned.replace(/\n{3,}/g, "\n\n");
}

module.exports = {
  getCheckboxes,
  getCheckedValue,
  disableCheckboxes,
  resetCheckboxes,
  removeAlerts,
};
