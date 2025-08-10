# Backend Engineering Assessment: Multi-Service System Challenge

## Objective

Design and implement a **production-ready backend system** composed of two microservices that demonstrate proficiency in:

- ✅ Spring Boot  
- ✅ gRPC  
- ✅ Secure communication  
- ✅ Containerization (Docker, Docker Compose)  
- ✅ Observability  
- ✅ Modern backend best practices  

---

## System Architecture

| Service     | Language           | Description |
|-------------|--------------------|-------------|
| **Service A** (Public API) | Candidate’s choice (Node.js, Go, etc.) | Exposes REST APIs, handles authentication, communicates with Service B |
| **Service B** (Internal)   | **Spring Boot (mandatory)** | gRPC-based service consumed by Service A. Handles task persistence and background execution |

---

## Functional Requirements

### 🔹 Service A (Public API)

- Exposes REST APIs to manage `ScheduledTasks`
- Implements **JWT-based authentication**
- Validates input and handles user interactions
- On task creation, initiates a **gRPC call** to Service B
- Logs **all incoming REST requests and outgoing responses** (including metadata) to **MongoDB**
- Provides interactive API documentation using **Swagger/OpenAPI**
- Accepts a string input to be **logged periodically by Service B**

### 🔹 Service B (Internal gRPC Service)

- Exposes the following gRPC methods:
  - `RegisterTask`
  - `DeleteTask`
  - `Ping`
- Stores tasks in **PostgreSQL**
- Simulates background task execution by **logging the task message every 5 seconds**

---

## Implementation Requirements

- 🐳 Containerize **both services** using Docker
- 🧱 Use **docker-compose** to orchestrate local development
- 🛢 PostgreSQL for Service B
- 🍃 MongoDB for Service A
- 🧪 Include **unit tests** for both services
- 🗃 Structure the codebase as a **monorepo**
- 📄 Provide a complete and clear `README.md` with setup instructions
- ❌ **Use of AI tools for coding is strictly prohibited**

---

## Bonus Objectives (Optional but Valued)

- ✅ Enable **gRPC reflection** for easier testing and debugging
- ✅ Fully document REST API using **Swagger/OpenAPI**
- ✅ Implement **multilingual support** for gRPC clients via `.proto` definitions
- ✅ Ensure **idempotency** for task registration
- ✅ Set up a **GitHub Actions CI pipeline**:
  - Linting
  - Unit Testing
  - Build steps

---

## Deliverables

- 📁 Source code for both services in a single **monorepo**
- 🐋 `Dockerfile` and `docker-compose.yml` configuration
- ✅ Unit test suites for both services
- ⚙️ GitHub Actions workflow configuration
- 📘 Documentation & setup instructions (`README.md`)

---

## Task Execution Behavior

Each `ScheduledTask` simulates a **CRON-style job**.  
After registering a task via Service A:
- Service B will **log the provided message every 5 seconds**, continuously, to simulate background task execution.

---

