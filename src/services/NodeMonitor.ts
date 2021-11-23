import * as winston from 'winston';
import { HTTP } from '@src/services/Http';
import { DataBase } from '@src/services/DataBase';
import { HostInfo } from '@src/services/HostInfo';
import { ApiNodeService } from '@src/services/ApiNodeService';
import { PeerNodeService } from '@src/services/PeerNodeService';
import { NodesStats } from '@src/services/NodesStats';
import { TimeSeriesService } from '@src/services/TimeSeriesService';
import { NodeCountSeries, NodeCountSeriesDay } from '@src/models/NodeCountSeries';
import { AbstractTimeSeries, AbstractTimeSeriesDocument } from '@src/models/AbstractTimeSeries';
import { memoryCache } from '@src/services/MemoryCache';
import { Logger } from '@src/infrastructure';

import { INode, validateNodeModel } from '@src/models/Node';
import { symbol, monitor } from '@src/config';
import { isAPIRole, isPeerRole, basename, splitArray, sleep } from '@src/utils';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

export class NodeMonitor {
	private nodesStats: NodesStats;
	private nodeCountTimeSeriesService: TimeSeriesService<AbstractTimeSeries, AbstractTimeSeriesDocument>;
	private nodeList: INode[];
	private isRunning: boolean;
	private interval: number;
	private nodeInfoChunks: number;
	private nodeInfoDelay: number;
	private networkIdentifier: number;
	private generationHashSeed: string;

	constructor(_interval: number) {
		this.nodesStats = new NodesStats();
		this.nodeCountTimeSeriesService = new TimeSeriesService<AbstractTimeSeries, AbstractTimeSeriesDocument>(
			'average-round',
			NodeCountSeriesDay,
			NodeCountSeries,
		);
		this.nodeList = [];
		this.isRunning = false;
		this.interval = _interval || 300000;
		this.nodeInfoChunks = monitor.NUMBER_OF_NODE_REQUEST_CHUNK;
		this.nodeInfoDelay = 1000;
		this.networkIdentifier = 0;
		this.generationHashSeed = '';

		this.cacheCollection();
	}

	public init = async () => {
		await this.nodeCountTimeSeriesService.init();
		return this;
	};

	public start = async () => {
		logger.info(`Start`);
		try {
			this.isRunning = true;
			this.clear();

			await this.getNetworkInfo(); // Read network Type and generated hash seed from provided nodes.

			await this.getNodeList(); // Fetch node from peers
			await this.getNodeListInfo();

			if (this.isRunning) {
				await this.updateCollection();
				await this.cacheCollection();
				setTimeout(() => this.start(), this.interval);
			}
		} catch (e) {
			logger.error(`Unhandled error during a loop. ${e.message}. Restarting NodeMonitor..`);
			this.stop();
			this.start();
		}
	};

	public stop = () => {
		logger.info(`Stop`);
		this.isRunning = false;
		this.clear();
	};

	private getNodeList = async (): Promise<any> => {
		logger.info(`Getting node list`);

		// Fetch node list from config nodes
		for (const nodeUrl of symbol.NODES) {
			const peers = await this.fetchNodePeersByURL(nodeUrl);

			this.addNodesToList(peers);
		}

		// Nested fetch node list from current nodeList[]
		const nodeListPromises = this.nodeList.map(async (node) => {
			if (isAPIRole(node.roles)) {
				const hostUrl = await ApiNodeService.buildHostUrl(node.host);

				return this.fetchNodePeersByURL(hostUrl);
			}

			return [];
		});

		const arrayOfNodeList = await Promise.all(nodeListPromises);
		const nodeList: INode[] = arrayOfNodeList.reduce((accumulator, value) => accumulator.concat(value), []);

		this.addNodesToList(nodeList);

		return Promise.resolve();
	};

	/**
	 * Fetch nodes from peers.
	 * @param hostUrl
	 * @returns INode[]
	 */
	private fetchNodePeersByURL = async (hostUrl: string): Promise<Array<INode>> => {
		let nodeList: INode[] = [];

		try {
			const nodePeers = await HTTP.get(hostUrl + '/node/peers', {
				timeout: monitor.REQUEST_TIMEOUT,
			});

			if (Array.isArray(nodePeers.data)) nodeList = [...nodePeers.data];
		} catch (e) {
			logger.error(`FetchNodePeersByURL. Failed to get /node/peers from "${hostUrl}". ${e.message}`);
		}

		return nodeList;
	};

