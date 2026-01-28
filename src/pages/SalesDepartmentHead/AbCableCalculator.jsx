import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calculator, RefreshCw } from "lucide-react";
import {
  AB_CABLE_EXCEL_PUBLIC_PATH,
  AB_CABLE_RATE_HEADERS,
} from "../../constants/abCableConstants";
import {
  buildAbCableGroups,
  loadAbCableEngineFromArrayBuffer,
  readRowAsObject,
  setRowCellByHeader,
} from "../../utils/abCableExcelEngine";

function fmtNumber(v, digits = 2) {
  const n = typeof v === "number" ? v : parseFloat(v);
  if (Number.isFinite(n)) return n.toFixed(digits);
  return v ?? "";
}

export default function AbCableCalculator({ setActiveView, onBack }) {
  const [loading, setLoading] = useState(true);
  const [engine, setEngine] = useState(null);
  const [groups, setGroups] = useState([]);
  const [rates, setRates] = useState(null);

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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2">
          <h2 className="text-sm font-bold text-white">Aerial Bunched Cable (AB Cable) – ISI + COMM</h2>
          <p className="text-blue-100 text-xs">
            Formulas are computed from the Excel sheet; Accounts rates (if available) override the blue-box columns.
          </p>
        </div>
        <div className="overflow-x-auto">
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
              {dataRows.map(({ rowIndex, row }) => {
                const messengerVal = row["INSULATION THICKNESS (MESSENGER)"] ?? "";

                return (
                  <tr key={rowIndex} className="hover:bg-blue-50 transition-colors">
                    <td className="px-2 py-1 text-gray-700 border-r border-gray-200">{row["SIZE"] ?? ""}</td>
                    <td className="px-2 py-1 text-gray-700 border-r border-gray-200">{row["TYPE"] ?? ""}</td>
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

