import fs from 'fs';
import path from 'path';
import readline from 'readline/promises';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import dotenv from 'dotenv';

const ROOT = process.cwd();
const SECRET_ENV_PATH = path.join(ROOT, '.env.secret');
const DOTENV_PATH = path.join(ROOT, '.env');

async function loadEnv() {
  try {
    // 1. ใช้ dotenv โหลดค่าจาก .env.secret (ถ้ามีไฟล์)
    if (fs.existsSync(SECRET_ENV_PATH)) {
      dotenv.config({ path: SECRET_ENV_PATH });
    }

    let awsSecretName = process.env.AWS_SECRET_NAME;

    // 2. ถ้าใน .env.secret ไม่มีค่า AWS_SECRET_NAME ให้ถาม User
    if (!awsSecretName) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const answer = await rl.question('\x1b[33m? Enter AWS_SECRET_NAME:\x1b[0m ');
      awsSecretName = answer.trim();
      
      if (!awsSecretName) throw new Error("AWS_SECRET_NAME is required");

      // บันทึกค่าลง .env.secret เพื่อใช้ในครั้งต่อไป
      fs.writeFileSync(SECRET_ENV_PATH, `AWS_SECRET_NAME="${awsSecretName}"\n`, 'utf8');
      rl.close();
    }

    console.log(`⏳ Fetching secret: \x1b[36m${awsSecretName}\x1b[0m...`);

    // 3. ดึงข้อมูลจาก AWS Secrets Manager
    const client = new SecretsManagerClient({}); 
    const command = new GetSecretValueCommand({ SecretId: awsSecretName });
    const response = await client.send(command);

    if (!response.SecretString) {
      throw new Error("SecretString is empty");
    }

    // 4. Parse JSON โดยตรง (สมมติว่าเป็น JSON ที่สมบูรณ์เสมอ)
    const secrets = JSON.parse(response.SecretString);

    // 5. แปลงเป็นรูปแบบ KEY="VALUE"
    const envContent = Object.entries(secrets)
      .map(([key, value]) => `${key}="${value}"`)
      .join('\n');

    // 6. เขียนไฟล์ .env ที่ Root Directory
    fs.writeFileSync(DOTENV_PATH, envContent, 'utf8');

    console.log("\x1b[32m✅ Successfully updated .env file\x1b[0m");

  } catch (error) {
    console.error(`\x1b[31m❌ Error: ${error.message}\x1b[0m`);
    process.exit(1);
  }
}

export default loadEnv;