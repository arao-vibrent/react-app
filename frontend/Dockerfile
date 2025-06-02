# --------------------------------
# Build Stage (NodeJS)
# --------------------------------
FROM node:18-alpine AS build

WORKDIR /app

# Clear npm cache and install dependencies
RUN npm cache clean --force
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV REACT_APP_ENV=production
ENV CI=false

# Debug: Print environment variables and files
RUN echo "NODE_ENV: $NODE_ENV"
RUN echo "REACT_APP_ENV: $REACT_APP_ENV"
RUN echo "Current directory contents:"
RUN ls -la
RUN echo "Source directory contents:"
RUN ls -la src/

# Run build with verbose output and capture errors
RUN NODE_OPTIONS=--openssl-legacy-provider npm run build --verbose 2>&1 | tee build.log || (cat build.log && exit 1)

# Debug: Check build output with detailed structure
RUN echo "=== Build Directory Structure ==="
RUN find build -type f -o -type d | sort
RUN echo "=== Build Directory Contents ==="
RUN ls -R build/

# Debug: Check static directory specifically
RUN echo "=== Static Directory Structure ==="
RUN find build/static -type f -o -type d | sort
RUN echo "=== Static Directory Contents ==="
RUN ls -R build/static/

# --------------------------------
# Runtime Stage (Nginx)
# --------------------------------
FROM nginx:alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

# Debug: Check nginx directory structure
RUN echo "=== Nginx HTML Directory Structure ==="
RUN find /usr/share/nginx/html -type f -o -type d | sort
RUN echo "=== Nginx HTML Directory Contents ==="
RUN ls -R /usr/share/nginx/html

# Debug: Check nginx static directory specifically
RUN echo "=== Nginx Static Directory Structure ==="
RUN find /usr/share/nginx/html/static -type f -o -type d | sort
RUN echo "=== Nginx Static Directory Contents ==="
RUN ls -R /usr/share/nginx/html/static/

# Verify files are copied correctly
RUN test -d /usr/share/nginx/html/static || (echo "❌ Static directory not found in nginx html directory." && exit 1)

# Do NOT set USER nginx — causes permission issues
# USER nginx ❌

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
    