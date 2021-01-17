import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';
import { RewardProgram } from '@src/services/NodeRewards';
import { ApiStatus } from '@src/services/ApiNodeService';

export interface Coordinates {
	latitude: number;
	longitude: number;
};

export interface PeerStatus {
	isAvailable: boolean;
	lastStatusCheck: number;
};

export interface INode {
	friendlyName: string;
	host: string;
	networkGenerationHashSeed: string;
	networkIdentifier: number;
	port: number;
	peerStatus?: PeerStatus;
	publicKey: string;
	roles: number;
	version: number;
	rewardPrograms: RewardProgram[];
	apiStatus?: ApiStatus;
	coordinates?: Coordinates;
	location?: string;
	ip?: string;
	organization?: string;
	as?: string;
	continent?: string;
	country?: string;
	region?: string;
	city?: string;
	district?: string;
	zip?: string;
}

export interface NodeDocument extends INode, Document {}

const NodeSchema: Schema = new Schema({
	friendlyName: {
		type: String,
		required: false,
	},
	host: {
		type: String,
		required: true,
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
			required: false,
		},
		lastStatusCheck: {
			type: Number,
			required: false,
		},
	},
	apiStatus: {
		isAvailable: {
			type: Boolean,
			required: false,
		},
		chainHeight: {
			type: Number,
			required: false,
		},
		finalizationHeight: {
			type: Number,
			required: false,
		},
		nodePublicKey: {
			type: String,
			required: false,
		},
		lastStatusCheck: {
			type: Number,
			required: false,
		},
		required: false
	},
	publicKey: {
		type: String,
		required: true,
		unique: true,
	},
	roles: {
		type: Number,
		required: true,
	},
	version: {
		type: Number,
		required: true,
	},
	rewardPrograms: {
		type: [{
			name: {
				type: String,
				required: true
			},
			passed: {
				type: Boolean,
				required: true
			}
		}],
		required: true
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
		required: false,
	},
	location: {
		type: String,
		required: false,
	},
	ip: {
		type: String,
		required: false,
	},
	organization: {
		type: String,
		required: false,
	},
	as: {
		type: String,
		required: false,
	},
	continent: {
		type: String,
		required: false,
	},
	country: {
		type: String,
		required: false,
	},
	region: {
		type: String,
		required: false,
	},
	city: {
		type: String,
		required: false,
	},
	district: {
		type: String,
		required: false,
	},
	zip: {
		type: String,
		required: false,
	},
});

NodeSchema.set('toObject', {
	transform: (doc: Document, ret: Document) => {
		delete ret._id
		delete ret.__v
	}
});

export const Node = mongoose.model<NodeDocument>('Node', NodeSchema);
