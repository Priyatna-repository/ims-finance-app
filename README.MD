# IMS Finance — Kalkulator Kredit Kendaraan

Aplikasi React untuk menghitung angsuran kredit kendaraan berdasarkan soal developer PT. Inovasi Mitra Sejati.

---

## Struktur Proyek

```
ims-finance-app/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   ├── FormKredit.jsx      # Form input data kontrak
│   │   ├── HasilKalkulasi.jsx  # Kartu ringkasan hasil
|   |   ├── tabSoal2.jsx   # Tempo
|   |   ├── tabSoal3.jsx   # Denda
│   │   └── TabelJadwal.jsx     # Tabel jadwal angsuran
│   ├── utils/
│   │   └── kreditUtils.js      # Semua fungsi kalkulasi (murni JS)
│   ├── __tests__/
│   │   ├── kreditUtils.test.js # Unit test fungsi kalkulasi
│   │   └── App.test.jsx        # Integration test UI
│   ├── App.jsx                 # Komponen utama
│   ├── App.css                 # Styling
│   └── index.js                # Entry point
└── package.json
```

---

## Cara Menjalankan di VSCode

### 1. Pastikan Node.js sudah terinstall

Buka terminal dan cek:
```bash
node --version   # minimal v16
npm --version
```

Jika belum ada, download dari https://nodejs.org

### 2. Buka folder proyek di VSCode

```bash
# Di terminal, masuk ke folder proyek
cd ims-finance-app

# Buka di VSCode
code .
```

Atau: **File → Open Folder** → pilih folder `ims-finance-app`

### 3. Install dependencies

Buka terminal di VSCode (`Ctrl+backtick`) lalu:
```bash
npm install
```

Tunggu hingga selesai (sekitar 1–2 menit, akan membuat folder `node_modules`).

### 4. Jalankan aplikasi

```bash
npm start
```

Browser akan otomatis terbuka di **http://localhost:3000**

---

## Cara Menjalankan Testing

### Jalankan semua test (mode watch)
```bash
npm test
```
Tekan `a` untuk jalankan semua test, `q` untuk keluar.

### Jalankan sekali + lihat coverage
```bash
npm run test:coverage
```

Output contoh yang diharapkan:
```
PASS src/__tests__/kreditUtils.test.js
PASS src/__tests__/App.test.jsx

Test Suites: 2 passed, 2 total
Tests:       40+ passed
Snapshots:   0 total
```

---

## Logika Perhitungan (sesuai flowchart soal)

```
OTR = 240.000.000
DP  = 20% × 240.000.000 = 48.000.000
Pokok Utang = 240.000.000 - 48.000.000 = 192.000.000

Jangka = 18 bulan → masuk range >12 dan ≤24 → Bunga = 14%

Angsuran/bulan = (Pokok + Pokok × Bunga) / Jangka
               = (192.000.000 + 192.000.000 × 0,14) / 18
               = 218.880.000 / 18
               = 12.906.667
```

---

## Tier Bunga (sesuai flowchart)

| Jangka Waktu     | Bunga  |
|------------------|--------|
| ≤ 12 bulan       | 12%    |
| 13 – 24 bulan    | 14%    |
| > 24 bulan       | 16,5%  |

---

## VSCode Extensions yang Disarankan

- **ES7+ React/Redux/React-Native snippets** — snippet shortcut React
- **Prettier** — auto format kode
- **ESLint** — deteksi error kode
- **Auto Rename Tag** — rename JSX tag otomatis

Install via Extensions panel (`Ctrl+Shift+X`), cari nama di atas.

## 🚀 Live Demo
🔗 https://calc-ims-finance.netlify.app/
