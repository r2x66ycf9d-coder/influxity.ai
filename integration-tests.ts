/**
 * Integration Tests for Influxity.ai
 * Tests the deployed application endpoints
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  const startTime = Date.now();
  try {
    await testFn();
    results.push({
      name,
      passed: true,
      duration: Date.now() - startTime,
    });
    console.log(`✓ ${name} (${Date.now() - startTime}ms)`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    });
    console.error(`✗ ${name} (${Date.now() - startTime}ms)`);
    console.error(`  Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function testHomepage() {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error(`Homepage returned ${response.status}`);
  }
  const html = await response.text();
  if (!html.includes('Influxity.ai')) {
    throw new Error('Homepage does not contain expected content');
  }
}

async function testHealthEndpoint() {
  const response = await fetch(`${BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error(`Health endpoint returned ${response.status}`);
  }
  const data = await response.json();
  if (data.status !== 'ok') {
    throw new Error('Health check failed');
  }
}

async function testTRPCEndpoint() {
  // Test that tRPC endpoint is accessible
  const response = await fetch(`${BASE_URL}/api/trpc/auth.getSession`);
  // Should return 200 or 401 (unauthorized), both are valid responses
  if (response.status !== 200 && response.status !== 401) {
    throw new Error(`tRPC endpoint returned unexpected status: ${response.status}`);
  }
}

async function testStaticAssets() {
  // Test that static assets are served
  const response = await fetch(`${BASE_URL}/logo.png`);
  if (!response.ok) {
    throw new Error(`Static asset returned ${response.status}`);
  }
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('image')) {
    throw new Error(`Static asset has wrong content type: ${contentType}`);
  }
}

async function testCORS() {
  // Test CORS headers
  const response = await fetch(BASE_URL, {
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://influxity.ai',
      'Access-Control-Request-Method': 'POST',
    },
  });
  
  const allowOrigin = response.headers.get('access-control-allow-origin');
  if (!allowOrigin) {
    throw new Error('CORS headers not present');
  }
}

async function testSecurityHeaders() {
  const response = await fetch(BASE_URL);
  
  const requiredHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
  ];
  
  const missingHeaders = requiredHeaders.filter(
    header => !response.headers.has(header)
  );
  
  if (missingHeaders.length > 0) {
    throw new Error(`Missing security headers: ${missingHeaders.join(', ')}`);
  }
}

async function testResponseTime() {
  const startTime = Date.now();
  const response = await fetch(BASE_URL);
  const duration = Date.now() - startTime;
  
  if (!response.ok) {
    throw new Error(`Homepage returned ${response.status}`);
  }
  
  if (duration > 2000) {
    throw new Error(`Response time too slow: ${duration}ms (expected < 2000ms)`);
  }
}

async function main() {
  console.log('=== INFLUXITY.AI INTEGRATION TESTS ===\n');
  console.log(`Testing: ${BASE_URL}\n`);
  
  await runTest('Homepage loads successfully', testHomepage);
  await runTest('Health endpoint responds', testHealthEndpoint);
  await runTest('tRPC endpoint is accessible', testTRPCEndpoint);
  await runTest('Static assets are served', testStaticAssets);
  await runTest('CORS headers are configured', testCORS);
  await runTest('Security headers are present', testSecurityHeaders);
  await runTest('Response time is acceptable', testResponseTime);
  
  console.log('\n=== TEST SUMMARY ===');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  
  console.log(`Total: ${results.length}`);
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Average Duration: ${avgDuration.toFixed(2)}ms`);
  
  if (failed > 0) {
    console.log('\nFailed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n✓ All tests passed!');
  }
}

main().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
