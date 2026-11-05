// src/App.tsx - Revamped Application Shell with Upper Layer Overlay Sidebar & Desktop Keyboard Navigation
import { useEffect, useState } from 'react'
import { AppSidebar } from './components/AppSidebar'
import { BoardViewContainer } from './components/BoardViewContainer'
import { FloatingSwitcherDock } from './components/FloatingSwitcherDock'
import { FocusTimerModal } from './components/FocusTimerModal'
import { InAppNotificationToast } from './components/InAppNotificationToast'
import { KeyboardShortcutsHelpModal } from './components/KeyboardShortcutsHelpModal'
import { NotificationAndRecoveryModal } from './components/NotificationAndRecoveryModal'
import { ProcrastinationDiagnosticModal } from './components/ProcrastinationDiagnosticModal'
import { TaskWorkspaceModal } from './components/TaskWorkspaceModal'
import { TechniqueToolkitModal } from './components/TechniqueToolkitModal'
import { TopHeaderBar } from './components/TopHeaderBar'
import { startAppTutorialTour } from './engine/appTourGuide'
import { resolveKeyboardAction } from './engine/keyboardShortcuts'
import { setAudioEnabled } from './lib/audioService'
import { useTrackerStore } from './store/useTrackerStore'
import type { TechniqueCatalogItem, TimerMode, TrackerTask } from './data/types'

