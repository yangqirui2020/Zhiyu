import "server-only";
import {
  zhihuAnswerPageRequestSchema,
  zhihuAnswerPageSchema,
  zhihuTransportEnvelopeSchema,
  type ZhihuAnswerPageRequest,
} from "../../../domain/schemas/provider.ts";
import { AppError } from "../../errors/app-error.ts";
import type { ContentProvider } from "../../ports/content-provider.ts";
import type { ExecutionContext } from "../../ports/execution-context.ts";
import { invalidProviderOutput, providerFailure, providerSignal, providerStatusError } from "../provider-failure.ts";

export class ZhihuContentProvider implements ContentProvider {
  private readonly accessSecret: string;
  private readonly transport: typeof fetch;

  constructor(options: { accessSecret?: string; fetch?: typeof fetch } = {}) {
    this.accessSecret = options.accessSecret ?? process.env.ZHIHU_ACCESS_SECRET ?? "";
    this.transport = options.fetch ?? fetch;
  }

  async getQuestionAnswers(input: ZhihuAnswerPageRequest, context: ExecutionContext) {
    const signal = providerSignal(context);
    try {
      signal.throwIfAborted();
      const parsed = zhihuAnswerPageRequestSchema.safeParse(input);
      if (!parsed.success) throw new AppError("INVALID_INPUT", "问题地址或分页参数无效。", 400, false, "edit_input");
      if (!this.accessSecret) throw providerStatusError(401);
      const { questionUrl, offset, limit } = parsed.data;
      const url = new URL("https://developer.zhihu.com/api/v1/content/question_answers");
      url.search = new URLSearchParams({ QuestionUrl: questionUrl, Offset: String(offset), Limit: String(limit) }).toString();
      for (let attempt = 0; attempt < 2; attempt += 1) {
        signal.throwIfAborted();
        const response = await this.transport(url, {
          signal, redirect: "error", cache: "no-store",
          headers: { Authorization: `Bearer ${this.accessSecret}`, "X-Request-Timestamp": String(Math.floor(Date.now() / 1000)), "Content-Type": "application/json" },
        });
        if (!response.ok) {
          await response.body?.cancel();
          if (attempt === 0 && [502, 503].includes(response.status)) continue;
          throw providerStatusError(response.status);
        }
        let raw: unknown;
        try { raw = await response.json(); } catch { throw invalidProviderOutput(); }
        const envelope = zhihuTransportEnvelopeSchema.safeParse(raw);
        if (!envelope.success) throw invalidProviderOutput();
        if (envelope.data.Code !== 0) throw providerStatusError(envelope.data.Code === 30001 ? 429 : 503);
        const page = zhihuAnswerPageSchema.safeParse(envelope.data.Data);
        if (!page.success) throw invalidProviderOutput();
        if (!page.data.Paging.IsEnd && page.data.Paging.NextOffset! <= offset) throw invalidProviderOutput();
        const questionId = new URL(questionUrl).pathname.split("/").at(-1);
        for (const item of page.data.Items) {
          if (new URL(item.Url).pathname !== `/question/${questionId}/answer/${item.ContentToken}`) throw invalidProviderOutput();
        }
        signal.throwIfAborted();
        return page.data;
      }
      throw providerStatusError(503);
    } catch (error) { throw providerFailure(error, signal); }
  }
}
