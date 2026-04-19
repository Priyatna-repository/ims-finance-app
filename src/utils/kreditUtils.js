// ============================================================
// Berisi semua fungsi perhitungan kredit IMS Finance.
// Dipisah dari komponen UI agar mudah di-testing secara unit.
// ============================================================

/**
 * Menentukan persentase bunga berdasarkan jangka waktu cicilan.
 * Logika ini mengikuti flowchart yang diberikan:
 *   - <= 12 bulan  → 12%
 *   - 13–24 bulan  → 14%
 *   - > 24 bulan   → 16,5%
 *
 * @param {number} jangkaBulan - Jangka waktu kredit dalam bulan
 * @returns {{ rate: number, label: string }} - Nilai bunga desimal & label string
 */
export function getBunga(jangkaBulan) {
  if (jangkaBulan <= 12) {
    return { rate: 0.12, label: "12%" };
  } else if (jangkaBulan <= 24) {
    return { rate: 0.14, label: "14%" };
  } else {
    return { rate: 0.165, label: "16,5%" };
  }
}

/**
 * Menghitung Down Payment (uang muka) dari harga OTR.
 *
 * @param {number} otr       - Harga On The Road kendaraan (Rp)
 * @param {number} pctDP     - Persentase DP (misal: 20 untuk 20%)
 * @returns {number}         - Nilai DP dalam Rupiah
 */
export function hitungDP(otr, pctDP) {
  return otr * (pctDP / 100);
}

/**
 * Menghitung pokok utang (harga setelah dikurangi DP).
 *
 * @param {number} otr - Harga OTR kendaraan (Rp)
 * @param {number} dp  - Nilai DP (Rp)
 * @returns {number}   - Pokok utang dalam Rupiah
 */
export function hitungPokokUtang(otr, dp) {
  return otr - dp;
}

/**
 * Menghitung angsuran per bulan menggunakan rumus flat rate sesuai flowchart soal:
 *   Angsuran = (Pokok + (Pokok × Bunga × Tahun)) / Jangka Waktu (bulan)
 *
 * Bunga adalah rate PER TAHUN, sehingga perlu dikalikan jumlah tahun.
 * Contoh soal: pokok 192jt, bunga 14%/tahun, 18 bulan (1,5 tahun):
 *   Tahun       = 18 / 12 = 1,5
 *   Total bunga = 192.000.000 × 0,14 × 1,5 = 40.320.000
 *   Total bayar = 192.000.000 + 40.320.000  = 232.320.000
 *   Angsuran    = 232.320.000 / 18          = 12.906.667
 *
 * Hasil dibulatkan ke Rupiah terdekat (Math.round).
 *
 * @param {number} pokokUtang   - Pokok utang setelah dikurangi DP (Rp)
 * @param {number} bungaRate    - Bunga PER TAHUN dalam desimal (misal: 0.14 untuk 14%)
 * @param {number} jangkaBulan  - Jangka waktu cicilan dalam bulan
 * @returns {number}            - Angsuran per bulan (Rp), sudah dibulatkan
 */
export function hitungAngsuranPerBulan(pokokUtang, bungaRate, jangkaBulan) {
  // Konversi jangka dari bulan ke tahun agar bunga dikalkulasi per tahun
  const tahun = jangkaBulan / 12;
  // Total bunga = pokok × rate per tahun × jumlah tahun
  const totalBunga = pokokUtang * bungaRate * tahun;
  const totalBayar = pokokUtang + totalBunga;
  return Math.round(totalBayar / jangkaBulan);
}

/**
 * Menghasilkan array jadwal angsuran lengkap.
 * Setiap entri merepresentasikan satu baris di tabel JADWAL_ANGSURAN.
 *
 * @param {string} kontrakNo        - Nomor kontrak (misal: "AGR00001")
 * @param {number} angsuranPerBulan - Nilai angsuran per bulan (Rp)
 * @param {number} jangkaBulan      - Total bulan cicilan
 * @param {string} startDateStr     - Tanggal jatuh tempo pertama (format: YYYY-MM-DD)
 * @returns {Array}
 */
