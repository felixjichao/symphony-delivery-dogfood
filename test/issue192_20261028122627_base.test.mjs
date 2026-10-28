import test from 'node:test';
import assert from 'node:assert/strict';
import { issue192_20261028122627 } from '../src/issue192_20261028122627.mjs';
test('base implementation survives issue192-20261028122627', () => assert.equal(issue192_20261028122627.base, true));
