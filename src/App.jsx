// ============================================================
// Komponen utama — mengelola state dan routing antar tab soal.
// ============================================================

import React, { useState, useMemo } from "react";
import FormKredit from "./components/FormKredit";
import HasilKalkulasi from "./components/HasilKalkulasi";
import TabelJadwal from "./components/TabelJadwal";
import TabSoal2 from "./components/TabSoal2";
import TabSoal3 from "./components/TabSoal3";
import {
  getBunga,
  hitungDP,
  hitungPokokUtang,
  hitungAngsuranPerBulan,
  generateJadwalAngsuran,
  queryTotalJatuhTempo,
  queryDendaKeterlambatan,
  validateForm,
} from "./utils/kreditUtils";
import "./App.css";

// Soal 2 & 3 menggunakan parameter tetap sesuai soal
const CUTOFF_DATE   = "2024-08-14"; // per tanggal 14 Agustus 2024
const SUDAH_BAYAR   = new Set([1, 2, 3, 4, 5]); // lunas s/d Mei 2024

function App() {
  // ── State form ──────────────────────────────────────────────
  const [form, setForm] = useState({
    kontrak_no: "AGR00001",
    client_name: "SUGUS",
    otr: "240000000",
    dp_pct: "20",
    jangka: "18",
    start_date: "2024-01-25",
  });
  const [errors, setErrors]   = useState({});
  const [result, setResult]   = useState(null);
  // Tab aktif: "soal1" | "soal2" | "soal3"
  const [activeTab, setActiveTab] = useState("soal1");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setResult(null); // reset hasil saat input berubah
  }

  function handleSubmit() {
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    // ── Soal 1: Kalkulasi angsuran ───────────────────────────
    const otr    = Number(form.otr);
    const dpPct  = Number(form.dp_pct);
    const jangka = Number(form.jangka);
    const dp     = hitungDP(otr, dpPct);
    const pokok  = hitungPokokUtang(otr, dp);
    const { rate, label: rateLabel } = getBunga(jangka);
    const angsuran   = hitungAngsuranPerBulan(pokok, rate, jangka);
    const totalBunga = pokok * rate * (jangka / 12);
    const totalBayar = angsuran * jangka;
    const jadwal     = generateJadwalAngsuran(
      form.kontrak_no, angsuran, jangka, form.start_date
    );

    // ── Soal 2: Total angsuran jatuh tempo ──────────────────
    const result2 = queryTotalJatuhTempo(
      jadwal, form.client_name, form.kontrak_no, CUTOFF_DATE
    );

    // ── Soal 3: Denda keterlambatan ─────────────────────────
    const dendaRows = queryDendaKeterlambatan(
      jadwal, form.client_name, form.kontrak_no,
      CUTOFF_DATE, SUDAH_BAYAR
    );

    setResult({ otr, dp, pokok, jangka, rate, rateLabel,
                angsuran, totalBunga, totalBayar, jadwal,
                result2, dendaRows });
  }

  return (
    <div className="app-container">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-logo">IMS</div>
        <div>
          <h1 className="app-title">IMS Finance</h1>
          <p className="app-subtitle">Kalkulator Kredit Kendaraan</p>
        </div>
      </header>

      <main className="app-main">
        {/* ── Form Input ── */}
        <FormKredit form={form} errors={errors}
                    onChange={handleChange} onSubmit={handleSubmit} />

        {/* ── Konten Tab — hanya tampil setelah submit ── */}
        {result && (
          <>
            {/* Tab navigation */}
            <div className="tab-nav">
              {[
                { id: "soal1", label: "Soal 1 — Angsuran" },
                { id: "soal2", label: "Soal 2 — Total Jatuh Tempo" },
                { id: "soal3", label: "Soal 3 — Denda" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "soal1" && (
              <>
                <HasilKalkulasi result={result} dpPct={form.dp_pct} />
                <TabelJadwal jadwal={result.jadwal} totalBayar={result.totalBayar} />
              </>
            )}
            {activeTab === "soal2" && (
              <TabSoal2 result2={result.result2} />
            )}
            {activeTab === "soal3" && (
              <TabSoal3 dendaRows={result.dendaRows} />
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        © 2026 PT. Inovasi Mitra Sejati — CONFIDENTIAL
      </footer>
    </div>
  );
}

export default App;