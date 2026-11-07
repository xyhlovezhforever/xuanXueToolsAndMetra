const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

export function calculateXiaoliurenAt(date, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  const lunarParts = Object.fromEntries(
    new Intl.DateTimeFormat("en-u-ca-chinese", { timeZone, month: "numeric", day: "numeric" })
      .formatToParts(date).filter((part) => part.type === "month" || part.type === "day")
      .map((part) => [part.type, part.value]),
  );
  const lunarMonth = Number.parseInt(lunarParts.month, 10);
  const lunarDay = Number(lunarParts.day);
  const leapMonth = lunarParts.month.endsWith("bis");
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" })
    .formatToParts(date).find((part) => part.type === "hour").value);
  const branchIndex = Math.floor(((hour + 1) % 24) / 2);
  const monthIndex = (lunarMonth - 1) % 6;
  const dayIndex = (monthIndex + lunarDay - 1) % 6;
  const finalIndex = (dayIndex + branchIndex) % 6;
  const solarTime = new Intl.DateTimeFormat("zh-CN", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(date);

  return { solarTime, timeZone, lunarMonth, lunarDay, leapMonth, branchIndex, branch: BRANCHES[branchIndex], monthIndex, dayIndex, finalIndex };
}
