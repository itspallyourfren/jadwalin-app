// src/data/constants.ts - Constants for Jadwal-In! Mobile Companion
import type { CharacterId, HabitReminderConfig, KanbanStatus, Phase, TaskScale } from './types'

export const PHASES: readonly Phase[] = ['Pagi', 'Siang', 'Sore', 'Malam'] as const

export const TASK_SCALES: readonly TaskScale[] = ['Kecil', 'Sedang', 'Besar', 'Tugas Akhir'] as const

export const CLUTCH_85_THRESHOLD = 85

export interface WorkflowStageConfig {
  id: KanbanStatus
  label: string
  shortLabel: string
  description: string
  colorBadge: string
  borderClass: string
  dotColor: string
}

export const WORKFLOW_STAGES: Record<KanbanStatus, WorkflowStageConfig> = {
  BACKLOG: {
    id: 'BACKLOG',
    label: 'Laci / Antrean',
    shortLabel: 'Laci',
    description: 'Tugas tercatat tapi belum mulai dikerjakan',
    colorBadge: 'bg-[#F2ECE1] text-[#5C5148]',
    borderClass: 'border-[#E2D9C8]',
    dotColor: '#8C7E72',
  },
  RESEARCH: {
    id: 'RESEARCH',
    label: 'Riset & Bahan',
    shortLabel: 'Riset',
    description: 'Kumpul materi, baca jurnal, cari referensi & outline',
    colorBadge: 'bg-[#EBF1FF] text-[#2B59C3]',
    borderClass: 'border-[#BDD4F8]',
    dotColor: '#2B59C3',
  },
  IN_PROGRESS: {
    id: 'IN_PROGRESS',
    label: 'Pengerjaan Aktif',
    shortLabel: 'Dikerjakan',
    description: 'Sedang fokus eksekusi (ngetik naskah, hitung, ngoding)',
    colorBadge: 'bg-[#FEF3E2] text-[#B86B14]',
    borderClass: 'border-[#FAD6A5]',
    dotColor: '#B86B14',
  },
  REVIEW: {
    id: 'REVIEW',
    label: 'Review & Revisi',
    shortLabel: 'Review',
    description: 'Proofreading, asistensi dosen, atau periksa catatan',
    colorBadge: 'bg-[#F5EBFF] text-[#6B21A8]',
    borderClass: 'border-[#E0C6FF]',
    dotColor: '#6B21A8',
  },
  BLOCKED: {
    id: 'BLOCKED',
    label: 'Tersendat / Butuh Solusi',
    shortLabel: 'Tersendat',
    description: 'Sedang buntu, bingung langkah, atau butuh bantuan',
    colorBadge: 'bg-[#FDECE8] text-[#C8432B]',
    borderClass: 'border-[#F8BDB4]',
    dotColor: '#C8432B',
  },
  COMPLETED: {
    id: 'COMPLETED',
    label: 'Selesai & Kumpul',
    shortLabel: 'Selesai',
    description: 'Tugas rampung dan siap dikumpulkan / sudah diserahkan',
    colorBadge: 'bg-[#E7F6EE] text-[#1F7A4C]',
    borderClass: 'border-[#A3E5C2]',
    dotColor: '#1F7A4C',
  },
}

export const WORKFLOW_STAGE_ORDER: readonly KanbanStatus[] = [
  'BACKLOG',
  'RESEARCH',
  'IN_PROGRESS',
  'REVIEW',
  'COMPLETED',
  'BLOCKED',
] as const

export const ONE_THREE_FIVE_LIMITS = {
  LARGE_1: 1,
  MEDIUM_3: 3,
  SMALL_5: 5,
} as const

export const IVY_LEE_MAX_ITEMS = 6

export const TIMER_DURATION_SECONDS = {
  TEN_MINUTE_RULE: 10 * 60,
  POMODORO_25_5: 25 * 60,
  POMODORO_50_10: 50 * 60,
  FLOW_SPRINT_45: 45 * 60,
  QUICK_REST_5: 5 * 60,
} as const

export const DEFAULT_HABIT_REMINDER_CONFIG: HabitReminderConfig = {
  enabled: true,
  morningTime: '08:00',
  morningAnchor: 'Setelah sarapan / membuka laptop pagi',
  afternoonTime: '13:30',
  afternoonAnchor: 'Setelah makan siang & istirahat sejenak',
  eveningTime: '20:00',
  eveningAnchor: 'Sebelum tidur (Susun 6 Prioritas Ivy Lee untuk besok)',
  deadlineRemind24h: true,
  deadlineRemind2h: true,
}

export const CHARACTER_PROFILES: Record<CharacterId, { name: string; major: string; avatar: string }> = {
  'CHR-01': { name: 'Raden', major: 'Ilmu Komunikasi', avatar: './assets/char/avatars/avatar_chr_01_raden.webp' },
  'CHR-02': { name: 'Nirmala', major: 'Manajemen Bisnis', avatar: './assets/char/avatars/avatar_chr_02_nirmala.webp' },
  'CHR-03': { name: 'Celyn', major: 'Desain Komunikasi Visual', avatar: './assets/char/avatars/avatar_chr_03_celyn.webp' },
  'CHR-04': { name: 'Fabian', major: 'Teknik Informatika', avatar: './assets/char/avatars/avatar_chr_04_fabian.webp' },
  'CHR-05': { name: 'Divan', major: 'Akuntansi', avatar: './assets/char/avatars/avatar_chr_05_divan.webp' },
  'CHR-06': { name: 'Sheva', major: 'Sastra Inggris', avatar: './assets/char/avatars/avatar_chr_06_sheva.webp' },
  'CHR-07': { name: 'Bhumi', major: 'Psikologi', avatar: './assets/char/avatars/avatar_chr_07_bhumi.webp' },
  'CHR-08': { name: 'Mahika', major: 'Kedokteran', avatar: './assets/char/avatars/avatar_chr_08_mahika.webp' },
  'CHR-09': { name: 'Rendra', major: 'Ilmu Hukum', avatar: './assets/char/avatars/avatar_chr_09_rendra.webp' },
  'CHR-10': { name: 'Rasheed', major: 'Robotika & AI', avatar: './assets/char/avatars/avatar_chr_10_rasheed.webp' },
  'CHR-11': { name: 'Nindya', major: 'Arsitektur', avatar: './assets/char/avatars/avatar_chr_11_nindya.webp' },
  'CHR-12': { name: 'Pia', major: 'Kimia Murni', avatar: './assets/char/avatars/avatar_chr_12_pia.webp' },
}
