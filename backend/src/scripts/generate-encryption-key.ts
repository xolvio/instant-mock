import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const generateKey = () => {
  const key = crypto.randomBytes(32).toString('hex');
  const envPath = path.join(process.cwd(), '.env');

  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  if (envContent.includes('ENCRYPTION_KEY=')) {
    console.log('⚠️  ENCRYPTION_KEY already exists in .env file');
    return;
  }

  fs.appendFileSync(envPath, `\nENCRYPTION_KEY=${key}\n`);
  console.log('✅ ENCRYPTION_KEY generated and added to .env file');
};

generateKey();
