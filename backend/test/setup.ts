// Load test environment variables
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(__dirname, '..', '.env.test');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      process.env[key.trim()] = value;
    }
  });
  console.log('✅ Test environment variables loaded from .env.test');
}
