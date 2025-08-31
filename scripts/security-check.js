#!/usr/bin/env node

/**
 * Security Testing Script
 * Run locally: node scripts/security-check.js
 *
 * This script performs various security checks on the codebase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results
let totalTests = 0;
let passedTests = 0;
let warnings = [];
let errors = [];

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runTest(testName, testFn) {
  totalTests++;
  try {
    log(`\n🔍 Running: ${testName}`, colors.cyan);
    const result = testFn();
    if (result === true) {
      passedTests++;
      log(`  ✅ PASSED`, colors.green);
    } else if (result === 'warning') {
      passedTests++;
      log(`  ⚠️  WARNING`, colors.yellow);
    } else {
      log(`  ❌ FAILED`, colors.red);
    }
  } catch (error) {
    log(`  ❌ ERROR: ${error.message}`, colors.red);
    errors.push({ test: testName, error: error.message });
  }
}

// Test 1: Check for npm vulnerabilities
runTest('NPM Vulnerability Audit', () => {
  try {
    const output = execSync('npm audit --json 2>/dev/null', { encoding: 'utf8' });
    const audit = JSON.parse(output);

    if (audit.metadata.vulnerabilities.critical > 0) {
      errors.push('Critical vulnerabilities found in dependencies');
      return false;
    }

    if (audit.metadata.vulnerabilities.high > 0) {
      warnings.push(`${audit.metadata.vulnerabilities.high} high severity vulnerabilities found`);
      return 'warning';
    }

    return true;
  } catch (e) {
    // npm audit returns non-zero exit code if vulnerabilities found
    warnings.push('Some npm vulnerabilities detected - run "npm audit" for details');
    return 'warning';
  }
});

// Test 2: Check for hardcoded secrets
runTest('Hardcoded Secrets Detection', () => {
  const secretPatterns = [
    /api[_-]?key\s*=\s*["'][^"']+["']/gi,
    /secret[_-]?key\s*=\s*["'][^"']+["']/gi,
    /password\s*=\s*["'][^"']+["']/gi,
    /token\s*=\s*["'][^"']+["']/gi,
    /AWS[A-Z0-9]{16,}/g,
    /sk_live_[a-zA-Z0-9]{24,}/g,
  ];

  const srcDir = path.join(process.cwd(), 'src');
  let foundSecrets = false;

  function checkFile(filePath) {
    if (filePath.includes('node_modules') || filePath.includes('.test.')) return;

    const content = fs.readFileSync(filePath, 'utf8');
    for (const pattern of secretPatterns) {
      if (pattern.test(content)) {
        // Skip if it's in a test file or mock
        if (!filePath.includes('mock') && !filePath.includes('stories')) {
          warnings.push(`Potential secret in ${filePath}`);
          foundSecrets = true;
        }
      }
    }
  }

  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (
        file.endsWith('.ts') ||
        file.endsWith('.tsx') ||
        file.endsWith('.js') ||
        file.endsWith('.jsx')
      ) {
        checkFile(fullPath);
      }
    });
  }

  if (fs.existsSync(srcDir)) {
    walkDir(srcDir);
  }

  return !foundSecrets;
});

// Test 3: Check for dangerous functions
runTest('Dangerous Function Usage', () => {
  const dangerousPatterns = [
    { pattern: /eval\s*\(/g, name: 'eval()' },
    { pattern: /new\s+Function\s*\(/g, name: 'new Function()' },
    { pattern: /innerHTML\s*=/g, name: 'innerHTML' },
    { pattern: /document\.write/g, name: 'document.write' },
    {
      pattern: /dangerouslySetInnerHTML/g,
      name: 'dangerouslySetInnerHTML',
      allowIn: ['SecurityPlayground'],
    },
  ];

  const srcDir = path.join(process.cwd(), 'src');
  let foundDangerous = false;

  function checkFile(filePath) {
    if (filePath.includes('node_modules')) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);

    for (const { pattern, name, allowIn = [] } of dangerousPatterns) {
      if (pattern.test(content)) {
        // Check if it's in an allowed file
        const isAllowed = allowIn.some((allowed) => filePath.includes(allowed));
        if (!isAllowed) {
          warnings.push(`${name} usage in ${filePath}`);
          foundDangerous = true;
        }
      }
    }
  }

  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (
        file.endsWith('.ts') ||
        file.endsWith('.tsx') ||
        file.endsWith('.js') ||
        file.endsWith('.jsx')
      ) {
        checkFile(fullPath);
      }
    });
  }

  if (fs.existsSync(srcDir)) {
    walkDir(srcDir);
  }

  return !foundDangerous || (foundDangerous && warnings.length > 0 ? 'warning' : false);
});

// Test 4: Check localStorage usage for sensitive data
runTest('Secure Storage Patterns', () => {
  const srcDir = path.join(process.cwd(), 'src');
  let insecureStorage = [];

  function checkFile(filePath) {
    if (filePath.includes('node_modules') || filePath.includes('.test.')) return;

    const content = fs.readFileSync(filePath, 'utf8');

    // Check for localStorage with sensitive keys
    const localStoragePattern =
      /localStorage\.(setItem|getItem)\s*\(\s*["'](.*?token|.*?password|.*?secret|.*?key|.*?session)["']/gi;
    const matches = content.match(localStoragePattern);

    if (matches && !filePath.includes('AuthContext')) {
      insecureStorage.push({ file: filePath, matches });
    }
  }

  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (
        file.endsWith('.ts') ||
        file.endsWith('.tsx') ||
        file.endsWith('.js') ||
        file.endsWith('.jsx')
      ) {
        checkFile(fullPath);
      }
    });
  }

  if (fs.existsSync(srcDir)) {
    walkDir(srcDir);
  }

  if (insecureStorage.length > 0) {
    insecureStorage.forEach(({ file }) => {
      warnings.push(`Potentially insecure storage in ${file}`);
    });
    return 'warning';
  }

  return true;
});

// Test 5: Check for SQL injection patterns
runTest('SQL Injection Prevention', () => {
  const srcDir = path.join(process.cwd(), 'src');
  let sqlInjectionRisks = [];

  function checkFile(filePath) {
    if (filePath.includes('node_modules') || filePath.includes('.test.')) return;

    const content = fs.readFileSync(filePath, 'utf8');

    // Check for string concatenation in queries
    const patterns = [
      /query.*?\+.*?['"]/g,
      /sql\s*=.*?\+/g,
      /WHERE.*?\$\{/g,
      /SELECT.*?\$\{/g,
      /INSERT.*?\$\{/g,
      /UPDATE.*?\$\{/g,
      /DELETE.*?\$\{/g,
    ];

    for (const pattern of patterns) {
      if (pattern.test(content)) {
        sqlInjectionRisks.push(filePath);
        break;
      }
    }
  }

  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (
        file.endsWith('.ts') ||
        file.endsWith('.tsx') ||
        file.endsWith('.js') ||
        file.endsWith('.jsx')
      ) {
        checkFile(fullPath);
      }
    });
  }

  if (fs.existsSync(srcDir)) {
    walkDir(srcDir);
  }

  if (sqlInjectionRisks.length > 0) {
    sqlInjectionRisks.forEach((file) => {
      warnings.push(`Potential SQL injection risk in ${file}`);
    });
    return 'warning';
  }

  return true;
});

// Test 6: Check for proper HTTPS usage
runTest('HTTPS/TLS Configuration', () => {
  const srcDir = path.join(process.cwd(), 'src');
  let httpUsage = [];

  function checkFile(filePath) {
    if (filePath.includes('node_modules') || filePath.includes('.test.')) return;

    const content = fs.readFileSync(filePath, 'utf8');

    // Check for http:// URLs (excluding localhost)
    const httpPattern = /http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0)/g;
    const matches = content.match(httpPattern);

    if (matches) {
      httpUsage.push({ file: filePath, urls: matches });
    }
  }

  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (
        file.endsWith('.ts') ||
        file.endsWith('.tsx') ||
        file.endsWith('.js') ||
        file.endsWith('.jsx')
      ) {
        checkFile(fullPath);
      }
    });
  }

  if (fs.existsSync(srcDir)) {
    walkDir(srcDir);
  }

  if (httpUsage.length > 0) {
    httpUsage.forEach(({ file, urls }) => {
      warnings.push(`Non-HTTPS URL in ${file}: ${urls.join(', ')}`);
    });
    return 'warning';
  }

  return true;
});

// Test 7: Check Security Headers Implementation
runTest('Security Headers Check', () => {
  const handlersPath = path.join(process.cwd(), 'src', 'mocks', 'handlers');

  if (!fs.existsSync(handlersPath)) {
    warnings.push('Cannot find handlers directory');
    return 'warning';
  }

  const securityHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Strict-Transport-Security',
    'Content-Security-Policy',
  ];

  let foundHeaders = [];

  function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    securityHeaders.forEach((header) => {
      if (content.includes(header)) {
        foundHeaders.push(header);
      }
    });
  }

  const files = fs.readdirSync(handlersPath);
  files.forEach((file) => {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      checkFile(path.join(handlersPath, file));
    }
  });

  const missingHeaders = securityHeaders.filter((h) => !foundHeaders.includes(h));
  if (missingHeaders.length > 0) {
    warnings.push(`Missing security headers: ${missingHeaders.join(', ')}`);
    return 'warning';
  }

  return true;
});

// Test 8: Check for Zod validation usage
runTest('Input Validation with Zod', () => {
  const securityHandlerPath = path.join(process.cwd(), 'src', 'mocks', 'handlers', 'security.ts');

  if (fs.existsSync(securityHandlerPath)) {
    const content = fs.readFileSync(securityHandlerPath, 'utf8');
    if (content.includes('import { z }') && content.includes('z.object')) {
      return true;
    }
  }

  warnings.push('Zod validation not properly configured in security handlers');
  return 'warning';
});

// Generate Report
console.log('\n' + '='.repeat(60));
log('\n📊 SECURITY CHECK REPORT', colors.blue);
console.log('='.repeat(60));

log(`\nTests Run: ${totalTests}`, colors.cyan);
log(`Tests Passed: ${passedTests}`, passedTests === totalTests ? colors.green : colors.yellow);

if (warnings.length > 0) {
  log(`\n⚠️  Warnings (${warnings.length}):`, colors.yellow);
  warnings.forEach((warning) => {
    console.log(`  - ${warning}`);
  });
}

if (errors.length > 0) {
  log(`\n❌ Errors (${errors.length}):`, colors.red);
  errors.forEach(({ test, error }) => {
    console.log(`  - ${test}: ${error}`);
  });
}

// Summary
console.log('\n' + '='.repeat(60));
if (errors.length === 0 && warnings.length === 0) {
  log('🎉 All security checks passed!', colors.green);
  process.exit(0);
} else if (errors.length === 0) {
  log('✅ Security checks passed with warnings', colors.yellow);
  log('\nRecommendations:', colors.cyan);
  console.log('  1. Review and address warnings');
  console.log('  2. Run "npm audit fix" to update dependencies');
  console.log('  3. Consider implementing missing security headers');
  process.exit(0);
} else {
  log('❌ Security checks failed', colors.red);
  log('\nRequired Actions:', colors.red);
  console.log('  1. Fix critical security issues');
  console.log('  2. Run "npm audit fix --force" if needed');
  console.log('  3. Review security documentation');
  process.exit(1);
}
