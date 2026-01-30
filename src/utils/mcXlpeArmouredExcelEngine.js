import * as XLSX from "xlsx";
import { HyperFormula } from "hyperformula";
import {
  MC_XLPE_ARMOURED_SHEET_NAME_MATCH,
  MC_XLPE_ARMOURED_REQUIRED_HEADERS,
  MC_XLPE_ARMOURED_WIRE_STRIP_COVERING_HEADER,
} from "../constants/mcXlpeArmouredConstants";

function normalizeHeader(v) {
  return String(v ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\n/g, " ")
    .toUpperCase();
}

function findHeaderRow(matrix, requiredHeaders) {
  const required = (requiredHeaders || MC_XLPE_ARMOURED_REQUIRED_HEADERS).map(normalizeHeader);
  let best = { rowIndex: -1, score: 0 };
  for (let r = 0; r < Math.min(matrix.length, 50); r++) {
    const row = matrix[r] || [];
    const set = new Set(row.map(normalizeHeader));
    const score = required.reduce((acc, h) => acc + (set.has(h) ? 1 : 0), 0);
    if (score > best.score) best = { rowIndex: r, score };
    if (score >= Math.min(required.length, 5)) break;
  }
  return best.rowIndex;
}

function sheetToMatrixWithFormulas(ws) {
  const ref = ws["!ref"];
  if (!ref) return { matrix: [[]], range: { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } } };
  const range = XLSX.utils.decode_range(ref);
  const rowCount = range.e.r - range.s.r + 1;
  const colCount = range.e.c - range.s.c + 1;

  const matrix = Array.from({ length: rowCount }, () =>
    Array.from({ length: colCount }, () => null)
  );

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

/**
 * Load MC XLPE Armoured sheet from workbook array buffer.
 * Picks sheet by name containing MC_XLPE_ARMOURED_SHEET_NAME_MATCH, then by required headers.
 */
export async function loadMcXlpeArmouredEngineFromArrayBuffer(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: "array", cellFormula: true });
  const sheetNames = workbook.SheetNames || [];
  if (sheetNames.length === 0) throw new Error("No sheets found in Excel file");

  let picked = null;
  const nameMatch = sheetNames.find((n) =>
    n.toUpperCase().includes(MC_XLPE_ARMOURED_SHEET_NAME_MATCH)
  );
  const toTry = nameMatch ? [nameMatch] : sheetNames;

  for (const name of toTry) {
    const ws = workbook.Sheets[name];
    const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });
    const headerRowIndex = findHeaderRow(matrix, MC_XLPE_ARMOURED_REQUIRED_HEADERS);
    if (headerRowIndex >= 0) {
      const headerRow = matrix[headerRowIndex] || [];
      const noOfCoresIdx = headerRow.findIndex(
        (h) => normalizeHeader(h) === "NO OF CORES"
      );
      const crossSectionIdx = headerRow.findIndex((h) =>
        normalizeHeader(h).includes("CROSS-SECTIONAL")
      );
      if (noOfCoresIdx >= 0 && crossSectionIdx >= 0) {
        picked = { name, ws, matrix, headerRowIndex };
        break;
      }
    }
  }

  if (!picked) {
    throw new Error("MC XLPE Armoured sheet not found in Excel file");
  }

  const { matrix: fullMatrix } = sheetToMatrixWithFormulas(picked.ws);
  const headerRowIndex = findHeaderRow(fullMatrix, MC_XLPE_ARMOURED_REQUIRED_HEADERS);
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

/**
 * Group data rows by "No of Cores" (2, 3, 4...). Blank row between groups.
 * Each group: { cores: "2"|"3"|"4", dataIndices: number[] }
 */
export function buildMcXlpeArmouredGroups(engine) {
  const { hf, headerRowIndex, headerMap, rowCount } = engine;

  const noOfCoresCol = headerMap.get("NO OF CORES");
  const crossSectionCol = headerMap.get("CROSS-SECTIONAL AREA (SQ MM)");
  if (noOfCoresCol === undefined) {
    throw new Error("NO OF CORES header not found");
  }

  const groups = [];
  let current = null;

  for (let r = headerRowIndex + 1; r < rowCount; r++) {
    const coresVal = hf.getCellValue(getCellAddress({ rowIndex: r, colIndex: noOfCoresCol }));
    const coresStr = String(coresVal ?? "").trim();
    const areaVal =
      crossSectionCol !== undefined
        ? hf.getCellValue(getCellAddress({ rowIndex: r, colIndex: crossSectionCol }))
        : null;
    const areaStr = String(areaVal ?? "").trim();

    if (!coresStr && !areaStr) {
      current = null;
      continue;
    }

    const numCores = parseInt(coresStr, 10);
    if (Number.isFinite(numCores) && numCores >= 2) {
      if (!current || current.cores !== coresStr) {
        current = { cores: coresStr, dataIndices: [] };
        groups.push(current);
      }
      current.dataIndices.push(r);
    }
  }

  return groups;
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

/** Set Wire/Strip Covering % for a row (customizable by department head) */
export function setWireStripCoveringForRow(engine, rowIndex, value) {
  return setRowCellByHeader(engine, rowIndex, MC_XLPE_ARMOURED_WIRE_STRIP_COVERING_HEADER, value);
}
