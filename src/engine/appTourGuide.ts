// src/engine/appTourGuide.ts - Driver.js Interactive Onboarding & Feature Tour
import { driver, type Driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function startAppTutorialTour(onFinish?: () => void): Driver {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: false,
    overlayClickBehavior: 'none',
    disableActiveInteraction: true,
    showButtons: ['next', 'previous'],
    overlayColor: 'rgba(30, 25, 21, 0.75)',
    nextBtnText: 'Lanjut →',
    prevBtnText: '← Kembali',
    doneBtnText: 'Mulai Belajar! 🚀',
    onDestroyStarted: () => {
      onFinish?.()
      driverObj.destroy()
    },
    steps: [
      {
        element: '#tutorial-board-container',
        popover: {
          title: '📋 Meja Kerja & Papan Tugas',
          description:
            'Ini adalah meja belajarmu. Tugas aktif berada di "Hari Ini", sedangkan tugas lainnya tersimpan aman di "Laci Tugas" agar pikiranmu tidak penuh.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#tutorial-time-filters',
        popover: {
          title: '⏰ Filter Blok Waktu',
          description:
            'Pilah tugas berdasarkan jam energimu (Pagi, Siang, Sore, Malam). Kerjakan tugas berat saat konsentrasimu berada di puncaknya.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tutorial-add-task-btn',
        popover: {
          title: '➕ Tambah Target Tugas',
          description:
            'Klik tombol ini untuk mencatat tugas baru. Kamu bisa mengaktifkan dekomposisi otomatis agar tugas raksasa langsung dipecah menjadi langkah-langkah kecil.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#tutorial-framework-dock',
        popover: {
          title: '🗂️ Pilihan Papan Kerja',
          description:
            'Ganti cara pandang tugasmu kapan saja: Papan Kanban, Matriks Eisenhower (Penting vs Mendesak), Target 1-3-5, atau Antrean Ivy Lee.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#tutorial-focus-timer-btn',
        popover: {
          title: '⏱️ Timer Fokus & Rehat',
          description:
            'Mulai sesi belajar bebas distraksi! Dilengkapi pancingan 10 menit, hitungan mundur 5 detik, serta Pomodoro siklus fokus dan rehat.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#tutorial-sidebar-trigger',
        popover: {
          title: '💡 Menu & Panduan Teknik',
          description:
            'Buka menu navigasi untuk melihat katalog teknik sains perilaku, mengatur pengingat HP, atau mengulang diagnosis profil prokrastinasimu kapan saja.',
          side: 'bottom',
          align: 'start',
        },
      },
    ],
  })

  driverObj.drive()
  return driverObj
}
