/**
 * Axis Renderer
 * 
 * Renders axes using Canvas with D3 scale integration
 */

import type { AxisOrientation, RenderableConfig } from '../../core/types';
import type { AnyScale } from '../scales/scale-manager';
import { ScaleManager } from '../scales/scale-manager';

export interface AxisConfig extends RenderableConfig {
  orientation: AxisOrientation;
  scale: AnyScale;
  tickCount?: number;
  tickSize?: number;
  tickPadding?: number;
  tickFormat?: (value: unknown) => string;
  label?: string;
  labelOffset?: number;
  showDomain?: boolean;
  showTicks?: boolean;
  showTickLabels?: boolean;
  strokeStyle?: string;
  fillStyle?: string;
  font?: string;
}

export class AxisRenderer {
  private config: Required<AxisConfig>;

  constructor(config: AxisConfig) {
    this.config = {
      layer: config.layer ?? 1,
      visible: config.visible ?? true,
      zIndex: config.zIndex ?? 0,
      orientation: config.orientation,
      scale: config.scale,
      tickCount: config.tickCount ?? 10,
      tickSize: config.tickSize ?? 6,
      tickPadding: config.tickPadding ?? 3,
      tickFormat: config.tickFormat ?? ScaleManager.getTickFormat(config.scale),
      label: config.label ?? '',
      labelOffset: config.labelOffset ?? 40,
      showDomain: config.showDomain ?? true,
      showTicks: config.showTicks ?? true,
      showTickLabels: config.showTickLabels ?? true,
      strokeStyle: config.strokeStyle ?? '#666',
      fillStyle: config.fillStyle ?? '#333',
      font: config.font ?? '12px sans-serif',
    };
  }

  render(ctx: CanvasRenderingContext2D, x: number, y: number, length: number): void {
    if (!this.config.visible) return;

    ctx.save();
    ctx.strokeStyle = this.config.strokeStyle;
    ctx.fillStyle = this.config.fillStyle;
    ctx.font = this.config.font;
    ctx.lineWidth = 1;

    const isHorizontal = this.config.orientation === 'top' || this.config.orientation === 'bottom';
    const isTop = this.config.orientation === 'top';
    const isLeft = this.config.orientation === 'left';

    // Draw domain line
    if (this.config.showDomain) {
      ctx.beginPath();
      if (isHorizontal) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + length, y);
      } else {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + length);
      }
      ctx.stroke();
    }

    // Get ticks
    const ticks = ScaleManager.getTicks(this.config.scale, this.config.tickCount);
    
    // Draw ticks and labels
    for (const tick of ticks) {
      const position = this.config.scale(tick as never) as number;
      
      if (position === undefined || isNaN(position)) continue;

      const tickX = isHorizontal ? x + position : x;
      const tickY = isHorizontal ? y : y + position;

      // Draw tick mark
      if (this.config.showTicks) {
        ctx.beginPath();
        if (isHorizontal) {
          const tickY1 = isTop ? y - this.config.tickSize : y;
          const tickY2 = isTop ? y : y + this.config.tickSize;
          ctx.moveTo(tickX, tickY1);
          ctx.lineTo(tickX, tickY2);
        } else {
          const tickX1 = isLeft ? x - this.config.tickSize : x;
          const tickX2 = isLeft ? x : x + this.config.tickSize;
          ctx.moveTo(tickX1, tickY);
          ctx.lineTo(tickX2, tickY);
        }
        ctx.stroke();
      }

      // Draw tick label
      if (this.config.showTickLabels) {
        const label = this.config.tickFormat(tick);
        const metrics = ctx.measureText(label);
        
        let labelX = tickX;
        let labelY = tickY;
        
        if (isHorizontal) {
          labelX = tickX - metrics.width / 2;
          labelY = isTop 
            ? y - this.config.tickSize - this.config.tickPadding
            : y + this.config.tickSize + this.config.tickPadding + 10;
        } else {
          labelX = isLeft
            ? x - this.config.tickSize - this.config.tickPadding - metrics.width
            : x + this.config.tickSize + this.config.tickPadding;
          labelY = tickY + 4; // Vertical centering approximation
        }
        
        ctx.fillText(label, labelX, labelY);
      }
    }

    // Draw axis label
    if (this.config.label) {
      ctx.save();
      ctx.font = `bold ${this.config.font}`;
      
      if (isHorizontal) {
        const labelX = x + length / 2;
        const labelY = isTop
          ? y - this.config.labelOffset
          : y + this.config.labelOffset;
        const metrics = ctx.measureText(this.config.label);
        ctx.fillText(this.config.label, labelX - metrics.width / 2, labelY);
      } else {
        ctx.translate(
          isLeft ? x - this.config.labelOffset : x + this.config.labelOffset,
          y + length / 2
        );
        ctx.rotate(-Math.PI / 2);
        const metrics = ctx.measureText(this.config.label);
        ctx.fillText(this.config.label, -metrics.width / 2, 0);
      }
      
      ctx.restore();
    }

    ctx.restore();
  }

  updateScale(scale: AnyScale): void {
    this.config.scale = scale;
  }

  setVisible(visible: boolean): void {
    this.config.visible = visible;
  }
}
