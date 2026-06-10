#!/bin/bash
set -e

# Exit immediately if a command exits with a non-zero status

# Explicitly set the docker-compose project name so it isolates containers from other projects
export COMPOSE_PROJECT_NAME=edusync-ai

echo "=========================================================="
echo "🚀 Starting EduSync AI Deployment"
echo "=========================================================="

# 1. Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  .env file not found in root! Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please review and update the .env file with production values."
fi

# Load port variables from .env or fallback
FRONTEND_PORT=$(grep -E "^FRONTEND_PORT=" .env | cut -d'=' -f2 || echo "3000")
BACKEND_PORT=$(grep -E "^BACKEND_PORT=" .env | cut -d'=' -f2 || echo "5000")
DB_PORT=$(grep -E "^DB_PORT=" .env | cut -d'=' -f2 || echo "25432")

# Trim whitespace/carriage return if any (from Windows formats)
FRONTEND_PORT=$(echo "$FRONTEND_PORT" | tr -d '\r' | tr -d ' ')
BACKEND_PORT=$(echo "$BACKEND_PORT" | tr -d '\r' | tr -d ' ')
DB_PORT=$(echo "$DB_PORT" | tr -d '\r' | tr -d ' ')

# 2. Find Docker Compose command
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "❌ Error: Docker Compose is not installed on this system!"
    exit 1
fi

echo "🐳 Using Docker Compose command: $DOCKER_COMPOSE"

# 3. Clear target ports if occupied by other Docker containers or host processes
echo "🔍 Checking for any processes or containers occupying our target ports ($FRONTEND_PORT, $BACKEND_PORT, $DB_PORT)..."
for PORT in "$FRONTEND_PORT" "$BACKEND_PORT" "$DB_PORT"; do
    # Check for Docker containers occupying this port
    CONFLICTING_CONTAINERS=$(docker ps --filter "publish=$PORT" -q)
    if [ -n "$CONFLICTING_CONTAINERS" ]; then
        echo "⚠️  Found Docker container(s) occupying port $PORT: $CONFLICTING_CONTAINERS"
        for CID in $CONFLICTING_CONTAINERS; do
            # Inspect if this container belongs to our compose project
            C_PROJECT=$(docker inspect --format '{{index .Config.Labels "com.docker.compose.project"}}' "$CID" 2>/dev/null || echo "")
            if [ "$C_PROJECT" = "$COMPOSE_PROJECT_NAME" ]; then
                echo "ℹ️  Container $CID belongs to our project ($COMPOSE_PROJECT_NAME). Docker Compose will handle updating it."
            else
                echo "🛑 Stopping and removing external conflicting container $CID occupying port $PORT..."
                docker stop "$CID" || true
                docker rm "$CID" || true
            fi
        done
    fi

    # Check for host processes occupying this port (non-docker or zombie connections)
    if command -v fuser &> /dev/null; then
        if fuser "$PORT/tcp" &>/dev/null; then
            echo "🔌 Port $PORT is occupied by a host process. Freeing port..."
            fuser -k -9 "$PORT/tcp" || true
        fi
    elif command -v lsof &> /dev/null; then
        PID=$(lsof -t -i:"$PORT" 2>/dev/null || true)
        if [ -n "$PID" ]; then
            echo "🔌 Port $PORT is occupied by host process $PID. Killing it..."
            kill -9 "$PID" || true
        fi
    fi
done

# 4. Pull latest base images
echo "📥 Pulling latest base Docker images..."
$DOCKER_COMPOSE pull

# 5. Build and start services
echo "🏗️  Building and starting EduSync AI containers..."
$DOCKER_COMPOSE up -d --build --remove-orphans

# 6. Run Database Migrations/Seeding
echo "🗄️  Running database migrations/seeding inside the backend container..."
sleep 5
if $DOCKER_COMPOSE exec -T backend node dist/database/seeder.js; then
    echo "✅ Database tables created and seeded successfully."
else
    echo "⚠️  Database migration execution failed or database is not ready yet. Retrying in 5 seconds..."
    sleep 5
    $DOCKER_COMPOSE exec -T backend node dist/database/seeder.js
fi

# 7. Verify Running Setup
echo "📊 Current Container Status:"
$DOCKER_COMPOSE ps

# 8. Clean up unused images to free up disk space on the VPS
echo "🧹 Cleaning up dangling Docker images..."
docker image prune -f

echo "=========================================================="
echo "🎉 EduSync AI Deployment Completed Successfully!"
echo "📍 Access Web UI on http://<vps-ip>:$FRONTEND_PORT"
echo "=========================================================="
