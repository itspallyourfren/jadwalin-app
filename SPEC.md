# SPEC.md — Jadwal-In! Mobile (Human-Centered Kanban & Study Technique Toolkit)

## 1. Filosofi Produk & Hirarki Fitur (`/designer` & `/anti-vibecoding`)
**Jadwal-In! Mobile (`d:\JadwalIn\mobile`)** adalah aplikasi *task tracker* dan *productivity companion* nyata untuk peserta pelatihan.
- **Component-First, Game Assets as Tasteful Accents**: Karena ini adalah aplikasi produktivitas harian, **90% antarmuka menggunakan komponen UI bersih, cepat, dan fungsional**. Aset visual dari game digunakan secara terukur sebagai **pelengkap identitas**:
  1. **Logo Resmi (`/assets/logo/logo_jadwalin.webp`)** pada Header aplikasi, Splash/PWA icon, dan kartu komitmen.
  2. **Ilustrasi Kartu Teknik (`/assets/cards/tek_xx_*.webp`)** sebagai *thumbnail* pendamping saat memilih mode timer atau membuka panduan cara pakai teknik.
  3. **Avatar Karakter & Anna (`/assets/char/avatars/...`)** sebagai badge profil peserta (sinkron dengan kode `JI-R1` dari game) dan *micro-tip* singkat yang tidak memakan ruang layar.
- **Tanpa Aturan Game yang Membatasi**: Tidak ada bar Energi/Stres buatan atau kunci *Beban Mental maks 6* yang menghalangi pengguna menambah tugas.

---

## 2. Prioritas Kurasi Teknik (Agar Aplikasi Fokus & Tidak Membingungkan)

