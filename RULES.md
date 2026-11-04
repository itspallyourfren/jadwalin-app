# Jadwal-In! Companion App — Project Rules & Engineering Guidelines

> **Prinsip Utama**: Aplikasi produktivitas nyata, tenang, elegan, human-centered, dan bebas jargon gamifikasi yang berlebihan untuk mahasiswa & profesional muda (17–30 tahun).

---

## 1. Git & Deployment Policy (PENTING)
- **Branch `development`**: Semua proses penulisan kode, penambahan fitur, perbaikan bug, dan pengujian dilakukan secara eksklusif di branch `development`.
- **Branch `main` (Production)**:
  - **DILARANG KERAS** melakukan `git push origin main` atau `git merge` ke `main` secara mandiri tanpa perintah eksplisit dari pengguna.
  - Push ke `main` hanya dieksekusi ketika pengguna secara tegas menyatakan *"deploy ke main"* atau *"rilis ke main"*.
- **Pesan Commit**: Menggunakan format Conventional Commits ringkas (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).

---

## 2. Hirarki Skala Tugas (Task Scale Policy)
- Skala tugas dibatasi secara tegas hanya pada **3 opsi**:
  1. **`Kecil`**: Estimasi pengerjaan $\le 15$ menit (tugas ringan, konfirmasi, email, administrasi).
  2. **`Sedang`**: Estimasi pengerjaan 15–45 menit (tugas mingguan, resume materi, latihan soal).
  3. **`Besar`**: Estimasi pengerjaan $> 45$ menit atau multi-sesi (makalah, draf bab skripsi, proyek besar).
- **Catatan**: Opsi `Tugas Akhir` **dihapus** karena terlalu abu-abu. Proyek skripsi/tugas akhir dipecah menjadi tugas-tugas berbobot *Kecil*, *Sedang*, atau *Besar*.

---

## 3. Ketentuan Pengalaman Tutorial (App Tour Guide)
- Menggunakan `driver.js` dengan proteksi interupsi ketat:
  - `allowClose: false` (tidak boleh tertutup jika pengguna menekan tombol ESC).
  - `overlayClickBehavior: 'none'` (klik di luar popover / pada backdrop hitam **TIDAK BOLEH** menutup tutorial agar pengguna tidak kehilangan konteks secara tidak sengaja).
  - `disableActiveInteraction: true` (elemen yang sedang disorot tidak boleh memicu navigasi atau submit saat tur aktif).
  - Pengguna hanya boleh berpindah langkah melalui tombol **`Lanjut →`**, **`← Kembali`**, dan **`Mulai Belajar! 🚀`** di akhir tur.

---

## 4. Standar Desain Mobile-First & Anti-Overflow
- **Ukuran Komponen di Layar Mobile (< 420px)**:
  - Komponen tidak boleh terlalu besar sehingga teks terpotong (*truncated awkwardly*), bocor (*overflow*), atau bertumpuk-tumpuk (*cramped stacking*).
  - Elemen navigasi header harus ringkas: tombol `+` di navbar atas disembunyikan pada mobile karena sudah tersedia tombol `+` utama di Floating Dock bawah.
  - Tab dan filter harus memiliki `overflow-x-auto no-scrollbar` dengan teks ringkas.
  - Tombol aksi pada kartu tugas (`TaskCard`) harus proporsional (`text-[10px] sm:text-xs`) dengan `truncate` pada konteks/mata kuliah.
  - Modal harus memiliki `max-h-[90vh]` atau `max-h-[92vh]` dengan `overflow-y-auto` yang mulus dan padding kompak (`p-3 sm:p-5`).

---

## 5. Offline-First & Keamanan Data Lokal
- 100% data tersimpan di perangkat lokal pengguna (Zustand + IndexedDB + LocalStorage).
- Tidak menggunakan API backend cloud untuk menyimpan data pribadi peserta.
- Pemulihan data disediakan via kode teks `JDW-MOB|...` dan file `.jadwalin.json`.
- Efek suara audio menggunakan pustaka ringan terkurasi (`uisfx`) dengan sakelar bisu (*mute toggle*) yang mudah dijangkau.

---

## 6. Verifikasi & Definition of Done (DoD)
- Setiap siklus perubahan kode **wajib** melalui:
  1. `npm test -- --run` (100% test suites Vitest lulus tanpa error).
  2. `npm run build` (`tsc -b && vite build` bersih tanpa error TypeScript).
