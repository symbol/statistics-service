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
	}

	getTotal() {
		let sum = 0;

		for (let i = 1; i <= 7; i++) if (this.nodeTypes['' + i]) sum += this.nodeTypes['' + i];

		return sum;
	}

	clear() {
		this.nodeTypes = {
			'1': 0,
			'2': 0,
			'3': 0,
			'4': 0,
			'5': 0,
			'6': 0,
			'7': 0,
		};
	}
}
