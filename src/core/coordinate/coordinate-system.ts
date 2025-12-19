/**
 * Coordinate System
 * 
 * Manages transformations between screen space and data space,
 * handles margins, and provides viewport management.
 */

import type { Point, Rect, Margin } from '../types';

export interface CoordinateSystemConfig {
  width: number;
  height: number;
  margin: Margin;
}

export class CoordinateSystem {
  private width: number;
  private height: number;
  private margin: Margin;

  constructor(config: CoordinateSystemConfig) {
    this.width = config.width;
    this.height = config.height;
    this.margin = config.margin;
  }

  /**
   * Get the inner width (excluding margins)
   */
  getInnerWidth(): number {
    return Math.max(0, this.width - this.margin.left - this.margin.right);
  }

  /**
   * Get the inner height (excluding margins)
   */
  getInnerHeight(): number {
    return Math.max(0, this.height - this.margin.top - this.margin.bottom);
  }

  /**
   * Get the bounds of the plot area (inner area excluding margins)
   */
  getPlotBounds(): Rect {
    return {
      x: this.margin.left,
      y: this.margin.top,
      width: this.getInnerWidth(),
      height: this.getInnerHeight(),
    };
  }

  /**
   * Get the full bounds including margins
   */
  getFullBounds(): Rect {
    return {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Convert a point from data space to screen space
   * Assumes scales have already been applied
   */
  dataToScreen(point: Point): Point {
    return {
      x: this.margin.left + point.x,
      y: this.margin.top + point.y,
    };
  }

  /**
   * Convert a point from screen space to data space
   * Returns point relative to plot area
   */
  screenToData(point: Point): Point {
    return {
      x: point.x - this.margin.left,
      y: point.y - this.margin.top,
    };
  }

  /**
   * Check if a point is within the plot area
   */
  isInPlotArea(point: Point): boolean {
    const plotBounds = this.getPlotBounds();
    return (
      point.x >= plotBounds.x &&
      point.x <= plotBounds.x + plotBounds.width &&
      point.y >= plotBounds.y &&
      point.y <= plotBounds.y + plotBounds.height
    );
  }

  /**
   * Clamp a point to the plot area
   */
  clampToPlotArea(point: Point): Point {
    const plotBounds = this.getPlotBounds();
    return {
      x: Math.max(plotBounds.x, Math.min(plotBounds.x + plotBounds.width, point.x)),
      y: Math.max(plotBounds.y, Math.min(plotBounds.y + plotBounds.height, point.y)),
    };
  }

  /**
   * Update dimensions
   */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /**
   * Update margins
   */
  setMargin(margin: Partial<Margin>): void {
    this.margin = { ...this.margin, ...margin };
  }

  /**
   * Get current margin
   */
  getMargin(): Margin {
    return { ...this.margin };
  }
}
