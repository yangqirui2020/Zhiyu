import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { provenanceSchema } from "../../src/domain/schemas/index.ts";

describe("provenanceSchema", () => {
  it("accepts an explicit snapshot response", () => {
    const result = provenanceSchema.safeParse({
      schemaVersion: "1.0.0-rc.1",
      mode: "snapshot",
      requestId: "req_contract_1",
      servedAt: "2026-08-31T00:00:00.000Z",
      snapshotId: "snap_demo_1",
      capturedAt: "2026-08-30T12:00:00.000Z",
      fallbackFrom: "live",
      fallbackReason: "provider timeout",
      warnings: [],
    });

    assert.equal(result.success, true);
  });

  it("rejects an undisclosed mode", () => {
    const result = provenanceSchema.safeParse({
      schemaVersion: "1.0.0-rc.1",
      mode: "automatic",
      requestId: "req_contract_2",
      servedAt: "2026-08-31T00:00:00.000Z",
      warnings: [],
    });

    assert.equal(result.success, false);
  });
});
