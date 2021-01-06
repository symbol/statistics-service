import * as mongoose from 'mongoose';
import * as winston from 'winston';
import { basename } from '@src/utils';
import { Logger } from '@src/infrastructure';
import { INode, NodeDocument, Node } from '@src/models/Node';
import { INodesStats, NodesStatsDocument, NodesStats } from '@src/models/NodesStats';
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

	static updateNodeList = async (nodeList: INode[]): Promise<void> => {
		await Node.remove({}).exec();
		await Node.insertMany(nodeList);
	};

	static updateNode = async (node: INode): Promise<void> => {
		await Node.findOneAndUpdate({ publicKey: node.publicKey }, node).exec();
	};

	static getNodesStats = async (): Promise<NodesStatsDocument | null> => {
		return (await NodesStats.findOne({}).exec())?.toObject()
	}

	static updateNodesStats = async (nodeList: INodesStats): Promise<void> => {
		await NodesStats.remove({}).exec();
		await NodesStats.create(nodeList);
	}
}
