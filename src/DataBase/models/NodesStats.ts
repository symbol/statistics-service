import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';


export interface INodesStats {
	nodeTypes: Map<string, number>
}

export interface NodesStatsDocument extends INodesStats, Document {}

const NodesStatsSchema: Schema = new Schema({
	nodeTypes: {
		type: Map,
		required: false,
	}
});

export const NodesStats = mongoose.model<NodesStatsDocument>('NodesStats', NodesStatsSchema);
