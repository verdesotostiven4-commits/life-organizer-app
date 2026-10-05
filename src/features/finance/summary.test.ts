import test from "node:test";
import assert from "node:assert/strict";
import { summarizeFinance } from "./summary.ts";

test("separates available balance from savings", () => {
  const summary = summarizeFinance(
    [
      { kind: "banco", balance: 125.5 },
      { kind: "efectivo", balance: 24.5 },
      { kind: "ahorros", balance: 80 },
    ],
    [],
  );

  assert.deepEqual(summary, {
    totalBalance: 150,
    totalSavings: 80,
    debtsOwed: 0,
    debtsOwedToMe: 0,
  });
});

test("counts only pending debts", () => {
  const summary = summarizeFinance(
    [],
    [
      { direction: "debo", status: "pendiente", amount: 15 },
      { direction: "debo", status: "pagado", amount: 50 },
      { direction: "me_deben", status: "pendiente", amount: 22.75 },
      { direction: "me_deben", status: "pagado", amount: 100 },
    ],
  );

  assert.equal(summary.debtsOwed, 15);
  assert.equal(summary.debtsOwedToMe, 22.75);
});

test("handles an empty finance state", () => {
  assert.deepEqual(summarizeFinance([], []), {
    totalBalance: 0,
    totalSavings: 0,
    debtsOwed: 0,
    debtsOwedToMe: 0,
  });
});
