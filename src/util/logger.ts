import chalk from 'chalk';

const log = {
  debug: `[${chalk.green('Debug')}]`,
  info: `[${chalk.blue('Info')}]`,
  error: `[${chalk.red('Error')}]`,
};

const logger = {
  debug: (...args: any) => {
    if (process.env.NODE_ENV === 'production') return;

    console.log(log.debug, ...args);
  },
  info: (...args: any) => console.log(log.info, ...args),
  error: (...args: any) => console.error(log.error, ...args),
};

export default logger;
