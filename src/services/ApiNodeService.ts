import { HTTP } from '@src/services/Http';
import * as winston from 'winston';
import { basename } from '@src/utils';
import { Logger } from '@src/infrastructure';
import { WebSocket } from 'ws';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

interface NodeStatus {
	apiNode: string;
	db: string;
}

interface FinalizedBlock {
	height: number;
	epoch: number;
	point: number;
	hash: string;
}

interface WebSocketStatus {
	isAvailable: boolean;
	wss: boolean;
	url: string | undefined;
}

export interface ApiStatus {
	webSocket?: WebSocketStatus;
	restGatewayUrl: string;
	isAvailable: boolean;
	isHttpsEnabled?: boolean;
	nodeStatus?: NodeStatus;
	chainHeight?: number;
	finalization?: FinalizedBlock;
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
			const protocol = isHttps ? 'https:' : 'http:';
			const port = isHttps ? 3001 : 3000;

			logger.info(`Getting node status for: ${protocol}//${host}:${port}`);

			const [nodeInfo, chainInfo, nodeServer, nodeHealth] = await Promise.all([
				ApiNodeService.getNodeInfo(host, port, protocol),
				ApiNodeService.getNodeChainInfo(host, port, protocol),
				ApiNodeService.getNodeServer(host, port, protocol),
				ApiNodeService.getNodeHealth(host, port, protocol),
			]);

			const webSocketStatus = await ApiNodeService.webSocketStatus(host, isHttps);

			let apiStatus = {
				restGatewayUrl: `${protocol}//${host}:${port}`,
				isAvailable: true,
				lastStatusCheck: Date.now(),
			};

			if (webSocketStatus) {
				Object.assign(apiStatus, {
					webSocket: webSocketStatus,
				});
			}

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
					finalization: {
						height: Number(chainInfo.latestFinalizedBlock.height),
						epoch: chainInfo.latestFinalizedBlock.finalizationEpoch,
						point: chainInfo.latestFinalizedBlock.finalizationPoint,
						hash: chainInfo.latestFinalizedBlock.hash,
					},
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
				restGatewayUrl: `http://${host}:3000`,
				webSocket: {
					isAvailable: false,
					wss: false,
					url: undefined,
				},
				isAvailable: false,
				lastStatusCheck: Date.now(),
			};
		}
	};

	static getNodeInfo = async (host: string, port: number, protocol: string): Promise<NodeInfo | null> => {
		try {
			return (await HTTP.get(`${protocol}//${host}:${port}/node/info`)).data;
		} catch (e) {
			logger.error(`Fail to request /node/info: ${host}`, e);
			return null;
		}
	};

	static getNodeChainInfo = async (host: string, port: number, protocol: string): Promise<ChainInfo | null> => {
		try {
			return (await HTTP.get(`${protocol}//${host}:${port}/chain/info`)).data;
		} catch (e) {
			logger.error(`Fail to request /chain/info: ${host}`, e);
			return null;
		}
	};

	static getNodeServer = async (host: string, port: number, protocol: string): Promise<ServerInfo | null> => {
		try {
			const nodeServerInfo = (await HTTP.get(`${protocol}//${host}:${port}/node/server`)).data;

			return nodeServerInfo.serverInfo;
		} catch (e) {
			logger.error(`Fail to request /node/server: ${host}`, e);
			return null;
		}
	};

	static getNodeHealth = async (host: string, port: number, protocol: string): Promise<NodeStatus | null> => {
		try {
			const health = (await HTTP.get(`${protocol}//${host}:${port}/node/health`)).data;

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

	/**
	 * Get the heartbeat of the web socket connection
	 * @param host - host domain
	 * @param port - websocket port
	 * @param protocol - websocket protocal wss or ws
	 * @param timeout - default 1000
	 * @returns boolean
	 */
	static checkWebSocketHealth = async (host: string, port: number, protocol: string, timeout = 1000): Promise<boolean> => {
		return new Promise((resolve) => {
			const clientWS = new WebSocket(`${protocol}//${host}:${port}/ws`, {
				timeout,
			});

			clientWS.on('open', () => {
				resolve(true);
			});

			clientWS.on('error', (e) => {
				logger.error(`Fail to request web socket heartbeat: ${protocol}//${host}:${port}/ws`, e);
				resolve(false);
			});
		});
	};

	/**
	 * Get the status of the web socket connection
	 * @param host - host domain
	 * @param isHttp - ssl enable flag
	 * @returns WebSocketStatus
	 */
	static webSocketStatus = async (host: string, isHttp?: boolean): Promise<WebSocketStatus> => {
		let webSocketUrl = undefined;
		let wssHealth = false;

		if (isHttp) {
			wssHealth = await ApiNodeService.checkWebSocketHealth(host, 3001, 'wss:');
		}

		if (wssHealth) {
			webSocketUrl = `wss://${host}:3001/ws`;
		} else {
			const wsHealth = await ApiNodeService.checkWebSocketHealth(host, 3000, 'ws:');

			webSocketUrl = wsHealth ? `ws://${host}:3000/ws` : undefined;
		}

		return {
			isAvailable: webSocketUrl ? true : false,
			wss: wssHealth,
			url: webSocketUrl,
		};
	};
}
