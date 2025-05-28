# --------------------------------
# Build Stage (NodeJS)
# --------------------------------
    FROM node:18-alpine AS build

    WORKDIR /app
    
    COPY package.json package-lock.json ./
    RUN npm ci --omit=dev
    COPY . .
    ARG REACT_APP_API_URL=http://backend-service.surveyjs.svc.cluster.local:8000
    ENV REACT_APP_API_URL=$REACT_APP_API_URL
    RUN NODE_OPTIONS=--openssl-legacy-provider npm run build
    RUN test -f build/index.html || (echo "❌ React build failed! No index.html found." && exit 1)

    # --------------------------------
    # Runtime Stage (Nginx)
    # --------------------------------
    FROM nginx:alpine AS runtime
    
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    COPY --from=build /app/build /usr/share/nginx/html
    
    # Do NOT set USER nginx — causes permission issues
    # USER nginx ❌
    
    EXPOSE 8080
    CMD ["nginx", "-g", "daemon off;"]
    