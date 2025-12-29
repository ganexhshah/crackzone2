#!/bin/bash

echo "🚀 CrackZone Production Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required tools are installed
check_requirements() {
    print_info "Checking requirements..."
    
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI not found. Install with: npm install -g @railway/cli"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not found. Install with: npm install -g vercel"
        exit 1
    fi
    
    print_status "All requirements met"
}

# Deploy backend to Railway
deploy_backend() {
    print_info "Deploying backend to Railway..."
    
    cd backend
    
    # Check if Railway project exists
    if [ ! -f "railway.json" ]; then
        print_warning "Railway project not initialized. Run 'railway init' first."
        return 1
    fi
    
    # Deploy
    railway deploy
    
    if [ $? -eq 0 ]; then
        print_status "Backend deployed successfully"
    else
        print_error "Backend deployment failed"
        return 1
    fi
    
    cd ..
}

# Deploy frontend to Vercel
deploy_frontend() {
    print_info "Deploying frontend to Vercel..."
    
    cd frontend
    
    # Build and deploy
    vercel --prod
    
    if [ $? -eq 0 ]; then
        print_status "Frontend deployed successfully"
    else
        print_error "Frontend deployment failed"
        return 1
    fi
    
    cd ..
}

# Run database migrations
run_migrations() {
    print_info "Running database migrations..."
    
    cd backend
    railway run npm run migrate:all
    
    if [ $? -eq 0 ]; then
        print_status "Database migrations completed"
    else
        print_error "Database migrations failed"
        return 1
    fi
    
    cd ..
}

# Test deployment
test_deployment() {
    print_info "Testing deployment..."
    
    # Get Railway URL
    cd backend
    BACKEND_URL=$(railway status --json | jq -r '.deployments[0].url')
    cd ..
    
    if [ "$BACKEND_URL" != "null" ] && [ -n "$BACKEND_URL" ]; then
        print_info "Testing backend health check..."
        
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")
        
        if [ "$HTTP_STATUS" -eq 200 ]; then
            print_status "Backend health check passed"
            print_info "Backend URL: $BACKEND_URL"
        else
            print_error "Backend health check failed (HTTP $HTTP_STATUS)"
        fi
    else
        print_warning "Could not determine backend URL"
    fi
}

# Main deployment flow
main() {
    echo "Starting CrackZone deployment..."
    echo ""
    
    # Check requirements
    check_requirements
    echo ""
    
    # Deploy backend
    deploy_backend
    if [ $? -ne 0 ]; then
        print_error "Backend deployment failed. Stopping."
        exit 1
    fi
    echo ""
    
    # Run migrations
    run_migrations
    if [ $? -ne 0 ]; then
        print_warning "Migrations failed, but continuing..."
    fi
    echo ""
    
    # Deploy frontend
    deploy_frontend
    if [ $? -ne 0 ]; then
        print_error "Frontend deployment failed. Stopping."
        exit 1
    fi
    echo ""
    
    # Test deployment
    test_deployment
    echo ""
    
    print_status "🎉 Deployment completed!"
    echo ""
    print_info "Next steps:"
    echo "1. Update CORS_ORIGIN in Railway with your Vercel URL"
    echo "2. Update VITE_API_URL in Vercel with your Railway URL"
    echo "3. Test your application thoroughly"
    echo "4. Set up monitoring and alerts"
    echo ""
    print_info "Admin credentials:"
    echo "Username: admin"
    echo "Password: a9c9e9cc59a16ea73653d31c2066c9f3"
    echo ""
    print_warning "Remember to save these credentials securely!"
}

# Run main function
main