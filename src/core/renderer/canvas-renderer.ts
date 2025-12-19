/**
 * Multi-layered Canvas Renderer
 * 
 * Manages multiple canvas layers for efficient rendering:
 * - Background: Static elements (axes, grids)
 * - Data: Chart marks
 * - Interaction: Hover states
 * - Overlay: Tooltips, annotations
 */

import type { Rect, RenderLayer } from '../types';

export interface CanvasLayerConfig {
  width: number;
  height: number;
  devicePixelRatio?: number;
}

export class CanvasLayer {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private dpr: number;
  private isDirty: boolean = true;

  constructor(config: CanvasLayerConfig) {
    this.canvas = document.createElement('canvas');
    this.dpr = config.devicePixelRatio ?? window.devicePixelRatio ?? 1;
    
    // Set display size
    this.canvas.style.width = `${config.width}px`;
    this.canvas.style.height = `${config.height}px`;
    
    // Set actual size in memory (scaled for DPR)
    this.canvas.width = config.width * this.dpr;
    this.canvas.height = config.height * this.dpr;
    
    const ctx = this.canvas.getContext('2d', {
      alpha: true,
      desynchronized: true, // Performance hint
    });
    
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    
    this.context = ctx;
    
    // Scale context to match DPR
    this.context.scale(this.dpr, this.dpr);
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D {
    return this.context;
  }

  clear(rect?: Rect): void {
    if (rect) {
      this.context.clearRect(rect.x, rect.y, rect.width, rect.height);
    } else {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.isDirty = true;
  }

  markDirty(): void {
    this.isDirty = true;
  }

  markClean(): void {
    this.isDirty = false;
  }

  isDirtyLayer(): boolean {
    return this.isDirty;
  }

  resize(width: number, height: number): void {
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    this.context.scale(this.dpr, this.dpr);
    this.isDirty = true;
  }
}

export interface CanvasRendererConfig {
  container: string | HTMLElement;
  width: number;
  height: number;
  devicePixelRatio?: number;
}

export class CanvasRenderer {
  private container: HTMLElement;
  private layers: Map<RenderLayer, CanvasLayer>;
  private width: number;
  private height: number;
  private dpr: number;
  private animationFrameId: number | null = null;

  constructor(config: CanvasRendererConfig) {
    // Resolve container
    if (typeof config.container === 'string') {
      const element = document.querySelector(config.container);
      if (!element) {
        throw new Error(`Container not found: ${config.container}`);
      }
      this.container = element as HTMLElement;
    } else {
      this.container = config.container;
    }

    this.width = config.width;
    this.height = config.height;
    this.dpr = config.devicePixelRatio ?? window.devicePixelRatio ?? 1;

    // Initialize layers
    this.layers = new Map();
    this.initializeLayers();
  }

  private initializeLayers(): void {
    // Create layers in order
    const layerOrder = [
      RenderLayer.Background,
      RenderLayer.Grid,
      RenderLayer.Data,
      RenderLayer.Interaction,
      RenderLayer.Overlay,
    ];

    this.container.style.position = 'relative';

    for (const layerType of layerOrder) {
      const layer = new CanvasLayer({
        width: this.width,
        height: this.height,
        devicePixelRatio: this.dpr,
      });

      const canvas = layer.getCanvas();
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = layerType === RenderLayer.Interaction ? 'auto' : 'none';

      this.container.appendChild(canvas);
      this.layers.set(layerType, layer);
    }
  }

  getLayer(layer: RenderLayer): CanvasLayer {
    const canvasLayer = this.layers.get(layer);
    if (!canvasLayer) {
      throw new Error(`Layer not found: ${layer}`);
    }
    return canvasLayer;
  }

  getContext(layer: RenderLayer): CanvasRenderingContext2D {
    return this.getLayer(layer).getContext();
  }

  clear(layer: RenderLayer, rect?: Rect): void {
    this.getLayer(layer).clear(rect);
  }

  clearAll(): void {
    for (const layer of this.layers.values()) {
      layer.clear();
    }
  }

  markDirty(layer: RenderLayer): void {
    this.getLayer(layer).markDirty();
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;

    for (const layer of this.layers.values()) {
      layer.resize(width, height);
    }
  }

  /**
   * Schedule a render on the next animation frame
   */
  scheduleRender(callback: () => void): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.animationFrameId = requestAnimationFrame(() => {
      callback();
      this.animationFrameId = null;
    });
  }

  /**
   * Cancel any scheduled render
   */
  cancelRender(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  destroy(): void {
    this.cancelRender();
    
    for (const layer of this.layers.values()) {
      const canvas = layer.getCanvas();
      canvas.remove();
    }
    
    this.layers.clear();
  }
}
