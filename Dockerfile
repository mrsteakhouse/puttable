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
RUN npm run check
RUN npm run build
RUN npm prune --omit=dev

# Production stage
FROM node:24-alpine AS production

RUN adduser -D puttable
RUN mkdir -p /app
RUN chown puttable:puttable /app
USER puttable

WORKDIR /app

# Copy built assets from the build stage
COPY --from=build --chown=puttable:puttable /app/build ./build
COPY --from=build --chown=puttable:puttable /app/package.json ./
COPY --from=build --chown=puttable:puttable /app/node_modules ./node_modules

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE $PORT

CMD ["node", "build"]
