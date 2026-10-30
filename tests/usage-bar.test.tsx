import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'usage-bar',
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 120, scroll: { offset: 0, bodyRows: 10 }, view: {} },
} as const

test('la barre affiche 5 h, 7 j et le contexte, avec alerte à 80 %', async ($, on) => {
  const toasts: string[] = []
  on('ui.toast', (_, e) => { toasts.push(e.text); return { value: undefined } })
  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('clock.now', () => ({ value: Date.now() }))

  await $.session.measure({
    context: { window: 200000, tokens: 46000, percent: 23 },
    rateLimits: [
      { kind: 'five_hour', percentUsed: 82, resetsAt: new Date(Date.now() + 2 * 3600e3 + 15 * 60e3).toISOString() },
      { kind: 'seven_day', percentUsed: 12.5, resetsAt: new Date(Date.now() + 3 * 86400e3).toISOString() },
    ],
    changed: ['rateLimits', 'context'],
  })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })
    expect((await ui.find({ type: 'Text', text: /^5 h/ }))?.text).toMatch(/82 %.*reset dans 2 h/)
    expect((await ui.find({ type: 'Text', text: /^7 j/ }))?.text).toMatch(/12\.5 %.*reset dans 3 j/)
    expect((await ui.find({ type: 'Text', text: /Contexte/ }))?.text).toBe('Contexte 23 %')
    await ui.unmount()
  }
  expect(toasts).toEqual(['Attention : 5 h à 82 %'])
})
