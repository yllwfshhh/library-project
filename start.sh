#!/bin/bash


echo "Starting the platform using Docker Compose"

# Run docker-compose
docker compose up --build -d

echo "Frontend UI:    http://localhost:5173"
echo "Backend API:    http://localhost:8080"
echo "Database:       localhost:3306 (User: root / Pass: root)"
echo "To stop the platform, run: docker compose down"