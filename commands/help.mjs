const displayHelp = () => {
    console.log(`
\x1b[1m\x1b[34mTB-IT CLI Tool\x1b[0m \x1b[2mv${process.env.npm_package_version || '1.0.0'}\x1b[0m
Custom utilities for development workflow.

\x1b[1mUSAGE\x1b[0m
  $ npx tbit <command> [options]

\x1b[1mAVAILABLE COMMANDS\x1b[0m
  \x1b[32mload-env\x1b[0m    Fetch secrets from AWS Secrets Manager and sync to .env file
  \x1b[32mremote\x1b[0m      Connect to AWS EC2 instance
  \x1b[32mupdate-sgr\x1b[0m  Update AWS Security Group Rule (alias: -s)
  \x1b[32mhelp\x1b[0m        Display this help information

\x1b[1mOPTIONS\x1b[0m
  --version     Show CLI version
  --help        Show help for any command

\x1b[1mEXAMPLES\x1b[0m
  $ npx tbit load-env
  $ npx tbit --help
    `);
};

export default displayHelp;