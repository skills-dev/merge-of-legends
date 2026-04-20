const REQUIRED_IMAGES = [
  "https://github.com/user-attachments/assets/ef33b2a2-0156-4aa8-b28e-9a39597b4197",
  "https://github.com/user-attachments/assets/0c56a61d-f06c-44a4-842b-ec93fb764a79",
  "https://github.com/user-attachments/assets/e9a07088-41fc-499c-971f-b175884a0711",
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

function extractKnownImageUrls(cardValue) {
  if (typeof cardValue !== "string") return [];
  const urls = cardValue.match(/https?:\/\/[^\s)>"'`]+/g) || [];
  return urls.filter((url) => REQUIRED_IMAGES.includes(url));
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
    const urls = extractKnownImageUrls(card);
    if (urls.length !== 1) return false;
    counts[urls[0]] += 1;
  }

  return REQUIRED_IMAGES.every((url) => counts[url] === 2);
}

module.exports = { REQUIRED_IMAGES, parseUncoveredCards, checkDuckyMatches };
