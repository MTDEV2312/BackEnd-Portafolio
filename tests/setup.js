// Setup para los tests
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'test-key';

// Mock console methods en tests
if (process.env.NODE_ENV === 'test') {
  console.warn = () => {};
  console.error = () => {};
}
