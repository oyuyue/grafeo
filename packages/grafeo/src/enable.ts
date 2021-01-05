import { EVENT_ENABLE, EVENT_DISABLE } from './constants'
import { emit } from './event'

let enabled = false;

export function isEnabled(): boolean {
  return enabled
}

export function enable(): void {
  if (enabled) return;
  enabled = true;
  emit(EVENT_ENABLE)
}

export function disable(): void {
  if (!enabled) return;
  enabled = false;
  emit(EVENT_DISABLE)
}
