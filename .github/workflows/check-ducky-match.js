const REQUIRED_IMAGES = [
  ".github/images/ducky-intro.png",
  ".github/images/mona-intro.png",
  ".github/images/copilot-intro.png",
];

function getRepositoryParts() {
  const repository = process.env.GITHUB_REPOSITORY;
  if (typeof repository !== "string") return null;

  const parts = repository.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

  return { owner: parts[0], repo: parts[1] };
}

function getServerHostname() {
  const serverUrl = process.env.GITHUB_SERVER_URL;
  if (typeof serverUrl !== "string") return null;

  try {
    return new URL(serverUrl).hostname;
  } catch {
    return null;
  }
}

function getRequiredImageFromPathname(pathname, prefixLength) {
  const imagePath = pathname.slice(prefixLength).replace(/^\/+/, "");
  return REQUIRED_IMAGES.find((requiredPath) => imagePath === requiredPath) || null;
}

function matchRepositoryImageUrl(url) {
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  if (parsedUrl.protocol !== "https:") return null;

  const repository = getRepositoryParts();
  const serverHostname = getServerHostname();
  if (!repository || !serverHostname) return null;

  const pathname = parsedUrl.pathname;
  const rawPrefix = `/${repository.owner}/${repository.repo}/`;
  if (
    serverHostname === "github.com" &&
    parsedUrl.hostname === "raw.githubusercontent.com" &&
    pathname.startsWith(rawPrefix)
  ) {
    const refSeparator = pathname.indexOf("/", rawPrefix.length);
    if (refSeparator === -1) return null;
    return getRequiredImageFromPathname(pathname, refSeparator + 1);
  }

  const githubPrefix = `/${repository.owner}/${repository.repo}/`;
  if (parsedUrl.hostname === serverHostname && pathname.startsWith(githubPrefix)) {
    const rest = pathname.slice(githubPrefix.length);

    if (rest.startsWith("raw/") || rest.startsWith("blob/")) {
      const modeSeparator = rest.indexOf("/");
      const refSeparator = rest.indexOf("/", modeSeparator + 1);
      if (refSeparator === -1) return null;
      return getRequiredImageFromPathname(rest, refSeparator + 1);
    }
  }

  return null;
}

function matchRequiredImage(url) {
  if (typeof url !== "string") return null;

  if (REQUIRED_IMAGES.includes(url)) return url;

  return matchRepositoryImageUrl(url);
}

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
    const matchedImage = matchRequiredImage(urls[0]);
    if (!matchedImage) return false;
    counts[matchedImage] += 1;
  }

  return REQUIRED_IMAGES.every((url) => counts[url] === 2);
}

module.exports = { REQUIRED_IMAGES, parseUncoveredCards, checkDuckyMatches };
