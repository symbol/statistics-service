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
	static getStatus = async (hostUrl: string): Promise<ApiStatus> => {
		try {
			const { protocol, hostname } = new URL(hostUrl);
			const isHttps = protocol === 'https:';

			logger.info(`Getting node status for: ${hostUrl}`);

			let apiStatus: ApiStatus = {
				restGatewayUrl: `${hostUrl}`,
				isAvailable: false,
				isHttpsEnabled: isHttps,
				lastStatusCheck: Date.now(),
				webSocket: {
					isAvailable: false,
					wss: false,
					url: undefined,
				},
			};

			const chainInfo = await ApiNodeService.getNodeChainInfo(hostUrl);

			// Return default status, if we cannot get chain info
			if (!chainInfo) {
				return apiStatus;
			}

			const [nodeInfo, nodeServer, nodeHealth] = await Promise.all([
				ApiNodeService.getNodeInfo(hostUrl),
				ApiNodeService.getNodeServer(hostUrl),
				ApiNodeService.getNodeHealth(hostUrl),
			]);

			if (nodeInfo) {
				Object.assign(apiStatus, {
					nodePublicKey: nodeInfo.nodePublicKey,
				});
			}

			if (chainInfo) {
				Object.assign(apiStatus, {
					isAvailable: true,
					chainHeight: chainInfo.height,
					finalization: {
						height: Number(chainInfo.latestFinalizedBlock.height),
						epoch: chainInfo.latestFinalizedBlock.finalizationEpoch,
						point: chainInfo.latestFinalizedBlock.finalizationPoint,
						hash: chainInfo.latestFinalizedBlock.hash,
					},
				});
			}

			const webSocketStatus = await ApiNodeService.webSocketStatus(hostname, isHttps);

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

			if (nodeServer) {
				Object.assign(apiStatus, {
					restVersion: nodeServer.restVersion,
				});
			}

			return apiStatus;
		} catch (e) {
			logger.error(`Fail to request host node status: ${hostUrl}`, e);
			return {
				restGatewayUrl: `${hostUrl}`,
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

	static getNodeInfo = async (hostUrl: string): Promise<NodeInfo | null> => {
		try {
			return (await HTTP.get(`${hostUrl}/node/info`)).data;
		} catch (e) {
			logger.error(`[getNodeInfo] Fail to request /node/info: ${hostUrl}`, e);
			return null;
		}
	};

	static getNodeChainInfo = async (hostUrl: string): Promise<ChainInfo | null> => {
		try {
			return (await HTTP.get(`${hostUrl}/chain/info`)).data;
		} catch (e) {
			logger.error(`[getNodeChainInfo] Fail to request /chain/info: ${hostUrl}`, e);
			return null;
		}
	};

	static getNodeServer = async (hostUrl: string): Promise<ServerInfo | null> => {
		try {
			const nodeServerInfo = (await HTTP.get(`${hostUrl}/node/server`)).data;

			return nodeServerInfo.serverInfo;
		} catch (e) {
			logger.error(`[getNodeServer] Fail to request /node/server: ${hostUrl}`, e);
			return null;
		}
	};

	static getNodeHealth = async (hostUrl: string): Promise<NodeStatus | null> => {
		try {
			const health = (await HTTP.get(`${hostUrl}/node/health`)).data;

			return health.status;
		} catch (e) {
			logger.error(`[getNodeHealth] Fail to request /node/health: ${hostUrl}`, e);
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
	 * @param hostname - host domain
	 * @param isHttp - ssl enable flag
	 * @returns WebSocketStatus
	 */
	static webSocketStatus = async (hostname: string, isHttp?: boolean): Promise<WebSocketStatus> => {
		let webSocketUrl = undefined;
		let wssHealth = false;

		if (isHttp) {
			wssHealth = await ApiNodeService.checkWebSocketHealth(hostname, 3001, 'wss:');
		}

		if (wssHealth) {
			webSocketUrl = `wss://${hostname}:3001/ws`;
		} else {
			const wsHealth = await ApiNodeService.checkWebSocketHealth(hostname, 3000, 'ws:');

			webSocketUrl = wsHealth ? `ws://${hostname}:3000/ws` : undefined;
		}

		return {
			isAvailable: webSocketUrl ? true : false,
			wss: wssHealth,
			url: webSocketUrl,
		};
	};

	/**
	 * Check on protocol (https / http), and build url from hostname.
	 * @param hostname example: symbol.com
	 * @returns string example: https://symbol.com:3001
	 */
	static buildHostUrl = async (hostname: string): Promise<string> => {
		const isHttps = await ApiNodeService.isHttpsEnabled(hostname);
		const protocol = isHttps ? 'https:' : 'http:';
		const port = isHttps ? 3001 : 3000;

		return `${protocol}//${hostname}:${port}`;
	};
}
