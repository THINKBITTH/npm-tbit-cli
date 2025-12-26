import fs from 'fs';

/**
 * อัปเดตไฟล์ .env โดยการแทนที่ค่าเดิมหรือเพิ่มต่อท้าย
 * @param filePath - Path ของไฟล์ .env
 * @param updates - Object ที่เก็บ key: value ที่ต้องการอัปเดต
 */
export default function updateEnvFile(filePath: string, updates: Record<string, string>): void {
  let content = '';
  
  // 1. อ่านไฟล์เดิมถ้ามีอยู่
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf8');
  }

  const lines = content.split('\n');
  const updatedKeys = new Set<string>();

  // 2. วนลูปแก้บรรทัดที่มี Key ตรงกัน
  let newLines = lines.map(line => {
    // แยก key ออกจาก value (รองรับทั้ง KEY=VAL และ KEY="VAL")
    const match = line.match(/^([^=]+)=/);
    if (match) {
      const key = match[1].trim();
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        updatedKeys.add(key);
        return `${key}="${updates[key]}"`;
      }
    }
    return line;
  });

  // 3. สำหรับ Key ที่ไม่มีในไฟล์เดิม ให้เขียนต่อท้าย
  const keysToAdd = Object.keys(updates).filter(key => !updatedKeys.has(key));

  if (keysToAdd.length > 0) {
    // ลบบรรทัดว่างท้ายไฟล์เพื่อให้ข้อมูลต่อกันสวยงาม
    while (newLines.length > 0 && newLines[newLines.length - 1].trim() === '') {
      newLines.pop();
    }

    keysToAdd.forEach(key => {
      newLines.push(`${key}="${updates[key]}"`);
    });
  }

  // 4. เขียนไฟล์กลับลงไป (กรองบรรทัดว่างที่อาจเกินมา)
  fs.writeFileSync(filePath, newLines.join('\n').trim(), 'utf8');
}