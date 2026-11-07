import assert from "node:assert/strict";
import test from "node:test";
import { generateXiaoliurenAnalysis } from "./hexagram-analysis.js";

const config = { llm: { alibaba: { api_key: "test-secret", base_url: "https://example.test/v1", model_map: { balanced: "test-model" } } } };
const input = { timestamp: "2026-11-03T04:00:00.000Z", timeZone: "Asia/Shanghai", provider: "alibaba", tier: "balanced", question: "这件事如何推进？" };

test("xiaoliuren analysis uses a server-calculated cast and keeps the key private", async () => {
  let request;
  const result = await generateXiaoliurenAnalysis(input, config, async (url, options) => {
    request = { url: String(url), ...options };
    return { ok: true, json: async () => ({ choices: [{ message: { content: "先核对信息，再决定下一步。" } }] }) };
  });
  const body = JSON.parse(request.body);
  assert.equal(request.url, "https://example.test/v1/chat/completions");
  assert.equal(request.headers.Authorization, "Bearer test-secret");
  assert.match(body.messages[0].content, /小六壬/);
  assert.match(body.messages[1].content, /月宫：速喜/);
  assert.match(body.messages[1].content, /日宫：速喜/);
  assert.match(body.messages[1].content, /时宫：速喜/);
  assert.match(body.messages[1].content, /这件事如何推进/);
  assert.deepEqual(result, { analysis: "先核对信息，再决定下一步。", provider: "alibaba", model: "test-model" });
  assert.doesNotMatch(JSON.stringify(result), /test-secret/);
});

test("xiaoliuren analysis rejects invalid time and timezone before calling a model", async () => {
  const fetchImpl = () => { throw new Error("should not fetch"); };
  await assert.rejects(generateXiaoliurenAnalysis({ ...input, timestamp: "invalid" }, config, fetchImpl), /起卦时间/);
  await assert.rejects(generateXiaoliurenAnalysis({ ...input, timeZone: "invalid-zone" }, config, fetchImpl), /起卦时间/);
});
