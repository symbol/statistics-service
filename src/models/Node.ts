import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';
import { ApiStatus } from '@src/services/ApiNodeService';
import { PeerStatus } from '@src/models/PeerStatus';
import { IHostDetail } from './HostDetail';

export interface INode {
	friendlyName: string;
	host: string;
	networkGenerationHashSeed: string;
	networkIdentifier: number;
	port: number;
	publicKey: string;
	roles: number;
	version: number;
	peerStatus?: PeerStatus;
	apiStatus?: ApiStatus;
	hostDetail?: IHostDetail;
	lastAvailable?: Date;
}

export interface NodeDocument extends INode, Document {}

const NodeSchema: Schema = new Schema({
	friendlyName: {
		type: String,
	},
	host: {
		type: String,
	},
	networkGenerationHashSeed: {
		type: String,
		required: true,
	},
	networkIdentifier: {
		type: Number,
		required: true,
	},
	port: {
		type: Number,
		required: true,
	},
	peerStatus: {
		isAvailable: {
			type: Boolean,
		},
		lastStatusCheck: {
			type: Number,
		},
	},
	apiStatus: {
		webSocket: {
			type: {
				isAvailable: {
					type: Boolean,
				},
				wss: {
					type: Boolean,
				},
				url: {
					type: String,
				},
			},
		},
		restGatewayUrl: {
			type: String,
		},
		isAvailable: {
			type: Boolean,
		},
		isHttpsEnabled: {
			type: Boolean,
		},
		nodeStatus: {
			type: {
				apiNode: {
					type: String,
				},
				db: {
					type: String,
				},
			},
		},
		chainHeight: {
			type: Number,
		},
		finalization: {
			type: {
				height: {
					type: Number,
				},
				epoch: {
					type: Number,
				},
				point: {
					type: Number,
				},
				hash: {
					type: String,
				},
			},
		},
		nodePublicKey: {
			type: String,
			index: true,
		},
		restVersion: {
			type: String,
		},
		lastStatusCheck: {
			type: Number,
		},
	},
	publicKey: {
		type: String,
		required: true,
		unique: true,
		index: true,
	},
	roles: {
		type: Number,
		required: true,
	},
	version: {
		type: Number,
		required: true,
	},
	hostDetail: {
		type: {
			host: {
				type: String,
				required: true,
			},
			coordinates: {
				type: {
					latitude: {
						type: Number,
						required: true,
					},
					longitude: {
						type: Number,
						required: true,
					},
				},
			},
			location: {
				type: String,
				required: true,
			},
			ip: {
				type: String,
				required: true,
			},
			organization: {
				type: String,
				required: true,
			},
			as: {
				type: String,
				required: true,
			},
			continent: {
				type: String,
			},
			country: {
				type: String,
				required: true,
			},
			region: {
				type: String,
				required: true,
			},
			city: {
				type: String,
				required: true,
			},
			district: {
				type: String,
			},
			zip: {
				type: String,
			},
		},
	},
	lastAvailable: {
		type: Date,
	},
});

NodeSchema.index(
	{ 'apiStatus.isAvailable': 1, 'apiStatus.nodeStatus.apiNode': 1, 'apiStatus.nodeStatus.db': 1 },
	{
		name: 'inx_suggestedNode',
	},
);

NodeSchema.index(
	{ 'apiStatus.isHttpsEnabled': 1, 'apiStatus.webSocket.wss': 1, 'apiStatus.webSocket.isAvailable': 1 },
	{
		name: 'inx_sslNode',
	},
);

NodeSchema.set('toObject', {
	transform: (doc: Document, ret) => {
		delete ret._id;
		delete ret.__v;
	},
});

export const Node = mongoose.model<NodeDocument>('Node', NodeSchema);

export const validateNodeModel = (node: any): boolean => {
	if (!node || typeof node !== 'object') {
		return false;
	}

	return !new Node(node).validateSync();
};
