import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { App } from './App'
import { AppSidebar } from './components/AppSidebar'
import { FocusTimerModal } from './components/FocusTimerModal'
import { KeyboardShortcutsHelpModal } from './components/KeyboardShortcutsHelpModal'
import { NotificationAndRecoveryModal } from './components/NotificationAndRecoveryModal'
import { ProcrastinationDiagnosticModal } from './components/ProcrastinationDiagnosticModal'
import { TaskWorkspaceModal } from './components/TaskWorkspaceModal'
import { TechniqueToolkitModal } from './components/TechniqueToolkitModal'
import { SmartDecompositionModal } from './components/SmartDecompositionModal'
import { useTrackerStore } from './store/useTrackerStore'

describe('App & Modals SSR Render Verification', () => {
  it('renders App shell, Kanban board, and all interactive modals cleanly without runtime errors', () => {
    const store = useTrackerStore.getState()
    store.clearAllTasks()

    // 1. Main App Shell & Navigation
    const htmlApp = renderToString(<App />)
    expect(htmlApp).toContain('Papan Kanban')
    expect(htmlApp).toContain('Tahap Pengerjaan')
    expect(htmlApp).toContain('Laci / Antrean')
    expect(htmlApp).toContain('Pengerjaan Aktif')

    // 1b. AppSidebar Open Mode (Overlay with Dim Dashboard)
    const htmlSidebar = renderToString(
      <AppSidebar
        isMobile={false}
        isMobileDrawerOpen={true}
        onCloseMobileDrawer={() => {}}
        onOpenFocusTimer={() => {}}
        onOpenToolkit={() => {}}
        onOpenNotifications={() => {}}
        onOpenBackup={() => {}}
        onOpenDiagnostic={() => {}}
        onOpenShortcutsHelp={() => {}}
      />
    )
    expect(htmlSidebar).toContain('Papan Kanban')
    expect(htmlSidebar).toContain('Matriks Eisenhower')
    expect(htmlSidebar).toContain('Target 1-3-5')
    expect(htmlSidebar).toContain('Antrean Ivy Lee')
    expect(htmlSidebar).toContain('Tombol Pintas [?]')

    // 1c. KeyboardShortcutsHelpModal
    const htmlShortcuts = renderToString(
      <KeyboardShortcutsHelpModal onClose={() => {}} />
    )
    expect(htmlShortcuts).toContain('Pintasan Keyboard Desktop')
    expect(htmlShortcuts).toContain('Papan Kanban')
    expect(htmlShortcuts).toContain('Timer Fokus Cepat')

    // Add a test task for modal verification
    const testTaskId = store.addTask({
      title: 'Susun Bab Pendahuluan & Rumusan Masalah',
      courseOrContext: 'Metodologi Penelitian',
      category: 'Kuliah & Tugas',
      scale: 'Besar',
      autoChunk: true,
      isEatThatFrog: true,
    })
    const firstTask = useTrackerStore.getState().tasks.find((t) => t.id === testTaskId)!

    // 2. TaskWorkspaceModal (New & Existing)
    const htmlNewTask = renderToString(<TaskWorkspaceModal taskId={null} onClose={() => {}} />)
    expect(htmlNewTask).toContain('Tambah Tugas Baru')

    const htmlExistingTask = renderToString(
      <TaskWorkspaceModal taskId={firstTask.id} task={firstTask} onClose={() => {}} />
    )
    expect(htmlExistingTask).toContain('Susun Bab Pendahuluan &amp; Rumusan Masalah')
    expect(htmlExistingTask).toContain('Daftar Sub-Langkah')

    // 3. FocusTimerModal (10-Minute Rule & Pomodoro)
    const htmlTimer = renderToString(
      <FocusTimerModal initialTask={firstTask} initialMode="TEN_MINUTE_RULE" onClose={() => {}} />
    )
    expect(htmlTimer).toContain('Mulai 10m')
    expect(htmlTimer).toContain('Fase Fokus Belajar')

    // 4. TechniqueToolkitModal
    const htmlToolkit = renderToString(
      <TechniqueToolkitModal onClose={() => {}} onActivateTechnique={() => {}} />
    )
    expect(htmlToolkit).toContain('Katalog Teknik Produktivitas')

    // 4b. TaskWorkspaceModal with STUDY and WOOP tabs
    const htmlStudy = renderToString(
      <TaskWorkspaceModal taskId={firstTask.id} task={firstTask} initialTab="STUDY" onClose={() => {}} />
    )
    expect(htmlStudy).toContain('Membaca Efektif')
    expect(htmlStudy).toContain('Metode Feynman')
    expect(htmlStudy).toContain('Flashcard')

    const htmlWoop = renderToString(
      <TaskWorkspaceModal taskId={firstTask.id} task={firstTask} initialTab="WOOP" onClose={() => {}} />
    )
    expect(htmlWoop).toContain('Rencana Menghadapi Godaan &amp; Hambatan')

    // 4c. SmartDecompositionModal (Adaptive Strategy Engine)
    const htmlSmart = renderToString(
      <SmartDecompositionModal task={firstTask} onClose={() => {}} onApplySteps={() => {}} />
    )
    expect(htmlSmart).toContain('Bantu Pecah Tugas')
    expect(htmlSmart).toContain('Pilih Gaya Pengerjaan')
    expect(htmlSmart).toContain('Sprint Mepet')
    expect(htmlSmart).toContain('Rencana Langkah')

    // 4d. ProcrastinationDiagnosticModal (Personal Baseline + MAPS-15 + Expectations)
    const htmlDiagnostic = renderToString(
      <ProcrastinationDiagnosticModal onClose={() => {}} />
    )
    expect(htmlDiagnostic).toContain('Kondisi &amp; Perasaan Pribadi')
    expect(htmlDiagnostic).toContain('Nama Panggilanmu')
    expect(htmlDiagnostic).toContain('Lanjut ke Cek Pola Belajar')

    // 5. NotificationAndRecoveryModal
    const htmlNotif = renderToString(
      <NotificationAndRecoveryModal initialTab="NOTIFICATION" onClose={() => {}} />
    )
    expect(htmlNotif).toContain('Jadwal Pengingat Kebiasaan')

    const htmlRecov = renderToString(
      <NotificationAndRecoveryModal initialTab="RECOVERY" onClose={() => {}} />
    )
    expect(htmlRecov).toContain('Cadangan Cloud Peserta (Cloudflare Edge)')
    expect(htmlRecov).toContain('Opsi Cadangan Darurat')
  })
})
