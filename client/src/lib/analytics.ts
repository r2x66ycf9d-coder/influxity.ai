/**
 * Analytics tracking utility for monitoring user interactions
 * Integrates with backend analytics service
 */

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

/**
 * Track a custom event
 */
export const trackEvent = (event: string, properties?: Record<string, unknown>): void => {
  try {
    const eventData: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
    };

    // Send to backend analytics endpoint
    if (typeof window !== 'undefined') {
      // Queue event for batch sending
      const queue = getEventQueue();
      queue.push(eventData);
      saveEventQueue(queue);

      // Flush queue if it reaches threshold
      if (queue.length >= 10) {
        flushEventQueue();
      }
    }
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

/**
 * Track page view
 */
export const trackPageView = (path: string, title?: string): void => {
  trackEvent('page_view', {
    path,
    title: title || document.title,
    referrer: document.referrer,
  });
};

/**
 * Track AI feature usage
 */
export const trackAIFeature = (feature: string, action: string, metadata?: Record<string, unknown>): void => {
  trackEvent('ai_feature_used', {
    feature,
    action,
    ...metadata,
  });
};

/**
 * Track user interaction
 */
export const trackInteraction = (element: string, action: string, value?: string | number): void => {
  trackEvent('user_interaction', {
    element,
    action,
    value,
  });
};

/**
 * Track error occurrence
 */
export const trackError = (error: Error, context?: string): void => {
  trackEvent('error_occurred', {
    message: error.message,
    stack: error.stack,
    context,
  });
};

// Internal queue management
const QUEUE_KEY = 'analytics_queue';

function getEventQueue(): AnalyticsEvent[] {
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveEventQueue(queue: AnalyticsEvent[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to save analytics queue:', error);
  }
}

function flushEventQueue(): void {
  try {
    const queue = getEventQueue();
    if (queue.length === 0) return;

    // Send to backend (implement actual endpoint call)
    fetch('/api/analytics/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: queue }),
    }).then(() => {
      // Clear queue on success
      localStorage.removeItem(QUEUE_KEY);
    }).catch(error => {
      console.error('Failed to flush analytics queue:', error);
    });
  } catch (error) {
    console.error('Analytics flush error:', error);
  }
}

// Flush queue on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushEventQueue);
}
