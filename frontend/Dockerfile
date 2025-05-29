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
RUN NODE_OPTIONS=--openssl-legacy-provider npm run build
RUN test -f build/index.html || (echo "❌ React build failed! No index.html found." && exit 1)
RUN test -d build/static || (echo "❌ Static directory not found in build output." && exit 1)

# --------------------------------
# Runtime Stage (Nginx)
# --------------------------------
FROM nginx:alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

# Verify files are copied correctly
RUN test -d /usr/share/nginx/html/static || (echo "❌ Static directory not found in nginx html directory." && exit 1)

# Do NOT set USER nginx — causes permission issues
# USER nginx ❌

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
    