	private getNodeListInfo = async () => {
		logger.info(`Getting node from peers total ${this.nodeList.length} nodes`);
		const nodeListChunks = splitArray(this.nodeList, this.nodeInfoChunks);

		this.nodeList = [];

		for (const nodes of nodeListChunks) {
			logger.info(`Getting node info for chunk of ${nodes.length} nodes`);

			const nodeInfoPromises = [...nodes].map((node) => this.getNodeInfo(node));

			this.addNodesToList((await Promise.all(nodeInfoPromises)) as INode[]);
			await sleep(this.nodeInfoDelay);
		}
		this.nodeList.forEach((node) => this.nodesStats.addToStats(node));
	};

	private async getNodeInfo(node: INode): Promise<INode> {
		let nodeWithInfo: INode = { ...node };

		try {
			const hostDetail = await HostInfo.getHostDetailCached(node.host);

			if (hostDetail) nodeWithInfo.hostDetail = hostDetail;

			if (isPeerRole(nodeWithInfo.roles)) {
				nodeWithInfo.peerStatus = await PeerNodeService.getStatus(node.host, node.port);
			}

			if (isAPIRole(nodeWithInfo.roles)) {
				const hostUrl = await ApiNodeService.buildHostUrl(nodeWithInfo.host);

				// Get node info and overwrite info from /node/peers
				const nodeStatus = await ApiNodeService.getNodeInfo(hostUrl);

				if (nodeStatus) {
					Object.assign(nodeWithInfo, nodeStatus);
				}

				// Request API Status, if node belong to the network
				if (
					nodeWithInfo.networkIdentifier === this.networkIdentifier &&
					nodeWithInfo.networkGenerationHashSeed === this.generationHashSeed
				) {
					nodeWithInfo.apiStatus = await ApiNodeService.getStatus(hostUrl);
				}
			}
		} catch (e) {
			logger.error(`GetNodeInfo. Failed to fetch info for "${nodeWithInfo.host}". ${e.message}`);
		}

		return nodeWithInfo;
	}

	private clear = () => {
		logger.info(`Clear`);
		this.nodeList = [];
		this.nodesStats.clear();
	};

	private updateCollection = async (): Promise<any> => {
		this.nodeCountTimeSeriesService.setData({
			date: new Date(),
			values: {
				...this.nodesStats.nodeTypes,
				total: this.nodesStats.getTotal(),
			},
		});
		if (this.nodeList.length > 0) {
			logger.info(`Update collection`);
			const prevNodeList = await DataBase.getNodeList();

			try {
				await DataBase.updateNodeList(this.nodeList);
				await DataBase.updateNodesStats(this.nodesStats);
			} catch (e) {
				logger.error(`Failed to update collection. ${e.message}`);
				await DataBase.updateNodeList(prevNodeList);
			}
		} else logger.error(`Failed to update collection. Collection length = ${this.nodeList.length}`);
	};

	private cacheCollection = async (): Promise<any> => {
		try {
			const nodeList = await DataBase.getNodeList();

			memoryCache.set('nodeList', nodeList);
		} catch (e) {
			logger.error('Failed to cache Node collection to memory. ' + e.message);
		}
	};

	private getNetworkInfo = async (): Promise<void> => {
		for (const nodeUrl of symbol.NODES) {
			const url = new URL(nodeUrl);
			const hostUrl = await ApiNodeService.buildHostUrl(url.hostname);

			const nodeInfo = await ApiNodeService.getNodeInfo(hostUrl);

			if (nodeInfo) {
				this.networkIdentifier = nodeInfo.networkIdentifier;
				this.generationHashSeed = nodeInfo.networkGenerationHashSeed;
				logger.info(`Found network identifier ${nodeInfo.networkIdentifier}`);
				logger.info(`Found network hash ${nodeInfo.networkGenerationHashSeed}`);
				return;
			}
		}

		logger.info(`Network identifier not found in ${symbol.NODES}, using default ${this.networkIdentifier}`);
	};

	private addNodesToList = (nodes: INode[]) => {
		nodes.forEach((node: INode) => {
			if (
				node.networkIdentifier !== this.networkIdentifier ||
				node.networkGenerationHashSeed !== this.generationHashSeed ||
				!!this.nodeList.find((addedNode) => addedNode.publicKey === node.publicKey) ||
				!validateNodeModel(node)
			)
				return;

			this.nodeList.push(node);
		});
	};
}
