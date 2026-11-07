import assert from "node:assert/strict";
import test from "node:test";
import { calculateXiaoliurenAt } from "./xiaoliuren-calculator.js";

test("current-time method counts lunar month, day, and hour inclusively", () => {
  const cast = calculateXiaoliurenAt(new Date("2026-11-03T04:00:00Z"), "Asia/Shanghai");
  assert.equal(cast.lunarMonth, 9);
  assert.equal(cast.lunarDay, 25);
  assert.equal(cast.branch, "午");
  assert.deepEqual([cast.monthIndex, cast.dayIndex, cast.finalIndex], [2, 2, 2]);
});

test("leap month uses the original month number", () => {
  const cast = calculateXiaoliurenAt(new Date("2025-07-25T04:00:00Z"), "Asia/Shanghai");
  assert.equal(cast.leapMonth, true);
  assert.equal(cast.lunarMonth, 6);
  assert.equal(cast.lunarDay, 1);
});

test("23:00 is 子时 without advancing the lunar date", () => {
  const beforeMidnight = calculateXiaoliurenAt(new Date("2026-11-03T15:00:00Z"), "Asia/Shanghai");
  const afterMidnight = calculateXiaoliurenAt(new Date("2026-11-03T16:00:00Z"), "Asia/Shanghai");
  assert.equal(beforeMidnight.branch, "子");
  assert.equal(beforeMidnight.lunarDay, 25);
  assert.equal(afterMidnight.branch, "子");
  assert.equal(afterMidnight.lunarDay, 26);
});
