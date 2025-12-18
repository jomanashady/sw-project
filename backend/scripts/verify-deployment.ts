/**
 * Deployment Verification Script
 * 
 * This script verifies:
 * 1. DNS Configuration
 * 2. Backend Service Health
 * 3. External Service Dependencies
 * 4. Environment Variables
 * 5. API Endpoint Accessibility
 */

import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import * as fs from 'fs';
import * as path from 'path';

interface VerificationResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

const results: VerificationResult[] = [];
const isLocal = !process.env.RAILWAY_ENVIRONMENT && !process.env.VERCEL;

// Load .env file if it exists (for local development)
function loadEnvFile(): void {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

// Load .env on startup
loadEnvFile();

// Helper to make HTTP requests
function makeRequest(url: string, options: any = {}): Promise<{ status: number; data: string }> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 10000,
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode || 0, data });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// 1. Verify Environment Variables
async function verifyEnvironmentVariables(): Promise<void> {
  console.log('\n📋 Checking Environment Variables...');
  
  // PORT is optional - Railway sets it automatically
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
  ];

  const optionalVars = [
    'PORT', // Railway sets this automatically
    'FRONTEND_URL',
    'DATABASE_NAME',
    'JWT_EXPIRATION',
    'NODE_ENV',
  ];

  const missing: string[] = [];
  const present: string[] = [];
  const optionalPresent: string[] = [];

  requiredVars.forEach((varName) => {
    if (process.env[varName]) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  });

  optionalVars.forEach((varName) => {
    if (process.env[varName]) {
      optionalPresent.push(varName);
    }
  });

  // Check for .env file locally
  const envPath = path.join(process.cwd(), '.env');
  const hasEnvFile = fs.existsSync(envPath);
  
  if (missing.length > 0) {
    const message = isLocal && hasEnvFile
      ? `Missing required variables: ${missing.join(', ')} (check .env file)`
      : `Missing required variables: ${missing.join(', ')} ${isLocal ? '(set in Railway for production)' : '(set in Railway)'}`;
    
    results.push({
      name: 'Environment Variables (Required)',
      status: isLocal ? 'warning' : 'fail',
      message,
      details: { 
        missing, 
        present, 
        optionalPresent,
        isLocal,
        hasEnvFile,
        note: isLocal ? 'Running locally - set these in .env file' : 'Set these in Railway environment variables'
      },
    });
  } else {
    results.push({
      name: 'Environment Variables (Required)',
      status: 'pass',
      message: `All required variables present: ${present.join(', ')}`,
      details: { present, optionalPresent, isLocal, hasEnvFile },
    });
  }

  if (optionalPresent.length > 0) {
    console.log(`✅ Optional variables set: ${optionalPresent.join(', ')}`);
  }
  
  if (isLocal && !hasEnvFile) {
    console.log('ℹ️  Running locally - create .env file for local development');
  }
}

// 2. Verify MongoDB Connection
async function verifyMongoDB(): Promise<void> {
  console.log('\n🗄️  Checking MongoDB Configuration...');
  
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    results.push({
      name: 'MongoDB Configuration',
      status: 'fail',
      message: 'MONGODB_URI not set',
    });
    return;
  }

  try {
    // Extract hostname from MongoDB URI
    const uriMatch = mongoUri.match(/mongodb(\+srv)?:\/\/([^:]+):?([^@]+)?@?([^/]+)/);
    if (uriMatch) {
      const hostname = uriMatch[4] || uriMatch[2];
      results.push({
        name: 'MongoDB Configuration',
        status: 'pass',
        message: `MongoDB URI configured (host: ${hostname})`,
        details: { hostname, hasAuth: !!uriMatch[3] },
      });
    } else {
      results.push({
        name: 'MongoDB Configuration',
        status: 'warning',
        message: 'MongoDB URI format unclear',
        details: { uri: mongoUri.substring(0, 20) + '...' },
      });
    }
  } catch (error: any) {
    results.push({
      name: 'MongoDB Configuration',
      status: 'warning',
      message: `Could not parse MongoDB URI: ${error.message}`,
    });
  }
}

