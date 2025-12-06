import * as fs from 'fs';
import * as path from 'path';

interface AnalysisResult {
  category: string;
  item: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'INFO';
  details: string;
}

const results: AnalysisResult[] = [];

function addResult(category: string, item: string, status: AnalysisResult['status'], details: string) {
  results.push({ category, item, status, details });
}

// Analyze codebase structure
function analyzeStructure() {
  const baseDir = process.cwd();
  
  // Check for essential directories
  const essentialDirs = ['client', 'server', 'drizzle', 'shared'];
  essentialDirs.forEach(dir => {
    const exists = fs.existsSync(path.join(baseDir, dir));
    addResult('Structure', `Directory: ${dir}`, exists ? 'PASS' : 'FAIL', 
      exists ? 'Directory exists' : 'Directory missing');
  });
  
  // Check for configuration files
  const configFiles = ['package.json', 'tsconfig.json', 'vite.config.ts', 'drizzle.config.ts'];
  configFiles.forEach(file => {
    const exists = fs.existsSync(path.join(baseDir, file));
    addResult('Structure', `Config: ${file}`, exists ? 'PASS' : 'FAIL',
      exists ? 'Configuration file present' : 'Configuration file missing');
  });
}

// Analyze dependencies
function analyzeDependencies() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  
  // Check for critical dependencies
  const criticalDeps = {
    'react': 'Frontend framework',
    'express': 'Backend server',
    '@trpc/server': 'API framework',
    'drizzle-orm': 'Database ORM',
    'stripe': 'Payment processing',
    'zod': 'Input validation',
    'helmet': 'Security headers',
    'express-rate-limit': 'Rate limiting'
  };
  
  Object.entries(criticalDeps).forEach(([dep, description]) => {
    const exists = packageJson.dependencies[dep];
    addResult('Dependencies', dep, exists ? 'PASS' : 'FAIL',
      exists ? `${description} - v${packageJson.dependencies[dep]}` : `Missing: ${description}`);
  });
  
  // Check dev dependencies
  const criticalDevDeps = {
    'typescript': 'Type safety',
    'vite': 'Build tool',
    'vitest': 'Testing framework',
    '@types/node': 'Node.js types'
  };
  
  Object.entries(criticalDevDeps).forEach(([dep, description]) => {
    const exists = packageJson.devDependencies[dep];
    addResult('Dependencies', `${dep} (dev)`, exists ? 'PASS' : 'WARNING',
      exists ? `${description} - v${packageJson.devDependencies[dep]}` : `Missing: ${description}`);
  });
}

// Analyze API endpoints
function analyzeAPIEndpoints() {
  const routersPath = 'server/routers.ts';
  if (!fs.existsSync(routersPath)) {
    addResult('API', 'routers.ts', 'FAIL', 'Router file not found');
    return;
  }
  
  const routersContent = fs.readFileSync(routersPath, 'utf-8');
  
  // Check for main routers
  const expectedRouters = [
    { name: 'auth', description: 'Authentication endpoints' },
    { name: 'chat', description: 'AI chat system' },
    { name: 'email', description: 'Email generation' },
    { name: 'salesCopy', description: 'Sales copy generation' },
    { name: 'content', description: 'Content generation' },
    { name: 'analysis', description: 'Data analysis' },
    { name: 'subscription', description: 'Subscription management' },
    { name: 'stripe', description: 'Payment processing' }
  ];
  
  expectedRouters.forEach(({ name, description }) => {
    const exists = routersContent.includes(`${name}:`);
    addResult('API Endpoints', name, exists ? 'PASS' : 'FAIL',
      exists ? `${description} router found` : `${description} router missing`);
  });
}

// Analyze database schema
function analyzeDatabaseSchema() {
  const schemaPath = 'drizzle/schema.ts';
  if (!fs.existsSync(schemaPath)) {
    addResult('Database', 'schema.ts', 'FAIL', 'Schema file not found');
    return;
  }
  
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  
  // Check for essential tables
  const expectedTables = [
    { name: 'users', description: 'User accounts' },
    { name: 'subscriptions', description: 'Subscription plans' },
    { name: 'conversations', description: 'Chat conversations' },
    { name: 'messages', description: 'Chat messages' },
    { name: 'generatedContent', description: 'Generated content history' },
    { name: 'analysisResults', description: 'Analysis results' }
  ];
  
  expectedTables.forEach(({ name, description }) => {
    const exists = schemaContent.includes(`export const ${name}`);
    addResult('Database Schema', name, exists ? 'PASS' : 'FAIL',
      exists ? `${description} table defined` : `${description} table missing`);
  });
}

