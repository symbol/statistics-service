import * as mongoose from 'mongoose';
import * as winston from 'winston';
import { basename } from '@src/utils';
import { Logger } from '@src/infrastructure';
import { INode, NodeDocument, Node } from '@src/models/Node';
import { IHostDetail, HostDetail } from '@src/models/HostDetail';
import { INodesStats, NodesStatsDocument, NodesStats } from '@src/models/NodesStats';
import { INodeHeightStats, NodeHeightStatsDocument, NodeHeightStats } from '@src/models/NodeHeightStats';
import { NodeCountSeries } from '@src/models/NodeCountSeries';
import { AbstractTimeSeriesDocument } from '@src/models/AbstractTimeSeries';
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

	static getNodeListWithCriteria = async (searchCriteria: SearchCriteria): Promise<PaginationResponse<NodeDocument>> => {
		return Pagination.getPage<NodeDocument>(Node, searchCriteria);
	};

	static getNodeByPublicKey = (publicKey: string): Promise<NodeDocument | null> => {
		return Node.findOne({ publicKey }).exec();
	};

	static getNodeByHost = (host: string): Promise<NodeDocument | null> => {
		return Node.findOne({ host }).exec();
	};

	static updateNodeList = async (nodeList: INode[]): Promise<void> => {
		// Replace this part with mongo transactions
		const prevNodeList = await DataBase.getNodeList();

		await Node.deleteMany();
		await Node.insertMany(nodeList);
		const currentNodeList = await DataBase.getNodeList();

		if (currentNodeList.length !== nodeList.length) {
			await Node.deleteMany();
			await Node.insertMany(prevNodeList);
		}
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
		await NodesStats.deleteMany();
		await NodesStats.create(nodeList);
	};

	static updateNodeHeightStats = async (nodeHeightStats: INodeHeightStats): Promise<void> => {
		await NodeHeightStats.deleteMany();
		await NodeHeightStats.create(nodeHeightStats);
	};

	static getNodesHostDetail = async (): Promise<IHostDetail[]> => {
		return HostDetail.find().exec();
	};

	static insertNodeHostDetail = async (hostDetail: IHostDetail): Promise<void> => {
		await HostDetail.insertMany([hostDetail]);
	};

	static updateNodesHostDetail = async (hostDetail: IHostDetail[]): Promise<void> => {
		await HostDetail.deleteMany();
		await HostDetail.insertMany(hostDetail);
	};

	static getNodeCountSeries = async (): Promise<AbstractTimeSeriesDocument[]> => {
		return NodeCountSeries.find().exec();
	};

	private static updateCollection = async <T extends mongoose.Document>(
		model: mongoose.Model<T>, 
		documents: Array<T>, 
		collectionName: string
	) => {
		const prevState = await model.find().exec();
		let status = 0;
		let error = Error();

		try {
			await model.deleteMany();
			status = 1;
			await model.insertMany(documents);
			status = 2;
		}
		catch(e) {
			error = e;
		}

		if (status === 0)
			throw(error);

		if (status === 1) {
			await model.insertMany(prevState);
			throw(error);
		}

		if (status === 2) {
			const currentState = await model.find().exec();

			if (documents.length !== currentState.length) {
				await model.insertMany(prevState);
				throw new Error(`Failed to update collection "${collectionName}. Insertion completed but: collectin.length(${currentState.length}) !== documentsToInsert.length(${documents.length})`);
			}
		}
	}
}
