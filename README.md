# Jadwal-In! Companion App (Pocket Planner)

> **Media Pendamping Intervensi Psikologis & Manajemen Waktu Mahasiswa**  
> Mengatasi prokrastinasi akademik dengan kerangka produktivitas teruji, dekomposisi tugas otomatis, dan timer fokus multi-fase.
> 
> 🌐 **Live Web App**: [https://app.jadwalin.xyz](https://app.jadwalin.xyz) (atau [https://itspallyourfren.github.io/jadwalin-app/](https://itspallyourfren.github.io/jadwalin-app/))

---

## 🚀 Fitur Utama

1. **Multi-Framework Board**:
   - **Papan Kanban Fleksibel**: Pilihan alur ringkas (3 Kolom Utama), alur skripsi detail (5 Tahap dengan auto-ciutkan kolom kosong), kategori domain tugas, dan tampilan **Tabel Spreadsheet** dengan sel *dropdown condition* interaktif.
   - **Matriks Eisenhower**: Kuadran Penting vs Mendesak untuk menyaring prioritas.
   - **Target 1-3-5**: Pembagian kapasitas harian terukur (1 Besar, 3 Sedang, 5 Kecil).
   - **Antrean Ivy Lee**: Mode fokus tunggal #1 dengan maksimal 6 prioritas terurut.

2. **Diagnosis Gaya Belajar & Prokrastinasi**:
   - Skrining kendala belajar personal & butir psikometri MAPS-15 (teracak dan bebas jargon).
   - Personalisasi otomatis papan kerja dan rekomendasi teknik belajar.

3. **Dekomposisi Tugas Adaptif**:
   - Memecah tugas kuliah/skripsi besar menjadi langkah pembuka < 2 menit (*Zeigarnik Starter*) dan 20% langkah inti berdampak 80% (*Prinsip Pareto*).

4. **Ruang Fokus & Pomodoro Multi-Fase**:
   - Siklus fleksibel: Waktu Belajar (15-60 menit), Istirahat Singkat (3-10 menit), dan Rehat Panjang.
   - Indikator visual audio & mode penahan distraksi (*Ulysses Pact*).

5. **Offline-First & Keamanan Data Lokal**:
   - 100% data tersimpan di perangkat pemain (IndexedDB + localStorage) tanpa ketergantungan server cloud.
   - Ekspor/impor cadangan file `.json` dan kode pemulihan teks portabel.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript (.tsx)
- **Bundler & Tooling**: Vite 6
- **Styling**: Tailwind CSS v4 (Student Notebook & School Utility Aesthetic)
- **Animations**: Framer Motion
- **State Management**: Zustand (persisted)
- **Mobile Runtime**: Capacitor 7 (Android PWA / Native Shell)
- **Testing**: Vitest (100% pass)

---

## 📦 Menjalankan Secara Lokal

```bash
# Clone repository
git clone https://github.com/itspallyourfren/jadwalin-app.git
cd jadwalin-app

# Install dependensi
npm install

# Jalankan server pengembangan lokal (host port 5174)
npm run dev

# Jalankan pengujian unit & integrasi
npm test

# Build untuk rilis produksi
npm run build
```

---

## 📱 Build Android (Capacitor)

```bash
# Sinkronkan aset build ke folder android
npm run cap:sync

# Buka project di Android Studio
npm run cap:android
```
