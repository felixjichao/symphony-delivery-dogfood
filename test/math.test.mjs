import assert from "node:assert/strict";
import { test } from "node:test";

import { add, subtract_e04caec358 } from "../src/math.mjs";

test("add adds two numbers", () => {
  assert.equal(add(2, 3), 5);
});

test("subtract_e04caec358 subtracts two numbers", () => {
  assert.equal(subtract_e04caec358(5, 3), 2);
  assert.equal(subtract_e04caec358(3, 5), -2);
});
