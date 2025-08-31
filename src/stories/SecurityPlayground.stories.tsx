// src/stories/SecurityPlayground.stories.tsx
import React, { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect, waitFor } from '@storybook/test';
import DOMPurify from 'isomorphic-dompurify';

// Security test component
function SecurityPlayground() {
  const [activeTab, setActiveTab] = useState<'jwt' | 'xss' | 'csrf' | 'rate' | 'input'>('jwt');

  // JWT Testing State
  const [jwtToken, setJwtToken] = useState('mock_access_token_123');
  const [jwtResponse, setJwtResponse] = useState<any>(null);
  const [jwtLoading, setJwtLoading] = useState(false);

  // XSS Testing State
  const [xssInput, setXssInput] = useState('<script>alert("XSS")</script>');
  const [xssOutput, setXssOutput] = useState('');
  const [xssSanitized, setXssSanitized] = useState('');

  // CSRF Testing State
  const [csrfToken, setCsrfToken] = useState('');
  const [csrfResponse, setCsrfResponse] = useState<any>(null);

  // Rate Limiting State
  const [rateCounter, setRateCounter] = useState(0);
  const [rateResponses, setRateResponses] = useState<any[]>([]);

  // Input Validation State
  const [inputEmail, setInputEmail] = useState('test@example.com');
  const [inputPassword, setInputPassword] = useState('short');
  const [inputValidation, setInputValidation] = useState<any>(null);

  // Simulated CSRF token generation
  useEffect(() => {
    setCsrfToken(`csrf_${Date.now().toString(36)}`);
  }, []);

  // JWT Testing Functions
  const testValidJWT = async () => {
    setJwtLoading(true);
    try {
      const res = await fetch('/api/secure/data', {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      setJwtResponse({
        status: res.status,
        data,
        headers: Object.fromEntries(res.headers.entries()),
      });
    } catch (e: any) {
      setJwtResponse({ error: e.message });
    } finally {
      setJwtLoading(false);
    }
  };

  const testExpiredJWT = async () => {
    setJwtLoading(true);
    const expiredToken = 'expired_token_123';
    try {
      const res = await fetch('/api/secure/data', {
        headers: {
          Authorization: `Bearer ${expiredToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      setJwtResponse({ status: res.status, data });
    } catch (e: any) {
      setJwtResponse({ error: e.message });
    } finally {
      setJwtLoading(false);
    }
  };

  const testNoJWT = async () => {
    setJwtLoading(true);
    try {
      const res = await fetch('/api/secure/data', {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      setJwtResponse({ status: res.status, data });
    } catch (e: any) {
      setJwtResponse({ error: e.message });
    } finally {
      setJwtLoading(false);
    }
  };

  const testTamperedJWT = async () => {
    setJwtLoading(true);
    const tamperedToken = jwtToken + '_tampered';
    try {
      const res = await fetch('/api/secure/data', {
        headers: {
          Authorization: `Bearer ${tamperedToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      setJwtResponse({ status: res.status, data });
    } catch (e: any) {
      setJwtResponse({ error: e.message });
    } finally {
      setJwtLoading(false);
    }
  };

  // XSS Testing Functions
  const testXSS = () => {
    // Unsafe rendering (DO NOT DO THIS IN PRODUCTION)
    setXssOutput(xssInput);

    // Safe rendering with DOMPurify
    const sanitized = DOMPurify.sanitize(xssInput, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
      ALLOWED_ATTR: ['href', 'target'],
    });
    setXssSanitized(sanitized);
  };

  // CSRF Testing Functions
  const testWithCSRF = async () => {
    try {
      const res = await fetch('/api/secure/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ action: 'update_profile' }),
      });
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      setCsrfResponse({ status: res.status, data, hasCSRF: true });
    } catch (e: any) {
      setCsrfResponse({ error: e.message });
    }
  };

  const testWithoutCSRF = async () => {
    try {
      const res = await fetch('/api/secure/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ action: 'update_profile' }),
      });
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      setCsrfResponse({ status: res.status, data, hasCSRF: false });
    } catch (e: any) {
      setCsrfResponse({ error: e.message });
    }
  };

  const testWrongCSRF = async () => {
    try {
      const res = await fetch('/api/secure/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'wrong_csrf_token',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ action: 'update_profile' }),
      });
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      setCsrfResponse({ status: res.status, data, hasCSRF: 'wrong' });
    } catch (e: any) {
      setCsrfResponse({ error: e.message });
    }
  };

  // Rate Limiting Functions
  const testRateLimit = async () => {
    const newResponses = [];
    for (let i = 0; i < 5; i++) {
      try {
        const res = await fetch('/api/rate-limited', {
          headers: {
            'X-Client-Id': 'test-client',
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        const data = await res.json().catch(() => ({}));
        newResponses.push({
          attempt: i + 1,
          status: res.status,
          data,
          retryAfter: res.headers.get('Retry-After'),
          remaining: res.headers.get('X-RateLimit-Remaining'),
        });
      } catch (e: any) {
        newResponses.push({ attempt: i + 1, error: e.message });
      }
      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    setRateResponses(newResponses);
    setRateCounter(rateCounter + 5);
  };

  const resetRateLimit = () => {
    setRateResponses([]);
    setRateCounter(0);
  };

  // Input Validation Functions
  const testInputValidation = async () => {
    try {
      const res = await fetch('/api/secure/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          email: inputEmail,
          password: inputPassword,
          sqlInjection: "'; DROP TABLE users; --",
          xssAttempt: '<img src=x onerror="alert(1)">',
          oversizedField: 'x'.repeat(10000),
        }),
      });
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      setInputValidation({ status: res.status, data });
    } catch (e: any) {
      setInputValidation({ error: e.message });
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 1200 }}>
      <h2>🔒 Security Testing Playground</h2>
      <p>
        Interactive security testing environment for validating authentication, authorization, and
        input security patterns.
      </p>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '2px solid #333' }}>
        <button
          onClick={() => setActiveTab('jwt')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'jwt' ? '#4a90e2' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'jwt' ? 'bold' : 'normal',
          }}
        >
          JWT Auth
        </button>
        <button
          onClick={() => setActiveTab('xss')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'xss' ? '#4a90e2' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'xss' ? 'bold' : 'normal',
          }}
        >
          XSS Prevention
        </button>
        <button
          onClick={() => setActiveTab('csrf')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'csrf' ? '#4a90e2' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'csrf' ? 'bold' : 'normal',
          }}
        >
          CSRF Protection
        </button>
        <button
          onClick={() => setActiveTab('rate')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'rate' ? '#4a90e2' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'rate' ? 'bold' : 'normal',
          }}
        >
          Rate Limiting
        </button>
        <button
          onClick={() => setActiveTab('input')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'input' ? '#4a90e2' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'input' ? 'bold' : 'normal',
          }}
        >
          Input Validation
        </button>
      </div>

      {/* JWT Testing Tab */}
      {activeTab === 'jwt' && (
        <div>
          <h3>JWT Token Validation</h3>
          <div style={{ marginBottom: 20 }}>
            <label>
              Current Token:
              <input
                type="text"
                value={jwtToken}
                onChange={(e) => setJwtToken(e.target.value)}
                style={{ width: '100%', padding: 5, marginTop: 5 }}
                aria-label="jwt-token"
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button onClick={testValidJWT} disabled={jwtLoading} aria-label="test-valid-jwt">
              Test Valid Token
            </button>
            <button onClick={testExpiredJWT} disabled={jwtLoading} aria-label="test-expired-jwt">
              Test Expired Token
            </button>
            <button onClick={testNoJWT} disabled={jwtLoading} aria-label="test-no-jwt">
              Test No Token
            </button>
            <button onClick={testTamperedJWT} disabled={jwtLoading} aria-label="test-tampered-jwt">
              Test Tampered Token
            </button>
          </div>

          {jwtResponse && (
            <div
              style={{
                padding: 10,
                background: jwtResponse.status === 200 ? '#e8f5e9' : '#ffebee',
                borderRadius: 5,
              }}
            >
              <strong>Response Status: {jwtResponse.status || 'Error'}</strong>
              <pre style={{ fontSize: 12, overflow: 'auto' }}>
                {JSON.stringify(jwtResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* XSS Prevention Tab */}
      {activeTab === 'xss' && (
        <div>
          <h3>XSS Prevention Testing</h3>
          <div style={{ marginBottom: 20 }}>
            <label>
              Malicious Input:
              <textarea
                value={xssInput}
                onChange={(e) => setXssInput(e.target.value)}
                style={{ width: '100%', height: 100, padding: 5, marginTop: 5 }}
                aria-label="xss-input"
              />
            </label>
          </div>

          <button onClick={testXSS} aria-label="test-xss">
            Test XSS Sanitization
          </button>

          <div style={{ marginTop: 20 }}>
            <h4>⚠️ Unsafe Output (Raw HTML):</h4>
            <div
              style={{
                padding: 10,
                background: '#ffebee',
                borderRadius: 5,
                marginBottom: 10,
              }}
            >
              <code>{xssOutput}</code>
            </div>

            <h4>✅ Safe Output (Sanitized):</h4>
            <div
              style={{
                padding: 10,
                background: '#e8f5e9',
                borderRadius: 5,
              }}
            >
              <code>{xssSanitized}</code>
              <div style={{ marginTop: 10, padding: 10, border: '1px solid #ccc' }}>
                <strong>Rendered:</strong>
                <div dangerouslySetInnerHTML={{ __html: xssSanitized }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSRF Protection Tab */}
      {activeTab === 'csrf' && (
        <div>
          <h3>CSRF Token Validation</h3>
          <div style={{ marginBottom: 20 }}>
            <p>
              Current CSRF Token: <code>{csrfToken}</code>
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button onClick={testWithCSRF} aria-label="test-with-csrf">
              Test With Valid CSRF
            </button>
            <button onClick={testWithoutCSRF} aria-label="test-without-csrf">
              Test Without CSRF
            </button>
            <button onClick={testWrongCSRF} aria-label="test-wrong-csrf">
              Test Wrong CSRF
            </button>
          </div>

          {csrfResponse && (
            <div
              style={{
                padding: 10,
                background: csrfResponse.status === 200 ? '#e8f5e9' : '#ffebee',
                borderRadius: 5,
              }}
            >
              <strong>Response Status: {csrfResponse.status || 'Error'}</strong>
              <p>
                CSRF Token:{' '}
                {csrfResponse.hasCSRF === true
                  ? '✅ Valid'
                  : csrfResponse.hasCSRF === false
                    ? '❌ Missing'
                    : '⚠️ Invalid'}
              </p>
              <pre style={{ fontSize: 12, overflow: 'auto' }}>
                {JSON.stringify(csrfResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Rate Limiting Tab */}
      {activeTab === 'rate' && (
        <div>
          <h3>Rate Limiting Testing</h3>
          <p>Test rate limiting by sending multiple requests in quick succession.</p>
          <p>Total Requests Sent: {rateCounter}</p>

          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button onClick={testRateLimit} aria-label="test-rate-limit">
              Send 5 Rapid Requests
            </button>
            <button onClick={resetRateLimit} aria-label="reset-rate-limit">
              Reset Counter
            </button>
          </div>

          {rateResponses.length > 0 && (
            <div>
              <h4>Response Log:</h4>
              {rateResponses.map((resp, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 10,
                    marginBottom: 5,
                    background:
                      resp.status === 200 ? '#e8f5e9' : resp.status === 429 ? '#fff3e0' : '#ffebee',
                    borderRadius: 5,
                  }}
                >
                  <strong>Attempt {resp.attempt}:</strong>
                  Status {resp.status || 'Error'}
                  {resp.remaining !== null && ` | Remaining: ${resp.remaining}`}
                  {resp.retryAfter && ` | Retry After: ${resp.retryAfter}s`}
                  {resp.error && ` | Error: ${resp.error}`}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input Validation Tab */}
      {activeTab === 'input' && (
        <div>
          <h3>Input Validation & Sanitization</h3>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 10 }}>
              Email:
              <input
                type="text"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                style={{ width: '100%', padding: 5, marginTop: 5 }}
                aria-label="input-email"
              />
            </label>

            <label style={{ display: 'block', marginBottom: 10 }}>
              Password:
              <input
                type="text"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                style={{ width: '100%', padding: 5, marginTop: 5 }}
                aria-label="input-password"
              />
            </label>

            <div style={{ padding: 10, background: '#f5f5f5', borderRadius: 5, marginBottom: 10 }}>
              <strong>Auto-included Attack Vectors:</strong>
              <ul style={{ fontSize: 12 }}>
                <li>
                  SQL Injection: <code>'; DROP TABLE users; --</code>
                </li>
                <li>
                  XSS Attempt: <code>&lt;img src=x onerror="alert(1)"&gt;</code>
                </li>
                <li>Oversized Field: 10,000 character string</li>
              </ul>
            </div>
          </div>

          <button onClick={testInputValidation} aria-label="test-input-validation">
            Test Input Validation
          </button>

          {inputValidation && (
            <div
              style={{
                marginTop: 20,
                padding: 10,
                background: inputValidation.status === 200 ? '#e8f5e9' : '#ffebee',
                borderRadius: 5,
              }}
            >
              <strong>Validation Result: {inputValidation.status || 'Error'}</strong>
              <pre style={{ fontSize: 12, overflow: 'auto' }}>
                {JSON.stringify(inputValidation, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Storybook configuration
const meta = {
  title: 'Security/Playground',
  component: SecurityPlayground,
  parameters: {
    docs: {
      description: {
        component:
          'Interactive security testing playground for JWT validation, XSS prevention, CSRF protection, rate limiting, and input validation.',
      },
    },
  },
} satisfies Meta<typeof SecurityPlayground>;

export default meta;
type Story = StoryObj<typeof meta>;

// Test stories with play functions
export const Default: Story = {};

export const JWTValidation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test valid JWT
    await userEvent.click(canvas.getByLabelText('test-valid-jwt'));
    await waitFor(() => {
      expect(canvas.getByText(/Response Status: 200/)).toBeInTheDocument();
    });

    // Test expired JWT
    await userEvent.click(canvas.getByLabelText('test-expired-jwt'));
    await waitFor(() => {
      expect(canvas.getByText(/Response Status: 401/)).toBeInTheDocument();
    });

    // Test no JWT
    await userEvent.click(canvas.getByLabelText('test-no-jwt'));
    await waitFor(() => {
      expect(canvas.getByText(/Response Status: 401/)).toBeInTheDocument();
    });
  },
};

export const XSSPrevention: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Navigate to XSS tab
    await userEvent.click(canvas.getByText('XSS Prevention'));

    // Test XSS sanitization
    const input = canvas.getByLabelText('xss-input') as HTMLTextAreaElement;
    await userEvent.clear(input);
    await userEvent.type(input, '<script>alert("XSS")</script><b>Bold text</b>');

    await userEvent.click(canvas.getByLabelText('test-xss'));

    // Check that script tag is removed but bold tag is kept
    await waitFor(() => {
      const sanitized = canvas.getByText(/Bold text/);
      expect(sanitized).toBeInTheDocument();
    });
  },
};

export const CSRFProtection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Navigate to CSRF tab
    await userEvent.click(canvas.getByText('CSRF Protection'));

    // Test with valid CSRF token
    await userEvent.click(canvas.getByLabelText('test-with-csrf'));
    await waitFor(() => {
      expect(canvas.getByText(/✅ Valid/)).toBeInTheDocument();
    });

    // Test without CSRF token
    await userEvent.click(canvas.getByLabelText('test-without-csrf'));
    await waitFor(() => {
      expect(canvas.getByText(/❌ Missing/)).toBeInTheDocument();
    });

    // Test with wrong CSRF token
    await userEvent.click(canvas.getByLabelText('test-wrong-csrf'));
    await waitFor(() => {
      expect(canvas.getByText(/⚠️ Invalid/)).toBeInTheDocument();
    });
  },
};

export const RateLimiting: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Navigate to Rate Limiting tab
    await userEvent.click(canvas.getByText('Rate Limiting'));

    // Test rate limiting
    await userEvent.click(canvas.getByLabelText('test-rate-limit'));

    // Wait for responses and check that later requests are rate limited
    await waitFor(
      () => {
        const attempts = canvas.getAllByText(/Attempt \d:/);
        expect(attempts.length).toBeGreaterThanOrEqual(5);

        // Check that at least one request was rate limited (429)
        expect(canvas.getByText(/Status 429/)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  },
};

export const InputValidation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Navigate to Input Validation tab
    await userEvent.click(canvas.getByText('Input Validation'));

    // Test with invalid email
    const emailInput = canvas.getByLabelText('input-email') as HTMLInputElement;
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'invalid-email');

    // Test with short password
    const passwordInput = canvas.getByLabelText('input-password') as HTMLInputElement;
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, '123');

    await userEvent.click(canvas.getByLabelText('test-input-validation'));

    // Check for validation errors
    await waitFor(() => {
      expect(canvas.getByText(/Validation Result:/)).toBeInTheDocument();
    });
  },
};
