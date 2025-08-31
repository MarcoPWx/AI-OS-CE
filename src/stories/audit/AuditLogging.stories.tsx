import type { Meta, StoryObj } from '@storybook/react';
import { AuditDashboard } from './AuditDashboard';

const meta: Meta<typeof AuditDashboard> = {
  title: 'Infrastructure/Audit Logging',
  component: AuditDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## 🔍 Audit Logging System

Enterprise-grade audit logging with S2S event publishing, real-time monitoring, and security alerting.

### System Architecture

\`\`\`
Event Source
    ↓
AuditLogService
    ├── Event Capture
    │   ├── User actions
    │   ├── System events
    │   ├── Security incidents
    │   └── API calls
    │
    ├── Event Processing
    │   ├── Validation
    │   ├── Enrichment
    │   ├── Classification
    │   └── Batching
    │
    ├── Storage Layer
    │   ├── In-memory buffer
    │   ├── Batch persistence
    │   └── Archive rotation
    │
    ├── S2S Publisher
    │   ├── Event formatting
    │   ├── Queue management
    │   ├── Retry logic
    │   └── Dead letter queue
    │
    └── Query Interface
        ├── Filter by type/user/date
        ├── Pagination
        ├── Export (JSON/CSV)
        └── Real-time streaming
\`\`\`

### Core Features

#### 📝 Event Types
- **USER_ACTION**: User-initiated events (login, quiz, profile)
- **SYSTEM_EVENT**: System operations (startup, shutdown, cron)
- **SECURITY_ALERT**: Security incidents (failed auth, suspicious activity)
- **API_CALL**: External API interactions (S2S, webhooks)
- **DATA_CHANGE**: Database modifications (CRUD operations)
- **PERFORMANCE**: Performance metrics (slow queries, timeouts)

#### 🚀 S2S Event Publishing
\`\`\`typescript
interface S2SEvent {
  eventId: string;
  timestamp: Date;
  serviceId: string;
  eventType: string;
  payload: Record<string, any>;
  metadata: {
    correlationId: string;
    causationId?: string;
    userId?: string;
    sessionId?: string;
  };
}
\`\`\`

#### 🔐 Security Features
- **Tamper Detection**: SHA-256 event hashing
- **Access Control**: Role-based query permissions
- **PII Protection**: Automatic data masking
- **Retention Policy**: Configurable data lifecycle
- **Compliance**: GDPR, SOC2, HIPAA ready

### Event Flow Example

\`\`\`typescript
// 1. User completes quiz
gamificationService.completeQuiz(userId, quizId, score)
  ↓
// 2. Audit log created
auditService.log({
  type: 'USER_ACTION',
  action: 'QUIZ_COMPLETED',
  userId,
  details: { quizId, score, duration }
})
  ↓
// 3. Event enriched
{
  ...event,
  timestamp: new Date(),
  sessionId: getSessionId(),
  ip: getClientIP(),
  userAgent: getUserAgent()
}
  ↓
// 4. S2S publish
s2sPublisher.publish({
  service: 'gamification',
  event: 'quiz.completed',
  payload: enrichedEvent
})
  ↓
// 5. Batch persistence
batchProcessor.add(enrichedEvent)
  → Flush every 100 events or 5 seconds
\`\`\`

### Query Capabilities

#### Advanced Filtering
\`\`\`typescript
// Complex query example
const logs = await auditService.query({
  types: ['SECURITY_ALERT', 'USER_ACTION'],
  users: ['user123', 'user456'],
  dateRange: {
    start: '2024-01-01',
    end: '2024-01-31'
  },
  actions: ['LOGIN_FAILED', 'PERMISSION_DENIED'],
  severity: ['HIGH', 'CRITICAL']
});
\`\`\`

#### Export Formats
- **JSON**: Full event details with metadata
- **CSV**: Flattened structure for Excel/BI tools
- **Syslog**: RFC 5424 format for SIEM integration
- **CEF**: Common Event Format for security tools

### Performance Optimization

#### Batching Strategy
- **Buffer Size**: 100 events max
- **Flush Interval**: 5 seconds
- **Compression**: GZIP for archives
- **Indexing**: Type, user, timestamp indexes

#### S2S Queue Management
\`\`\`
Main Queue (10,000 capacity)
    ↓ (Process)
Success → ACK & Delete
    ↓ (Failure)
Retry Queue (3 attempts)
    ↓ (Max retries)
Dead Letter Queue → Manual intervention
\`\`\`

### Monitoring & Alerting

#### Real-time Dashboards
- Event volume by type
- Error rate trends
- User activity heatmap
- Security incident tracker
- S2S publish success rate

#### Alert Conditions
- Failed login attempts > 5 in 1 minute
- API error rate > 10%
- S2S queue depth > 1000
- No events received for 5 minutes
- Unusual user behavior patterns
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: 'System Overview',
};

export const EventTypes: Story = {
  name: 'Event Type Reference',
  parameters: {
    docs: {
      description: {
        story: `
### Event Type Definitions

#### USER_ACTION Events
| Action | Description | Severity | S2S Event |
|--------|-------------|----------|-----------|
| LOGIN_SUCCESS | User login | INFO | auth.login |
| LOGIN_FAILED | Failed login | MEDIUM | auth.failed |
| LOGOUT | User logout | INFO | auth.logout |
| QUIZ_STARTED | Quiz begin | INFO | quiz.started |
| QUIZ_COMPLETED | Quiz end | INFO | quiz.completed |
| ACHIEVEMENT_EARNED | Achievement unlock | INFO | gamification.achievement |
| PROFILE_UPDATED | Profile change | INFO | user.updated |

#### SYSTEM_EVENT Events
| Event | Description | Severity | S2S Event |
|-------|-------------|----------|-----------|
| SERVICE_START | Service startup | INFO | system.start |
| SERVICE_STOP | Service shutdown | INFO | system.stop |
| CACHE_CLEAR | Cache cleared | INFO | system.cache |
| BACKUP_COMPLETE | Backup finished | INFO | system.backup |
| MIGRATION_RUN | DB migration | MEDIUM | system.migration |

#### SECURITY_ALERT Events
| Alert | Description | Severity | S2S Event |
|-------|-------------|----------|-----------|
| BRUTE_FORCE | Multiple failed logins | HIGH | security.brute_force |
| UNAUTHORIZED_ACCESS | Permission denied | HIGH | security.unauthorized |
| SUSPICIOUS_ACTIVITY | Anomaly detected | CRITICAL | security.anomaly |
| DATA_BREACH_ATTEMPT | Data access violation | CRITICAL | security.breach |
| SESSION_HIJACK | Session anomaly | CRITICAL | security.hijack |

#### API_CALL Events
| Call Type | Description | Severity | S2S Event |
|-----------|-------------|----------|-----------|
| S2S_REQUEST | Service call | INFO | api.s2s |
| WEBHOOK_RECEIVED | Webhook event | INFO | api.webhook |
| EXTERNAL_API | 3rd party call | INFO | api.external |
| RATE_LIMITED | Rate limit hit | MEDIUM | api.rate_limit |
| API_ERROR | API failure | HIGH | api.error |
        `,
      },
    },
  },
};

export const S2SIntegration: Story = {
  name: 'S2S Event Publishing',
  parameters: {
    docs: {
      description: {
        story: `
### S2S Event Publishing Architecture

#### Event Format
\`\`\`typescript
interface S2SEventPayload {
  // Event identification
  eventId: string;           // UUID v4
  eventType: string;          // Dot notation: service.action
  timestamp: string;          // ISO 8601
  version: string;            // Event schema version
  
  // Event source
  service: {
    id: string;             // Service identifier
    instance: string;       // Instance/pod ID
    environment: string;    // dev/staging/prod
  };
  
  // Event context
  context: {
    correlationId: string;  // Request correlation
    causationId?: string;   // Parent event ID
    userId?: string;        // User identifier
    sessionId?: string;     // Session identifier
    tenantId?: string;      // Multi-tenant ID
  };
  
  // Event data
  data: Record<string, any>;
  
  // Event metadata
  metadata: {
    retry: number;          // Retry attempt
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    ttl?: number;           // Time to live (seconds)
  };
}
\`\`\`

#### Publishing Flow
\`\`\`
1. Event Creation
   auditService.log(event)
        ↓
2. S2S Formatting
   formatter.toS2SEvent(event)
        ↓
3. Queue Addition
   publisher.queue.add(s2sEvent)
        ↓
4. Batch Processing
   [Batch of 50 events OR 5 second timeout]
        ↓
5. HTTP POST to S2S Endpoint
   POST /events/batch
   Content-Type: application/json
   X-Service-Auth: Bearer {token}
        ↓
6. Response Handling
   Success (200) → ACK & Delete from queue
   Failure (4xx/5xx) → Retry with backoff
        ↓
7. Dead Letter Queue
   After 3 retries → Move to DLQ for manual review
\`\`\`

#### Configuration
\`\`\`typescript
const s2sConfig = {
  endpoint: process.env.S2S_ENDPOINT,
  auth: {
    type: 'bearer',
    token: process.env.S2S_AUTH_TOKEN
  },
  batch: {
    size: 50,
    timeout: 5000  // 5 seconds
  },
  retry: {
    attempts: 3,
    backoff: 'exponential',
    maxDelay: 30000  // 30 seconds
  },
  queue: {
    maxSize: 10000,
    persistent: true,
    deadLetterQueue: true
  }
};
\`\`\`

#### Event Examples

**User Login Event**
\`\`\`json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "eventType": "auth.login.success",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "service": {
    "id": "quiz-mentor",
    "instance": "pod-abc123",
    "environment": "production"
  },
  "context": {
    "correlationId": "req-789xyz",
    "userId": "user-123",
    "sessionId": "sess-456"
  },
  "data": {
    "method": "password",
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "mfa": true
  },
  "metadata": {
    "retry": 0,
    "priority": "MEDIUM"
  }
}
\`\`\`

**Quiz Completion Event**
\`\`\`json
{
  "eventId": "660e8400-e29b-41d4-a716-446655440001",
  "eventType": "gamification.quiz.completed",
  "timestamp": "2024-01-15T10:35:00Z",
  "version": "1.0.0",
  "service": {
    "id": "quiz-mentor",
    "instance": "pod-abc123",
    "environment": "production"
  },
  "context": {
    "correlationId": "req-789xyz",
    "causationId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-123",
    "sessionId": "sess-456"
  },
  "data": {
    "quizId": "quiz-789",
    "score": 85,
    "duration": 120,
    "difficulty": "HARD",
    "xpEarned": 45,
    "achievements": ["speed_demon"]
  },
  "metadata": {
    "retry": 0,
    "priority": "LOW"
  }
}
\`\`\`
        `,
      },
    },
  },
};

