# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
# Ensure schema.sql is copied to the dist/database folder so it is available to the seeder
RUN mkdir -p dist/database && cp src/database/schema.sql dist/database/schema.sql

# Production stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=build /app/dist ./dist
# Copy the schema file so the compiled seeder can read it
COPY --from=build /app/dist/database/schema.sql ./dist/database/schema.sql

EXPOSE 5000
CMD ["node", "dist/app.js"]
