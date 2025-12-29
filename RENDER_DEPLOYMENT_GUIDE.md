# 🚀 CrackZone Render.com Deployment Guide

## Quick Deployment Steps

### 1. Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account
3. Connect your GitHub repository: `https://github.com/ganexhshah/crackzone2`

### 2. Deploy Database First
1. In Render Dashboard, click "New +"
2. Select "PostgreSQL"
3. Configure:
   - **Name**: `crackzone-db`
   - **Database**: `crackzone_db` 
   - **User**: `crackzone_user`
   - **Plan**: Free
4. Click "Create Database"
5. **Save the connection string** - you'll need it

### 3. Deploy Backend API
1. In Render Dashboard, click "New +"
2. Select "Web Service"
3. Connect your GitHub repo: `ganexhshah/crackzone2`
4. Configure:
   - **Name**: `crackzone-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 4. Set Environment Variables
In the backend service settings, add these environment variables:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=[Your PostgreSQL connection string from step 2]
JWT_SECRET=fa6cf080053235755dcc5d7c474ac858417bd040b0b7f662022f47a30e70c270507b59438ba1614da0c3532d33323327f3333054146b63cbe9c8f37b678af70a
JWT_REFRESH_SECRET=a6f7a77ea0c267b873f4c95329b7cb6f081f6d3145055f91f534c92cf5dc30f79c2dc69b83588b712f05dc21d7ea734102ac051951b52059b783dc0ca0b8c846
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECRET=af8ab02a8e26ac6f9a6ad962f0c2beb1d880d07a332576e7393aad00abf2a268
ADMIN_USERNAME=admin
ADMIN_PASSWORD=a9c9e9cc59a16ea73653d31c2066c9f3
CORS_ORIGIN=https://crackzone-frontend.vercel.app
DB_ENCRYPTION_KEY=4ea6b36ffb0250df35ba4c1c0ba5a93e756d136c3242060df88eb3a538a90678
AUTO_BLOCK_THRESHOLD=100
BLOCK_DURATION_HOURS=24
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_AUTH_MAX=10
RATE_LIMIT_UPLOAD_MAX=10
RATE_LIMIT_ADMIN_MAX=100
FORCE_HTTPS=true
HSTS_MAX_AGE=31536000
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true
LOG_LEVEL=info
LOG_RETENTION_DAYS=30
```

### 5. Deploy and Test
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Your API will be available at: `https://crackzone-api.onrender.com`
4. Test health check: `https://crackzone-api.onrender.com/health`

### 6. Update Frontend
Update your Vercel frontend environment variable:
- `VITE_API_URL=https://crackzone-api.onrender.com/api`

### 7. Run Database Migrations
Once deployed, you can run migrations via Render shell or set up a one-time job.

## 🎯 Your Production URLs
- **Backend API**: `https://crackzone-api.onrender.com`
- **Frontend**: `https://crackzone-frontend.vercel.app`
- **Admin Panel**: `https://crackzone-frontend.vercel.app/admin`

## 🔐 Admin Credentials
- **Username**: `admin`
- **Password**: `a9c9e9cc59a16ea73653d31c2066c9f3`

## ⚡ Free Tier Limits
- **Render Free**: 750 hours/month, sleeps after 15 minutes
- **PostgreSQL Free**: 1GB storage, 100 connections
- **Perfect for**: Testing, demos, small tournaments

## 🚨 Next Steps After Deployment
1. Test all functionality
2. Set up Google OAuth with production URLs
3. Configure Cloudinary for image uploads
4. Monitor performance and logs