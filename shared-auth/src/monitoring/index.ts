/**
 * Monitoring & Analytics integration layer.
 * Provides unified interface for error tracking, logging, and analytics.
 */

export interface LogContext {
  module?: string;
  userId?: string;
  [key: string]: unknown;
}

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
}

/** Log levels aligned with production observability standards */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class MonitoringService {
  private isDev = import.meta.env.DEV;

  /** Structured logging with context */
  log(level: LogLevel, message: string, context?: LogContext): void {
    const entry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };

    if (this.isDev) {
      const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
      fn(`[MFE:${level.toUpperCase()}]`, message, context ?? '');
    }

    // Production: send to log aggregator (Datadog, CloudWatch, etc.)
    this.sendToLogAggregator(entry);
  }

  /** Error tracking - integrates with Sentry, Bugsnag, etc. */
  captureException(error: Error, context?: LogContext): void {
    this.log('error', error.message, { ...context, stack: error.stack });

    // Sentry integration example:
    // if (window.Sentry) window.Sentry.captureException(error, { extra: context });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('mfe:error', {
          detail: { error: error.message, context, timestamp: Date.now() },
        }),
      );
    }
  }

  /** Analytics tracking - integrates with Segment, GA4, Mixpanel, etc. */
  track(event: AnalyticsEvent): void {
    this.log('info', `Analytics: ${event.name}`, event.properties);

    // GA4 example:
    // if (window.gtag) window.gtag('event', event.name, event.properties);

    // Segment example:
    // if (window.analytics) window.analytics.track(event.name, event.properties);
  }

  /** Performance monitoring */
  trackPerformance(metric: string, value: number, context?: LogContext): void {
    this.log('info', `Performance: ${metric}=${value}ms`, context);

    // Web Vitals / RUM integration point
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`mfe:${metric}`);
    }
  }

  private sendToLogAggregator(entry: Record<string, unknown>): void {
    if (this.isDev) return;

    // Production log shipping endpoint
    const endpoint = import.meta.env.VITE_LOG_ENDPOINT;
    if (endpoint && navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, JSON.stringify(entry));
    }
  }
}

export const monitoring = new MonitoringService();

/** React Error Boundary integration helper */
export function reportErrorBoundary(error: Error, errorInfo: { componentStack?: string }): void {
  monitoring.captureException(error, {
    module: 'ErrorBoundary',
    componentStack: errorInfo.componentStack,
  });
}
