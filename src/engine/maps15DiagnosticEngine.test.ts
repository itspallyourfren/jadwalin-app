// src/engine/maps15DiagnosticEngine.test.ts - Unit Tests for MAPS-15 Scoring & Profile Synthesis
import { describe, expect, it } from 'vitest'
import {
  MAPS_15_ITEMS,
  evaluateMaps15Responses,
  generateTailoredStarterTask,
  shuffleMaps15Items,
  synthesizeProcrastinationProfile,
} from './maps15DiagnosticEngine'

describe('maps15DiagnosticEngine', () => {
  it('shuffleMaps15Items returns 15 unique items with exact dimensions', () => {
    const shuffled = shuffleMaps15Items(42)
    expect(shuffled).toHaveLength(15)

    const ids = shuffled.map((i) => i.id)
    expect(new Set(ids).size).toBe(15)

    for (let id = 1; id <= 15; id++) {
      expect(ids).toContain(id)
    }

    // Verify reverse items
    const reverseIds = MAPS_15_ITEMS.filter((i) => i.isReverse).map((i) => i.id)
    expect(reverseIds.sort((a, b) => a - b)).toEqual([8, 9, 12, 13])
  })

  it('evaluates all 5s correctly with reverse items reversed to 1', () => {
    // If user answers 5 to everything:
    // 11 normal items * 5 = 55
    // 4 reverse items (8, 9, 12, 13) flipped to (6 - 5) = 1 * 4 = 4
    // Total raw = 59
    const all5: Record<number, number> = {}
    for (let i = 1; i <= 15; i++) all5[i] = 5

    const res = evaluateMaps15Responses(all5, '2026-11-04T00:00:00.000Z')
    expect(res.totalScore).toBe(59)
    // Range min 15, max 75. (59 - 15) / 60 = 44 / 60 = 73%
    expect(res.normalizedScore).toBe(73)

    // WD has 5 normal items -> 5 * 5 = 25 raw -> (25 - 5) / 20 = 100%
    expect(res.wdScore).toBe(25)
    expect(res.wdNormalized).toBe(100)
    expect(res.dimensionLabels.wd).toBe('Tinggi')

    // PTM has 1 normal (item 2 = 5) and 3 reverse (8, 9, 12 = 1 each) -> raw = 8
    // (8 - 4) / 16 = 25%
    expect(res.ptmScore).toBe(8)
    expect(res.ptmNormalized).toBe(25)
    expect(res.dimensionLabels.ptm).toBe('Rendah')

    // WD is dominant
    expect(res.dominantDimension).toBe('WD')
  })

  it('evaluates ideal responses (1 on normal, 5 on reverse) to minimum score 15 (0%)', () => {
    const ideal: Record<number, number> = {}
    for (const item of MAPS_15_ITEMS) {
      ideal[item.id] = item.isReverse ? 5 : 1
    }

    const res = evaluateMaps15Responses(ideal)
    expect(res.totalScore).toBe(15)
    expect(res.normalizedScore).toBe(0)
    expect(res.cpNormalized).toBe(0)
    expect(res.ptmNormalized).toBe(0)
    expect(res.wdNormalized).toBe(0)
    expect(res.dimensionLabels.cp).toBe('Rendah')
    expect(res.dimensionLabels.ptm).toBe('Rendah')
    expect(res.dimensionLabels.wd).toBe('Rendah')
  })

  it('synthesizes profile correctly based on app expectations and personal conditions', () => {
    const responses: Record<number, number> = {}
    for (let i = 1; i <= 15; i++) responses[i] = 3
    const assessment = evaluateMaps15Responses(responses)

    // 1. Routine Expectation -> IVY_LEE
    const profRoutine = synthesizeProcrastinationProfile({
      userName: 'Budi',
      personalGoal: 'COURSEWORK',
      personalObstacle: 'DEADLINER',
      appExpectation: 'BUILD_ROUTINE',
      maps15Assessment: assessment,
    })
    expect(profRoutine.recommendedFramework).toBe('IVY_LEE')
    expect(profRoutine.recommendedTechniqueIds).toContain('TEK_28') // Ivy Lee Method
    expect(profRoutine.recommendedTechniqueIds).toContain('TEK_34') // Parkinson's law for Deadliner

    // 2. Distraction Expectation -> KANBAN + Pomodoro
    const profDistraction = synthesizeProcrastinationProfile({
      userName: 'Siti',
      personalGoal: 'THESIS',
      personalObstacle: 'DISTRACTED',
      appExpectation: 'BEAT_DISTRACTIONS',
      maps15Assessment: assessment,
    })
    expect(profDistraction.recommendedFramework).toBe('KANBAN')
    expect(profDistraction.focusStyle).toBe('POMODORO')
    expect(profDistraction.recommendedTechniqueIds).toContain('TEK_01') // Pomodoro

    // 3. Anxiety & Perfectionism Expectation -> EISENHOWER + 85% Rule
    const profAnxiety = synthesizeProcrastinationProfile({
      userName: 'Andi',
      personalGoal: 'EXAMS',
      personalObstacle: 'PERFECTIONIST',
      appExpectation: 'REDUCE_ANXIETY_DEADLINE',
      maps15Assessment: assessment,
    })
    expect(profAnxiety.recommendedFramework).toBe('EISENHOWER')
    expect(profAnxiety.recommendedTechniqueIds).toContain('TEK_06') // 85% rule
  })

  it('generates tailored starter task matching thesis goal and expectation', () => {
    const responses: Record<number, number> = {}
    for (let i = 1; i <= 15; i++) responses[i] = 4
    const assessment = evaluateMaps15Responses(responses)

    const profile = synthesizeProcrastinationProfile({
      userName: 'Rian',
      personalGoal: 'THESIS',
      personalObstacle: 'OVERWHELMED',
      appExpectation: 'BREAK_BIG_TASKS',
      maps15Assessment: assessment,
    })

    const task = generateTailoredStarterTask(profile, 'Rian')
    expect(task.title).toContain('Skripsi')
    expect(task.scale).toBe('Besar')
    expect(task.subtasks).toHaveLength(3)
    expect(task.subtasks[0].isZeigarnikStarter).toBe(true)
    expect(task.woop.wish).toContain('Skripsi')
  })
})
