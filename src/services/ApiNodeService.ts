import { HTTP } from '@src/services/Http';
import * as winston from 'winston';
import { basename } from '@src/utils';
import { Logger } from '@src/infrastructure';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

export interface ApiStatus {
	isAvailable: boolean;
	isHttpsEnabled?: boolean;
	chainHeight?: number;
	finalizationHeight?: number;
	nodePublicKey?: string;
	restVersion?: string;
	lastStatusCheck: number;
}

export interface NodeInfo {
	version: number;
	publicKey: string;
	networkGenerationHashSeed: string;
	roles: number;
	port: number;
	networkIdentifier: number;
	host: string;
	friendlyName: string;
	nodePublicKey: string;
}

export interface ChainInfo {
	scoreHigh: string;
	scoreLow: string;
	height: string;
	latestFinalizedBlock: {
		finalizationEpoch: number;
		finalizationPoint: number;
		height: string;
		hash: string;
	};
}

export class ApiNodeService {
	static getStatus = async (host: string, port: number): Promise<ApiStatus> => {
		// logger.info(`Getting api status for: ${host}`);

		try {
			const nodeInfo = (await HTTP.get(`http://${host}:${port}/node/info`)).data;
			const chainInfo = (await HTTP.get(`http://${host}:${port}/chain/info`)).data;
			const nodeServer = (await HTTP.get(`http://${host}:${port}/node/server`)).data;

			return {
				isAvailable: true,
				chainHeight: chainInfo.height,
				finalizationHeight: chainInfo.latestFinalizedBlock.height,
				nodePublicKey: nodeInfo.nodePublicKey,
				restVersion: nodeServer.serverInfo.restVersion,
				lastStatusCheck: Date.now(),
			};
		} catch (e) {
			return {
				isAvailable: false,
				lastStatusCheck: Date.now(),
			};
		}
	};

	static getNodeInfo = async (host: string, port: number): Promise<NodeInfo | null> => {
		try {
			return (await HTTP.get(`http://${host}:${port}/node/info`)).data;
		} catch (e) {
			return null;
		}
	};

	static getNodeChainInfo = async (host: string, port: number): Promise<ChainInfo | null> => {
		try {
			return (await HTTP.get(`http://${host}:${port}/chain/info`)).data;
		} catch (e) {
			return null;
		}
	};

	static isHttpsEnabled = async (host: string, port = 3001): Promise<boolean> => {
		try {
			await HTTP.get(`https://${host}:${port}/chain/info`);
			return true;
		} catch (e) {
			return false;
		}
	};
}