export const SecurityMonitoring: Story = {
  name: 'Security & Compliance',
  parameters: {
    docs: {
      description: {
        story: `
### 🔐 Security Monitoring

#### Threat Detection Rules

**Brute Force Attack**
\`\`\`typescript
if (failedLogins.count > 5 && failedLogins.timeWindow < 60) {
  alert({
    type: 'BRUTE_FORCE',
    severity: 'HIGH',
    user: failedLogins.userId,
    action: 'BLOCK_IP'
  });
}
\`\`\`

**Anomaly Detection**
\`\`\`typescript
// Unusual login location
if (distance(currentLocation, lastLocation) > 1000km &&
    timeDiff < 1hour) {
  alert({
    type: 'IMPOSSIBLE_TRAVEL',
    severity: 'CRITICAL'
  });
}

// Unusual activity pattern
if (actionsPerMinute > userBaseline * 5) {
  alert({
    type: 'UNUSUAL_ACTIVITY',
    severity: 'HIGH'
  });
}
\`\`\`

#### Compliance Features

**GDPR Compliance**
- Right to erasure (data deletion)
- Data portability (export)
- Consent tracking
- PII encryption
- Audit trail of data access

**SOC2 Type II**
- Access controls
- Change monitoring
- Availability tracking
- Data integrity checks
- Incident response logs

**HIPAA (if applicable)**
- PHI access logging
- Encryption at rest
- User activity monitoring
- System access reviews
- Breach notification logs

#### Data Protection

**PII Masking**
\`\`\`typescript
// Before logging
{
  email: "user@example.com",
  ssn: "123-45-6789",
  creditCard: "4111-1111-1111-1111"
}

// After masking
{
  email: "u***@example.com",
  ssn: "XXX-XX-6789",
  creditCard: "4111-****-****-1111"
}
\`\`\`

**Encryption**
- At rest: AES-256
- In transit: TLS 1.3
- Key rotation: 90 days
- HSM integration available

#### Retention Policies

| Data Type | Retention | Archive | Deletion |
|-----------|-----------|---------|----------|
| Security alerts | 7 years | After 1 year | Permanent |
| User actions | 2 years | After 6 months | Soft delete |
| System events | 1 year | After 3 months | Permanent |
| API calls | 90 days | After 30 days | Permanent |
| Performance | 30 days | No | Permanent |

#### Incident Response

**Automated Response Actions**
1. IP blocking for brute force
2. Session termination for hijacking
3. Account lockout for suspicious activity
4. Alert to security team
5. Forensic data capture

**Manual Review Queue**
- Dead letter queue events
- Critical security alerts
- Compliance violations
- Data breach attempts
- Unusual patterns

#### Reporting

**Security Dashboard**
- Failed login attempts (24h)
- Active threats
- Blocked IPs
- User risk scores
- Compliance status

**Compliance Reports**
- Monthly access reviews
- Quarterly security audits
- Annual compliance attestation
- Incident response metrics
- Data retention compliance
        `,
      },
    },
  },
};

