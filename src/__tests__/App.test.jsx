// ============================================================
// Integration test — menguji interaksi user dengan UI
// Jalankan dengan: npm test
// ============================================================

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

// ── Helper: render App ───────────────────────────────────────
function setup() {
  render(<App />);
  return {
    inputKontrakNo:  () => screen.getByLabelText(/nomor kontrak/i),
    inputClientName: () => screen.getByLabelText(/nama klien/i),
    inputOtr:        () => screen.getByLabelText(/harga otr/i),
    inputDpPct:      () => screen.getByLabelText(/down payment/i),
    selectJangka:    () => screen.getByLabelText(/jangka waktu/i),
    inputStartDate:  () => screen.getByLabelText(/tanggal mulai/i),
    btnHitung:       () => screen.getByRole("button", { name: /hitung angsuran/i }),
  };
}

// ─────────────────────────────────────────
// TEST: Render awal aplikasi
// ─────────────────────────────────────────
describe("Render awal aplikasi", () => {
  test("judul 'IMS Finance' tampil", () => {
    render(<App />);
    expect(screen.getByText("IMS Finance")).toBeInTheDocument();
  });

  test("subjudul 'Kalkulator Kredit Kendaraan' tampil", () => {
    render(<App />);
    expect(screen.getByText(/kalkulator kredit kendaraan/i)).toBeInTheDocument();
  });

  test("semua field form tampil", () => {
    const { inputKontrakNo, inputClientName, inputOtr, inputDpPct, selectJangka, inputStartDate } = setup();
    expect(inputKontrakNo()).toBeInTheDocument();
    expect(inputClientName()).toBeInTheDocument();
    expect(inputOtr()).toBeInTheDocument();
    expect(inputDpPct()).toBeInTheDocument();
    expect(selectJangka()).toBeInTheDocument();
    expect(inputStartDate()).toBeInTheDocument();
  });

  test("form diisi data default soal (AGR00001, SUGUS)", () => {
    const { inputKontrakNo, inputClientName, inputOtr, inputDpPct } = setup();
    expect(inputKontrakNo()).toHaveValue("AGR00001");
    expect(inputClientName()).toHaveValue("SUGUS");
    expect(inputOtr()).toHaveValue(240000000);
    expect(inputDpPct()).toHaveValue(20);
  });

  test("hasil kalkulasi BELUM tampil sebelum tombol diklik", () => {
    render(<App />);
    expect(screen.queryByText(/ringkasan perhitungan/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/jadwal angsuran/i)).not.toBeInTheDocument();
  });

  test("tombol 'Hitung Angsuran' tampil", () => {
    const { btnHitung } = setup();
    expect(btnHitung()).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────
// TEST: Kalkulasi data soal — Pak Sugus
// ─────────────────────────────────────────
describe("Kalkulasi data soal — Pak Sugus", () => {
  test("klik Hitung → section 'Ringkasan Perhitungan' tampil", () => {
    const { btnHitung } = setup();
    fireEvent.click(btnHitung());
    expect(screen.getByText(/ringkasan perhitungan/i)).toBeInTheDocument();
  });

  test("klik Hitung → section 'Jadwal Angsuran' tampil", () => {
    const { btnHitung } = setup();
    fireEvent.click(btnHitung());
    expect(screen.getByText(/jadwal angsuran/i)).toBeInTheDocument();
  });

  test("OTR Rp 240.000.000 tampil di hasil", () => {
    const { btnHitung } = setup();
    fireEvent.click(btnHitung());
    expect(screen.getByText("Rp 240.000.000")).toBeInTheDocument();
  });

  test("Down Payment Rp 48.000.000 (20%) tampil", () => {
    const { btnHitung } = setup();
    fireEvent.click(btnHitung());
    expect(screen.getByText("Rp 48.000.000")).toBeInTheDocument();
  });

  test("Pokok Utang Rp 192.000.000 tampil", () => {
    const { btnHitung } = setup();
    fireEvent.click(btnHitung());
    expect(screen.getByText("Rp 192.000.000")).toBeInTheDocument();
  });

  test("Bunga 14% tampil (jangka 18 bulan)", () => {
    const { btnHitung } = setup();
    fireEvent.click(btnHitung());
    expect(screen.getByText("14%")).toBeInTheDocument();
  });

  test("Angsuran/bulan Rp 12.906.667 tampil di metric card", () => {
    const { btnHitung } = setup();
    fireEvent.click(btnHitung());
    // Angsuran muncul di metric card dan di setiap baris tabel
    const items = screen.getAllByText("Rp 12.906.667");
    expect(items.length).toBeGreaterThan(0);
  });

  test("tabel jadwal memiliki 18 baris angsuran (18x kontrak AGR00001)", () => {
    const { btnHitung } = setup();
    fireEvent.click(btnHitung());
    const rows = screen.getAllByText("AGR00001");
    expect(rows.length).toBe(18);
  });

  test("angsuran pertama jatuh tempo 2024-01-25", () => {
    const { btnHitung } = setup();
    fireEvent.click(btnHitung());
    expect(screen.getByText("2024-01-25")).toBeInTheDocument();
  });

  test("angsuran bulan ke-7 jatuh tempo 2024-07-25", () => {
    const { btnHitung } = setup();
    fireEvent.click(btnHitung());
    expect(screen.getByText("2024-07-25")).toBeInTheDocument();
  });

  test("angsuran ke-13 berpindah tahun → 2025-01-25", () => {
    const { btnHitung } = setup();
    fireEvent.click(btnHitung());
    expect(screen.getByText("2025-01-25")).toBeInTheDocument();
  });

  test("angsuran terakhir ke-18 jatuh tempo 2025-06-25", () => {
    const { btnHitung } = setup();
    fireEvent.click(btnHitung());
    expect(screen.getByText("2025-06-25")).toBeInTheDocument();
  });

  test("total bayar = 18 × 12.906.667 = Rp 232.320.006 tampil", () => {
    const { btnHitung } = setup();
    fireEvent.click(btnHitung());
    // Total di footer tabel: 12.906.667 × 18 = 232.320.006
    expect(screen.getByText("Rp 232.320.006")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────
// TEST: Validasi form
// ─────────────────────────────────────────
describe("Validasi form", () => {
  test("submit dengan OTR dikosongkan → hasil tidak tampil", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/harga otr/i), {
      target: { name: "otr", value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /hitung angsuran/i }));
    expect(screen.queryByText(/ringkasan perhitungan/i)).not.toBeInTheDocument();
  });

  test("OTR = 0 → hasil tidak tampil", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/harga otr/i), {
      target: { name: "otr", value: "0" },
    });
    fireEvent.click(screen.getByRole("button", { name: /hitung angsuran/i }));
    expect(screen.queryByText(/ringkasan perhitungan/i)).not.toBeInTheDocument();
  });

  test("DP 100% → hasil tidak tampil", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/down payment/i), {
      target: { name: "dp_pct", value: "100" },
    });
    fireEvent.click(screen.getByRole("button", { name: /hitung angsuran/i }));
    expect(screen.queryByText(/ringkasan perhitungan/i)).not.toBeInTheDocument();
  });

  test("kontrak_no dikosongkan → hasil tidak tampil", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/nomor kontrak/i), {
      target: { name: "kontrak_no", value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /hitung angsuran/i }));
    expect(screen.queryByText(/ringkasan perhitungan/i)).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────
// TEST: Bunga berubah sesuai jangka waktu
// ─────────────────────────────────────────
describe("Bunga otomatis sesuai tier jangka waktu", () => {
  test("jangka 12 bulan → bunga 12% tampil", () => {
    const { selectJangka, btnHitung } = setup();
    fireEvent.change(selectJangka(), { target: { name: "jangka", value: "12" } });
    fireEvent.click(btnHitung());
    expect(screen.getByText("12%")).toBeInTheDocument();
  });

  test("jangka 18 bulan → bunga 14% tampil", () => {
    const { selectJangka, btnHitung } = setup();
    fireEvent.change(selectJangka(), { target: { name: "jangka", value: "18" } });
    fireEvent.click(btnHitung());
    expect(screen.getByText("14%")).toBeInTheDocument();
  });

  test("jangka 36 bulan → bunga 16,5% tampil", () => {
    const { selectJangka, btnHitung } = setup();
    fireEvent.change(selectJangka(), { target: { name: "jangka", value: "36" } });
    fireEvent.click(btnHitung());
    expect(screen.getByText("16,5%")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────
// TEST: Reset hasil saat input diubah
// ─────────────────────────────────────────
describe("Hasil di-reset saat input diubah", () => {
  test("setelah hasil tampil, ubah OTR → hasil hilang", () => {
    const { inputOtr, btnHitung } = setup();

    // Hitung dulu
    fireEvent.click(btnHitung());
    expect(screen.getByText(/ringkasan perhitungan/i)).toBeInTheDocument();

    // Ubah input → hasil harus hilang
    fireEvent.change(inputOtr(), {
      target: { name: "otr", value: "300000000" },
    });
    expect(screen.queryByText(/ringkasan perhitungan/i)).not.toBeInTheDocument();
  });

  test("setelah hasil tampil, ubah jangka → hasil hilang", () => {
    const { selectJangka, btnHitung } = setup();
    fireEvent.click(btnHitung());
    expect(screen.getByText(/ringkasan perhitungan/i)).toBeInTheDocument();

    fireEvent.change(selectJangka(), { target: { name: "jangka", value: "24" } });
    expect(screen.queryByText(/ringkasan perhitungan/i)).not.toBeInTheDocument();
  });
});