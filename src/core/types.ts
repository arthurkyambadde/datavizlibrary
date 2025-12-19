/**
 * Core types used throughout the library
 */

/**
 * 2D point in screen or data space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Rectangle bounds
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Margin specification
 */
export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Render layer types
 */
export enum RenderLayer {
  Background = 0,
  Grid = 1,
  Data = 2,
  Interaction = 3,
  Overlay = 4
}

/**
 * Base configuration for all renderable components
 */
export interface RenderableConfig {
  layer?: RenderLayer;
  visible?: boolean;
  zIndex?: number;
}

/**
 * Lifecycle hooks for components
 */
export interface Lifecycle {
  mount?(context: CanvasRenderingContext2D): void;
  update?(context: CanvasRenderingContext2D): void;
  unmount?(): void;
}

/**
 * Event types
 */
export type EventType = 
  | 'click'
  | 'mousemove'
  | 'mouseenter'
  | 'mouseleave'
  | 'mousedown'
  | 'mouseup'
  | 'touchstart'
  | 'touchmove'
  | 'touchend';

/**
 * Normalized event data
 */
export interface NormalizedEvent {
  type: EventType;
  point: Point;
  originalEvent: MouseEvent | TouchEvent;
  target?: unknown;
}

/**
 * Event handler function
 */
export type EventHandler = (event: NormalizedEvent) => void;

/**
 * Scale types (from D3)
 */
export type ScaleType = 
  | 'linear'
  | 'log'
  | 'pow'
  | 'sqrt'
  | 'time'
  | 'band'
  | 'point'
  | 'ordinal';

/**
 * Axis orientation
 */
export type AxisOrientation = 'top' | 'right' | 'bottom' | 'left';

/**
 * Data accessor function
 */
export type Accessor<T, R> = (datum: T, index: number) => R;

/**
 * Generic data point
 */
export type DataPoint = Record<string, unknown>;
