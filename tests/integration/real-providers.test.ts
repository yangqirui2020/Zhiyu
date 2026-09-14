import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { argumentDraftSchema } from "../../src/domain/schemas/classroom.ts";
import { AppError } from "../../src/server/errors/app-error.ts";
import { DeepSeekStructuredOutputProvider } from "../../src/server/providers/deepseek/deepseek-structured-output-provider.ts";
import { ZhihuContentProvider } from "../../src/server/providers/zhihu/zhihu-content-provider.ts";
import type { ExecutionContext } from "../../src/server/ports/execution-context.ts";

const context = (): ExecutionContext => ({ requestId: "req_provider_test", signal: new AbortController().signal, deadlineAt: Date.now() + 10_000, mode: "live" });
const request = { questionUrl: "https://www.zhihu.com/question/123", offset: 0, limit: 20 };
const item = { ContentType: "answer", ContentToken: "456", Url: "https://www.zhihu.com/question/123/answer/456?utm_source=test", Summary: "先按学习目标选择语言。" };
const page = { Items: [item], Paging: { IsEnd: true } };
const code = (expected: string) => (error: unknown) => error instanceof AppError && error.code === expected && !error.message.includes("secret-for-test");
const fetchJson = (body: unknown, status = 200): typeof fetch => async () => Response.json(body, { status });

describe("official content boundary", () => {
  it("keeps source URLs and summaries and sends the documented parameters", async () => {
    const provider = new ZhihuContentProvider({ accessSecret: "secret-for-test", fetch: async (input, init) => {
      const url = new URL(String(input));
      assert.equal(url.origin, "https://developer.zhihu.com");
      assert.equal(url.searchParams.get("QuestionUrl"), request.questionUrl);
      assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer secret-for-test");
      assert.match(new Headers(init?.headers).get("X-Request-Timestamp")!, /^\d+$/);
      assert.equal(init?.redirect, "error");
      return Response.json({ Code: 0, Message: "success", Data: page });
    } });
    assert.deepEqual(await provider.getQuestionAnswers(request, context()), page);
  });

  it("accepts an empty non-final page only with an advancing official cursor", async () => {
    const next = { Items: [], Paging: { IsEnd: false, NextOffset: 50 } };
    const provider = new ZhihuContentProvider({ accessSecret: "test", fetch: fetchJson({ Code: 0, Message: "success", Data: next }) });
    assert.deepEqual(await provider.getQuestionAnswers(request, context()), next);
    for (const paging of [{ IsEnd: false }, { IsEnd: false, NextOffset: 0 }]) {
      const invalid = new ZhihuContentProvider({ accessSecret: "test", fetch: fetchJson({ Code: 0, Message: "success", Data: { Items: [], Paging: paging } }) });
      await assert.rejects(invalid.getQuestionAnswers(request, context()), code("STRUCTURED_OUTPUT_INVALID"));
    }
  });

  it("rejects other-question answers and malformed source data", async () => {
    for (const invalidItem of [{ ...item, Url: "https://www.zhihu.com/question/999/answer/456" }, { ...item, Summary: "" }, { ...item, ContentToken: "789" }]) {
      const provider = new ZhihuContentProvider({ accessSecret: "test", fetch: fetchJson({ Code: 0, Message: "success", Data: { ...page, Items: [invalidItem] } }) });
      await assert.rejects(provider.getQuestionAnswers(request, context()), code("STRUCTURED_OUTPUT_INVALID"));
    }
  });

  it("maps API quota and HTTP auth errors without leaking provider messages", async () => {
    for (const [body, status, expected] of [[{ Code: 30001, Message: "secret-for-test" }, 200, "PROVIDER_RATE_LIMITED"], [{ error: "secret-for-test" }, 401, "PROVIDER_UNAVAILABLE"]] as const) {
      const provider = new ZhihuContentProvider({ accessSecret: "test", fetch: fetchJson(body, status) });
      await assert.rejects(provider.getQuestionAnswers(request, context()), code(expected));
    }
  });

  it("retries one transient HTTP failure and never follows credential redirects", async () => {
    let calls = 0;
    const provider = new ZhihuContentProvider({ accessSecret: "test", fetch: async (_input, init) => {
      assert.equal(init?.redirect, "error"); calls += 1;
      return calls === 1 ? new Response("unavailable", { status: 503 }) : Response.json({ Code: 0, Message: "success", Data: page });
    } });
    assert.deepEqual(await provider.getQuestionAnswers(request, context()), page);
    assert.equal(calls, 2);
  });

  it("does not request after cancellation, deadline expiry, or unsafe URL input", async () => {
    let calls = 0;
    const provider = new ZhihuContentProvider({ accessSecret: "test", fetch: async () => { calls += 1; throw new Error("unreachable"); } });
    await assert.rejects(provider.getQuestionAnswers(request, { ...context(), signal: AbortSignal.abort() }), code("PROVIDER_TIMEOUT"));
    await assert.rejects(provider.getQuestionAnswers(request, { ...context(), deadlineAt: Date.now() - 1 }), code("PROVIDER_TIMEOUT"));
    await assert.rejects(provider.getQuestionAnswers({ ...request, questionUrl: "https://attacker.example/question/123" }, context()), code("INVALID_INPUT"));
    assert.equal(calls, 0);
  });
});

describe("DeepSeek structured output boundary", () => {
  const draft = { conclusion: "按学习目标选择语言。", reasons: ["不同目标需要不同工具。"], evidenceIds: ["ev_test"], qualifiers: [] };
  const generation = { schema: argumentDraftSchema, schemaName: "ArgumentDraft", system: "仅依据资料输出 JSON。", prompt: "按学习目标选择语言。", maxOutputTokens: 400 };
  const completion = (content: string) => ({ id: "completion_test", object: "chat.completion", created: 1_800_000_000, model: "deepseek-flash", choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }], usage: { prompt_tokens: 20, completion_tokens: 30, total_tokens: 50 } });

  it("uses the frozen schema, records actual model usage, and disables thinking", async () => {
    const provider = new DeepSeekStructuredOutputProvider({ apiKey: "secret-for-test", modelId: "deepseek-flash", fetch: async (_input, init) => {
      const body = JSON.parse(String(init?.body));
      assert.equal(body.model, "deepseek-flash");
      assert.deepEqual(body.thinking, { type: "disabled" });
      assert.equal(init?.redirect, "error");
      return Response.json(completion(JSON.stringify(draft)));
    } });
    const result = await provider.generate(generation, context());
    assert.deepEqual(result.data, draft);
    assert.equal(result.metadata.inputTokens, 20);
    assert.equal(result.metadata.outputTokens, 30);
  });

  it("rejects syntactically valid JSON that violates the domain schema", async () => {
    const provider = new DeepSeekStructuredOutputProvider({ apiKey: "test", modelId: "deepseek-flash", fetch: fetchJson(completion('{"conclusion":"missing evidence"}')) });
    await assert.rejects(provider.generate(generation, context()), code("STRUCTURED_OUTPUT_INVALID"));
  });

  it("honors cancellation and sanitizes authentication failure", async () => {
    const provider = new DeepSeekStructuredOutputProvider({ apiKey: "test", modelId: "deepseek-flash", fetch: fetchJson({ error: { message: "secret-for-test", type: "authentication_error" } }, 401) });
    await assert.rejects(provider.generate(generation, { ...context(), signal: AbortSignal.abort() }), code("PROVIDER_TIMEOUT"));
    await assert.rejects(provider.generate(generation, context()), code("PROVIDER_UNAVAILABLE"));
  });
});
