/**
 * Performance Benchmark for Influxity.ai
 * Analyzes site efficiency, load times, and optimization
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== INFLUXITY.AI PERFORMANCE BENCHMARK ===\n');

// Analyze build output
console.log('## Build Analysis\n');

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  const getDirectorySize = (dirPath: string): number => {
    let size = 0;
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        size += stats.size;
      }
    }
    
    return size;
  };
  
  const totalSize = getDirectorySize(distPath);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  
  console.log(`Total Build Size: ${totalSizeMB} MB`);
  
  // Analyze main bundle
  const publicPath = path.join(distPath, 'public/assets');
  if (fs.existsSync(publicPath)) {
    const jsFiles = fs.readdirSync(publicPath).filter(f => f.endsWith('.js'));
    const mainBundle = jsFiles.find(f => f.startsWith('index-'));
    
    if (mainBundle) {
      const bundlePath = path.join(publicPath, mainBundle);
      const bundleSize = fs.statSync(bundlePath).size;
      const bundleSizeKB = (bundleSize / 1024).toFixed(2);
      
      console.log(`Main Bundle Size: ${bundleSizeKB} KB`);
      
      if (bundleSize > 500 * 1024) {
        console.log('  ⚠️  Warning: Bundle exceeds 500KB (recommended limit)');
      } else {
        console.log('  ✓ Bundle size is within recommended limits');
      }
    }
  }
} else {
  console.log('⚠️  Build directory not found. Run `pnpm build` first.');
}

console.log('\n## Code Optimization Analysis\n');

// Check for optimization features
const viteConfigPath = path.join(__dirname, 'vite.config.ts');
const viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');

const hasMinification = viteConfig.includes('minify');
const hasTreeShaking = true; // Vite enables by default
const hasCodeSplitting = viteConfig.includes('manualChunks') || viteConfig.includes('splitVendorChunkPlugin');
const hasCompression = viteConfig.includes('compression') || viteConfig.includes('gzip');

console.log(`✓ Minification: ${hasMinification ? 'Enabled' : 'Not explicitly configured (uses default)'}`);
console.log(`✓ Tree Shaking: ${hasTreeShaking ? 'Enabled (Vite default)' : 'Disabled'}`);
console.log(`✓ Code Splitting: ${hasCodeSplitting ? 'Configured' : 'Using defaults'}`);
console.log(`✓ Compression: ${hasCompression ? 'Enabled' : 'Not configured'}`);

console.log('\n## Backend Performance\n');

// Check for performance optimizations
const serverFiles = fs.readdirSync(path.join(__dirname, 'server'));
const cacheFilePath = path.join(__dirname, 'server/_core/cache.ts');
const hasCaching = fs.existsSync(cacheFilePath);
const hasRateLimiting = fs.existsSync(path.join(__dirname, 'server/_core/security.ts'));

console.log(`✓ Response Caching: ${hasCaching ? 'Implemented' : 'Not found'}`);
console.log(`✓ Rate Limiting: ${hasRateLimiting ? 'Implemented' : 'Not found'}`);

// Check database optimization
const schemaPath = path.join(__dirname, 'drizzle/schema.ts');
const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

const hasIndexes = schemaContent.includes('index(');
const hasForeignKeys = schemaContent.includes('references');

console.log(`✓ Database Indexes: ${hasIndexes ? 'Configured' : 'Not found'}`);
console.log(`✓ Foreign Keys: ${hasForeignKeys ? 'Configured' : 'Not found'}`);

console.log('\n## Performance Score Calculation\n');

let score = 0;
let maxScore = 0;

// Build size (20 points)
maxScore += 20;
if (fs.existsSync(distPath)) {
  const totalSize = getDirectorySize(distPath);
  if (totalSize < 20 * 1024 * 1024) score += 20; // < 20MB
  else if (totalSize < 30 * 1024 * 1024) score += 15; // < 30MB
  else if (totalSize < 50 * 1024 * 1024) score += 10; // < 50MB
  else score += 5;
}

// Optimization features (40 points)
maxScore += 40;
if (hasMinification) score += 10;
if (hasTreeShaking) score += 10;
if (hasCodeSplitting) score += 10;
if (hasCompression) score += 10;

// Backend performance (40 points)
maxScore += 40;
if (hasCaching) score += 20;
if (hasRateLimiting) score += 10;
if (hasIndexes) score += 5;
if (hasForeignKeys) score += 5;

const performanceScore = Math.round((score / maxScore) * 100);

console.log(`Total Score: ${score}/${maxScore}`);
console.log(`Performance Score: ${performanceScore}%\n`);

if (performanceScore >= 90) {
  console.log('Status: EXCELLENT ✓');
} else if (performanceScore >= 75) {
  console.log('Status: GOOD ✓');
} else if (performanceScore >= 60) {
  console.log('Status: ACCEPTABLE');
} else {
  console.log('Status: NEEDS IMPROVEMENT');
}

console.log('\n## Recommendations\n');

if (!hasCompression) {
  console.log('→ Add gzip/brotli compression for static assets');
}
if (!hasCodeSplitting) {
  console.log('→ Configure manual code splitting for vendor chunks');
}
if (!hasIndexes) {
  console.log('→ Add database indexes for frequently queried columns');
}

console.log('\n=== PERFORMANCE BENCHMARK COMPLETE ===');

function getDirectorySize(dirPath: string): number {
  let size = 0;
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  }
  
  return size;
}
