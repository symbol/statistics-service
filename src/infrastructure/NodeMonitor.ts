import { DataBase } from '@src/DataBase';
import { INode } from '@src/DataBase/models/Node';
import Axios from 'axios';
import { symbol, monitor } from '../config';
import { isAPIRole } from '../utils';

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
		for (const node of symbol.NODES) {
			const peers = await this.fetchNodeList(node);

			this.addNodesToList(peers);
		}

		// Nested fetch node list from current nodeList[]
		for (const node of this.nodeList) {
			if (!isAPIRole(node.roles)) return;

			const peers = await this.fetchNodeList(`http://${node.host}:${monitor.API_NODE_PORT}`);

			this.addNodesToList(peers);
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
		nodes.map((node: INode) => {
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
