import { readFile } from "node:fs/promises";
import { parse } from "smol-toml";
import { calculateHexagrams } from "../src/hexagram-calculator.js";
import { calculateXiaoliurenAt } from "../src/xiaoliuren-calculator.js";
import { LIUREN } from "../data.js";

const CONFIG_URL = new URL("../../.env.llm.local.toml", import.meta.url);
const PROVIDERS = new Set(["alibaba", "deepseek"]);
const TIERS = new Set(["fast", "balanced", "quality"]);

class AnalysisError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function lineName(line, value) {
  const tone = value === "1" ? "九" : "六";
  if (line === 1) return `初${tone}`;
  if (line === 6) return `上${tone}`;
  return `${tone}${["", "", "二", "三", "四", "五"][line]}`;
}

function title(hexagram, lower, upper) {
  return lower === upper ? `${upper.name}为${upper.nature}` : `${upper.nature}${lower.nature}${hexagram.name}`;
}

export async function generateHexagramAnalysis(input, config, fetchImpl = fetch) {
  if (!Array.isArray(input?.digits) || input.digits.length !== 3 || !PROVIDERS.has(input.provider) || !TIERS.has(input.tier) || typeof input.question !== "string" || input.question.length > 300) {
    throw new AnalysisError(400, "起卦参数不正确");
  }

  let cast;
  try {
    cast = calculateHexagrams(...input.digits);
  } catch {
    throw new AnalysisError(400, "请输入三组各三位数字");
  }

  const original = title(cast.original, cast.lower, cast.upper);
  const changed = title(cast.changed, cast.changedLower, cast.changedUpper);
  const moving = lineName(cast.movingLine, cast.originalLines[cast.movingLine - 1]);
  const prompt = [
    `本卦：第${cast.original.number}卦 ${original}。卦辞：${cast.original.guaci} 白话提示：${cast.original.meaning}`,
    `动爻：${moving}（从下往上第${cast.movingLine}爻）。本站未提供该爻爻辞。`,
    `之卦：第${cast.changed.number}卦 ${changed}。卦辞：${cast.changed.guaci} 白话提示：${cast.changed.meaning}`,
    `所问之事：${input.question.trim() || "未指定，请给出通用的观察角度。"}`,
  ].join("\n");
  const depth = {
    fast: "用约200字、两段概括关键变化与一条行动建议。",
    balanced: "用约350字、三段说明卦象关系、现实判断与可采取的行动。",
    quality: "用约500字、四段分析支持与阻力、动爻位置的象征意义、可验证的现实信号和行动建议。",
  }[input.tier];

  return requestModel(input, config, `你是周易文化资料解读助手。根据给定本卦、动爻位置和之卦，用简体中文结合所问之事分析。${depth}不要编造或引用未提供的爻辞，不要断言必然结果。医疗、法律、投资等重要问题只给出一般性反思，不代替专业意见。只输出纯文本，不使用 Markdown 标记。`, prompt, fetchImpl);
}

