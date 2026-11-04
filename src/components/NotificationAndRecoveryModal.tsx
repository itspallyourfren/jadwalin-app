// src/components/NotificationAndRecoveryModal.tsx - Habit Stacking Reminders + 3-Layer Local Recovery & Game Commitment Import
import React, { useEffect, useState } from 'react'
import {
  BellRing,
  Check,
  ChevronDown,
  ChevronUp,
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
  const soundEnabled = useTrackerStore((s) => s.soundEnabled)
  const setSoundEnabled = useTrackerStore((s) => s.setSoundEnabled)
  const updateReminderConfig = useTrackerStore((s) => s.updateReminderConfig)
  const triggerSampleNotification = useTrackerStore((s) => s.triggerSampleNotification)
  const exportBackupPayload = useTrackerStore((s) => s.exportBackupPayload)
  const importBackupPayload = useTrackerStore((s) => s.importBackupPayload)
  const importGameCommitment = useTrackerStore((s) => s.importGameCommitment)
  const clearAllTasks = useTrackerStore((s) => s.clearAllTasks)
  const lastBackupSyncedIso = useTrackerStore((s) => s.lastBackupSyncedIso)

  const [permStatus, setPermStatus] = useState<string>('prompt')
  const [scheduledCount, setScheduledCount] = useState<number>(0)

  const [nameInput, setNameInput] = useState(participantName)
  const [selectedChar, setSelectedChar] = useState<CharacterId>(characterId)

  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [showAdvancedWorkshop, setShowAdvancedWorkshop] = useState(false)
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
              src="./assets/logo/logo_jadwalin.webp"
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
            className="w-10 h-10 min-w-[40px] flex items-center justify-center rounded-xl bg-[#F2ECE1] text-[#5C5148] hover:text-[#1E1915] cursor-pointer"
          >
            <X className="w-5 h-5" />
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
              {/* Sound & Audio Feedback Settings */}
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-sm font-extrabold text-[#1E1915]">
                    Efek Suara UI &amp; Notifikasi (uisfx)
                  </div>
                  <p className="text-xs text-[#5C5148]">
                    Umpan balik audio lembut saat centang langkah, selesai sesi fokus, dan pengingat.
                  </p>
                </div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#2C4A3E]"
                  />
                  <span>{soundEnabled ? 'Aktif' : 'Bisu'}</span>
                </label>
              </div>

              {/* Status Izin Notifikasi Perangkat */}
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
                    className="px-3.5 py-2 rounded-xl bg-[#2C4A3E] hover:bg-[#21382F] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Aktifkan Izin Notifikasi HP
                  </button>
                </div>
              </div>

              {/* Habit Stacking Schedule */}
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1E1915]">
                      Jadwal Pengingat Kebiasaan Harian
                    </h3>
                    <p className="text-xs text-[#5C5148]">
                      Kaitkan jam pengingat dengan rutinitas harianmu agar konsisten dan alami.
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
                      Pengingat Pagi (Fokus Utama)
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
                      Pengingat Siang
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
                      Pengingat Malam (Rencana Esok)
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
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#1E1915]">
                    Profil Mahasiswa
                  </h3>
                  <span className="text-[11px] font-bold text-[#8C7E72]">
                    Tersimpan di HP
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Nama panggilanmu..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#C9B99F] text-xs font-bold text-[#1E1915]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setParticipantProfile(nameInput.trim() || 'Peserta Jadwal-In', selectedChar)
                      setFeedbackMessage({
                        type: 'success',
                        text: 'Profil peserta berhasil diperbarui!',
                      })
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#2C4A3E] text-white text-xs font-extrabold cursor-pointer hover:bg-[#233B32] transition-colors"
                  >
                    Simpan
                  </button>
                </div>

                {/* Collapsible Avatar Picker */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker((prev) => !prev)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] hover:border-[#C9B99F] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={CHARACTER_PROFILES[selectedChar]?.avatar}
                        alt={CHARACTER_PROFILES[selectedChar]?.name}
                        className="w-8 h-8 rounded-full object-cover border border-[#C9B99F]"
                      />
                      <div className="text-left">
                        <span className="text-xs font-black text-[#1E1915] block">
                          Avatar: {CHARACTER_PROFILES[selectedChar]?.name || 'Pilih Karakter'}
                        </span>
                        <span className="text-[10px] text-[#8C7E72]">
                          {showAvatarPicker ? 'Tutup galeri karakter' : 'Ketuk untuk mengganti avatar'}
                        </span>
                      </div>
                    </div>
                    {showAvatarPicker ? (
                      <ChevronUp className="w-4 h-4 text-[#8C7E72]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#8C7E72]" />
                    )}
                  </button>

                  {showAvatarPicker && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2.5">
                      {(Object.keys(CHARACTER_PROFILES) as CharacterId[]).map((cid) => {
                        const prof = CHARACTER_PROFILES[cid]
                        const active = selectedChar === cid
                        return (
                          <button
                            key={cid}
                            type="button"
                            onClick={() => {
                              setSelectedChar(cid)
                              setParticipantProfile(nameInput.trim() || 'Peserta Jadwal-In', cid)
                              setShowAvatarPicker(false)
                              setFeedbackMessage({
                                type: 'success',
                                text: `Avatar diubah menjadi ${prof.name}`,
                              })
                            }}
                            className={`p-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                              active
                                ? 'bg-[#2C4A3E] text-white border-[#2C4A3E] shadow-xs'
                                : 'bg-[#FFFDF9] text-[#1E1915] border-[#E2D9C8] hover:bg-[#FAF7F2]'
                            }`}
                          >
                            <img
                              src={prof.avatar}
                              alt={prof.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="text-[11px] font-bold truncate max-w-full">{prof.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Cadangan Cepat di HP (Paling Sering Digunakan) */}
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <h3 className="text-sm font-extrabold text-[#1E1915]">
                    Cadangan &amp; Pemulihan Lokal HP
                  </h3>
                  <span className="text-[11px] text-[#8C7E72]">
                    Sync:{' '}
                    {lastBackupSyncedIso
                      ? new Date(lastBackupSyncedIso).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Baru saja'}
                  </span>
                </div>
                <p className="text-xs text-[#5C5148] leading-relaxed">
                  Data tugasmu tersimpan offline di peramban HP ini. Buat salinan cadangan sebelum membersihkan cache peramban.
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopyRecoveryCode}
                    className="flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#233B32] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    {copiedRecoveryCode ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Kode Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Kode Teks</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E2D9C8] text-[#1E1915] text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4 text-[#5C5148]" />
                    <span>Unduh File (.json)</span>
                  </button>
                </div>
              </div>

              {/* Opsi Lanjutan: Pemulihan Manual & Kode Pelatihan Workshop (Disembunyikan Rapi) */}
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdvancedWorkshop((prev) => !prev)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8C7E72]" />
                    <div>
                      <span className="text-xs font-black text-[#1E1915] block">
                        Opsi Pemulihan Manual &amp; Pelatihan
                      </span>
                      <span className="text-[10px] text-[#8C7E72]">
                        Pulihkan dari file/kode, jembatan workshop, &amp; reset
                      </span>
                    </div>
                  </div>
                  {showAdvancedWorkshop ? (
                    <ChevronUp className="w-4 h-4 text-[#8C7E72]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#8C7E72]" />
                  )}
                </button>

                {showAdvancedWorkshop && (
                  <div className="p-4 pt-1 border-t border-[#E2D9C8]/70 space-y-4 bg-[#FAF7F2]/40">
                    {/* Restore File */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-[#1E1915] block">
                        1. Pulihkan dari File Cadangan
                      </span>
                      <label className="w-full px-3.5 py-2 rounded-xl bg-[#FFFDF9] border border-[#C9B99F] hover:bg-[#F2ECE1] text-[#1E1915] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 text-[#5C5148]" />
                        <span>Pilih File Backup (.json)</span>
                        <input
                          type="file"
                          accept=".json,application/json"
                          onChange={handleUploadJsonFile}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Restore from Code */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1E1915]">
                        2. Pulihkan dari Kode Teks (<code>JDW-MOB|v1|...</code>)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Tempel kode JDW-MOB|v1|..."
                          value={pasteRecoveryInput}
                          onChange={(e) => setPasteRecoveryInput(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#C9B99F] text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleRestoreFromTextCode}
                          className="px-3.5 py-2 rounded-xl bg-[#1E1915] text-white text-xs font-extrabold cursor-pointer"
                        >
                          Pulihkan
                        </button>
                      </div>
                    </div>

                    {/* Hubungkan Kode Pelatihan */}
                    <div className="space-y-1.5 pt-2 border-t border-[#E2D9C8]/60">
                      <label className="block text-xs font-bold text-[#1E1915]">
                        3. Hubungkan Kode Pelatihan (<code>JI-R1|...</code>)
                      </label>
                      <p className="text-[11px] text-[#5C5148]">
                        Tempel kode komitmen dari web workshop Jadwal-In untuk menyinkronkan 3 metode pilihanmu.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Tempel kode JI-R1|..."
                          value={pasteGameCodeInput}
                          onChange={(e) => setPasteGameCodeInput(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#C9B99F] text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleImportGameCommitment}
                          className="px-3.5 py-2 rounded-xl bg-[#D4532F] text-white text-xs font-extrabold cursor-pointer"
                        >
                          Muat
                        </button>
                      </div>
                    </div>

                    {/* Reset Papan */}
                    {tasks.length > 0 && (
                      <div className="pt-3 border-t border-[#E2D9C8]/60 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#C8432B]">Reset Data Papan</p>
                          <p className="text-[10px] text-[#8C7E72]">
                            Hapus semua tugas untuk mulai dari lembar bersih.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                'Kosongkan semua daftar tugas? Semua tugas saat ini akan dihapus dari papan.'
                              )
                            ) {
                              clearAllTasks()
                              setFeedbackMessage({
                                type: 'success',
                                text: 'Papan tugas berhasil dikosongkan.',
                              })
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#FDECE8] hover:bg-[#F9D7D0] text-[#C8432B] text-xs font-bold transition-colors cursor-pointer"
                        >
                          Kosongkan Papan
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
