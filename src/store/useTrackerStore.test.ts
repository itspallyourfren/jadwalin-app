import { describe, expect, it } from 'vitest'
import { useTrackerStore } from './useTrackerStore'

describe('useTrackerStore', () => {
  it('initializes with a clean empty board and supports adding, auto-tab switching, and completing via 85% rule', () => {
    const store = useTrackerStore.getState()
    store.clearAllTasks()
    expect(useTrackerStore.getState().tasks.length).toBe(0)

    const newId = store.addTask({
      title: 'Presentasi Akhir Semester',
      courseOrContext: 'Kewirausahaan',
      category: 'Kuliah & Tugas',
      scale: 'Besar',
      autoChunk: true,
      isEatThatFrog: true,
    })

    const state = useTrackerStore.getState()
    const added = state.tasks.find((t) => t.id === newId)
    expect(added).toBeDefined()
    expect(added?.isEatThatFrog).toBe(true)
    expect(added?.subtasks.length).toBeGreaterThanOrEqual(4)
    expect(state.activeMobileKanbanTab).toBe('IN_PROGRESS')

    // Complete via 85% Rule
    useTrackerStore.getState().completeTaskVia85Rule(newId)
    const completed = useTrackerStore.getState().tasks.find((t) => t.id === newId)
    expect(completed?.status).toBe('COMPLETED')
    expect(completed?.completedVia85Rule).toBe(true)
  })

  it('exports and imports backup payload cleanly', () => {
    const store = useTrackerStore.getState()
    store.setParticipantProfile('Nadia Kusuma', 'CHR-02')
    const exported = useTrackerStore.getState().exportBackupPayload()
    expect(exported.participantName).toBe('Nadia Kusuma')
    expect(exported.characterId).toBe('CHR-02')

    store.setParticipantProfile('Sementara', 'CHR-01')
    useTrackerStore.getState().importBackupPayload(exported)
    expect(useTrackerStore.getState().participantName).toBe('Nadia Kusuma')
    expect(useTrackerStore.getState().characterId).toBe('CHR-02')
  })

  it('saves procrastination diagnosis, adapts active framework, and optionally generates starter task', () => {
    const store = useTrackerStore.getState()
    store.clearAllTasks()
    store.resetDiagnosis()
    expect(useTrackerStore.getState().hasCompletedDiagnosis).toBe(false)

    store.saveDiagnosisResult(
      {
        archetype: 'OVERWHELMED',
        primaryGoal: 'THESIS',
        focusStyle: 'TEN_MIN',
        recommendedFramework: 'ONE_THREE_FIVE',
        recommendedTechniqueIds: ['TEK_11'],
        diagnosedAtIso: new Date().toISOString(),
      },
      true // create starter task
    )

    const updated = useTrackerStore.getState()
    expect(updated.hasCompletedDiagnosis).toBe(true)
    expect(updated.activeBoardView).toBe('ONE_THREE_FIVE')
    expect(updated.userProfile?.archetype).toBe('OVERWHELMED')
    expect(updated.tasks.length).toBe(1)
    expect(updated.tasks[0].title).toContain('Skripsi')
  })
})
