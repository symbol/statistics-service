import { HTTP } from '@src/services/Http';
import * as winston from 'winston';
import { basename } from '@src/utils';
import { Logger } from '@src/infrastructure';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

export interface ApiStatus {
	isAvailable: boolean;
	chainHeight?: number;
	finalizationHeight?: number;
	nodePublicKey?: string;
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

			return {
				isAvailable: true,
				chainHeight: chainInfo.height,
				finalizationHeight: chainInfo.latestFinalizedBlock.height,
				nodePublicKey: nodeInfo.nodePublicKey,
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
}
