export const MC_XLPE_ARMOURED_EXCEL_PUBLIC_PATH = "/Calculator%20For%20CRM.xlsx";

// Sheet name (Excel may truncate): "1 STRAND MC ARMOURED CABLE (WIR..."
export const MC_XLPE_ARMOURED_SHEET_NAME_MATCH = "MC ARMOURED";

// Headers we need to find the sheet and build the table
export const MC_XLPE_ARMOURED_REQUIRED_HEADERS = [
  "NO OF CORES",
  "CROSS-SECTIONAL AREA (SQ MM)",
  "WIRE SIZE (MM)",
  "DENSITY OF ALUMINIUM",
  "DENSITY OF INSULATION",
  "DENSITY OF INNER FILLER",
  "WIRE/STRIP ARMOURED (MM)",
  "DENSITY OF STRIP ARMOURED",
  "DENSITY OF JACKETING",
  "FINAL RATE",
];

// Raw material rate columns (green – from Account / Price Management)
export const MC_XLPE_ARMOURED_RATE_HEADERS = [
  "ALUMINIUM EC GRADE",
  "XLPE",
  "PVC ST1/TYPE A",
  "G.I. WIRE 1.4 MM",
  "PVC ST2",
  "MASTER BATCH (XLPE)",
  "MASTER BATCH (PVC)",
];

// Backend raw material keys → sheet header mapping
export const MC_XLPE_ARMOURED_RATE_BACKEND_MAP = {
  aluminium_ec_grade: "ALUMINIUM EC GRADE",
  xlpe: "XLPE",
  pvc_st1_type_a: "PVC ST1/TYPE A",
  gi_wire_1_4mm: "G.I. WIRE 1.4 MM",
  pvc_st2: "PVC ST2",
  master_batch_xlpe: "MASTER BATCH (XLPE)",
  master_batch_pvc: "MASTER BATCH (PVC)",
};

// Default Wire/Strip Covering % (department head can customize)
export const MC_XLPE_ARMOURED_DEFAULT_WIRE_STRIP_COVERING_PCT = 90;

// Column header for Wire/Strip Covering %
export const MC_XLPE_ARMOURED_WIRE_STRIP_COVERING_HEADER = "WIRE/STRIP COVERING %";
