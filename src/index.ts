/**
 * VizKit - High-performance data visualization library
 * 
 * Main entry point for the library
 */

// Core
export { Chart } from './chart';
export type { ChartConfig } from './chart';
export { CanvasRenderer, CanvasLayer } from './core/renderer/canvas-renderer';
export type { CanvasRendererConfig, CanvasLayerConfig } from './core/renderer/canvas-renderer';
export { CoordinateSystem } from './core/coordinate/coordinate-system';
export type { CoordinateSystemConfig } from './core/coordinate/coordinate-system';

// Types
export type {
  Point,
  Rect,
  Margin,
  RenderableConfig,
  Lifecycle,
  EventType,
  NormalizedEvent,
  EventHandler,
  ScaleType,
  AxisOrientation,
  Accessor,
  DataPoint,
} from './core/types';
export { RenderLayer } from './core/types';

// Scales
export { ScaleManager } from './primitives/scales/scale-manager';
export type { AnyScale, ScaleConfig } from './primitives/scales/scale-manager';

// Axes
export { AxisRenderer } from './primitives/axes/axis-renderer';
export type { AxisConfig } from './primitives/axes/axis-renderer';

// Grids
export { GridRenderer } from './primitives/grids/grid-renderer';
export type { GridConfig } from './primitives/grids/grid-renderer';

// Charts
export { LineChart } from './charts/line/line-chart';
export type { LineChartConfig } from './charts/line/line-chart';
export { BarChart } from './charts/bar/bar-chart';
export type { BarChartConfig } from './charts/bar/bar-chart';

// Interactions
export { EventManager } from './interactions/events/event-manager';
export { TooltipSystem } from './interactions/tooltip/tooltip-system';
export type { TooltipConfig } from './interactions/tooltip/tooltip-system';
