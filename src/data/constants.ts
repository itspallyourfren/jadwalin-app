// src/data/constants.ts - Constants for Jadwal-In! Mobile Companion
import type { CharacterId, HabitReminderConfig, Phase, TaskScale } from './types'

export const PHASES: readonly Phase[] = ['Pagi', 'Siang', 'Sore', 'Malam'] as const

export const TASK_SCALES: readonly TaskScale[] = ['Kecil', 'Sedang', 'Besar', 'Tugas Akhir'] as const

export const CLUTCH_85_THRESHOLD = 85

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
  'CHR-01': { name: 'Raden', major: 'Ilmu Komunikasi', avatar: '/assets/char/avatars/avatar_chr_01_raden.webp' },
  'CHR-02': { name: 'Nirmala', major: 'Manajemen Bisnis', avatar: '/assets/char/avatars/avatar_chr_02_nirmala.webp' },
  'CHR-03': { name: 'Celyn', major: 'Desain Komunikasi Visual', avatar: '/assets/char/avatars/avatar_chr_03_celyn.webp' },
  'CHR-04': { name: 'Fabian', major: 'Teknik Informatika', avatar: '/assets/char/avatars/avatar_chr_04_fabian.webp' },
  'CHR-05': { name: 'Divan', major: 'Akuntansi', avatar: '/assets/char/avatars/avatar_chr_05_divan.webp' },
  'CHR-06': { name: 'Sheva', major: 'Sastra Inggris', avatar: '/assets/char/avatars/avatar_chr_06_sheva.webp' },
  'CHR-07': { name: 'Bhumi', major: 'Psikologi', avatar: '/assets/char/avatars/avatar_chr_07_bhumi.webp' },
  'CHR-08': { name: 'Mahika', major: 'Kedokteran', avatar: '/assets/char/avatars/avatar_chr_08_mahika.webp' },
  'CHR-09': { name: 'Rendra', major: 'Ilmu Hukum', avatar: '/assets/char/avatars/avatar_chr_09_rendra.webp' },
  'CHR-10': { name: 'Rasheed', major: 'Robotika & AI', avatar: '/assets/char/avatars/avatar_chr_10_rasheed.webp' },
  'CHR-11': { name: 'Nindya', major: 'Arsitektur', avatar: '/assets/char/avatars/avatar_chr_11_nindya.webp' },
  'CHR-12': { name: 'Pia', major: 'Kimia Murni', avatar: '/assets/char/avatars/avatar_chr_12_pia.webp' },
}
