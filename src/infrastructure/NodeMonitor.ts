import * as winston from 'winston';
import Axios from 'axios';
import { DataBase } from '@src/DataBase';
import { NodeInfo, Logger } from '@src/infrastructure';
import { INode } from '@src/DataBase/models/Node';
import { symbol, monitor } from '@src/config';
import { isAPIRole, getNodeURL, basename } from '@src/utils';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

export class NodeMonitor {
	private visitedNodes: INode[];
	private nodeList: INode[];
	private currentNodeIndex: number;
	private isRunning: boolean;
	private interval: number;

	constructor(_interval: number) {
		this.visitedNodes = [];
		this.nodeList = [];
		this.currentNodeIndex = 0;
		this.isRunning = false;
		this.interval = _interval || 300000;
	}

	public start = async () => {
		this.isRunning = true;
		this.clear();

		await this.main();
		this.nodeList = await NodeInfo.getInfoForListOfNodes(this.nodeList);

		if (this.isRunning) {
			await this.updateCollection();
			setTimeout(() => this.start(), this.interval);
		}
	};

	public stop = () => {
		this.isRunning = false;
		this.clear();
	};

	private main = async (): Promise<any> => {
		// Init fetch node list from config nodes
		let counter = 0;

		for (const nodeUrl of symbol.NODES) {
			counter++;
			logger.info(`Fetching node (initial): ${counter} ${nodeUrl}`);
			const peers = await this.fetchNodeList(nodeUrl);

			this.addNodesToList(peers);
		}

		// Nested fetch node list from current nodeList[]
		for (const node of this.nodeList) {
			if (isAPIRole(node.roles)) {
				counter++;
				logger.info(`Fetching node: ${counter} ${node.host}`);
				const peers = await this.fetchNodeList(getNodeURL(node, monitor.API_NODE_PORT));

				this.addNodesToList(peers);
			}
		}

		return Promise.resolve();
	};

	private fetchNodeList = async (nodeUrl: string): Promise<Array<INode>> => {
		try {
			const nodeList = await Axios.get(nodeUrl + '/node/peers', {
				timeout: monitor.REQUEST_TIMEOUT,
			});

			if (Array.isArray(nodeList.data)) return nodeList.data;
		} catch (e) {}
		return [];
	};

	private clear = () => {
		this.visitedNodes = [];
		this.nodeList = [];
		this.currentNodeIndex = 0;
	};

	private updateCollection = async (): Promise<any> => {
		await DataBase.updateNodeList(this.nodeList);
	};

	private checkAPINode = (nodeUrl: string): Promise<boolean> => {
		return Promise.resolve(true);
	};

	private addNodesToList = (nodes: INode[]) => {
		nodes.forEach((node: INode) => {
			if (!!this.nodeList.find((addedNode) => addedNode.publicKey === node.publicKey)) return;
			this.nodeList.push(node);
		});
	};

	private removeNodeFromList = (node: INode) => {};

	private addNodeToVisited = (node: INode) => {
		this.visitedNodes.push(node);
	};

	private isNodeVisited = (node: INode): boolean => {
		return !!this.visitedNodes.find((visitedNode) => visitedNode.publicKey === node.publicKey);
	};
}
