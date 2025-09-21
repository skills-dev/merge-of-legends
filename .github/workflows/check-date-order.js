/**
 * Parse all occurrences of YYYY-MM in a body of text and return them as Date objects
 * in the same order they were found. Invalid months (00 or >12) are ignored by the
 * regular expression. If a match for some reason doesn't produce a valid Date, it's
 * skipped.
 *
 * @param {string} text
 * @returns {Date[]} array of Date objects in the order found
 */
function parseDatesFromText(text) {
  if (typeof text !== "string" || text.length === 0) return [];

  // Match YYYY-MM where YYYY is 4 digits and MM is 01-12. Use a word boundary to avoid
  // matching longer numeric strings like 20201-05.
  const re = /\b(\d{4})-(0[1-9]|1[0-2])\b/g;
  const results = [];
  let match;

  while ((match = re.exec(text)) !== null) {
    const year = Number(match[1]);
    const month = Number(match[2]);

    // Construct a UTC date for the first of the month. Using UTC avoids timezone shifts.
    const d = new Date(Date.UTC(year, month - 1, 1));
    if (!isNaN(d.getTime())) {
      results.push(d);
    }
  }

  return results;
}

/**
 * Check whether an array of values contains Date objects in ascending chronological order.
 * Non-Date entries are ignored. Empty or single-date results are considered chronological.
 *
 * @param {Array} arr - array that may contain Date objects
 * @returns {boolean} true if the (filtered) dates are in ascending (non-decreasing) order
 */
function isChronological(arr) {
  if (!Array.isArray(arr)) return false;

  // Keep only valid Date objects
  const dates = arr.filter((v) => v instanceof Date && !isNaN(v.getTime()));
  if (dates.length <= 1) return true;

  for (let i = 1; i < dates.length; i++) {
    if (dates[i].getTime() < dates[i - 1].getTime()) return false;
  }

  return true;
}

/**
 * Count how many times the (filtered) date sequence is not ascending when compared
 * sequentially. Non-Date entries are ignored. For each pair of adjacent dates, if
 * the next date is earlier than the previous date the counter increases.
 *
 * @param {Array} arr
 * @returns {number} number of adjacent out-of-order occurrences
 */
function countNotAscending(arr) {
  if (!Array.isArray(arr)) return 0;

  // Keep only valid Date objects
  const dates = arr.filter((v) => v instanceof Date && !isNaN(v.getTime()));
  if (dates.length <= 1) return 0;

  let count = 0;
  for (let i = 1; i < dates.length; i++) {
    if (dates[i].getTime() < dates[i - 1].getTime()) count += 1;
  }

  return count;
}

module.exports = {
  parseDatesFromText,
  isChronological,
  countNotAscending,
};
