import { INode } from '@src/models/Node';
import * as path from 'path';
import * as humanizeDuration from 'humanize-duration';
import winston = require('winston');

export const stringToArray = (str: string | undefined): Array<any> => {
	let result = null;

	try {
		if (typeof str === 'string') result = JSON.parse(str);
	} catch (e) {}
	return result;
};

export const isAPIRole = (roleType: number): boolean => {
	// https://github.com/nemtech/symbol-openapi/blob/2c3daf4ca50e5da43c6ab36706825c9599102b36/spec/core/node/schemas/RolesTypeEnum.yml#L10
	const RolesTypeEnum = [2, 3, 6, 7];

	return !!RolesTypeEnum.find((role) => role === roleType);
};
export const isPeerRole = (roleType: number): boolean => {
	// https://github.com/nemtech/symbol-openapi/blob/2c3daf4ca50e5da43c6ab36706825c9599102b36/spec/core/node/schemas/RolesTypeEnum.yml#L10
	const RolesTypeEnum = [1, 3, 5, 7];

	return !!RolesTypeEnum.find((role) => role === roleType);
};

export const getNodeURL = (node: INode, port: number): string => {
	return `http://${node.host}:${port}`;
};

export const sleep = (ms: number): Promise<any> => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

export const basename = (filename: string) => {
	return path.basename(filename, '.js');
};

export const parseArray = (array: any): Array<any> | null => {
	if (Array.isArray(array)) return array;

	if (typeof array === 'string') {
		try {
			const json = JSON.parse(array);

			if (Array.isArray(json)) return json;
		} catch (e) {
			return null;
		}
	}

	return null;
};

export const splitArray = (array: Array<any>, chunks: number): Array<any> =>
	array.reduce((all, one, i) => {
		const ch = Math.floor(i / chunks);

		all[ch] = [].concat(all[ch] || [], one);
		return all;
	}, []);

export const showDuration = (durationMs: number): string => {
	return humanizeDuration(durationMs);
};

export const runTaskInChunks = async <T>(
	list: T[],
	chunkSize: number,
	logger: winston.Logger,
	loggingMethod: string,
	asyncTask: (subList: T[]) => Promise<any[]>,
) => {
	if (!list?.length) {
		return [];
	}
	if (chunkSize < 1) {
		throw new Error(`Invalid chunkSize value[${chunkSize}]`);
	}
	const chunks: T[][] = splitArray(list, chunkSize);
	const listSize = list.length;

	logger.info(
		`[${loggingMethod}] Running the task for chunks, Total Size: ${listSize}, Chunk size: ${chunkSize}, Chunk count: ${Math.ceil(
			listSize / chunkSize,
		)}`,
	);

	let numOfNodesProcessed = 0,
		i = 0;

	for (const chunk of chunks) {
		logger.info(
			`[${loggingMethod}] Working on chunk #${++i}/${chunks.length}, size: ${
				chunk.length
			}, progress: ${numOfNodesProcessed}/${listSize}`,
		);
		const arrayOfTaskResults = await asyncTask(chunk);

		logger.info(`[${loggingMethod}] Number of results:${arrayOfTaskResults.length}  in the chunk of ${chunk.length}`);
		numOfNodesProcessed += chunk.length;
	}
};

export const splitByPredicate = <T>(predicate: (item: T) => boolean, arr: T[]): { filtered: T[]; unfiltered: T[] } => {
	return arr.reduce(
		(res, item: T) => {
			res[predicate(item) ? 'filtered' : 'unfiltered'].push(item);
			return res;
		},
		{ filtered: [] as T[], unfiltered: [] as T[] },
	);
};

class TimeoutTimer {
	private timeoutId?: NodeJS.Timeout;

	constructor(private timeoutMs: number, private timeoutVal: any, private logger: winston.Logger, private loggingMethod: string) {}

	public start(): Promise<any> {
		return new Promise(
			(resolve) =>
				(this.timeoutId = setTimeout(() => {
					this.logger.info(`[${this.loggingMethod}] Promise timeout reached, returning ${this.timeoutVal}`);
					resolve(this.timeoutVal);
				}, this.timeoutMs)),
		);
	}

	public stop(): void {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}
	}
}

export const promiseAllTimeout = (
	promises: Promise<any>[],
	timeout: number,
	logger: winston.Logger,
	loggingMethod: string,
	timeoutVal?: any,
): Promise<any> => {
	return Promise.all(
		promises.map(async (promise) => {
			const timer = new TimeoutTimer(timeout, timeoutVal, logger, loggingMethod);
			const result = await Promise.race([promise, timer.start()]);

			if (result !== timeoutVal) {
				// task promise resolved on time, let's stop timeout timer
				timer.stop();
			}
			return result;
		}),
	);
};
