import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';

export interface HeightStats {
	value: string;
	count: number;
}

export interface INodeHeightStats {
	height: HeightStats[];
	finalizedHeight: HeightStats[];
	date: Date;
}

export interface NodeHeightStatsDocument extends INodeHeightStats, Document {}

const NodeHeightStatsSchema: Schema = new Schema({
	height: {
		type: [
			{
				value: {
					type: String,
					required: true,
				},
				count: {
					type: Number,
					required: true,
				},
			},
		],
		required: true,
	},
	finalizedHeight: {
		type: [
			{
				value: {
					type: String,
					required: true,
				},
				count: {
					type: Number,
					required: true,
				},
			},
		],
		required: true,
	},
	date: {
		type: Date,
		required: true,
	},
});

NodeHeightStatsSchema.set('toObject', {
	transform: (doc: Document, ret: Document) => {
		delete ret._id;
		delete ret.__v;
	},
});

export const NodeHeightStats = mongoose.model<NodeHeightStatsDocument>('NodeHeightStats', NodeHeightStatsSchema);
