# Grocery List App - Replit.md

## Overview

This is a full-stack grocery list application built with React, Express, and PostgreSQL. The application allows users to organize grocery items into categories, check off items as they shop, and manage their shopping lists with features like color coding and price tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **API Style**: REST API with JSON responses
- **Session Management**: Express sessions with PostgreSQL store
- **Database Connection**: Neon Database serverless connection

### Data Storage
- **Local Storage**: JSON file-based storage for offline functionality
- **Storage Location**: ./data/storage.json (local file system)
- **Schema**: Categories and items with foreign key relationships
- **Persistence**: Data survives app restarts and works offline
- **Backup**: Easy to backup/transfer via JSON files

## Key Components

### Database Schema
- **Categories Table**: Stores grocery categories (id, name, isExpanded, order)
- **Items Table**: Stores grocery items (id, categoryId, name, quantity, unit, referencePrice, colorState, checked, order)

### Frontend Components
- **CategorySection**: Manages expandable category sections with items
- **ItemRow**: Individual item rows with inline editing, quantity controls, and color cycling
- **SettingsMenu**: Category management and app settings
- **ThemeProvider**: Light/dark mode toggle functionality

### Backend Services
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development
- **API Routes**: RESTful endpoints for categories and items CRUD operations
- **Validation**: Zod schemas for request validation

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **API Layer**: Express routes handle HTTP requests and validate data
3. **Storage Layer**: Abstract storage interface processes business logic
4. **Database**: Drizzle ORM handles database operations
5. **Response**: JSON responses sent back to client
6. **State Updates**: React Query manages cache invalidation and UI updates

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives via shadcn/ui
- **State Management**: TanStack Query for server state
- **Styling**: Tailwind CSS with custom CSS variables
- **Form Handling**: React Hook Form with Zod validation
- **Date Utilities**: date-fns for date formatting

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Store**: connect-pg-simple for PostgreSQL session storage
- **Validation**: Zod for schema validation
- **Development**: tsx for TypeScript execution

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: Node.js with tsx for TypeScript execution
- **Database**: PostgreSQL connection via DATABASE_URL environment variable

### Production
- **Build Process**: 
  - Frontend built with Vite to `dist/public`
  - Backend bundled with esbuild to `dist/index.js`
- **Static Files**: Express serves frontend assets in production
- **Database**: PostgreSQL via Neon Database connection
- **Environment**: Production mode disables development features

### Key Configuration
- **Database URL**: Required via DATABASE_URL environment variable
- **Session Secret**: Required for session management
- **CORS**: Configured for development with credentials support
- **Path Aliases**: TypeScript path mapping for clean imports

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout, and a responsive UI that works across devices. The in-memory storage can be easily swapped for the PostgreSQL implementation when needed.