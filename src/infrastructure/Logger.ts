import * as winston from 'winston';

export class Logger {
	static readonly transportsConsole = new winston.transports.Console({
		format: winston.format.combine(winston.format.timestamp(), winston.format.cli(), winston.format.printf(Logger.logTemplate)),
	});

	static readonly transportsFile = new winston.transports.File({
		format: winston.format.combine(winston.format.timestamp(), winston.format.printf(Logger.logTemplate)),
		level: 'error',
		filename: 'error.log',
	});

	static getLogger(name: string): winston.Logger {
		return winston.createLogger({
			format: winston.format.combine(winston.format.label({ label: name })),
			transports: [Logger.transportsConsole, Logger.transportsFile],
		});
	}

	static logTemplate(info: { level: string; message: string; [key: string]: any }): string {
		return `${info.timestamp} ${info.level}: [${info.label}] ${info.message}`;
	}
}
