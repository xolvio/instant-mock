import chalk from 'chalk';

class Logger {
  // @ts-expect-error TODO fix types
  info(message, seedGroupId) {
    console.log(chalk.blue(this.formatMessage(message, seedGroupId)));
  }

  // @ts-expect-error TODO fix types
  warning(message, seedGroupId) {
    console.log(chalk.yellow(this.formatMessage(message, seedGroupId)));
  }

  // @ts-expect-error TODO fix types
  error(message, seedGroupId) {
    console.log(chalk.red(this.formatMessage(message, seedGroupId)));
  }

  // @ts-expect-error TODO fix types
  private formatMessage(message, seedGroupId): string {
    return `[${this.formatTimestamp()} | seedGroupId: ${seedGroupId}]: ${message}`;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }
}

export default new Logger();
