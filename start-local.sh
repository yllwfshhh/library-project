#!/bin/bash

# start-local.sh
# Run the project locally without Docker.
# Requirements: Java 17, Maven, Node.js 18+, MySQL 8.0

set -e

# --- Check prerequisites ---
check_command() {
  if ! command -v "$1" &>/dev/null; then
    echo "ERROR: '$1' is not installed or not in PATH. Please install it and try again."
    exit 1
  fi
}

echo "Checking prerequisites..."
check_command java
check_command mvn
check_command node
check_command npm
check_command mysql
echo "All prerequisites found."
echo ""

# --- MySQL credentials ---
read -p "MySQL host (default: 127.0.0.1): " DB_HOST
DB_HOST=${DB_HOST:-127.0.0.1}

read -p "MySQL port (default: 3306): " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "MySQL username (default: root): " DB_USER
DB_USER=${DB_USER:-root}

read -s -p "MySQL password: " DB_PASS
echo ""

# --- Initialize database ---
echo ""
echo "Initializing database..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" \
  --default-character-set=utf8mb4 < LibraryProject/DB/DDL.sql
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" \
  --default-character-set=utf8mb4 < LibraryProject/DB/DML.sql
echo "Database initialized."

# --- Update application.properties ---
PROPS="LibraryProject/src/main/resources/application.properties"
cat > "$PROPS" <<EOF
spring.datasource.url=jdbc:mysql://${DB_HOST}:${DB_PORT}/LibraryDB?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASS}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

server.port=8080
EOF
echo "Backend config written to $PROPS"

# --- Start backend ---
echo ""
echo "Starting Spring Boot backend..."
cd LibraryProject
mvn spring-boot:run &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "Waiting for backend to start..."
for i in $(seq 1 30); do
  if curl -s http://localhost:8080/api/inventory &>/dev/null; then
    echo "Backend is ready."
    break
  fi
  sleep 2
done

# --- Start frontend ---
echo ""
echo "Starting Vue.js frontend..."
cd LibraryProject/frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!
cd ../..

echo ""
echo "=== All services started ==="
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all services."

# Stop both on exit
trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" INT TERM
wait
