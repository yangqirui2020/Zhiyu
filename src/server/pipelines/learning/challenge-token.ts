import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { learningChallengePayloadSchema, type LearningChallengePayload } from "../../../domain/schemas/learning.ts";
import { AppError } from "../../errors/app-error.ts";

function secret(value?: string) {
  const key = value ?? process.env.LEARNING_SESSION_SECRET ?? "";
  if (key.length < 32) throw new AppError("PROVIDER_UNAVAILABLE", "学习会话暂时不可用，请稍后重试。", 502, true, "retry");
  return key;
}
const invalid = () => new AppError("INVALID_INPUT", "追问会话已失效，请重新开始这节课。", 400, false, "none");
export function signChallenge(payload: LearningChallengePayload, key?: string) {
  const encoded = Buffer.from(JSON.stringify(learningChallengePayloadSchema.parse(payload))).toString("base64url");
  return `${encoded}.${createHmac("sha256", secret(key)).update(encoded).digest("base64url")}`;
}
export function verifyChallenge(token: string, key?: string, now = Date.now()): LearningChallengePayload {
  const signingKey = secret(key);
  if (token.length > 20_000 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(token)) throw invalid();
  const [encoded, signature] = token.split(".");
  const expected = createHmac("sha256", signingKey).update(encoded).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw invalid();
  try {
    const payload = learningChallengePayloadSchema.parse(JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")));
    if (payload.expiresAt <= now || payload.expiresAt > now + 3_600_000) throw invalid();
    return payload;
  } catch { throw invalid(); }
}
