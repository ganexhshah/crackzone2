require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ProductionSetup {
  constructor() {
    this.productionEnvPath = path.join(__dirname, '../.env.production');
  }

  generateSecureKey(length = 64) {
    return crypto.randomBytes(length).toString('hex');
  }

  async createProductionEnv() {
    console.log('🚀 Setting up production environment...');
    
    // Read current development .env
    const devEnvPath = path.join(__dirname, '../.env');
    let devEnv = '';
    
    try {
      devEnv = await fs.readFile(devEnvPath, 'utf8');
    } catch (error) {
      console.warn('⚠️ No development .env found, creating from scratch');
    }

    // Generate production secrets
    const productionSecrets = {
      JWT_SECRET: this.generateSecureKey(64),
      JWT_REFRESH_SECRET: this.generateSecureKey(64),
      SESSION_SECRET: this.generateSecureKey(32),
      DB_ENCRYPTION_KEY: this.generateSecureKey(32),
      ADMIN_PASSWORD: this.generateSecureKey(16)
    };

    console.log('🔐 Generated production secrets:');
    console.log(`JWT_SECRET: ${productionSecrets.JWT_SECRET.substring(0, 20)}...`);
    console.log(`ADMIN_PASSWORD: ${productionSecrets.ADMIN_PASSWORD}`);
    console.log('⚠️ SAVE THESE CREDENTIALS SECURELY!');

    // Create production environment template
    const productionEnv = `# Production Environment Variables - Generated ${new Date().toISOString()}
NODE_ENV=production
PORT=\${PORT:-5000}

# Database Configuration
DATABASE_URL=\${DATABASE_URL}

# JWT Security
JWT_SECRET=${productionSecrets.JWT_SECRET}
JWT_REFRESH_SECRET=${productionSecrets.JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Session Security
SESSION_SECRET=${productionSecrets.SESSION_SECRET}

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=${productionSecrets.ADMIN_PASSWORD}

# CORS Configuration (Update with your production domains)
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Google OAuth (Update with production credentials)
GOOGLE_CLIENT_ID=\${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=\${GOOGLE_CLIENT_SECRET}
GOOGLE_CALLBACK_URL=https://your-api-domain.railway.app/api/auth/google/callback

# Cloudinary (Copy from development)
CLOUDINARY_URL=\${CLOUDINARY_URL}
CLOUDINARY_CLOUD_NAME=\${CLOUDINARY_CLOUD_NAME}
CLOUDINARY_API_KEY=\${CLOUDINARY_API_KEY}
CLOUDINARY_API_SECRET=\${CLOUDINARY_API_SECRET}

# Redis Configuration
REDIS_URL=\${REDIS_URL}

# Security Configuration
DB_ENCRYPTION_KEY=${productionSecrets.DB_ENCRYPTION_KEY}
SECURITY_EMAIL_ALERTS=\${SECURITY_EMAIL_ALERTS}
AUTO_BLOCK_THRESHOLD=100
BLOCK_DURATION_HOURS=24

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_AUTH_MAX=10
RATE_LIMIT_UPLOAD_MAX=10
RATE_LIMIT_ADMIN_MAX=100

# SSL/HTTPS
FORCE_HTTPS=true
HSTS_MAX_AGE=31536000
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true

# Logging
LOG_LEVEL=info
LOG_RETENTION_DAYS=30
`;

    await fs.writeFile(this.productionEnvPath, productionEnv);
    console.log('✅ Production environment file created');

    return productionSecrets;
  }

  async createDeploymentFiles() {
    console.log('📦 Creating deployment configuration files...');

    // Create logs directory
    const logsDir = path.join(__dirname, '../logs');
    try {
      await fs.mkdir(logsDir, { recursive: true });
      await fs.writeFile(path.join(logsDir, '.gitkeep'), '');
      console.log('✅ Logs directory created');
    } catch (error) {
      console.log('✅ Logs directory already exists');
    }

    // Create .dockerignore
    const dockerignore = `node_modules
npm-debug.log
.env
.env.local
.env.development
.git
.gitignore
README.md
Dockerfile
.dockerignore
coverage
.nyc_output
*.log
logs/*.log
`;

    await fs.writeFile(path.join(__dirname, '../.dockerignore'), dockerignore);
    console.log('✅ .dockerignore created');

    // Create production start script
    const startScript = `#!/bin/bash
echo "🚀 Starting CrackZone API in production mode..."

# Run database migrations
echo "📊 Running database migrations..."
npm run migrate:all

# Start the application
echo "🎯 Starting server..."
npm start
`;

    await fs.writeFile(path.join(__dirname, '../start-production.sh'), startScript);
    console.log('✅ Production start script created');
  }

  async updatePackageJson() {
    console.log('📝 Updating package.json for production...');
    
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    
    // Add production-specific fields
    packageJson.engines = {
      node: ">=18.0.0",
      npm: ">=8.0.0"
    };

    // Add production dependencies if not present
    const prodDeps = {
      "compression": "^1.7.4",
      "helmet": "^7.1.0",
      "express-rate-limit": "^7.1.5"
    };

    Object.entries(prodDeps).forEach(([dep, version]) => {
      if (!packageJson.dependencies[dep]) {
        packageJson.dependencies[dep] = version;
      }
    });

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json updated');
  }

  async createGitHubActions() {
    console.log('🔄 Creating GitHub Actions workflow...');
    
    const workflowDir = path.join(__dirname, '../.github/workflows');
    await fs.mkdir(workflowDir, { recursive: true });

    const workflow = `name: Deploy to Production

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: crackzone_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: backend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci
    
    - name: Run security tests
      run: |
        cd backend
        npm run test:security
      env:
        NODE_ENV: test
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/crackzone_test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Railway
      uses: railway-app/railway-deploy@v1
      with:
        railway-token: \${{ secrets.RAILWAY_TOKEN }}
        service: crackzone-api
`;

    await fs.writeFile(path.join(workflowDir, 'deploy.yml'), workflow);
    console.log('✅ GitHub Actions workflow created');
  }

  async generateDeploymentGuide() {
    console.log('📖 Generating deployment guide...');
    
    const guide = `# 🚀 CrackZone Production Deployment Guide

## Quick Start

### 1. Railway Deployment (Recommended)

1. **Install Railway CLI**
   \`\`\`bash
   npm install -g @railway/cli
   railway login
   \`\`\`

2. **Create Railway Project**
   \`\`\`bash
   cd backend
   railway init
   railway add postgresql
   \`\`\`

3. **Set Environment Variables**
   \`\`\`bash
   # Copy from .env.production and set in Railway dashboard
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=your-jwt-secret
   # ... add all other variables
   \`\`\`

4. **Deploy**
   \`\`\`bash
   railway deploy
   \`\`\`

### 2. Render Deployment

1. **Connect GitHub Repository**
   - Go to render.com
   - Connect your GitHub repository
   - Select "Web Service"

2. **Configure Build Settings**
   - Build Command: \`npm install\`
   - Start Command: \`npm start\`
   - Environment: Node

3. **Add Environment Variables**
   - Copy from .env.production
   - Set in Render dashboard

### 3. Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   \`\`\`bash
   npm install -g vercel
   \`\`\`

2. **Deploy Frontend**
   \`\`\`bash
   cd frontend
   vercel --prod
   \`\`\`

3. **Update API URLs**
   - Update API base URL in frontend
   - Update CORS origins in backend

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Security tests pass
- [ ] Performance tests show good results
- [ ] SSL certificates are active
- [ ] Domain names configured
- [ ] Monitoring and alerts set up
- [ ] Backup strategy implemented

## Monitoring

- **Health Check**: \`https://your-api-domain.railway.app/health\`
- **Performance**: \`https://your-api-domain.railway.app/api/performance/metrics\`
- **Security**: \`https://your-api-domain.railway.app/api/security/dashboard\`

## Support

For deployment issues, check:
1. Railway/Render logs
2. Database connection
3. Environment variables
4. Security configuration
`;

    await fs.writeFile(path.join(__dirname, '../DEPLOYMENT_GUIDE.md'), guide);
    console.log('✅ Deployment guide created');
  }

  async run() {
    try {
      console.log('🚀 CrackZone Production Setup');
      console.log('=' .repeat(40));
      
      const secrets = await this.createProductionEnv();
      await this.createDeploymentFiles();
      await this.updatePackageJson();
      await this.createGitHubActions();
      await this.generateDeploymentGuide();
      
      console.log('\n' + '='.repeat(50));
      console.log('🎉 Production Setup Complete!');
      console.log('='.repeat(50));
      
      console.log('\n🔑 IMPORTANT - Save these credentials:');
      console.log(`Admin Username: admin`);
      console.log(`Admin Password: ${secrets.ADMIN_PASSWORD}`);
      console.log('⚠️ Store these credentials securely!');
      
      console.log('\n🚀 Next Steps:');
      console.log('1. Review .env.production and update domains');
      console.log('2. Set up Railway or Render account');
      console.log('3. Deploy using: npm run deploy:railway');
      console.log('4. Run database migrations in production');
      console.log('5. Test your production deployment');
      
      console.log('\n📖 Read DEPLOYMENT_GUIDE.md for detailed instructions');
      
    } catch (error) {
      console.error('❌ Production setup failed:', error.message);
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new ProductionSetup();
  setup.run();
}

module.exports = ProductionSetup;