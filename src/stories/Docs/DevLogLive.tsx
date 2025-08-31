import React, { useEffect, useState } from 'react'

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warning' | 'error' | 'success';
  category: string;
  message: string;
  details?: string;
  user?: string;
}

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000),
    level: 'success',
    category: 'Deployment',
    message: 'Successfully deployed to production',
    details: 'Version 2.3.1 deployed to all regions',
    user: 'CI/CD Pipeline'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 5000),
    level: 'info',
    category: 'API',
    message: 'New endpoint registered: /api/v2/analytics',
    details: 'GET, POST methods available',
    user: 'sarah.chen'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 15000),
    level: 'warning',
    category: 'Performance',
    message: 'High memory usage detected',
    details: 'Memory usage at 85% on server node-3',
    user: 'System Monitor'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 30000),
    level: 'error',
    category: 'Database',
    message: 'Connection timeout to replica',
    details: 'Failed to connect to replica db-slave-2 after 3 retries',
    user: 'DB Monitor'
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 60000),
    level: 'debug',
    category: 'Auth',
    message: 'JWT token validation',
    details: 'Token validated for user: john.doe@example.com',
    user: 'Auth Service'
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 120000),
    level: 'info',
    category: 'Feature Flag',
    message: 'Feature flag updated: new-dashboard',
    details: 'Enabled for 50% of users',
    user: 'mike.johnson'
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 180000),
    level: 'success',
    category: 'Testing',
    message: 'All E2E tests passed',
    details: '127 tests completed in 3m 42s',
    user: 'Test Runner'
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 240000),
    level: 'info',
    category: 'Cache',
    message: 'Cache cleared for product listings',
    details: 'Manual cache invalidation triggered',
    user: 'lisa.wang'
  },
  {
    id: '9',
    timestamp: new Date(Date.now() - 300000),
    level: 'warning',
    category: 'Security',
    message: 'Multiple failed login attempts',
    details: 'IP: 192.168.1.105 - 5 failed attempts',
    user: 'Security Monitor'
  },
  {
    id: '10',
    timestamp: new Date(Date.now() - 360000),
    level: 'debug',
    category: 'API',
    message: 'GraphQL query executed',
    details: 'Query: getProductsByCategory, Time: 45ms',
    user: 'GraphQL Engine'
  }
];

const DevLogLive: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  useEffect(() => {
    // Simulate new log entries
    const interval = setInterval(() => {
      const categories = ['API', 'Database', 'Auth', 'Cache', 'Deployment', 'Performance'];
      const levels: LogEntry['level'][] = ['debug', 'info', 'warning', 'error', 'success'];
      const messages = [
        'Request processed successfully',
        'Cache hit ratio: 92%',
        'New user registered',
        'Background job completed',
        'Health check passed',
        'Configuration updated'
      ];

      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        level: levels[Math.floor(Math.random() * levels.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        details: Math.random() > 0.5 ? `Additional details for log entry ${Date.now()}` : undefined,
        user: Math.random() > 0.5 ? 'System' : undefined
      };

      setLogs(prev => [newLog, ...prev].slice(0, 100));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'debug': return '#6b7280';
      case 'info': return '#3b82f6';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'success': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getLevelBgColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'debug': return '#f3f4f6';
      case 'info': return '#dbeafe';
      case 'warning': return '#fef3c7';
      case 'error': return '#fee2e2';
      case 'success': return '#d1fae5';
      default: return '#f3f4f6';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.level === filter;
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div style={{
      maxWidth: 1400,
      margin: '0 auto',
      padding: 24,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>
          Developer Log Viewer
        </h1>
        <p style={{ color: '#64748b', fontSize: 16 }}>
          Real-time application logs with filtering and search capabilities
        </p>
      </div>

      {/* Controls */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 14
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'debug', 'info', 'warning', 'error', 'success'].map(level => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: filter === level ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                background: filter === level ? '#eff6ff' : 'white',
                color: filter === level ? '#3b82f6' : '#64748b',
                fontSize: 13,
                fontWeight: filter === level ? 600 : 400,
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {level}
            </button>
          ))}
        </div>

        <button
          onClick={() => setAutoScroll(!autoScroll)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: autoScroll ? '#10b981' : 'white',
            color: autoScroll ? 'white' : '#64748b',
            fontSize: 13,
            cursor: 'pointer'
          }}
        >
          Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
        </button>

        <button
          onClick={() => setLogs([])}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: 'white',
            color: '#ef4444',
            fontSize: 13,
            cursor: 'pointer'
          }}
        >
          Clear Logs
        </button>
      </div>

      {/* Log Entries */}
      <div style={{
        background: '#0f172a',
        borderRadius: 12,
        padding: 16,
        height: 600,
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: 13,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {filteredLogs.length > 0 ? (
          filteredLogs.map(log => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              style={{
                marginBottom: 4,
                padding: '8px 12px',
                borderRadius: 4,
                background: selectedLog?.id === log.id ? '#1e293b' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (selectedLog?.id !== log.id) {
                  e.currentTarget.style.background = '#1a202c';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedLog?.id !== log.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: '#64748b', flexShrink: 0 }}>
                  {formatTimestamp(log.timestamp)}
                </span>
                <span style={{
                  color: getLevelColor(log.level),
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: 11,
                  padding: '2px 6px',
                  background: getLevelBgColor(log.level),
                  borderRadius: 3,
                  flexShrink: 0
                }}>
                  {log.level}
                </span>
                <span style={{ color: '#8b5cf6', flexShrink: 0 }}>
                  [{log.category}]
                </span>
                <span style={{ color: '#e2e8f0', flex: 1 }}>
                  {log.message}
                </span>
                {log.user && (
                  <span style={{ color: '#64748b', fontSize: 11, flexShrink: 0 }}>
                    @{log.user}
                  </span>
                )}
              </div>
              {log.details && selectedLog?.id === log.id && (
                <div style={{
                  marginTop: 8,
                  marginLeft: 200,
                  padding: '8px 12px',
                  background: '#334155',
                  borderRadius: 4,
                  color: '#cbd5e1',
                  fontSize: 12
                }}>
                  {log.details}
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#64748b'
          }}>
            No logs match your filters
          </div>
        )}
      </div>

      {/* Statistics */}
      <div style={{
        marginTop: 24,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 16
      }}>
        {['debug', 'info', 'warning', 'error', 'success'].map(level => {
          const count = logs.filter(l => l.level === level).length;
          return (
            <div
              key={level}
              style={{
                background: 'white',
                borderRadius: 8,
                padding: 16,
                textAlign: 'center',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{
                fontSize: 24,
                fontWeight: 700,
                color: getLevelColor(level as LogEntry['level'])
              }}>
                {count}
              </div>
              <div style={{
                fontSize: 12,
                color: '#64748b',
                textTransform: 'capitalize',
                marginTop: 4
              }}>
                {level} Logs
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default DevLogLive