export function generateJadwalAngsuran(
  kontrakNo,
  angsuranPerBulan,
  jangkaBulan,
  startDateStr
) {
  const jadwal = [];
  // Pisahkan komponen tanggal agar tidak terjadi masalah timezone
  const [year, month, day] = startDateStr.split("-").map(Number);

  for (let i = 0; i < jangkaBulan; i++) {
    // Buat tanggal jatuh tempo untuk tiap angsuran
    // month - 1 karena Date JS menggunakan index 0 untuk Januari
    const tgl = new Date(year, month - 1 + i, day);

    // Format tanggal kembali ke YYYY-MM-DD
    const yyyy = tgl.getFullYear();
    const mm = String(tgl.getMonth() + 1).padStart(2, "0");
    const dd = String(tgl.getDate()).padStart(2, "0");

    jadwal.push({
      kontrak_no: kontrakNo,
      angsuran_ke: i + 1,
      angsuran_per_bulan: angsuranPerBulan,
      tanggal_jatuh_tempo: `${yyyy}-${mm}-${dd}`,
    });
  }

  return jadwal;
}

/**
 * Memformat angka menjadi string Rupiah Indonesia.
 * Contoh: 12907000 → "Rp 12.907.000"
 *
 * @param {number} angka - Nilai yang akan diformat
 * @returns {string}     - String mata uang dalam format IDR
 */
export function formatRupiah(angka) {
  return (
    "Rp " +
    Math.round(angka).toLocaleString("id-ID")
  );
}

/**
 * Memvalidasi semua input form sebelum kalkulasi dilakukan.
 * Mengembalikan objek error — kosong jika semua valid.
 *
 * @param {Object} form - Objek berisi nilai-nilai input form
 * @returns {Object}    - Key = nama field, Value = pesan error
 */
export function validateForm(form) {
  const errors = {};

  if (!form.kontrak_no || !form.kontrak_no.trim()) {
    errors.kontrak_no = "Nomor kontrak wajib diisi";
  }

  if (!form.client_name || !form.client_name.trim()) {
    errors.client_name = "Nama klien wajib diisi";
  }

  if (!form.otr || isNaN(+form.otr) || +form.otr <= 0) {
    errors.otr = "Harga OTR harus berupa angka lebih dari 0";
  }

  if (
    form.dp_pct === "" ||
    isNaN(+form.dp_pct) ||
    +form.dp_pct < 0 ||
    +form.dp_pct >= 100
  ) {
    errors.dp_pct = "Down Payment harus antara 0% hingga 99%";
  }

  if (!form.jangka || isNaN(+form.jangka) || +form.jangka < 1) {
    errors.jangka = "Jangka waktu harus minimal 1 bulan";
  }

  if (!form.start_date) {
    errors.start_date = "Tanggal mulai angsuran wajib diisi";
  }

  return errors;
}

// ============================================================
// FUNGSI SOAL 2 & 3
// ============================================================

/**
 * SOAL 2 — Menghitung total angsuran yang sudah jatuh tempo
 * pada tanggal tertentu (cutoff date).
 *
 * Ekuivalen SQL:
 *   SELECT k.KONTRAK_NO, k.CLIENT_NAME,
 *          SUM(j.ANGSURAN_PER_BULAN) AS TOTAL_ANGSURAN_JATUH_TEMPO
 *   FROM KONTRAK k
 *   JOIN JADWAL_ANGSURAN j ON k.KONTRAK_NO = j.KONTRAK_NO
 *   WHERE k.CLIENT_NAME = 'SUGUS'
 *     AND j.TANGGAL_JATUH_TEMPO <= '2024-08-14'
 *   GROUP BY k.KONTRAK_NO, k.CLIENT_NAME;
 *
 * @param {Array}  jadwal      - Array jadwal angsuran dari generateJadwalAngsuran()
 * @param {string} clientName  - Nama klien (filter)
 * @param {string} kontrakNo   - Nomor kontrak
 * @param {string} cutoffDate  - Tanggal batas jatuh tempo (YYYY-MM-DD)
 * @returns {{ kontrak_no, client_name, total_angsuran_jatuh_tempo }}
 */
