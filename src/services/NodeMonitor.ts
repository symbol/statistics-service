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
import { isAPIRole, isPeerRole, basename, showDuration, runTaskInChunks } from '@src/utils';
import humanizeDuration = require('humanize-duration');
import { Constants } from '@src/constants';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

export class NodeMonitor {
	private nodesStats: NodesStats;
	private nodeCountTimeSeriesService: TimeSeriesService<AbstractTimeSeries, AbstractTimeSeriesDocument>;
	private nodeList: INode[];
	private isRunning: boolean;
	private interval: number;
	private nodeInfoChunks: number;
	private nodePeersChunkSize: number;
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
		this.nodePeersChunkSize = monitor.NODE_PEERS_REQUEST_CHUNK_SIZE;
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
		const startTime = new Date().getTime();

		try {
			this.isRunning = true;
			this.clear();

			await this.fetchAndSetNetworkInfo(); // Read network Type and generated hash seed from provided nodes.

			await this.getNodeList(); // Fetch node from peers
			await this.getNodeListInfo();

			if (this.isRunning) {
				await this.updateCollection();
				await this.cacheCollection();
				setTimeout(() => this.start(), this.interval);
			}
			logger.info(`[start] Node monitor task finished, time elapsed: [${showDuration(startTime - new Date().getTime())}]`);
		} catch (e) {
			logger.error(
				`[start] Node monitor task failed [error: ${e.message}], time elapsed: [${showDuration(
					startTime - new Date().getTime(),
				)}], Restarting Node monitor task...`,
			);
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
		logger.info(`[getNodeList] Getting node list...`);
		const startTime = new Date().getTime();

		// Fetch node list from config nodes
		logger.info(`[getNodeList] Initial node list: ${symbol.NODES.join(', ')}`);
		for (const nodeUrl of symbol.NODES) {
			const peers = await this.fetchNodePeersByURL(nodeUrl);

			this.addNodesToList(peers);
		}

		// Fetch node list from database
		const nodesFromDb = (await DataBase.getNodeList().then((nodes) => nodes.map((n) => n.toJSON()))) || [];

		logger.info(`[getNodeList] Nodes count from DB: ${nodesFromDb.length}`);
		// adding the nodes from DB to the node list
		this.addNodesToList(nodesFromDb);

		await this.fetchAndAddNodeListPeers();

		logger.info(
			`[getNodeList] Total node count: ${this.nodeList.length}, time elapsed: [${showDuration(startTime - new Date().getTime())}]`,
		);
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
			logger.error(`[FetchNodePeersByURL] Failed to get /node/peers from "${hostUrl}". ${e.message}`);
		}

