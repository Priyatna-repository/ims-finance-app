// ============================================================
// TabelJadwal.jsx
// Menampilkan tabel JADWAL_ANGSURAN secara lengkap.
// ============================================================

import React from "react";
import { formatRupiah } from "../utils/kreditUtils";

/**
 * TabelJadwal — merender tabel jadwal angsuran.
 *
 * Props:
 * @param {Array}  jadwal      - Array hasil generateJadwalAngsuran()
 * @param {number} totalBayar  - Total seluruh pembayaran (Rp)
 */
function TabelJadwal({ jadwal, totalBayar }) {
  return (
    <div className="card">
      <h2 className="section-title">
        Jadwal Angsuran
        <span className="section-badge">JADWAL_ANGSURAN</span>
      </h2>

      {/* Wrapper scroll horizontal untuk layar kecil */}
      <div className="table-wrapper">
        <table className="jadwal-table">
          <thead>
            <tr>
              <th>Kontrak No</th>
              <th>Angsuran ke</th>
              <th>Angsuran / Bulan</th>
              <th>Tanggal Jatuh Tempo</th>
            </tr>
          </thead>

          <tbody>
            {jadwal.map((row) => (
              <tr key={row.angsuran_ke}>
                {/* Nomor kontrak */}
                <td>{row.kontrak_no}</td>

                {/* Nomor angsuran dalam badge */}
                <td>
                  <span className="angsuran-badge">{row.angsuran_ke}</span>
                </td>

                {/* Nilai angsuran, format Rupiah */}
                <td>{formatRupiah(row.angsuran_per_bulan)}</td>

                {/* Tanggal jatuh tempo */}
                <td>{row.tanggal_jatuh_tempo}</td>
              </tr>
            ))}
          </tbody>

          {/* Footer total */}
          <tfoot>
            <tr className="total-row">
              <td colSpan={2}>
                <strong>Total Keseluruhan</strong>
              </td>
              <td>
                <strong>{formatRupiah(totalBayar)}</strong>
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default TabelJadwal;