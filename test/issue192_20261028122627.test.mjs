import assert from "node:assert/strict";
import { test } from "node:test";

import { issue192_20261028122627 } from "../src/issue192_20261028122627.mjs";

test("issue192_20261028122627 enables feature", () => {
  assert.equal(issue192_20261028122627.feature, true);
});
