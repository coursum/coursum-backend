import chalk from 'chalk';

const log = {
  info: `[${chalk.blue('Info')}]`,
  error: `[${chalk.red('Error')}]`,
};

const logger = {
  info: (...args: any) => console.log(log.info, ...args),
  error: (...args: any) => console.error(log.error, ...args),
};

export default logger;
