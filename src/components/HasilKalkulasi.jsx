import React from "react";
import { formatRupiah } from "../utils/kreditUtils";

/**
 * HasilKalkulasi — menampilkan kartu ringkasan hasil perhitungan.
 *
 * Props:
 * @param {Object} result - Objek hasil kalkulasi dari App.jsx:
 *   - otr, dp, pokok, jangka, rateLabel, angsuran, pokokTotalBunga
 * @param {string} dpPct  - Persentase DP sebagai string (untuk label)
 */
function HasilKalkulasi({ result, dpPct }) {
  return (
    <div className="card result-card">
      <h2 className="section-title">Ringkasan Perhitungan</h2>

      {/* Grid metric cards — 3 kolom */}
      <div className="metrics-grid">

        {/* Harga OTR */}
        <div className="metric">
          <p className="metric-label">Harga OTR</p>
          <p className="metric-value">{formatRupiah(result.otr)}</p>
        </div>

        {/* Down Payment */}
        <div className="metric">
          <p className="metric-label">Down Payment ({dpPct}%)</p>
          <p className="metric-value">{formatRupiah(result.dp)}</p>
        </div>

        {/* Pokok Utang */}
        <div className="metric">
          <p className="metric-label">Pokok Utang</p>
          <p className="metric-value">{formatRupiah(result.pokok)}</p>
          <p className="metric-sub">OTR − DP</p>
        </div>

        {/* Bunga yang berlaku */}
        <div className="metric">
          <p className="metric-label">Bunga / Tahun</p>
          <p className="metric-value">{result.rateLabel}</p>
          <p className="metric-sub">Jangka {result.jangka} bulan</p>
        </div>

        {/* Total bunga keseluruhan */}
        <div className="metric">
          <p className="metric-label">Total Bunga</p>
          <p className="metric-value">{formatRupiah(result.totalBunga)}</p>
          <p className="metric-sub">Pokok × {result.rateLabel}</p>
        </div>

        {/* Angsuran per bulan — highlighted */}
        <div className="metric metric-highlight">
          <p className="metric-label">Angsuran / Bulan</p>
          <p className="metric-value">{formatRupiah(result.angsuran)}</p>
          <p className="metric-sub">Selama {result.jangka} bulan</p>
        </div>
      </div>

      {/* Kotak formula — menjelaskan cara hitung */}
      <div className="formula-box">
        <strong>Formula:</strong>{" "}
        ({formatRupiah(result.pokok)} + {formatRupiah(result.pokok)} ×{" "}
        {result.rateLabel}) ÷ {result.jangka} bulan ={" "}
        <strong>{formatRupiah(result.angsuran)} / bulan</strong>
      </div>
    </div>
  );
}

export default HasilKalkulasi;