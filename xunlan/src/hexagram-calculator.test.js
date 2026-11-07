import assert from "node:assert/strict";
import test from "node:test";
import { calculateHexagrams } from "./hexagram-calculator.js";

test("zero remainders use positions eight and six", () => {
  const result = calculateHexagrams("000", "000", "000");
  assert.equal(result.lower.name, "坤");
  assert.equal(result.upper.name, "坤");
  assert.equal(result.movingLine, 6);
  assert.equal(result.original.number, 2);
  assert.equal(result.changed.number, 23);
});

test("water over earth changes from 比 to 观 at the top line", () => {
  const result = calculateHexagrams("008", "006", "006");
  assert.equal(result.original.number, 8);
  assert.equal(result.changed.number, 20);
  assert.equal(result.movingLine, 6);
  assert.deepEqual(result.originalLines, ["0", "0", "0", "0", "1", "0"]);
  assert.deepEqual(result.changedLines, ["0", "0", "0", "0", "1", "1"]);
});

test("wind over lake changes from 中孚 to 履 at the fourth line", () => {
  const result = calculateHexagrams("002", "005", "004");
  assert.equal(result.original.number, 61);
  assert.equal(result.changed.number, 10);
  assert.equal(result.movingLine, 4);
  assert.equal(result.changedLower.name, "兑");
  assert.equal(result.changedUpper.name, "乾");
});

test("the 8 by 8 trigram combinations cover all 64 hexagrams", () => {
  const numbers = new Set();
  for (let lower = 1; lower <= 8; lower += 1) {
    for (let upper = 1; upper <= 8; upper += 1) {
      const result = calculateHexagrams(String(lower).padStart(3, "0"), String(upper).padStart(3, "0"), "001");
      numbers.add(result.original.number);
      assert.equal(result.originalLines.filter((value, index) => value !== result.changedLines[index]).length, 1);
    }
  }
  assert.deepEqual([...numbers].sort((a, b) => a - b), Array.from({ length: 64 }, (_, index) => index + 1));
});

test("requires exactly three digits per input", () => {
  assert.throws(() => calculateHexagrams("8", "006", "006"));
  assert.throws(() => calculateHexagrams("008", "a06", "006"));
});
