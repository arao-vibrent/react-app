// In development, use local backend
// In production, use relative URLs (empty string) so nginx can handle routing
export const API_BASE_URL = process.env.NODE_ENV === 'development' || process.env.REACT_APP_ENV === 'development'
    ? 'http://localhost:8000'  // Backend runs on port 8000
    : '';  // In production, use relative URLs 