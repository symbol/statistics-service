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

import { INode } from '@src/models/Node';
import { symbol, monitor } from '@src/config';
import { isAPIRole, isPeerRole, getNodeURL, basename } from '@src/utils';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

export class NodeMonitor {
	private nodesStats: NodesStats;
	private nodeCountTimeSeriesService: TimeSeriesService<AbstractTimeSeries, AbstractTimeSeriesDocument>; 
	private nodeList: INode[];
	private isRunning: boolean;
	private interval: number;

	constructor(_interval: number) {
		this.nodesStats = new NodesStats();
		this.nodeCountTimeSeriesService = new TimeSeriesService<AbstractTimeSeries, AbstractTimeSeriesDocument>(
			'average',
			NodeCountSeriesDay,
			NodeCountSeries
		);
		this.nodeList = [];
		this.isRunning = false;
		this.interval = _interval || 300000;
		this.cacheCollection();
	}

	public start = async () => {
		logger.info(`Start`);
		try {
			this.isRunning = true;
			this.clear();

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
		let counter = 0;

		for (const nodeUrl of symbol.NODES) {
			counter++;
			const peers = await this.fetchNodesByURL(nodeUrl);

			this.addNodesToList(peers);
		}

		// Nested fetch node list from current nodeList[]
		const nodeListPromises = this.nodeList.map(async (node) => {
			if (isAPIRole(node.roles)) return this.fetchNodesByURL(getNodeURL(node, monitor.API_NODE_PORT));

			return [];
		});

		const arrayOfNodeList = await Promise.all(nodeListPromises);
		const nodeList: INode[] = arrayOfNodeList.reduce((accumulator, value) => accumulator.concat(value), []);

		this.addNodesToList(nodeList);

		return Promise.resolve();
	};

	private fetchNodesByURL = async (nodeUrl: string): Promise<Array<INode>> => {
		try {
			const nodeList = await HTTP.get(nodeUrl + '/node/peers', {
				timeout: monitor.REQUEST_TIMEOUT,
			});

			if (Array.isArray(nodeList.data)) return nodeList.data;
		} catch (e) {}
		return [];
	};

	private getNodeListInfo = async () => {
		logger.info(`Getting node info for ${this.nodeList.length} nodes`);
		const nodeInfoPromises = this.nodeList.map(this.getNodeInfo);

		this.nodeList = await Promise.all(nodeInfoPromises);
		this.nodeList.forEach((node) => this.nodesStats.addToStats(node));
	};

	private async getNodeInfo(node: INode): Promise<INode> {
		let nodeWithInfo: INode = { ...node };

		try {
			nodeWithInfo.rewardPrograms = [];

			const hostDetail = await HostInfo.getHostDetailCached(node.host);

			if (hostDetail) nodeWithInfo.hostDetail = hostDetail;

			if (isPeerRole(node.roles)) nodeWithInfo.peerStatus = await PeerNodeService.getStatus(node.host, node.port);

			if (isAPIRole(node.roles)) {
				nodeWithInfo.apiStatus = await ApiNodeService.getStatus(node.host, monitor.API_NODE_PORT);

				if (nodeWithInfo.apiStatus?.nodePublicKey)
					nodeWithInfo.rewardPrograms = await NodeRewards.getNodeRewardPrograms(nodeWithInfo.apiStatus.nodePublicKey);
			}
		} catch (e) {
			logger.error(`failed to get info. ${e.message}`);
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
			values: [{
				name: 'name',
				value: Math.round(Math.random() * 100)
			}]
		})
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

	private addNodesToList = (nodes: INode[]) => {
		nodes.forEach((node: INode) => {
			if (!!this.nodeList.find((addedNode) => addedNode.publicKey === node.publicKey)) return;
			this.nodeList.push(node);
		});
	};
}
