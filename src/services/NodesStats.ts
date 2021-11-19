import { INode } from '@src/models/Node';
import { INodesStats } from '@src/models/NodesStats';

export class NodesStats implements INodesStats {
	nodeTypes!: {
		[key: string]: number;
	};

	nodeVersion!: {
		[key: string]: number;
	};

	constructor() {
		this.clear();
	}

	private updateStats(data: Record<string, number>, key: string) {
		if (data[key] === undefined) data[key] = 1;
		else data[key]++;
	}

	addToStats(node: INode) {
		this.updateStats(this.nodeTypes, String(node.roles));
		this.updateStats(this.nodeVersion, String(node.version));
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
		this.nodeVersion = {};
	}
}
