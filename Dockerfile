FROM node:24-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

ARG PUTTABLE_APP_VERSION
ENV PUTTABLE_APP_VERSION=${PUTTABLE_APP_VERSION:-devenv}

ENV NODE_ENV=production

# Build the application
RUN npm run build
RUN npm prune --omit=dev

# Production stage
FROM node:24-alpine AS production

WORKDIR /app

# Copy built assets from the build stage
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules

ENV HOST=0.0.0.0
ENV PORT=3000
ENV BASE_PATH=http://localhost:$PORT
ENV CHECK_ORIGIN=true

# Set default environment variables (can be overridden at runtime)
ENV PUBLIC_SUPABASE_URL=public-supabase-url
ENV PUBLIC_SUPABASE_ANON_KEY=the-anon-key
ENV PUBLIC_SUPABASE_AUTH_KEYCLOAK_REDIRECT_URI=http://localhost:54321/auth/v1/callback
ENV PUBLIC_SITE_BASE_URL=http://localhost:$PORT

ENV SUPABASE_AUTH_KEYCLOAK_CLIENT_ID=keycloak-client-id
ENV SUPABASE_AUTH_KEYCLOAK_SECRET=keycloak-client-secret
ENV SUPABASE_AUTH_KEYCLOAK_URL=keycloak-url

ENV SENTRY_AUTH_TOKEN=auth-token

# Expose the port the app runs on
EXPOSE $PORT

CMD ["node", "build"]
