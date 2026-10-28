import assert from "node:assert/strict";
import { test } from "node:test";

import { issue192_20261028075031 } from "../src/issue192_20261028075031.mjs";

test("issue192_20261028075031 enables feature", () => {
  assert.equal(issue192_20261028075031.feature, true);
});
