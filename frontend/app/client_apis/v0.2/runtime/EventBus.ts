/**
 * Простая типобезопасная шина событий.
 * Связывает runtime ↔ renderers ↔ gui без прямых зависимостей.
 *
 * Основные каналы:
 *   "render:data"      → RenderData (автомат → рендерер)
 *   "automaton:event"  → AutomatonEvent (автомат → лог)
 *   "config:changed"   → { key, value } (gui ↔ автомат)
 *   "runtime:state"    → "started" | "paused" | "stopped"
 *   "iteration:tick"   → number (номер шага → gui)
 */

type Handler<T = unknown> = (data: T) => void;

export class EventBus {
  private listeners = new Map<string, Set<Handler>>();

  on<T = unknown>(event: string, handler: Handler<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as Handler);
  }

  off<T = unknown>(event: string, handler: Handler<T>): void {
    this.listeners.get(event)?.delete(handler as Handler);
  }

  emit<T = unknown>(event: string, data?: T): void {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    for (const handler of handlers) {
      try {
        handler(data);
      } catch (err) {
        console.error(`[EventBus] Error in handler for "${event}":`, err);
      }
    }
  }

  /** Удалить все подписки (при destroy) */
  clear(): void {
    this.listeners.clear();
  }
}