// Performance monitoring utility for debugging

export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();
  private static counters: Map<string, number> = new Map();

  static startTimer(label: string): void {
    this.timers.set(label, performance.now());
    console.log(`⏱️ [PERF] ${label} - STARTED`);
  }

  static endTimer(label: string): number {
    const start = this.timers.get(label);
    if (!start) {
      console.warn(`⚠️ [PERF] Timer "${label}" not found`);
      return 0;
    }
    
    const duration = performance.now() - start;
    this.timers.delete(label);
    
    const emoji = duration < 16 ? '🟢' : duration < 100 ? '🟡' : '🔴';
    console.log(`${emoji} [PERF] ${label} - ${duration.toFixed(2)}ms`);
    
    return duration;
  }

  static count(label: string): void {
    const current = this.counters.get(label) || 0;
    const newCount = current + 1;
    this.counters.set(label, newCount);
    console.log(`🔢 [COUNT] ${label}: ${newCount}`);
  }

  static resetCounter(label: string): void {
    this.counters.set(label, 0);
  }

  static getCounter(label: string): number {
    return this.counters.get(label) || 0;
  }

  static logNavigation(from: string, to: string): void {
    console.log(`🧭 [NAV] ${from} → ${to}`);
    this.startTimer(`Navigation: ${to}`);
  }

  static logRender(componentName: string, reason?: string): void {
    const count = (this.counters.get(componentName) || 0) + 1;
    this.counters.set(componentName, count);
    
    const reasonStr = reason ? ` (${reason})` : '';
    console.log(`🎨 [RENDER] ${componentName} #${count}${reasonStr}`);
  }

  static logDataFetch(endpoint: string, duration: number, dataSize?: number): void {
    const emoji = duration < 100 ? '🟢' : duration < 500 ? '🟡' : '🔴';
    const sizeStr = dataSize ? ` - ${dataSize} records` : '';
    console.log(`${emoji} [API] ${endpoint} - ${duration.toFixed(2)}ms${sizeStr}`);
  }

  static summary(): void {
    console.log('\n📊 ========== PERFORMANCE SUMMARY ==========');
    console.log('🔢 Render Counts:');
    this.counters.forEach((count, label) => {
      const emoji = count <= 2 ? '🟢' : count <= 5 ? '🟡' : '🔴';
      console.log(`   ${emoji} ${label}: ${count} renders`);
    });
    console.log('==========================================\n');
  }

  static reset(): void {
    this.timers.clear();
    this.counters.clear();
    console.log('🔄 [PERF] Performance monitor reset');
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).perfMon = PerformanceMonitor;
}

// Log performance summary every 30 seconds in development
if (import.meta.env.DEV) {
  setInterval(() => {
    if (PerformanceMonitor.getCounter('SimpleSidebar') > 0) {
      PerformanceMonitor.summary();
    }
  }, 30000);
}
