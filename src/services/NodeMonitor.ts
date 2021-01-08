import * as winston from 'winston';
import Axios from 'axios';
import { DataBase } from '@src/services/DataBase';
import { HostInfo } from '@src/services/HostInfo';
import { ApiNodeService } from '@src/services/ApiNodeService';
import { PeerNodeService } from '@src/services/PeerNodeService';
import { NodeRewards } from '@src/services/NodeRewards';
import { NodesStats } from '@src/services/NodesStats';
import { memoryCache } from '@src/services/MemoryCache';
import { Logger } from '@src/infrastructure';

import { INode } from '@src/models/Node';
import { symbol, monitor } from '@src/config';
import { isAPIRole, isPeerRole, getNodeURL, basename } from '@src/utils';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

export class NodeMonitor {
	private nodesStats: NodesStats;
	private nodeList: INode[];
	private isRunning: boolean;
	private interval: number;

	constructor(_interval: number) {
		this.nodesStats = new NodesStats();
		this.nodeList = [];
		this.isRunning = false;
		this.interval = _interval || 300000;
	}

	public start = async () => {
		this.isRunning = true;
		this.clear();

		await this.getNodeList();
		await this.getNodeListInfo(); //HostInfo.getInfoForListOfNodes(this.nodeList);

		if (this.isRunning) {
			await this.updateCollection();
			setTimeout(() => this.start(), this.interval);
		}
	};

	public stop = () => {
		this.isRunning = false;
		this.clear();
	};

	private getNodeList = async (): Promise<any> => {
		// Init fetch node list from config nodes
		let counter = 0;

		for (const nodeUrl of symbol.NODES) {
			counter++;
			logger.info(`Fetching node (initial): ${counter} ${nodeUrl}`);
			const peers = await this.fetchNodesByURL(nodeUrl);

			this.addNodesToList(peers);
		}

		// Nested fetch node list from current nodeList[]
		for (const node of this.nodeList) {
			if (isAPIRole(node.roles)) {
				counter++;
				logger.info(`Fetching node: ${counter} ${node.host}`);
				const peers = await this.fetchNodesByURL(getNodeURL(node, monitor.API_NODE_PORT));

				this.addNodesToList(peers);
			}
			//if(counter > 1) break;
		}

		return Promise.resolve();
	};

	private fetchNodesByURL = async (nodeUrl: string): Promise<Array<INode>> => {
		try {
			const nodeList = await Axios.get(nodeUrl + '/node/peers', {
				timeout: monitor.REQUEST_TIMEOUT,
			});

			if (Array.isArray(nodeList.data)) return nodeList.data;
		} catch (e) {}
		return [];
	};

	private getNodeListInfo = async () => {
		const nodesWithInfo: INode[] = [];
		const nodes: INode[] = this.nodeList;
		let counter = 0;

		for (let node of nodes) {
			let nodeWithInfo: INode = { ...node };
			counter++;
			logger.info(`Getting info for: ${counter} ${node.host}`);

			try {
				const hostDetail = await HostInfo.getHostDetail(node.host);
				nodeWithInfo.rewardPrograms = [];

				nodeWithInfo = {
					...nodeWithInfo,
					...hostDetail,
				};

				if (isPeerRole(node.roles))
					nodeWithInfo.peerStatus = await PeerNodeService.getStatus(node.host, node.port);
				if (isAPIRole(node.roles)) {
					nodeWithInfo.apiStatus = await ApiNodeService.getStatus(node.host, monitor.API_NODE_PORT);
					if (nodeWithInfo.apiStatus?.nodePublicKey)
						nodeWithInfo.rewardPrograms = await NodeRewards.getInfo(nodeWithInfo.apiStatus.nodePublicKey);
				}

				this.nodesStats.addToStats(nodeWithInfo);
			}
			catch(e) {
				logger.error(`failed to get info. ${e.message}`);
			}

			nodesWithInfo.push(nodeWithInfo);
			//if(counter == 10) break;
		}

		this.nodeList = nodesWithInfo;
	}

	private clear = () => {
		this.nodeList = [];
		this.nodesStats.clear();
	};

	private updateCollection = async (): Promise<any> => {
		await DataBase.updateNodeList(this.nodeList);
		await DataBase.updateNodesStats(this.nodesStats);
		memoryCache.set('nodeList', this.nodeList);
	};

	private addNodesToList = (nodes: INode[]) => {
		nodes.forEach((node: INode) => {
			if (!!this.nodeList.find((addedNode) => addedNode.publicKey === node.publicKey)) return;
			this.nodeList.push(node);
		});
	};
}
