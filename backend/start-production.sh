#!/bin/bash
echo "🚀 Starting CrackZone API in production mode..."

# Run database migrations
echo "📊 Running database migrations..."
npm run migrate:all

# Start the application
echo "🎯 Starting server..."
npm start
