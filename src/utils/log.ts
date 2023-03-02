import chalk from "chalk";
import createLogger from "progress-estimator";
import path from "path";

let _logger: createLogger.ProgressEstimator | null = null;
export class Logger {
  static success(msg: string) {
    console.log(chalk.green(`✔${msg}`));
  }

  static info(msg: string) {
    console.log(chalk.blue(`⚠️${msg}`));
  }

  static error(msg: string) {
    console.log(chalk.red(`× ${msg}`));
  }

  static warning(msg: string) {
    console.log(chalk.yellow(`⚠️ ${msg}`));
  }

  static step(task: any, message: string, estimate?: number) {
    if (!_logger) {
      _logger = createLogger({
        storagePath: path.join(__dirname, ".progress-estimator"),
      });
    }

    return _logger(task, chalk.blue(message), {
      estimate,
    });
  }

  static async startStep(task: any, message: string, estimate = 1500) {
    const startTime = Date.now();
    console.log();
    console.log(chalk.blue("Some Tasks"));
    console.log();
    await Logger.step(task, message, estimate);
    const endTime = Date.now();
    const time = ((endTime - startTime) / 1000).toFixed(2);
    console.log();
    console.log(chalk.green(`✨ Done in ${time}s`));
    console.log();
  }
}
