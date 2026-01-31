import React, { useEffect, useMemo, useState, useRef } from "react";
import { ArrowLeft, Calculator, Clock, RefreshCw } from "lucide-react";
import Toast from "../../utils/Toast";
import rfpService from "../../services/RfpService";
import {
  MC_XLPE_ARMOURED_EXCEL_PUBLIC_PATH,
  MC_XLPE_ARMOURED_RATE_HEADERS,
  MC_XLPE_ARMOURED_RATE_BACKEND_MAP,
  MC_XLPE_ARMOURED_DEFAULT_WIRE_STRIP_COVERING_PCT,
} from "../../constants/mcXlpeArmouredConstants";
import {
  buildMcXlpeArmouredGroups,
  loadMcXlpeArmouredEngineFromArrayBuffer,
  readRowAsObject,
  setRowCellByHeader,
  setWireStripCoveringForRow,
} from "../../utils/mcXlpeArmouredExcelEngine";

function fmtNumber(v, digits = 2) {
  const n = typeof v === "number" ? v : parseFloat(v);
  if (Number.isFinite(n)) return n.toFixed(digits);
  return v ?? "";
}

// Column display config – full Excel order; keys match normalized sheet headers for formulas to work
// type: constant (light orange) | account (green) | formula (light pink) | input (editable)
const COL_CONFIG = [
  { key: "NO OF CORES", label: "No of Cores", type: "constant" },
  { key: "CROSS-SECTIONAL AREA (SQ MM)", label: "Cross-Sectional Area (sq mm)", type: "constant" },
  { key: "WIRE SIZE (MM)", label: "Wire Size (mm)", type: "constant" },
  { key: "ACTUAL AREA (SQ MM)", label: "Actual Area (sq mm)", type: "formula" },
  { key: "DENSITY OF ALUMINIUM", label: "Density of Aluminium", type: "constant" },
  { key: "WEIGHT OF ALUMINIUM (KG/KM)", label: "Weight of Aluminium (kg/km)", type: "formula" },
  { key: "INSULATION THIKNESS (MM)", label: "Insulation Thickness (mm)", type: "formula" },
  { key: "DIA OF CORE", label: "Dia of Core", type: "formula" },
  { key: "INSULATION AREA", label: "Insulation Area", type: "formula" },
  { key: "DENSITY OF INSULATION", label: "Density of Insulation", type: "constant" },
  { key: "WEIGHT OF INSULATION (KG/KM)", label: "Weight of Insulation (kg/km)", type: "formula" },
  { key: "COLOR MASTER BATCH 2%", label: "Color Master Batch 2%", type: "formula" },
  { key: "INNER FILLER THIKNESS (MM)", label: "Inner Filler Thickness (mm)", type: "formula" },
  { key: "LAIDUP DIA", label: "Laidup Dia", type: "formula" },
  { key: "INNER DIA", label: "Inner Dia", type: "formula" },
  { key: "INNER AREA", label: "Inner Area", type: "formula" },
  { key: "DENSITY OF INNER FILLER", label: "Density of Inner Filler", type: "constant" },
  { key: "WEIGHT OF INNER FILLING (KG/KM)", label: "Weight of Inner Filling (kg/km)", type: "formula" },
  { key: "WIR/STRIP", label: "Wire/Strip", type: "constant" },
  { key: "WIRE/STRIP ARMOURED (MM)", label: "Wire/Strip Armoured (mm)", type: "constant" },
  { key: "WIRE/STRIP COVERING %", label: "Wire/Strip Covering %", type: "input" },
  { key: "NO OF WIRE/STRIPS", label: "No of Wire/Strips", type: "formula" },
  { key: "DIA AFTER ARMOURING", label: "Dia After Armouring", type: "formula" },
  { key: "DENSITY OF STRIP ARMOURED", label: "Density of Strip Armoured", type: "constant" },
  { key: "WEIGHT OF WIRE/STRIP ARMOURED (KG/KM)", label: "Weight of Wire/Strip Armoured (kg/km)", type: "formula" },
  { key: "JACKETING THIKNESS (MM)", label: "Jacketing Thickness (mm)", type: "formula" },
  { key: "FINAL OUTER DIA", label: "Final Outer Dia", type: "formula" },
  { key: "AREA OF JACKETING", label: "Area of Jacketing", type: "formula" },
  { key: "DENSITY OF JACKETING", label: "Density of Jacketing", type: "constant" },
  { key: "WEIGHT OF JACKETING (KG/KM)", label: "Weight of Jacketing (kg/km)", type: "formula" },
  { key: "SHINING MASTER BATCH 2%", label: "Shining Master Batch 2%", type: "formula" },
  { key: "ALUMINIUM EC GRADE", label: "Aluminium EC Grade", type: "account" },
  { key: "XLPE", label: "XLPE", type: "account" },
  { key: "PVC ST1/TYPE A", label: "PVC ST1/Type A", type: "account" },
  { key: "G.I. WIRE 1.4 MM", label: "G.I. Wire 1.4 mm", type: "account" },
  { key: "PVC ST2", label: "PVC ST2", type: "account" },
  { key: "MASTER BATCH (XLPE)", label: "Master Batch (XLPE)", type: "account" },
  { key: "MASTER BATCH (PVC)", label: "Master Batch (PVC)", type: "account" },
  { key: "COST OF ALUMINIUM", label: "Cost of Aluminium", type: "formula" },
  { key: "COST OF INSULATION", label: "Cost of Insulation", type: "formula" },
  { key: "COST OF INNER", label: "Cost of Inner", type: "formula" },
  { key: "COST OF ARMOURING", label: "Cost of Armouring", type: "formula" },
  { key: "COST OF JACKETING", label: "Cost of Jacketing", type: "formula" },
  { key: "COAT OF MASTER BATCH (XLPE)", label: "Cost of Master Batch (XLPE)", type: "formula" },
  { key: "COAT OF MASTER BATCH (PVC)", label: "Cost of Master Batch (PVC)", type: "formula" },
  { key: "TOTAL RM COST", label: "Total RM Cost", type: "formula" },
  { key: "TOTAL RM COST PER MTR", label: "Total RM Cost per MTR", type: "formula" },
  { key: "PROCESSING COST", label: "Processing Cost", type: "formula" },
  { key: "FINAL RATE", label: "Final Rate", type: "formula" },
];

