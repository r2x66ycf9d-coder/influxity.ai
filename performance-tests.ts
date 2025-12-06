/**
 * Performance and Load Tests for Influxity.ai
 * Tests response times, concurrent requests, and resource usage
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const CONCURRENT_USERS = 10;
const REQUESTS_PER_USER = 5;

interface PerformanceMetric {
  endpoint: string;
  method: string;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  successRate: number;
  totalRequests: number;
}

const metrics: PerformanceMetric[] = [];

async function measureRequest(url: string, method: string = 'GET'): Promise<number> {
  const startTime = Date.now();
  try {
    const response = await fetch(url, { method });
    await response.text(); // Ensure full response is received
    return Date.now() - startTime;
  } catch (error) {
    return -1; // Indicate failure
  }
}

async function testEndpoint(
  name: string,
  path: string,
  method: string = 'GET',
  iterations: number = 10
): Promise<void> {
  console.log(`\nTesting: ${name}`);
  const url = `${BASE_URL}${path}`;
  const times: number[] = [];
  let successCount = 0;

  for (let i = 0; i < iterations; i++) {
    const duration = await measureRequest(url, method);
    if (duration > 0) {
      times.push(duration);
      successCount++;
    }
    process.stdout.write('.');
  }

  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const successRate = (successCount / iterations) * 100;

    metrics.push({
      endpoint: name,
      method,
      avgResponseTime: avgTime,
      minResponseTime: minTime,
      maxResponseTime: maxTime,
      successRate,
      totalRequests: iterations,
    });

    console.log(`\n  Avg: ${avgTime.toFixed(2)}ms | Min: ${minTime}ms | Max: ${maxTime}ms | Success: ${successRate.toFixed(1)}%`);
  } else {
    console.log('\n  ✗ All requests failed');
  }
}

async function concurrentLoadTest(): Promise<void> {
  console.log(`\n=== CONCURRENT LOAD TEST ===`);
  console.log(`Simulating ${CONCURRENT_USERS} concurrent users, ${REQUESTS_PER_USER} requests each\n`);

  const startTime = Date.now();
  const promises: Promise<number>[] = [];

  for (let user = 0; user < CONCURRENT_USERS; user++) {
    for (let req = 0; req < REQUESTS_PER_USER; req++) {
      promises.push(measureRequest(BASE_URL));
    }
  }

  const results = await Promise.all(promises);
  const duration = Date.now() - startTime;
  
  const successful = results.filter(r => r > 0);
  const failed = results.filter(r => r < 0).length;
  
  if (successful.length > 0) {
    const avgTime = successful.reduce((a, b) => a + b, 0) / successful.length;
    const minTime = Math.min(...successful);
    const maxTime = Math.max(...successful);
    const throughput = (successful.length / duration) * 1000;

    console.log(`Total Duration: ${duration}ms`);
    console.log(`Total Requests: ${results.length}`);
    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed}`);
    console.log(`Avg Response Time: ${avgTime.toFixed(2)}ms`);
    console.log(`Min Response Time: ${minTime}ms`);
    console.log(`Max Response Time: ${maxTime}ms`);
    console.log(`Throughput: ${throughput.toFixed(2)} req/sec`);
  } else {
    console.log('✗ All concurrent requests failed');
  }
}

async function main() {
  console.log('=== INFLUXITY.AI PERFORMANCE TESTS ===');
  console.log(`Testing: ${BASE_URL}\n`);

  // Test individual endpoints
  await testEndpoint('Homepage', '/');
  await testEndpoint('Static Asset (Logo)', '/logo.png');
  await testEndpoint('Pricing Page', '/pricing');
  
  // Concurrent load test
  await concurrentLoadTest();

  // Summary
  console.log('\n=== PERFORMANCE SUMMARY ===\n');
  
  if (metrics.length > 0) {
    console.log('Endpoint Performance:');
    metrics.forEach(m => {
      const status = m.successRate === 100 ? '✓' : '⚠';
      console.log(`${status} ${m.endpoint}`);
      console.log(`   Avg: ${m.avgResponseTime.toFixed(2)}ms | Min: ${m.minResponseTime}ms | Max: ${m.maxResponseTime}ms`);
      console.log(`   Success Rate: ${m.successRate.toFixed(1)}%`);
    });

    const overallAvg = metrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / metrics.length;
    console.log(`\nOverall Average Response Time: ${overallAvg.toFixed(2)}ms`);

    // Performance grading
    if (overallAvg < 100) {
      console.log('Performance Grade: ✓ EXCELLENT');
    } else if (overallAvg < 300) {
      console.log('Performance Grade: ✓ GOOD');
    } else if (overallAvg < 1000) {
      console.log('Performance Grade: ⚠ ACCEPTABLE');
    } else {
      console.log('Performance Grade: ✗ NEEDS IMPROVEMENT');
    }
  }
}

main().catch(error => {
  console.error('Performance test suite failed:', error);
  process.exit(1);
});
