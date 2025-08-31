// src/mocks/handlers/security.ts
import { http, HttpResponse } from 'msw';
import { z } from 'zod';

// In-memory stores for security testing
const validTokens = new Set(['mock_access_token_123', 'valid_token']);
const expiredTokens = new Set(['expired_token_123']);
const csrfTokens = new Map<string, string>(); // JWT -> CSRF token mapping
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Input validation schemas
const EmailSchema = z.string().email('Invalid email format');
const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*]/, 'Password must contain at least one special character');

const SecureInputSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  sqlInjection: z
    .string()
    .max(100)
    .refine(
      (val) => !val.includes('DROP') && !val.includes('DELETE') && !val.includes('--'),
      'SQL injection attempt detected',
    ),
  xssAttempt: z
    .string()
    .refine(
      (val) =>
        !val.includes('<script') && !val.includes('onerror=') && !val.includes('javascript:'),
      'XSS attempt detected',
    ),
  oversizedField: z.string().max(1000, 'Field size exceeds maximum allowed'),
});

// Helper to validate JWT
function validateJWT(authHeader: string | null): {
  valid: boolean;
  token?: string;
  error?: string;
} {
  if (!authHeader) {
    return { valid: false, error: 'No authorization header' };
  }

  if (!authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Invalid authorization format' };
  }

  const token = authHeader.replace('Bearer ', '');

  if (expiredTokens.has(token)) {
    return { valid: false, error: 'Token expired', token };
  }

  if (!validTokens.has(token) && !token.endsWith('_tampered')) {
    // Check for tampered tokens
    const originalToken = token.replace('_tampered', '');
    if (validTokens.has(originalToken)) {
      return { valid: false, error: 'Token signature invalid', token };
    }
  }

  if (!validTokens.has(token)) {
    return { valid: false, error: 'Token invalid', token };
  }

  return { valid: true, token };
}

// Helper for rate limiting
function checkRateLimit(
  clientId: string,
  limit: number = 3,
  windowMs: number = 10000,
): { allowed: boolean; remaining: number; resetIn?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(clientId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(clientId, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    const resetIn = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, resetIn };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

export const securityHandlers = [
  // Protected endpoint with JWT validation
  http.get('/api/secure/data', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const validation = validateJWT(authHeader);

    if (!validation.valid) {
      return HttpResponse.json(
        { error: validation.error, message: 'Authentication required' },
        { status: 401 },
      );
    }

    // Return protected data
    return HttpResponse.json({
      message: 'Access granted',
      data: {
        userId: 'user_123',
        secretData: 'This is protected information',
        permissions: ['read', 'write'],
        tokenInfo: {
          token: validation.token,
          expiresIn: 3600,
          issuedAt: Date.now(),
        },
      },
    });
  }),

  // CSRF-protected endpoint
  http.post('/api/secure/action', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const csrfHeader = request.headers.get('X-CSRF-Token');

    // First check JWT
    const validation = validateJWT(authHeader);
    if (!validation.valid) {
      return HttpResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check CSRF token
    if (!csrfHeader) {
      return HttpResponse.json(
        { error: 'CSRF token missing', message: 'Cross-site request forgery protection' },
        { status: 403 },
      );
    }

    // Validate CSRF token (in production, this would check against server-stored token)
    if (!csrfHeader.startsWith('csrf_')) {
      return HttpResponse.json(
        { error: 'CSRF token invalid', message: 'Invalid cross-site request forgery token' },
        { status: 403 },
      );
    }

    // Process the action
    const body = await request.json().catch(() => ({}));
    return HttpResponse.json({
      success: true,
      action: body.action || 'unknown',
      timestamp: Date.now(),
      message: 'Action completed successfully',
    });
  }),

  // Rate-limited endpoint
  http.get('/api/rate-limited', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const clientId = request.headers.get('X-Client-Id') || 'anonymous';

    // Check auth first
    const validation = validateJWT(authHeader);
    if (!validation.valid) {
      return HttpResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check rate limit
    const rateCheck = checkRateLimit(clientId, 3, 10000);

    if (!rateCheck.allowed) {
      return HttpResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please retry after ${rateCheck.resetIn} seconds`,
          retryAfter: rateCheck.resetIn,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.resetIn || 1),
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Date.now() + (rateCheck.resetIn || 1) * 1000),
          },
        },
      );
    }

    // Return successful response
    return HttpResponse.json(
      {
        success: true,
        data: `Request ${4 - rateCheck.remaining} of 3 in current window`,
        timestamp: Date.now(),
      },
      {
        headers: {
          'X-RateLimit-Limit': '3',
          'X-RateLimit-Remaining': String(rateCheck.remaining),
        },
      },
    );
  }),

  // Input validation endpoint
  http.post('/api/secure/validate', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    // Check auth
    const validation = validateJWT(authHeader);
    if (!validation.valid) {
      return HttpResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse and validate input
    const body = await request.json().catch(() => ({}));

    try {
      // Validate with Zod schema
      const validated = SecureInputSchema.parse(body);

      return HttpResponse.json({
        success: true,
        message: 'All inputs validated successfully',
        validated: {
          email: validated.email,
          password: '***hidden***',
          fieldsChecked: Object.keys(validated).length,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return HttpResponse.json(
          {
            success: false,
            message: 'Validation failed',
            errors: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
              code: e.code,
            })),
          },
          { status: 400 },
        );
      }

      return HttpResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
  }),

  // Session refresh endpoint (for JWT refresh testing)
  http.post('/api/secure/refresh', async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const refreshToken = body.refresh_token;

    if (!refreshToken || !refreshToken.includes('refresh')) {
      return HttpResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    // Generate new tokens
    const newAccessToken = `mock_access_token_${Date.now()}`;
    validTokens.add(newAccessToken);

    return HttpResponse.json({
      access_token: newAccessToken,
      refresh_token: `mock_refresh_token_${Date.now()}`,
      expires_in: 3600,
      token_type: 'Bearer',
    });
  }),

  // Logout endpoint (invalidates tokens)
  http.post('/api/secure/logout', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      validTokens.delete(token);
      csrfTokens.delete(token);
    }

    return HttpResponse.json({ success: true, message: 'Logged out successfully' });
  }),
];

// Helper to reset security state (for testing)
export const resetSecurityState = () => {
  validTokens.clear();
  validTokens.add('mock_access_token_123');
  validTokens.add('valid_token');
  expiredTokens.clear();
  expiredTokens.add('expired_token_123');
  csrfTokens.clear();
  rateLimitMap.clear();
};
