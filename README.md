# Scheduler System

This repository contains a multi-service backend system designed for scheduling and managing tasks. It demonstrates a microservices architecture using modern backend technologies and best practices.

## Overview

The system is composed of two main services: a public-facing REST API and an internal gRPC service for task processing. It showcases secure communication, containerization, and a clean, scalable project structure.

## Architecture

The system follows a microservices pattern:

*   **`scheduler-api` (Service A):** A public REST API built with **Node.js (NestJS)**. It's responsible for:
    *   Handling all incoming HTTP requests.
    *   JWT-based user authentication.
    *   Exposing endpoints to create, delete, and list tasks.
    *   Communicating with the `scheduler-engine` via gRPC to delegate task processing.
    *   Logging all API requests and responses to **MongoDB**.

*   **`scheduler-engine` (Service B):** An internal gRPC service built with **Spring Boot**. Its responsibilities include:
    *   Receiving task registration requests from the `scheduler-api`.
    *   Persisting task information in a **PostgreSQL** database.
    *   Simulating task execution in the background.

## Features

-   **RESTful API** for task management.
-   **JWT Authentication** to secure endpoints.
-   **gRPC Communication** for efficient internal service-to-service calls.
-   **Containerized Environment** with Docker and Docker Compose for easy setup and deployment.
-   **Request/Response Logging** to MongoDB for observability.
-   **Interactive API Documentation** via Swagger/OpenAPI.
-   **CI Pipeline** with GitHub Actions for automated linting, testing, and building.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
*   [Docker](https://www.docker.com/get-started)
*   [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

To get the application up and running, follow these steps:

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/m-alhoomaidi/scheduler-system.git
    cd scheduler-system
    ```

2.  **Build and run the application:**
    Use Docker Compose to build the images and start all the services.
    ```sh
    docker-compose up --build
    ```
    This command will start all the required services, including the databases.

## Services

Once the application is running, the services will be available at the following locations:

*   **Scheduler API:**
    *   URL: `http://localhost:3001`
    *   Swagger Docs: `http://localhost:3001/docs`
    *   The Swagger UI is protected by basic auth. You can find the credentials in the `docker-compose.yml` file under the `scheduler-api` service environment variables (`SWAGGER_USER` and `SWAGGER_PASS`).

*   **Scheduler Engine:**
    *   The gRPC service runs on port `50051` internally within the Docker network.
    *   An HTTP endpoint is exposed on `http://localhost:8081` for health checks or simple pings (e.g., `http://localhost:8081/hello`).
