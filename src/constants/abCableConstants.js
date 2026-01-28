export const AB_CABLE_EXCEL_PUBLIC_PATH = "/Calculator%20For%20CRM.xlsx";

// We detect the relevant sheet by looking for these headers.
export const AB_CABLE_REQUIRED_HEADERS = [
  "SIZE",
  "TYPE",
  "PHASE SIZE",
  "STL SIZE",
  "MESSENGER SIZE",
  "INSULATION THICKNESS (PHASE)",
  "INSULATION THICKNESS (STL)",
  "INSULATION THICKNESS (MESSENGER)",
  "COST",
  "PROFIT",
  "FINAL RATE",
];

// Accounts-driven (blue box) inputs we try to override if present in the sheet.
export const AB_CABLE_RATE_HEADERS = [
  "ALUMINIUM ALLOY GRADE",
  "ALUMINIUM ECR GRADE",
  "XLPE",
  "LD",
];

export const AB_CABLE_TYPE_ISI = "ISI";
export const AB_CABLE_COMM_TYPES = ["COMM-1", "COMM-2", "COMM-3"];

