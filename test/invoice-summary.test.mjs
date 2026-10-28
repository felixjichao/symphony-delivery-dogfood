import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { buildInvoiceSummary, serializeInvoiceSummary } from "../src/invoice-summary.mjs";

const cliPath = fileURLToPath(new URL("../src/invoice-summary.mjs", import.meta.url));

function invoice(overrides = {}) {
  return {
    invoiceId: "INV-120",
    customerName: "Acme, Inc.",
    issuedAt: "2026-10-12",
    currency: "USD",
    items: [
      { description: "Widget", quantity: 2, unitPrice: 3.5 },
      { description: "Cable", quantity: 1, unitPrice: 4 },
    ],
    ...overrides,
  };
}

test("summarizes invoice fields, item count, and quantity-price total", () => {
  assert.deepEqual(buildInvoiceSummary(invoice()), {
    invoiceId: "INV-120",
    customerName: "Acme, Inc.",
    issuedAt: "2026-10-12",
    currency: "USD",
    lineItemCount: 2,
    totalAmount: 11,
  });
});

test("serializes the fixed CSV column order and escapes text fields", () => {
  const summary = buildInvoiceSummary(invoice({ customerName: 'Acme, "North"\nDivision' }));
  assert.equal(
    serializeInvoiceSummary(summary),
    'invoice_id,customer_name,issued_at,currency,line_item_count,total_amount\nINV-120,"Acme, ""North""\nDivision",2026-10-12,USD,2,11\n',
  );
});

test("accepts an invoice with no items and reports a zero total", () => {
  assert.equal(buildInvoiceSummary(invoice({ items: [] })).totalAmount, 0);
  assert.equal(buildInvoiceSummary(invoice({ items: [] })).lineItemCount, 0);
});

test("accepts zero quantity and unit price values", () => {
  const summary = buildInvoiceSummary(invoice({
    items: [{ description: "free item", quantity: 0, unitPrice: 0 }],
  }));
  assert.equal(summary.totalAmount, 0);
  assert.equal(summary.lineItemCount, 1);
});

test("CLI reads an invoice file and writes a CSV file", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "invoice-summary-"));
  const inputPath = path.join(directory, "input.json");
  const outputPath = path.join(directory, "summary.csv");
  try {
    await writeFile(inputPath, JSON.stringify(invoice()));
    const result = spawnSync(process.execPath, [cliPath, inputPath, outputPath], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(
      await readFile(outputPath, "utf8"),
      "invoice_id,customer_name,issued_at,currency,line_item_count,total_amount\nINV-120,\"Acme, Inc.\",2026-10-12,USD,2,11\n",
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("CLI exits non-zero when the output path is a directory", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "invoice-summary-"));
  const inputPath = path.join(directory, "input.json");
  const outputPath = path.join(directory, "summary.csv");
  try {
    await writeFile(inputPath, JSON.stringify(invoice()));
    await mkdir(outputPath);

    const result = spawnSync(process.execPath, [cliPath, inputPath, outputPath], { encoding: "utf8" });
    assert.notEqual(result.status, 0);
    assert.deepEqual(await readdir(outputPath), []);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("CLI rejects malformed JSON without creating or modifying output", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "invoice-summary-"));
  const inputPath = path.join(directory, "input.json");
  const missingOutputPath = path.join(directory, "missing.csv");
  const existingOutputPath = path.join(directory, "existing.csv");
  try {
    await writeFile(inputPath, "{ malformed JSON");
    await writeFile(existingOutputPath, "keep this sentinel\n");

    const missingResult = spawnSync(process.execPath, [cliPath, inputPath, missingOutputPath], { encoding: "utf8" });
    assert.notEqual(missingResult.status, 0);
    await assert.rejects(readFile(missingOutputPath));

    const existingResult = spawnSync(process.execPath, [cliPath, inputPath, existingOutputPath], { encoding: "utf8" });
    assert.notEqual(existingResult.status, 0);
    assert.equal(await readFile(existingOutputPath, "utf8"), "keep this sentinel\n");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

for (const invalidItem of [
  { description: "negative quantity", quantity: -1, unitPrice: 2 },
  { description: "negative price", quantity: 1, unitPrice: -2 },
]) {
  test(`rejects ${invalidItem.description} before writing output`, async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "invoice-summary-"));
    const inputPath = path.join(directory, "input.json");
    const missingOutputPath = path.join(directory, "missing.csv");
    const existingOutputPath = path.join(directory, "existing.csv");
    try {
      await writeFile(inputPath, JSON.stringify(invoice({
        items: [
          { description: "valid first item", quantity: 1, unitPrice: 2 },
          invalidItem,
        ],
      })));
      await writeFile(existingOutputPath, "keep this sentinel\n");

      const missingResult = spawnSync(process.execPath, [cliPath, inputPath, missingOutputPath], { encoding: "utf8" });
      assert.notEqual(missingResult.status, 0);
      await assert.rejects(readFile(missingOutputPath));

      const existingResult = spawnSync(process.execPath, [cliPath, inputPath, existingOutputPath], { encoding: "utf8" });
      assert.notEqual(existingResult.status, 0);
      assert.equal(await readFile(existingOutputPath, "utf8"), "keep this sentinel\n");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}
