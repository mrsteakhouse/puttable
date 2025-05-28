# Docker Setup for Puttable

This document explains how to build and run the Puttable application using Docker.

## Building the Docker Image

To build the Docker image, run the following command from the project root:

```bash
docker build -t puttable .
```

## Running the Docker Container

To run the Docker container with default environment variables:

```bash
docker run -p 3000:3000 puttable
```

This will start the application and make it available at http://localhost:3000.

## Configuring Environment Variables

All environment variables from `.env.local` are configurable in the Docker container. You can override them when running the container:

```bash
docker run -p 3000:3000 \
  -e PUBLIC_SUPABASE_URL=your_supabase_url \
  -e PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e SUPABASE_AUTH_KEYCLOAK_CLIENT_ID=your_keycloak_client_id \
  -e SUPABASE_AUTH_KEYCLOAK_SECRET=your_keycloak_secret \
  -e SUPABASE_AUTH_KEYCLOAK_URL=your_keycloak_url \
  -e PUBLIC_SUPABASE_AUTH_KEYCLOAK_REDIRECT_URI=your_keycloak_redirect_uri \
  -e PUBLIC_SITE_BASE_URL=your_site_base_url \
  -e BACKEND_URL=your_backend_url \
  -e NODE_ENV=production \
  -e HOST=0.0.0.0 \
  -e PORT=3000 \
  -e BASE_PATH=/app \
  -e CHECK_ORIGIN=true \
  -e PROTOCOL_HEADER=x-forwarded-proto \
  -e HOST_HEADER=x-forwarded-host \
  puttable
```

## Using Docker Compose

A `docker-compose.yml` file is provided in the repository for testing purposes. It includes the Puttable application and a Supabase service:

```yaml
version: '3'
services:
  puttable:
    build: .
    ports:
      - "5173:5173"
    environment:
      - PUBLIC_SUPABASE_URL=http://supabase:54321
      - PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
      - SUPABASE_AUTH_KEYCLOAK_CLIENT_ID=supabase-dev
      - SUPABASE_AUTH_KEYCLOAK_SECRET=Fg3UHxrIFjPbZX8gS6zxUraa9l0lW4sw
      - SUPABASE_AUTH_KEYCLOAK_URL=https://auth.g8ways.de/realms/puttable
      - PUBLIC_SUPABASE_AUTH_KEYCLOAK_REDIRECT_URI=http://localhost:5173/auth/v1/callback
      - PUBLIC_SITE_BASE_URL=http://localhost:5173
      - NODE_ENV=development
      - HOST=0.0.0.0
      - PORT=5173
      - BASE_PATH=
      - CHECK_ORIGIN=true
      - PROTOCOL_HEADER=x-forwarded-proto
      - HOST_HEADER=x-forwarded-host
    depends_on:
      - supabase
    networks:
      - puttable-network

  supabase:
    image: supabase/supabase-local:latest
    ports:
      - "8000:8000"  # REST API
      - "54321:54321"  # Studio
    environment:
      - POSTGRES_PASSWORD=postgres
      - JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters
      - ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
      - SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
    volumes:
      - supabase-data:/var/lib/postgresql/data
    networks:
      - puttable-network

networks:
  puttable-network:
    driver: bridge

volumes:
  supabase-data:
```

To start the services, run:

```bash
docker-compose up
```

This will start both the Puttable application and a local Supabase instance for testing. The application will be available at http://localhost:5173, and the Supabase Studio will be available at http://localhost:54321.

You can customize the environment variables in the docker-compose.yml file to match your specific testing requirements.

## Environment Variables

Here's a description of each environment variable:

### Client-Side Environment Variables
These variables are prefixed with `PUBLIC_` and are available in the client-side code:

- `PUBLIC_SUPABASE_URL`: URL of your Supabase instance
- `PUBLIC_SUPABASE_ANON_KEY`: Anonymous key for Supabase authentication
- `PUBLIC_SUPABASE_AUTH_KEYCLOAK_REDIRECT_URI`: Redirect URI for Keycloak authentication
- `PUBLIC_SITE_BASE_URL`: Base URL of your site

### Server-Side Environment Variables
These variables are only available on the server side:

- `SUPABASE_AUTH_KEYCLOAK_CLIENT_ID`: Keycloak client ID for Supabase authentication
- `SUPABASE_AUTH_KEYCLOAK_SECRET`: Keycloak client secret
- `SUPABASE_AUTH_KEYCLOAK_URL`: URL of your Keycloak instance
- `NODE_ENV`: Environment mode, set to "production" for production mode
- `HOST`: Host to bind the server to, set to "0.0.0.0" to allow external connections
- `PORT`: Port to run the server on, default is 3000 for production
- `BASE_PATH`: Base path for the application when served behind a reverse proxy (e.g., "/app")
- `CHECK_ORIGIN`: Whether to check the origin of requests (set to "false" to disable when behind a proxy)
- `PROTOCOL_HEADER`: Header to use for determining the protocol (default: "x-forwarded-proto")
- `HOST_HEADER`: Header to use for determining the host (default: "x-forwarded-host")
