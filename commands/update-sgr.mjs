import { EC2Client, ModifySecurityGroupRulesCommand } from "@aws-sdk/client-ec2";
import { EnvInput } from "../utils/env-input.mjs";

async function getConfig(envInput) {
  console.log("--- Configuration Setup ---");
  const config = {};
  
  config.SG_ID = await envInput.get("SG_ID");
  config.RULE_ID = await envInput.get("RULE_ID");
  
  // ดึงค่า PORT และตรวจสอบว่าเป็น All Traffic หรือไม่
  const rawPort = await envInput.get("PORT", "22");
  config.PORT = parseInt(rawPort);

  // --- Logic สำหรับ Validation ---
  if (config.PORT === -1) {
    // ถ้า PORT เป็น -1 ต้องใช้ Protocol เป็น "-1" เสมอ
    config.PROTOCOL = "-1"; 
    config.FROM_PORT = -1;
    config.TO_PORT = -1;
    console.log("⚠️ Mode: All Traffic detected (Port -1)");
  } else if (config.PORT > 0 && config.PORT <= 65535) {
    // กรณีพอร์ตปกติ
    config.PROTOCOL = "tcp";
    config.FROM_PORT = config.PORT;
    config.TO_PORT = config.PORT;
  } else {
    throw new Error(`Invalid Port: ${rawPort}. Must be -1 or 1-65535`);
  }

  config.REGION = await envInput.get("REGION", "ap-southeast-1");
  config.RULE_NAME = await envInput.get("RULE_NAME", "ThinkBit Office");

  return config;
}

async function updateSecurityGroup() {
  const envInput = new EnvInput();
  try {
    const CONFIG = await getConfig(envInput);
    envInput.close();

    // 1. ค้นหา Public IP ปัจจุบัน
    const response = await fetch("http://checkip.amazonaws.com");
    const myIp = (await response.text()).trim();
    const cidrIp = `${myIp}/32`;

    console.log(`\nCurrent Public IP: ${myIp}`);
    console.log(`Target Rule ID: ${CONFIG.RULE_ID} in Region: ${CONFIG.REGION}`);

    // 2. เตรียม Client และ Command
    const client = new EC2Client({ region: CONFIG.REGION });

    const command = new ModifySecurityGroupRulesCommand({
      GroupId: CONFIG.SG_ID,
      SecurityGroupRules: [
        {
          SecurityGroupRuleId: CONFIG.RULE_ID,
          SecurityGroupRule: {
            IpProtocol: "tcp",
            FromPort: CONFIG.PORT,
            ToPort: CONFIG.PORT,
            CidrIpv4: cidrIp,
            Description: CONFIG.RULE_NAME,
          },
        },
      ],
    });

    // 3. ส่งคำสั่งไปที่ AWS
    await client.send(command);
    
    console.log(`✅ Successfully updated Rule ${CONFIG.RULE_ID} to IP ${cidrIp}`);
  } catch (error) {
    envInput.close();
    console.error("❌ Error: Update failed.");
    if (error.name === "CredentialsProviderError") {
      console.error("Please check your AWS Credentials.");
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

export default updateSecurityGroup;