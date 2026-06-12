import type { MfeEvent } from '../types';

type EventCallback<T = unknown> = (event: MfeEvent<T>) => void;

/**
 * Option 3: Centralized Event Bus for cross-microfrontend communication.
 *
 * Benefits:
 * - Decoupled pub/sub pattern
 * - Type-safe event names
 * - Supports multiple subscribers
 *
 * vs Custom Events (Option 1): More structured, easier to test
 * vs Shared Redux (Option 2): Better for one-off events, not persistent state
 */
class EventBus {
  private listeners = new Map<string, Set<EventCallback>>();

  subscribe<T = unknown>(eventType: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback as EventCallback);

    return () => {
      this.listeners.get(eventType)?.delete(callback as EventCallback);
    };
  }

  publish<T = unknown>(eventType: string, payload: T, source = 'unknown'): void {
    const event: MfeEvent<T> = {
      type: eventType,
      payload,
      source,
      timestamp: Date.now(),
    };

    this.listeners.get(eventType)?.forEach((cb) => cb(event));

    // Also dispatch as DOM CustomEvent for Option 1 interoperability
    window.dispatchEvent(
      new CustomEvent(`mfe:${eventType}`, { detail: event }),
    );
  }

  clear(eventType?: string): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }
}

export const eventBus = new EventBus();

/** Predefined event types for type safety */
export const MFE_EVENTS = {
  USER_SELECTED: 'user:selected',
  REPORT_GENERATED: 'report:generated',
  THEME_CHANGED: 'theme:changed',
  AUTH_LOGOUT: 'auth:logout',
  NOTIFICATION: 'notification',
} as const;

/**
 * Option 1: Custom Events helper
 * Simple, native browser API - good for loose coupling
 */
export function dispatchMfeEvent<T>(type: string, payload: T, source = 'unknown'): void {
  window.dispatchEvent(
    new CustomEvent(`mfe:${type}`, {
      detail: { type, payload, source, timestamp: Date.now() },
    }),
  );
}

export function listenMfeEvent<T>(
  type: string,
  handler: (event: MfeEvent<T>) => void,
): () => void {
  const listener = (e: Event) => {
    handler((e as CustomEvent<MfeEvent<T>>).detail);
  };
  window.addEventListener(`mfe:${type}`, listener);
  return () => window.removeEventListener(`mfe:${type}`, listener);
}
