# Template Node.js TypeScript SurrealDB

## Description
A template for Node.js projects using TypeScript, Biome for code formatting/linting, and SurrealDB as the database. This template provides a solid foundation for building scalable backend applications with the freedom to implement any architecture or folder structure.

## Prerequisites
- Node.js (v20.x or higher)
- Docker and Docker Compose
- pnpm (recommended) or npm

## Features
- TypeScript support
- SurrealDB integration
- Biome for code formatting and linting
- Environment variables configuration
- Docker support
- Type-safe database operations
- Flexible project structure - organize it your way!

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
