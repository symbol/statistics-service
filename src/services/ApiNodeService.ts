import { HTTP } from '@src/services/Http';
import * as winston from 'winston';
import { basename } from '@src/utils';
import { Logger } from '@src/infrastructure';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

interface NodeStatus {
	apiNode: string;
	db: string;
}

export interface ApiStatus {
	isAvailable: boolean;
	isHttpsEnabled?: boolean;
	nodeStatus?: NodeStatus;
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

export interface ServerInfo {
	restVersion: string;
	sdkVersion: string;
	deployment: {
		deploymentTool: string;
		deploymentToolVersion: string;
		lastUpdatedDate: string;
	};
}

export class ApiNodeService {
	static getStatus = async (host: string): Promise<ApiStatus> => {
		try {
			const isHttps = await ApiNodeService.isHttpsEnabled(host);
			const protocol = isHttps ? 'https' : 'http';
			const port = isHttps ? 3001 : 3000;

			logger.info(`Getting node status for: ${protocol}://${host}:${port}`);

			const [nodeInfo, chainInfo, nodeServer, nodeHealth] = await Promise.all([
				ApiNodeService.getNodeInfo(host, port, protocol),
				ApiNodeService.getNodeChainInfo(host, port, protocol),
				ApiNodeService.getNodeServer(host, port, protocol),
				ApiNodeService.getNodeHealth(host, port, protocol),
			]);

			let apiStatus = {
				isAvailable: true,
				lastStatusCheck: Date.now(),
			};

			if (nodeHealth) {
				Object.assign(apiStatus, {
					nodeStatus: nodeHealth,
				});
			}

			if (nodeInfo) {
				Object.assign(apiStatus, {
					isHttpsEnabled: isHttps,
					nodePublicKey: nodeInfo.nodePublicKey,
				});
			}

			if (chainInfo) {
				Object.assign(apiStatus, {
					chainHeight: chainInfo.height,
					finalizationHeight: chainInfo.latestFinalizedBlock.height,
				});
			}

			if (nodeServer) {
				Object.assign(apiStatus, {
					restVersion: nodeServer.restVersion,
				});
			}

			return apiStatus;
		} catch (e) {
			logger.error(`Fail to request host node status: ${host}`, e);
			return {
				isAvailable: false,
				lastStatusCheck: Date.now(),
			};
		}
	};

	static getNodeInfo = async (host: string, port: number, protocol = 'http'): Promise<NodeInfo | null> => {
		try {
			return (await HTTP.get(`${protocol}://${host}:${port}/node/info`)).data;
		} catch (e) {
			logger.error(`Fail to request /node/info: ${host}`, e);
			return null;
		}
	};

	static getNodeChainInfo = async (host: string, port: number, protocol = 'http'): Promise<ChainInfo | null> => {
		try {
			return (await HTTP.get(`${protocol}://${host}:${port}/chain/info`)).data;
		} catch (e) {
			logger.error(`Fail to request /chain/info: ${host}`, e);
			return null;
		}
	};

	static getNodeServer = async (host: string, port: number, protocol = 'http'): Promise<ServerInfo | null> => {
		try {
			return (await HTTP.get(`${protocol}://${host}:${port}/node/server`)).data as ServerInfo;
		} catch (e) {
			logger.error(`Fail to request /node/server: ${host}`, e);
			return null;
		}
	};

	static getNodeHealth = async (host: string, port: number, protocol = 'http'): Promise<NodeStatus | null> => {
		try {
			const health = (await HTTP.get(`${protocol}://${host}:${port}/node/health`)).data;

			return health.status;
		} catch (e) {
			logger.error(`Fail to request /node/health: ${host}`, e);
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
