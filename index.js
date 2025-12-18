#!/usr/bin/env node

import displayHelp from "./commands/help.js";
import loadEnv from "./commands/load-env.js";
import connectToEC2 from "./commands/remote.js";

const command = process.argv[2];

switch (command) {
  case 'load-env':
  case '--load-env':
  case '-l':
    console.log('\x1b[36m%s\x1b[0m', '🚀 Initializing environment synchronization...');
    loadEnv().catch(err => {
      console.error('\x1b[31m%s\x1b[0m', `❌ Execution failed: ${err.message}`);
      process.exit(1);
    });
    break;

  case 'help':
  case '--help':
  case '-h':
  case undefined: // กรณีพิมพ์แค่ npx tbit เฉยๆ
    displayHelp();
    break;

  case 'version':
  case '--version':
  case '-v':
    console.log(`tbit v${process.env.npm_package_version || '1.0.0'}`);
    break;

  case 'remote':
  case '--remote':
  case '-r':
    console.log('\x1b[36m%s\x1b[0m', '🚀 Initializing remote environment synchronization...');
    connectToEC2().catch(err => {
      console.error('\x1b[31m%s\x1b[0m', `❌ Execution failed: ${err.message}`);
      process.exit(1);
    });
    break;

  default:
    console.log('\x1b[31m%s\x1b[0m', `Error: Unknown command "${command}"`);
    displayHelp();
    process.exit(1);
}