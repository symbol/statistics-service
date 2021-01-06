import Axios from 'axios';
import * as winston from 'winston';
import { basename } from '@src/utils';
import { Logger } from '@src/infrastructure';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

export interface ApiStatus {
	chainHight: number;
	finalizationHeight: number;
	nodePublicKey: string;
	lastStatusCheck: number;
};

export class ApiNodeService {
	static getStatus = async (host: string, port: number): Promise<ApiStatus | null> => {
		try {
			const nodeInfo = (await Axios.get(`http://${host}:${port}/node/info`)).data;
			const chainInfo = (await Axios.get(`http://${host}:${port}/chain/info`)).data;
			
			return {
				chainHight: chainInfo.height,
				finalizationHeight: chainInfo.latestFinalizedBlock.height,
				nodePublicKey: nodeInfo.nodePublicKey,
				lastStatusCheck: Date.now(),
			};
		} catch (e) {
			logger.error(`Failed to get api status ${e.message}`);
			return null;
		}
	};
}
