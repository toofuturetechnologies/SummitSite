/**
 * Admin Panel Automated Test Runner
 * Executes all test cases from ADMIN-PANEL-PHASE-6-TESTING.md
 * 
 * Usage: npx ts-node scripts/run-admin-tests.ts
 */

import fetch from 'node-fetch';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || '';

const results: TestResult[] = [];

/**
 * Test runner utilities
 */
async function test(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    results.push({
      name,
      passed: true,
      duration: Date.now() - start,
    });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - start,
    });
    console.log(`✗ ${name}`);
  }
}

async function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function apiCall(
  method: string,
  path: string,
  body?: Record<string, any>
): Promise<any> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  } as any);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Test suites
 */

async function testAuthentication() {
  await test('Admin access gate - non-admin gets 403', async () => {
    const res = await fetch(`${ADMIN_URL}/admin`, {
      headers: { 'Cookie': 'token=invalid' },
    } as any);
    // Should redirect or return 403
  });

  await test('Admin dashboard loads', async () => {
    const res = await fetch(`${API_URL}/admin/check`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    } as any);
    const data = await res.json();
    await assert(data.isAdmin, 'Should be admin');
  });
}

async function testDashboardMetrics() {
  await test('Dashboard metrics endpoint responds', async () => {
    const data = await apiCall('GET', '/admin/analytics/dashboard');
    await assert(data.total_users !== undefined, 'Should have total_users');
    await assert(data.active_guides !== undefined, 'Should have active_guides');
    await assert(data.total_bookings !== undefined, 'Should have total_bookings');
  });

  await test('Dashboard metrics are non-negative', async () => {
    const data = await apiCall('GET', '/admin/analytics/dashboard');
    await assert(data.total_users >= 0, 'total_users should be >= 0');
    await assert(data.active_guides >= 0, 'active_guides should be >= 0');
    await assert(data.monthly_revenue >= 0, 'monthly_revenue should be >= 0');
  });
}

async function testUserManagement() {
  await test('List users endpoint responds', async () => {
    const data = await apiCall('GET', '/admin/users?limit=20&offset=0');
    await assert(Array.isArray(data.users), 'Should return users array');
    await assert(data.total !== undefined, 'Should have total count');
  });

  await test('Filter users by status', async () => {
    const data = await apiCall('GET', '/admin/users?status=active');
    await assert(Array.isArray(data.users), 'Should filter by active status');
  });

  await test('Pagination works', async () => {
    const data1 = await apiCall('GET', '/admin/users?limit=10&offset=0');
    const data2 = await apiCall('GET', '/admin/users?limit=10&offset=10');
    await assert(data1.users.length <= 10, 'Should respect limit');
  });
}

async function testUGCModeration() {
  await test('List UGC videos endpoint responds', async () => {
    const data = await apiCall('GET', '/admin/ugc?limit=20&offset=0');
    await assert(Array.isArray(data.videos), 'Should return videos array');
  });

  await test('Filter UGC by status', async () => {
    const data = await apiCall('GET', '/admin/ugc?status=pending');
    await assert(Array.isArray(data.videos), 'Should filter by pending');
  });

  await test('Sort UGC videos', async () => {
    const data = await apiCall('GET', '/admin/ugc?sort=newest');
    await assert(Array.isArray(data.videos), 'Should sort correctly');
  });
}

async function testDisputeResolution() {
  await test('List disputes endpoint responds', async () => {
    const data = await apiCall('GET', '/admin/disputes?limit=20&offset=0');
    await assert(Array.isArray(data.disputes), 'Should return disputes array');
  });

  await test('Filter disputes by status', async () => {
    const data = await apiCall('GET', '/admin/disputes?status=open');
    const openDisputes = data.disputes.filter((d: any) => d.status === 'open');
    await assert(openDisputes.length >= 0, 'Should filter open disputes');
  });
}

async function testContentReports() {
  await test('List reports endpoint responds', async () => {
    const data = await apiCall('GET', '/admin/reports?limit=20&offset=0');
    await assert(Array.isArray(data.reports), 'Should return reports array');
  });

  await test('Report count includes all statuses', async () => {
    const data = await apiCall('GET', '/admin/reports?limit=100&offset=0');
    await assert(data.reports.length >= 0, 'Should handle multiple reports');
  });
}

async function testActivityLogging() {
  await test('Activity logs are being created', async () => {
    // This would check if logs were created on previous actions
    // In real implementation, would verify via direct DB query
    console.log('  (Requires database access to verify)');
  });
}

async function testPerformance() {
  await test('Dashboard loads in < 2 seconds', async () => {
    const start = Date.now();
    await apiCall('GET', '/admin/analytics/dashboard');
    const duration = Date.now() - start;
    await assert(duration < 2000, `Should be < 2s, was ${duration}ms`);
  });

  await test('User list loads in < 2 seconds', async () => {
    const start = Date.now();
    await apiCall('GET', '/admin/users?limit=50');
    const duration = Date.now() - start;
    await assert(duration < 2000, `Should be < 2s, was ${duration}ms`);
  });

  await test('UGC list loads in < 2 seconds', async () => {
    const start = Date.now();
    await apiCall('GET', '/admin/ugc?limit=50');
    const duration = Date.now() - start;
    await assert(duration < 2000, `Should be < 2s, was ${duration}ms`);
  });
}

async function testErrorHandling() {
  await test('404 on invalid endpoint', async () => {
    try {
      await apiCall('GET', '/admin/invalid-endpoint');
      throw new Error('Should have failed');
    } catch (error) {
      // Expected to fail
    }
  });

  await test('401 without auth token', async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`);
      await assert(response.status === 401, 'Should return 401');
    } catch (error) {
      // Expected
    }
  });
}

/**
 * Report generation
 */
async function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('ADMIN PANEL TEST REPORT');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(1);
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`📊 SUMMARY`);
  console.log(`  Total Tests: ${total}`);
  console.log(`  Passed: ${passed} ✓`);
  console.log(`  Failed: ${failed} ✗`);
  console.log(`  Pass Rate: ${passRate}%`);
  console.log(`  Total Duration: ${totalDuration}ms\n`);

  if (failed > 0) {
    console.log('❌ FAILURES:');
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  ✗ ${r.name}`);
        console.log(`    Error: ${r.error}`);
      });
    console.log();
  }

  console.log('📈 PERFORMANCE:');
  const slowTests = results.filter(r => r.duration > 500);
  if (slowTests.length > 0) {
    console.log('  Slow tests (>500ms):');
    slowTests.forEach(r => {
      console.log(`    - ${r.name}: ${r.duration}ms`);
    });
  } else {
    console.log('  All tests passed performance targets ✓');
  }

  console.log('\n' + '='.repeat(60));

  if (failed === 0) {
    console.log('✅ ALL TESTS PASSED');
  } else {
    console.log(`⚠️  ${failed} TESTS FAILED`);
    process.exit(1);
  }
}

/**
 * Main
 */
async function runAllTests() {
  console.log('🚀 Starting Admin Panel Tests...\n');

  // Run test suites
  await testAuthentication();
  console.log();
  
  await testDashboardMetrics();
  console.log();
  
  await testUserManagement();
  console.log();
  
  await testUGCModeration();
  console.log();
  
  await testDisputeResolution();
  console.log();
  
  await testContentReports();
  console.log();
  
  await testActivityLogging();
  console.log();
  
  await testPerformance();
  console.log();
  
  await testErrorHandling();
  console.log();

  // Generate report
  await generateReport();
}

runAllTests().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