export function queryTotalJatuhTempo(jadwal, clientName, kontrakNo, cutoffDate) {
  const cutoff = new Date(cutoffDate);

  // Filter: hanya angsuran yang tanggal jatuh temponya <= cutoff
  const sudahJatuhTempo = jadwal.filter((row) => {
    const tgl = new Date(row.tanggal_jatuh_tempo);
    return tgl <= cutoff;
  });

  // SUM angsuran_per_bulan dari semua baris yang lolos filter
  const total = sudahJatuhTempo.reduce(
    (sum, row) => sum + row.angsuran_per_bulan,
    0
  );

  return {
    kontrak_no: kontrakNo,
    client_name: clientName,
    total_angsuran_jatuh_tempo: total,
    jumlah_angsuran: sudahJatuhTempo.length,
  };
}

/**
 * SOAL 3 — Menghitung denda keterlambatan per angsuran yang belum dibayar.
 *
 * Rumus denda per angsuran:
 *   Hari keterlambatan = selisih hari antara tanggal jatuh tempo & cutoff date
 *   Total denda        = angsuran_per_bulan × 0,1% × hari_keterlambatan
 *
 * Ekuivalen SQL:
 *   SELECT k.KONTRAK_NO, k.CLIENT_NAME,
 *          j.ANGSURAN_KE AS INSTALLMENT_NO,
 *          DATEDIFF('2024-08-14', j.TANGGAL_JATUH_TEMPO) AS HARI_KETERLAMBATAN,
 *          ROUND(j.ANGSURAN_PER_BULAN * 0.001
 *                * DATEDIFF('2024-08-14', j.TANGGAL_JATUH_TEMPO), 0) AS TOTAL_DENDA
 *   FROM KONTRAK k
 *   JOIN JADWAL_ANGSURAN j ON k.KONTRAK_NO = j.KONTRAK_NO
 *   WHERE k.CLIENT_NAME = 'SUGUS'
 *     AND j.TANGGAL_JATUH_TEMPO < '2024-08-14'
 *     AND j.ANGSURAN_KE NOT IN (1, 2, 3, 4, 5)   -- sudah bayar s/d Mei 2024
 *   ORDER BY j.ANGSURAN_KE;
 *
 * @param {Array}  jadwal          - Array jadwal angsuran
 * @param {string} clientName      - Nama klien
 * @param {string} kontrakNo       - Nomor kontrak
 * @param {string} cutoffDate      - Tanggal perhitungan denda (YYYY-MM-DD)
 * @param {Set}    angsuranBayar   - Set nomor angsuran yang sudah dibayar
 * @param {number} dendaRatePerHari - Rate denda per hari (default 0.001 = 0,1%)
 * @returns {Array<{ kontrak_no, client_name, installment_no,
 *                   hari_keterlambatan, total_denda }>}
 */
export function queryDendaKeterlambatan(
  jadwal,
  clientName,
  kontrakNo,
  cutoffDate,
  angsuranBayar,
  dendaRatePerHari = 0.001
) {
  const cutoff = new Date(cutoffDate);
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  return jadwal
    .filter((row) => {
      const tgl = new Date(row.tanggal_jatuh_tempo);
      // Kondisi: sudah jatuh tempo (< cutoff) DAN belum dibayar
      return tgl < cutoff && !angsuranBayar.has(row.angsuran_ke);
    })
    .map((row) => {
      const tgl = new Date(row.tanggal_jatuh_tempo);
      // DATEDIFF: selisih hari antara cutoff dan tanggal jatuh tempo
      const hariKeterlambatan = Math.floor((cutoff - tgl) / MS_PER_DAY);
      // Denda = angsuran × rate/hari × jumlah hari
      const totalDenda = Math.round(
        row.angsuran_per_bulan * dendaRatePerHari * hariKeterlambatan
      );

      return {
        kontrak_no: kontrakNo,
        client_name: clientName,
        installment_no: row.angsuran_ke,
        tanggal_jatuh_tempo: row.tanggal_jatuh_tempo,
        angsuran_per_bulan: row.angsuran_per_bulan,
        hari_keterlambatan: hariKeterlambatan,
        total_denda: totalDenda,
      };
    })
    .sort((a, b) => a.installment_no - b.installment_no);
}