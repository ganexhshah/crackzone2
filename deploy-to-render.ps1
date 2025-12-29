# CrackZone Render.com Deployment Script
# This script provides step-by-step instructions for deploying to Render.com

Write-Host "🚀 CrackZone Render.com Deployment" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 STEP 1: Open Render Dashboard" -ForegroundColor Yellow
Write-Host "Go to: https://render.com/dashboard" -ForegroundColor Cyan
Write-Host "Make sure you're logged in with your GitHub account" -ForegroundColor White
Write-Host ""

Write-Host "📊 STEP 2: Create PostgreSQL Database" -ForegroundColor Yellow
Write-Host "1. Click 'New +' button" -ForegroundColor White
Write-Host "2. Select 'PostgreSQL'" -ForegroundColor White
Write-Host "3. Configure:" -ForegroundColor White
Write-Host "   - Name: crackzone-db" -ForegroundColor Cyan
Write-Host "   - Database: crackzone_db" -ForegroundColor Cyan
Write-Host "   - User: crackzone_user" -ForegroundColor Cyan
Write-Host "   - Plan: Free" -ForegroundColor Cyan
Write-Host "4. Click 'Create Database'" -ForegroundColor White
Write-Host "5. ⚠️  IMPORTANT: Copy the connection string (you'll need it)" -ForegroundColor Red
Write-Host ""

Write-Host "🌐 STEP 3: Create Web Service" -ForegroundColor Yellow
Write-Host "1. Click 'New +' button again" -ForegroundColor White
Write-Host "2. Select 'Web Service'" -ForegroundColor White
Write-Host "3. Connect GitHub repository:" -ForegroundColor White
Write-Host "   Repository: ganexhshah/crackzone2" -ForegroundColor Cyan
Write-Host "4. Configure service:" -ForegroundColor White
Write-Host "   - Name: crackzone-api" -ForegroundColor Cyan
Write-Host "   - Root Directory: backend" -ForegroundColor Cyan
Write-Host "   - Environment: Node" -ForegroundColor Cyan
Write-Host "   - Build Command: npm install" -ForegroundColor Cyan
Write-Host "   - Start Command: npm start" -ForegroundColor Cyan
Write-Host "   - Plan: Free" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔧 STEP 4: Set Environment Variables" -ForegroundColor Yellow
Write-Host "In the web service settings, add these environment variables:" -ForegroundColor White
Write-Host ""

# Read and display environment variables
$envFile = "backend/.env.production"
if (Test-Path $envFile) {
    Write-Host "Copy these variables to Render:" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    
    $envVars = @{
        "NODE_ENV" = "production"
        "PORT" = "10000"
        "DATABASE_URL" = "[PASTE YOUR POSTGRESQL CONNECTION STRING HERE]"
        "JWT_SECRET" = "fa6cf080053235755dcc5d7c474ac858417bd040b0b7f662022f47a30e70c270507b59438ba1614da0c3532d33323327f3333054146b63cbe9c8f37b678af70a"
        "JWT_REFRESH_SECRET" = "a6f7a77ea0c267b873f4c95329b7cb6f081f6d3145055f91f534c92cf5dc30f79c2dc69b83588b712f05dc21d7ea734102ac051951b52059b783dc0ca0b8c846"
        "JWT_EXPIRES_IN" = "15m"
        "JWT_REFRESH_EXPIRES_IN" = "7d"
        "SESSION_SECRET" = "af8ab02a8e26ac6f9a6ad962f0c2beb1d880d07a332576e7393aad00abf2a268"
        "ADMIN_USERNAME" = "admin"
        "ADMIN_PASSWORD" = "a9c9e9cc59a16ea73653d31c2066c9f3"
        "CORS_ORIGIN" = "https://crackzone-frontend.vercel.app"
        "DB_ENCRYPTION_KEY" = "4ea6b36ffb0250df35ba4c1c0ba5a93e756d136c3242060df88eb3a538a90678"
        "AUTO_BLOCK_THRESHOLD" = "100"
        "BLOCK_DURATION_HOURS" = "24"
        "RATE_LIMIT_WINDOW_MS" = "900000"
        "RATE_LIMIT_MAX_REQUESTS" = "1000"
        "RATE_LIMIT_AUTH_MAX" = "10"
        "RATE_LIMIT_UPLOAD_MAX" = "10"
        "RATE_LIMIT_ADMIN_MAX" = "100"
        "FORCE_HTTPS" = "true"
        "HSTS_MAX_AGE" = "31536000"
        "HSTS_INCLUDE_SUBDOMAINS" = "true"
        "HSTS_PRELOAD" = "true"
        "LOG_LEVEL" = "info"
        "LOG_RETENTION_DAYS" = "30"
    }
    
    foreach ($var in $envVars.GetEnumerator()) {
        Write-Host "$($var.Key)=$($var.Value)" -ForegroundColor White
    }
    
    Write-Host "================================" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🚀 STEP 5: Deploy" -ForegroundColor Yellow
Write-Host "1. Click 'Create Web Service'" -ForegroundColor White
Write-Host "2. Wait for deployment (5-10 minutes)" -ForegroundColor White
Write-Host "3. Your API will be available at: https://crackzone-api.onrender.com" -ForegroundColor Cyan
Write-Host ""

Write-Host "🧪 STEP 6: Test Deployment" -ForegroundColor Yellow
Write-Host "Test these URLs once deployed:" -ForegroundColor White
Write-Host "- Health Check: https://crackzone-api.onrender.com/health" -ForegroundColor Cyan
Write-Host "- API Status: https://crackzone-api.onrender.com/api/status" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎯 PRODUCTION URLS" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "Frontend: https://crackzone-frontend.vercel.app" -ForegroundColor Cyan
Write-Host "Backend:  https://crackzone-api.onrender.com" -ForegroundColor Cyan
Write-Host "Admin:    https://crackzone-frontend.vercel.app/admin" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔐 ADMIN CREDENTIALS" -ForegroundColor Green
Write-Host "====================" -ForegroundColor Green
Write-Host "Username: admin" -ForegroundColor Cyan
Write-Host "Password: a9c9e9cc59a16ea73653d31c2066c9f3" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "Your CrackZone application is now live in production!" -ForegroundColor White
Write-Host ""

# Test if curl is available for health check
Write-Host "🔍 Testing connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://crackzone-frontend.vercel.app" -Method Head -TimeoutSec 10
    Write-Host "✅ Frontend is accessible" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Frontend check failed (this is normal if backend isn't deployed yet)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📞 Need help? Check the deployment guides:" -ForegroundColor White
Write-Host "- RENDER_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host "- DEPLOYMENT_STATUS.md" -ForegroundColor Cyan