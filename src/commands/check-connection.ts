import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { SecretsManagerClient, ListSecretsCommand } from "@aws-sdk/client-secrets-manager";

/**
 * Checks connection to AWS Services.
 * Returns true if successful, false otherwise with instructions.
 */
async function checkConnection(silent = false): Promise<boolean> {
  if (!silent) console.log("🔍 Validating AWS environment...");

  const region = process.env.AWS_REGION || "ap-southeast-1";
  let hasError = false;

  // 1. Check Identity (Basic Credentials Check)
  try {
    const sts = new STSClient({ region });
    const identityCommand = new GetCallerIdentityCommand({});
    const identity = await sts.send(identityCommand);
    if (!silent) console.log(`✅ AWS Credentials: Valid (${identity.Account})`);
  } catch (error: any) {
    console.error(`❌ AWS Credentials Error: ${error.message}`);
    printInstructions();
    return false;
  }

  // 2. Check EC2 Access
  try {
    const ec2 = new EC2Client({ region });
    const ec2Command = new DescribeInstancesCommand({ MaxResults: 5 });
    await ec2.send(ec2Command);
    if (!silent) console.log(`✅ EC2 Service: Connected`);
  } catch (error: any) {
    console.error(`❌ EC2 Connection Error: ${error.message}`);
    hasError = true;
  }

  // 3. Check Secrets Manager Access
  try {
    const secrets = new SecretsManagerClient({ region });
    const secretsCommand = new ListSecretsCommand({ MaxResults: 1 });
    await secrets.send(secretsCommand);
    if (!silent) console.log(`✅ Secrets Manager: Connected`);
  } catch (error: any) {
    console.error(`❌ Secrets Manager Connection Error: ${error.message}`);
    hasError = true;
  }

  if (hasError) {
    console.log("\x1b[33m%s\x1b[0m", "\n⚠️  Some services are unreachable. Please check your IAM permissions.");
  }

  return !hasError;
}

function printInstructions() {
  console.log(`
\x1b[1m\x1b[33m💡 AWS Setup Instructions:\x1b[0m
1. \x1b[1mAWS CLI\x1b[0m: Run \x1b[36maws configure\x1b[0m to set your credentials.
2. \x1b[1mEnvironment Variables\x1b[0m: Ensure the following are set:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - AWS_REGION
3. \x1b[1mSSO / Profile\x1b[0m: If using profiles, run:
   \x1b[36mexport AWS_PROFILE=your-profile-name\x1b[0m
  `);
}

export default checkConnection;