export default function McXlpeArmouredCalculator({ setActiveView, onBack, rfpContext: rfpContextProp }) {
  const [loading, setLoading] = useState(true);
  const [engine, setEngine] = useState(null);
  const [groups, setGroups] = useState([]);
  const [rates, setRates] = useState(null);
  const [wireStripCoveringPct, setWireStripCoveringPct] = useState(
    MC_XLPE_ARMOURED_DEFAULT_WIRE_STRIP_COVERING_PCT
  );
  const [perRowCovering, setPerRowCovering] = useState({});
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [rfpContextFromStorage, setRfpContextFromStorage] = useState(null);
  const tableBodyRef = useRef(null);
  const hasAutoSelectedRef = useRef(false);

  const rfpContext = rfpContextProp || rfpContextFromStorage;

  const flatDataRows = useMemo(() => {
    if (!engine || !groups.length) return [];
    return groups.flatMap((g) =>
      g.dataIndices.map((rowIndex) => ({
        rowIndex,
        row: readRowAsObject(engine, rowIndex),
        cores: String(readRowAsObject(engine, rowIndex)["NO OF CORES"] ?? "").trim(),
        area: String(readRowAsObject(engine, rowIndex)["CROSS-SECTIONAL AREA (SQ MM)"] ?? "").trim(),
      }))
    );
  }, [engine, groups]);

  const selectedRowData = selectedRowIndex != null
    ? flatDataRows.find((d) => d.rowIndex === selectedRowIndex)
    : null;
  const selectedFinalRate = selectedRowData
    ? parseFloat(selectedRowData.row["FINAL RATE"])
    : null;
  const selectedSpecLabel =
    selectedRowData
      ? `${selectedRowData.cores} Core ${selectedRowData.area}`
      : "";

  const loadExcel = async () => {
    setLoading(true);
    try {
      const res = await fetch(MC_XLPE_ARMOURED_EXCEL_PUBLIC_PATH);
      if (!res.ok) throw new Error("Failed to load Excel from public folder");
      const buf = await res.arrayBuffer();
      const eng = await loadMcXlpeArmouredEngineFromArrayBuffer(buf);
      const gs = buildMcXlpeArmouredGroups(eng);
      setEngine(eng);
      setGroups(gs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExcel();
  }, []);

  // When opened from RFP, parent may pass rfpContext; if not, read from localStorage so Save & Return shows
  useEffect(() => {
    if (rfpContextProp) return;
    try {
      const raw = window.localStorage.getItem("rfpCalculatorRequest");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.family === "MC_XLPE_ARMOURED") setRfpContextFromStorage(parsed);
    } catch {
      // ignore
    }
  }, [rfpContextProp]);

  // Auto-select row from RFP productSpec (e.g. "2 core 4 sq mm", "3C x 6", "4 Core 16 SQMM") – once per load
  useEffect(() => {
    if (!flatDataRows.length || hasAutoSelectedRef.current) return;
    hasAutoSelectedRef.current = true;
    if (rfpContext?.productSpec) {
      const spec = String(rfpContext.productSpec).toUpperCase().replace(/\s+/g, " ");
      const coresMatch = spec.match(/(\d+)\s*CORE/) || spec.match(/(\d+)C/);
      const areaMatch = spec.match(/(\d+)\s*SQ\s*MM?/i) || spec.match(/(\d+)\s*SQMM/i) || spec.match(/\d+\s*[xX×]\s*(\d+)/);
      const cores = coresMatch ? coresMatch[1] : null;
      const area = areaMatch ? areaMatch[1] : null;
      if (cores && area) {
        const match = flatDataRows.find(
          (d) =>
            String(d.cores) === String(cores) &&
            (String(d.area).replace(/\s/g, "").includes(area) || String(d.area).includes(area + " ") || d.area === area)
        );
        if (match) {
          setSelectedRowIndex(match.rowIndex);
          return;
        }
      }
    }
    setSelectedRowIndex(flatDataRows[0].rowIndex);
  }, [flatDataRows, rfpContext?.productSpec]);

  // Fetch raw material rates from account and push into engine
  useEffect(() => {
    const fetchRatesFromBackend = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4500/api";
        const normalizedAPIBase = API_BASE_URL.endsWith("/api")
          ? API_BASE_URL
          : API_BASE_URL.includes("/api")
            ? API_BASE_URL
            : `${API_BASE_URL}/api`;

        const token = localStorage.getItem("authToken");
        const response = await fetch(`${normalizedAPIBase}/raw-materials/rates`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) return;
        const data = await response.json();
        const ratesData = data?.data || data;

        const mapped = {};
        Object.entries(MC_XLPE_ARMOURED_RATE_BACKEND_MAP).forEach(([backendKey, sheetHeader]) => {
          const val = ratesData?.[backendKey] ?? ratesData?.[backendKey.replace(/_/g, "")] ?? null;
          if (val != null) mapped[sheetHeader] = parseFloat(val) || 0;
        });

        setRates(mapped);
      } catch {
        // ignore
      }
    };

    fetchRatesFromBackend();
  }, []);

  // Inject account rates into all data rows
  useEffect(() => {
    if (!engine || !rates) return;
    groups.forEach((g) => {
      g.dataIndices.forEach((rowIndex) => {
        MC_XLPE_ARMOURED_RATE_HEADERS.forEach((header) => {
          const v = rates[header];
          if (v != null && v !== "") {
            setRowCellByHeader(engine, rowIndex, header, parseFloat(v));
          }
        });
      });
    });
    setEngine({ ...engine });
  }, [rates, engine, groups]);

  // Apply Wire/Strip Covering %: global default + per-row overrides (so default 90 applies after load)
  useEffect(() => {
    if (!engine || !groups.length) return;
    groups.forEach((g) => {
      g.dataIndices.forEach((rowIndex) => {
        const pct = perRowCovering[rowIndex] ?? wireStripCoveringPct;
        setWireStripCoveringForRow(engine, rowIndex, pct);
      });
    });
    setEngine({ ...engine });
  }, [wireStripCoveringPct, perRowCovering, groups.length]);

  useEffect(() => {
    if (selectedRowIndex == null || !tableBodyRef.current) return;
    const rowEl = tableBodyRef.current.querySelector(`[data-row-index="${selectedRowIndex}"]`);
    if (rowEl) rowEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedRowIndex]);

  const handleGlobalWireStripCoveringChange = (value) => {
    const num = value === "" ? null : parseFloat(value);
    setWireStripCoveringPct(
      num != null && Number.isFinite(num) && num >= 0 && num <= 100 ? num : MC_XLPE_ARMOURED_DEFAULT_WIRE_STRIP_COVERING_PCT
    );
  };

  const handleSaveToRfp = async () => {
    if (!rfpContext || selectedRowData == null) {
      Toast.error("Please select a specification (radio) first");
      return;
    }
    const basePerUnit = Number(selectedFinalRate) || 0;
    const lengthKm = parseFloat(rfpContext.length ?? rfpContext.quantity ?? 0) || 0;
    const totalPrice = basePerUnit * lengthKm;
    const productSpec =
      `${selectedRowData.cores} Core ${selectedRowData.area} MC XLPE Armoured`.trim() || rfpContext.productSpec;

    const baseTotal = totalPrice;
    const row = selectedRowData.row || {};
    const fullRowData = {};
    Object.entries(row).forEach(([k, v]) => {
      if (k && v != null && v !== "") {
        fullRowData[k] = typeof v === "number" ? v : (Number.isFinite(parseFloat(v)) ? parseFloat(v) : v);
      }
    });
    const productSpecification = {
      ...fullRowData,
      name: `${selectedRowData.cores} Core ${selectedRowData.area}`,
      cores: selectedRowData.cores,
      size: selectedRowData.area,
      conductorType: selectedRowData.conductor || "Aluminium",
      wireStripCovering: selectedRowData.wireStripCovering,
      quantity: lengthKm,
      quantityUnit: rfpContext.lengthUnit || rfpContext.quantityUnit || "Km",
      basePerUnit,
      baseTotal,
      totalPrice,
      family: "MC_XLPE_ARMOURED"
    };
    const calculatorDetail = {
      family: "MC_XLPE_ARMOURED",
      rfpId: rfpContext.rfpId,
      rfpRequestId: rfpContext.rfpRequestId,
      productSpec: rfpContext.productSpec,
      productSpecification,
      selectedSpec: `${selectedRowData.cores} Core ${selectedRowData.area}`,
      cores: selectedRowData.cores,
      size: selectedRowData.area,
      conductorType: selectedRowData.conductor || "Aluminium",
      wireStripCovering: selectedRowData.wireStripCovering,
      quantity: lengthKm,
      length: lengthKm,
      quantityUnit: rfpContext.lengthUnit || rfpContext.quantityUnit || "Km",
      basePerUnit,
      baseTotal,
      totalPrice,
    };

    try {
      window.localStorage.setItem("rfpCalculatorResult", JSON.stringify({ ...calculatorDetail, productSpec }));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(
      new CustomEvent("rfpCalculatorPriceReady", {
        detail: { family: "MC_XLPE_ARMOURED", rfpId: rfpContext.rfpId, rfpRequestId: rfpContext.rfpRequestId, totalPrice },
      })
    );

    if (rfpContext.rfpRequestId) {
      try {
        await rfpService.setProductCalculatorPrice(rfpContext.rfpRequestId, {
          productSpec: rfpContext.productSpec,
          totalPrice,
          calculatorDetail,
        });
        window.localStorage.setItem("rfpApprovalReopen", JSON.stringify({ rfpRequestId: rfpContext.rfpRequestId, at: Date.now() }));
      } catch (err) {
        Toast.error(err?.message || "Failed to save price to RFP");
        return;
      }
    }
    Toast.success("Pricing saved. Returning to RFP Workflow — Approve will enable when all products are priced.");
    if (setActiveView) setActiveView("rfp-workflow");
  };

  const handleRowWireStripCoveringChange = (rowIndex, value) => {
    const num = value === "" ? null : parseFloat(value);
    setPerRowCovering((prev) => {
      const next = { ...prev };
      if (num != null && Number.isFinite(num) && num >= 0 && num <= 100) {
        next[rowIndex] = num;
      } else {
        delete next[rowIndex];
      }
      return next;
    });
  };

  const getDisplayValue = (row, key) => {
    const val = row[key];
    if (val == null || val === "") return "";
    return fmtNumber(val, 2);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-80" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header – blue-white theme */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (onBack ? onBack() : setActiveView ? setActiveView("calculator") : window.history.back())}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-blue-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Calculator className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Multi Core XLPE Insulated Aluminium Armoured Cable</h1>
          </div>
        </div>
        <button
          onClick={loadExcel}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Excel
        </button>
      </div>

      {/* Table – structure: No of Cores 2, blank line, 3, blank line, 4 */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
          <h2 className="text-sm font-bold text-white">1 Strand MC Armoured Cable (Wire & Strip)</h2>
          <p className="text-blue-100 text-xs mt-0.5">
            Constants (light orange) · Account rates (green) · Formulas (light pink). Data from Raw Material (Account).
          </p>
          {selectedRowData && Number.isFinite(selectedFinalRate) && (
            <p className="text-white text-xs font-semibold mt-1.5 bg-white/20 rounded px-2 py-0.5 inline-block">
              <span className="font-bold">{selectedSpecLabel}</span>: ₹{fmtNumber(selectedFinalRate)}/km
            </p>
          )}
        </div>
        <div className="overflow-x-auto overflow-y-visible" ref={tableBodyRef}>
          <table className="w-full text-xs border-collapse" style={{ minWidth: "max-content" }}>
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-300 sticky top-0 z-10">
                <th className="px-1 py-1 text-left font-bold border-r border-gray-200 bg-gray-100 text-gray-700 text-[10px] whitespace-nowrap w-10">
                  Select
                </th>
                {COL_CONFIG.map((col) => (
                  <th
                    key={col.key}
                    title={col.label}
                    className={`px-1.5 py-1 text-left font-bold border-r border-gray-200 last:border-r-0
                      whitespace-normal leading-tight min-w-[72px] max-w-[100px] text-[10px] sm:text-[11px]
                      ${col.type === "constant" ? "bg-amber-100 text-amber-900" : ""}
                      ${col.type === "account" ? "bg-green-100 text-green-900" : ""}
                      ${col.type === "formula" ? "bg-pink-100 text-pink-900" : ""}
                      ${col.type === "input" ? "bg-blue-50 text-blue-900" : ""}
                      text-gray-700`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groups.flatMap((group, groupIdx) => {
                const rows = [];
                group.dataIndices.forEach((dataIndex, variantIdx) => {
                  const rowIndex = dataIndex;
                  const row = readRowAsObject(engine, dataIndex);
                  const coveringVal = perRowCovering[rowIndex] ?? wireStripCoveringPct;

                  const isSelected = selectedRowIndex === rowIndex;
                  rows.push(
                    <tr
                      key={`${groupIdx}-${rowIndex}`}
                      data-row-index={rowIndex}
                      onClick={() => setSelectedRowIndex(rowIndex)}
                      className={`border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer ${
                        isSelected ? "bg-blue-100" : ""
                      } ${groupIdx > 0 && variantIdx === 0 ? "border-t-2 border-slate-300" : ""}`}
                    >
                      <td
                        className={`px-1 py-0.5 border-r border-gray-200 w-10 ${isSelected ? "bg-blue-100" : "bg-gray-50"}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label className="flex items-center justify-center cursor-pointer">
                          <input
                            type="radio"
                            name="mc_xlpe_row"
                            checked={isSelected}
                            onChange={() => setSelectedRowIndex(rowIndex)}
                            className="text-blue-600"
                          />
                        </label>
                      </td>
                      {COL_CONFIG.map((col) => {
                        const isInput = col.type === "input" && col.key === "WIRE/STRIP COVERING %";
                        const val = isInput ? coveringVal : getDisplayValue(row, col.key);
                        const cellClass = `px-1 py-0.5 border-r border-gray-200 last:border-r-0 whitespace-nowrap min-w-[72px] text-[11px]
                          ${col.type === "constant" ? "bg-amber-50/80 text-gray-800" : ""}
                          ${col.type === "account" ? "bg-green-50/80 text-gray-800 font-medium" : ""}
                          ${col.type === "formula" ? "bg-pink-50/80 text-gray-800" : ""}
                          ${col.type === "input" ? "bg-blue-50/50" : ""}`;

                        return (
                          <td key={col.key} className={cellClass} title={col.label}>
                            {isInput ? (
                              <input
                                type="number"
                                min={0}
                                max={100}
                                step={1}
                                value={coveringVal}
                                onChange={(e) => handleRowWireStripCoveringChange(rowIndex, e.target.value)}
                                className="w-12 px-1 py-0.5 border border-blue-200 rounded text-center text-[11px]"
                              />
                            ) : (
                              val
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                });
                if (groupIdx < groups.length - 1) {
                  rows.push(
                    <tr key={`space-${groupIdx}`} className="bg-slate-100/50">
                      <td colSpan={COL_CONFIG.length + 1} className="h-0.5 border-r-0" />
                    </tr>
                  );
                }
                return rows;
              })}
            </tbody>
          </table>
        </div>
        {/* RFP: Save and Return bar – always visible below table when opened from RFP */}
        {rfpContext && (
          <div className="border-t-2 border-emerald-200 bg-emerald-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-gray-800">
              Selected: <strong>{selectedSpecLabel || "—"}</strong>
              {Number.isFinite(selectedFinalRate) && (
                <> — ₹{fmtNumber(selectedFinalRate)}/km</>
              )}
              {!selectedSpecLabel && (
                <span className="text-amber-700"> Select a row (radio) above.</span>
              )}
            </span>
            <button
              type="button"
              onClick={handleSaveToRfp}
              disabled={selectedRowIndex == null}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Clock className="w-4 h-4" />
              Save and Return to RFP
            </button>
          </div>
        )}
        {/* Legend – column types */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center gap-4 text-xs">
          <span className="font-semibold text-gray-700">Column types:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-amber-100 border border-amber-300" />
            <span>Constants (inputs / fixed values)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-green-100 border border-green-300" />
            <span>From Account (raw material rates)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-pink-100 border border-pink-300" />
            <span>Formulas (Excel-calculated)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-blue-50 border border-blue-200" />
            <span>Editable (Wire/Strip Covering %)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
