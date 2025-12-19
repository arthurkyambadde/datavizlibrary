/**
 * Line Chart Implementation
 * 
 * High-performance line chart with Canvas rendering
 */

import { line, curveLinear, type CurveFactory } from 'd3-shape';
import type { Accessor, DataPoint, RenderableConfig } from '../../core/types';
import type { AnyScale } from '../../primitives/scales/scale-manager';

export interface LineChartConfig<T extends DataPoint> extends RenderableConfig {
  data: T[];
  x: Accessor<T, number | Date | string>;
  y: Accessor<T, number>;
  xScale: AnyScale;
  yScale: AnyScale;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  curve?: CurveFactory;
  defined?: Accessor<T, boolean>;
}

export class LineChart<T extends DataPoint> {
  private config: Required<LineChartConfig<T>>;
  private path: string | null = null;

  constructor(config: LineChartConfig<T>) {
    this.config = {
      layer: config.layer ?? 2,
      visible: config.visible ?? true,
      zIndex: config.zIndex ?? 0,
      data: config.data,
      x: config.x,
      y: config.y,
      xScale: config.xScale,
      yScale: config.yScale,
      stroke: config.stroke ?? '#4f46e5',
      strokeWidth: config.strokeWidth ?? 2,
      fill: config.fill ?? 'none',
      curve: config.curve ?? curveLinear,
      defined: config.defined ?? (() => true),
    };

    this.computePath();
  }

  private computePath(): void {
    const lineGenerator = line<T>()
      .x((d, i) => {
        const xVal = this.config.x(d, i);
        return this.config.xScale(xVal as never) as number;
      })
      .y((d, i) => {
        const yVal = this.config.y(d, i);
        return this.config.yScale(yVal as never) as number;
      })
      .curve(this.config.curve)
      .defined((d, i) => this.config.defined(d, i));

    this.path = lineGenerator(this.config.data);
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.config.visible || !this.path) return;

    ctx.save();
    
    const path2d = new Path2D(this.path);
    
    // Fill if specified
    if (this.config.fill !== 'none') {
      ctx.fillStyle = this.config.fill;
      ctx.fill(path2d);
    }
    
    // Stroke
    ctx.strokeStyle = this.config.stroke;
    ctx.lineWidth = this.config.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke(path2d);
    
    ctx.restore();
  }

  updateData(data: T[]): void {
    this.config.data = data;
    this.computePath();
  }

  updateScales(xScale: AnyScale, yScale: AnyScale): void {
    this.config.xScale = xScale;
    this.config.yScale = yScale;
    this.computePath();
  }

  setVisible(visible: boolean): void {
    this.config.visible = visible;
  }

  getData(): T[] {
    return this.config.data;
  }

  /**
   * Find nearest data point to a screen coordinate
   */
  findNearestPoint(x: number, y: number, maxDistance = 20): { datum: T; index: number; distance: number } | null {
    let nearest: { datum: T; index: number; distance: number } | null = null;
    let minDistance = maxDistance;

    for (let i = 0; i < this.config.data.length; i++) {
      const datum = this.config.data[i];
      if (!datum || !this.config.defined(datum, i)) continue;

      const xVal = this.config.x(datum, i);
      const yVal = this.config.y(datum, i);
      
      const px = this.config.xScale(xVal as never) as number;
      const py = this.config.yScale(yVal as never) as number;

      if (px === undefined || py === undefined) continue;

      const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = { datum, index: i, distance };
      }
    }

    return nearest;
  }
}
