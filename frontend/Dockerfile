# --------------------------------
# Build Stage (NodeJS)
# --------------------------------
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV REACT_APP_ENV=production

# Debug: Print environment variables
RUN echo "NODE_ENV: $NODE_ENV"
RUN echo "REACT_APP_ENV: $REACT_APP_ENV"

# Debug: Print config file content
RUN cat src/config.js

# Debug: List files before build
RUN ls -la

RUN NODE_OPTIONS=--openssl-legacy-provider npm run build

# Debug: List files after build
RUN ls -la
RUN ls -la build || echo "Build directory not created"
RUN ls -la build/static || echo "Static directory not created"

RUN test -f build/index.html || (echo "❌ React build failed! No index.html found." && exit 1)
RUN test -d build/static || (echo "❌ Static directory not found in build output." && exit 1)

# --------------------------------
# Runtime Stage (Nginx)
# --------------------------------
FROM nginx:alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

# Debug: List files in nginx html directory
RUN ls -la /usr/share/nginx/html
RUN ls -la /usr/share/nginx/html/static || echo "Static directory not found in nginx"

# Verify files are copied correctly
RUN test -d /usr/share/nginx/html/static || (echo "❌ Static directory not found in nginx html directory." && exit 1)

# Do NOT set USER nginx — causes permission issues
# USER nginx ❌

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
    