// Analyze security features
function analyzeSecurity() {
  const securityPath = 'server/_core/security.ts';
  if (!fs.existsSync(securityPath)) {
    addResult('Security', 'security.ts', 'FAIL', 'Security module not found');
    return;
  }
  
  const securityContent = fs.readFileSync(securityPath, 'utf-8');
  
  // Check for security features
  const securityFeatures = [
    { name: 'Rate limiting', pattern: 'rateLimit', critical: true },
    { name: 'Helmet headers', pattern: 'helmet', critical: true },
    { name: 'CORS config', pattern: 'cors', critical: true },
    { name: 'Input sanitization', pattern: 'sanitize', critical: true },
    { name: 'XSS protection', pattern: 'escape', critical: true },
    { name: 'Email validation', pattern: 'isEmail', critical: false },
    { name: 'URL validation', pattern: 'isURL', critical: false },
    { name: 'Prompt injection protection', pattern: 'dangerousPatterns', critical: true }
  ];
  
  securityFeatures.forEach(({ name, pattern, critical }) => {
    const exists = securityContent.includes(pattern);
    addResult('Security', name, exists ? 'PASS' : (critical ? 'FAIL' : 'WARNING'),
      exists ? 'Implemented' : (critical ? 'Critical security feature missing' : 'Optional feature missing'));
  });
}

// Analyze frontend pages
function analyzeFrontend() {
  const pagesDir = 'client/src/pages';
  if (!fs.existsSync(pagesDir)) {
    addResult('Frontend', 'pages directory', 'FAIL', 'Pages directory not found');
    return;
  }
  
  const expectedPages = [
    'Home.tsx',
    'Dashboard.tsx',
    'EmailGenerator.tsx',
    'SalesCopy.tsx',
    'ContentGenerator.tsx',
    'DataAnalysis.tsx',
    'Pricing.tsx'
  ];
  
  expectedPages.forEach(page => {
    const exists = fs.existsSync(path.join(pagesDir, page));
    addResult('Frontend Pages', page, exists ? 'PASS' : 'FAIL',
      exists ? 'Page component exists' : 'Page component missing');
  });
}

// Analyze AI integration
function analyzeAIIntegration() {
  const llmPath = 'server/_core/llm.ts';
  if (!fs.existsSync(llmPath)) {
    addResult('AI Integration', 'llm.ts', 'FAIL', 'LLM module not found');
    return;
  }
  
  const llmContent = fs.readFileSync(llmPath, 'utf-8');
  
  // Check for AI features
  const aiFeatures = [
    { name: 'Message handling', pattern: 'Message', critical: true },
    { name: 'Tool support', pattern: 'Tool', critical: false },
    { name: 'Multi-turn conversations', pattern: 'messages.map', critical: true },
    { name: 'Content normalization', pattern: 'normalizeMessage', critical: true },
    { name: 'Error handling', pattern: 'throw new Error', critical: true },
    { name: 'Response format', pattern: 'ResponseFormat', critical: false },
    { name: 'Token tracking', pattern: 'usage', critical: false },
    { name: 'Model configuration', pattern: 'gemini-2.5-flash', critical: true }
  ];
  
  aiFeatures.forEach(({ name, pattern, critical }) => {
    const exists = llmContent.includes(pattern);
    addResult('AI Integration', name, exists ? 'PASS' : (critical ? 'FAIL' : 'WARNING'),
      exists ? 'Feature implemented' : (critical ? 'Critical feature missing' : 'Optional feature missing'));
  });
}

// Analyze caching
function analyzeCaching() {
  const cachePath = 'server/_core/cache.ts';
  if (!fs.existsSync(cachePath)) {
    addResult('Performance', 'Cache module', 'WARNING', 'Cache module not found');
    return;
  }
  
  const cacheContent = fs.readFileSync(cachePath, 'utf-8');
  
  addResult('Performance', 'AI response caching', 
    cacheContent.includes('aiCache') ? 'PASS' : 'WARNING',
    cacheContent.includes('aiCache') ? 'AI response caching implemented' : 'No AI caching found');
}

