# --------------------------------
# Build Stage (NodeJS)
# --------------------------------
FROM node:18-alpine AS build

WORKDIR /app

# Clear npm cache and install dependencies
RUN npm cache clean --force
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source files
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV REACT_APP_ENV=production

# Debug: Print environment variables and files
RUN echo "NODE_ENV: $NODE_ENV"
RUN echo "REACT_APP_ENV: $REACT_APP_ENV"
RUN echo "Current directory contents:"
RUN ls -la
RUN echo "Source directory contents:"
RUN ls -la src/

# Run build with verbose output
RUN NODE_OPTIONS=--openssl-legacy-provider npm run build --verbose

# Debug: Check build output
RUN echo "Build directory contents:"
RUN ls -la build/ || echo "Build directory not created"
RUN echo "Static directory contents:"
RUN ls -la build/static/ || echo "Static directory not created"

# Verify build output
RUN test -f build/index.html || (echo "❌ React build failed! No index.html found." && exit 1)
RUN test -d build/static || (echo "❌ Static directory not found in build output." && exit 1)

# --------------------------------
# Runtime Stage (Nginx)
# --------------------------------
FROM nginx:alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

# Debug: Check nginx directory
RUN echo "Nginx html directory contents:"
RUN ls -la /usr/share/nginx/html
RUN echo "Static directory contents:"
RUN ls -la /usr/share/nginx/html/static || echo "Static directory not found in nginx"

# Verify files are copied correctly
RUN test -d /usr/share/nginx/html/static || (echo "❌ Static directory not found in nginx html directory." && exit 1)

# Do NOT set USER nginx — causes permission issues
# USER nginx ❌

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
    