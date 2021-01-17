import * as mongoose from 'mongoose';
import * as winston from 'winston';
import { basename } from '@src/utils';
import { Logger } from '@src/infrastructure';
import { INode, NodeDocument, Node } from '@src/models/Node';
import { INodesStats, NodesStatsDocument, NodesStats } from '@src/models/NodesStats';
import { INodeHeightStats, NodeHeightStatsDocument, NodeHeightStats } from '@src/models/NodeHeightStats';
import { SearchCriteria, Pagination, PaginationResponse } from '@src/infrastructure/Pagination';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

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

	static getNodeList = (): Promise<NodeDocument[]> => {
		return Node.find().exec();
	};

	static getNodeListWithCriteria = async(searchCriteria: SearchCriteria): Promise<PaginationResponse<NodeDocument>> => {
		return Pagination.getPage<NodeDocument>(Node, searchCriteria);
	};

	static getNodeByPublicKey = (publicKey: string): Promise<NodeDocument | null> => {
		return Node.findOne({ publicKey }).exec();
	};

	static getNodeByHost = (host: string): Promise<NodeDocument | null> => {
		return Node.findOne({ host }).exec();
	};

	static updateNodeList = async (nodeList: INode[]): Promise<void> => {
		await Node.remove({}).exec();
		await Node.insertMany(nodeList);
	};

	static updateNode = async (node: INode): Promise<void> => {
		await Node.findOneAndUpdate({ publicKey: node.publicKey }, node).exec();
	};

	static getNodesStats = async (): Promise<INodesStats | null> => {
		return (await NodesStats.findOne({}).exec())?.toObject() || null;
	}

	static updateNodesStats = async (nodeList: INodesStats): Promise<void> => {
		await NodesStats.remove({}).exec();
		await NodesStats.create(nodeList);
	}

	static updateNodeHeightStats = async (nodeHeightStats: INodeHeightStats): Promise<void> => {
		await NodeHeightStats.remove({}).exec();
		await NodeHeightStats.create(nodeHeightStats);
	}
}
