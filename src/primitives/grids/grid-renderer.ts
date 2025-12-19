/**
 * Grid Renderer
 * 
 * Renders gridlines using Canvas
 */

import type { RenderableConfig } from '../../core/types';
import type { AnyScale } from '../scales/scale-manager';
import { ScaleManager } from '../scales/scale-manager';

export interface GridConfig extends RenderableConfig {
  xScale?: AnyScale;
  yScale?: AnyScale;
  orientation?: 'horizontal' | 'vertical' | 'both';
  tickCount?: number;
  strokeStyle?: string;
  lineWidth?: number;
  lineDash?: number[];
}

export class GridRenderer {
  private config: {
    layer: number;
    visible: boolean;
    zIndex: number;
    xScale?: AnyScale;
    yScale?: AnyScale;
    orientation: 'horizontal' | 'vertical' | 'both';
    tickCount: number;
    strokeStyle: string;
    lineWidth: number;
    lineDash: number[];
  };

  constructor(config: GridConfig) {
    this.config = {
      layer: config.layer ?? 1,
      visible: config.visible ?? true,
      zIndex: config.zIndex ?? 0,
      xScale: config.xScale,
      yScale: config.yScale,
      orientation: config.orientation ?? 'both',
      tickCount: config.tickCount ?? 10,
      strokeStyle: config.strokeStyle ?? 'rgba(0, 0, 0, 0.1)',
      lineWidth: config.lineWidth ?? 1,
      lineDash: config.lineDash ?? [],
    };
  }

  render(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    if (!this.config.visible) return;

    ctx.save();
    ctx.strokeStyle = this.config.strokeStyle;
    ctx.lineWidth = this.config.lineWidth;
    
    if (this.config.lineDash.length > 0) {
      ctx.setLineDash(this.config.lineDash);
    }

    // Vertical gridlines
    if ((this.config.orientation === 'vertical' || this.config.orientation === 'both') && this.config.xScale) {
      const ticks = ScaleManager.getTicks(this.config.xScale, this.config.tickCount);
      
      for (const tick of ticks) {
        const position = this.config.xScale(tick as never) as number;
        if (position === undefined || isNaN(position)) continue;

        ctx.beginPath();
        ctx.moveTo(x + position, y);
        ctx.lineTo(x + position, y + height);
        ctx.stroke();
      }
    }

    // Horizontal gridlines
    if ((this.config.orientation === 'horizontal' || this.config.orientation === 'both') && this.config.yScale) {
      const ticks = ScaleManager.getTicks(this.config.yScale, this.config.tickCount);
      
      for (const tick of ticks) {
        const position = this.config.yScale(tick as never) as number;
        if (position === undefined || isNaN(position)) continue;

        ctx.beginPath();
        ctx.moveTo(x, y + position);
        ctx.lineTo(x + width, y + position);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  updateScales(xScale?: AnyScale, yScale?: AnyScale): void {
    if (xScale) this.config.xScale = xScale;
    if (yScale) this.config.yScale = yScale;
  }

  setVisible(visible: boolean): void {
    this.config.visible = visible;
  }
}
