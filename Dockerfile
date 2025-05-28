FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built assets from the build stage
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules

# Set default environment variables (can be overridden at runtime)
ENV PUBLIC_SUPABASE_URL=public-supabase-url
ENV PUBLIC_SUPABASE_ANON_KEY=the-anon-key
ENV SUPABASE_AUTH_KEYCLOAK_CLIENT_ID=keycloak-client-id
ENV SUPABASE_AUTH_KEYCLOAK_SECRET=keycloak-client-secret
ENV SUPABASE_AUTH_KEYCLOAK_URL=keycloak-url
ENV PUBLIC_SUPABASE_AUTH_KEYCLOAK_REDIRECT_URI=http://localhost:54321/auth/v1/callback
ENV PUBLIC_SITE_BASE_URL=the-website-url
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5173
ENV BASE_PATH=
ENV CHECK_ORIGIN=true
ENV PROTOCOL_HEADER=x-forwarded-proto
ENV HOST_HEADER=x-forwarded-host

# Expose the port the app runs on
EXPOSE 5173

CMD ["node", "build"]
