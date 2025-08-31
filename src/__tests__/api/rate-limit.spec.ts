// src/__tests__/api/rate-limit.spec.ts
import { setupServer } from 'msw/node';
import { handlers } from '@/mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

async function call(times: number) {
  const results: number[] = [];
  for (let i = 0; i < times; i++) {
    const res = await fetch('http://localhost/api/ratelimit', {
      method: 'GET',
      headers: { 'x-client-id': 'jest' },
    });
    results.push(res.status);
  }
  return results;
}

test('rate limits after 3 calls', async () => {
  const statuses = await call(4);
  expect(statuses.slice(0, 3)).toEqual([200, 200, 200]);
  expect(statuses[3]).toBe(429);
});
