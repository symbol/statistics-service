import { INode } from '@src/models/Node';
import { INodesStats } from '@src/models/NodesStats';

export class NodesStats implements INodesStats {
	nodeTypes!: {
		[key: string]: number;
	};

	constructor() {
		this.clear();
	}

	private updateStats(nodeType: string) {
		if (this.nodeTypes[nodeType] === undefined) this.nodeTypes[nodeType] = 1;
		else this.nodeTypes[nodeType]++;
	}

	addToStats(node: INode) {
		this.updateStats(String(node.roles));
		if(Array.isArray(node.rewardPrograms))
			node.rewardPrograms.forEach(program => this.updateStats(program.name));
	}

	clear() {
		this.nodeTypes = {};
	}
}
