import chalk from 'chalk';

class Logger {
    // @ts-expect-error TODO fix types
    info(message, sequenceId) {
        console.log(chalk.blue(this.formatMessage(message, sequenceId)));
    }

    // @ts-expect-error TODO fix types
    warning(message, sequenceId) {
        console.log(chalk.yellow(this.formatMessage(message, sequenceId)));
    }

    // @ts-expect-error TODO fix types
    error(message, sequenceId) {
        console.log(chalk.red(this.formatMessage(message, sequenceId)));
    }

    // @ts-expect-error TODO fix types
    private formatMessage(message, sequenceId): string {
        return `[${this.formatTimestamp()} | sequenceId: ${sequenceId}]: ${message}`;
    }

    private formatTimestamp(): string {
        return new Date().toISOString();
    }
}

export default new Logger();