export async function generateXiaoliurenAnalysis(input, config, fetchImpl = fetch) {
  if (!input || typeof input.timestamp !== "string" || input.timestamp.length > 40 || typeof input.timeZone !== "string" || input.timeZone.length > 80 || !PROVIDERS.has(input.provider) || !TIERS.has(input.tier) || typeof input.question !== "string" || input.question.length > 300) {
    throw new AnalysisError(400, "小六壬分析参数不正确");
  }

  const date = new Date(input.timestamp);
  if (!Number.isFinite(date.getTime())) throw new AnalysisError(400, "起卦时间不正确");
  let cast;
  try {
    cast = calculateXiaoliurenAt(date, input.timeZone);
  } catch {
    throw new AnalysisError(400, "起卦时间或时区不正确");
  }

  const month = LIUREN[cast.monthIndex];
  const day = LIUREN[cast.dayIndex];
  const final = LIUREN[cast.finalIndex];
  const prompt = [
    `起课时间：${cast.solarTime}（${cast.timeZone}）。农历${cast.leapMonth ? "闰" : ""}${cast.lunarMonth}月${cast.lunarDay}日，${cast.branch}时。`,
    `采用六宫循环法：正月大安起，月宫作初一，日宫作子时，依次顺数。月宫：${month.name}；日宫：${day.name}；时宫：${final.name}。`,
    `时宫资料：${final.gist}；五行${final.element}，方位${final.direction}。参考说明：${final.explanation} 常见诗诀：${final.verse}`,
    `所问之事：${input.question.trim() || "未指定，请提供一般性的观察角度。"}`,
  ].join("\n");
  const depth = {
    fast: "用约180字概括落宫提示与一条现实行动建议。",
    balanced: "用约300字说明月日时递进、落宫含义与可验证的现实信号。",
    quality: "用约450字分析支持与阻力、不同宫位的关系、可验证的现实信号与行动建议。",
  }[input.tier];

  return requestModel(input, config, `你是小六壬民俗文化学习助手。仅依据提供的起课口径、月宫、日宫、时宫和参考资料，用简体中文结合所问之事解读。${depth}不同传承可能有不同口径，不要断言必然结果，不要把诗诀中的健康或灾祸说法当作事实。医疗、法律、投资等重要问题只给出一般性反思，不代替专业意见。只输出纯文本，不使用 Markdown 标记。`, prompt, fetchImpl);
}

async function requestModel(input, config, systemPrompt, prompt, fetchImpl) {
  const settings = config.llm?.[input.provider];
  const model = settings?.model_map?.[input.tier];
  if (!settings?.api_key || !settings?.base_url || !model) {
    throw new AnalysisError(503, "模型配置不完整，请检查本地配置文件");
  }

  let response;
  try {
    response = await fetchImpl(new URL("chat/completions", `${settings.base_url.replace(/\/+$/, "")}/`), {
      method: "POST",
      headers: { Authorization: `Bearer ${settings.api_key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: input.tier === "quality" ? 3600 : 2400,
        ...(input.provider === "alibaba" ? { enable_thinking: input.tier === "quality" } : {}),
        stream: false,
      }),
      signal: AbortSignal.timeout(input.tier === "quality" ? 120000 : 60000),
    });
  } catch {
    throw new AnalysisError(502, "连接模型服务失败，请检查网络或稍后重试");
  }

  if (!response.ok) {
    throw new AnalysisError(502, `模型服务返回 HTTP ${response.status}，请检查模型配置或账户状态`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new AnalysisError(502, "模型返回了无法读取的结果");
  }
  const analysis = data.choices?.[0]?.message?.content;
  if (typeof analysis !== "string" || !analysis.trim()) {
    throw new AnalysisError(502, "模型未返回分析内容，请重试");
  }
  return { analysis: analysis.trim(), provider: input.provider, model };
}

async function readBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 4096) throw new AnalysisError(413, "请求内容过长");
  }
  try {
    return JSON.parse(body);
  } catch {
    throw new AnalysisError(400, "请求格式不正确");
  }
}

function send(response, status, value) {
  if (response.destroyed) return;
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(value));
}

async function analysisMiddleware(request, response, generate) {
  if (request.method !== "POST") return send(response, 405, { error: "仅支持 POST 请求" });
  if (!request.headers["content-type"]?.startsWith("application/json")) return send(response, 415, { error: "请求格式不正确" });
  if (request.headers.origin) {
    try {
      if (new URL(request.headers.origin).host !== request.headers.host) return send(response, 403, { error: "请求来源不正确" });
    } catch {
      return send(response, 403, { error: "请求来源不正确" });
    }
  }

  try {
    const input = await readBody(request);
    const config = parse(await readFile(process.env.XJZ_LLM_CONFIG || CONFIG_URL, "utf8"));
    send(response, 200, await generate(input, config));
  } catch (error) {
    send(response, error instanceof AnalysisError ? error.status : 503, { error: error instanceof AnalysisError ? error.message : "无法读取模型配置" });
  }
}

export function hexagramAnalysisMiddleware(request, response) {
  return analysisMiddleware(request, response, generateHexagramAnalysis);
}

export function xiaoliurenAnalysisMiddleware(request, response) {
  return analysisMiddleware(request, response, generateXiaoliurenAnalysis);
}
