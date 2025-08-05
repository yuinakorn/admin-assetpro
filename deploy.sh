#!/bin/bash

# Deploy Script for React Admin AssetPro
# Usage: ./deploy.sh [production|staging]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment file exists
if [ ! -f .env ]; then
    print_error ".env file not found. Please create one based on env.example"
    exit 1
fi

# Load environment variables
source .env

# Default to production if no argument provided
ENVIRONMENT=${1:-production}

print_status "Starting deployment for $ENVIRONMENT environment..."

# Build the application
print_status "Building application..."
bun run build

# Build Docker image
print_status "Building Docker image..."
docker build \
    --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    -t $DOCKER_USERNAME/re-admin-assetpro:$ENVIRONMENT .

# Push to Docker Hub
print_status "Pushing image to Docker Hub..."
docker push $DOCKER_USERNAME/re-admin-assetpro:$ENVIRONMENT

# Deploy based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    print_status "Deploying to production server..."
    
    # Deploy to production server
    ssh -p $SERVER_PORT $SERVER_USERNAME@$SERVER_HOST << EOF
        # Pull latest image
        docker pull $DOCKER_USERNAME/re-admin-assetpro:production
        
        # Stop and remove existing container
        docker stop re-admin-assetpro-app || true
        docker rm re-admin-assetpro-app || true
        
        # Run new container
        docker run -d \\
            --name re-admin-assetpro-app \\
            --restart unless-stopped \\
            -p 8088:80 \\
            -e VITE_SUPABASE_URL=$VITE_SUPABASE_URL \\
            -e VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \\
            $DOCKER_USERNAME/re-admin-assetpro:production
        
        # Clean up old images
        docker image prune -f
        
        echo "Production deployment completed!"
EOF

elif [ "$ENVIRONMENT" = "staging" ]; then
    print_status "Deploying to staging server..."
    
    # Deploy to staging server
    ssh -p $STAGING_SERVER_PORT $STAGING_SERVER_USERNAME@$STAGING_SERVER_HOST << EOF
        # Pull latest image
        docker pull $DOCKER_USERNAME/re-admin-assetpro:staging
        
        # Stop and remove existing container
        docker stop re-admin-assetpro-staging || true
        docker rm re-admin-assetpro-staging || true
        
        # Run new container
        docker run -d \\
            --name re-admin-assetpro-staging \\
            --restart unless-stopped \\
            -p 8089:80 \\
            -e VITE_SUPABASE_URL=$VITE_SUPABASE_URL \\
            -e VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \\
            $DOCKER_USERNAME/re-admin-assetpro:staging
        
        # Clean up old images
        docker image prune -f
        
        echo "Staging deployment completed!"
EOF

else
    print_error "Invalid environment. Use 'production' or 'staging'"
    exit 1
fi

print_status "Deployment completed successfully!"
print_status "Application should be available at:"
if [ "$ENVIRONMENT" = "production" ]; then
    echo "  http://$SERVER_HOST:8088"
else
    echo "  http://$STAGING_SERVER_HOST:8089"
fi 