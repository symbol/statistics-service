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

	static getLogger(name: string, fileTransport = true): winston.Logger {
		return winston.createLogger({
			format: winston.format.combine(winston.format.label({ label: name })),
			transports: [Logger.transportsConsole, ...(fileTransport ? [Logger.transportsFile] : [])],
		});
	}

	static logTemplate(info: winston.Logform.TransformableInfo): string {
		return `${info.timestamp} ${info.level}: [${info.label}] ${info.message}`;
	}
}
