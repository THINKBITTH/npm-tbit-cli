import fs from 'fs';

/**
 * อัปเดตไฟล์ .env โดยการแทนที่ค่าเดิมหรือเพิ่มต่อท้าย
 * @param {string} filePath - Path ของไฟล์ .env
 * @param {Object} updates - Object ที่เก็บ key: value ที่ต้องการอัปเดต
 */
export default function updateEnvFile(filePath, updates) {
  let content = '';
  
  // 1. อ่านไฟล์เดิมถ้ามีอยู่
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf8');
  }

  const lines = content.split('\n');
  const updatedKeys = new Set();

  // 2. วนลูปแก้บรรทัดที่มี Key ตรงกัน
  let newLines = lines.map(line => {
    // แยก key ออกจาก value (รองรับทั้ง KEY=VAL และ KEY="VAL")
    const match = line.match(/^([^=]+)=/);
    if (match) {
      const key = match[1].trim();
      if (updates.hasOwnProperty(key)) {
        updatedKeys.add(key);
        return `${key}="${updates[key]}"`;
      }
    }
    return line;
  });

  // 3. สำหรับ Key ที่ไม่มีในไฟล์เดิม ให้เขียนต่อท้าย
  Object.keys(updates).forEach(key => {
    if (!updatedKeys.has(key)) {
      // ตรวจสอบว่าบรรทัดสุดท้ายมี newline หรือยัง ถ้าไม่มีให้เติมก่อน
      if (newLines.length > 0 && newLines[newLines.length - 1].trim() !== '') {
        newLines.push(''); 
      }
      newLines.push(`${key}="${updates[key]}"`);
    }
  });

  // 4. เขียนไฟล์กลับลงไป (กรองบรรทัดว่างที่อาจเกินมา)
  fs.writeFileSync(filePath, newLines.join('\n').trim() + '\n', 'utf8');
}