import * as XLSX from "xlsx";
import { HyperFormula } from "hyperformula";
import { AB_CABLE_REQUIRED_HEADERS } from "../constants/abCableConstants";

function normalizeHeader(v) {
  return String(v ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function findHeaderRow(matrix) {
  // Find a row that contains most required headers.
  const required = AB_CABLE_REQUIRED_HEADERS.map(normalizeHeader);
  let best = { rowIndex: -1, score: 0 };
  for (let r = 0; r < Math.min(matrix.length, 50); r++) {
    const row = matrix[r] || [];
    const set = new Set(row.map(normalizeHeader));
    const score = required.reduce((acc, h) => acc + (set.has(h) ? 1 : 0), 0);
    if (score > best.score) best = { rowIndex: r, score };
    if (score === required.length) break;
  }
  return best.rowIndex;
}

function sheetToMatrixWithFormulas(ws) {
  const ref = ws["!ref"];
  if (!ref) return { matrix: [[]], range: { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } } };
  const range = XLSX.utils.decode_range(ref);
  const rowCount = range.e.r - range.s.r + 1;
  const colCount = range.e.c - range.s.c + 1;

  const matrix = Array.from({ length: rowCount }, () => Array.from({ length: colCount }, () => null));

  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      if (!cell) continue;
      const rr = r - range.s.r;
      const cc = c - range.s.c;
      if (cell.f) {
        matrix[rr][cc] = `=${cell.f}`;
      } else if (cell.v !== undefined) {
        matrix[rr][cc] = cell.v;
      }
    }
  }

  return { matrix, range };
}

function buildHeaderMap(headerRow) {
  const map = new Map();
  headerRow.forEach((h, idx) => {
    const key = normalizeHeader(h);
    if (key) map.set(key, idx);
  });
  return map;
}

function getCellAddress({ rowIndex, colIndex }) {
  return { sheet: 0, row: rowIndex, col: colIndex };
}

export async function loadAbCableEngineFromArrayBuffer(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheetNames = workbook.SheetNames || [];
  if (sheetNames.length === 0) throw new Error("No sheets found in Excel file");

  // Pick the sheet which contains the AB cable header row.
  let picked = null;
  for (const name of sheetNames) {
    const ws = workbook.Sheets[name];
    const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });
    const headerRowIndex = findHeaderRow(matrix);
    if (headerRowIndex >= 0) {
      picked = { name, ws, matrix, headerRowIndex };
      break;
    }
  }
  if (!picked) {
    throw new Error("AB Cable sheet headers not found in the Excel file");
  }

  const { matrix: fullMatrix } = sheetToMatrixWithFormulas(picked.ws);
  const headerRowIndex = findHeaderRow(fullMatrix);
  if (headerRowIndex < 0) throw new Error("Header row not found");

  const headerRow = fullMatrix[headerRowIndex] || [];
  const headerMap = buildHeaderMap(headerRow);

  const hf = HyperFormula.buildFromSheets(
    { Sheet1: fullMatrix },
    {
      licenseKey: "gpl-v3",
      useColumnIndex: false,
      useRowIndex: false,
    }
  );

  return {
    sheetName: picked.name,
    hf,
    headerRowIndex,
    headerMap,
    rowCount: fullMatrix.length,
    colCount: headerRow.length,
  };
}

export function buildAbCableGroups(engine) {
  const { hf, headerRowIndex, headerMap, rowCount } = engine;

  const sizeCol = headerMap.get("SIZE");
  const typeCol = headerMap.get("TYPE");
  if (sizeCol === undefined || typeCol === undefined) {
    throw new Error("Required headers SIZE/TYPE not found");
  }

  const groups = [];
  let current = null;

  for (let r = headerRowIndex + 1; r < rowCount; r++) {
    const sizeVal = hf.getCellValue(getCellAddress({ rowIndex: r, colIndex: sizeCol }));
    const typeVal = hf.getCellValue(getCellAddress({ rowIndex: r, colIndex: typeCol }));

    const size = String(sizeVal ?? "").trim();
    const type = String(typeVal ?? "").trim();

    if (!size && !type) continue;

    if (type.toUpperCase() === "ISI") {
      current = { label: size, rows: { ISI: r } };
      groups.push(current);
      continue;
    }

    if (!current) continue;

    const maybeComm = size.toUpperCase().replace(/\s+/g, "");
    if (maybeComm.startsWith("COMM-") || maybeComm.startsWith("COMM")) {
      const normalized = size.toUpperCase().replace(/\s+/g, "");
      // Normalize to COMM-1 / COMM-2 / COMM-3 when possible.
      const match = normalized.match(/COMM-?(\d)/);
      const key = match ? `COMM-${match[1]}` : size.toUpperCase();
      current.rows[key] = r;
    }
  }

  return groups.filter((g) => g?.rows?.ISI);
}

export function readRowAsObject(engine, rowIndex) {
  const { hf, headerMap } = engine;
  const out = {};
  for (const [header, colIndex] of headerMap.entries()) {
    out[header] = hf.getCellValue(getCellAddress({ rowIndex, colIndex }));
  }
  return out;
}

export function setRowCellByHeader(engine, rowIndex, headerName, value) {
  const { hf, headerMap } = engine;
  const colIndex = headerMap.get(normalizeHeader(headerName));
  if (colIndex === undefined) return false;
  hf.setCellContents(getCellAddress({ rowIndex, colIndex }), value);
  return true;
}

