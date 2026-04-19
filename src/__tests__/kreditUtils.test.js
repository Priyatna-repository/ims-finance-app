// ============================================================
// Unit test untuk semua fungsi kalkulasi di kreditUtils.js
// Jalankan dengan: npm test
// ============================================================

import {
  getBunga,
  hitungDP,
  hitungPokokUtang,
  hitungAngsuranPerBulan,
  generateJadwalAngsuran,
  formatRupiah,
  validateForm,
} from "../utils/kreditUtils";

// ─────────────────────────────────────────
// TEST: getBunga
// ─────────────────────────────────────────
describe("getBunga()", () => {
  test("jangka 12 bulan → bunga 12%", () => {
    const result = getBunga(12);
    expect(result.rate).toBe(0.12);
    expect(result.label).toBe("12%");
  });

  test("jangka 6 bulan (≤12) → bunga 12%", () => {
    expect(getBunga(6).rate).toBe(0.12);
  });

  test("jangka 18 bulan (>12 dan ≤24) → bunga 14%", () => {
    const result = getBunga(18);
    expect(result.rate).toBe(0.14);
    expect(result.label).toBe("14%");
  });

  test("jangka 24 bulan (tepat batas atas tier 2) → bunga 14%", () => {
    expect(getBunga(24).rate).toBe(0.14);
  });

  test("jangka 36 bulan (>24) → bunga 16,5%", () => {
    const result = getBunga(36);
    expect(result.rate).toBe(0.165);
    expect(result.label).toBe("16,5%");
  });

  test("jangka 25 bulan (tepat melebihi 24) → bunga 16,5%", () => {
    expect(getBunga(25).rate).toBe(0.165);
  });
});

// ─────────────────────────────────────────
// TEST: hitungDP
// ─────────────────────────────────────────
describe("hitungDP()", () => {
  test("DP 20% dari 240 juta = 48 juta", () => {
    expect(hitungDP(240_000_000, 20)).toBe(48_000_000);
  });

  test("DP 0% = Rp 0", () => {
    expect(hitungDP(240_000_000, 0)).toBe(0);
  });

  test("DP 50% dari 100 juta = 50 juta", () => {
    expect(hitungDP(100_000_000, 50)).toBe(50_000_000);
  });

  test("DP 10% dari 150 juta = 15 juta", () => {
    expect(hitungDP(150_000_000, 10)).toBe(15_000_000);
  });
});

// ─────────────────────────────────────────
// TEST: hitungPokokUtang
// ─────────────────────────────────────────
describe("hitungPokokUtang()", () => {
  test("240 juta - 48 juta = 192 juta", () => {
    expect(hitungPokokUtang(240_000_000, 48_000_000)).toBe(192_000_000);
  });

  test("OTR sama dengan DP → pokok = 0", () => {
    expect(hitungPokokUtang(100_000_000, 100_000_000)).toBe(0);
  });

  test("DP 0 → pokok = OTR penuh", () => {
    expect(hitungPokokUtang(200_000_000, 0)).toBe(200_000_000);
  });
});

// ─────────────────────────────────────────
// TEST: hitungAngsuranPerBulan
// ─────────────────────────────────────────
describe("hitungAngsuranPerBulan()", () => {
  test("kasus soal Pak Sugus: pokok 192jt, bunga 14%/thn, 18 bulan = Rp 12.906.667", () => {
    // Tahun = 18/12 = 1,5
    // Total bunga = 192.000.000 × 0,14 × 1,5 = 40.320.000
    // Total bayar = 192.000.000 + 40.320.000  = 232.320.000
    // Angsuran    = 232.320.000 / 18          = 12.906.666,67 → 12.906.667
    const result = hitungAngsuranPerBulan(192_000_000, 0.14, 18);
    expect(result).toBe(12_906_667);
  });

  test("pokok 100jt, bunga 12%/thn, 12 bulan = Rp 9.333.333", () => {
    // Tahun = 12/12 = 1
    // Total bunga = 100.000.000 × 0,12 × 1 = 12.000.000
    // Total bayar = 100.000.000 + 12.000.000 = 112.000.000
    // Angsuran    = 112.000.000 / 12 = 9.333.333,33 → 9.333.333
    const result = hitungAngsuranPerBulan(100_000_000, 0.12, 12);
    expect(result).toBe(9_333_333);
  });

  test("hasil harus berupa angka bulat (tidak ada desimal)", () => {
    const result = hitungAngsuranPerBulan(192_000_000, 0.14, 18);
    expect(Number.isInteger(result)).toBe(true);
  });

  test("pokok 0 → angsuran 0", () => {
    const result = hitungAngsuranPerBulan(0, 0.14, 18);
    expect(result).toBe(0);
  });

  test("jangka 36 bulan (3 tahun), bunga 16,5%", () => {
    // Tahun = 36/12 = 3
    // Total bunga = 192.000.000 × 0,165 × 3 = 95.040.000
    // Total bayar = 192.000.000 + 95.040.000 = 287.040.000
    // Angsuran    = 287.040.000 / 36 = 7.973.333,33 → 7.973.333
    const result = hitungAngsuranPerBulan(192_000_000, 0.165, 36);
    expect(result).toBe(7_973_333);
  });
});