Mengikuti **Hick's Law** dan **Tesler's Law** (*Progressive Disclosure*), 35 teknik dari [`teknik.json`](file:///d:/JadwalIn/game/src/data/teknik.json) dibagi menjadi **3 Tingkat Prioritas (Tier)** agar layar utama tetap bersih seperti aplikasi produktivitas modern:

### Tier 1: Fitur Utama Harian (Langsung Tampil di Layar Utama — 10 Teknik Inti)
Teknik yang paling sering dipakai sehari-hari untuk mengelola daftar tugas dan memulai kerja:

| Prioritas | Teknik Game | Wujud Komponen UI Utama |
| :---: | :--- | :--- |
| **1** | **Kanban Focus (`TEK_30`)** | **Mode Papan Utama (3 Kolom)**: `Laci Tugas` (Rencana) → `Fokus Hari Ini` (Dikerjakan) → `Selesai`. |
| **2** | **Matriks Eisenhower (`TEK_25`)** | **Mode Papan Kuadran 2×2**: Memilah tugas berdasarkan *Penting vs Mendesak* (*Kerjakan Segera*, *Jadwalkan*, *Cicil Cepat*, *Simpan Nanti*). |
| **3** | **The 1-3-5 Rule (`TEK_11`)** | **Mode Penyusun Target Harian**: Slot terstruktur untuk memilih **1 Tugas Besar**, **3 Tugas Sedang**, dan **5 Tugas Kecil** hari ini. |
| **4** | **Ivy Lee Method (`TEK_28`)** | **Mode Antrean 6 Prioritas**: Mengurutkan maksimal **6 tugas utama (#1–#6)** dengan opsi *Fokus Tunggal #1*. |
| **5** | **Eat That Frog! (`TEK_09`)** | **Pin "Prioritas Pagi Terberat"**: Menandai 1 tugas paling menantang di urutan teratas agar beres duluan di pagi hari. |
| **6** | **Time Blocking (`TEK_12`) & Biological Prime Time (`TEK_33`)** | **Filter & Tag Blok Waktu (`Pagi` · `Siang` · `Sore` · `Malam`)** pada kartu tugas sesuai jam fokus terbaik pengguna. |
| **7** | **Pomodoro Technique (`TEK_01`)** | **Timer Fokus Utama (25/5 & 50/10)** terintegrasi dengan tugas yang sedang dikerjakan. |
| **8** | **10-Minute Rule (`TEK_08`) + 5-Second Rule (`TEK_31`)** | **Tombol "Pancingan Mulai 10 Menit"** (diawali hitung mundur `5-4-3-2-1` untuk mendobrak rasa malas mulai). |
| **9** | **Task Chunking (`TEK_02`) + Pareto 80/20 (`TEK_10`)** | **Sub-Checklist Langkah Kecil** di dalam tugas + tanda bintang untuk **20% langkah inti paling berdampak**. |
| **10** | **The 85% Rule (`TEK_06`)** | **Tombol "Selesaikan di 85% (Anti-Perfeksionis)"** yang otomatis muncul saat progres/sub-langkah mencapai $\ge 85\%$. |

---

### Tier 2: Pendukung Kontekstual (Muncul Saat Dibutuhkan di Dalam Timer / Detail Tugas)
Tidak membebani layar utama; hanya muncul pada konteks yang tepat:

| Konteks Muncul | Teknik Game | Wujud Fitur Kontekstual |
| :--- | :--- | :--- |
| **Header & Notifikasi** | **Seinfeld Strategy (`TEK_05`) & Habit Stacking (`TEK_35`)** | Indikator **Rantai Konsistensi Harian (Streak)** di bar atas + **Pengingat Notifikasi HP** yang dikaitkan dengan rutinitas harian (*Pagi/Siang/Sore/Malam* & H-1/H-2 jam *deadline*). |
| **Saat Membuka Modal Timer** | **Ulysses Pact (`TEK_07`), Temptation Bundling (`TEK_03`), & Flow Sprint (`TEK_29`)** | Checklist singkat sebelum timer jalan (*"Jauhkan HP"* & *"Siapkan kopi/playlist"*) serta opsi **Stopwatch Flow State** tanpa interupsi bel. |
| **Saat Buntu di Tengah Tugas** | **Structured Procrastination (`TEK_26`) & Interleaving (`TEK_19`)** | Tombol **"Ganti Selingan Produktif"** untuk beralih sejenak ke tugas lain yang lebih ringan/berbeda topik di meja. |
| **Di Detail Tugas Besar** | **WOOP (`TEK_13`), Premortem (`TEK_14`), & Hukum Parkinson (`TEK_34`)** | Bagian lipat (*collapsible*) untuk mencatat **Antisipasi Hambatan (Jika–Maka)** dan memasang **Target Selesai Pribadi** lebih awal dari *deadline* asli. |

---

### Tier 3: Alat Bantu Belajar Materi & Katalog Kartu (Khusus Tugas Belajar)
Hanya muncul ketika pengguna memilih jenis tugas **"Belajar / Materi Kuliah"** atau membuka **Katalog Kartu Teknik**:
- **Checklist Baca `SQ3R` (`TEK_17`)**: *Survey, Question, Read, Recite, Review*.
- **Catatan `Metode Feynman` (`TEK_15`) & `Blurting` (`TEK_18`)**: Lembar latihan menjelaskan ulang materi dengan bahasa sendiri.
- **Kartu Tanya-Jawab `Active Recall & Leitner 3-Kotak` (`TEK_16`, `TEK_20`)**: Catatan flashcard ringkas di dalam tugas belajar.
- **Galeri Referensi 35 Kartu Teknik**: Menampilkan ilustrasi kartu asli dari game (`/assets/cards/tek_xx_*.webp`) beserta tips penerapannya di dunia nyata.

---

## 3. Sistem Desain: `/designer` & `/anti-vibecoding` Blueprint

### A. Estetika: *Warm Tactile Editorial Planner*
- **Palet Kertas Hangat & Tinta Kontras Tinggi (WCAG AA)**:
  - Canvas: `#FAF7F2` (Warm Alabaster Paper)
  - Column Tray: `#F2ECE1` (Sandstone Tray)
  - Card Surface: `#FFFDF9` dengan border `#E2D9C8` (`1px solid`)
  - Primary Ink: `#1E1915` (Deep Espresso, kontras $> 13:1$)
  - Secondary Ink: `#5C5148` (Warm Umber)
  - Primary Accent: `#2C4A3E` (Deep Forest) & `#D4532F` (Warm Terracotta untuk aksi fokus/timer)
  - Badge Skala Tugas: `Kecil` (`#2B59C3`), `Sedang` (`#B86B14`), `Besar` (`#C8432B`), `Tugas Akhir` (`#6B21A8`), `Selesai / 85%` (`#1F7A4C`).
- **Bebas Klise AI (`/anti-vibecoding`)**: Tanpa gradien ungu-biru, tanpa *glassmorphism* blur, tanpa `border-l-4` kasar di setiap kartu, dan tanpa emoji berlebihan. Menggunakan font **Plus Jakarta Sans** dan ikon SVG `lucide-react` (`strokeWidth={1.75}`).

### B. Responsif Multi-Perangkat + Mode Simulasi HP di Desktop
1. **Layar Mobile (`< 768px`) & Mode Simulasi HP (`412×915px`)**: Navigasi bawah ramah jempol (*thumb-zone* $\ge 48\text{px}$), perpindahan kolom Kanban menggunakan *Segmented Pill Switcher*.
2. **Layar Tablet & Desktop (`>= 768px`)**: Menampilkan 3 kolom Kanban berdampingan penuh, Kuadran 2×2 Eisenhower yang lega, dan panel Timer Fokus di sisi samping.
3. **Sakelar Testing Developer di Desktop**: Di bar atas terdapat tombol **`Mode HP (412×915)`** ↔ **`Mode Layar Penuh`** beserta simulator *push notification banner* HP agar semua fitur mobile bisa dites langsung dari laptop.

### C. Penyimpanan Lokal & 3 Lapis Recovery (Tanpa Cloud)
1. **Auto-Mirror `localStorage` + `IndexedDB`** di HP peserta.
2. **Kode Teks Pemulihan (`JDW-MOB|...`)** ber-checksum untuk disalin ke WhatsApp/Catatan HP.
3. **File Backup (`.jadwalin.json`)** + dukungan impor kode komitmen **`JI-R1|...`** dari game utama ([`trainingCode.ts`](file:///d:/JadwalIn/game/src/engine/trainingCode.ts)).
