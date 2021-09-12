import { HTTP } from '@src/services/Http';
import * as winston from 'winston';
import { basename, isVotingRole } from '@src/utils';
import { Logger } from '@src/infrastructure';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

interface FinalizedBlock {
	height: number;
	epoch: number;
	point: number;
	hash: string;
}

interface VotingKey {
	publicKey: string;
	startEpoch: number;
	endEpoch: number;
}

export interface ApiStatus {
	isHttpsEnabled?: boolean;
	isAvailable: boolean;
	chainHeight?: number;
	finalizedBlock?: FinalizedBlock;
	nodePublicKey?: string;
	restVersion?: string;
	votingKeys?: VotingKey[];
	delegatedAccounts?: string[];
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
	static getStatus = async (host: string, port: number): Promise<ApiStatus> => {
		// logger.info(`Getting api status for: ${host}`);
		try {
			const [nodeInfo, chainInfo, nodeServer, delegatedHarvesting, isHttpsEnabled] = await Promise.all([
				ApiNodeService.getNodeInfo(host, port),
				ApiNodeService.getNodeChainInfo(host, port),
				ApiNodeService.getNodeServer(host, port),
				ApiNodeService.getNodeUnlockedAccounts(host, port),
				ApiNodeService.isHttpsEnabled(host),
			]);

			let status: ApiStatus = {
				isHttpsEnabled,
				isAvailable: true,
				lastStatusCheck: Date.now(),
			};

			if (nodeInfo) {
				status.nodePublicKey = nodeInfo.nodePublicKey;
				if (isVotingRole(nodeInfo.roles)) {
					status.votingKeys = await ApiNodeService.getAccountVotingKeys(host, port, nodeInfo.publicKey);
				}
			}

			if (chainInfo) {
				status.chainHeight = Number(chainInfo?.height);
				status.finalizedBlock = {
					height: Number(chainInfo.latestFinalizedBlock.height),
					epoch: chainInfo.latestFinalizedBlock.finalizationEpoch,
					point: chainInfo.latestFinalizedBlock.finalizationPoint,
					hash: chainInfo.latestFinalizedBlock.hash,
				};
			}

			if (nodeServer) {
				status.restVersion = nodeServer.restVersion;
			}

			if (delegatedHarvesting) {
				status.delegatedAccounts = delegatedHarvesting;
			}

			return status;
		} catch (e) {
			return {
				isAvailable: false,
				lastStatusCheck: Date.now(),
			};
		}
	};

	static getNodeInfo = async (host: string, port: number): Promise<NodeInfo | null> => {
		try {
			return (await HTTP.get(`http://${host}:${port}/node/info`)).data as NodeInfo;
		} catch (e) {
			return null;
		}
	};

	static getNodeChainInfo = async (host: string, port: number): Promise<ChainInfo | null> => {
		try {
			return (await HTTP.get(`http://${host}:${port}/chain/info`)).data as ChainInfo;
		} catch (e) {
			return null;
		}
	};

	static getNodeServer = async (host: string, port: number): Promise<ServerInfo | null> => {
		try {
			return (await HTTP.get(`http://${host}:${port}/node/server`)).data as ServerInfo;
		} catch (e) {
			return null;
		}
	};

	static getNodeUnlockedAccounts = async (host: string, port: number): Promise<string[]> => {
		try {
			return (await HTTP.get(`http://${host}:${port}/node/unlockedaccount`)).data.unlockedAccount;
		} catch (e) {
			return [];
		}
	};

	static getAccountVotingKeys = async (host: string, port: number, publicKey: string): Promise<VotingKey[]> => {
		try {
			const accountInfo = (await HTTP.get(`http://${host}:${port}/accounts/${publicKey}`)).data;

			return accountInfo.account.supplementalPublicKeys.voting.publicKeys || [];
		} catch (e) {
			return [];
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
