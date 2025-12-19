/**
 * Tooltip System
 * 
 * Manages tooltip display and positioning
 */

import type { Point } from '../../core/types';

export interface TooltipConfig {
  container?: HTMLElement;
  offset?: Point;
  className?: string;
}

export class TooltipSystem {
  private element: HTMLDivElement;
  private container: HTMLElement;
  private offset: Point;
  private visible: boolean = false;

  constructor(config: TooltipConfig = {}) {
    this.container = config.container ?? document.body;
    this.offset = config.offset ?? { x: 10, y: 10 };

    // Create tooltip element
    this.element = document.createElement('div');
    this.element.className = config.className ?? 'vizkit-tooltip';
    this.element.style.position = 'absolute';
    this.element.style.pointerEvents = 'none';
    this.element.style.opacity = '0';
    this.element.style.transition = 'opacity 0.2s';
    this.element.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    this.element.style.color = 'white';
    this.element.style.padding = '8px 12px';
    this.element.style.borderRadius = '4px';
    this.element.style.fontSize = '12px';
    this.element.style.zIndex = '1000';
    this.element.style.whiteSpace = 'nowrap';

    this.container.appendChild(this.element);
  }

  show(content: string, position: Point): void {
    this.element.innerHTML = content;
    this.element.style.left = `${position.x + this.offset.x}px`;
    this.element.style.top = `${position.y + this.offset.y}px`;
    this.element.style.opacity = '1';
    this.visible = true;
  }

  hide(): void {
    this.element.style.opacity = '0';
    this.visible = false;
  }

  isVisible(): boolean {
    return this.visible;
  }

  destroy(): void {
    this.element.remove();
  }
}
