import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';
import { Coordinates } from '@src/infrastructure/NodeInfo';

export interface INode {
	friendlyName: string;
	host: string;
	networkGenerationHashSeed: string;
	networkIdentifier: number;
	port: number;
	publicKey: string;
	roles: number;
	version: number;
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

export default mongoose.model<NodeDocument>('Node', NodeSchema);