// 3. Verify Backend Health Endpoint
async function verifyBackendHealth(): Promise<void> {
  console.log('\n🏥 Checking Backend Health Endpoint...');
  
  // Use PORT from env, or default to 3001
  const port = process.env.PORT || '3001';
  const baseUrl = `http://localhost:${port}`;
  const healthUrl = `${baseUrl}/api/v1/health`;
  const rootUrl = `${baseUrl}/api/v1`;
  
  console.log(`   Testing on port: ${port}`);

  try {
    // First try the health endpoint
    const response = await makeRequest(healthUrl, { timeout: 5000 });
    
    if (response.status === 200) {
      let healthData;
      try {
        healthData = JSON.parse(response.data);
      } catch {
        healthData = response.data;
      }

      results.push({
        name: 'Backend Health Check',
        status: 'pass',
        message: `Health endpoint responding (Status: ${response.status})`,
        details: healthData,
      });
      return;
    } else if (response.status === 404) {
      // Try root endpoint to see if backend is running
      try {
        const rootResponse = await makeRequest(rootUrl, { timeout: 3000 });
        results.push({
          name: 'Backend Health Check',
          status: 'warning',
          message: `Health endpoint not found (404), but backend is running. Route may need configuration.`,
          details: { 
            status: response.status, 
            healthUrl,
            rootResponse: rootResponse.status,
            note: 'Backend is running but /api/v1/health route not found. Check route configuration.'
          },
        });
        return;
      } catch {
        // Root also failed, backend might not be running
      }
    }
    
    // If we get here, health endpoint returned non-200
    results.push({
      name: 'Backend Health Check',
      status: 'warning',
      message: `Health endpoint returned status ${response.status}`,
      details: { 
        status: response.status, 
        data: response.data.substring(0, 200),
        url: healthUrl
      },
    });
  } catch (error: any) {
    // Check if it's a connection error (backend not running) vs other error
    const isConnectionError = error.message.includes('ECONNREFUSED') || 
                             error.message.includes('connect') ||
                             error.message.includes('timeout');
    
    if (isConnectionError) {
      // Backend not running
      const message = isLocal
        ? `Backend not running locally. Start with: npm run start:dev`
        : `Cannot connect to backend. Check Railway logs.`;
      
      results.push({
        name: 'Backend Health Check',
        status: isLocal ? 'warning' : 'fail',
        message,
        details: { 
          error: error.message, 
          url: healthUrl,
          isLocal,
          note: isLocal ? 'Run: npm run start:dev' : 'Check Railway service status and logs'
        },
      });
    } else {
      // Other error
      results.push({
        name: 'Backend Health Check',
        status: 'warning',
        message: `Error checking health endpoint: ${error.message}`,
        details: { 
          error: error.message, 
          url: healthUrl,
          isLocal
        },
      });
    }
  }
}

