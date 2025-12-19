/**
 * Bar Chart Implementation
 * 
 * High-performance bar chart with Canvas rendering
 */

import type { Accessor, DataPoint, RenderableConfig } from '../../core/types';
import type { AnyScale } from '../../primitives/scales/scale-manager';

export interface BarChartConfig<T extends DataPoint> extends RenderableConfig {
  data: T[];
  x: Accessor<T, string | number>;
  y: Accessor<T, number>;
  xScale: AnyScale;
  yScale: AnyScale;
  fill?: string | Accessor<T, string>;
  stroke?: string;
  strokeWidth?: number;
  barPadding?: number;
  orientation?: 'vertical' | 'horizontal';
}

export class BarChart<T extends DataPoint> {
  private config: Required<BarChartConfig<T>>;

  constructor(config: BarChartConfig<T>) {
    this.config = {
      layer: config.layer ?? 2,
      visible: config.visible ?? true,
      zIndex: config.zIndex ?? 0,
      data: config.data,
      x: config.x,
      y: config.y,
      xScale: config.xScale,
      yScale: config.yScale,
      fill: config.fill ?? '#4f46e5',
      stroke: config.stroke ?? 'none',
      strokeWidth: config.strokeWidth ?? 0,
      barPadding: config.barPadding ?? 0.1,
      orientation: config.orientation ?? 'vertical',
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.config.visible) return;

    ctx.save();

    for (let i = 0; i < this.config.data.length; i++) {
      const datum = this.config.data[i];
      if (!datum) continue;

      const xVal = this.config.x(datum, i);
      const yVal = this.config.y(datum, i);

      if (this.config.orientation === 'vertical') {
        this.renderVerticalBar(ctx, datum, i, xVal, yVal);
      } else {
        this.renderHorizontalBar(ctx, datum, i, xVal, yVal);
      }
    }

    ctx.restore();
  }

  private renderVerticalBar(
    ctx: CanvasRenderingContext2D,
    datum: T,
    index: number,
    xVal: string | number,
    yVal: number
  ): void {
    // Get x position and bandwidth
    const x = this.config.xScale(xVal as never) as number;
    const y = this.config.yScale(yVal as never) as number;
    const y0 = this.config.yScale(0 as never) as number;

    if (x === undefined || y === undefined || y0 === undefined) return;

    // Get bar width from band scale
    let barWidth = 0;
    if ('bandwidth' in this.config.xScale && typeof this.config.xScale.bandwidth === 'function') {
      barWidth = this.config.xScale.bandwidth();
    }

    const barHeight = Math.abs(y0 - y);

    // Apply padding
    const padding = barWidth * this.config.barPadding;
    const adjustedWidth = barWidth - padding;
    const adjustedX = x + padding / 2;

    // Fill
    const fillStyle = typeof this.config.fill === 'function' 
      ? this.config.fill(datum, index)
      : this.config.fill;
    
    ctx.fillStyle = fillStyle;
    ctx.fillRect(adjustedX, Math.min(y, y0), adjustedWidth, barHeight);

    // Stroke
    if (this.config.stroke !== 'none' && this.config.strokeWidth > 0) {
      ctx.strokeStyle = this.config.stroke;
      ctx.lineWidth = this.config.strokeWidth;
      ctx.strokeRect(adjustedX, Math.min(y, y0), adjustedWidth, barHeight);
    }
  }

  private renderHorizontalBar(
    ctx: CanvasRenderingContext2D,
    datum: T,
    index: number,
    xVal: string | number,
    yVal: number
  ): void {
    const y = this.config.yScale(xVal as never) as number;
    const x = this.config.xScale(0 as never) as number;
    const x1 = this.config.xScale(yVal as never) as number;

    if (x === undefined || x1 === undefined || y === undefined) return;

    let barHeight = 0;
    if ('bandwidth' in this.config.yScale && typeof this.config.yScale.bandwidth === 'function') {
      barHeight = this.config.yScale.bandwidth();
    }

    const barWidth = Math.abs(x1 - x);

    const padding = barHeight * this.config.barPadding;
    const adjustedHeight = barHeight - padding;
    const adjustedY = y + padding / 2;

    const fillStyle = typeof this.config.fill === 'function'
      ? this.config.fill(datum, index)
      : this.config.fill;

    ctx.fillStyle = fillStyle;
    ctx.fillRect(Math.min(x, x1), adjustedY, barWidth, adjustedHeight);

    if (this.config.stroke !== 'none' && this.config.strokeWidth > 0) {
      ctx.strokeStyle = this.config.stroke;
      ctx.lineWidth = this.config.strokeWidth;
      ctx.strokeRect(Math.min(x, x1), adjustedY, barWidth, adjustedHeight);
    }
  }

  updateData(data: T[]): void {
    this.config.data = data;
  }

  updateScales(xScale: AnyScale, yScale: AnyScale): void {
    this.config.xScale = xScale;
    this.config.yScale = yScale;
  }

  setVisible(visible: boolean): void {
    this.config.visible = visible;
  }

  getData(): T[] {
    return this.config.data;
  }

  /**
   * Find bar at given coordinates
   */
  findBarAtPoint(x: number, y: number): { datum: T; index: number } | null {
    for (let i = 0; i < this.config.data.length; i++) {
      const datum = this.config.data[i];
      if (!datum) continue;

      const xVal = this.config.x(datum, i);
      const yVal = this.config.y(datum, i);

      if (this.config.orientation === 'vertical') {
        const barX = this.config.xScale(xVal as never) as number;
        const barY = this.config.yScale(yVal as never) as number;
        const y0 = this.config.yScale(0 as never) as number;

        let barWidth = 0;
        if ('bandwidth' in this.config.xScale && typeof this.config.xScale.bandwidth === 'function') {
          barWidth = this.config.xScale.bandwidth();
        }

        const barHeight = Math.abs(y0 - barY);

        if (
          x >= barX &&
          x <= barX + barWidth &&
          y >= Math.min(barY, y0) &&
          y <= Math.min(barY, y0) + barHeight
        ) {
          return { datum, index: i };
        }
      }
    }

    return null;
  }
}
