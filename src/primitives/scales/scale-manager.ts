/**
 * Scale Manager
 * 
 * Integrates D3 scales with type-safe wrappers
 */

import {
  scaleLinear,
  scaleLog,
  scalePow,
  scaleSqrt,
  scaleTime,
  scaleBand,
  scalePoint,
  scaleOrdinal,
  type ScaleLinear,
  type ScaleLogarithmic,
  type ScalePower,
  type ScaleTime,
  type ScaleBand,
  type ScalePoint,
  type ScaleOrdinal,
} from 'd3-scale';
import { extent, min, max } from 'd3-array';
import type { ScaleType, Accessor, DataPoint } from '../../core/types';

export type AnyScale =
  | ScaleLinear<number, number>
  | ScaleLogarithmic<number, number>
  | ScalePower<number, number>
  | ScaleTime<number, number>
  | ScaleBand<string>
  | ScalePoint<string>
  | ScaleOrdinal<string, number>;

export interface ScaleConfig<T = unknown> {
  type: ScaleType;
  domain?: T[];
  range?: number[];
  nice?: boolean;
  clamp?: boolean;
  padding?: number; // For band/point scales
}

export class ScaleManager {
  /**
   * Create a scale from configuration
   */
  static createScale(config: ScaleConfig): AnyScale {
    let scale: AnyScale;

    switch (config.type) {
      case 'linear':
        scale = scaleLinear();
        break;
      case 'log':
        scale = scaleLog();
        break;
      case 'pow':
        scale = scalePow();
        break;
      case 'sqrt':
        scale = scaleSqrt();
        break;
      case 'time':
        scale = scaleTime();
        break;
      case 'band':
        scale = scaleBand();
        if (config.padding !== undefined) {
          scale.padding(config.padding);
        }
        break;
      case 'point':
        scale = scalePoint();
        if (config.padding !== undefined) {
          scale.padding(config.padding);
        }
        break;
      case 'ordinal':
        scale = scaleOrdinal<string, number>();
        break;
      default:
        throw new Error(`Unknown scale type: ${config.type}`);
    }

    if (config.domain) {
      // @ts-expect-error - Domain types vary by scale
      scale.domain(config.domain);
    }

    if (config.range) {
      // @ts-expect-error - Range types vary by scale
      scale.range(config.range);
    }

    if (config.nice && 'nice' in scale) {
      scale.nice();
    }

    if (config.clamp && 'clamp' in scale) {
      scale.clamp(config.clamp);
    }

    return scale;
  }

  /**
   * Compute domain from data
   */
  static computeDomain<T extends DataPoint>(
    data: T[],
    accessor: Accessor<T, number | Date | string>,
    scaleType: ScaleType
  ): (number | Date | string)[] {
    if (scaleType === 'band' || scaleType === 'point' || scaleType === 'ordinal') {
      // Categorical scales - extract unique values
      const values = data.map((d, i) => accessor(d, i));
      return Array.from(new Set(values));
    }

    // Continuous scales - compute extent
    const values = data.map((d, i) => accessor(d, i)) as (number | Date)[];
    const [minVal, maxVal] = extent(values);

    if (minVal === undefined || maxVal === undefined) {
      throw new Error('Cannot compute domain: no valid data');
    }

    return [minVal, maxVal];
  }

  /**
   * Update scale domain
   */
  static updateDomain(scale: AnyScale, domain: unknown[]): void {
    // @ts-expect-error - Domain types vary by scale
    scale.domain(domain);
  }

  /**
   * Update scale range
   */
  static updateRange(scale: AnyScale, range: number[]): void {
    // @ts-expect-error - Range types vary by scale
    scale.range(range);
  }

  /**
   * Get ticks for a continuous scale
   */
  static getTicks(scale: AnyScale, count?: number): number[] | Date[] {
    if ('ticks' in scale && typeof scale.ticks === 'function') {
      return scale.ticks(count);
    }
    return [];
  }

  /**
   * Get tick format function
   */
  static getTickFormat(scale: AnyScale, count?: number, specifier?: string): (value: unknown) => string {
    if ('tickFormat' in scale && typeof scale.tickFormat === 'function') {
      return scale.tickFormat(count, specifier) as (value: unknown) => string;
    }
    return (value: unknown) => String(value);
  }
}