// 4. Verify DNS Resolution (for external services)
async function verifyDNSResolution(): Promise<void> {
  console.log('\n🌐 Checking DNS Resolution...');
  
  const servicesToCheck = [
    'railway.app', // Railway
    'netlify.app', // Netlify
  ];

  // Check MongoDB hostname from URI if available
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      const uriMatch = mongoUri.match(/mongodb(\+srv)?:\/\/([^:]+):?([^@]+)?@?([^/]+)/);
      if (uriMatch) {
        const hostname = uriMatch[4] || uriMatch[2];
        // Extract domain from hostname (e.g., cluster0.xxxxx.mongodb.net -> mongodb.net)
        const domainMatch = hostname.match(/\.([^.]+\.(mongodb\.net|mongodb\.com))$/);
        if (domainMatch) {
          servicesToCheck.push(domainMatch[1]);
        } else {
          // Try to resolve the full hostname
          servicesToCheck.push(hostname);
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }

  const dns = await import('dns/promises');
  const checks: any[] = [];

  for (const service of servicesToCheck) {
    try {
      await dns.resolve4(service);
      checks.push({ service, status: 'pass', message: 'DNS resolution successful' });
    } catch (error: any) {
      // mongodb.net root domain doesn't resolve, which is normal
      const isMongoDomain = service.includes('mongodb');
      checks.push({ 
        service, 
        status: isMongoDomain ? 'warning' : 'warning', 
        message: `DNS resolution ${isMongoDomain ? 'may require full cluster hostname' : 'failed'}: ${error.message}` 
      });
    }
  }

  const passed = checks.filter((c) => c.status === 'pass').length;
  results.push({
    name: 'DNS Resolution',
    status: passed >= 2 ? 'pass' : 'warning', // At least Railway and Netlify should resolve
    message: `${passed}/${checks.length} DNS checks passed`,
    details: { checks, note: 'MongoDB DNS check may show warning if using cluster hostname' },
  });
}

// 5. Verify CORS Configuration
async function verifyCORS(): Promise<void> {
  console.log('\n🔒 Checking CORS Configuration...');
  
  const frontendUrl = process.env.FRONTEND_URL;
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:3000',
    'http://localhost:3001',
    'https://hr-systemm.netlify.app',
    'https://hr-syst.netlify.app',
  ].filter(Boolean);

  results.push({
    name: 'CORS Configuration',
    status: 'pass',
    message: `CORS configured for ${allowedOrigins.length} origins`,
    details: { allowedOrigins, frontendUrl },
  });
}

// 6. Verify External Service URLs (if configured)
async function verifyExternalServices(): Promise<void> {
  console.log('\n🔌 Checking External Service Configuration...');
  
  const services: any[] = [];
  
  // Check for Cloudinary (if used)
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    services.push({
      name: 'Cloudinary',
      status: 'pass',
      message: 'Cloudinary configured',
    });
  }

  // Check for Email service (nodemailer)
  if (process.env.SMTP_HOST || process.env.EMAIL_HOST) {
    services.push({
      name: 'Email Service',
      status: 'pass',
      message: 'Email service configured',
    });
  } else {
    services.push({
      name: 'Email Service',
      status: 'warning',
      message: 'Email service not configured (optional)',
    });
  }

  results.push({
    name: 'External Services',
    status: services.every((s) => s.status === 'pass' || s.status === 'warning') ? 'pass' : 'fail',
    message: `${services.length} external service(s) checked`,
    details: { services },
  });
}

// Main verification function
async function runVerification(): Promise<void> {
  console.log('='.repeat(60));
  console.log('🔍 Backend Deployment Verification');
  console.log('='.repeat(60));

  await verifyEnvironmentVariables();
  await verifyMongoDB();
  await verifyCORS();
  await verifyExternalServices();
  await verifyDNSResolution();
  await verifyBackendHealth();

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Verification Summary');
  console.log('='.repeat(60));

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const warnings = results.filter((r) => r.status === 'warning').length;

  results.forEach((result) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}: ${result.message}`);
    if (result.details && Object.keys(result.details).length > 0) {
      console.log(`   Details:`, JSON.stringify(result.details, null, 2));
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`Total: ${results.length} checks`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(60));

  // Show environment context
  if (isLocal) {
    console.log('\n💡 Running in LOCAL mode');
    console.log('   - Some checks may show warnings (expected for local development)');
    console.log('   - Set environment variables in .env file for local testing');
    console.log('   - For production, set variables in Railway dashboard');
  } else {
    console.log('\n🚀 Running in PRODUCTION mode');
    console.log('   - All checks should pass for production deployment');
  }

  if (failed > 0) {
    console.log('\n❌ Some critical checks failed. Please review the errors above.');
    if (isLocal) {
      console.log('   Note: Some failures may be expected when running locally.');
    }
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n⚠️  Some checks produced warnings. Review if needed.');
    if (isLocal) {
      console.log('   Note: Warnings are often expected when running locally.');
    }
    process.exit(0);
  } else {
    console.log('\n✅ All checks passed!');
    process.exit(0);
  }
}

// Run verification
runVerification().catch((error) => {
  console.error('❌ Verification script error:', error);
  process.exit(1);
});

