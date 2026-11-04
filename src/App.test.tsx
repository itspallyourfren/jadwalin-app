import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { App } from './App'
import { FocusTimerModal } from './components/FocusTimerModal'
import { NotificationAndRecoveryModal } from './components/NotificationAndRecoveryModal'
import { TaskWorkspaceModal } from './components/TaskWorkspaceModal'
import { TechniqueToolkitModal } from './components/TechniqueToolkitModal'
import { useTrackerStore } from './store/useTrackerStore'

describe('App & Modals SSR Render Verification', () => {
  it('renders App shell, Kanban board, and all interactive modals cleanly without runtime errors', () => {
    const store = useTrackerStore.getState()
    const firstTask = store.tasks[0]

    // 1. Main App Shell & Kanban View
    const htmlApp = renderToString(<App />)
    expect(htmlApp).toContain('Laci Tugas')
    expect(htmlApp).toContain('Hari Ini')
    expect(htmlApp).toContain('Eisenhower')
    expect(htmlApp).toContain('1-3-5')
    expect(htmlApp).toContain('Ivy Lee')

    // 2. TaskWorkspaceModal (New & Existing)
    const htmlNewTask = renderToString(<TaskWorkspaceModal taskId={null} onClose={() => {}} />)
    expect(htmlNewTask).toContain('Tambah Target Tugas Baru')

    const htmlExistingTask = renderToString(
      <TaskWorkspaceModal taskId={firstTask.id} onClose={() => {}} />
    )
    expect(htmlExistingTask).toContain('Susun Bab Pendahuluan &amp; Rumusan Masalah')
    expect(htmlExistingTask).toContain('Daftar Sub-Langkah')

    // 3. FocusTimerModal (10-Minute Rule & Pomodoro)
    const htmlTimer = renderToString(
      <FocusTimerModal initialTask={firstTask} initialMode="TEN_MINUTE_RULE" onClose={() => {}} />
    )
    expect(htmlTimer).toContain('Mulai 10m')
    expect(htmlTimer).toContain('Ulysses Pact')

    // 4. TechniqueToolkitModal
    const htmlToolkit = renderToString(
      <TechniqueToolkitModal onClose={() => {}} onActivateTechnique={() => {}} />
    )
    expect(htmlToolkit).toContain('Katalog Teknik Produktivitas')

    // 4b. TaskWorkspaceModal with STUDY and WOOP tabs
    const htmlStudy = renderToString(
      <TaskWorkspaceModal taskId={firstTask.id} initialTab="STUDY" onClose={() => {}} />
    )
    expect(htmlStudy).toContain('Checklist Membaca SQ3R')
    expect(htmlStudy).toContain('Metode Feynman')
    expect(htmlStudy).toContain('Sistem Leitner')

    const htmlWoop = renderToString(
      <TaskWorkspaceModal taskId={firstTask.id} initialTab="WOOP" onClose={() => {}} />
    )
    expect(htmlWoop).toContain('WOOP Framework')

    // 5. NotificationAndRecoveryModal
    const htmlNotif = renderToString(
      <NotificationAndRecoveryModal initialTab="NOTIFICATION" onClose={() => {}} />
    )
    expect(htmlNotif).toContain('Habit Stacking')

    const htmlRecov = renderToString(
      <NotificationAndRecoveryModal initialTab="RECOVERY" onClose={() => {}} />
    )
    expect(htmlRecov).toContain('Cadangan &amp; Pemulihan Data di HP')
  })
})
