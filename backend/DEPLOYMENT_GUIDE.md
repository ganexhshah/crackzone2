# 🚀 CrackZone Production Deployment Guide

## Quick Start

### 1. Railway Deployment (Recommended)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Create Railway Project**
   ```bash
   cd backend
   railway init
   railway add postgresql
   ```

3. **Set Environment Variables**
   ```bash
   # Copy from .env.production and set in Railway dashboard
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=your-jwt-secret
   # ... add all other variables
   ```

4. **Deploy**
   ```bash
   railway deploy
   ```

### 2. Render Deployment

1. **Connect GitHub Repository**
   - Go to render.com
   - Connect your GitHub repository
   - Select "Web Service"

2. **Configure Build Settings**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

3. **Add Environment Variables**
   - Copy from .env.production
   - Set in Render dashboard

### 3. Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd frontend
   vercel --prod
   ```

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

- **Health Check**: `https://your-api-domain.railway.app/health`
- **Performance**: `https://your-api-domain.railway.app/api/performance/metrics`
- **Security**: `https://your-api-domain.railway.app/api/security/dashboard`

## Support

For deployment issues, check:
1. Railway/Render logs
2. Database connection
3. Environment variables
4. Security configuration
