# GoComet Auction System

## High-Level Architecture

```mermaid
graph TD
    subgraph "Client Layer"
        User[User/Browser]
    end

    subgraph "Presentation Layer"
        Frontend[RFQ Frontend<br/>React + Vite]
    end

    subgraph "API Gateway Layer"
        Gateway[Gateway Service<br/>Express Proxy + JWT Auth]
    end

    subgraph "Microservices Layer"
        Auth[Auth Service<br/>User Management]
        Auction[Auction Service<br/>Auction Management]
        Bidding[Bidding Service<br/>Bid Processing + WebSocket]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Database)]
        Redis[(Redis<br/>Cache)]
    end

    subgraph "Messaging Layer"
        Kafka[Kafka<br/>Message Broker]
    end

    subgraph "Infrastructure"
        Infra[Infra/Admin<br/>Kafka Topic Setup]
    end

    User --> Frontend
    Frontend --> Gateway
    Gateway --> Auth
    Gateway --> Auction
    Gateway --> Bidding
    Auth --> DB
    Auction --> DB
    Bidding --> DB
    Bidding --> Redis
    Bidding --> Kafka
    Gateway --> Kafka
    Infra --> Kafka
```

### Overview

This is a microservices-based auction system built with Node.js, featuring real-time bidding capabilities using WebSockets and Kafka for messaging. The system includes authentication, auction management, and bidding services, all orchestrated through an API gateway.

### Services

- **Auth Service**: Handles user authentication and authorization
- **Auction Service**: Manages auction creation and lifecycle
- **Bidding Service**: Processes bids in real-time with caching and messaging
- **Gateway Service**: API gateway for routing requests and JWT validation
- **Frontend**: React application for user interaction

### Infrastructure

- PostgreSQL for data persistence
- Redis for caching auction metadata and bids
- Kafka for event-driven communication
- Docker Compose for container orchestration

## Database Schema

```mermaid
erDiagram
    users ||--o{ bids : places
    auctions ||--o{ bids : receives
    auctions ||--o{ logs : generates

    users {
        int id PK
        text username UK
        text password
        text role
    }

    auctions {
        int id PK
        text name
        timestamptz bid_start_time
        timestamptz bid_close_time
        timestamptz forced_close_time
        int trigger_window_minutes
        int extension_duration_minutes
        text trigger_type
        text status
    }

    bids {
        int id PK
        int auction_id FK
        int supplier_id FK
        numeric price
        timestamp created_at
    }

    logs {
        int id PK
        int auction_id
        text event_type
        text message
        timestamp created_at
    }
```
