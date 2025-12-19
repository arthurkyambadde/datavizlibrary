/**
 * Event Manager
 * 
 * Handles event delegation and normalization for canvas interactions
 */

import type { EventType, EventHandler, NormalizedEvent, Point } from '../../core/types';

export class EventManager {
  private canvas: HTMLCanvasElement;
  private handlers: Map<EventType, Set<EventHandler>>;
  private boundListeners: Map<string, EventListener>;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.handlers = new Map();
    this.boundListeners = new Map();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const eventTypes: EventType[] = [
      'click',
      'mousemove',
      'mouseenter',
      'mouseleave',
      'mousedown',
      'mouseup',
      'touchstart',
      'touchmove',
      'touchend',
    ];

    for (const type of eventTypes) {
      const listener = (e: Event) => this.handleEvent(type, e as MouseEvent | TouchEvent);
      this.boundListeners.set(type, listener);
      this.canvas.addEventListener(type, listener);
    }
  }

  private handleEvent(type: EventType, event: MouseEvent | TouchEvent): void {
    const point = this.getEventPoint(event);
    if (!point) return;

    const normalizedEvent: NormalizedEvent = {
      type,
      point,
      originalEvent: event,
    };

    const handlers = this.handlers.get(type);
    if (handlers) {
      for (const handler of handlers) {
        handler(normalizedEvent);
      }
    }
  }

  private getEventPoint(event: MouseEvent | TouchEvent): Point | null {
    const rect = this.canvas.getBoundingClientRect();

    if (event instanceof MouseEvent) {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    } else if (event instanceof TouchEvent && event.touches.length > 0) {
      const touch = event.touches[0];
      if (!touch) return null;
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }

    return null;
  }

  on(type: EventType, handler: EventHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)?.add(handler);
  }

  off(type: EventType, handler: EventHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  destroy(): void {
    for (const [type, listener] of this.boundListeners) {
      this.canvas.removeEventListener(type, listener);
    }
    this.boundListeners.clear();
    this.handlers.clear();
  }
}
