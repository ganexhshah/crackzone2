#!/bin/bash

# CrackZone Render.com Deployment Script

echo "🚀 CrackZone Render Deployment Helper"
echo "======================================"

echo ""
echo "📋 Pre-deployment Checklist:"
echo "✅ GitHub repo pushed: https://github.com/ganexhshah/crackzone2"
echo "✅ Render account created: https://render.com"
echo "✅ Production environment variables ready"
echo ""

echo "🔗 Deployment URLs to use:"
echo "- GitHub Repo: https://github.com/ganexhshah/crackzone2"
echo "- Backend Root Directory: backend"
echo "- Build Command: npm install"
echo "- Start Command: npm start"
echo ""

echo "🌐 Expected Production URLs:"
echo "- Backend API: https://crackzone-api.onrender.com"
echo "- Frontend: https://crackzone-frontend.vercel.app"
echo "- Health Check: https://crackzone-api.onrender.com/health"
echo ""

echo "🔐 Admin Credentials:"
echo "- Username: admin"
echo "- Password: a9c9e9cc59a16ea73653d31c2066c9f3"
echo ""

echo "📝 Next Steps:"
echo "1. Go to https://render.com/dashboard"
echo "2. Create PostgreSQL database first"
echo "3. Create Web Service for backend"
echo "4. Set all environment variables from backend/.env.production"
echo "5. Deploy and test"
echo "6. Update frontend API URL in Vercel"
echo ""

echo "🎯 Ready to deploy! Follow the RENDER_DEPLOYMENT_GUIDE.md for detailed steps."