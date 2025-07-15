import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..', '..');
const caPath = path.join(projectRoot, 'ca.pem');

interface SSLConfig {
  rejectUnauthorized: boolean;
  ca?: string;
}

let sslConfig: SSLConfig;

try {
  if (fs.existsSync(caPath)) {
    const ca = fs.readFileSync(caPath).toString();
    sslConfig = {
      rejectUnauthorized: true,
      ca: ca,
    };
  } else {
    console.log('⚠️  CA file not found at:', caPath);
    sslConfig = {
      rejectUnauthorized: false,
    };
    console.log('⚠️  Using fallback SSL configuration without CA certificate.');
  }
} catch (error) {
  console.error('❌ Error loading SSL configuration:', error);
  sslConfig = {
    rejectUnauthorized: false,
  };
  console.log('⚠️  Using minimal SSL configuration as fallback.');
}

export default sslConfig;
