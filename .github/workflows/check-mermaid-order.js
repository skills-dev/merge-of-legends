const REQUIRED_IMAGES = [
  "https://github.com/user-attachments/assets/c9d4a45b-5e71-4d34-8aab-1cb28ecca8cb",
  "https://github.com/user-attachments/assets/062f5275-7e33-4355-85ef-fc958433df81",
  "https://github.com/user-attachments/assets/37302691-a101-4436-8336-7c0c991ad05d",
];

/**
 * Parse card values from the "Uncovered Cards" section.
 *
 * @param {string} text
 * @returns {string[]} array of card values in order
 */
function parseUncoveredCards(text) {
  if (typeof text !== "string" || text.length === 0) return [];

  const sectionMatch = text.match(/###\s*Uncovered Cards([\s\S]*)/i);
  if (!sectionMatch) return [];

  const section = sectionMatch[1];
  const cards = [];
  const cardLineRe = /^\s*-\s*Card\s*\d+\s*:\s*(.+)$/gim;

  let match;
  while ((match = cardLineRe.exec(section)) !== null) {
    cards.push(match[1].trim());
  }

  return cards;
}

function extractImageUrls(cardValue) {
  if (typeof cardValue !== "string") return [];
  const value = cardValue.trim();
  const markdownImageMatch = value.match(/^!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)$/);
  if (markdownImageMatch) return [markdownImageMatch[1]];
  if (/^https?:\/\/[^\s)>"'`]+$/.test(value)) return [value];
  if (/^(?:\.\.?\/)?(?:[\w.-]+\/)*[\w.-]+\.(?:png|jpe?g|gif|webp|svg)$/i.test(value)) {
    return [value];
  }
  return [];
}

/**
 * Check if all 6 cards are uncovered and form three matched pairs.
 *
 * @param {string[]} cards
 * @returns {boolean}
 */
function checkDuckyMatches(cards) {
  if (!Array.isArray(cards) || cards.length !== 6) return false;

  const counts = Object.fromEntries(REQUIRED_IMAGES.map((url) => [url, 0]));

  for (const card of cards) {
    const urls = extractImageUrls(card);
    if (urls.length !== 1) return false;
    if (!REQUIRED_IMAGES.includes(urls[0])) return false;
    counts[urls[0]] += 1;
  }

  return REQUIRED_IMAGES.every((url) => counts[url] === 2);
}

module.exports = { REQUIRED_IMAGES, parseUncoveredCards, checkDuckyMatches };
