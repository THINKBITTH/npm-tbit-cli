# TB-IT CLI Tool (`tbit`)

[English](#english) | [ภาษาไทย](#ภาษาไทย)

---

## English

A custom CLI tool designed to streamline development workflows, specifically for managing AWS resources like EC2 and Secrets Manager.

### ✨ Features

- **Auto Validation**: Automatically checks AWS connectivity and permissions before running commands.
- **`load-env` (-l)**: Fetches secrets from AWS Secrets Manager and generates/updates a `.env` file.
- **`remote` (-r)**: Simplifies SSH connection to an EC2 instance using its Instance ID.
- **`update-sgr` (-s)**: Automatically detects your current public IP and updates a specific AWS Security Group Rule.

### 🚀 Quick Start

#### Run via npx (Recommended)

```bash
npx @thinkbitth/tbit-cli <command>
```

#### Install Globally

```bash
npm install -g @thinkbitth/tbit-cli
tbit --help
```

### 🛠 Commands

| Command | Alias | Description |
| :--- | :--- | :--- |
| `load-env` | `-l` | Sync AWS Secrets to local `.env` |
| `remote` | `-r` | Connect to EC2 via SSH |
| `update-sgr` | `-s` | Update Security Group with current IP |
| `help` | `-h` | Show help information |

### ⚙️ Configuration

The tool uses `.env.secret` in your project root to persist settings like `AWS_REGION`, `SG_ID`, etc. It will interactive prompt you if any required values are missing.

---

## ภาษาไทย

เครื่องมือ CLI สำหรับช่วยจัดการ Workflow ในการพัฒนา โดยเน้นไปที่การจัดการ AWS Resources (EC2 และ Secrets Manager)

### ✨ ความสามารถ

- **Auto Validation**: ตรวจสอบการเชื่อมต่อและสิทธิ์ของ AWS โดยอัตโนมัติก่อนเริ่มทำงาน
- **`load-env` (-l)**: ดึงค่า Secret จาก AWS Secrets Manager มาเขียนลงไฟล์ `.env` ในเครื่อง
- **`remote` (-r)**: ช่วยต่อ SSH เข้า EC2 Instance ได้ง่ายๆ เพียงระบุ Instance ID
- **`update-sgr` (-s)**: ตรวจสอบ Public IP ปัจจุบันของคุณ และอัปเดตลงใน AWS Security Group Rule ให้อัตโนมัติ

### 🚀 เริ่มต้นใช้งาน

#### รันผ่าน npx (แนะนำ)

```bash
npx @thinkbitth/tbit-cli <command>
```

#### ติดตั้งแบบ Global

```bash
npm install -g @thinkbitth/tbit-cli
tbit --help
```

### 🛠 คำสั่งที่ใช้งานได้

| คำสั่ง | ตัวย่อ | รายละเอียด |
| :--- | :--- | :--- |
| `load-env` | `-l` | ดึงค่าจาก AWS Secrets มาลงที่ `.env` |
| `remote` | `-r` | เชื่อมต่อ EC2 ผ่าน SSH |
| `update-sgr` | `-s` | อัปเดต Security Group ด้วย IP ปัจจุบัน |
| `help` | `-h` | แสดงวิธีใช้งาน |

### ⚙️ การตั้งค่า

ตัวเครื่องมือจะใช้ไฟล์ `.env.secret` ใน Root ของโปรเจคเพื่อจำข้อมูลต่างๆ เช่น `AWS_REGION`, `SG_ID` ฯลฯ หากข้อมูลไม่ครบ ระบบจะสอบถามข้อมูลจากคุณโดยอัตโนมัติผ่าน Terminal

---
© 2025 ThinkBit
