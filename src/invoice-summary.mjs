import { readFile, writeFile } from "node:fs/promises";

const HEADERS = [
  "invoice_id",
  "customer_name",
  "issued_at",
  "currency",
  "line_item_count",
  "total_amount",
];

export function buildInvoiceSummary(invoice) {
  if (!invoice || typeof invoice !== "object" || Array.isArray(invoice)) {
    throw new TypeError("invoice must be a JSON object");
  }

  for (const field of ["invoiceId", "customerName", "issuedAt", "currency"]) {
    if (typeof invoice[field] !== "string") {
      throw new TypeError(`${field} must be a string`);
    }
  }
  if (!Array.isArray(invoice.items)) {
    throw new TypeError("items must be an array");
  }

  let totalAmount = 0;
  for (const [index, item] of invoice.items.entries()) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new TypeError(`items[${index}] must be an object`);
    }
    if (typeof item.description !== "string") {
      throw new TypeError(`items[${index}].description must be a string`);
    }
    for (const field of ["quantity", "unitPrice"]) {
      if (typeof item[field] !== "number" || !Number.isFinite(item[field])) {
        throw new TypeError(`items[${index}].${field} must be a finite number`);
      }
      if (item[field] < 0) {
        throw new RangeError(`items[${index}].${field} must not be negative`);
      }
    }
    totalAmount += item.quantity * item.unitPrice;
    if (!Number.isFinite(totalAmount)) {
      throw new RangeError("total_amount must be finite");
    }
  }

  return {
    invoiceId: invoice.invoiceId,
    customerName: invoice.customerName,
    issuedAt: invoice.issuedAt,
    currency: invoice.currency,
    lineItemCount: invoice.items.length,
    totalAmount,
  };
}

function escapeCsv(value) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function serializeInvoiceSummary(summary) {
  const row = [
    summary.invoiceId,
    summary.customerName,
    summary.issuedAt,
    summary.currency,
    summary.lineItemCount,
    summary.totalAmount,
  ];
  return `${HEADERS.join(",")}\n${row.map(escapeCsv).join(",")}\n`;
}

export async function runInvoiceSummary(inputPath, outputPath) {
  const input = await readFile(inputPath, "utf8");
  const invoice = JSON.parse(input);
  const summary = buildInvoiceSummary(invoice);
  const csv = serializeInvoiceSummary(summary);
  await writeFile(outputPath, csv, "utf8");
}

async function main(args) {
  if (args.length !== 2) {
    throw new Error("usage: node src/invoice-summary.mjs <input.json> <output.csv>");
  }
  await runInvoiceSummary(args[0], args[1]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`invoice-summary: ${error.message}\n`);
    process.exitCode = 1;
  });
}
