// functions/api/sync.ts - Cloudflare Pages Function for Lightweight On-Demand Participant Cloud Vault
interface Env {
  JADWALIN_KV?: {
    get(key: string, type?: 'text' | 'json'): Promise<any>
    put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
  }
}

interface EventContext<Env, P extends string, Data> {
  request: Request
  functionPath: string
  env: Env
  params: Record<P, string | string[]>
  data: Data
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>
  waitUntil: (promise: Promise<any>) => void
}

type PagesFunction<Env = unknown, P extends string = string, Data = Record<string, unknown>> = (
  context: EventContext<Env, P, Data>
) => Response | Promise<Response>

// Ephemeral fallback memory in case KV namespace is not yet bound in Pages dashboard
const memoryVault = new Map<string, { body: string; updatedAtIso: string }>()

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json; charset=utf-8',
}

function generateSyncCode(): string {
  // 4 characters of unambiguous characters (A-Z, 2-9, excluding 0, O, 1, I)
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `JDW-${result}`
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

// POST /api/sync - Save / Update Participant Backup
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ success: false, error: 'Format data JSON tidak valid.' }),
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const rawCode = typeof body.syncCode === 'string' ? body.syncCode.trim().toUpperCase() : ''
    const syncCode = rawCode && rawCode.startsWith('JDW-') && rawCode.length >= 7
      ? rawCode
      : generateSyncCode()

    const participantName = typeof body.participantName === 'string' ? body.participantName.trim() : 'Peserta'
    const payload = body.payload

    if (!payload || typeof payload !== 'object') {
      return new Response(
        JSON.stringify({ success: false, error: 'Payload cadangan tugas tidak boleh kosong.' }),
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const updatedAtIso = new Date().toISOString()
    const record = {
      syncCode,
      participantName,
      payload,
      updatedAtIso,
    }
    const jsonString = JSON.stringify(record)

    const storageKey = `vault:${syncCode}`

    // 1. Save to Cloudflare KV if bound (90 days TTL)
    if (context.env?.JADWALIN_KV) {
      await context.env.JADWALIN_KV.put(storageKey, jsonString, {
        expirationTtl: 60 * 60 * 24 * 90, // 90 days
      })
    } else {
      // Ephemeral memory fallback
      memoryVault.set(storageKey, { body: jsonString, updatedAtIso })
    }

    return new Response(
      JSON.stringify({
        success: true,
        syncCode,
        participantName,
        updatedAtIso,
        storageType: context.env?.JADWALIN_KV ? 'Cloudflare KV (Persistent)' : 'Edge Memory (Unbound KV)',
        message: 'Data tugas peserta berhasil dicadangkan ke Cloudflare Vault.',
      }),
      { status: 200, headers: CORS_HEADERS }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || 'Gagal menyimpan ke cloud.' }),
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

// GET /api/sync?code=JDW-XXXX - Retrieve Participant Backup on New Device
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url)
    const code = (url.searchParams.get('code') || '').trim().toUpperCase()

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Parameter ?code=JDW-XXXX diperlukan.' }),
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const storageKey = `vault:${code}`
    let rawData: string | null = null

    if (context.env?.JADWALIN_KV) {
      rawData = await context.env.JADWALIN_KV.get(storageKey, 'text')
    } else {
      rawData = memoryVault.get(storageKey)?.body || null
    }

    if (!rawData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Kode sinkronisasi "${code}" tidak ditemukan atau sudah kedaluwarsa. Pastikan kode yang dimasukkan benar.`,
        }),
        { status: 404, headers: CORS_HEADERS }
      )
    }

    const parsed = JSON.parse(rawData)
    return new Response(
      JSON.stringify({
        success: true,
        syncCode: parsed.syncCode,
        participantName: parsed.participantName,
        payload: parsed.payload,
        updatedAtIso: parsed.updatedAtIso,
      }),
      { status: 200, headers: CORS_HEADERS }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || 'Gagal membaca cadangan dari cloud.' }),
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
