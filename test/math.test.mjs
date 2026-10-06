import assert from "node:assert/strict";
import { test } from "node:test";

import { add, subtract_edff7b0de2 } from "../src/math.mjs";

test("add adds two numbers", () => {
  assert.equal(add(2, 3), 5);
});

test("subtract_edff7b0de2 subtracts two numbers", () => {
  assert.equal(subtract_edff7b0de2(7, 3), 4);
  assert.equal(subtract_edff7b0de2(3, 7), -4);
});