		return nodeList;
	};

	/**
	 * Fetch peers from current node list and add them to the node list.
	 */
	private fetchAndAddNodeListPeers = async (): Promise<void> => {
		const apiNodeList = this.nodeList.filter((node) => isAPIRole(node.roles));

		logger.info(
			`[fetchAndAddNodeListPeers] Getting peers from nodes, total nodes: ${this.nodeList.length}, api nodes: ${apiNodeList.length}`,
		);

		await runTaskInChunks(apiNodeList, this.nodePeersChunkSize, logger, 'fetchAndAddNodeListPeers', async (nodes) => {
			const arrayOfPeerList = await Promise.all(
				[...nodes].map(async (node) => this.fetchNodePeersByURL(await ApiNodeService.buildHostUrl(node.host))),
			);
			const peers: INode[] = arrayOfPeerList.reduce((accumulator, value) => accumulator.concat(value), []);

			this.addNodesToList(peers);
			return peers;
		});
	};

	private getNodeListInfo = async () => {
		const startTime = new Date().getTime();
		const nodeCount = this.nodeList.length;

		logger.info(`[getNodeListInfo] Getting node from peers, total nodes: ${nodeCount}`);

		await runTaskInChunks(this.nodeList, this.nodeInfoChunks, logger, 'getNodeListInfo', async (nodes) => {
			const nodeInfoPromises = [...nodes].map((node) => this.getNodeInfo(node));
			const arrayOfNodeInfo = await Promise.all(nodeInfoPromises);

			this.addNodesToList(arrayOfNodeInfo);
			return arrayOfNodeInfo;
		});

		this.nodeList.forEach((node) => this.nodesStats.addToStats(node));
		logger.info(
			`[getNodeListInfo] Total node count(after nodeInfo): ${this.nodeList.length}, time elapsed: [${showDuration(
				startTime - new Date().getTime(),
			)}]`,
		);
	};

	private async getNodeInfo(node: INode): Promise<INode> {
		let nodeWithInfo: INode = { ...node };
		const nodeHost = node.host;

		try {
			const hostDetail = await HostInfo.getHostDetailCached(nodeHost);

			if (hostDetail) {
				nodeWithInfo.hostDetail = hostDetail;
			}

			if (isPeerRole(nodeWithInfo.roles)) {
				nodeWithInfo.peerStatus = await PeerNodeService.getStatus(nodeHost, node.port);
			}

			if (isAPIRole(nodeWithInfo.roles)) {
				const hostUrl = await ApiNodeService.buildHostUrl(nodeHost);

				// Get node info and overwrite info from /node/peers
				const nodeStatus = await ApiNodeService.getNodeInfo(hostUrl);

				if (nodeStatus) {
					Object.assign(nodeWithInfo, nodeStatus);
					if (!nodeWithInfo.host) {
						nodeWithInfo.host = nodeHost;
					}
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
			logger.error(`[getNodeInfo] Failed to fetch info for "${nodeWithInfo.host}". ${e.message}`);
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

			this.nodeList = this.removeUnavailableNodes(this.nodeList);
			try {
				await DataBase.updateNodeList(this.nodeList);
				await DataBase.updateNodesStats(this.nodesStats);
			} catch (e) {
				logger.error(`Failed to update collection. ${e.message}`);
				await DataBase.updateNodeList(prevNodeList);
			}
		} else logger.error(`Failed to update collection. Collection length = ${this.nodeList.length}`);
	};

	private removeUnavailableNodes(nodes: INode[]): INode[] {
		const unavailableNodes = nodes.filter((n) => !this.checkNodeAvailable(n));

		logger.info(
			`[updateCollection] Removing unavailable nodes[${unavailableNodes
				.map((n) => n.host)
				.join(', ')}], available ones in the last ${humanizeDuration(
				monitor.KEEP_STALE_NODES_FOR_HOURS * Constants.TIME_UNIT_HOUR,
			)} are kept.`,
		);
		return nodes
			.filter((n) => !unavailableNodes.some((un) => un.publicKey === n.publicKey))
			.map((n) => ({ ...n, lastAvailable: new Date() }));
	}

	private checkNodeAvailable = (node: INode): boolean => {
		return !(
			isAPIRole(node.roles) &&
			!node.apiStatus?.isAvailable &&
			node.lastAvailable &&
			new Date().getTime() > node.lastAvailable.getTime() + monitor.KEEP_STALE_NODES_FOR_HOURS * 1000 * 60 * 60
		);
	};

	private async cacheCollection(): Promise<any> {
		try {
			const nodeList = await DataBase.getNodeList();

			memoryCache.set('nodeList', nodeList);
		} catch (e) {
			logger.error('Failed to cache Node collection to memory. ' + e.message);
		}
	}

	private async fetchAndSetNetworkInfo(): Promise<void> {
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
	}

	private addNodesToList = (nodes: INode[]) => {
		nodes.forEach((node: INode) => {
			if (
				node.networkIdentifier !== this.networkIdentifier ||
				node.networkGenerationHashSeed !== this.generationHashSeed ||
				!validateNodeModel(node)
			) {
				return;
			}
			const nodeInx = this.nodeList.findIndex((addedNode) => addedNode.publicKey === node.publicKey);

			if (nodeInx > -1) {
				// already in the list then update
				this.nodeList[nodeInx] = node;
			} else {
				this.nodeList.push(node);
			}
		});
	};
}
