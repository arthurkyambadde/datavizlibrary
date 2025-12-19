/**
 * Chart - Main composable chart class
 * 
 * Orchestrates rendering, interactions, and lifecycle
 */

import { CanvasRenderer } from './core/renderer/canvas-renderer';
import { CoordinateSystem } from './core/coordinate/coordinate-system';
import { EventManager } from './interactions/events/event-manager';
import type { Margin, RenderLayer, RenderableConfig } from './core/types';

export interface ChartConfig {
  container: string | HTMLElement;
  width: number;
  height: number;
  margin?: Margin;
  backgroundColor?: string;
}

interface Renderable {
  render(ctx: CanvasRenderingContext2D): void;
  layer?: RenderLayer;
  visible?: boolean;
}

export class Chart {
  private renderer: CanvasRenderer;
  private coordinateSystem: CoordinateSystem;
  private eventManager: EventManager;
  private renderables: Map<RenderLayer, Renderable[]>;
  private config: Required<ChartConfig>;

  constructor(config: ChartConfig) {
    this.config = {
      container: config.container,
      width: config.width,
      height: config.height,
      margin: config.margin ?? { top: 20, right: 20, bottom: 40, left: 50 },
      backgroundColor: config.backgroundColor ?? '#ffffff',
    };

    this.renderer = new CanvasRenderer({
      container: this.config.container,
      width: this.config.width,
      height: this.config.height,
    });

    this.coordinateSystem = new CoordinateSystem({
      width: this.config.width,
      height: this.config.height,
      margin: this.config.margin,
    });

    const interactionCanvas = this.renderer.getLayer(RenderLayer.Interaction).getCanvas();
    this.eventManager = new EventManager(interactionCanvas);

    this.renderables = new Map();
  }

  /**
   * Add a renderable component to the chart
   */
  add(renderable: Renderable): this {
    const layer = renderable.layer ?? RenderLayer.Data;
    
    if (!this.renderables.has(layer)) {
      this.renderables.set(layer, []);
    }
    
    this.renderables.get(layer)?.push(renderable);
    return this;
  }

  /**
   * Render all components
   */
  render(): void {
    // Clear all layers
    this.renderer.clearAll();

    // Draw background
    const bgCtx = this.renderer.getContext(RenderLayer.Background);
    bgCtx.fillStyle = this.config.backgroundColor;
    bgCtx.fillRect(0, 0, this.config.width, this.config.height);

    // Render each layer in order
    const layers = [
      RenderLayer.Background,
      RenderLayer.Grid,
      RenderLayer.Data,
      RenderLayer.Interaction,
      RenderLayer.Overlay,
    ];

    for (const layer of layers) {
      const components = this.renderables.get(layer);
      if (!components) continue;

      const ctx = this.renderer.getContext(layer);
      
      for (const component of components) {
        if (component.visible !== false) {
          component.render(ctx);
        }
      }
    }
  }

  /**
   * Update chart data and re-render
   */
  update(config?: Partial<ChartConfig>): void {
    if (config?.width !== undefined || config?.height !== undefined) {
      const width = config.width ?? this.config.width;
      const height = config.height ?? this.config.height;
      
      this.config.width = width;
      this.config.height = height;
      
      this.renderer.resize(width, height);
      this.coordinateSystem.resize(width, height);
    }

    if (config?.margin !== undefined) {
      this.config.margin = { ...this.config.margin, ...config.margin };
      this.coordinateSystem.setMargin(this.config.margin);
    }

    this.render();
  }

  /**
   * Get the coordinate system
   */
  getCoordinateSystem(): CoordinateSystem {
    return this.coordinateSystem;
  }

  /**
   * Get the event manager
   */
  getEventManager(): EventManager {
    return this.eventManager;
  }

  /**
   * Get the renderer
   */
  getRenderer(): CanvasRenderer {
    return this.renderer;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.renderer.destroy();
    this.eventManager.destroy();
    this.renderables.clear();
  }
}
