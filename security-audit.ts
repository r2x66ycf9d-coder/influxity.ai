import * as fs from 'fs';

interface SecurityIssue {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: string;
  issue: string;
  details: string;
  recommendation?: string;
}

const issues: SecurityIssue[] = [];

function addIssue(severity: SecurityIssue['severity'], category: string, issue: string, details: string, recommendation?: string) {
  issues.push({ severity, category, issue, details, recommendation });
}

// Check environment variables
function auditEnvironmentVariables() {
  const envExample = fs.existsSync('.env.example');
  const envFile = fs.existsSync('.env');
  
  if (!envExample) {
    addIssue('MEDIUM', 'Configuration', 'Missing .env.example', 
      'No example environment file found for developers',
      'Create .env.example with placeholder values');
  }
  
  if (envFile) {
    const envContent = fs.readFileSync('.env', 'utf-8');
    
    // Check for hardcoded secrets
    if (envContent.includes('sk_live_') || envContent.includes('pk_live_')) {
      addIssue('CRITICAL', 'Secrets', 'Live API keys in .env', 
        'Production API keys should not be in repository',
        'Use environment-specific configuration and secret management');
    }
    
    // Check for weak secrets
    if (envContent.includes('test') || envContent.includes('mock') || envContent.includes('placeholder')) {
      addIssue('INFO', 'Configuration', 'Test credentials detected', 
        'Environment file contains test/mock credentials',
        'Ensure production uses strong, unique credentials');
    }
  }
}

// Audit authentication
function auditAuthentication() {
  const authFiles = [
    'server/_core/oauth.ts',
    'server/_core/cookies.ts',
    'client/src/_core/hooks/useAuth.ts'
  ];
  
  authFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      addIssue('HIGH', 'Authentication', `Missing ${file}`, 
        'Authentication module not found',
        'Implement proper authentication system');
      return;
    }
    
    const content = fs.readFileSync(file, 'utf-8');
    
    // Check for secure cookie settings
    if (file.includes('cookies.ts')) {
      if (!content.includes('httpOnly')) {
        addIssue('HIGH', 'Authentication', 'Missing httpOnly flag', 
          'Cookies should have httpOnly flag to prevent XSS',
          'Add httpOnly: true to cookie options');
      }
      
      if (!content.includes('secure')) {
        addIssue('MEDIUM', 'Authentication', 'Missing secure flag', 
          'Cookies should have secure flag in production',
          'Add secure: true for production environments');
      }
      
      if (!content.includes('sameSite')) {
        addIssue('MEDIUM', 'Authentication', 'Missing sameSite flag', 
          'Cookies should have sameSite flag to prevent CSRF',
          'Add sameSite: "lax" or "strict" to cookie options');
      }
    }
  });
}

// Audit input validation
function auditInputValidation() {
  const routersPath = 'server/routers.ts';
  if (!fs.existsSync(routersPath)) {
    return;
  }
  
  const content = fs.readFileSync(routersPath, 'utf-8');
  
  // Check for Zod validation
  if (!content.includes('z.object') && !content.includes('z.string')) {
    addIssue('HIGH', 'Input Validation', 'Missing input validation', 
      'API endpoints should validate all inputs',
      'Use Zod schemas to validate all user inputs');
  } else {
    addIssue('INFO', 'Input Validation', 'Zod validation present', 
      'Input validation using Zod is implemented');
  }
  
  // Check for sanitization
  if (!content.includes('sanitize')) {
    addIssue('HIGH', 'Input Validation', 'Missing input sanitization', 
      'User inputs should be sanitized before processing',
      'Implement input sanitization for all user-provided data');
  } else {
    addIssue('INFO', 'Input Validation', 'Input sanitization present', 
      'Input sanitization is implemented');
  }
}

// Audit SQL injection protection
function auditSQLInjection() {
  const dbPath = 'server/db.ts';
  if (!fs.existsSync(dbPath)) {
    return;
  }
  
  const content = fs.readFileSync(dbPath, 'utf-8');
  
  // Check for raw SQL queries
  if (content.includes('execute(') && content.includes('`')) {
    addIssue('HIGH', 'SQL Injection', 'Potential raw SQL queries', 
      'Raw SQL queries detected, ensure parameterization',
      'Use ORM query builders or parameterized queries');
  }
  
  // Check for ORM usage
  if (content.includes('drizzle')) {
    addIssue('INFO', 'SQL Injection', 'Using Drizzle ORM', 
      'ORM provides protection against SQL injection');
  }
}

