import fs from 'fs';
import path from 'path';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { EnvInput } from '#utils/env-input';

const ROOT = process.cwd();
const DOTENV_PATH = path.join(ROOT, '.env');

async function loadEnv() {
	const envInput = new EnvInput();
	try {
		// 1. รับค่า AWS_SECRET_NAME และ AWS_REGION
		const awsSecretName = await envInput.get("AWS_SECRET_NAME");
		const awsRegion = await envInput.get("AWS_REGION", "ap-southeast-1");

		if (!awsSecretName) {
			throw new Error("AWS_SECRET_NAME is required.");
		}

		envInput.close();
		console.log(`⏳ Fetching secret: \x1b[36m${awsSecretName}\x1b[0m in \x1b[36m${awsRegion}\x1b[0m...`);

		// 2. ดึงข้อมูลจาก AWS Secrets Manager
		const client = new SecretsManagerClient({ region: awsRegion });
		const command = new GetSecretValueCommand({ SecretId: awsSecretName });
		const response = await client.send(command);

		if (!response.SecretString) {
			throw new Error("SecretString is empty");
		}

		// 3. Parse JSON โดยตรง (สมมติว่าเป็น JSON ที่สมบูรณ์เสมอ)
		const secrets = JSON.parse(response.SecretString);

		// 4. แปลงเป็นรูปแบบ KEY="VALUE"
		const envContent = Object.entries(secrets)
			.map(([key, value]) => `${key}="${value}"`)
			.join('\n');

		// 5. เขียนไฟล์ .env ที่ Root Directory
		fs.writeFileSync(DOTENV_PATH, envContent, 'utf8');

		console.log("\x1b[32m✅ Successfully updated .env file\x1b[0m");

	} catch (error: any) {
		envInput.close();
		console.error(`\x1b[31m❌ Error: ${error.message}\x1b[0m`);
		process.exit(1);
	}
}

export default loadEnv;