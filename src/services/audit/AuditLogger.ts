/**
 * Audit Logger Service
 * Comprehensive logging with S2S event publishing
 */

export enum AuditEventType {
  // Authentication Events
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTER = 'USER_REGISTER',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TOKEN_REFRESH = 'TOKEN_REFRESH',

  // Security Events
  FAILED_LOGIN = 'FAILED_LOGIN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  PERMISSION_DENIED = 'PERMISSION_DENIED',

  // Gamification Events
  XP_AWARDED = 'XP_AWARDED',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  LEVEL_UP = 'LEVEL_UP',
  STREAK_BROKEN = 'STREAK_BROKEN',
  QUEST_COMPLETED = 'QUEST_COMPLETED',

  // Quiz Events
  QUIZ_STARTED = 'QUIZ_STARTED',
  QUIZ_COMPLETED = 'QUIZ_COMPLETED',
  ANSWER_SUBMITTED = 'ANSWER_SUBMITTED',

  // Social Events
  CHALLENGE_CREATED = 'CHALLENGE_CREATED',
  FRIEND_ADDED = 'FRIEND_ADDED',
  LEADERBOARD_UPDATED = 'LEADERBOARD_UPDATED',

  // System Events
  SERVICE_ERROR = 'SERVICE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  API_CALL = 'API_CALL',
  CACHE_MISS = 'CACHE_MISS',
}

export enum AuditSeverity {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  type: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  sessionId?: string;
  service: string;
  details: Record<string, any>;
  metadata?: AuditMetadata;
}

export interface AuditMetadata {
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  location?: {
    country?: string;
    city?: string;
    coordinates?: { lat: number; lng: number };
  };
  requestId?: string;
  correlationId?: string;
  duration?: number;
}

export interface AuditQuery {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  type?: AuditEventType;
  severity?: AuditSeverity;
  service?: string;
  limit?: number;
  offset?: number;
}

/**
 * S2S Event Publisher Interface
 * For publishing audit events to other services
 */
interface EventPublisher {
  publish(topic: string, event: AuditEvent): Promise<void>;
}

export class AuditLogger {
  private static instance: AuditLogger;
  private events: AuditEvent[] = [];
  private eventPublisher?: EventPublisher;
  private readonly MAX_IN_MEMORY_EVENTS = 10000;
  private readonly BATCH_SIZE = 100;
  private batchQueue: AuditEvent[] = [];
  private batchTimer?: NodeJS.Timeout;

  private constructor() {
    this.initializeBatchProcessor();
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Set the S2S event publisher for distributed logging
   */
  setEventPublisher(publisher: EventPublisher): void {
    this.eventPublisher = publisher;
  }

  /**
   * Log an audit event
   */
  async log(
    type: AuditEventType,
    severity: AuditSeverity,
    details: Record<string, any>,
    metadata?: Partial<AuditMetadata>,
  ): Promise<void> {
    const event: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      type,
      severity,
      service: this.getServiceName(),
      details,
      userId: metadata?.userId || this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      metadata: metadata as AuditMetadata,
    };

    // Add to in-memory store
    this.addToMemoryStore(event);

    // Add to batch queue
    this.addToBatch(event);

    // Publish to S2S event bus if critical
    if (severity === AuditSeverity.CRITICAL || severity === AuditSeverity.ERROR) {
      await this.publishEvent(event);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.consoleLog(event);
    }
  }

  /**
   * Log a security event
   */
  async logSecurity(
    type: AuditEventType,
    details: Record<string, any>,
    metadata?: Partial<AuditMetadata>,
  ): Promise<void> {
    const severity = this.getSecuritySeverity(type);
    await this.log(type, severity, details, metadata);

    // Trigger security alerts for critical events
    if (severity === AuditSeverity.CRITICAL) {
      await this.triggerSecurityAlert(type, details);
    }
  }

  /**
   * Log a gamification event
   */
  async logGamification(
    type: AuditEventType,
    details: Record<string, any>,
    metadata?: Partial<AuditMetadata>,
  ): Promise<void> {
    await this.log(type, AuditSeverity.INFO, details, metadata);

    // Publish to analytics pipeline
    if (this.eventPublisher) {
      const event = this.createEvent(type, AuditSeverity.INFO, details, metadata);
      await this.eventPublisher.publish('gamification.events', event);
    }
  }

  /**
   * Query audit logs
   */
  async query(params: AuditQuery): Promise<AuditEvent[]> {
    let results = [...this.events];

    // Filter by date range
    if (params.startDate) {
      results = results.filter((e) => e.timestamp >= params.startDate!);
    }
    if (params.endDate) {
      results = results.filter((e) => e.timestamp <= params.endDate!);
    }

    // Filter by other criteria
    if (params.userId) {
      results = results.filter((e) => e.userId === params.userId);
    }
    if (params.type) {
      results = results.filter((e) => e.type === params.type);
    }
    if (params.severity) {
      results = results.filter((e) => e.severity === params.severity);
    }
    if (params.service) {
      results = results.filter((e) => e.service === params.service);
    }

    // Sort by timestamp descending
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = params.offset || 0;
    const limit = params.limit || 100;
    return results.slice(offset, offset + limit);
  }

