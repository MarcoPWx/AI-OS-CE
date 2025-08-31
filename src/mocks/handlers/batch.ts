import { http, HttpResponse, delay } from 'msw';

// Track API call counts for demonstration
let apiCallCounts = {
  questions: 0,
  analytics: 0,
  userSync: 0,
  withBatch: 0,
  withoutBatch: 0,
};

// Mock question database
const mockQuestions = Array.from({ length: 100 }, (_, i) => ({
  id: `q-${i + 1}`,
  text: `Question ${i + 1}: What is the answer to this?`,
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correctAnswer: Math.floor(Math.random() * 4),
  difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
  category: ['science', 'history', 'math', 'geography'][Math.floor(Math.random() * 4)],
  xpReward: (Math.floor(Math.random() * 3) + 1) * 10,
}));

// Analytics event storage
const analyticsEvents: any[] = [];

// User data storage
const userDataStore = new Map<string, any>();

let individualChain: Promise<void> = Promise.resolve();

export const batchHandlers = [
  // Batch question fetching
  http.post(/.*\/api\/batch\/questions$/, async ({ request }) => {
    const body = (await request.json()) as { questionIds: string[] };
    apiCallCounts.questions++;
    apiCallCounts.withBatch++;

    // Simulate processing delay
    await delay(100);

    const questions = body.questionIds.map(
      (id) =>
        mockQuestions.find((q) => q.id === id) || {
          id,
          text: `Question ${id}`,
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          difficulty: 'medium',
          category: 'general',
          xpReward: 10,
        },
    );

    return HttpResponse.json({
      success: true,
      data: questions,
      batchSize: body.questionIds.length,
      apiCallsSaved: body.questionIds.length - 1,
    });
  }),

  // Individual question fetching (for comparison)
  http.get(/.*\/api\/questions\/(?<id>[^/]+)$/, async ({ request }) => {
    apiCallCounts.questions++;
    apiCallCounts.withoutBatch++;

    // Simulate network latency
    await delay(50);

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop() as string;
    const question = mockQuestions.find((q) => q.id === id) || {
      id,
      text: `Question ${id}`,
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 0,
      difficulty: 'medium',
      category: 'general',
      xpReward: 10,
    };

    return HttpResponse.json({
      success: true,
      data: question,
    });
  }),

  // Batch analytics events
  http.post(/.*\/api\/batch\/analytics$/, async ({ request }) => {
    const body = (await request.json()) as { events: any[] };
    apiCallCounts.analytics++;
    apiCallCounts.withBatch++;

    // Simulate processing
    await delay(150);

    // Store events
    analyticsEvents.push(
      ...body.events.map((event) => ({
        ...event,
        processedAt: new Date().toISOString(),
        batchId: `batch-${Date.now()}`,
      })),
    );

    return HttpResponse.json({
      success: true,
      processed: body.events.length,
      totalEvents: analyticsEvents.length,
      apiCallsSaved: body.events.length - 1,
    });
  }),

  // Individual analytics event (for comparison)
  http.post(/.*\/api\/analytics\/track$/, async ({ request }) => {
    const event = await request.json();
    apiCallCounts.analytics++;
    apiCallCounts.withoutBatch++;

    // Simulate network latency
    await delay(50);

    analyticsEvents.push({
      ...event,
      processedAt: new Date().toISOString(),
    });

    return HttpResponse.json({
      success: true,
      processed: 1,
    });
  }),

  // Batch user data sync
  http.post(/.*\/api\/batch\/user-sync$/, async ({ request }) => {
    const body = (await request.json()) as {
      updates: Array<{
        userId: string;
        fields: Record<string, any>;
      }>;
    };

    apiCallCounts.userSync++;
    apiCallCounts.withBatch++;

    // Simulate processing
    await delay(100);

    // Apply updates
    body.updates.forEach((update) => {
      const currentData = userDataStore.get(update.userId) || {};
      userDataStore.set(update.userId, {
        ...currentData,
        ...update.fields,
        lastSynced: new Date().toISOString(),
      });
    });

    return HttpResponse.json({
      success: true,
      usersUpdated: body.updates.length,
      syncedAt: new Date().toISOString(),
      apiCallsSaved: body.updates.length - 1,
    });
  }),

  // Individual user update (for comparison)
  http.patch(/.*\/api\/users\/(?<userId>[^/]+)$/, async ({ request }) => {
    const updates = await request.json();
    apiCallCounts.userSync++;
    apiCallCounts.withoutBatch++;

    // Simulate network latency
    await delay(50);

    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop() as string;
    const currentData = userDataStore.get(userId) || {};
    userDataStore.set(userId, {
      ...currentData,
      ...updates,
      lastSynced: new Date().toISOString(),
    });

    return HttpResponse.json({
      success: true,
      userId,
      updated: true,
    });
  }),

  // Get API call statistics (for dashboard)
  http.get(/.*\/api\/batch\/stats$/, () => {
    const totalWithBatch = apiCallCounts.withBatch;
    const totalWithoutBatch = apiCallCounts.withoutBatch;
    const totalSaved = Math.max(0, totalWithoutBatch - totalWithBatch);
    // Derive a more meaningful savings metric based on analytics events processed vs batched calls
    const analyticsEquivalent = analyticsEvents.length;
    const derivedSavings =
      analyticsEquivalent > 0 ? Math.max(0, analyticsEquivalent - totalWithBatch) : totalSaved;
    const base = analyticsEquivalent > 0 ? analyticsEquivalent : totalWithoutBatch || 1;
    const savingsPercentage = Math.round((derivedSavings / base) * 100);

    return HttpResponse.json({
      apiCalls: apiCallCounts,
      totalSaved: derivedSavings,
      savingsPercentage,
      analyticsEventsProcessed: analyticsEvents.length,
      usersInSync: userDataStore.size,
      efficiency: {
        questionsPerCall:
          totalWithBatch > 0 ? Math.round(apiCallCounts.questions / totalWithBatch) : 0,
        eventsPerCall:
          totalWithBatch > 0 ? Math.round(analyticsEvents.length / apiCallCounts.analytics) : 0,
      },
    });
  }),

  // Reset statistics
  http.post(/.*\/api\/batch\/reset-stats$/, () => {
    apiCallCounts = {
      questions: 0,
      analytics: 0,
      userSync: 0,
      withBatch: 0,
      withoutBatch: 0,
    };
    analyticsEvents.length = 0;
    userDataStore.clear();

    return HttpResponse.json({
      success: true,
      message: 'Statistics reset',
    });
  }),

  // Simulate batch failure for retry testing
  http.post(/.*\/api\/batch\/test-failure$/, async ({ request }) => {
    const body = (await request.json()) as { failureRate: number };

    // Randomly fail based on failure rate
    if (Math.random() < (body.failureRate || 0.5)) {
      await delay(100);
      return HttpResponse.json(
        {
          error: 'Simulated batch processing failure',
          retryable: true,
        },
        { status: 503 },
      );
    }

    await delay(200);
    return HttpResponse.json({
      success: true,
      message: 'Batch processed successfully',
    });
  }),

  // Performance test endpoint
  http.post(/.*\/api\/batch\/performance-test$/, async ({ request }) => {
    const body = (await request.json()) as {
      itemCount: number;
      batchSize: number;
      mode: 'batch' | 'individual';
    };

    const startTime = Date.now();

    if (body.mode === 'batch') {
      // Simulate efficient batch processing
      const batches = Math.ceil(body.itemCount / body.batchSize);
      await delay(Math.max(50, batches * 20)); // total around 200ms for 100 items @10/batch

      return HttpResponse.json({
        success: true,
        mode: 'batch',
        itemsProcessed: body.itemCount,
        apiCalls: batches,
        processingTime: Date.now() - startTime,
        averageTimePerItem: (Date.now() - startTime) / body.itemCount,
      });
    } else {
      // Simulate server serializing individual requests (contention/limits)
      individualChain = individualChain.then(() => delay(10));
      await individualChain;

      return HttpResponse.json({
        success: true,
        mode: 'individual',
        itemsProcessed: body.itemCount,
        apiCalls: body.itemCount,
        processingTime: Date.now() - startTime,
        averageTimePerItem: (Date.now() - startTime) / body.itemCount,
      });
    }
  }),
];

// Export statistics for testing
export const getBatchStatistics = () => ({
  apiCalls: apiCallCounts,
  analyticsEvents: analyticsEvents.length,
  usersInSync: userDataStore.size,
});

// Export mock data for testing
export const getMockQuestions = () => mockQuestions;
export const getAnalyticsEvents = () => analyticsEvents;
export const getUserDataStore = () => userDataStore;