export function App() {
  const tasks = useTrackerStore((s) => s.tasks)
  const setActiveBoardView = useTrackerStore((s) => s.setActiveBoardView)
  const recoverFromIndexedDbIfNeeded = useTrackerStore((s) => s.recoverFromIndexedDbIfNeeded)

  // Sidebar States (Upper Layer Overlay by default, with optional Desktop Pinning)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isDesktopPinned, setIsDesktopPinned] = useState(false)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  )

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Modals
  const [workspaceModalState, setWorkspaceModalState] = useState<{
    open: boolean
    taskId: string | null
    initialTab: 'STEPS' | 'WOOP' | 'STUDY'
  }>({
    open: false,
    taskId: null,
    initialTab: 'STEPS',
  })
  const [timerModalState, setTimerModalState] = useState<{
    open: boolean
    task: TrackerTask | null
    mode: TimerMode
  }>({
    open: false,
    task: null,
    mode: 'TEN_MINUTE_RULE',
  })
  const [showToolkitModal, setShowToolkitModal] = useState(false)
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false)
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  const [notifRecoveryTab, setNotifRecoveryTab] = useState<'NOTIFICATION' | 'RECOVERY' | null>(null)

  useEffect(() => {
    void (async () => {
      await useTrackerStore.persist.rehydrate()
      setAudioEnabled(useTrackerStore.getState().soundEnabled)
    })()
    void recoverFromIndexedDbIfNeeded().then(() => {
      const hasDone = useTrackerStore.getState().hasCompletedDiagnosis
      if (!hasDone) {
        setShowDiagnosticModal(true)
      }
    })
  }, [recoverFromIndexedDbIfNeeded])

  const handleActivateTechnique = (item: TechniqueCatalogItem) => {
    setShowToolkitModal(false)
    const firstActive = tasks.find((t) => t.status !== 'COMPLETED') ?? tasks[0] ?? null

    switch (item.linkedActionType) {
      case 'VIEW_KANBAN':
        setActiveBoardView('KANBAN')
        break
      case 'VIEW_EISENHOWER':
        setActiveBoardView('EISENHOWER')
        break
      case 'VIEW_135':
        setActiveBoardView('ONE_THREE_FIVE')
        break
      case 'VIEW_IVY_LEE':
        setActiveBoardView('IVY_LEE')
        break
      case 'TIMER_10_MIN':
        setTimerModalState({ open: true, task: firstActive, mode: 'TEN_MINUTE_RULE' })
        break
      case 'TIMER_POMODORO':
        setTimerModalState({ open: true, task: firstActive, mode: 'POMODORO_25_5' })
        break
      case 'TIMER_FLOW':
        setTimerModalState({ open: true, task: firstActive, mode: 'FLOW_SPRINT_45' })
        break
      case 'ACTION_CHUNK_TASK':
        setWorkspaceModalState({
          open: true,
          taskId: firstActive ? firstActive.id : null,
          initialTab: 'STEPS',
        })
        break
      case 'ACTION_WOOP':
        setWorkspaceModalState({
          open: true,
          taskId: firstActive ? firstActive.id : null,
          initialTab: 'WOOP',
        })
        break
      case 'ACTION_STUDY_NOTES':
        setWorkspaceModalState({
          open: true,
          taskId: firstActive ? firstActive.id : null,
          initialTab: 'STUDY',
        })
        break
      case 'ACTION_HABIT_REMINDER':
        setNotifRecoveryTab('NOTIFICATION')
        break
    }
  }

  const handleStartFocusQuick = (targetTask?: TrackerTask | null) => {
    const task = targetTask ?? tasks.find((t) => t.status === 'IN_PROGRESS') ?? tasks[0] ?? null
    setTimerModalState({ open: true, task, mode: 'TEN_MINUTE_RULE' })
  }

  // Global Keyboard Shortcuts Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const action = resolveKeyboardAction(e.key, e.target, {
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        code: e.code,
      })

      if (!action) return

      switch (action) {
        case 'CLOSE_MODAL_OR_SIDEBAR':
          if (showShortcutsHelp) {
            setShowShortcutsHelp(false)
          } else if (workspaceModalState.open) {
            setWorkspaceModalState((prev) => ({ ...prev, open: false }))
          } else if (timerModalState.open) {
            setTimerModalState((prev) => ({ ...prev, open: false }))
          } else if (showToolkitModal) {
            setShowToolkitModal(false)
          } else if (showDiagnosticModal) {
            setShowDiagnosticModal(false)
          } else if (notifRecoveryTab !== null) {
            setNotifRecoveryTab(null)
          } else if (isMobileDrawerOpen) {
            setIsMobileDrawerOpen(false)
          }
          break

        case 'TOGGLE_SIDEBAR':
          e.preventDefault()
          setIsMobileDrawerOpen((prev) => !prev)
          break

        case 'SWITCH_VIEW_KANBAN':
          setActiveBoardView('KANBAN')
          break

        case 'SWITCH_VIEW_EISENHOWER':
          setActiveBoardView('EISENHOWER')
          break

        case 'SWITCH_VIEW_135':
          setActiveBoardView('ONE_THREE_FIVE')
          break

        case 'SWITCH_VIEW_IVY_LEE':
          setActiveBoardView('IVY_LEE')
          break

        case 'OPEN_NEW_TASK':
          setWorkspaceModalState({ open: true, taskId: null, initialTab: 'STEPS' })
          break

        case 'OPEN_FOCUS_TIMER':
          handleStartFocusQuick()
          break

        case 'OPEN_TOOLKIT':
          setShowToolkitModal(true)
          break

        case 'OPEN_DIAGNOSTIC':
          setShowDiagnosticModal(true)
          break

        case 'OPEN_BACKUP':
          setNotifRecoveryTab('RECOVERY')
          break

        case 'OPEN_SHORTCUTS_HELP':
          setShowShortcutsHelp((prev) => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    showShortcutsHelp,
    workspaceModalState.open,
    timerModalState.open,
    showToolkitModal,
    showDiagnosticModal,
    notifRecoveryTab,
    isMobileDrawerOpen,
    setActiveBoardView,
    tasks,
  ])

  return (
    <div className="h-[100dvh] min-h-[100dvh] bg-[#FAF7F2] text-[#1E1915] flex flex-col overflow-hidden">
      <InAppNotificationToast
        onOpenTask={(taskId) =>
          setWorkspaceModalState({ open: true, taskId, initialTab: 'STEPS' })
        }
      />

      <div className="flex-1 flex h-full overflow-hidden relative">
        {/* Upper Layer Overlay Sidebar with Dim Dashboard */}
        <AppSidebar
          isMobile={isMobileViewport}
          isMobileDrawerOpen={isMobileDrawerOpen}
          onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
          isDesktopPinned={isDesktopPinned}
          onToggleDesktopPin={() => setIsDesktopPinned((v) => !v)}
          isDesktopCollapsed={isDesktopCollapsed}
          onToggleDesktopCollapse={() => setIsDesktopCollapsed((v) => !v)}
          onOpenFocusTimer={() => handleStartFocusQuick()}
          onOpenToolkit={() => setShowToolkitModal(true)}
          onOpenNotifications={() => setNotifRecoveryTab('NOTIFICATION')}
          onOpenBackup={() => setNotifRecoveryTab('RECOVERY')}
          onOpenDiagnostic={() => setShowDiagnosticModal(true)}
          onOpenShortcutsHelp={() => setShowShortcutsHelp(true)}
          onStartTour={() => startAppTutorialTour()}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#FAF7F2] relative">
          <TopHeaderBar
            isMobile={isMobileViewport}
            onToggleSidebar={() => setIsMobileDrawerOpen((prev) => !prev)}
            onOpenNotificationModal={() => setNotifRecoveryTab('NOTIFICATION')}
            onOpenBackupModal={() => setNotifRecoveryTab('RECOVERY')}
            onOpenNewTask={() =>
              setWorkspaceModalState({ open: true, taskId: null, initialTab: 'STEPS' })
            }
            onOpenShortcutsHelp={() => setShowShortcutsHelp(true)}
          />

          <BoardViewContainer
            isMobile={isMobileViewport}
            onOpenDetail={(task) =>
              setWorkspaceModalState({ open: true, taskId: task.id, initialTab: 'STEPS' })
            }
            onStartFocusTimer={(task) => handleStartFocusQuick(task)}
            onOpenNewTask={() =>
              setWorkspaceModalState({ open: true, taskId: null, initialTab: 'STEPS' })
            }
            onOpenDiagnostic={() => setShowDiagnosticModal(true)}
            onOpenBackup={() => setNotifRecoveryTab('RECOVERY')}
          />

          {/* Sleek Floating Center Switcher Dock (Non-Repetitive Command Center) */}
          <FloatingSwitcherDock
            onOpenNewTask={() =>
              setWorkspaceModalState({ open: true, taskId: null, initialTab: 'STEPS' })
            }
            onOpenFocusTimer={() => handleStartFocusQuick()}
          />
        </div>

        {/* Modals */}
        {workspaceModalState.open && (
          <TaskWorkspaceModal
            taskId={workspaceModalState.taskId}
            initialTab={workspaceModalState.initialTab}
            onClose={() => setWorkspaceModalState((prev) => ({ ...prev, open: false }))}
            onStartFocusFromModal={(task) => handleStartFocusQuick(task)}
          />
        )}

        {timerModalState.open && (
          <FocusTimerModal
            initialTask={timerModalState.task}
            initialMode={timerModalState.mode}
            onClose={() => setTimerModalState((prev) => ({ ...prev, open: false }))}
          />
        )}

        {showToolkitModal && (
          <TechniqueToolkitModal
            onClose={() => setShowToolkitModal(false)}
            onActivateTechnique={handleActivateTechnique}
          />
        )}

        {showDiagnosticModal && (
          <ProcrastinationDiagnosticModal
            onClose={() => setShowDiagnosticModal(false)}
            onStartTourAfterDiagnosis={() => {
              setShowDiagnosticModal(false)
              setTimeout(() => {
                startAppTutorialTour()
              }, 350)
            }}
          />
        )}

        {notifRecoveryTab !== null && (
          <NotificationAndRecoveryModal
            initialTab={notifRecoveryTab}
            onClose={() => setNotifRecoveryTab(null)}
          />
        )}

        {showShortcutsHelp && (
          <KeyboardShortcutsHelpModal
            onClose={() => setShowShortcutsHelp(false)}
          />
        )}
      </div>
    </div>
  )
}

export default App
