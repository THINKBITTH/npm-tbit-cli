import { describe, it, after, beforeEach } from 'node:test';
import { EnvInput } from '../src/utils/env-input.js';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

const TEST_ENV_FILE = '.env.test-input';
const TEST_ENV_PATH = path.join(process.cwd(), TEST_ENV_FILE);

describe('EnvInput Class', () => {

  beforeEach(() => {
    // Clean up test file
    if (fs.existsSync(TEST_ENV_PATH)) {
      fs.unlinkSync(TEST_ENV_PATH);
    }
    // Clean up env vars used in tests
    delete process.env.TEST_VAR_1;
    delete process.env.TEST_VAR_2;
    delete process.env.TEST_VAR_EXISTING;
  });

  after(() => {
    if (fs.existsSync(TEST_ENV_PATH)) {
      fs.unlinkSync(TEST_ENV_PATH);
    }
  });

  it('should return existing process.env value if available', async () => {
    process.env.TEST_VAR_EXISTING = 'existing_value';
    
    // Pass custom test file to avoid messing with real .env.secret
    const envInput = new EnvInput(TEST_ENV_FILE);
    
    // Mock rl to ensure it's not called (though logical flow prevents it)
    (envInput as any).rl.question = () => {
      assert.fail("Should not prompt user if env var exists");
    };

    const result = await envInput.get('TEST_VAR_EXISTING');
    assert.equal(result, 'existing_value');
    
    envInput.close();
  });

  it('should prompt user and save to file if env var is missing', async () => {
    const envInput = new EnvInput(TEST_ENV_FILE);
    
    // Mock user input
    (envInput as any).rl.question = (query: string, callback: (answer: string) => void) => {
      callback('user_provided_value');
    };

    const result = await envInput.get('TEST_VAR_1');
    
    // 1. Check returned value
    assert.equal(result, 'user_provided_value');
    
    // 2. Check if saved to file
    assert.ok(fs.existsSync(TEST_ENV_PATH), "File should be created");
    const content = fs.readFileSync(TEST_ENV_PATH, 'utf8');
    assert.match(content, /TEST_VAR_1="user_provided_value"/);
    
    // 3. Check if process.env is updated
    assert.equal(process.env.TEST_VAR_1, 'user_provided_value');

    envInput.close();
  });

  it('should use default value if user provides empty input', async () => {
    const envInput = new EnvInput(TEST_ENV_FILE);

    // Mock empty user input
    (envInput as any).rl.question = (query: string, callback: (answer: string) => void) => {
      callback(''); // User hits Enter
    };

    const result = await envInput.get('TEST_VAR_2', 'default_val');

    assert.equal(result, 'default_val');
    
    // Verify file and process.env
    const content = fs.readFileSync(TEST_ENV_PATH, 'utf8');
    assert.match(content, /TEST_VAR_2="default_val"/);
    assert.equal(process.env.TEST_VAR_2, 'default_val');

    envInput.close();
  });
});
