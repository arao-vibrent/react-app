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

# Debug: Print ALL environment variables
RUN echo "=== Environment Variables ==="
RUN env | sort
RUN echo "=== NODE_ENV value ==="
RUN echo $NODE_ENV
RUN echo "=== REACT_APP_ENV value ==="
RUN echo $REACT_APP_ENV

# Debug: Print config file content
RUN echo "=== Config File Content ==="
RUN cat src/config.js

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

# Debug: Check if config was properly built
RUN echo "=== Checking built config ==="
RUN grep -r "API_BASE_URL" build/

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

# Verify files are copied correctly with better error messages
RUN if [ ! -d "/usr/share/nginx/html/static" ]; then \
    echo "❌ Static directory not found in nginx html directory."; \
    echo "Current directory structure:"; \
    find /usr/share/nginx/html -type d; \
    exit 1; \
fi

# Do NOT set USER nginx — causes permission issues
# USER nginx ❌

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
    