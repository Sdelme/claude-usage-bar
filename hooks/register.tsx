import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Snapshot, Window } from '../types'

const snapshot = atom({ plugin: 'usage-bar', key: 'snapshot' } as const, null)

const SEUILS = [80, 90]
const NOMS: Record<string, string> = { five_hour: '5 h', seven_day: '7 j', spend_limit: 'Budget' }

const barre = (p: number, n = 10) => {
  const plein = Math.max(0, Math.min(n, Math.round((p / 100) * n)))
  return '█'.repeat(plein) + '░'.repeat(n - plein)
}

const dans = (iso: string | undefined, maintenant: number) => {
  if (!iso) return ''
  const ms = Date.parse(iso) - maintenant
  if (!(ms > 0)) return ' · reset imminent'
  const min = Math.round(ms / 60000)
  const j = Math.floor(min / 1440)
  const h = Math.floor((min % 1440) / 60)
  const m = min % 60
  if (j > 0) return ` · reset dans ${j} j ${h} h`
  if (h > 0) return ` · reset dans ${h} h ${String(m).padStart(2, '0')}`
  return ` · reset dans ${m} min`
}

const dejaAlerte: Record<string, number> = {}

async function mesurer($: EngineInterface, fenetres: Window[], contexte: number | null) {
  const s: Snapshot = {
    windows: fenetres.map(w => ({ kind: w.kind, percentUsed: w.percentUsed, resetsAt: w.resetsAt })),
    contextPercent: contexte,
  }
  await update($, snapshot, () => s)
  for (const w of s.windows) {
    const atteint = SEUILS.filter(t => w.percentUsed >= t).pop() ?? 0
    if (atteint > (dejaAlerte[w.kind] ?? 0)) {
      $.ui.toast(`Attention : ${NOMS[w.kind] ?? w.kind} à ${w.percentUsed} %`, { timeoutMs: 8000 })
    }
    dejaAlerte[w.kind] = atteint
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    const u = await $.session.usage()
    await mesurer($, u.rateLimits, u.context.percent ?? null)
    return r
  })

  on('session.measure', async ($, e, next) => {
    await mesurer($, e.rateLimits, e.context.percent ?? null)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const s = await read($, snapshot)
    if (e.props.hasSurvey || s === null) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const maintenant = await $.clock.now()
    const fenetres = s.windows.filter(w => w.kind in NOMS)

    return (
      <Box flexDirection="row" flexWrap="wrap">
        {fenetres.length === 0 && <Text dimColor>Limites : en attente de la première réponse</Text>}
        {fenetres.map(w => (
          <Text color={w.percentUsed >= 90 ? 'red' : w.percentUsed >= 80 ? 'yellow' : undefined}>
            {NOMS[w.kind]} {barre(w.percentUsed)} {w.percentUsed} %{dans(w.resetsAt, maintenant)}{'   '}
          </Text>
        ))}
        {s.contextPercent !== null && <Text dimColor>Contexte {s.contextPercent} %</Text>}
      </Box>
    )
  })
}
