// src/engine/keyboardShortcuts.ts - Pure Keyboard Navigation Engine for Desktop & Power Users

export type KeyboardShortcutAction =
  | 'CLOSE_MODAL_OR_SIDEBAR'
  | 'TOGGLE_SIDEBAR'
  | 'SWITCH_VIEW_KANBAN'
  | 'SWITCH_VIEW_EISENHOWER'
  | 'SWITCH_VIEW_135'
  | 'SWITCH_VIEW_IVY_LEE'
  | 'OPEN_NEW_TASK'
  | 'OPEN_FOCUS_TIMER'
  | 'OPEN_TOOLKIT'
  | 'OPEN_DIAGNOSTIC'
  | 'OPEN_BACKUP'
  | 'OPEN_SHORTCUTS_HELP'

export interface KeyboardShortcutItem {
  keyLabel: string
  actionName: string
  description: string
  category: 'Navigasi' | 'Papan Kerja' | 'Alat Fokus'
}

export const SHORTCUT_CATALOG: KeyboardShortcutItem[] = [
  {
    keyLabel: 'Tab',
    actionName: 'Buka / Tutup Bilah Menu',
    description: 'Menampilkan sidebar navigasi sebagai lapisan atas dengan latar redup',
    category: 'Navigasi',
  },
  {
    keyLabel: 'Esc',
    actionName: 'Tutup Modal / Menu',
    description: 'Menutup jendela aktif, dialog konfirmasi, atau bilah samping',
    category: 'Navigasi',
  },
  {
    keyLabel: '1',
    actionName: 'Papan Kanban',
    description: 'Pindah ke alur 3 kolom: Laci Tugas, Hari Ini, dan Selesai',
    category: 'Papan Kerja',
  },
  {
    keyLabel: '2',
    actionName: 'Matriks Eisenhower',
    description: 'Pindah ke kuadran prioritas Penting vs Mendesak',
    category: 'Papan Kerja',
  },
  {
    keyLabel: '3',
    actionName: 'Target 1-3-5',
    description: 'Pindah ke aturan alokasi 1 Besar, 3 Sedang, 5 Kecil',
    category: 'Papan Kerja',
  },
  {
    keyLabel: '4',
    actionName: 'Antrean Ivy Lee',
    description: 'Pindah ke antrean 6 tugas berurutan dengan mode fokus tunggal',
    category: 'Papan Kerja',
  },
  {
    keyLabel: 'N',
    actionName: 'Tambah Tugas Baru',
    description: 'Buka formulir pencatatan tugas kuliah atau proyek',
    category: 'Alat Fokus',
  },
  {
    keyLabel: 'F / Space',
    actionName: 'Timer Fokus Cepat',
    description: 'Mulai sprint fokus 10 menit (The 10-Minute Rule) atau Pomodoro',
    category: 'Alat Fokus',
  },
  {
    keyLabel: 'T',
    actionName: 'Panduan Teknik Belajar',
    description: 'Buka katalog 15 teknik anti-prokrastinasi & metode belajar',
    category: 'Alat Fokus',
  },
  {
    keyLabel: 'D',
    actionName: 'Diagnosis Gaya Belajar',
    description: 'Buka kuesioner refleksi & pemetaan kebiasaan mahasiswa',
    category: 'Alat Fokus',
  },
  {
    keyLabel: 'B',
    actionName: 'Cadangan & Profil',
    description: 'Buka riwayat konsistensi harian, avatar, dan cadangan lokal',
    category: 'Navigasi',
  },
  {
    keyLabel: '?',
    actionName: 'Bantuan Tombol Pintas',
    description: 'Tampilkan lembar contekan tombol keyboard ini kapan saja',
    category: 'Navigasi',
  },
]

export function isTypingInInputElement(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') return false
  const anyTarget = target as {
    tagName?: string
    isContentEditable?: boolean
    getAttribute?: (name: string) => string | null
  }
  const tag = (anyTarget.tagName ?? '').toLowerCase()
  const isContentEditable = Boolean(anyTarget.isContentEditable)
  const role = anyTarget.getAttribute ? anyTarget.getAttribute('role') : null

  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    isContentEditable ||
    role === 'textbox'
  )
}

export function resolveKeyboardAction(
  key: string,
  target: EventTarget | null,
  options?: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean; code?: string }
): KeyboardShortcutAction | null {
  // 1. Escape ALWAYS closes modals/sidebar, even if an input was focused
  if (key === 'Escape') {
    return 'CLOSE_MODAL_OR_SIDEBAR'
  }

  // 2. If user is currently typing in an input, do not trigger single-key actions
  if (isTypingInInputElement(target)) {
    return null
  }

  // Do not intercept browser hotkeys with Ctrl/Cmd (e.g. Ctrl+R reload)
  if (options?.ctrlKey || options?.metaKey) {
    return null
  }

  // 3. Tab: Toggle Sidebar Drawer (Matches canon 03-game-ui.md: Tab = sidebar)
  if (key === 'Tab') {
    return 'TOGGLE_SIDEBAR'
  }

  // 4. Board Views (1, 2, 3, 4)
  if (key === '1') return 'SWITCH_VIEW_KANBAN'
  if (key === '2') return 'SWITCH_VIEW_EISENHOWER'
  if (key === '3') return 'SWITCH_VIEW_135'
  if (key === '4') return 'SWITCH_VIEW_IVY_LEE'

  // 5. Action Keys (case-insensitive)
  const lowerKey = key.toLowerCase()
  if (lowerKey === 'n') return 'OPEN_NEW_TASK'
  if (lowerKey === 'f' || options?.code === 'Space') return 'OPEN_FOCUS_TIMER'
  if (lowerKey === 't') return 'OPEN_TOOLKIT'
  if (lowerKey === 'd') return 'OPEN_DIAGNOSTIC'
  if (lowerKey === 'b') return 'OPEN_BACKUP'
  if (key === '?' || (options?.shiftKey && key === '/')) return 'OPEN_SHORTCUTS_HELP'

  return null
}
