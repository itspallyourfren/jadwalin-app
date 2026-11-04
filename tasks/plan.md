# Rencana Implementasi Rombakan UI/UX & App Flow (`tasks/plan.md`)

Berdasarkan hasil `/grill-me` dan kesepakatan desain bersama user, dokumen ini memandu perombakan antarmuka **Jadwal-In! Mobile Companion** menjadi aplikasi produktivitas profesional (usia 17–30 tahun):

---

## Tahap 1: Fondasi Shadcn UI di `src/components/ui/`
- **File Target**:
  - `mobile/src/lib/utils.ts` (`cn` helper)
  - `mobile/src/components/ui/button.tsx` (Varian default, outline, ghost, icon, secondary)
  - `mobile/src/components/ui/badge.tsx` (Badge skala, waktu, dan status)
  - `mobile/src/components/ui/card.tsx` (Card, CardHeader, CardTitle, CardContent, CardFooter)
  - `mobile/src/components/ui/sheet.tsx` (Slide-over drawer untuk Sidebar Mobile)
  - `mobile/src/components/ui/dialog.tsx` (Modal dialog untuk form tugas & timer)

## Tahap 2: Komponen Sidebar Hybrid Responsif (`AppSidebar.tsx`)
- **File Target**:
  - `mobile/src/components/AppSidebar.tsx`
- **Spesifikasi**:
  - **Mobile**: Drawer sheet geser dari kiri, di-trigger dari tombol hamburger di navbar atas. Menutup otomatis saat item dipilih atau klik overlay.
  - **Desktop / Tablet**: Persistent sidebar di sisi kiri yang collapsible (`w-64` ke icon rail `w-16`) dengan toggle tombol collapse di bawah/atas.
  - **Daftar Menu**:
    1. *Papan Kerja*: Kanban, Matriks Eisenhower, Target 1-3-5, Antrean Ivy Lee
    2. *Ruang Fokus*: Timer Fokus (10m / Pomodoro / Flow), Panduan Teknik
    3. *Data & Pengaturan*: Pengingat Notifikasi HP, Cadangan & Pemulihan Lokal
    4. *Profil Peserta*: Pilihan avatar karakter & status komitmen pelatihan

## Tahap 3: Perombakan Navbar Atas & Floating Switcher Dock Bawah
- **File Target**:
  - `mobile/src/components/TopHeaderBar.tsx` (Hanya Hamburger + Judul View + Streak + Lonceng Notif. Tanpa tombol teks "Tambah Tugas" yang repetitif).
  - `mobile/src/components/FloatingSwitcherDock.tsx` (Pulau mengambang di tengah bawah: Tombol `+` di tengah, Tombol Pilihan Papan di kiri, Tombol Timer Fokus di kanan).

## Tahap 4: Penyederhanaan Copywriting & Tata Letak Papan
- **File Target**:
  - `mobile/src/components/BoardViewContainer.tsx` & `mobile/src/components/TaskCard.tsx`
  - `mobile/src/components/TaskWorkspaceModal.tsx` & `mobile/src/components/FocusTimerModal.tsx`
  - `mobile/src/components/NotificationAndRecoveryModal.tsx`
- **Spesifikasi**:
  - Bahasa produktivitas nyata, tenang, elegan untuk mahasiswa & pekerja muda 17–30 tahun.
  - Mengurangi teks mikro dan label yang redundan.
  - Kartu tugas tetap rapi dengan collapsible subtasks, tombol aksi instan, dan penanda *Aturan 85%*.

## Tahap 5: Verifikasi Build, Test Suite, & DoD
- Menjalankan `npm test -- --run` dan `npm run build` (`tsc -b && vite build`) tanpa error.
- Menguji interaksi di mode desktop penuh dan mode Frame HP (412×915).
