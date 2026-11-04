// src/engine/procrastinationDiagnosticEngine.test.ts - Unit Tests for Diagnostic Engine
import { describe, expect, it } from 'vitest'
import {
  evaluateProcrastinationProfile,
  generateStarterTaskForProfile,
  getArchetypeMetadata,
} from './procrastinationDiagnosticEngine'

describe('procrastinationDiagnosticEngine', () => {
  it('correctly maps Overwhelmed obstacle to 1-3-5 framework and returns personalized profile', () => {
    const profile = evaluateProcrastinationProfile({
      obstacle: 'OVERWHELMED',
      primaryGoal: 'THESIS',
      focusStyle: 'TEN_MIN',
    })

    expect(profile.archetype).toBe('OVERWHELMED')
    expect(profile.recommendedFramework).toBe('ONE_THREE_FIVE')
    expect(profile.recommendedTechniqueIds).toContain('TEK_11') // 1-3-5
    expect(profile.recommendedTechniqueIds).toContain('TEK_02') // Task Chunking
  })

  it('correctly maps Perfectionist obstacle to Eisenhower framework and 85% rule', () => {
    const profile = evaluateProcrastinationProfile({
      obstacle: 'PERFECTIONIST',
      primaryGoal: 'COURSEWORK',
      focusStyle: 'POMODORO',
    })

    expect(profile.archetype).toBe('PERFECTIONIST')
    expect(profile.recommendedFramework).toBe('EISENHOWER')
    expect(profile.recommendedTechniqueIds).toContain('TEK_06') // 85% Rule
  })

  it('correctly maps Distracted obstacle to Ivy Lee single focus framework', () => {
    const profile = evaluateProcrastinationProfile({
      obstacle: 'DISTRACTED',
      primaryGoal: 'EXAMS',
      focusStyle: 'FLOW',
    })

    expect(profile.archetype).toBe('DISTRACTED')
    expect(profile.recommendedFramework).toBe('IVY_LEE')
    expect(profile.recommendedTechniqueIds).toContain('TEK_28') // Ivy Lee
  })

  it('provides rich archetype metadata without academic jargon', () => {
    const meta = getArchetypeMetadata('DEADLINER')
    expect(meta.title).toBe('Tipe Penakluk Deadline')
    expect(meta.frameworkName).toContain('Kanban')
    expect(meta.dailyMotto).toBeDefined()
    expect(meta.scientificExplanation).toBeDefined()
  })

  it('generates appropriate starter tasks for different student goals', () => {
    const thesisTask = generateStarterTaskForProfile({
      archetype: 'OVERWHELMED',
      primaryGoal: 'THESIS',
      focusStyle: 'TEN_MIN',
      recommendedFramework: 'ONE_THREE_FIVE',
      recommendedTechniqueIds: ['TEK_02'],
      diagnosedAtIso: new Date().toISOString(),
    })
    expect(thesisTask.title).toContain('Skripsi')
    expect(thesisTask.scale).toBe('Tugas Akhir')

    const examTask = generateStarterTaskForProfile({
      archetype: 'DISTRACTED',
      primaryGoal: 'EXAMS',
      focusStyle: 'FLOW',
      recommendedFramework: 'IVY_LEE',
      recommendedTechniqueIds: ['TEK_28'],
      diagnosedAtIso: new Date().toISOString(),
    })
    expect(examTask.courseOrContext).toBe('Persiapan Ujian')
  })
})
