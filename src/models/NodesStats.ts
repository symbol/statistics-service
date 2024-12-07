import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';

export interface INodesStats {
	nodeTypes: {
		[key: string]: number;
	};
	nodeVersion: {
		[key: string]: number;
	};
}

export interface NodesStatsDocument extends INodesStats, Document {}

const NodesStatsSchema: Schema = new Schema({
	nodeTypes: {
		type: Schema.Types.Mixed,
	},
	nodeVersion: {
		type: Schema.Types.Mixed,
	},
});

NodesStatsSchema.set('toObject', {
	transform: (doc: Document, ret) => {
		delete ret._id;
		delete ret.__v;
	},
});

export const NodesStats = mongoose.model<NodesStatsDocument>('NodesStats', NodesStatsSchema);
