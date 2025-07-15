# API Bookstore

## Description
A REST API for managing a bookstore or library system, built with Node.js, TypeScript, and SurrealDB. This API allows you to handle book inventory, customer management, sales, and library operations with features like book cataloging, borrowing tracking, and inventory management.

## Prerequisites
- Node.js (v20.x or higher)
- Docker and Docker Compose
- pnpm (recommended) or npm

## Features

### Technical Stack
- TypeScript support
- SurrealDB as database
- Biome for code formatting and linting
- Environment variables configuration
- Docker support
- Type-safe database operations
- REST API endpoints with Express.js

### API Functionalities
- Books Management
  - CRUD operations for books
  - Search books by title, author, genre, or ISBN
  - Track book inventory and stock levels
  - Manage book categories and genres

- Authors Management
  - CRUD operations for authors
  - Author details and bibliography
  - Link authors with their books

- Users & Authentication
  - User registration and authentication
  - Role-based access control (Admin, Staff, Customer)
  - User profile management

- Orders & Sales
  - Process book purchases
  - Order history tracking
  - Shopping cart functionality
  - Generate sales reports

- Reviews & Ratings
  - Allow users to rate books
  - Book reviews management
  - Average rating calculation

## Getting Started

### Environment Setup
Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
DATABASE_URL=http://localhost:8000
DATABASE_USERNAME=root
DATABASE_PASSWORD=root
DATABASE_NAME=test
DATABASE_NAMESPACE=test
