import readline from "readline";
import path from "path";
import dotenv from "dotenv";
import updateEnvFile from "#utils/update-env-file.js";

// Load .env.secret if it exists
dotenv.config({ path: path.join(process.cwd(), ".env.secret") });

export class EnvInput {
  private rl: readline.Interface;
  private envPath: string;

  constructor(envFileName: string = ".env.secret") {
    this.envPath = path.join(process.cwd(), envFileName);
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * ดึงค่าจาก .env.secret หรือถามผู้ใช้ถ้าไม่มี
   * @param key - ชื่อตัวแปร (และใช้เป็นข้อความ prompt)
   * @param defaultValue - ค่าเริ่มต้นถ้าผู้ใช้ไม่กรอก
   * @returns ค่าที่ได้
   */
  async get(key: string, defaultValue?: string): Promise<string> {
    // 1. หาจาก process.env ก่อน (ที่โหลดมาจาก .env.secret แล้ว)
    if (process.env[key]) {
      return process.env[key]!;
    }

    // 2. ถ้าไม่มี ให้ถามผู้ใช้
    return new Promise((resolve) => {
      const prompt = defaultValue
        ? `${key} (default: ${defaultValue}): `
        : `${key}: `;

      this.rl.question(prompt, (answer) => {
        // ถ้ากด Enter (answer ว่าง) ให้ใช้ defaultValue
        const value = answer.trim() || defaultValue;
        
        // ถ้าได้ค่ามา (จากการกรอกหรือ default) ให้บันทึกลงไฟล์
        if (value) {
          updateEnvFile(this.envPath, {
            [key]: value
          });
          // อัปเดต process.env ด้วยเพื่อให้เรียกใช้ต่อได้เลยไม่ต้องโหลดใหม่
          process.env[key] = value;
        }

        // resolve with value, defaulting to empty string if undefined (though logic above handles trimming)
        resolve(value || "");
      });
    });
  }

  close(): void {
    this.rl.close();
  }
}