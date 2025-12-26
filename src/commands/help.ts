const displayHelp = () => {
    console.log(`
\x1b[1m\x1b[34mTB-IT CLI Tool\x1b[0m \x1b[2mv${process.env.npm_package_version || '1.0.0'}\x1b[0m
Custom utilities for development workflow.

\x1b[1mUSAGE\x1b[0m
  $ npx tbit <command> [options]

\x1b[1mAVAILABLE COMMANDS\x1b[0m
  \x1b[32mload-env\x1b[0m     (-l) Fetch secrets from AWS Secrets Manager and sync to .env file
  \x1b[32mremote\x1b[0m       (-r) Connect to AWS EC2 instance via SSH
  \x1b[32mupdate-sgr\x1b[0m   (-s) Update Security Group Rule with your current public IP
  \x1b[32mhelp\x1b[0m         Display this help information

\x1b[1mINFO\x1b[0m
  * AWS environment validation is performed automatically before running commands.

\x1b[1mOPTIONS\x1b[0m
  -v, --version   Show CLI version
  -h, --help      Show help for any command

\x1b[1mEXAMPLES\x1b[0m
  $ npx tbit load-env
  $ npx tbit -s
  $ npx tbit remote
    `);
};

export default displayHelp;