import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mockClient } from 'aws-sdk-client-mock';
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { SecretsManagerClient, ListSecretsCommand } from "@aws-sdk/client-secrets-manager";
import checkConnection from '#commands/check-connection';

describe('checkConnection Command', () => {
  const stsMock = mockClient(STSClient);
  const ec2Mock = mockClient(EC2Client);
  const secretsMock = mockClient(SecretsManagerClient);

  let logOutput: string[] = [];
  let errorOutput: string[] = [];

  const originalLog = console.log;
  const originalError = console.error;

  beforeEach(() => {
    stsMock.reset();
    ec2Mock.reset();
    secretsMock.reset();
    logOutput = [];
    errorOutput = [];
    console.log = (...args: any[]) => logOutput.push(args.join(' '));
    console.error = (...args: any[]) => errorOutput.push(args.join(' '));
  });

  afterEach(() => {
    console.log = originalLog;
    console.error = originalError;
  });

  it('should log success for all services when everything is valid and not silent', async () => {
    stsMock.on(GetCallerIdentityCommand).resolves({
      Account: '123456789012',
      Arn: 'arn:aws:iam::123456789012:user/test-user'
    });
    ec2Mock.on(DescribeInstancesCommand).resolves({});
    secretsMock.on(ListSecretsCommand).resolves({ SecretList: [] });

    const success = await checkConnection(false);

    assert.equal(success, true);
    assert.ok(logOutput.some(msg => msg.includes('✅ AWS Credentials: Valid')));
    assert.ok(logOutput.some(msg => msg.includes('✅ EC2 Service: Connected')));
    assert.ok(logOutput.some(msg => msg.includes('✅ Secrets Manager: Connected')));
    assert.equal(errorOutput.length, 0);
  });

  it('should be silent when silent parameter is true', async () => {
    stsMock.on(GetCallerIdentityCommand).resolves({ Account: '123', Arn: 'arn' });
    ec2Mock.on(DescribeInstancesCommand).resolves({});
    secretsMock.on(ListSecretsCommand).resolves({ SecretList: [] });

    const success = await checkConnection(true);

    assert.equal(success, true);
    assert.equal(logOutput.length, 0);
    assert.equal(errorOutput.length, 0);
  });

  it('should stop and print instructions after AWS credentials failure', async () => {
    stsMock.on(GetCallerIdentityCommand).rejects(new Error('Invalid credentials'));

    const success = await checkConnection(true);

    assert.equal(success, false);
    assert.ok(errorOutput.some(msg => msg.includes('❌ AWS Credentials Error: Invalid credentials')));
    assert.ok(logOutput.some(msg => msg.includes('💡 AWS Setup Instructions:')));
    // Should not reach EC2 or Secrets Manager checks
    assert.equal(ec2Mock.calls().length, 0);
    assert.equal(secretsMock.calls().length, 0);
  });

  it('should log error if EC2 fails but continue to Secrets Manager', async () => {
    stsMock.on(GetCallerIdentityCommand).resolves({ Account: '123', Arn: 'arn' });
    ec2Mock.on(DescribeInstancesCommand).rejects(new Error('EC2 Denied'));
    secretsMock.on(ListSecretsCommand).resolves({ SecretList: [] });

    await checkConnection();

    assert.ok(logOutput.some(msg => msg.includes('✅ AWS Credentials: Valid')));
    assert.ok(errorOutput.some(msg => msg.includes('❌ EC2 Connection Error: EC2 Denied')));
    assert.ok(logOutput.some(msg => msg.includes('✅ Secrets Manager: Connected')));
  });

  it('should log error if Secrets Manager fails', async () => {
    stsMock.on(GetCallerIdentityCommand).resolves({ Account: '123', Arn: 'arn' });
    ec2Mock.on(DescribeInstancesCommand).resolves({});
    secretsMock.on(ListSecretsCommand).rejects(new Error('Secrets Denied'));

    await checkConnection();

    assert.ok(logOutput.some(msg => msg.includes('✅ EC2 Service: Connected')));
    assert.ok(errorOutput.some(msg => msg.includes('❌ Secrets Manager Connection Error: Secrets Denied')));
  });
});