// Audit XSS protection
function auditXSSProtection() {
  const securityPath = 'server/_core/security.ts';
  if (!fs.existsSync(securityPath)) {
    addIssue('CRITICAL', 'XSS Protection', 'Missing security module', 
      'No security module found',
      'Implement comprehensive security measures');
    return;
  }
  
  const content = fs.readFileSync(securityPath, 'utf-8');
  
  if (!content.includes('escape')) {
    addIssue('HIGH', 'XSS Protection', 'Missing XSS sanitization', 
      'No XSS protection detected',
      'Implement HTML escaping for user-generated content');
  } else {
    addIssue('INFO', 'XSS Protection', 'XSS protection implemented', 
      'HTML escaping is present');
  }
  
  // Check for CSP headers
  if (!content.includes('contentSecurityPolicy')) {
    addIssue('MEDIUM', 'XSS Protection', 'Missing CSP headers', 
      'Content Security Policy headers not configured',
      'Implement CSP headers to prevent XSS attacks');
  } else {
    addIssue('INFO', 'XSS Protection', 'CSP headers configured', 
      'Content Security Policy is implemented');
  }
}

// Audit rate limiting
function auditRateLimiting() {
  const securityPath = 'server/_core/security.ts';
  if (!fs.existsSync(securityPath)) {
    return;
  }
  
  const content = fs.readFileSync(securityPath, 'utf-8');
  
  if (!content.includes('rateLimit')) {
    addIssue('HIGH', 'Rate Limiting', 'Missing rate limiting', 
      'No rate limiting detected',
      'Implement rate limiting to prevent abuse');
  } else {
    addIssue('INFO', 'Rate Limiting', 'Rate limiting implemented', 
      'Rate limiting is configured');
    
    // Check rate limit values
    const aiRateLimitMatch = content.match(/max:\s*(\d+)/);
    if (aiRateLimitMatch) {
      const limit = parseInt(aiRateLimitMatch[1]);
      if (limit > 50) {
        addIssue('MEDIUM', 'Rate Limiting', 'High rate limit', 
          `Rate limit of ${limit} requests per window may be too permissive`,
          'Consider lowering rate limits for AI endpoints');
      }
    }
  }
}

// Audit CORS configuration
function auditCORS() {
  const securityPath = 'server/_core/security.ts';
  if (!fs.existsSync(securityPath)) {
    return;
  }
  
  const content = fs.readFileSync(securityPath, 'utf-8');
  
  if (!content.includes('cors')) {
    addIssue('HIGH', 'CORS', 'Missing CORS configuration', 
      'No CORS configuration detected',
      'Implement CORS to control cross-origin requests');
  } else {
    addIssue('INFO', 'CORS', 'CORS configured', 
      'CORS configuration is present');
    
    // Check for wildcard origins (but not regex patterns)
    if (content.includes("'*'") || (content.includes('"*"') && content.includes('origin'))) {
      addIssue('HIGH', 'CORS', 'Wildcard CORS origin', 
        'CORS allows all origins (*)',
        'Restrict CORS to specific trusted domains');
    }
  }
}

// Audit secrets management
function auditSecretsManagement() {
  const files = [
    'server/_core/env.ts',
    'server/stripe.ts',
    'server/_core/llm.ts'
  ];
  
  files.forEach(file => {
    if (!fs.existsSync(file)) {
      return;
    }
    
    const content = fs.readFileSync(file, 'utf-8');
    
    // Check for hardcoded secrets
    const secretPatterns = [
      /sk_live_[a-zA-Z0-9]{20,}/,
      /pk_live_[a-zA-Z0-9]{20,}/,
      /AIza[a-zA-Z0-9_-]{35}/,
      /[a-f0-9]{32}/
    ];
    
    secretPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        addIssue('CRITICAL', 'Secrets Management', `Hardcoded secret in ${file}`, 
          'Hardcoded API key or secret detected',
          'Move all secrets to environment variables');
      }
    });
    
    // Check for environment variable usage
    if (content.includes('process.env')) {
      addIssue('INFO', 'Secrets Management', `Using environment variables in ${file}`, 
        'Secrets are loaded from environment variables');
    }
  });
}

// Audit error handling
function auditErrorHandling() {
  const routersPath = 'server/routers.ts';
  if (!fs.existsSync(routersPath)) {
    return;
  }
  
  const content = fs.readFileSync(routersPath, 'utf-8');
  
  // Check for error information leakage
  if (content.includes('error.stack') || content.includes('error.message')) {
    addIssue('MEDIUM', 'Error Handling', 'Potential error information leakage', 
      'Error details may be exposed to clients',
      'Sanitize error messages before sending to clients');
  }
  
  // Check for generic error messages
  if (content.includes('apologize') || content.includes('try again')) {
    addIssue('INFO', 'Error Handling', 'Generic error messages', 
      'Using user-friendly error messages');
  }
}

