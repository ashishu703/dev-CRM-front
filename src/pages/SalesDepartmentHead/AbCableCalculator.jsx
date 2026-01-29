import React, { useEffect, useMemo, useState, useRef } from "react";
import { ArrowLeft, Calculator, Clock, RefreshCw } from "lucide-react";
import {
  AB_CABLE_EXCEL_PUBLIC_PATH,
  AB_CABLE_RATE_HEADERS,
  AB_CABLE_TYPE_ISI,
  AB_CABLE_COMM_TYPES,
} from "../../constants/abCableConstants";
import {
  buildAbCableGroups,
  loadAbCableEngineFromArrayBuffer,
  readRowAsObject,
  setRowCellByHeader,
} from "../../utils/abCableExcelEngine";
import Toast from "../../utils/Toast";
import rfpService from "../../services/RfpService";

function fmtNumber(v, digits = 2) {
  const n = typeof v === "number" ? v : parseFloat(v);
  if (Number.isFinite(n)) return n.toFixed(digits);
  return v ?? "";
}

export default function AbCableCalculator({ setActiveView, onBack, rfpContext }) {
  const [loading, setLoading] = useState(true);
  const [engine, setEngine] = useState(null);
  const [groups, setGroups] = useState([]);
  const [rates, setRates] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedType, setSelectedType] = useState(AB_CABLE_TYPE_ISI);
  const [showChargesModal, setShowChargesModal] = useState(false);
  const [chargesRows, setChargesRows] = useState([{ label: "Drum", amount: "" }]);
  const [hasExtraCharges, setHasExtraCharges] = useState(true);
  const tableBodyRef = useRef(null);
  const sizeMismatchWarnedRef = useRef(false);

  const dataRows = useMemo(() => {
    if (!engine) return [];
    const { headerRowIndex, rowCount } = engine;
    const rows = [];
    for (let r = headerRowIndex + 1; r < rowCount; r++) {
      const row = readRowAsObject(engine, r);
      const size = row["SIZE"];
      const type = row["TYPE"];
      if ((size && String(size).trim() !== "") || (type && String(type).trim() !== "")) {
        rows.push({ rowIndex: r, row });
      }
    }
    return rows;
  }, [engine]);

  // One radio per SIZE (select size), one radio per TYPE within that size (select type)
  const selectedRowIndex = useMemo(() => {
    if (!selectedSize || !selectedType) return null;
    const typeUpper = selectedType.toUpperCase();
    const idx = dataRows.findIndex(({ row }, i) => {
      const t = String(row["TYPE"] || "").trim().toUpperCase();
      const s = String(row["SIZE"] || "").trim();
      const groupSize = t === "ISI" ? s : (() => {
        for (let j = i - 1; j >= 0; j--) {
          if (String(dataRows[j].row["TYPE"] || "").trim().toUpperCase() === "ISI") return String(dataRows[j].row["SIZE"] || "").trim();
        }
        return s;
      })();
      return groupSize === selectedSize && t === typeUpper;
    });
    return idx >= 0 ? idx : null;
  }, [dataRows, selectedSize, selectedType]);

  const selectedRowData = selectedRowIndex != null ? dataRows[selectedRowIndex] : null;
  const selectedFinalRate = selectedRowData ? parseFloat(selectedRowData.row["FINAL RATE"]) : null;

  const uniqueSizes = useMemo(() => {
    const sizes = new Set();
    dataRows.forEach(({ row }) => {
      const type = String(row["TYPE"] || "").trim().toUpperCase();
      const size = String(row["SIZE"] || "").trim();
      if (type === "ISI" && size && !size.toUpperCase().startsWith("COMM")) sizes.add(size);
    });
    return Array.from(sizes).sort((a, b) => {
      const na = parseFloat(a);
      const nb = parseFloat(b);
      if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
      return String(a).localeCompare(String(b));
    });
  }, [dataRows]);

  // Group rows by size: each group = one SIZE (e.g. 3CX16+16 SQ MM) covering its 4 variants (ISI, COMM-1, COMM-2, COMM-3)
  const sizeGroups = useMemo(() => {
    const groups = [];
    let current = null;
    dataRows.forEach(({ row }, dataIndex) => {
      const type = String(row["TYPE"] || "").trim().toUpperCase();
      const size = String(row["SIZE"] || "").trim();
      if (type === "ISI" && size && !size.toUpperCase().startsWith("COMM")) {
        current = { size, dataIndices: [dataIndex] };
        groups.push(current);
      } else if (current) {
        current.dataIndices.push(dataIndex);
      }
    });
    return groups;
  }, [dataRows]);

  // Normalize size string for matching (RFP may send "3C x 16+16 SQ MM", Excel has "3CX16+16 SQ MM")
  const normalizeForMatch = (str) =>
    String(str || "")
      .toUpperCase()
      .replace(/\s+/g, " ")
      .replace(/\s*X\s*/gi, "X")
      .replace(/\s/g, "");

  // Extract size token from RFP spec (e.g. "AB CABLE 3CX16 SQMM" -> "3CX16", "3CX70 SQMM" -> "3CX70")
  const extractSizeTokenFromSpec = (productSpec) => {
    const norm = normalizeForMatch(productSpec || "");
    const m = norm.match(/\d+CX\d+/);
    return m ? m[0] : null;
  };

  // Auto-select size + variant from RFP productSpec so DH lands on the right size without searching
  useEffect(() => {
    if (!dataRows.length || !uniqueSizes.length) return;
    if (rfpContext?.productSpec) {
      const spec = String(rfpContext.productSpec || "").toUpperCase().replace(/\s+/g, " ");
      const specNorm = normalizeForMatch(rfpContext.productSpec);
      const sizeToken = extractSizeTokenFromSpec(rfpContext.productSpec);
      // 1) Match by extracted size token (e.g. "3CX16" from "AB CABLE 3CX16 SQMM" -> Excel "3CX16+16 SQ MM")
      let matchSize =
        (sizeToken && uniqueSizes.find((s) => normalizeForMatch(s).includes(sizeToken))) ||
        uniqueSizes.find((s) => normalizeForMatch(s) === specNorm) ||
        uniqueSizes.find(
          (s) =>
            spec.includes(s) ||
            spec.includes(s.replace(/\s/g, "")) ||
            specNorm.includes(normalizeForMatch(s)) ||
            normalizeForMatch(s).includes(specNorm)
        );
      let matchType = AB_CABLE_TYPE_ISI;
      if (spec.includes("COMM-3")) matchType = "COMM-3";
      else if (spec.includes("COMM-2")) matchType = "COMM-2";
      else if (spec.includes("COMM-1") || spec.includes("COMM 1")) matchType = "COMM-1";
      else if (spec.includes("ISI")) matchType = AB_CABLE_TYPE_ISI;
      if (matchSize) {
        const typeExists = dataRows.some(({ row }, i) => {
          const t = String(row["TYPE"] || "").trim().toUpperCase();
          const s = String(row["SIZE"] || "").trim();
          const g = t === "ISI" ? s : (() => {
            for (let j = i - 1; j >= 0; j--) {
              if (String(dataRows[j].row["TYPE"] || "").trim().toUpperCase() === "ISI") return String(dataRows[j].row["SIZE"] || "").trim();
            }
            return s;
          })();
          return g === matchSize && t === matchType.toUpperCase();
        });
        setSelectedSize(matchSize);
        setSelectedType(typeExists ? matchType : AB_CABLE_TYPE_ISI);
        return;
      }
    }
    if (!selectedSize) {
      setSelectedSize(uniqueSizes[0]);
      setSelectedType(AB_CABLE_TYPE_ISI);
    }
  }, [dataRows.length, uniqueSizes, rfpContext?.productSpec]);

  // Warn once if user selected a different size than RFP product (e.g. RFP 3CX16 but selected 3CX25)
  useEffect(() => {
    if (!rfpContext?.productSpec || selectedRowIndex == null || !selectedRowData || sizeMismatchWarnedRef.current) return;
    const expectedToken = extractSizeTokenFromSpec(rfpContext.productSpec);
    const selectedSizeStr = String(selectedRowData.row["SIZE"] || "").trim();
    const selectedToken = extractSizeTokenFromSpec(selectedSizeStr);
    if (expectedToken && selectedToken && expectedToken !== selectedToken) {
      sizeMismatchWarnedRef.current = true;
      Toast.warning(
        `RFP product is ${expectedToken} but you selected ${selectedToken}. Make sure this is intended before saving.`
      );
    }
  }, [rfpContext?.productSpec, selectedRowIndex, selectedRowData]);

  // Scroll selected row into view (when from RFP, delay slightly so table has painted)
  useEffect(() => {
    if (selectedRowIndex == null || !tableBodyRef.current) return;
    const scrollToRow = () => {
      const rowEl = tableBodyRef.current?.querySelector(`[data-row-index="${selectedRowIndex}"]`);
      if (rowEl) rowEl.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    if (rfpContext?.productSpec) {
      const t = setTimeout(scrollToRow, 300);
      return () => clearTimeout(t);
    }
    scrollToRow();
  }, [selectedRowIndex, rfpContext?.productSpec]);

  const loadExcel = async () => {
    setLoading(true);
    try {
      const res = await fetch(AB_CABLE_EXCEL_PUBLIC_PATH);
      if (!res.ok) throw new Error("Failed to load Excel from public folder");
      const buf = await res.arrayBuffer();
      const eng = await loadAbCableEngineFromArrayBuffer(buf);
      const gs = buildAbCableGroups(eng);
      setEngine(eng);
      setGroups(gs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExcel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch account-driven rates (blue box inputs) and push into the sheet engine where possible.
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

        const mapped = {
          // Try best-effort mapping to sheet headers.
          "ALUMINIUM ALLOY GRADE": ratesData?.aluminium_alloy_grade_t4 ?? ratesData?.aluminium_alloy_grade ?? null,
          "ALUMINIUM ECR GRADE": ratesData?.aluminium_ec_grade ?? ratesData?.aluminium_ecr_grade ?? null,
          XLPE: ratesData?.xlpe ?? ratesData?.xlpe_rate ?? null,
          LD: ratesData?.ld ?? ratesData?.ld_rate ?? null,
        };

        setRates(mapped);
      } catch {
        // ignore
      }
    };

    fetchRatesFromBackend();
  }, []);

  useEffect(() => {
    if (!engine || !rates) return;
    // Push rates into all data rows (where those columns exist).
    for (const g of groups) {
      for (const rowIndex of Object.values(g.rows)) {
        for (const header of AB_CABLE_RATE_HEADERS) {
          const v = rates[header];
          if (v !== null && v !== undefined && v !== "") {
            setRowCellByHeader(engine, rowIndex, header, parseFloat(v));
          }
        }
      }
    }
    // Trigger rerender by setting same engine (hf updates internally).
    setEngine({ ...engine });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates, engine, groups]);

  const handleMessengerThicknessChange = (rowIndex, value) => {
    if (!engine) return;
    const num = value === "" ? null : parseFloat(value);
    setRowCellByHeader(engine, rowIndex, "INSULATION THICKNESS (MESSENGER)", Number.isFinite(num) ? num : null);
    setEngine({ ...engine });
  };

  const updateChargeRow = (index, key, value) => {
    setChargesRows((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };
  const addChargeRow = () => setChargesRows((rows) => [...rows, { label: "", amount: "" }]);
  const removeChargeRow = (index) => setChargesRows((rows) => rows.filter((_, i) => i !== index));

  const handleConfirmSelection = () => {
    if (selectedRowIndex == null || !rfpContext) {
      Toast.error("Please select a product (Size + Type) first");
      return;
    }
    setShowChargesModal(true);
  };

  const handleSaveCharges = async () => {
    if (!rfpContext || selectedRowData == null) {
      setShowChargesModal(false);
      return;
    }
    const basePerUnit = Number(selectedFinalRate) || 0;
    const lengthValue = parseFloat(rfpContext.length || rfpContext.quantity || 0) || 0;
    const baseTotal = basePerUnit * lengthValue;
    const extraRows = hasExtraCharges ? chargesRows : [];
    const extraCharges = extraRows.map((row) => Number.parseFloat(row.amount) || 0).filter(Number.isFinite);
    const extraTotal = extraCharges.reduce((sum, v) => sum + v, 0);
    const totalPrice = baseTotal + extraTotal;
    const productSpec = `${selectedRowData.row["SIZE"] || ""} ${selectedRowData.row["TYPE"] || ""}`.trim() || rfpContext.productSpec;
    const rateType = String(selectedRowData.row["TYPE"] || "").trim() || AB_CABLE_TYPE_ISI;

    try {
      window.localStorage.setItem(
        "rfpCalculatorResult",
        JSON.stringify({
          family: "AB_CABLE",
          rfpId: rfpContext.rfpId,
          rfpRequestId: rfpContext.rfpRequestId,
          productSpec: productSpec || rfpContext.productSpec,
          length: lengthValue,
          rateType,
          basePerUnit,
          baseTotal,
          extraCharges: extraRows,
          totalPrice,
        })
      );
    } catch {
      /* ignore */
    }
    window.dispatchEvent(
      new CustomEvent("rfpCalculatorPriceReady", {
        detail: { family: "AB_CABLE", rfpId: rfpContext.rfpId, rfpRequestId: rfpContext.rfpRequestId, totalPrice },
      })
    );
    // Backend matches by RFP's product_spec; use rfpContext.productSpec so the correct row is updated
    const specForApi = rfpContext.productSpec || productSpec;
    if (rfpContext.rfpRequestId && specForApi != null) {
      try {
        const calculatorDetail = {
          family: "AB_CABLE",
          productSpec: specForApi,
          length: lengthValue,
          rateType,
          basePerUnit,
          baseTotal,
          extraCharges: extraRows,
          totalPrice,
        };
        await rfpService.setProductCalculatorPrice(rfpContext.rfpRequestId, {
          productSpec: specForApi,
          totalPrice,
          calculatorDetail,
        });
        try {
          window.localStorage.setItem("rfpApprovalReopen", JSON.stringify({ rfpRequestId: rfpContext.rfpRequestId, at: Date.now() }));
        } catch { /* ignore */ }
      } catch (err) {
        Toast.error(err?.message || "Failed to save price to RFP");
      }
    }
    Toast.success("Pricing saved. Returning to RFP Workflow — Approve will enable when all products are priced.");
    setShowChargesModal(false);
    if (setActiveView) setActiveView("rfp-workflow");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-80"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (onBack ? onBack() : setActiveView ? setActiveView("calculator") : window.history.back())}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Calculator className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AB Cable Calculator</h1>
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

      {/* Single table card – selection row built into table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2">
          <h2 className="text-sm font-bold text-white">Aerial Bunched Cable (AB Cable) – ISI + COMM</h2>
          <p className="text-blue-100 text-xs mt-0.5">
            Size → Variant (ISI / COMM-1 / COMM-2 / COMM-3). Price for selected row below.
          </p>
          {selectedRowData && Number.isFinite(selectedFinalRate) && (
            <p className="text-white text-xs font-semibold mt-1.5 bg-white/20 rounded px-2 py-0.5 inline-block">
              <span className="font-bold">{selectedSize}</span> · <span className="font-bold">{selectedType}</span>: ₹{fmtNumber(selectedFinalRate)}/km
            </p>
          )}
        </div>
        <div className="overflow-x-auto" ref={tableBodyRef}>
          <table className="w-full min-w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">SIZE</th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">TYPE</th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">PHASE SIZE</th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">STL SIZE</th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">MESSENGER SIZE</th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">
                  INS THK (PHASE)
                </th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">INS THK (STL)</th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">
                  INS THK (MESSENGER)
                </th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">OD (PHASE)</th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">
                  WT AL (PER KM)
                </th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">
                  WT ALLOY (PER KM)
                </th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">
                  WT INS (PER KM)
                </th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">
                  TOTAL WT (PER KM)
                </th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">AL ALLOY GRADE</th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">AL ECR GRADE</th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">XLPE</th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">LD</th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">COST</th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-200">PROFIT</th>
                <th className="px-2 py-2 text-left font-bold text-gray-700">FINAL RATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sizeGroups.flatMap((group, groupIdx) =>
                group.dataIndices.map((dataIndex, variantIdx) => {
                  const { rowIndex, row } = dataRows[dataIndex];
                  const messengerVal = row["INSULATION THICKNESS (MESSENGER)"] ?? "";
                  const sizeVal = String(row["SIZE"] || "").trim();
                  const typeVal = String(row["TYPE"] || "").trim().toUpperCase();
                  const isSizeRow = typeVal === "ISI";
                  const isSelected = selectedRowIndex === dataIndex;
                  const sizeChecked = selectedSize === group.size;
                  const typeChecked = selectedSize === group.size && selectedType.toUpperCase() === typeVal;
                  const isFirstInGroup = variantIdx === 0;

                  return (
                    <tr
                      key={`${groupIdx}-${dataIndex}`}
                      data-row-index={dataIndex}
                      onClick={() => {
                        setSelectedSize(group.size);
                        setSelectedType(row["TYPE"] || AB_CABLE_TYPE_ISI);
                      }}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? "bg-blue-100" : "hover:bg-blue-50/70"
                      } ${variantIdx > 0 ? "border-t border-gray-100" : ""} ${groupIdx > 0 && variantIdx === 0 ? "border-t-2 border-slate-300" : ""}`}
                    >
                      {isFirstInGroup ? (
                        <td
                          rowSpan={group.dataIndices.length}
                          className={`px-2 py-1 text-gray-700 border-r border-gray-200 align-middle ${isSelected ? "bg-blue-100" : "bg-slate-50"}`}
                        >
                          <label className="flex items-center gap-1.5 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="radio"
                              name="ab-size"
                              checked={sizeChecked}
                              onChange={() => {
                                setSelectedSize(group.size);
                                setSelectedType(AB_CABLE_TYPE_ISI);
                              }}
                              className="text-blue-600"
                            />
                            <span className="font-semibold text-gray-900">{group.size}</span>
                          </label>
                        </td>
                      ) : null}
                      <td className="px-2 py-1 text-gray-700 border-r border-gray-200">
                        <label className="flex items-center gap-1.5 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="radio"
                            name={`ab-type-${group.size}`}
                            checked={typeChecked}
                            onChange={() => {
                              setSelectedSize(group.size);
                              setSelectedType(row["TYPE"] || "");
                            }}
                            className="text-blue-600"
                          />
                          <span>{row["TYPE"] ?? ""}</span>
                        </label>
                      </td>
                    <td className="px-2 py-1 text-gray-700 border-r border-gray-200 text-center">
                      {fmtNumber(row["PHASE SIZE"], 2)}
                    </td>
                    <td className="px-2 py-1 text-gray-700 border-r border-gray-200 text-center">
                      {fmtNumber(row["STL SIZE"], 2)}
                    </td>
                    <td className="px-2 py-1 text-gray-700 border-r border-gray-200 text-center">
                      {fmtNumber(row["MESSENGER SIZE"], 2)}
                    </td>
                    <td className="px-2 py-1 text-gray-700 border-r border-gray-200 text-center">
                      {fmtNumber(row["INSULATION THICKNESS (PHASE)"], 2)}
                    </td>
                    <td className="px-2 py-1 text-gray-700 border-r border-gray-200 text-center">
                      {fmtNumber(row["INSULATION THICKNESS (STL)"], 2)}
                    </td>
                    <td className="px-2 py-1 border-r border-gray-200">
                      <input
                        type="number"
                        step="0.01"
                        value={messengerVal ?? ""}
                        onChange={(e) => handleMessengerThicknessChange(rowIndex, e.target.value)}
                        className="w-16 px-1.5 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                      />
                    </td>
                    <td className="px-2 py-1 text-gray-700 border-r border-gray-200 text-center">
                      {fmtNumber(row["OD (PHASE)"], 2)}
                    </td>
                    <td className="px-2 py-1 text-gray-700 border-r border-gray-200 text-right">
                      {fmtNumber(row["WEIGHT ALUMINIUM (PER KM)"], 2)}
                    </td>
                    <td className="px-2 py-1 text-gray-700 border-r border-gray-200 text-right">
                      {fmtNumber(row["WEIGHT ALLOY (PER KM)"], 2)}
                    </td>
                    <td className="px-2 py-1 text-gray-700 border-r border-gray-200 text-right">
                      {fmtNumber(row["WEIGHT INSULATION (PER KM)"], 2)}
                    </td>
                    <td className="px-2 py-1 text-gray-700 border-r border-gray-200 text-right">
                      {fmtNumber(row["TOTAL WEIGHT (PER KM)"], 2)}
                    </td>
                    <td className="px-2 py-1 font-semibold text-blue-600 border-r border-gray-200 text-right">
                      {fmtNumber(row["ALUMINIUM ALLOY GRADE"], 2)}
                    </td>
                    <td className="px-2 py-1 font-semibold text-blue-600 border-r border-gray-200 text-right">
                      {fmtNumber(row["ALUMINIUM ECR GRADE"], 2)}
                    </td>
                    <td className="px-2 py-1 font-semibold text-blue-600 border-r border-gray-200 text-right">
                      {fmtNumber(row["XLPE"], 2)}
                    </td>
                    <td className="px-2 py-1 font-semibold text-blue-600 border-r border-gray-200 text-right">
                      {fmtNumber(row["LD"], 2)}
                    </td>
                    <td className="px-2 py-1 text-gray-700 border-r border-gray-200 text-right">
                      {fmtNumber(row["COST"], 2)}
                    </td>
                    <td className="px-2 py-1 text-gray-700 border-r border-gray-200 text-right">
                      {fmtNumber(row["PROFIT"], 2)}
                    </td>
                    <td className="px-2 py-1 text-gray-700 text-right">{fmtNumber(row["FINAL RATE"], 2)}</td>
                  </tr>
                  );
                })
              )}
              {rfpContext && (
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td colSpan={20} className="px-2 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        Selected: <strong>{selectedSize}</strong> · <strong>{selectedType}</strong> — Price ₹{selectedFinalRate != null ? fmtNumber(selectedFinalRate) : "—"}/km. Click to save this variant&apos;s pricing to RFP.
                      </span>
                      <button
                        type="button"
                        onClick={handleConfirmSelection}
                        disabled={selectedRowIndex == null}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Clock className="w-3 h-3" />
                        Calculate Price & Save to RFP
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Extra Charges Modal (when from RFP) */}
      {showChargesModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[120]">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-semibold">Additional Charges</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">Any other charges (drum, transportation, others)?</span>
                <div className="flex items-center gap-2 text-sm">
                  <label className="flex items-center gap-1">
                    <input type="radio" checked={hasExtraCharges === false} onChange={() => setHasExtraCharges(false)} />
                    No
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" checked={hasExtraCharges === true} onChange={() => setHasExtraCharges(true)} />
                    Yes
                  </label>
                </div>
              </div>
              {hasExtraCharges && (
                <div className="space-y-3 max-h-64 overflow-y-auto border-t border-gray-200 pt-3">
                  {chargesRows.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        placeholder="Charge label"
                        value={row.label}
                        onChange={(e) => updateChargeRow(idx, "label", e.target.value)}
                      />
                      <input
                        type="number"
                        className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        placeholder="Amount"
                        value={row.amount}
                        onChange={(e) => updateChargeRow(idx, "amount", e.target.value)}
                      />
                      {chargesRows.length > 1 && (
                        <button type="button" onClick={() => removeChargeRow(idx)} className="px-2 py-1 text-xs text-rose-600 hover:text-rose-700">
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addChargeRow} className="text-xs text-blue-600 hover:text-blue-700">
                    + Add another charge
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowChargesModal(false)} className="px-4 py-2 text-sm border rounded-lg">
                Cancel
              </button>
              <button type="button" onClick={handleSaveCharges} className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg">
                Save & Return to RFP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

