import * as winston from 'winston';
import { HTTP } from '@src/services/Http';
import { DataBase } from '@src/services/DataBase';
import { HostInfo } from '@src/services/HostInfo';
import { ApiNodeService } from '@src/services/ApiNodeService';
import { PeerNodeService } from '@src/services/PeerNodeService';
import { NodeRewards } from '@src/services/NodeRewards';
import { NodesStats } from '@src/services/NodesStats';
import { TimeSeriesService } from '@src/services/TimeSeriesService';
import { NodeCountSeries, NodeCountSeriesDay } from '@src/models/NodeCountSeries';
import { AbstractTimeSeries, AbstractTimeSeriesDocument } from '@src/models/AbstractTimeSeries';
import { memoryCache } from '@src/services/MemoryCache';
import { Logger } from '@src/infrastructure';

import { INode, validateNodeModel } from '@src/models/Node';
import { symbol, monitor } from '@src/config';
import { isAPIRole, isPeerRole, getNodeURL, basename, splitArray, sleep } from '@src/utils';

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
		this.nodeInfoChunks = 500;
		this.nodeInfoDelay = 1000;
		this.networkIdentifier = 152; // default Testnet
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

			await this.getNetworkType(); // Read network Type from provided nodes.

			await this.getNodeList();
			await this.getNodeListInfo(); //HostInfo.getInfoForListOfNodes(this.nodeList);

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
		// Init fetch node list from config nodes
		logger.info(`Getting node list`);

		for (const nodeUrl of symbol.NODES) {
			const peers = await this.fetchNodesByURL(nodeUrl, true);

			this.addNodesToList(peers);
		}

		// Nested fetch node list from current nodeList[]
		const nodeListPromises = this.nodeList.map(async (node) => {
			if (isAPIRole(node.roles)) {
				this.fetchNodesByURL(getNodeURL(node, monitor.API_NODE_PORT));
			}

			return [];
		});

		const arrayOfNodeList = await Promise.all(nodeListPromises);
		const nodeList: INode[] = arrayOfNodeList.reduce((accumulator, value) => accumulator.concat(value), []);

		this.addNodesToList(nodeList);

		return Promise.resolve();
	};

	private fetchNodesByURL = async (nodeUrl: string, includeCurrent: boolean = false): Promise<Array<INode>> => {
		let nodeList = [];

		if (includeCurrent) {
			try {
				const nodeInfo = await HTTP.get(nodeUrl + '/node/info', {
					timeout: monitor.REQUEST_TIMEOUT,
				});
				const host = new URL(nodeUrl).hostname;

				nodeList.push({
					...nodeInfo.data,
					host,
				});
			} catch (e) {
				logger.error(`FetchNodesByURL. Failed to get /node/info from "${nodeUrl}". ${e.message}`);
			}
		}

		try {
			const nodePeers = await HTTP.get(nodeUrl + '/node/peers', {
				timeout: monitor.REQUEST_TIMEOUT,
			});

			if (Array.isArray(nodePeers.data)) nodeList = [...nodeList, ...nodePeers.data];
		} catch (e) {
			logger.error(`FetchNodesByURL. Failed to get /node/peers from "${nodeUrl}". ${e.message}`);
		}

		return nodeList;
	};

	private getNodeListInfo = async () => {
		logger.info(`Getting node info total for ${this.nodeList.length} nodes`);
		const nodeInfoPromises = [...this.nodeList].map(this.getNodeInfo);
		const nodeInfoPromisesChunks = splitArray(nodeInfoPromises, this.nodeInfoChunks);

		this.nodeList = [];

		for (const chunk of nodeInfoPromisesChunks) {
			logger.info(`Getting node info for chunk of ${chunk.length} nodes`);
			this.addNodesToList((await Promise.all(chunk)) as INode[]);
			await sleep(this.nodeInfoDelay);
		}
		this.nodeList.forEach((node) => this.nodesStats.addToStats(node));
	};

	private async getNodeInfo(node: INode): Promise<INode> {
		let nodeWithInfo: INode = { ...node };

		try {
			nodeWithInfo.rewardPrograms = [];

			const hostDetail = await HostInfo.getHostDetailCached(node.host);

			if (hostDetail) nodeWithInfo.hostDetail = hostDetail;

			if (isPeerRole(node.roles)) {
				nodeWithInfo.peerStatus = await PeerNodeService.getStatus(node.host, node.port);
			}

			if (isAPIRole(node.roles)) {
				nodeWithInfo.apiStatus = await ApiNodeService.getStatus(node.host);
			}

			if (nodeWithInfo.publicKey) {
				nodeWithInfo.rewardPrograms = await NodeRewards.getNodeRewardPrograms(nodeWithInfo.publicKey);
			}
		} catch (e) {
			logger.error(`GetNodeInfo. Failed to fetch info for "${node}". ${e.message}`);
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
				rand: Math.round(Math.random() * 1000),
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

	private getNetworkType = async (): Promise<void> => {
		for (const nodeUrl of symbol.NODES) {
			const url = new URL(nodeUrl);

			const nodeInfo = await ApiNodeService.getNodeInfo(url.hostname, Number(url.port || monitor.API_NODE_PORT));

			if (nodeInfo) {
				this.networkIdentifier = nodeInfo.networkIdentifier;
				logger.info(`Found network identifier ${nodeInfo.networkIdentifier}`);
				return;
			}
		}

		logger.info(`Network identifier not found in ${symbol.NODES}, using default ${this.networkIdentifier}`);
	};

	private addNodesToList = (nodes: INode[]) => {
		nodes.forEach((node: INode) => {
			if (
				node.networkIdentifier !== this.networkIdentifier ||
				!!this.nodeList.find((addedNode) => addedNode.publicKey === node.publicKey) ||
				!validateNodeModel(node)
			)
				return;

			this.nodeList.push(node);
		});
	};
}
