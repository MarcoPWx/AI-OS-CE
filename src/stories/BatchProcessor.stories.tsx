import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect, useRef } from 'react';
import { userEvent, within, expect } from '@storybook/test';
import {
  BatchProcessor,
  getAnalyticsProcessor,
  getQuestionProcessor,
  getUserDataProcessor,
  type BatchItem,
  type BatchResult,
} from '../services/batchProcessor';

// Dashboard Component for visualizing batch processing
const BatchProcessorDashboard = () => {
  const [queueSize, setQueueSize] = useState(0);
  const [processedBatches, setProcessedBatches] = useState(0);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [savingsPercentage, setSavingsPercentage] = useState(0);
  const [events, setEvents] = useState<Array<{ id: string; type: string; timestamp: number }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'without-batch' | 'with-batch'>('with-batch');
  const [apiCalls, setApiCalls] = useState({ withBatch: 0, withoutBatch: 0 });

  const processorRef = useRef<BatchProcessor<any> | null>(null);

  useEffect(() => {
    // Create a demo processor
    processorRef.current = new BatchProcessor(
      async (items: BatchItem<any>[]) => {
        setIsProcessing(true);

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setProcessedBatches((prev) => prev + 1);
        setTotalProcessed((prev) => prev + items.length);
        setApiCalls((prev) => ({ ...prev, withBatch: prev.withBatch + 1 }));
        setIsProcessing(false);

        return {
          successful: items,
          failed: [],
          errors: new Map(),
        };
      },
      { maxBatchSize: 10, flushInterval: 3000 },
    );

    return () => {
      processorRef.current?.destroy();
    };
  }, []);

  const addEvent = async (type: string) => {
    const event = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
    };

    setEvents((prev) => [...prev.slice(-19), event]);

    if (mode === 'with-batch' && processorRef.current) {
      await processorRef.current.add(event);
      setQueueSize(processorRef.current.getQueueSize());
    } else {
      // Simulate individual API calls
      setApiCalls((prev) => ({ ...prev, withoutBatch: prev.withoutBatch + 1 }));
      setTotalProcessed((prev) => prev + 1);
    }

    // Calculate savings
    const savings =
      apiCalls.withoutBatch > 0
        ? Math.round(((apiCalls.withoutBatch - apiCalls.withBatch) / apiCalls.withoutBatch) * 100)
        : 0;
    setSavingsPercentage(Math.max(0, savings));
  };

  const flush = async () => {
    if (processorRef.current) {
      await processorRef.current.flush();
      setQueueSize(0);
    }
  };

  const simulateUserActivity = async () => {
    const activities = [
      'page_view',
      'button_click',
      'quiz_start',
      'answer_submit',
      'achievement_earned',
      'level_up',
      'profile_update',
    ];

    for (let i = 0; i < 25; i++) {
      const activity = activities[Math.floor(Math.random() * activities.length)];
      await addEvent(activity);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Batch Processing Dashboard</h2>

        {/* Mode Toggle */}
        <div className="mb-6">
          <label className="flex items-center space-x-3">
            <span className="font-medium">Processing Mode:</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="border rounded px-3 py-1"
            >
              <option value="with-batch">With Batching (Efficient)</option>
              <option value="without-batch">Without Batching (Inefficient)</option>
            </select>
          </label>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Queue Size</div>
            <div className="text-2xl font-bold text-blue-900">{queueSize}</div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Batches Processed</div>
            <div className="text-2xl font-bold text-green-900">{processedBatches}</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium">Total Items</div>
            <div className="text-2xl font-bold text-purple-900">{totalProcessed}</div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm text-yellow-600 font-medium">API Calls Saved</div>
            <div className="text-2xl font-bold text-yellow-900">{savingsPercentage}%</div>
          </div>
        </div>

        {/* API Calls Comparison */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">With Batching</h3>
            <div className="text-3xl font-bold text-green-600">{apiCalls.withBatch}</div>
            <div className="text-sm text-gray-500">API calls made</div>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Without Batching</h3>
            <div className="text-3xl font-bold text-red-600">{apiCalls.withoutBatch}</div>
            <div className="text-sm text-gray-500">API calls would be made</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => addEvent('user_action')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Event
          </button>

          <button
            onClick={simulateUserActivity}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Simulate User Activity
          </button>

          <button
            onClick={flush}
            disabled={queueSize === 0 || mode === 'without-batch'}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            Flush Queue ({queueSize})
          </button>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-700">Processing batch...</span>
            </div>
          </div>
        )}

        {/* Event Stream */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Event Stream (Last 20)</h3>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-gray-400 text-center py-4">
                No events yet. Click buttons above to generate events.
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="flex justify-between text-sm py-1 border-b">
                  <span className="font-mono text-gray-600">{event.type}</span>
                  <span className="text-gray-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-bold mb-3">How Batch Processing Works</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>With Batching:</strong> Events are collected in a queue and sent together when
            the queue reaches 10 items or after 3 seconds of inactivity.
          </p>
          <p>
            <strong>Without Batching:</strong> Each event triggers an immediate API call, resulting
            in many more network requests and database operations.
          </p>
          <p>
            <strong>Benefits:</strong> Reduces API calls by up to 90%, improves performance, reduces
            costs, and provides better error handling with automatic retries.
          </p>
        </div>
      </div>
    </div>
  );
};

