import assert from "node:assert/strict";
import test from "node:test";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const moduleRoot = "src/modules/hoadondientu.gdt.gov.vn";
const { EMPTY_FILTER_FORM, toQueryPayload, toExportPayload } = loadTypeScript(
  `${moduleRoot}/lib/mappers.ts`,
);
const { normalizeInvoiceQueryResult } = loadTypeScript(
  `${moduleRoot}/lib/invoice-response.ts`,
);
const { getStatusLabel, getProcessingLabel, getTextValue, getNumericValue } =
  loadTypeScript(`${moduleRoot}/utils/invoice.ts`);
const { displayDateToISO, normalizeDateDisplayInput } = loadTypeScript(
  "src/global/utils/date.ts",
);
const { getFilenameFromDisposition } = loadTypeScript(
  "src/global/utils/download.ts",
);

function filterForm(overrides = {}) {
  return {
    ...EMPTY_FILTER_FORM,
    from_date: "01/10/2026",
    to_date: "10/10/2026",
    ...overrides,
  };
}

test("query and export share dates and normalized filters", () => {
  const form = filterForm({
    shdon: "0",
    khhdon: " C26MER ",
    nmmst: "0012345678-001",
    ttxly: "8",
    unhiem: "0",
  });
  const payload = toQueryPayload(form);
  assert.equal(payload.from_date, "2026-10-01");
  assert.equal(payload.to_date, "2026-10-10");
  assert.equal(payload.shdon, 0);
  assert.equal(payload.khhdon, "C26MER");
  assert.equal(payload.nmmst, "0012345678-001");
  assert.equal(payload.ttxly, 8);
  assert.equal(payload.unhiem, 0);
  for (const format of ["xlsx", "csv", "xml", "json"]) {
    assert.deepEqual(toExportPayload(form, format), { ...payload, format });
  }
});

test("invalid dates and filters fail before sending a request", () => {
  for (const overrides of [
    { from_date: "" },
    { from_date: "31/02/2026" },
    { to_date: "30/09/2026" },
    { shdon: "1.5" },
    { shdon: "-1" },
    { khmshdon: "-1" },
    { tthai: "0" },
    { ttxly: "9" },
    { unhiem: "2" },
    { nbmst: "not-a-tax-code" },
    { khhdon: "C26MER;ttxly==8" },
  ]) {
    assert.throws(() => toQueryPayload(filterForm(overrides)), Error);
  }
});

test("legacy response defaults and source totals remain compatible", () => {
  const payload = toQueryPayload(filterForm());
  const records = [{ shdon: 1 }, { shdon: 2 }];
  const result = normalizeInvoiceQueryResult(
    { datas: records, source_totals: { standard: 2, sco: NaN } },
    payload,
  );
  assert.equal(result.records, records);
  assert.equal(result.total, 2);
  assert.equal(result.from_date, payload.from_date);
  assert.equal(result.to_date, payload.to_date);
  assert.deepEqual(result.source_totals, { standard: 2, sco: 0 });
  assert.deepEqual(
    normalizeInvoiceQueryResult({ datas: null }, payload).records,
    [],
  );
});

test("status labels preserve unknown, zero and absent values", () => {
  assert.equal(getStatusLabel(1), "Hóa đơn mới");
  assert.equal(getProcessingLabel(0), "Cục Thuế đã nhận");
  assert.match(getProcessingLabel(8), /máy tính tiền/);
  assert.equal(getStatusLabel(99), "99");
  assert.equal(getStatusLabel(null), "-");
  assert.equal(getProcessingLabel(undefined), "-");
  assert.equal(getProcessingLabel("custom"), "custom");
});

test("display helpers retain text identifiers and negative amounts", () => {
  assert.equal(getTextValue({ nbmst: "0012345678" }, "nbmst"), "0012345678");
  assert.equal(getTextValue({ shdon: 0 }, "shdon"), "0");
  assert.equal(getTextValue({}, "shdon"), "-");
  assert.equal(getNumericValue({ tgtttbso: -4450000 }, "tgtttbso"), -4450000);
  assert.equal(getNumericValue({ tgtttbso: Infinity }, "tgtttbso"), null);
});

test("calendar text validates leap years and normalizes input", () => {
  assert.equal(displayDateToISO("29/02/2024"), "2024-02-29");
  assert.equal(displayDateToISO("29/02/2026"), null);
  assert.equal(normalizeDateDisplayInput("11102026"), "11/10/2026");
});

test("download filenames support regular and encoded headers", () => {
  assert.equal(
    getFilenameFromDisposition('attachment; filename="invoice.xlsx"'),
    "invoice.xlsx",
  );
  assert.equal(
    getFilenameFromDisposition(
      "attachment; filename*=UTF-8''ho%C3%A1-%C4%91%C6%A1n.csv",
    ),
    "hoá-đơn.csv",
  );
  assert.equal(getFilenameFromDisposition(null), null);
});
