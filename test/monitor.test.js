import test from "node:test";
import assert from "node:assert/strict";

function detectChanges(previous, current) {
  const changes = [];
  if (!previous) return [{ type: "BASELINE_CREATED", sol: current.sol, latestSignature: current.latestSignature }];
  if (previous.lamports !== current.lamports) changes.push({ type: "BALANCE_CHANGED" });
  if (current.latestSignature && current.latestSignature !== previous.latestSignature) changes.push({ type: "NEW_ACTIVITY" });
  return changes;
}

test("creates baseline on first monitor run", () => {
  assert.equal(detectChanges(null, { sol: 1, latestSignature: "abc" })[0].type, "BASELINE_CREATED");
});

test("detects balance and transaction changes", () => {
  const changes = detectChanges({ lamports: 1_000_000_000, latestSignature: "old" }, { lamports: 900_000_000, sol: 0.9, latestSignature: "new" });
  assert.deepEqual(changes.map((x) => x.type), ["BALANCE_CHANGED", "NEW_ACTIVITY"]);
});