// ─────────────────────────────────────────
// TEST: generateJadwalAngsuran
// ─────────────────────────────────────────
describe("generateJadwalAngsuran()", () => {
  const jadwal = generateJadwalAngsuran(
    "AGR00001",
    12_906_667,
    18,
    "2024-01-25"
  );

  test("jumlah baris jadwal = jangka waktu (18)", () => {
    expect(jadwal).toHaveLength(18);
  });

  test("angsuran pertama = ke-1", () => {
    expect(jadwal[0].angsuran_ke).toBe(1);
  });

  test("angsuran terakhir = ke-18", () => {
    expect(jadwal[17].angsuran_ke).toBe(18);
  });

  test("kontrak_no terisi benar di semua baris", () => {
    jadwal.forEach((row) => {
      expect(row.kontrak_no).toBe("AGR00001");
    });
  });

  test("tanggal jatuh tempo pertama = 2024-01-25", () => {
    expect(jadwal[0].tanggal_jatuh_tempo).toBe("2024-01-25");
  });

  test("tanggal jatuh tempo bulan kedua = 2024-02-25", () => {
    expect(jadwal[1].tanggal_jatuh_tempo).toBe("2024-02-25");
  });

  test("angsuran bulan ke-12 = 2024-12-25", () => {
    expect(jadwal[11].tanggal_jatuh_tempo).toBe("2024-12-25");
  });

  test("angsuran bulan ke-13 berpindah ke tahun berikutnya (2025-01-25)", () => {
    expect(jadwal[12].tanggal_jatuh_tempo).toBe("2025-01-25");
  });

  test("angsuran terakhir (ke-18) = 2025-06-25", () => {
    expect(jadwal[17].tanggal_jatuh_tempo).toBe("2025-06-25");
  });

  test("nilai angsuran_per_bulan konsisten di semua baris", () => {
    jadwal.forEach((row) => {
      expect(row.angsuran_per_bulan).toBe(12_906_667);
    });
  });
});

// ─────────────────────────────────────────
// TEST: formatRupiah
// ─────────────────────────────────────────
describe("formatRupiah()", () => {
  test("format 240000000 menjadi 'Rp 240.000.000'", () => {
    expect(formatRupiah(240_000_000)).toBe("Rp 240.000.000");
  });

  test("format 12906667 menjadi 'Rp 12.906.667'", () => {
    expect(formatRupiah(12_906_667)).toBe("Rp 12.906.667");
  });

  test("format 0 menjadi 'Rp 0'", () => {
    expect(formatRupiah(0)).toBe("Rp 0");
  });

  test("membulatkan angka desimal sebelum format", () => {
    expect(formatRupiah(12_906_666.67)).toBe("Rp 12.906.667");
  });
});

