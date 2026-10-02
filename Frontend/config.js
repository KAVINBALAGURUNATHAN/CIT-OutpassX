// Backend API base URL: local server during development, Render in production
const API_URL = ['localhost', '127.0.0.1', ''].includes(window.location.hostname)
  ? 'http://localhost:3000'
  : 'https://cit-outpassx-api.onrender.com';
