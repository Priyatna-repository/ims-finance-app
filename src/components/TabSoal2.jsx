import React from "react";
import { formatRupiah } from "../utils/kreditUtils";

function TabSoal2({ result2, jadwal, cutoffDate }) {
  const cutoff = new Date(cutoffDate);

  return (
    <div>
      {/* ── Penjelasan Logika ── */}
      <div className="info-box">
        <p className="info-title">Logika Query</p>
        <p>
          Angsuran yang <strong>sudah jatuh tempo</strong> per 14 Agustus 2024
          adalah semua baris di <code>JADWAL_ANGSURAN</code> dengan{" "}
          <code>TANGGAL_JATUH_TEMPO &lt;= '2024-08-14'</code>.
          Dari 18 angsuran total, yang memenuhi syarat adalah angsuran ke-1 s/d ke-7
          (Januari–Juli 2024 jatuh tempo tanggal 25 tiap bulan).
        </p>
      </div>

      {/* ── Query SQL ── */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <p className="section-title">Query SQL</p>
        <pre className="code-block">{`SELECT
    k.KONTRAK_NO,
    k.CLIENT_NAME,
    SUM(j.ANGSURAN_PER_BULAN) AS TOTAL_ANGSURAN_JATUH_TEMPO
FROM KONTRAK k
JOIN JADWAL_ANGSURAN j
    ON k.KONTRAK_NO = j.KONTRAK_NO
WHERE k.CLIENT_NAME = 'SUGUS'
  AND j.TANGGAL_JATUH_TEMPO <= '2024-08-14'
GROUP BY k.KONTRAK_NO, k.CLIENT_NAME;`}</pre>
      </div>

      {/* ── Kode JavaScript ── */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <p className="section-title">Implementasi JavaScript</p>
        <pre className="code-block">{`const cutoff = new Date('2024-08-14');

// Filter angsuran yang sudah jatuh tempo
const sudahJatuhTempo = jadwal.filter((row) => {
  return new Date(row.tanggal_jatuh_tempo) <= cutoff;
});

// SUM total angsuran
const total = sudahJatuhTempo.reduce(
  (sum, row) => sum + row.angsuran_per_bulan, 0
);`}</pre>
      </div>

      {/* ── Hasil Query ── */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <p className="section-title">
          Hasil Query
          <span className="section-badge">per 14 Agustus 2024</span>
        </p>
        <div className="table-wrapper">
          <table className="jadwal-table">
            <thead>
              <tr>
                <th>Kontrak No</th>
                <th>Client Name</th>
                <th className="right">Total Angsuran Jatuh Tempo</th>
                <th className="center">Jumlah Angsuran</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{result2.kontrak_no}</td>
                <td>{result2.client_name}</td>
                <td className="right mono result-highlight">
                  {formatRupiah(result2.total_angsuran_jatuh_tempo)}
                </td>
                <td className="center">
                  <span className="angsuran-badge">{result2.jumlah_angsuran}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Kalkulasi detail */}
        <div className="formula-box" style={{ marginTop: "12px" }}>
          <strong>Perhitungan:</strong>{" "}
          {result2.jumlah_angsuran} angsuran ×{" "}
          {formatRupiah(result2.total_angsuran_jatuh_tempo / result2.jumlah_angsuran)} ={" "}
          <strong>{formatRupiah(result2.total_angsuran_jatuh_tempo)}</strong>
          <br />
          <span style={{ fontSize: "12px", color: "#6c757d" }}>
            Angsuran ke-1 (25 Jan) s/d ke-7 (25 Jul 2024) — semua sudah melewati 14 Agustus 2024
          </span>
        </div>
      </div>

      {/* ── Highlight Jadwal Angsuran ── */}
      <div className="card">
        <p className="section-title">
          Visualisasi Filter pada Jadwal Angsuran
          <span className="section-badge">JADWAL_ANGSURAN</span>
        </p>

        <div className="table-legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: "#bbf7d0", border: "1px solid #86efac" }} />
            <span>Sudah jatuh tempo — masuk hitungan <code>SUM</code></span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: "#f1f3f5", border: "1px solid #dee2e6" }} />
            <span>Belum jatuh tempo — tidak dihitung</span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="jadwal-table">
            <thead>
              <tr>
                <th>Kontrak No</th>
                <th className="center">Angsuran ke</th>
                <th className="right">Angsuran / Bulan</th>
                <th>Tanggal Jatuh Tempo</th>
                <th className="center">Status</th>
              </tr>
            </thead>
            <tbody>
              {jadwal.map((row) => {
                const isJatuhTempo = new Date(row.tanggal_jatuh_tempo) <= cutoff;
                return (
                  <tr key={row.angsuran_ke} className={isJatuhTempo ? "row-jatuh-tempo" : ""}>
                    <td>{row.kontrak_no}</td>
                    <td className="center">
                      <span className={`angsuran-badge ${isJatuhTempo ? "badge-green" : ""}`}>
                        {row.angsuran_ke}
                      </span>
                    </td>
                    <td className="right mono">{formatRupiah(row.angsuran_per_bulan)}</td>
                    <td>{row.tanggal_jatuh_tempo}</td>
                    <td className="center">
                      {isJatuhTempo
                        ? <span className="pill-success">Jatuh Tempo</span>
                        : <span className="pill-muted">Belum</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td colSpan={2}>
                  <strong>Total Jatuh Tempo ({result2.jumlah_angsuran} angsuran)</strong>
                </td>
                <td className="right mono">
                  <strong>{formatRupiah(result2.total_angsuran_jatuh_tempo)}</strong>
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TabSoal2;
