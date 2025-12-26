import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { EnvInput } from '#utils/env-input';

// ฟังก์ชันสำหรับเปลี่ยน ~ เป็น home directory จริงๆ
function expandHomeDir(filePath: string): string {
  if (filePath.startsWith('~')) {
    return path.join(os.homedir(), filePath.slice(1));
  }
  return filePath;
}

async function connectToEC2() {
  const envInput = new EnvInput();

  try {
    // 1. รับค่าที่จำเป็นผ่าน EnvInput
    const AWS_EC2_INSTANCE_ID = await envInput.get("AWS_EC2_INSTANCE_ID");
    const AWS_PRIVATE_KEY_PATH = await envInput.get("AWS_PRIVATE_KEY_PATH");
    const AWS_REGION = await envInput.get("AWS_REGION", "ap-southeast-1");

    if (!AWS_EC2_INSTANCE_ID || !AWS_PRIVATE_KEY_PATH) {
      throw new Error("AWS_EC2_INSTANCE_ID and AWS_PRIVATE_KEY_PATH are required.");
    }

    envInput.close();

    const USER = "ec2-user";
    const expandedKeyPath = expandHomeDir(AWS_PRIVATE_KEY_PATH);
    const keyFullPath = path.resolve(expandedKeyPath);

    // 2. ตรวจสอบไฟล์ Key ว่ามีอยู่จริงไหม
    if (!fs.existsSync(keyFullPath)) {
      throw new Error(`Private key not found at: ${keyFullPath}`);
    }

    console.log(`🔍 Fetching DNS for instance: ${AWS_EC2_INSTANCE_ID}...`);

    const awsCmd = `aws ec2 describe-instances --instance-ids ${AWS_EC2_INSTANCE_ID} --query "Reservations[0].Instances[0].PublicDnsName" --output text --region ${AWS_REGION}`;

    const host = execSync(awsCmd).toString().trim();

    if (!host || host === 'None') {
      throw new Error(`Could not retrieve Public DNS. Is the instance running?`);
    }

    console.log(`\x1b[36m✅ Connecting to ${host}...\x1b[0m`);

    // 3. Connect via SSH
    spawn('ssh', ['-i', keyFullPath, `${USER}@${host}`], {
      stdio: 'inherit',
      shell: true
    });

  } catch (error: any) {
    envInput.close();
    console.error(`\x1b[31m❌ Error: ${error.message}\x1b[0m`);
    process.exit(1);
  }
}

export default connectToEC2;