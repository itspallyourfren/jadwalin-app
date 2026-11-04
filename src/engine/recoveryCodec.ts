// src/engine/recoveryCodec.ts - Local Recovery Code (JDW-MOB|...), JSON Backup, & Game Commitment (JI-R1|...) Decoder
import { CHARACTER_PROFILES } from '../data/constants'
import { TECHNIQUE_CATALOG } from '../data/toolkitData'
import type {
  CharacterId,
  ImportedGameCommitment,
  MobileBackupPayload,
  TechniqueId,
} from '../data/types'

export function computeChecksum(payload: string): string {
  let hash = 5381
  for (let i = 0; i < payload.length; i++) {
    hash = ((hash << 5) + hash + payload.charCodeAt(i)) & 0xffff
  }
  return hash.toString(36).toUpperCase().padStart(3, '0').slice(-3)
}

function toUtf8Base64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function fromUtf8Base64(b64: string): string {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

/**
 * Menghasilkan Kode Pemulihan Teks (JDW-MOB|v1|<base64>|CHK:<3char>)
 * yang dapat disalin peserta ke WhatsApp/Catatan HP untuk recovery kapan saja tanpa server.
 */
export function encodeMobileRecoveryCode(payload: MobileBackupPayload): string {
  const jsonStr = JSON.stringify(payload)
  const b64 = toUtf8Base64(jsonStr)
  const body = `JDW-MOB|v1|${b64}`
  const chk = computeChecksum(body)
  return `${body}|CHK:${chk}`
}

export function decodeMobileRecoveryCode(rawInput: string): MobileBackupPayload | null {
  const trimmed = rawInput.trim().replace(/^["'`\s]+|["'`\s]+$/g, '')
  if (!trimmed.startsWith('JDW-MOB|v1|')) return null

  const chkIdx = trimmed.lastIndexOf('|CHK:')
  if (chkIdx === -1) return null

  const body = trimmed.slice(0, chkIdx)
  const givenChk = trimmed.slice(chkIdx + 5).trim().toUpperCase()
  if (computeChecksum(body) !== givenChk) return null

  const b64 = body.slice('JDW-MOB|v1|'.length)
  try {
    const jsonStr = fromUtf8Base64(b64)
    const parsed = JSON.parse(jsonStr) as Partial<MobileBackupPayload>
    if (parsed.version !== 1 || !Array.isArray(parsed.tasks)) return null
    return parsed as MobileBackupPayload
  } catch {
    return null
  }
}

export function validateJsonBackupString(rawJson: string): MobileBackupPayload | null {
  try {
    const parsed = JSON.parse(rawJson) as Partial<MobileBackupPayload>
    if (parsed.version !== 1 || !Array.isArray(parsed.tasks)) return null
    return parsed as MobileBackupPayload
  } catch {
    return null
  }
}

/**
 * Mendekode Kode Backup/Komitmen dari Game Utama (`JI-R1|...`)
 * agar rencana Jika-Maka dan 3 Kartu Teknik Pilihan peserta otomatis masuk ke aplikasi HP.
 */
export function decodeGameCommitmentCode(rawInput: string): ImportedGameCommitment | null {
  const trimmed = rawInput.trim().replace(/^["'`\s]+|["'`\s]+$/g, '')
  if (!trimmed.startsWith('JI-R1|')) return null

  const chkIdx = trimmed.lastIndexOf('|CHK:')
  if (chkIdx === -1) return null
  const body = trimmed.slice(0, chkIdx)
  const givenChk = trimmed.slice(chkIdx + 5).trim().toUpperCase()
  if (computeChecksum(body) !== givenChk) return null

  const kv: Record<string, string> = {}
  for (const part of body.split('|').slice(1)) {
    const colonIdx = part.indexOf(':')
    if (colonIdx > 0) {
      kv[part.slice(0, colonIdx)] = part.slice(colonIdx + 1)
    }
  }

  const rawChar = (kv.C || 'CHR-01') as CharacterId
  const characterId: CharacterId = rawChar in CHARACTER_PROFILES ? rawChar : 'CHR-01'

  const validFocus = ['initiation', 'timeManagement', 'focusPersistence'] as const
  const focusDimension = validFocus.includes(kv.PF as (typeof validFocus)[number])
    ? (kv.PF as (typeof validFocus)[number])
    : 'initiation'

  const validTechIds = new Set(TECHNIQUE_CATALOG.map((t) => t.id))
  const committedCardIds: TechniqueId[] =
    kv.PC && kv.PC !== 'NONE'
      ? (kv.PC
          .split(',')
          .map((s) => s.trim())
          .filter((id) => validTechIds.has(id as TechniqueId)) as TechniqueId[])
      : ['TEK_31', 'TEK_02', 'TEK_01']

  let ifCondition = ''
  let thenAction = ''
  try {
    ifCondition = kv.PI ? decodeURIComponent(kv.PI) : 'Merasa ragu atau berat memulai tugas besar'
    thenAction = kv.PT ? decodeURIComponent(kv.PT) : 'Gunakan pemicu 10-Minute Rule / 5-Second Rule untuk mulai'
  } catch {
    ifCondition = kv.PI || 'Merasa ragu atau berat memulai tugas besar'
    thenAction = kv.PT || 'Gunakan pemicu 10-Minute Rule / 5-Second Rule untuk mulai'
  }

  return {
    groupCode: kv.K || '01',
    characterId,
    focusDimension,
    ifCondition,
    thenAction,
    committedCardIds: committedCardIds.length > 0 ? committedCardIds : ['TEK_31', 'TEK_02', 'TEK_01'],
    archetypeShortCode: kv.A || 'HESITANT',
    importedAtIso: new Date().toISOString(),
  }
}
