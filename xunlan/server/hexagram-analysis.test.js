import assert from "node:assert/strict";
import test from "node:test";
import { generateHexagramAnalysis } from "./hexagram-analysis.js";

const config = { llm: { alibaba: { api_key: "test-secret", base_url: "https://example.test/v1", model_map: { balanced: "test-model" } } } };
const input = { digits: ["008", "006", "006"], provider: "alibaba", tier: "balanced", question: "是否离职？" };

test("server builds the prompt from calculated hexagrams and keeps the key out of its response", async () => {
  let request;
  const fetchImpl = async (url, options) => {
    request = { url: String(url), ...options };
    return { ok: true, json: async () => ({ choices: [{ message: { content: "先观察，再行动。" } }] }) };
  };

  const result = await generateHexagramAnalysis(input, config, fetchImpl);
  const body = JSON.parse(request.body);
  assert.equal(request.url, "https://example.test/v1/chat/completions");
  assert.equal(request.headers.Authorization, "Bearer test-secret");
  assert.match(body.messages[1].content, /第8卦 水地比/);
  assert.match(body.messages[1].content, /动爻：上六/);
  assert.match(body.messages[1].content, /第20卦 风地观/);
  assert.match(body.messages[1].content, /是否离职/);
  assert.deepEqual(result, { analysis: "先观察，再行动。", provider: "alibaba", model: "test-model" });
  assert.doesNotMatch(JSON.stringify(result), /test-secret/);
});

test("server rejects malformed input before contacting a provider", async () => {
  await assert.rejects(generateHexagramAnalysis({ ...input, digits: ["8", "006", "006"] }, config, () => {
    throw new Error("should not fetch");
  }), /请输入三组各三位数字/);
});

test("provider errors do not expose response bodies or keys", async () => {
  await assert.rejects(generateHexagramAnalysis(input, config, async () => ({ ok: false, status: 401 })), /HTTP 401/);
});
