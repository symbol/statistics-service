import NodeModel, { INode } from '@src/DataBase/models/Node';
import Axios from 'axios';

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
		// for(;this.currentNodeIndex < this.nodeList.length; this.currentNodeIndex++) {
		//     await this.fetchNodeList('http://' + this.nodeList[this.currentNodeIndex].host + '3000')
		//     if(!this.isRunning)
		//         return Promise.resolve();
		// }

		return Promise.resolve();
	};

	private fetchNodeList = async (nodeUrl: string): Promise<Array<INode>> => {
		try {
			const nodeList = await Axios.get(nodeUrl + '/node/peers');

			if (Array.isArray(nodeList)) return nodeList;
		} catch (e) {}
		return [];
	};

	private clear = () => {
		this.visitedNodes = [];
		this.nodeList = [];
		this.currentNodeIndex = 0;
	};

	private updateCollection = async (): Promise<any> => {
		await NodeModel.remove({}).exec();
		await NodeModel.insertMany(this.nodeList);
	};

	private checkAPINode = (nodeUrl: string): Promise<boolean> => {
		return Promise.resolve(true);
	};

	private addNodeToList = (node: INode) => {
		//TODO: replace with MAP
		if (!!this.nodeList.find((addedNode) => addedNode.publicKey === node.publicKey)) return;
		this.nodeList.push(node);
	};

	private removeNodeFromList = (node: INode) => {};

	private addNodeToVisited = (node: INode) => {
		this.visitedNodes.push(node);
	};

	private isNodeVisited = (node: INode): boolean => {
		return !!this.visitedNodes.find((visitedNode) => visitedNode.publicKey === node.publicKey);
	};
}
