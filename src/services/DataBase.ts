import * as mongoose from 'mongoose';
import * as winston from 'winston';
import { basename } from '@src/utils';
import { Logger } from '@src/infrastructure';
import { INode, NodeDocument, Node } from '@src/models/Node';
import { IHostDetail, HostDetail, HostDetailDocument } from '@src/models/HostDetail';
import { INodesStats, NodesStatsDocument, NodesStats } from '@src/models/NodesStats';
import { INodeHeightStats, NodeHeightStatsDocument, NodeHeightStats } from '@src/models/NodeHeightStats';
import { NodeCountSeries } from '@src/models/NodeCountSeries';
import { AbstractTimeSeriesDocument } from '@src/models/AbstractTimeSeries';
import { SearchCriteria, Pagination, PaginationResponse } from '@src/infrastructure/Pagination';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

export enum NodeListOrder {
	Natural = 'natural',
	Random = 'random',
}
export interface NodeSearchCriteria {
	filter: object;
	limit: number;
	order: NodeListOrder;
}

export class DataBase {
	static connect = async (url: string) => {
		try {
			await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
		} catch (err) {
			logger.error(`DataBase Failed to connect MongoDB`);
			throw err;
		}
		logger.info(`DataBase Connected to MongoDB`);
	};

	static getNodeList = (
		{ filter, limit, order }: NodeSearchCriteria = { filter: {}, limit: 0, order: NodeListOrder.Random },
	): Promise<NodeDocument[]> => {
		if (limit > 0 && order === NodeListOrder.Random) {
			return Node.aggregate([{ $match: { ...filter } }, { $sample: { size: limit } }]).exec();
		}

		// prettier-ignore
		return Node
			.find(filter)
			.limit(limit)
			.exec();
	};

	static getNodeListWithCriteria = async (searchCriteria: SearchCriteria): Promise<PaginationResponse<NodeDocument>> => {
		return Pagination.getPage<NodeDocument>(Node, searchCriteria);
	};

	static getNodeByPublicKey = (publicKey: string): Promise<NodeDocument | null> => {
		return Node.findOne({ publicKey }).exec();
	};

	static getNodeByNodePublicKey = (nodePublicKey: string): Promise<NodeDocument | null> => {
		return Node.findOne({ 'apiStatus.nodePublicKey': nodePublicKey }).exec();
	};

	static getNodeByHost = (host: string): Promise<NodeDocument | null> => {
		return Node.findOne({ host }).exec();
	};

	static updateNodeList = async (nodeList: INode[]): Promise<void> => {
		await DataBase.updateCollection<NodeDocument>(Node, nodeList, 'Node');
	};

	static updateNode = async (node: INode): Promise<void> => {
		await Node.findOneAndUpdate({ publicKey: node.publicKey }, node).exec();
	};

	static getNodesStats = async (): Promise<INodesStats | null> => {
		return (await NodesStats.findOne({}).exec())?.toObject() || null;
	};

	static getNodeHeightStats = async (): Promise<INodeHeightStats | null> => {
		return (await NodeHeightStats.findOne({}).exec())?.toObject() || null;
	};

	static updateNodesStats = async (nodeList: INodesStats): Promise<void> => {
		await DataBase.updateCollection<NodesStatsDocument>(NodesStats, [nodeList], 'NodesStats');
	};

	static updateNodeHeightStats = async (nodeHeightStats: INodeHeightStats): Promise<void> => {
		await DataBase.updateCollection<NodeHeightStatsDocument>(NodeHeightStats, [nodeHeightStats], 'NodeHeightStats');
	};

	static getNodesHostDetail = async (): Promise<IHostDetail[]> => {
		return HostDetail.find().exec();
	};

	static insertNodeHostDetail = async (hostDetail: IHostDetail): Promise<void> => {
		await HostDetail.insertMany([hostDetail]);
	};

	static updateNodesHostDetail = async (hostDetail: IHostDetail[]): Promise<void> => {
		await DataBase.updateCollection<HostDetailDocument>(HostDetail, hostDetail, 'HostDetail');
	};

	static getNodeCountSeries = async (): Promise<AbstractTimeSeriesDocument[]> => {
		return NodeCountSeries.find().exec();
	};

	private static updateCollection = async <T extends mongoose.Document>(
		model: mongoose.Model<T>,
		documents: Array<any>,
		collectionName: string,
	) => {
		const prevState = await model.find().exec();

		try {
			await model.deleteMany();
		} catch (e) {
			const msg = `Update collection "${collectionName}" failed. Error during "model.deleteMany()". ${e.message}`;

			logger.error(msg);
			throw new Error(msg);
		}

		try {
			await model.insertMany(documents);
		} catch (e) {
			const msg = `Update collection "${collectionName}" failed. Error during "model.insertMany()". ${e.message}`;

			logger.error(msg);
			throw new Error(msg);
		}

		const currentState = await model.find().exec();

		if (documents.length !== currentState.length) {
			logger.error(
				`Update collection "${collectionName}" failed. Collection.length(${currentState.length}) !== documentsToInsert.length(${documents.length})`,
			);
			await model.insertMany(prevState);
			throw new Error(`Failed to update collection "${collectionName}. Length verification failed`);
		}
	};
}
