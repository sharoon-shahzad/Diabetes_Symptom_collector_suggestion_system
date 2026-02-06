import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('check-env JWT_SECRET set=', !!process.env.JWT_SECRET);
console.log('check-env REFRESH_TOKEN_SECRET set=', !!process.env.REFRESH_TOKEN_SECRET);
