import { BAGUA, HEXAGRAMS } from "../data.js";

// 行为下卦、列为上卦，均按先天序数 1-8 排列；值为文王卦序。
const HEXAGRAM_BY_TRIGRAMS = [
  [1, 43, 14, 34, 9, 5, 26, 11],
  [10, 58, 38, 54, 61, 60, 41, 19],
  [13, 49, 30, 55, 37, 63, 22, 36],
  [25, 17, 21, 51, 42, 3, 27, 24],
  [44, 28, 50, 32, 57, 48, 18, 46],
  [6, 47, 64, 40, 59, 29, 4, 7],
  [33, 31, 56, 62, 53, 39, 52, 15],
  [12, 45, 35, 16, 20, 8, 23, 2],
];

function remainderAsPosition(value, divisor) {
  return Number(value) % divisor || divisor;
}

function hexagramFor(lower, upper) {
  return HEXAGRAMS[HEXAGRAM_BY_TRIGRAMS[lower.number - 1][upper.number - 1] - 1];
}

export function calculateHexagrams(lowerDigits, upperDigits, movingDigits) {
  if (![lowerDigits, upperDigits, movingDigits].every((value) => /^\d{3}$/.test(value))) {
    throw new Error("请输入三组各三位数字");
  }

  const lower = BAGUA[remainderAsPosition(lowerDigits, 8) - 1];
  const upper = BAGUA[remainderAsPosition(upperDigits, 8) - 1];
  const movingLine = remainderAsPosition(movingDigits, 6);
  const originalLines = [...lower.binary, ...upper.binary];
  const changedLines = [...originalLines];
  changedLines[movingLine - 1] = changedLines[movingLine - 1] === "1" ? "0" : "1";

  const changedLower = BAGUA.find((item) => item.binary === changedLines.slice(0, 3).join(""));
  const changedUpper = BAGUA.find((item) => item.binary === changedLines.slice(3).join(""));

  return {
    lower,
    upper,
    movingLine,
    original: hexagramFor(lower, upper),
    originalLines,
    changedLower,
    changedUpper,
    changed: hexagramFor(changedLower, changedUpper),
    changedLines,
  };
}
