import test from 'node:test';
import assert from 'node:assert/strict';
import { issue192_20261028075031 } from '../src/issue192_20261028075031.mjs';
test('base implementation survives issue192-20261028075031', () => assert.equal(issue192_20261028075031.base, true));
