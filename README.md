# fiplus

A full-stack financial web application for fiat and cryptocurrency transactions, built with Express, React, Vite, and integrated with the Onramp Money API.

## Features

- User registration, login, and JWT authentication
- Profile management
- Fiat-to-crypto and crypto-to-fiat (onramp/offramp) operations with Onramp Money API
- Stellar wallet creation
- Transaction history and real-time exchange rates
- Front-end built with React, Vite, and Tailwind CSS
- Back-end API built with Express, TypeScript, Drizzle ORM, and NeonDB
- Zod for input validation, Drizzle ORM for database migrations

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (NeonDB) with Drizzle ORM
- **Frontend**: React, Vite, Tailwind CSS, React Query
- **Authentication**: JWT, bcryptjs
- **API Integration**: Onramp Money API for fiat/crypto operations
- **Schema Validation**: Zod
- **Testing**: Node.js scripts for Onramp API integration tests

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v8+)
- PostgreSQL or a Neon account (for DATABASE_URL)
- Onramp Money API key (sandbox or production)
- JWT secret (for authentication)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/fi-plus/fiplus.git
   cd fiplus
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the example environment file and update values:

   ```bash
   cp .env.example .env
   ```

4. Open `.env` and set:

   ```ini
   DATABASE_URL=postgres://username:password@hostname:5432/dbname
   JWT_SECRET=your-jwt-secret
   ONRAMP_API_KEY=your-onramp-api-key
   VITE_ONRAMP_API_KEY=your-onramp-api-key
   VITE_ONRAMP_APP_ID=your-onramp-app-id
   VITE_ONRAMP_BASE_URL=https://api-test.onramp.money
   VITE_ONRAMP_API_SECRET=your-onramp-api-secret
   ```

## Running in Development

Start the development server (runs backend with hot reload + Vite frontend):

```bash
npm run dev
```

Server will be available at `http://localhost:5000`.

## Building for Production

Generate client and server build:

```bash
npm run build
```

## Starting Production Server

```bash
npm start
```

## Database Migrations

Push schema changes to the database:

```bash
npm run db:push
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build client and server for production
- `npm start` - Run production server
- `npm run check` - Run TypeScript compiler (type checking)
- `npm run db:push` - Push migrations with Drizzle ORM

## Testing

Run Onramp API integration tests:

```bash
node test-real-onramp-api.js
node test-sandbox-integration.js
node test-onramp-integration.js
node test-real-integrations.js
```

## Environment Variables

Make sure to configure the following in your `.env` file:

- `DATABASE_URL`
- `JWT_SECRET`
- `ONRAMP_API_KEY`
- `VITE_ONRAMP_API_KEY`
- `VITE_ONRAMP_APP_ID`
- `VITE_ONRAMP_BASE_URL`
- `VITE_ONRAMP_API_SECRET`

## License

This project is licensed under the MIT License. 