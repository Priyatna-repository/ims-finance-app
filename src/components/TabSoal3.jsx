import React from "react";
import { formatRupiah } from "../utils/kreditUtils";

function TabSoal3({ dendaRows, jadwal, sudahBayar }) {
  const totalHari = dendaRows.reduce((s, r) => s + r.hari_keterlambatan, 0);
  const totalDenda = dendaRows.reduce((s, r) => s + r.total_denda, 0);

  // Map installment_no → data denda untuk lookup O(1)
  const dendaMap = new Map(dendaRows.map((r) => [r.installment_no, r]));

  return (
    <div>
      {/* ── Penjelasan Logika ── */}
      <div className="info-box">
        <p className="info-title">Skenario & Logika</p>
        <p>
          Pak Sugus <strong>sudah bayar</strong> tepat waktu s/d angsuran ke-5
          (jatuh tempo 25 Mei 2024). Angsuran ke-6 (25 Jun) dan ke-7 (25 Jul)
          <strong> belum dibayar</strong> hingga 14 Agustus 2024.
          Denda = <code>angsuran × 0,1% × hari keterlambatan</code>.
        </p>
      </div>

      {/* ── Query SQL ── */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <p className="section-title">Query SQL</p>
        <pre className="code-block">{`SELECT
    k.KONTRAK_NO,
    k.CLIENT_NAME,
    j.ANGSURAN_KE                              AS INSTALLMENT_NO,
    DATEDIFF('2024-08-14', j.TANGGAL_JATUH_TEMPO)
                                               AS HARI_KETERLAMBATAN,
    ROUND(
        j.ANGSURAN_PER_BULAN
        * 0.001
        * DATEDIFF('2024-08-14', j.TANGGAL_JATUH_TEMPO),
    0)                                         AS TOTAL_DENDA
FROM KONTRAK k
JOIN JADWAL_ANGSURAN j
    ON k.KONTRAK_NO = j.KONTRAK_NO
WHERE k.CLIENT_NAME        = 'SUGUS'
  AND j.TANGGAL_JATUH_TEMPO < '2024-08-14'
  AND j.ANGSURAN_KE NOT IN (1, 2, 3, 4, 5)   -- sudah lunas s/d Mei 2024
ORDER BY j.ANGSURAN_KE;`}</pre>
      </div>

      {/* ── Kode JavaScript ── */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <p className="section-title">Implementasi JavaScript</p>
        <pre className="code-block">{`const cutoff         = new Date('2024-08-14');
const sudahBayar     = new Set([1, 2, 3, 4, 5]); // lunas s/d Mei 2024
const MS_PER_DAY     = 1000 * 60 * 60 * 24;
const DENDA_RATE     = 0.001; // 0,1% per hari

const hasilDenda = jadwal
  .filter((row) => {
    const tgl = new Date(row.tanggal_jatuh_tempo);
    // Sudah jatuh tempo DAN belum dibayar
    return tgl < cutoff && !sudahBayar.has(row.angsuran_ke);
  })
  .map((row) => {
    const tgl = new Date(row.tanggal_jatuh_tempo);
    // Hitung selisih hari (setara DATEDIFF di SQL)
    const hari = Math.floor((cutoff - tgl) / MS_PER_DAY);
    // Denda = angsuran × 0,1% × hari
    const denda = Math.round(row.angsuran_per_bulan * DENDA_RATE * hari);
    return { angsuran_ke: row.angsuran_ke, hari, denda };
  });`}</pre>
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
                <th>Installment No</th>
                <th>Tgl Jatuh Tempo</th>
                <th>Angsuran/Bulan</th>
                <th>Hari Keterlambatan</th>
                <th>Total Denda</th>
              </tr>
            </thead>
            <tbody>
              {dendaRows.map((row) => (
                <tr key={row.installment_no} className="row-overdue">
                  <td>{row.kontrak_no}</td>
                  <td>{row.client_name}</td>
                  <td>
                    <span className="angsuran-badge badge-red">
                      {row.installment_no}
                    </span>
                  </td>
                  <td>{row.tanggal_jatuh_tempo}</td>
                  <td>{formatRupiah(row.angsuran_per_bulan)}</td>
                  <td>
                    <span className="pill-danger">{row.hari_keterlambatan} hari</span>
                  </td>
                  <td className="denda-value">
                    {formatRupiah(row.total_denda)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td colSpan={5}><strong>Total</strong></td>
                <td className="center"><strong>{totalHari} hari</strong></td>
                <td className="right mono"><strong>{formatRupiah(totalDenda)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Rincian per angsuran */}
        <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {dendaRows.map((row) => (
            <div key={row.installment_no} className="denda-card">
              <p className="denda-card-title">Angsuran ke-{row.installment_no}</p>
              <p className="denda-card-sub">Jatuh tempo: {row.tanggal_jatuh_tempo}</p>
              <div className="denda-card-row">
                <span>{formatRupiah(row.angsuran_per_bulan)}</span>
                <span className="denda-op">×</span>
                <span>0,1%</span>
                <span className="denda-op">×</span>
                <span>{row.hari_keterlambatan} hari</span>
                <span className="denda-op">=</span>
                <span className="denda-result">{formatRupiah(row.total_denda)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Highlight Jadwal Angsuran ── */}
      <div className="card">
        <p className="section-title">
          Visualisasi Status pada Jadwal Angsuran
          <span className="section-badge">JADWAL_ANGSURAN</span>
        </p>

        <div className="table-legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: "#bbf7d0", border: "1px solid #86efac" }} />
            <span>Lunas — sudah dibayar tepat waktu</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: "#fee2e2", border: "1px solid #fca5a5" }} />
            <span>Terlambat — belum dibayar, kena denda</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: "#f1f3f5", border: "1px solid #dee2e6" }} />
            <span>Belum jatuh tempo</span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="jadwal-table">
            <thead>
              <tr>
                <th>Kontrak No</th>
                <th>Angsuran ke</th>
                <th>Angsuran / Bulan</th>
                <th>Tanggal Jatuh Tempo</th>
                <th>Status</th>
                <th>Hari Telat</th>
                <th>Denda</th>
              </tr>
            </thead>
            <tbody>
              {jadwal.map((row) => {
                const isLunas      = sudahBayar.has(row.angsuran_ke);
                const isTerlambat  = dendaMap.has(row.angsuran_ke);
                const dendaInfo    = dendaMap.get(row.angsuran_ke);

                const rowClass = isLunas ? "row-lunas" : isTerlambat ? "row-overdue" : "";
                const badgeClass = isLunas ? "badge-green" : isTerlambat ? "badge-red" : "";

                return (
                  <tr key={row.angsuran_ke} className={rowClass}>
                    <td>{row.kontrak_no}</td>
                    <td>
                      <span className={`angsuran-badge ${badgeClass}`}>
                        {row.angsuran_ke}
                      </span>
                    </td>
                    <td>{formatRupiah(row.angsuran_per_bulan)}</td>
                    <td>{row.tanggal_jatuh_tempo}</td>
                    <td>
                      {isLunas
                        ? <span className="pill-success">Lunas</span>
                        : isTerlambat
                        ? <span className="pill-danger">Terlambat</span>
                        : <span className="pill-muted">Belum jatuh tempo</span>}
                    </td>
                    <td>
                      {isTerlambat
                        ? <span className="pill-danger">{dendaInfo.hari_keterlambatan} hari</span>
                        : <span style={{ color: "#adb5bd" }}>—</span>}
                    </td>
                    <td>
                      {isTerlambat
                        ? <span className="denda-value">{formatRupiah(dendaInfo.total_denda)}</span>
                        : <span style={{ color: "#adb5bd" }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td colSpan={5}><strong>Total Denda</strong></td>
                <td className="center"><strong>{totalHari} hari</strong></td>
                <td className="right mono"><strong>{formatRupiah(totalDenda)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TabSoal3;