// ─────────────────────────────────────────
// TEST: validateForm
// ─────────────────────────────────────────
describe("validateForm()", () => {
  const formValid = {
    kontrak_no: "AGR00001",
    client_name: "SUGUS",
    otr: "240000000",
    dp_pct: "20",
    jangka: "18",
    start_date: "2024-01-25",
  };

  test("form valid → tidak ada error", () => {
    const errors = validateForm(formValid);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  test("kontrak_no kosong → ada error", () => {
    expect(validateForm({ ...formValid, kontrak_no: "" }).kontrak_no).toBeDefined();
  });

  test("kontrak_no spasi saja → ada error", () => {
    expect(validateForm({ ...formValid, kontrak_no: "   " }).kontrak_no).toBeDefined();
  });

  test("client_name kosong → ada error", () => {
    expect(validateForm({ ...formValid, client_name: "" }).client_name).toBeDefined();
  });

  test("OTR 0 → ada error", () => {
    expect(validateForm({ ...formValid, otr: "0" }).otr).toBeDefined();
  });

  test("OTR negatif → ada error", () => {
    expect(validateForm({ ...formValid, otr: "-1000" }).otr).toBeDefined();
  });

  test("OTR bukan angka → ada error", () => {
    expect(validateForm({ ...formValid, otr: "abc" }).otr).toBeDefined();
  });

  test("DP 100% → ada error (harus < 100)", () => {
    expect(validateForm({ ...formValid, dp_pct: "100" }).dp_pct).toBeDefined();
  });

  test("DP negatif → ada error", () => {
    expect(validateForm({ ...formValid, dp_pct: "-5" }).dp_pct).toBeDefined();
  });

  test("DP 0% → valid (boleh tanpa DP)", () => {
    expect(validateForm({ ...formValid, dp_pct: "0" }).dp_pct).toBeUndefined();
  });

  test("jangka 0 → ada error", () => {
    expect(validateForm({ ...formValid, jangka: "0" }).jangka).toBeDefined();
  });

  test("start_date kosong → ada error", () => {
    expect(validateForm({ ...formValid, start_date: "" }).start_date).toBeDefined();
  });

  test("semua field kosong → semua field punya error", () => {
    const errors = validateForm({
      kontrak_no: "", client_name: "", otr: "",
      dp_pct: "", jangka: "", start_date: "",
    });
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(5);
  });
});

// ─────────────────────────────────────────
// TEST: queryTotalJatuhTempo (Soal 2)
// ─────────────────────────────────────────
import { queryTotalJatuhTempo, queryDendaKeterlambatan } from "../utils/kreditUtils";

// Jadwal tetap sesuai soal: 18 angsuran mulai 25 Jan 2024, Rp 12.906.667/bulan
const JADWAL_SOAL = generateJadwalAngsuran("AGR00001", 12_906_667, 18, "2024-01-25");

describe("queryTotalJatuhTempo() — Soal 2", () => {
  test("per 14 Agt 2024: angsuran ke-1 s/d ke-7 sudah jatuh tempo", () => {
    const r = queryTotalJatuhTempo(JADWAL_SOAL, "SUGUS", "AGR00001", "2024-08-14");
    expect(r.jumlah_angsuran).toBe(7);
  });

  test("total = 7 × 12.906.667 = 90.346.669", () => {
    const r = queryTotalJatuhTempo(JADWAL_SOAL, "SUGUS", "AGR00001", "2024-08-14");
    expect(r.total_angsuran_jatuh_tempo).toBe(7 * 12_906_667);
  });

  test("kontrak_no dan client_name terisi benar", () => {
    const r = queryTotalJatuhTempo(JADWAL_SOAL, "SUGUS", "AGR00001", "2024-08-14");
    expect(r.kontrak_no).toBe("AGR00001");
    expect(r.client_name).toBe("SUGUS");
  });

  test("cutoff 25 Jan 2024: hanya 1 angsuran jatuh tempo", () => {
    const r = queryTotalJatuhTempo(JADWAL_SOAL, "SUGUS", "AGR00001", "2024-01-25");
    expect(r.jumlah_angsuran).toBe(1);
  });

  test("cutoff sebelum semua jadwal: 0 angsuran jatuh tempo", () => {
    const r = queryTotalJatuhTempo(JADWAL_SOAL, "SUGUS", "AGR00001", "2024-01-01");
    expect(r.jumlah_angsuran).toBe(0);
    expect(r.total_angsuran_jatuh_tempo).toBe(0);
  });
});

// ─────────────────────────────────────────
// TEST: queryDendaKeterlambatan (Soal 3)
// ─────────────────────────────────────────
describe("queryDendaKeterlambatan() — Soal 3", () => {
  const SUDAH_BAYAR = new Set([1, 2, 3, 4, 5]);
  const hasil = queryDendaKeterlambatan(
    JADWAL_SOAL, "SUGUS", "AGR00001", "2024-08-14", SUDAH_BAYAR
  );

  test("hanya 2 angsuran yang kena denda (ke-6 dan ke-7)", () => {
    expect(hasil).toHaveLength(2);
  });

  test("angsuran ke-6 (jatuh tempo 25 Jun) = 50 hari keterlambatan", () => {
    // 14 Agustus - 25 Juni = 50 hari
    const row6 = hasil.find((r) => r.installment_no === 6);
    expect(row6.hari_keterlambatan).toBe(50);
  });

  test("angsuran ke-7 (jatuh tempo 25 Jul) = 20 hari keterlambatan", () => {
    // 14 Agustus - 25 Juli = 20 hari
    const row7 = hasil.find((r) => r.installment_no === 7);
    expect(row7.hari_keterlambatan).toBe(20);
  });

  test("denda angsuran ke-6: 12.906.667 × 0,1% × 50 = 6.453.334", () => {
    const row6 = hasil.find((r) => r.installment_no === 6);
    expect(row6.total_denda).toBe(Math.round(12_906_667 * 0.001 * 50));
  });

  test("denda angsuran ke-7: 12.906.667 × 0,1% × 20 = 2.581.333", () => {
    const row7 = hasil.find((r) => r.installment_no === 7);
    expect(row7.total_denda).toBe(Math.round(12_906_667 * 0.001 * 20));
  });

  test("kontrak_no dan client_name benar di semua baris", () => {
    hasil.forEach((row) => {
      expect(row.kontrak_no).toBe("AGR00001");
      expect(row.client_name).toBe("SUGUS");
    });
  });

  test("hasil diurutkan berdasarkan installment_no (ascending)", () => {
    expect(hasil[0].installment_no).toBeLessThan(hasil[1].installment_no);
  });

  test("semua angsuran yang sudah bayar (1-5) TIDAK masuk hasil", () => {
    const angsuranKena = hasil.map((r) => r.installment_no);
    [1, 2, 3, 4, 5].forEach((n) => {
      expect(angsuranKena).not.toContain(n);
    });
  });

  test("jika semua sudah bayar → tidak ada denda", () => {
    const semuaBayar = new Set([1, 2, 3, 4, 5, 6, 7]);
    const r = queryDendaKeterlambatan(
      JADWAL_SOAL, "SUGUS", "AGR00001", "2024-08-14", semuaBayar
    );
    expect(r).toHaveLength(0);
  });
});