// Analyze error handling
function analyzeErrorHandling() {
  const routersPath = 'server/routers.ts';
  if (!fs.existsSync(routersPath)) {
    return;
  }
  
  const routersContent = fs.readFileSync(routersPath, 'utf-8');
  
  // Check for error handling patterns
  const hasTryCatch = routersContent.includes('try') && routersContent.includes('catch');
  const hasErrorMessages = routersContent.includes('Error(');
  const hasFallbacks = routersContent.includes('||') && routersContent.includes('apologize');
  
  addResult('Error Handling', 'Try-catch blocks', hasTryCatch ? 'PASS' : 'WARNING',
    hasTryCatch ? 'Error handling present' : 'Limited error handling');
  
  addResult('Error Handling', 'Error messages', hasErrorMessages ? 'PASS' : 'WARNING',
    hasErrorMessages ? 'Custom error messages defined' : 'Generic error handling');
  
  addResult('Error Handling', 'Fallback responses', hasFallbacks ? 'PASS' : 'WARNING',
    hasFallbacks ? 'Fallback responses for AI failures' : 'No fallback responses');
}

// Analyze logging
function analyzeLogging() {
  const loggerPath = 'server/_core/logger.ts';
  if (!fs.existsSync(loggerPath)) {
    addResult('Monitoring', 'Logger module', 'WARNING', 'Logger module not found');
    return;
  }
  
  const loggerContent = fs.readFileSync(loggerPath, 'utf-8');
  
  addResult('Monitoring', 'Structured logging',
    loggerContent.includes('aiRequest') && loggerContent.includes('aiResponse') ? 'PASS' : 'WARNING',
    'Logging system implemented');
}

// Analyze tests
function analyzeTests() {
  const testFiles = [
    'server/ai.features.test.ts',
    'server/auth.logout.test.ts'
  ];
  
  testFiles.forEach(testFile => {
    const exists = fs.existsSync(testFile);
    addResult('Testing', testFile, exists ? 'PASS' : 'WARNING',
      exists ? 'Test file exists' : 'Test file missing');
  });
  
  // Check test coverage
  const aiTestPath = 'server/ai.features.test.ts';
  if (fs.existsSync(aiTestPath)) {
    const testContent = fs.readFileSync(aiTestPath, 'utf-8');
    const testCount = (testContent.match(/it\(/g) || []).length;
    addResult('Testing', 'Test coverage', testCount > 10 ? 'PASS' : 'WARNING',
      `${testCount} test cases found`);
  }
}

// Generate report
function generateReport() {
  console.log('\n=== INFLUXITY.AI COMPREHENSIVE ANALYSIS REPORT ===\n');
  
  const categories = [...new Set(results.map(r => r.category))];
  
  categories.forEach(category => {
    console.log(`\n## ${category}\n`);
    const categoryResults = results.filter(r => r.category === category);
    
    categoryResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✓' : 
                   result.status === 'FAIL' ? '✗' : 
                   result.status === 'WARNING' ? '⚠' : 'ℹ';
      console.log(`${icon} ${result.item}: ${result.details}`);
    });
  });
  
  // Summary
  console.log('\n\n=== SUMMARY ===\n');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARNING').length;
  const info = results.filter(r => r.status === 'INFO').length;
  
  console.log(`Total Checks: ${results.length}`);
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`⚠ Warnings: ${warnings}`);
  console.log(`ℹ Info: ${info}`);
  
  const score = Math.round((passed / results.length) * 100);
  console.log(`\nOverall Score: ${score}%`);
  
  if (score >= 90) {
    console.log('Status: EXCELLENT ✓');
  } else if (score >= 75) {
    console.log('Status: GOOD ✓');
  } else if (score >= 60) {
    console.log('Status: ACCEPTABLE ⚠');
  } else {
    console.log('Status: NEEDS IMPROVEMENT ✗');
  }
}

// Main execution
console.log('Starting comprehensive analysis...\n');

analyzeStructure();
analyzeDependencies();
analyzeAPIEndpoints();
analyzeDatabaseSchema();
analyzeSecurity();
analyzeFrontend();
analyzeAIIntegration();
analyzeCaching();
analyzeErrorHandling();
analyzeLogging();
analyzeTests();

generateReport();
