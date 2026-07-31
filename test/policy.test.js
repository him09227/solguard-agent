import test from "node:test";
import assert from "node:assert/strict";
import { validateTransfer, approvalRequired } from "../src/policy.js";
import { createPaymentRequest } from "../src/request.js";

const ADDRESS = "11111111111111111111111111111111";

test("every transfer requires human approval", () => {
  assert.equal(approvalRequired(), true);
  assert.equal(createPaymentRequest({ recipient: ADDRESS, amountSol: 0.1 }).status, "awaiting_human_approval");
});

test("rejects transfer above configured limit", () => {
  const result = validateTransfer({ recipient: ADDRESS, amountSol: 999 });
  assert.equal(result.ok, false);
  assert.match(result.errors.join(" "), /exceeds policy limit/);
});

test("rejects malformed request", () => {
  assert.equal(validateTransfer({ recipient: "bad", amountSol: -1 }).ok, false);
});
