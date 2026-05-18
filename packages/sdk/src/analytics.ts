import { AnalyticsEvent, AnalyticsEventType } from "./types.js";

export interface AnalyticsConfig {
  apiUrl: string;
  appId: string;
  batchSize?: number;
  flushInterval?: number;
}

/**
 * Analytics event tracking and batching
 * Sends events to dashboard backend via POST /api/events
 */
export class Analytics {
  private config: AnalyticsConfig;
  private eventBatch: AnalyticsEvent[] = [];
  private batchSize: number;
  private flushInterval: number;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.batchSize = config.batchSize || 10;
    this.flushInterval = config.flushInterval || 30000; // 30 seconds
  }

  /**
   * Track an analytics event
   */
  async trackEvent(
    type: AnalyticsEventType,
    userId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const event: AnalyticsEvent = {
      type,
      userId,
      timestamp: Date.now(),
      metadata: {
        appId: this.config.appId,
        ...metadata,
      },
    };

    this.eventBatch.push(event);

    // Flush if batch is full
    if (this.eventBatch.length >= this.batchSize) {
      await this.flush();
    } else if (!this.flushTimer) {
      // Schedule flush if not already scheduled
      this.flushTimer = setTimeout(() => this.flush(), this.flushInterval);
    }
  }

  /**
   * Flush accumulated events to dashboard backend
   */
  async flush(): Promise<void> {
    if (this.eventBatch.length === 0) return;

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    const eventsToSend = [...this.eventBatch];
    this.eventBatch = [];

    try {
      const response = await fetch(`${this.config.apiUrl}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          events: eventsToSend,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        console.warn(`Analytics endpoint returned ${response.status}. Events queued for retry.`);
        // Re-add events to batch for retry (simple retry logic)
        this.eventBatch.push(...eventsToSend.slice(0, 5)); // Keep last 5 for retry
      }
    } catch (error) {
      console.warn("Analytics endpoint unreachable. Events queued for retry.");
      // Re-add events for retry
      this.eventBatch.push(...eventsToSend.slice(0, 5));
    }
  }

  /**
   * Manually force flush
   */
  async forceFlush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }

  /**
   * Get pending event count
   */
  getPendingEventCount(): number {
    return this.eventBatch.length;
  }
}
