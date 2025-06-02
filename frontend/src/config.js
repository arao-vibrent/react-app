// In development, use local backend
// In production, use relative URLs (empty string) so nginx can handle routing
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
console.log('Runtime Environment:', {
    hostname: window.location.hostname,
    isDevelopment: isDevelopment
});
export const API_BASE_URL = isDevelopment ? 'http://localhost:8000' : '';
console.log('API_BASE_URL:', API_BASE_URL); 