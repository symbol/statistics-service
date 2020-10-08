import * as mongoose from 'mongoose';
import * as models from './models';

export class DataBase {
	static connect = async (url: string) => {
		try {
			await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
		} catch (err) {
			console.error('[DataBase]: Failed to connect MongoDB');
			throw err;
		}
		console.log('[DataBase]: Connected to MongoDB');
	};

	static getNodeList = (): Promise<models.Node.NodeDocument[]> => {
		return models.Node.default.find().exec();
	}

	static getNodeByPublicKey = (publicKey: string): Promise<models.Node.NodeDocument | null> => {
		return models.Node.default.findOne({publicKey}).exec();
	}

	static updateNodeList = async (nodeList: models.Node.INode[]): Promise<void> => {
		await models.Node.default.remove({}).exec();
		await models.Node.default.insertMany(nodeList);
	}

	static updateNode = async (node: models.Node.INode): Promise<void> => {
		await models.Node.default.findOneAndUpdate({publicKey: node.publicKey}, node).exec();
	}
}