// Audit logging
function auditLogging() {
  const loggerPath = 'server/_core/logger.ts';
  if (!fs.existsSync(loggerPath)) {
    addIssue('MEDIUM', 'Logging', 'Missing logging module', 
      'No centralized logging system found',
      'Implement structured logging for security monitoring');
    return;
  }
  
  const content = fs.readFileSync(loggerPath, 'utf-8');
  
  // Check for sensitive data logging
  if (content.includes('password') || content.includes('token') || content.includes('secret')) {
    addIssue('HIGH', 'Logging', 'Potential sensitive data in logs', 
      'Logging may include sensitive information',
      'Ensure passwords, tokens, and secrets are never logged');
  }
  
  addIssue('INFO', 'Logging', 'Logging system present', 
    'Centralized logging is implemented');
}

// Audit dependency vulnerabilities
function auditDependencies() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  
  // Check for outdated critical packages
  const criticalPackages = ['express', 'stripe', 'helmet', 'cors'];
  
  addIssue('INFO', 'Dependencies', 'Dependency audit needed', 
    'Run npm audit or pnpm audit to check for known vulnerabilities',
    'Regularly update dependencies and run security audits');
}

// Audit prompt injection protection
function auditPromptInjection() {
  const securityPath = 'server/_core/security.ts';
  if (!fs.existsSync(securityPath)) {
    return;
  }
  
  const content = fs.readFileSync(securityPath, 'utf-8');
  
  if (!content.includes('dangerousPatterns') && !content.includes('prompt injection')) {
    addIssue('HIGH', 'AI Security', 'Missing prompt injection protection', 
      'No prompt injection protection detected',
      'Implement filtering for prompt injection attempts');
  } else {
    addIssue('INFO', 'AI Security', 'Prompt injection protection present', 
      'Prompt injection filtering is implemented');
  }
}

// Generate report
function generateReport() {
  console.log('\n=== INFLUXITY.AI SECURITY AUDIT REPORT ===\n');
  
  const categories = [...new Set(issues.map(i => i.category))];
  
  categories.forEach(category => {
    console.log(`\n## ${category}\n`);
    const categoryIssues = issues.filter(i => i.category === category);
    
    categoryIssues.forEach(issue => {
      const icon = issue.severity === 'CRITICAL' ? '🔴' :
                   issue.severity === 'HIGH' ? '🟠' :
                   issue.severity === 'MEDIUM' ? '🟡' :
                   issue.severity === 'LOW' ? '🔵' : '✓';
      
      console.log(`${icon} [${issue.severity}] ${issue.issue}`);
      console.log(`   ${issue.details}`);
      if (issue.recommendation) {
        console.log(`   → ${issue.recommendation}`);
      }
      console.log();
    });
  });
  
  // Summary
  console.log('\n=== SECURITY SUMMARY ===\n');
  const critical = issues.filter(i => i.severity === 'CRITICAL').length;
  const high = issues.filter(i => i.severity === 'HIGH').length;
  const medium = issues.filter(i => i.severity === 'MEDIUM').length;
  const low = issues.filter(i => i.severity === 'LOW').length;
  const info = issues.filter(i => i.severity === 'INFO').length;
  
  console.log(`🔴 Critical: ${critical}`);
  console.log(`🟠 High: ${high}`);
  console.log(`🟡 Medium: ${medium}`);
  console.log(`🔵 Low: ${low}`);
  console.log(`✓ Info: ${info}`);
  
  const totalIssues = critical + high + medium + low;
  console.log(`\nTotal Issues: ${totalIssues}`);
  
  if (critical > 0) {
    console.log('\n⚠️  CRITICAL ISSUES FOUND - IMMEDIATE ACTION REQUIRED');
  } else if (high > 0) {
    console.log('\n⚠️  High priority issues found - should be addressed soon');
  } else if (medium > 0) {
    console.log('\n✓ No critical issues - some improvements recommended');
  } else {
    console.log('\n✓ Security posture looks good');
  }
}

// Main execution
console.log('Starting security audit...\n');

auditEnvironmentVariables();
auditAuthentication();
auditInputValidation();
auditSQLInjection();
auditXSSProtection();
auditRateLimiting();
auditCORS();
auditSecretsManagement();
auditErrorHandling();
auditLogging();
auditDependencies();
auditPromptInjection();

generateReport();
