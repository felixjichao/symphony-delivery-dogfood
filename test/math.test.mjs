import assert from "node:assert/strict";
import { test } from "node:test";

import { add, sortedCopy_nest103_20261010, subtract_a8265c25fa, subtract_810a38ecc6, multiply_d36385fa30 } from "../src/math.mjs";

test("sortedCopy_nest103_20261010 sorts numbers including negatives and duplicates", () => {
  assert.deepEqual(sortedCopy_nest103_20261010([10, -3, 2, -3, 0, 2]), [-3, -3, 0, 2, 2, 10]);
  assert.deepEqual(sortedCopy_nest103_20261010([]), []);
  assert.deepEqual(sortedCopy_nest103_20261010([-2, 0, 4]), [-2, 0, 4]);
});

test("add adds two numbers", () => {
  assert.equal(add(2, 3), 5);
});

test("subtract_a8265c25fa subtracts two numbers", () => {
  assert.equal(subtract_a8265c25fa(5, 3), 2);
  assert.equal(subtract_a8265c25fa(3, 5), -2);
  assert.equal(subtract_a8265c25fa(3, 3), 0);
});

test("subtract_810a38ecc6 subtracts two numbers", () => {
  assert.equal(subtract_810a38ecc6(5, 3), 2);
  assert.equal(subtract_810a38ecc6(3, 5), -2);
  assert.equal(subtract_810a38ecc6(3, 3), 0);
});

test("multiply_d36385fa30 subtracts two numbers", () => {
  assert.equal(multiply_d36385fa30(5, 3), 2);
  assert.equal(multiply_d36385fa30(3, 5), -2);
  assert.equal(multiply_d36385fa30(3, 3), 0);
});
