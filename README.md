# Library Management System

A library management system with a Spring Boot backend, Vue.js frontend, and MySQL database.

---

## Run with Docker (Recommended)

**Requirement:** [Docker](https://www.docker.com/products/docker-desktop) installed.

```bash
git clone <repo-url>
cd library-management-system
docker compose up -d
```

Wait about 30 seconds for all services to start, then open:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080

**Default test account**

| Field | Value |
|---|---|
| Phone Number | 0912345678 |
| Password | 0000 |

**Stop the app**

```bash
# Stop but keep data
docker compose down

# Stop and reset all data
docker compose down -v
```

**Note:** Data persists across restarts unless you use `down -v`.

---

## Run without Docker

**Requirements:** Java 17, Maven 3.9+, Node.js 18+, MySQL 8.0

Run the setup script — it checks prerequisites, initializes the database, and starts both backend and frontend:

```bash
./start-local.sh
```

The script will prompt for your MySQL host, port, username, and password, then start everything automatically.

Press `Ctrl+C` to stop all services.

**Manual setup (alternative)**

If you prefer to run steps manually:

1. Initialize the database in MySQL:
   ```sql
   source LibraryProject/DB/DDL.sql
   source LibraryProject/DB/DML.sql
   ```

2. Edit `LibraryProject/src/main/resources/application.properties` with your MySQL credentials.

3. Start the backend:
   ```bash
   cd LibraryProject
   mvn spring-boot:run
   ```

4. Start the frontend (in a new terminal):
   ```bash
   cd LibraryProject/frontend
   npm install
   npm run dev
   ```
