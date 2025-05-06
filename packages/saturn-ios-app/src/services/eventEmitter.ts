/**
 * Event emitter service for app-wide events
 * Used to decouple components and services for better maintainability
 */

// Define event types to ensure type safety
export enum EventType {
  // Auth events
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGOUT = 'LOGOUT',

  // Add more event types as needed
}

// Type for event listeners
type Listener = (data?: any) => void;

// Event emitter singleton
class EventEmitter {
  private listeners: Map<EventType, Set<Listener>>;

  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param event The event to listen for
   * @param listener The function to call when event is emitted
   * @returns A function to unsubscribe the listener
   */
  on(event: EventType, listener: Listener): () => void {
    // Create listener set if it doesn't exist
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    // Add listener to set
    this.listeners.get(event)?.add(listener);

    // Return function to remove the listener
    return () => {
      this.off(event, listener);
    };
  }

  /**
   * Unsubscribe from an event
   * @param event The event to unsubscribe from
   * @param listener The listener to remove
   */
  off(event: EventType, listener: Listener): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit an event to all listeners
   * @param event The event to emit
   * @param data Optional data to pass to listeners
   */
  emit(event: EventType, data?: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event
   * @param event The event to clear listeners for
   */
  clearListeners(event?: EventType): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Export a singleton instance
export const eventEmitter = new EventEmitter();

// Default export for backward compatibility
export default eventEmitter;
