// src/App.tsx - Revamped Application Shell with Hybrid Responsive Sidebar & Floating Action Dock
import { useEffect, useState } from 'react'
import { AppSidebar } from './components/AppSidebar'
import { BoardViewContainer } from './components/BoardViewContainer'
import { DeviceSimulatorWrapper } from './components/DeviceSimulatorWrapper'
import { FloatingSwitcherDock } from './components/FloatingSwitcherDock'
import { FocusTimerModal } from './components/FocusTimerModal'
import { NotificationAndRecoveryModal } from './components/NotificationAndRecoveryModal'
import { ProcrastinationDiagnosticModal } from './components/ProcrastinationDiagnosticModal'
import { TaskWorkspaceModal } from './components/TaskWorkspaceModal'
import { TechniqueToolkitModal } from './components/TechniqueToolkitModal'
import { TopHeaderBar } from './components/TopHeaderBar'
import { useTrackerStore } from './store/useTrackerStore'
import type { TechniqueCatalogItem, TimerMode, TrackerTask } from './data/types'

export function App() {
  const tasks = useTrackerStore((s) => s.tasks)
  const setActiveBoardView = useTrackerStore((s) => s.setActiveBoardView)
  const recoverFromIndexedDbIfNeeded = useTrackerStore((s) => s.recoverFromIndexedDbIfNeeded)

  // Sidebar States (Mobile Drawer vs Desktop Collapse)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
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
  const [notifRecoveryTab, setNotifRecoveryTab] = useState<'NOTIFICATION' | 'RECOVERY' | null>(null)

  useEffect(() => {
    void useTrackerStore.persist.rehydrate()
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

  return (
    <DeviceSimulatorWrapper
      onOpenTaskFromNotification={(taskId) =>
        setWorkspaceModalState({ open: true, taskId, initialTab: 'STEPS' })
      }
    >
      {(isSimulatedMobile) => {
        const isMobileEffective = isSimulatedMobile || isMobileViewport

        return (
          <div className="flex-1 flex h-full overflow-hidden relative">
            {/* Responsive Sidebar (Mobile Sheet Drawer + Desktop Persistent Rail) */}
            <AppSidebar
              isMobileDrawerOpen={isMobileDrawerOpen}
              onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
              isDesktopCollapsed={isDesktopCollapsed}
              onToggleDesktopCollapse={() => setIsDesktopCollapsed((v) => !v)}
              onOpenFocusTimer={() => handleStartFocusQuick()}
              onOpenToolkit={() => setShowToolkitModal(true)}
              onOpenNotifications={() => setNotifRecoveryTab('NOTIFICATION')}
              onOpenBackup={() => setNotifRecoveryTab('RECOVERY')}
              onOpenDiagnostic={() => setShowDiagnosticModal(true)}
            />

            {/* Main Content Viewport */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#FAF7F2] relative">
              <TopHeaderBar
                isSimulatedMobile={isMobileEffective}
                onToggleSidebar={() => {
                  if (isMobileEffective) {
                    setIsMobileDrawerOpen(true)
                  } else {
                    setIsDesktopCollapsed((v) => !v)
                  }
                }}
                onOpenNotificationModal={() => setNotifRecoveryTab('NOTIFICATION')}
                onOpenBackupModal={() => setNotifRecoveryTab('RECOVERY')}
                onOpenNewTask={() =>
                  setWorkspaceModalState({ open: true, taskId: null, initialTab: 'STEPS' })
                }
              />

              <BoardViewContainer
                isSimulatedMobile={isMobileEffective}
                onOpenDetail={(task) =>
                  setWorkspaceModalState({ open: true, taskId: task.id, initialTab: 'STEPS' })
                }
                onStartFocusTimer={(task) => handleStartFocusQuick(task)}
                onOpenNewTask={() =>
                  setWorkspaceModalState({ open: true, taskId: null, initialTab: 'STEPS' })
                }
                onOpenDiagnostic={() => setShowDiagnosticModal(true)}
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
            />
          )}

          {notifRecoveryTab !== null && (
            <NotificationAndRecoveryModal
              initialTab={notifRecoveryTab}
              onClose={() => setNotifRecoveryTab(null)}
            />
          )}
        </div>
      )
    }}
    </DeviceSimulatorWrapper>
  )
}

export default App