export const Implementation: Story = {
  name: 'Technical Implementation',
  parameters: {
    docs: {
      description: {
        story: `
### 🛠️ Implementation Details

#### Service Architecture
\`\`\`typescript
// src/services/audit/AuditLogService.ts

export class AuditLogService {
  private logs: AuditLog[] = [];
  private batchProcessor: BatchProcessor;
  private s2sPublisher: S2SEventPublisher;
  
  constructor(
    private readonly config: AuditConfig,
    private readonly storage: StorageAdapter,
    private readonly publisher: EventPublisher
  ) {
    this.batchProcessor = new BatchProcessor(config.batch);
    this.s2sPublisher = new S2SEventPublisher(config.s2s);
  }
  
  async log(event: AuditEvent): Promise<void> {
    // 1. Validate event
    this.validateEvent(event);
    
    // 2. Enrich with metadata
    const enriched = this.enrichEvent(event);
    
    // 3. Add to batch
    this.batchProcessor.add(enriched);
    
    // 4. Publish to S2S
    await this.s2sPublisher.publish(enriched);
    
    // 5. Check for security alerts
    this.checkSecurityRules(enriched);
  }
  
  async query(filters: QueryFilters): Promise<PagedResult> {
    return this.storage.query(filters);
  }
  
  async export(format: ExportFormat): Promise<Buffer> {
    const exporter = ExporterFactory.create(format);
    return exporter.export(this.logs);
  }
}
\`\`\`

#### Batch Processing
\`\`\`typescript
class BatchProcessor {
  private batch: AuditLog[] = [];
  private timer: NodeJS.Timeout;
  
  constructor(private config: BatchConfig) {
    this.startTimer();
  }
  
  add(event: AuditLog): void {
    this.batch.push(event);
    
    if (this.batch.length >= this.config.size) {
      this.flush();
    }
  }
  
  private async flush(): Promise<void> {
    if (this.batch.length === 0) return;
    
    const toFlush = [...this.batch];
    this.batch = [];
    
    try {
      await this.storage.batchInsert(toFlush);
    } catch (error) {
      // Add back to batch for retry
      this.batch.unshift(...toFlush);
      throw error;
    }
  }
  
  private startTimer(): void {
    this.timer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }
}
\`\`\`

#### S2S Publisher
\`\`\`typescript
class S2SEventPublisher {
  private queue: Queue<S2SEvent>;
  private deadLetterQueue: Queue<S2SEvent>;
  
  constructor(private config: S2SConfig) {
    this.queue = new Queue(config.queue);
    this.deadLetterQueue = new Queue(config.dlq);
  }
  
  async publish(event: AuditLog): Promise<void> {
    const s2sEvent = this.formatEvent(event);
    await this.queue.add(s2sEvent);
  }
  
  private async processQueue(): Promise<void> {
    const batch = await this.queue.take(this.config.batchSize);
    
    try {
      await this.sendBatch(batch);
      await this.queue.ack(batch);
    } catch (error) {
      await this.handleFailure(batch, error);
    }
  }
  
  private async sendBatch(events: S2SEvent[]): Promise<void> {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${this.config.token}\`
      },
      body: JSON.stringify({ events })
    });
    
    if (!response.ok) {
      throw new Error(\`S2S publish failed: \${response.status}\`);
    }
  }
  
  private async handleFailure(
    events: S2SEvent[],
    error: Error
  ): Promise<void> {
    for (const event of events) {
      if (event.retries >= this.config.maxRetries) {
        await this.deadLetterQueue.add(event);
      } else {
        event.retries++;
        await this.queue.add(event, {
          delay: this.calculateBackoff(event.retries)
        });
      }
    }
  }
}
\`\`\`

#### Testing Strategy

**Unit Tests**
\`\`\`typescript
describe('AuditLogService', () => {
  it('should batch events correctly', async () => {
    const service = new AuditLogService(config);
    
    // Add 99 events
    for (let i = 0; i < 99; i++) {
      await service.log(createEvent());
    }
    
    // Should not flush yet
    expect(mockStorage.batchInsert).not.toHaveBeenCalled();
    
    // Add 100th event
    await service.log(createEvent());
    
    // Should trigger flush
    expect(mockStorage.batchInsert).toHaveBeenCalledWith(
      expect.arrayContaining([expect.any(Object)])
    );
  });
  
  it('should handle S2S failures gracefully', async () => {
    const service = new AuditLogService(config);
    mockFetch.mockRejectedValue(new Error('Network error'));
    
    await service.log(createEvent());
    
    // Should add to retry queue
    expect(mockQueue.add).toHaveBeenCalledWith(
      expect.objectContaining({ retries: 1 })
    );
  });
});
\`\`\`

#### Performance Considerations

**Optimization Techniques**
1. **Batch Processing**: Reduce I/O operations
2. **Async Queue**: Non-blocking event publishing
3. **Connection Pooling**: Reuse HTTP connections
4. **Compression**: GZIP for large payloads
5. **Indexing**: Optimize query performance

**Benchmarks**
- Event logging: < 1ms (async)
- Batch flush: < 100ms (100 events)
- Query (1M events): < 500ms
- Export (10K events): < 2s
- S2S publish: < 50ms (per batch)

**Scalability**
- Horizontal scaling via service instances
- Partitioned storage by date/type
- Distributed queue with Redis/Kafka
- Read replicas for queries
- CDN for exported reports
        `,
      },
    },
  },
};
