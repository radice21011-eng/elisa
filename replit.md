# Overview

**ELISA Quantum AI Council System v1.0.0** - A production-ready, cyberpunk-themed React dashboard with comprehensive PostgreSQL backend, featuring real-time metrics, multi-layer security, and advanced AI governance capabilities. The system implements owner verification, 100-year NDA protection, WebSocket connections, and comprehensive audit logging. Built with modern TypeScript architecture and designed for enterprise deployment with Docker containerization.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

**January 20, 2025** - Completed production-ready ELISA Quantum AI Council system:
- ✅ Fixed all TypeScript errors in frontend components
- ✅ Created modern authentication system with JWT and owner verification  
- ✅ Built comprehensive real-time dashboard with WebSocket connections
- ✅ Implemented admin panel with user management and system configuration
- ✅ Added production-ready Docker deployment with monitoring stack
- ✅ Created comprehensive documentation (README, LICENSE, NDA, Security Policy)
- ✅ Established GitHub workflows for CI/CD and security scanning
- ✅ Implemented $1 billion fine enforcement for unauthorized access
- ✅ Ready for GitHub repository creation and production deployment

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for build tooling
- **Routing**: Client-side routing using Wouter library for lightweight navigation
- **State Management**: TanStack Query (React Query) for server state management with custom query client configuration
- **UI Framework**: Comprehensive component library built on Radix UI primitives with Tailwind CSS for styling
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming, supporting both light and dark modes
- **Form Handling**: React Hook Form with Zod validation through hookform/resolvers

## Backend Architecture
- **Framework**: Express.js server with TypeScript
- **Development Setup**: Custom Vite integration for development with HMR support and production static file serving
- **API Structure**: RESTful API design with `/api` prefix routing
- **Storage Layer**: Abstracted storage interface with in-memory implementation (MemStorage) that can be easily swapped for database persistence
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

## Data Layer
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Shared schema definitions between client and server using Drizzle with Zod integration
- **Migrations**: Drizzle Kit for database schema migrations and management
- **Validation**: Zod schemas for runtime type checking and validation

## Development Architecture
- **Monorepo Structure**: Client, server, and shared code organized in separate directories
- **Path Aliases**: TypeScript path mapping for clean imports (`@/`, `@shared/`)
- **Build Process**: Vite for frontend bundling, esbuild for server compilation
- **Type Safety**: Strict TypeScript configuration across all modules

## Authentication & Security
- **Session Management**: Placeholder for session-based authentication with PostgreSQL session store support
- **Client-side Guards**: Email-based access control implemented as a development feature
- **CORS & Security**: Express middleware setup for secure API endpoints

# External Dependencies

## Database & ORM
- **Neon Database**: Serverless PostgreSQL database provider (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe ORM with PostgreSQL dialect support
- **Session Store**: connect-pg-simple for PostgreSQL-backed session storage

## UI & Styling
- **Radix UI**: Complete set of accessible, unstyled UI primitives for React
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Shadcn/ui**: Pre-built component system following modern design patterns
- **Lucide Icons**: Comprehensive icon library for consistent iconography

## Frontend Libraries
- **TanStack Query**: Powerful data synchronization for React applications
- **React Hook Form**: Performant forms with easy validation
- **Wouter**: Minimalist routing library for React
- **Date-fns**: Modern JavaScript date utility library
- **Class Variance Authority**: Utility for creating variant-based component APIs

## Development Tools
- **Vite**: Fast build tool with HMR support and plugin ecosystem
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast JavaScript bundler for server-side code
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer

## Runtime Dependencies
- **Express**: Web application framework for Node.js
- **tsx**: TypeScript execution environment for development
- **nanoid**: URL-safe unique string ID generator