  /**
   * Get audit statistics
   */
  getStatistics(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    recentErrors: number;
  } {
    const stats = {
      totalEvents: this.events.length,
      eventsByType: {} as Record<string, number>,
      eventsBySeverity: {} as Record<string, number>,
      recentErrors: 0,
    };

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    this.events.forEach((event) => {
      // Count by type
      stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1;

      // Count by severity
      stats.eventsBySeverity[event.severity] = (stats.eventsBySeverity[event.severity] || 0) + 1;

      // Count recent errors
      if (
        event.timestamp > oneHourAgo &&
        (event.severity === AuditSeverity.ERROR || event.severity === AuditSeverity.CRITICAL)
      ) {
        stats.recentErrors++;
      }
    });

    return stats;
  }

  /**
   * Export audit logs
   */
  async export(format: 'json' | 'csv' = 'json'): Promise<string> {
    if (format === 'json') {
      return JSON.stringify(this.events, null, 2);
    } else {
      return this.convertToCSV(this.events);
    }
  }

  /**
   * Clear old audit logs
   */
  cleanup(daysToKeep: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const before = this.events.length;
    this.events = this.events.filter((e) => e.timestamp > cutoffDate);
    const after = this.events.length;

    console.log(`Audit cleanup: removed ${before - after} events older than ${daysToKeep} days`);
  }

  // Private methods

  private initializeBatchProcessor(): void {
    // Process batch every 5 seconds
    this.batchTimer = setInterval(() => {
      this.processBatch();
    }, 5000);
  }

  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const batch = this.batchQueue.splice(0, this.BATCH_SIZE);

    try {
      // In production, this would persist to database
      await this.persistBatch(batch);

      // Publish batch to S2S event bus
      if (this.eventPublisher) {
        await this.eventPublisher.publish('audit.batch', batch as any);
      }
    } catch (error) {
      console.error('Failed to process audit batch:', error);
      // Re-queue failed batch
      this.batchQueue.unshift(...batch);
    }
  }

  private async persistBatch(batch: AuditEvent[]): Promise<void> {
    // In production, this would write to database
    // For now, just log the batch size
    console.log(`Persisting batch of ${batch.length} audit events`);
  }

  private addToMemoryStore(event: AuditEvent): void {
    this.events.push(event);

    // Maintain size limit
    if (this.events.length > this.MAX_IN_MEMORY_EVENTS) {
      this.events.shift(); // Remove oldest
    }
  }

  private addToBatch(event: AuditEvent): void {
    this.batchQueue.push(event);

    // Process immediately if batch is full
    if (this.batchQueue.length >= this.BATCH_SIZE) {
      this.processBatch();
    }
  }

  private async publishEvent(event: AuditEvent): Promise<void> {
    if (!this.eventPublisher) return;

    try {
      await this.eventPublisher.publish('audit.realtime', event);
    } catch (error) {
      console.error('Failed to publish audit event:', error);
    }
  }

  private createEvent(
    type: AuditEventType,
    severity: AuditSeverity,
    details: Record<string, any>,
    metadata?: Partial<AuditMetadata>,
  ): AuditEvent {
    return {
      id: this.generateEventId(),
      timestamp: new Date(),
      type,
      severity,
      service: this.getServiceName(),
      details,
      userId: metadata?.userId || this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      metadata: metadata as AuditMetadata,
    };
  }

  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getServiceName(): string {
    return process.env.SERVICE_NAME || 'gamification-service';
  }

  private getCurrentUserId(): string | undefined {
    // In production, get from auth context
    return undefined;
  }

  private getSessionId(): string | undefined {
    // In production, get from session context
    return undefined;
  }

  private getSecuritySeverity(type: AuditEventType): AuditSeverity {
    const criticalEvents = [AuditEventType.SUSPICIOUS_ACTIVITY, AuditEventType.PERMISSION_DENIED];

    const warningEvents = [AuditEventType.FAILED_LOGIN, AuditEventType.RATE_LIMIT_EXCEEDED];

    if (criticalEvents.includes(type)) return AuditSeverity.CRITICAL;
    if (warningEvents.includes(type)) return AuditSeverity.WARNING;
    return AuditSeverity.INFO;
  }

  private async triggerSecurityAlert(
    type: AuditEventType,
    details: Record<string, any>,
  ): Promise<void> {
    console.error(`🚨 SECURITY ALERT: ${type}`, details);
    // In production, send to security monitoring service
  }

  private consoleLog(event: AuditEvent): void {
    const icon = this.getSeverityIcon(event.severity);
    console.log(
      `${icon} [${event.timestamp.toISOString()}] ${event.type}: ${JSON.stringify(event.details)}`,
    );
  }

  private getSeverityIcon(severity: AuditSeverity): string {
    const icons = {
      [AuditSeverity.DEBUG]: '🔍',
      [AuditSeverity.INFO]: 'ℹ️',
      [AuditSeverity.WARNING]: '⚠️',
      [AuditSeverity.ERROR]: '❌',
      [AuditSeverity.CRITICAL]: '🚨',
    };
    return icons[severity] || '📝';
  }

  private convertToCSV(events: AuditEvent[]): string {
    if (events.length === 0) return '';

    const headers = ['id', 'timestamp', 'type', 'severity', 'userId', 'service', 'details'];
    const rows = events.map((e) => [
      e.id,
      e.timestamp.toISOString(),
      e.type,
      e.severity,
      e.userId || '',
      e.service,
      JSON.stringify(e.details),
    ]);

    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  }
}

// Export singleton instance
export default AuditLogger.getInstance();
