import * as mongoose from 'mongoose';
import * as models from './models';
import * as winston from 'winston';
import { basename } from '@src/utils';
import { Logger } from '@src/infrastructure';
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

	static getNodeList = (): Promise<models.NodeDocument[]> => {
		return models.Node.find().exec();
	};

	static getNodeListWithCriteria = async(searchCriteria: SearchCriteria): Promise<PaginationResponse<models.NodeDocument>> => {
		return Pagination.getPage<models.NodeDocument>(models.Node, searchCriteria);
	};

	static getNodeByPublicKey = (publicKey: string): Promise<models.NodeDocument | null> => {
		return models.Node.findOne({ publicKey }).exec();
	};

	static updateNodeList = async (nodeList: models.INode[]): Promise<void> => {
		await models.Node.remove({}).exec();
		await models.Node.insertMany(nodeList);
	};

	static updateNode = async (node: models.INode): Promise<void> => {
		await models.Node.findOneAndUpdate({ publicKey: node.publicKey }, node).exec();
	};
}