// Real-world Example Components
const QuizBatchExample = () => {
  const [questionsLoaded, setQuestionsLoaded] = useState(0);
  const [batchMode, setBatchMode] = useState(true);
  const [loadTime, setLoadTime] = useState<number | null>(null);

  const loadQuestions = async () => {
    const startTime = Date.now();
    setQuestionsLoaded(0);

    if (batchMode) {
      // Simulate batch loading
      await new Promise((resolve) => setTimeout(resolve, 200));
      setQuestionsLoaded(10);
    } else {
      // Simulate individual loading
      for (let i = 1; i <= 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setQuestionsLoaded(i);
      }
    }

    setLoadTime(Date.now() - startTime);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Quiz Question Loading Example</h2>

        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={batchMode}
              onChange={(e) => setBatchMode(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Use Batch Loading</span>
          </label>
        </div>

        <button
          onClick={loadQuestions}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
        >
          Load 10 Questions
        </button>

        <div className="space-y-3">
          <div className="flex items-center">
            <span className="w-32">Questions Loaded:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${(questionsLoaded / 10) * 100}%` }}
              />
            </div>
            <span className="ml-3 w-12">{questionsLoaded}/10</span>
          </div>

          {loadTime && (
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-sm">
                Load time: <strong>{loadTime}ms</strong>
              </p>
              <p className="text-sm text-gray-600">
                {batchMode
                  ? '✅ 1 database query for all 10 questions'
                  : '❌ 10 separate database queries'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Services/BatchProcessor',
  component: BatchProcessorDashboard,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof BatchProcessorDashboard>;

export const InteractiveDashboard: Story = {
  render: () => <BatchProcessorDashboard />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for dashboard to load
    await expect(canvas.getByText('Batch Processing Dashboard')).toBeInTheDocument();

    // Simulate adding a few events
    const addButton = canvas.getByRole('button', { name: /Add Event/i });
    await userEvent.click(addButton);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await userEvent.click(addButton);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await userEvent.click(addButton);

    // Verify queue size increased
    await expect(canvas.getByText('3')).toBeInTheDocument();
  },
};

export const QuizLoadingComparison: Story = {
  render: () => <QuizBatchExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test with batch loading
    const loadButton = canvas.getByRole('button', { name: /Load 10 Questions/i });
    await userEvent.click(loadButton);

    // Wait for loading to complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Verify all questions loaded
    await expect(canvas.getByText('10/10')).toBeInTheDocument();
  },
};

export const PerformanceShowcase: Story = {
  render: () => (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Performance Comparison</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-red-200 rounded-lg p-4">
              <h3 className="font-bold text-red-600 mb-3">Without Batching ❌</h3>
              <ul className="space-y-2 text-sm">
                <li>• 100 user events = 100 API calls</li>
                <li>• Network latency: 50ms × 100 = 5 seconds</li>
                <li>• Database connections: 100</li>
                <li>• Cost: $0.001 × 100 = $0.10</li>
                <li>• Error handling: Per request</li>
              </ul>
            </div>

            <div className="border-2 border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-600 mb-3">With Batching ✅</h3>
              <ul className="space-y-2 text-sm">
                <li>• 100 user events = 10 API calls</li>
                <li>• Network latency: 50ms × 10 = 500ms</li>
                <li>• Database connections: 10</li>
                <li>• Cost: $0.001 × 10 = $0.01</li>
                <li>• Error handling: Automatic retry</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Result:</strong> 90% reduction in API calls, 90% faster processing, 90% cost
              savings, plus automatic retry logic for failed items.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-bold mb-3">Use Cases in QuizMentor</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded p-3">
              <h4 className="font-medium text-purple-600 mb-2">📊 Analytics</h4>
              <p className="text-sm text-gray-600">
                Track user events, page views, and interactions efficiently
              </p>
            </div>
            <div className="bg-white rounded p-3">
              <h4 className="font-medium text-blue-600 mb-2">❓ Questions</h4>
              <p className="text-sm text-gray-600">
                Load quiz questions in batches for faster quiz starts
              </p>
            </div>
            <div className="bg-white rounded p-3">
              <h4 className="font-medium text-green-600 mb-2">👤 User Data</h4>
              <p className="text-sm text-gray-600">
                Sync XP, levels, and achievements without blocking UI
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
