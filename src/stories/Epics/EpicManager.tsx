import React, { useState } from 'react';

interface Epic {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  owner: string;
  dueDate: string;
  tasks: {
    total: number;
    completed: number;
  };
}

const mockEpics: Epic[] = [
  {
    id: 'EP-001',
    title: 'Authentication System Overhaul',
    description: 'Implement OAuth 2.0 with multi-factor authentication support',
    status: 'in-progress',
    priority: 'critical',
    progress: 65,
    owner: 'Sarah Chen',
    dueDate: '2025-09-15',
    tasks: { total: 12, completed: 8 }
  },
  {
    id: 'EP-002',
    title: 'Performance Optimization Phase 2',
    description: 'Reduce API response times by 40% and implement caching strategy',
    status: 'in-progress',
    priority: 'high',
    progress: 35,
    owner: 'Mike Johnson',
    dueDate: '2025-09-30',
    tasks: { total: 8, completed: 3 }
  },
  {
    id: 'EP-003',
    title: 'Mobile App Feature Parity',
    description: 'Bring mobile app features in line with web application',
    status: 'planning',
    priority: 'medium',
    progress: 10,
    owner: 'Lisa Wang',
    dueDate: '2025-10-15',
    tasks: { total: 15, completed: 2 }
  },
  {
    id: 'EP-004',
    title: 'Data Analytics Dashboard',
    description: 'Build comprehensive analytics dashboard with real-time metrics',
    status: 'review',
    priority: 'high',
    progress: 85,
    owner: 'David Kim',
    dueDate: '2025-09-01',
    tasks: { total: 10, completed: 9 }
  },
  {
    id: 'EP-005',
    title: 'Internationalization Support',
    description: 'Add support for 5 new languages and RTL layouts',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    owner: 'Emma Rodriguez',
    dueDate: '2025-08-20',
    tasks: { total: 6, completed: 6 }
  }
];

const EpicManager: React.FC = () => {
  const [epics, setEpics] = useState<Epic[]>(mockEpics);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'progress'>('priority');

  const getStatusColor = (status: Epic['status']) => {
    const colors = {
      planning: '#94a3b8',
      'in-progress': '#3b82f6',
      review: '#f59e0b',
      completed: '#10b981'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Epic['priority']) => {
    const colors = {
      low: '#94a3b8',
      medium: '#3b82f6',
      high: '#f59e0b',
      critical: '#ef4444'
    };
    return colors[priority];
  };

  const filteredEpics = epics.filter(epic => {
    if (filter === 'all') return true;
    return epic.status === filter;
  });

  const sortedEpics = [...filteredEpics].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return b.progress - a.progress;
  });

  return (
    <div style={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      padding: 24,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>
          Epic Manager
        </h1>
        <p style={{ color: '#64748b', fontSize: 16 }}>
          Track and manage product development epics across teams
        </p>
      </div>

      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        marginBottom: 24,
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 14, color: '#475569' }}>Filter:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 14,
              background: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Epics</option>
            <option value="planning">Planning</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 14, color: '#475569' }}>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 14,
              background: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
            <option value="progress">Progress</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <button
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: '#3b82f6',
              color: 'white',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer'
            }}
            onClick={() => alert('Create Epic feature coming soon!')}
          >
            + New Epic
          </button>
        </div>
      </div>

      {/* Epic Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: 20
      }}>
        {sortedEpics.map(epic => (
          <div
            key={epic.id}
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ 
                  fontSize: 12, 
                  fontWeight: 600, 
                  color: '#64748b',
                  letterSpacing: '0.05em'
                }}>
                  {epic.id}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: getStatusColor(epic.status) + '20',
                    color: getStatusColor(epic.status),
                    fontWeight: 500,
                    textTransform: 'capitalize'
                  }}>
                    {epic.status.replace('-', ' ')}
                  </span>
                  <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: getPriorityColor(epic.priority) + '20',
                    color: getPriorityColor(epic.priority),
                    fontWeight: 500,
                    textTransform: 'capitalize'
                  }}>
                    {epic.priority}
                  </span>
                </div>
              </div>
              
              <h3 style={{ 
                fontSize: 18, 
                fontWeight: 600, 
                marginBottom: 8,
                color: '#0f172a',
                lineHeight: 1.3
              }}>
                {epic.title}
              </h3>
              
              <p style={{ 
                fontSize: 14, 
                color: '#64748b',
                lineHeight: 1.5,
                marginBottom: 16
              }}>
                {epic.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Progress</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{epic.progress}%</span>
              </div>
              <div style={{ 
                height: 8, 
                background: '#e2e8f0', 
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${epic.progress}%`,
                  background: epic.progress === 100 ? '#10b981' : '#3b82f6',
                  borderRadius: 4,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Tasks */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              paddingTop: 16,
              borderTop: '1px solid #f1f5f9'
            }}>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Tasks</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>
                  {epic.tasks.completed}/{epic.tasks.total}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Owner</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>
                  {epic.owner}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Due Date</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>
                  {new Date(epic.dueDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div style={{ 
        marginTop: 32, 
        padding: 20, 
        background: '#f8fafc',
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
            {epics.length}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Total Epics</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>
            {epics.filter(e => e.status === 'in-progress').length}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>In Progress</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>
            {epics.filter(e => e.priority === 'critical' || e.priority === 'high').length}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>High Priority</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>
            {Math.round(epics.reduce((acc, e) => acc + e.progress, 0) / epics.length)}%
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Avg Progress</div>
        </div>
      </div>
    </div>
  );
};

export default EpicManager;
