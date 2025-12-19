/**
 * Object Pool
 * 
 * Reusable object pool to reduce allocations in hot paths
 */

export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;

  constructor(factory: () => T, reset: (obj: T) => void, maxSize = 1000) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      const obj = this.pool.pop();
      if (obj) return obj;
    }
    return this.factory();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  clear(): void {
    this.pool = [];
  }

  size(): number {
    return this.pool.length;
  }
}

// Pre-configured pools for common types
export const PointPool = new ObjectPool(
  () => ({ x: 0, y: 0 }),
  (p) => { p.x = 0; p.y = 0; }
);

export const RectPool = new ObjectPool(
  () => ({ x: 0, y: 0, width: 0, height: 0 }),
  (r) => { r.x = 0; r.y = 0; r.width = 0; r.height = 0; }
);
