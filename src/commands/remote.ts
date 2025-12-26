import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import readline from 'readline/promises'; // ใช้เวอร์ชัน promise เพื่อให้ใช้ await ได้
import os from 'os';
import updateEnvFile from '#utils/update-env-file';

const envPath: string = path.join(process.cwd(), '.env.secret');

// ฟังก์ชันสำหรับเปลี่ยน ~ เป็น home directory จริงๆ
function expandHomeDir(filePath: string): string {
    if (filePath.startsWith('~')) {
        return path.join(os.homedir(), filePath.slice(1));
    }
    return filePath;
}

async function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question(`\x1b[33m? ${query}\x1b[0m `);
  rl.close();
  return answer.trim();
}

async function connectToEC2() {
  // 1. Load ค่าเดิมที่มีอยู่ (ถ้ามี)
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  let { AWS_EC2_INSTANCE_ID, AWS_PRIVATE_KEY_PATH, AWS_REGION = 'ap-southeast-7' } = process.env;

  // 2. ถ้าค่าไม่มี ให้ถาม User และเตรียมบันทึก
  let needsUpdate = false;

  if (!AWS_EC2_INSTANCE_ID) {
    AWS_EC2_INSTANCE_ID = await askQuestion('Enter AWS EC2 Instance ID (e.g., i-0abcd1234):');
    needsUpdate = true;
  }

  if (!AWS_PRIVATE_KEY_PATH) {
    AWS_PRIVATE_KEY_PATH = await askQuestion('Enter Path to Private Key (e.g., ./my-key.pem):');
    needsUpdate = true;
  }

  // 3. บันทึกลง .env.secret ถ้ามีการกรอกข้อมูลใหม่
  if (needsUpdate && AWS_EC2_INSTANCE_ID && AWS_PRIVATE_KEY_PATH) {
    const updates = {
      AWS_EC2_INSTANCE_ID: AWS_EC2_INSTANCE_ID,
      AWS_PRIVATE_KEY_PATH: AWS_PRIVATE_KEY_PATH,
      AWS_REGION: AWS_REGION
    };

    updateEnvFile(envPath, updates);
    console.log(`\x1b[32m✅ Configuration saved to ${envPath}\x1b[0m`);
  }

  const USER = "ec2-user";
  const expandedKeyPath = expandHomeDir(AWS_PRIVATE_KEY_PATH || "");
  const keyFullPath = path.resolve(expandedKeyPath);

  // 4. ตรวจสอบไฟล์ Key ว่ามีอยู่จริงไหม
  if (!fs.existsSync(keyFullPath)) {
    console.error(`\x1b[31m❌ Private key not found at: ${keyFullPath}\x1b[0m`);
    process.exit(1);
  }

  try {
    console.log(`🔍 Fetching DNS for instance: ${AWS_EC2_INSTANCE_ID}...`);

    const awsCmd = `aws ec2 describe-instances --instance-ids ${AWS_EC2_INSTANCE_ID} --query "Reservations[0].Instances[0].PublicDnsName" --output text --region ${AWS_REGION}`;

    const host = execSync(awsCmd).toString().trim();

    if (!host || host === 'None') {
      throw new Error(`Could not retrieve Public DNS. Is the instance running?`);
    }

    console.log(`\x1b[36m✅ Connecting to ${host}...\x1b[0m`);

    // 5. Connect via SSH
    spawn('ssh', ['-i', keyFullPath, `${USER}@${host}`], {
      stdio: 'inherit',
      shell: true
    });

  } catch (error: any) {
    console.error(`\x1b[31m❌ Error: ${error.message}\x1b[0m`);
    process.exit(1);
  }
}

export default connectToEC2;