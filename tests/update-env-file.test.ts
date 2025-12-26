import { test, describe, it, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import updateEnvFile from '../src/utils/update-env-file.js';

const TEST_ENV_PATH = path.join(process.cwd(), '.env.test');

describe('updateEnvFile Utility', () => {
  // Clear test file before each test
  beforeEach(() => {
    if (fs.existsSync(TEST_ENV_PATH)) {
      fs.unlinkSync(TEST_ENV_PATH);
    }
  });

  // Cleanup after all tests
  after(() => {
    if (fs.existsSync(TEST_ENV_PATH)) {
      fs.unlinkSync(TEST_ENV_PATH);
    }
  });

  it('should create a new file if it does not exist', () => {
    updateEnvFile(TEST_ENV_PATH, { TEST_KEY: 'test_value' });

    assert.ok(fs.existsSync(TEST_ENV_PATH));
    const content = fs.readFileSync(TEST_ENV_PATH, 'utf8');
    assert.match(content, /TEST_KEY="test_value"/);
  });

  it('should append new keys to an existing file', () => {
    // Setup initial file
    fs.writeFileSync(TEST_ENV_PATH, 'EXISTING_KEY="old_value"\n');

    updateEnvFile(TEST_ENV_PATH, { NEW_KEY: 'new_value' });

    const content = fs.readFileSync(TEST_ENV_PATH, 'utf8');
    assert.match(content, /EXISTING_KEY="old_value"/);
    assert.match(content, /NEW_KEY="new_value"/);
  });

  it('should update existing keys', () => {
    // Setup initial file
    fs.writeFileSync(TEST_ENV_PATH, 'UPDATE_KEY="old_value"\nOther="val"');

    updateEnvFile(TEST_ENV_PATH, { UPDATE_KEY: 'updated_value' });

    const content = fs.readFileSync(TEST_ENV_PATH, 'utf8');
    assert.match(content, /UPDATE_KEY="updated_value"/);
    assert.match(content, /Other="val"/);
  });

  it('should handle mixed operations (update and append)', () => {
    fs.writeFileSync(TEST_ENV_PATH, 'KEY1="val1"\nKEY2="val2"');

    updateEnvFile(TEST_ENV_PATH, {
      KEY1: 'new_val1',
      KEY3: 'val3'
    });

    const content = fs.readFileSync(TEST_ENV_PATH, 'utf8');
    assert.match(content, /KEY1="new_val1"/);
    assert.match(content, /KEY2="val2"/);
    assert.match(content, /KEY3="val3"/);
  });
});
