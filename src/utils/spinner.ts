import ora from "ora";
import chalk from "chalk";

const spinner = ora();

const start = (msg: string) => {
  spinner.text = chalk.blue(msg);
  spinner.start();
};

const success = (msg: string) => {
  spinner.stopAndPersist({
    symbol: chalk.green('✔'),
    text: chalk.green(msg),
  });
};

const stop = () => {
  spinner.stop();
};

const error = (msg: string) => {
  spinner.fail(chalk.red(msg));
};

export const Spinner = {
  start,
  stop,
  success,
  error
}