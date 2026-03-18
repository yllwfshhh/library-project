# Library Management System

A library management system with a Spring Boot backend, Vue.js frontend, and MySQL database.

---

## Run with Docker (Recommended)

**Requirement:** [Docker](https://www.docker.com/products/docker-desktop) installed.

```bash
git clone https://github.com/yllwfshhh/library-project.git
cd library-project
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

This method runs the backend and frontend on your machine directly.

### Prerequisites

You must download and install these tools manually before starting:

- **Java JDK 17** 
- **Maven 3.9+** 
- **Node.js 18+ (LTS)** 
- **MySQL 8.0** 

### Steps to Run

Follow these steps in order:

#### 1. Initialize the Database
Open your MySQL client (like MySQL Workbench or Command Line) and run the SQL scripts to create the database and tables.

```sql
source LibraryProject/DB/DDL.sql
source LibraryProject/DB/DML.sql
```
*(Alternatively, copy-paste the content of `LibraryProject/DB/DDL.sql` and `LibraryProject/DB/DML.sql` into your SQL query window and execute them.)*

#### 2. Configure Backend Database Connection
Open `LibraryProject/src/main/resources/application.properties` and edit the following lines with your MySQL username and password:

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD_HERE
```

#### 3. Start Backend (Spring Boot)
Open a terminal in the root folder and run:

```bash
cd LibraryProject
mvn spring-boot:run
```
Wait until you see `Started LibrarySystemApplication in ... seconds`. The backend is now running at `http://localhost:8080`.

#### 4. Start Frontend (Vue.js)
Open a **new terminal** window (keep the backend running) and run:

```bash
cd LibraryProject/frontend
npm install
npm run dev
```
The frontend will start at `http://localhost:5173`. Open this URL in your browser.
