import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';
import { Coordinates } from '@src/infrastructure/NodeLocation';

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
}

export interface NodeDocument extends INode, Document {}

const NodeSchema: Schema = new Schema({
	friendlyName: {
		type: String,
		required: true,
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
		type: [Schema.Types.Mixed],
		required: false,
	},
	location: {
		type: String,
		required: false,
	},
});

export default mongoose.model<NodeDocument>('Node', NodeSchema);
