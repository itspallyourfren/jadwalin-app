// src/components/NotificationAndRecoveryModal.tsx - Habit Stacking Reminders + 3-Layer Local Recovery & Game Commitment Import
import React, { useEffect, useState } from 'react'
import {
  BellRing,
  Check,
  Copy,
  Download,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import { CHARACTER_PROFILES } from '../data/constants'
import { buildUpcomingNotificationSchedule } from '../engine/notificationScheduler'
import {
  decodeGameCommitmentCode,
  decodeMobileRecoveryCode,
  encodeMobileRecoveryCode,
  validateJsonBackupString,
} from '../engine/recoveryCodec'
import { requestDeviceNotificationPermission, syncDeviceNotifications } from '../store/idbMirror'
import { useTrackerStore } from '../store/useTrackerStore'
import type { CharacterId } from '../data/types'

type NotificationAndRecoveryModalProps = {
  initialTab: 'NOTIFICATION' | 'RECOVERY'
  onClose: () => void
}

export const NotificationAndRecoveryModal: React.FC<NotificationAndRecoveryModalProps> = ({
  initialTab,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'NOTIFICATION' | 'RECOVERY'>(initialTab)

  const participantName = useTrackerStore((s) => s.participantName)
  const characterId = useTrackerStore((s) => s.characterId)
  const setParticipantProfile = useTrackerStore((s) => s.setParticipantProfile)
  const tasks = useTrackerStore((s) => s.tasks)
  const reminderConfig = useTrackerStore((s) => s.reminderConfig)
  const updateReminderConfig = useTrackerStore((s) => s.updateReminderConfig)
  const triggerSampleNotification = useTrackerStore((s) => s.triggerSampleNotification)
  const exportBackupPayload = useTrackerStore((s) => s.exportBackupPayload)
  const importBackupPayload = useTrackerStore((s) => s.importBackupPayload)
  const importGameCommitment = useTrackerStore((s) => s.importGameCommitment)
  const lastBackupSyncedIso = useTrackerStore((s) => s.lastBackupSyncedIso)

  const [permStatus, setPermStatus] = useState<string>('prompt')
  const [scheduledCount, setScheduledCount] = useState<number>(0)

  const [nameInput, setNameInput] = useState(participantName)
  const [selectedChar, setSelectedChar] = useState<CharacterId>(characterId)

  const [copiedRecoveryCode, setCopiedRecoveryCode] = useState(false)
  const [pasteRecoveryInput, setPasteRecoveryInput] = useState('')
  const [pasteGameCodeInput, setPasteGameCodeInput] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  useEffect(() => {
    void syncDeviceNotifications(tasks, reminderConfig).then((res) => {
      setPermStatus(res.permissionStatus)
      setScheduledCount(res.scheduledCount)
    })
  }, [tasks, reminderConfig])

  const upcomingSlots = buildUpcomingNotificationSchedule(tasks, reminderConfig)

  const handleRequestPermission = async () => {
    const status = await requestDeviceNotificationPermission()
    setPermStatus(status)
    const synced = await syncDeviceNotifications(tasks, reminderConfig)
    setScheduledCount(synced.scheduledCount)
    triggerSampleNotification(
      'Notifikasi Jadwal-In! Aktif',
      'Pengingat tugas dan Habit Stacking harianmu sudah terjadwal di perangkat ini.'
    )
  }

  const handleCopyRecoveryCode = async () => {
    const code = encodeMobileRecoveryCode(exportBackupPayload())
    try {
      await navigator.clipboard.writeText(code)
      setCopiedRecoveryCode(true)
      setTimeout(() => setCopiedRecoveryCode(false), 2500)
    } catch {
      setPasteRecoveryInput(code)
    }
  }

  const handleDownloadJson = () => {
    const payload = exportBackupPayload()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jadwalin-backup-${new Date().toISOString().slice(0, 10)}.jadwalin.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleUploadJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const content = String(reader.result || '')
      const validated = validateJsonBackupString(content)
      if (!validated) {
        setFeedbackMessage({
          type: 'error',
          text: 'File backup tidak valid. Pastikan memilih file .jadwalin.json yang benar.',
        })
        return
      }
      importBackupPayload(validated)
      setNameInput(validated.participantName)
      setSelectedChar(validated.characterId)
      setFeedbackMessage({
        type: 'success',
        text: `Berhasil memulihkan ${validated.tasks.length} tugas dari file backup!`,
      })
    }
    reader.readAsText(file)
  }

  const handleRestoreFromTextCode = () => {
    const decoded = decodeMobileRecoveryCode(pasteRecoveryInput)
    if (!decoded) {
      setFeedbackMessage({
        type: 'error',
        text: 'Kode pemulihan JDW-MOB tidak valid atau terpotong. Periksa kembali teks yang ditempel.',
      })
      return
    }
    importBackupPayload(decoded)
    setNameInput(decoded.participantName)
    setSelectedChar(decoded.characterId)
    setPasteRecoveryInput('')
    setFeedbackMessage({
      type: 'success',
      text: `Data berhasil dipulihkan! (${decoded.tasks.length} tugas kembali ke papan).`,
    })
  }

  const handleImportGameCommitment = () => {
    const commitment = decodeGameCommitmentCode(pasteGameCodeInput)
    if (!commitment) {
      setFeedbackMessage({
        type: 'error',
        text: 'Kode komitmen game (JI-R1|...) tidak valid. Salin kode dari halaman Komitmen MAPS-15 di akhir game.',
      })
      return
    }
    importGameCommitment(commitment)
    setSelectedChar(commitment.characterId)
    setPasteGameCodeInput('')
    setFeedbackMessage({
      type: 'success',
      text: `Komitmen Kelompok ${commitment.groupCode} & 3 Rekomendasi Metode Pilihan berhasil dihubungkan!`,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] w-full max-w-2xl rounded-3xl border border-[#C9B99F] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#FFFDF9] border-b border-[#E2D9C8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/logo/logo_jadwalin.webp"
              alt="Jadwal-In!"
              className="h-8 w-auto object-contain"
            />
            <div>
              <h2 className="text-base font-extrabold text-[#1E1915]">
                Pengingat HP &amp; Cadangan Pemulihan Lokal
              </h2>
              <p className="text-xs text-[#5C5148]">
                100% tersimpan aman di perangkatmu tanpa memerlukan cloud server.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-2 rounded-xl bg-[#F2ECE1] text-[#5C5148] hover:text-[#1E1915] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-3 bg-[#FFFDF9] border-b border-[#E2D9C8] flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('NOTIFICATION')}
            className={`pb-2.5 px-3 text-xs font-extrabold border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'NOTIFICATION'
                ? 'border-[#D4532F] text-[#1E1915]'
                : 'border-transparent text-[#8C7E72]'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Pengingat Notifikasi HP &amp; Habit Stacking</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RECOVERY')}
            className={`pb-2.5 px-3 text-xs font-extrabold border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'RECOVERY'
                ? 'border-[#2C4A3E] text-[#1E1915]'
                : 'border-transparent text-[#8C7E72]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Profil &amp; Cadangan Pemulihan HP</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {feedbackMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-bold border ${
                feedbackMessage.type === 'success'
                  ? 'bg-[#E7F6EE] text-[#1F7A4C] border-[#1F7A4C]/30'
                  : 'bg-[#FDECE8] text-[#C8432B] border-[#C8432B]/30'
              }`}
            >
              {feedbackMessage.text}
            </div>
          )}

          {activeTab === 'NOTIFICATION' ? (
            <>
              {/* Permission & Instant Simulator Card */}
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="space-y-0.5">
                  <div className="text-sm font-extrabold text-[#1E1915]">
                    Status Notifikasi Perangkat:{' '}
                    <span className="text-[#1F7A4C] uppercase">{permStatus}</span> (
                    {scheduledCount || upcomingSlots.length} jadwal aktif)
                  </div>
                  <p className="text-xs text-[#5C5148]">
                    Mendukung Android Local Notifications (APK) &amp; Web Push Notification (PWA).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    className="px-3 py-2 rounded-xl bg-[#2C4A3E] text-white text-xs font-bold cursor-pointer"
                  >
                    Aktifkan Izin Notifikasi HP
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerSampleNotification()}
                    className="px-3 py-2 rounded-xl bg-[#D4532F] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    <span>Tes Simulasi Notifikasi</span>
                  </button>
                </div>
              </div>

              {/* Habit Stacking Schedule */}
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1E1915]">
                      Jadwal Pengingat Kebiasaan (Habit Stacking)
                    </h3>
                    <p className="text-xs text-[#5C5148]">
                      Kaitkan jam pengingat dengan rutinitas harianmu agar tidak terasa memaksa.
                    </p>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-extrabold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderConfig.enabled}
                      onChange={(e) => updateReminderConfig({ enabled: e.target.checked })}
                      className="w-4 h-4 accent-[#2C4A3E]"
                    />
                    <span>Aktif</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] space-y-1.5">
                    <label className="block text-xs font-extrabold text-[#1E1915]">
                      Jangkar Pagi (Eat That Frog)
                    </label>
                    <input
                      type="time"
                      value={reminderConfig.morningTime}
                      onChange={(e) => updateReminderConfig({ morningTime: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFDF9] border border-[#E2D9C8] text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={reminderConfig.morningAnchor}
                      onChange={(e) => updateReminderConfig({ morningAnchor: e.target.value })}
                      placeholder="Setelah sarapan..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFDF9] border border-[#E2D9C8] text-xs"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] space-y-1.5">
                    <label className="block text-xs font-extrabold text-[#1E1915]">
                      Jangkar Siang (Pomodoro)
                    </label>
                    <input
                      type="time"
                      value={reminderConfig.afternoonTime}
                      onChange={(e) => updateReminderConfig({ afternoonTime: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFDF9] border border-[#E2D9C8] text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={reminderConfig.afternoonAnchor}
                      onChange={(e) => updateReminderConfig({ afternoonAnchor: e.target.value })}
                      placeholder="Setelah makan siang..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFDF9] border border-[#E2D9C8] text-xs"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] space-y-1.5">
                    <label className="block text-xs font-extrabold text-[#1E1915]">
                      Jangkar Malam (Ivy Lee 6)
                    </label>
                    <input
                      type="time"
                      value={reminderConfig.eveningTime}
                      onChange={(e) => updateReminderConfig({ eveningTime: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFDF9] border border-[#E2D9C8] text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={reminderConfig.eveningAnchor}
                      onChange={(e) => updateReminderConfig({ eveningAnchor: e.target.value })}
                      placeholder="Sebelum tidur malam..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFDF9] border border-[#E2D9C8] text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1 flex-wrap text-xs font-bold text-[#1E1915]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderConfig.deadlineRemind24h}
                      onChange={(e) =>
                        updateReminderConfig({ deadlineRemind24h: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#2C4A3E]"
                    />
                    <span>Ingatkan H-24 Jam sebelum Tenggat Tugas</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderConfig.deadlineRemind2h}
                      onChange={(e) =>
                        updateReminderConfig({ deadlineRemind2h: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#2C4A3E]"
                    />
                    <span>Ingatkan H-2 Jam sebelum Tenggat (Aturan 85%)</span>
                  </label>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Profile & Avatar */}
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 space-y-3">
                <h3 className="text-sm font-extrabold text-[#1E1915]">
                  Identitas Peserta &amp; Avatar Karakter
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Nama panggilanmu..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#C9B99F] text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setParticipantProfile(nameInput.trim() || 'Peserta Jadwal-In', selectedChar)
                      setFeedbackMessage({
                        type: 'success',
                        text: 'Profil peserta berhasil diperbarui dan dicadangkan otomatis!',
                      })
                    }}
                    className="px-4 py-2 rounded-xl bg-[#2C4A3E] text-white text-xs font-extrabold cursor-pointer"
                  >
                    Simpan Profil
                  </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                  {(Object.keys(CHARACTER_PROFILES) as CharacterId[]).map((cid) => {
                    const prof = CHARACTER_PROFILES[cid]
                    const active = selectedChar === cid
                    return (
                      <button
                        key={cid}
                        type="button"
                        onClick={() => setSelectedChar(cid)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer ${
                          active
                            ? 'bg-[#2C4A3E] text-white border-[#2C4A3E]'
                            : 'bg-[#FAF7F2] text-[#1E1915] border-[#E2D9C8]'
                        }`}
                      >
                        <img
                          src={prof.avatar}
                          alt={prof.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold truncate max-w-full">{prof.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Jembatan Kode Komitmen Pelatihan (JI-R1|...) */}
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 space-y-2.5">
                <div className="flex items-center gap-1.5 text-sm font-extrabold text-[#1E1915]">
                  <Sparkles className="w-4 h-4 text-[#D4532F]" />
                  <span>Hubungkan Kode Komitmen Pelatihan</span>
                </div>
                <p className="text-xs text-[#5C5148]">
                  Tempel kode komitmen pelatihan (contoh: <code>JI-R1|...</code>) dari sesi workshop untuk memuat Rencana Jika–Maka dan 3 metode pilihanmu.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tempel kode JI-R1|... di sini"
                    value={pasteGameCodeInput}
                    onChange={(e) => setPasteGameCodeInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#C9B99F] text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleImportGameCommitment}
                    className="px-4 py-2 rounded-xl bg-[#D4532F] text-white text-xs font-extrabold cursor-pointer"
                  >
                    Muat Komitmen
                  </button>
                </div>
              </div>

              {/* 3 Lapis Pemulihan Lokal di HP (Dual Storage + Kode Teks JDW-MOB + File JSON) */}
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1E1915]">
                      Cadangan &amp; Pemulihan Data di HP (Tanpa Cloud)
                    </h3>
                    <p className="text-xs text-[#5C5148]">
                      Otomatis tersinkron ke <code>localStorage</code> + <code>IndexedDB</code> (Terakhir:{' '}
                      {lastBackupSyncedIso
                        ? new Date(lastBackupSyncedIso).toLocaleTimeString('id-ID')
                        : 'Baru saja'}
                      ).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopyRecoveryCode}
                    className="px-3.5 py-2 rounded-xl bg-[#2C4A3E] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedRecoveryCode ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Kode Teks Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Kode Pemulihan (Simpan ke WA/Catatan)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="px-3.5 py-2 rounded-xl bg-[#F2ECE1] hover:bg-[#E2D9C8] text-[#1E1915] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh File Backup (.json)</span>
                  </button>

                  <label className="px-3.5 py-2 rounded-xl bg-[#F2ECE1] hover:bg-[#E2D9C8] text-[#1E1915] text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Pulihkan dari File (.json)</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleUploadJsonFile}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="pt-2 border-t border-[#E2D9C8] space-y-2">
                  <label className="block text-xs font-bold text-[#5C5148]">
                    Pulihkan dari Kode Teks Pemulihan (<code>JDW-MOB|v1|...</code>):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tempel kode JDW-MOB|v1|... yang pernah kamu simpan"
                      value={pasteRecoveryInput}
                      onChange={(e) => setPasteRecoveryInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#C9B99F] text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleRestoreFromTextCode}
                      className="px-4 py-2 rounded-xl bg-[#1E1915] text-white text-xs font-extrabold cursor-pointer"
                    >
                      Pulihkan Data
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
