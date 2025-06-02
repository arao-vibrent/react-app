// In development, use local backend
// In production, use relative URLs (empty string) so nginx can handle routing
const isDevelopment = process.env.NODE_ENV === 'development';
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('isDevelopment:', isDevelopment);
export const API_BASE_URL = isDevelopment ? 'http://localhost:8000' : '';
console.log('API_BASE_URL:', API_BASE_URL); 