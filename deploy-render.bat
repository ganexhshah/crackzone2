@echo off
echo.
echo ========================================
echo   CrackZone Render.com Deployment
echo ========================================
echo.
echo STEP 1: Open Render Dashboard
echo Go to: https://render.com/dashboard
echo.
echo STEP 2: Create PostgreSQL Database
echo 1. Click 'New +' button
echo 2. Select 'PostgreSQL'
echo 3. Configure:
echo    - Name: crackzone-db
echo    - Database: crackzone_db
echo    - User: crackzone_user
echo    - Plan: Free
echo 4. Click 'Create Database'
echo 5. IMPORTANT: Copy the connection string
echo.
echo STEP 3: Create Web Service
echo 1. Click 'New +' button again
echo 2. Select 'Web Service'
echo 3. Connect GitHub: ganexhshah/crackzone2
echo 4. Configure:
echo    - Name: crackzone-api
echo    - Root Directory: backend
echo    - Build Command: npm install
echo    - Start Command: npm start
echo    - Plan: Free
echo.
echo STEP 4: Set Environment Variables
echo Copy these to Render dashboard:
echo.
echo NODE_ENV=production
echo PORT=10000
echo DATABASE_URL=[PASTE YOUR POSTGRESQL CONNECTION STRING]
echo JWT_SECRET=fa6cf080053235755dcc5d7c474ac858417bd040b0b7f662022f47a30e70c270507b59438ba1614da0c3532d33323327f3333054146b63cbe9c8f37b678af70a
echo JWT_REFRESH_SECRET=a6f7a77ea0c267b873f4c95329b7cb6f081f6d3145055f91f534c92cf5dc30f79c2dc69b83588b712f05dc21d7ea734102ac051951b52059b783dc0ca0b8c846
echo SESSION_SECRET=af8ab02a8e26ac6f9a6ad962f0c2beb1d880d07a332576e7393aad00abf2a268
echo ADMIN_USERNAME=admin
echo ADMIN_PASSWORD=a9c9e9cc59a16ea73653d31c2066c9f3
echo CORS_ORIGIN=https://crackzone-frontend.vercel.app
echo DB_ENCRYPTION_KEY=4ea6b36ffb0250df35ba4c1c0ba5a93e756d136c3242060df88eb3a538a90678
echo AUTO_BLOCK_THRESHOLD=100
echo BLOCK_DURATION_HOURS=24
echo RATE_LIMIT_WINDOW_MS=900000
echo RATE_LIMIT_MAX_REQUESTS=1000
echo FORCE_HTTPS=true
echo LOG_LEVEL=info
echo.
echo STEP 5: Deploy and Test
echo 1. Click 'Create Web Service'
echo 2. Wait for deployment (5-10 minutes)
echo 3. Test: https://crackzone-api.onrender.com/health
echo.
echo PRODUCTION URLS:
echo Frontend: https://crackzone-frontend.vercel.app
echo Backend:  https://crackzone-api.onrender.com
echo Admin:    https://crackzone-frontend.vercel.app/admin
echo.
echo ADMIN CREDENTIALS:
echo Username: admin
echo Password: a9c9e9cc59a16ea73653d31c2066c9f3
echo.
echo Opening Render dashboard...
start https://render.com/dashboard
echo.
pause