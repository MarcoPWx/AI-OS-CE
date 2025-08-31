// src/__tests__/api/cache.spec.ts
import { setupServer } from 'msw/node';
import { handlers } from '@/mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('returns 200 with ETag, then 304 on If-None-Match', async () => {
  const res1 = await fetch('http://localhost/api/cache', { method: 'GET' });
  expect(res1.status).toBe(200);
  const etag = res1.headers.get('etag');
  expect(etag).toBeTruthy();

  const res2 = await fetch('http://localhost/api/cache', {
    method: 'GET',
    headers: { 'If-None-Match': etag || '' },
  });
  expect(res2.status).toBe(304);
});
