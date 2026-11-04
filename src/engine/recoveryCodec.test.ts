import { describe, expect, it } from 'vitest'
import { DEFAULT_HABIT_REMINDER_CONFIG } from '../data/constants'
import {
  computeChecksum,
  decodeGameCommitmentCode,
  decodeMobileRecoveryCode,
  encodeMobileRecoveryCode,
  validateJsonBackupString,
} from './recoveryCodec'
import type { MobileBackupPayload } from '../data/types'

describe('recoveryCodec', () => {
  it('encodes and decodes JDW-MOB recovery strings losslessly', () => {
    const samplePayload: MobileBackupPayload = {
      version: 1,
      exportedAtIso: '2026-11-04T10:00:00.000Z',
      participantName: 'Alya Putri',
      characterId: 'CHR-03',
      tasks: [],
      completedDates: ['2026-11-03', '2026-11-04'],
      reminderConfig: DEFAULT_HABIT_REMINDER_CONFIG,
      gameCommitment: null,
    }

    const code = encodeMobileRecoveryCode(samplePayload)
    expect(code.startsWith('JDW-MOB|v1|')).toBe(true)

    const decoded = decodeMobileRecoveryCode(code)
    expect(decoded).not.toBeNull()
    expect(decoded?.participantName).toBe('Alya Putri')
    expect(decoded?.characterId).toBe('CHR-03')
    expect(decoded?.completedDates).toEqual(['2026-11-03', '2026-11-04'])

    // Tampered checksum should return null
    expect(decodeMobileRecoveryCode(`${code.slice(0, -3)}ZZZ`)).toBeNull()
  })

  it('validates JSON backup string accurately', () => {
    const payload: MobileBackupPayload = {
      version: 1,
      exportedAtIso: '2026-11-04T10:00:00.000Z',
      participantName: 'Raden',
      characterId: 'CHR-01',
      tasks: [],
      completedDates: [],
      reminderConfig: DEFAULT_HABIT_REMINDER_CONFIG,
      gameCommitment: null,
    }
    expect(validateJsonBackupString(JSON.stringify(payload))?.participantName).toBe('Raden')
    expect(validateJsonBackupString('{"invalid": true}')).toBeNull()
  })

  it('decodes JI-R1 game commitment code from Jadwal-In main game', () => {
    const body = [
      'JI-R1',
      'K:04',
      'C:CHR-04',
      'E:END_02',
      'G:3.55',
      'S:820',
      'ST:4',
      'T:6',
      'M:70,65,80,72',
      'A:DEADLINER',
      'I:20,10,0,30,0,10,10,0,10',
      'PF:timeManagement',
      'PC:TEK_02,TEK_25,TEK_01',
      `PI:${encodeURIComponent('Tenggat waktu tugas tersisa kurang dari 6 babak')}`,
      `PT:${encodeURIComponent('Pecah tugas dengan Task Chunking atau susun prioritas')}`,
    ].join('|')
    const chk = computeChecksum(body)
    const fullCode = `${body}|CHK:${chk}`

    const imported = decodeGameCommitmentCode(fullCode)
    expect(imported).not.toBeNull()
    expect(imported?.groupCode).toBe('04')
    expect(imported?.characterId).toBe('CHR-04')
    expect(imported?.focusDimension).toBe('timeManagement')
    expect(imported?.committedCardIds).toEqual(['TEK_02', 'TEK_25', 'TEK_01'])
    expect(imported?.ifCondition).toContain('Tenggat waktu')
  })
})
