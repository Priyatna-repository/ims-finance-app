import React from "react";

/**
 * FormKredit — komponen form input data kredit.
 *
 * Props:
 * @param {Object}   form       - Nilai-nilai form saat ini
 * @param {Object}   errors     - Pesan error per field (key = nama field)
 * @param {Function} onChange   - Handler perubahan input
 * @param {Function} onSubmit   - Handler saat tombol "Hitung" diklik
 */
function FormKredit({ form, errors, onChange, onSubmit }) {
  return (
    <div className="card">
      <h2 className="section-title">Data Kontrak</h2>

      {/* Grid dua kolom untuk field input */}
      <div className="form-grid">

        {/* Nomor Kontrak */}
        <div className="field">
          <label htmlFor="kontrak_no">Nomor Kontrak</label>
          <input
            id="kontrak_no"
            name="kontrak_no"
            type="text"
            placeholder="contoh: AGR00001"
            value={form.kontrak_no}
            onChange={onChange}
            className={errors.kontrak_no ? "input-error" : ""}
          />
          {/* Tampilkan pesan error jika ada */}
          {errors.kontrak_no && (
            <span className="error-msg">{errors.kontrak_no}</span>
          )}
        </div>

        {/* Nama Klien */}
        <div className="field">
          <label htmlFor="client_name">Nama Klien</label>
          <input
            id="client_name"
            name="client_name"
            type="text"
            placeholder="contoh: SUGUS"
            value={form.client_name}
            onChange={onChange}
            className={errors.client_name ? "input-error" : ""}
          />
          {errors.client_name && (
            <span className="error-msg">{errors.client_name}</span>
          )}
        </div>

        {/* Harga OTR */}
        <div className="field">
          <label htmlFor="otr">Harga OTR (Rp)</label>
          <input
            id="otr"
            name="otr"
            type="number"
            placeholder="contoh: 240.000.000"
            value={form.otr}
            onChange={onChange}
            min="1"
            className={errors.otr ? "input-error" : ""}
          />
          {errors.otr && <span className="error-msg">{errors.otr}</span>}
        </div>

        {/* Down Payment */}
        <div className="field">
          <label htmlFor="dp_pct">Down Payment (%)</label>
          <input
            id="dp_pct"
            name="dp_pct"
            type="number"
            placeholder="contoh: 20"
            value={form.dp_pct}
            onChange={onChange}
            min="0"
            max="99"
            className={errors.dp_pct ? "input-error" : ""}
          />
          {errors.dp_pct && (
            <span className="error-msg">{errors.dp_pct}</span>
          )}
        </div>

        {/* Jangka Waktu — dropdown sesuai tier bunga */}
        <div className="field">
          <label htmlFor="jangka">Jangka Waktu</label>
          <select
            id="jangka"
            name="jangka"
            value={form.jangka}
            onChange={onChange}
            className={errors.jangka ? "input-error" : ""}
          >
            {/* Tier 1: ≤ 12 bulan → bunga 12% */}
            <optgroup label="Bunga 12% (≤ 12 bulan)">
              <option value="6">6 bulan</option>
              <option value="12">12 bulan</option>
            </optgroup>
            {/* Tier 2: 13–24 bulan → bunga 14% */}
            <optgroup label="Bunga 14% (13–24 bulan)">
              <option value="18">18 bulan (1,5 tahun)</option>
              <option value="24">24 bulan (2 tahun)</option>
            </optgroup>
            {/* Tier 3: > 24 bulan → bunga 16,5% */}
            <optgroup label="Bunga 16,5% (> 24 bulan)">
              <option value="36">36 bulan (3 tahun)</option>
              <option value="48">48 bulan (4 tahun)</option>
              <option value="60">60 bulan (5 tahun)</option>
            </optgroup>
          </select>
          {errors.jangka && (
            <span className="error-msg">{errors.jangka}</span>
          )}
        </div>

        {/* Tanggal Mulai Angsuran */}
        <div className="field">
          <label htmlFor="start_date">Tanggal Mulai Angsuran</label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            value={form.start_date}
            onChange={onChange}
            className={errors.start_date ? "input-error" : ""}
          />
          {errors.start_date && (
            <span className="error-msg">{errors.start_date}</span>
          )}
        </div>
      </div>

      {/* Tombol submit */}
      <button className="btn-primary" onClick={onSubmit}>
        Hitung Angsuran
      </button>
    </div>
  );
}

export default FormKredit;