export type Window = { kind: string; percentUsed: number; resetsAt?: string }
export type Snapshot = { windows: Window[]; contextPercent: number | null }

declare module 'claude-code' {
  interface PluginState {
    'usage-bar': { snapshot: Snapshot | null }
  }
}
