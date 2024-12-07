import * as winston from 'winston';
import { DataBase } from '@src/services/DataBase';
import { ApiNodeService } from '@src/services/ApiNodeService';
import { HostInfo } from '@src/services/HostInfo';
import { memoryCache } from '@src/services/MemoryCache';
import { Logger } from '@src/infrastructure';

import { INode } from '@src/models/Node';
import { IHostDetail } from '@src/models/HostDetail';
import { symbol, monitor } from '@src/config';
import { isAPIRole, isPeerRole, getNodeURL, basename, sleep } from '@src/utils';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

export class GeolocationMonitor {
	private nodeList: INode[];
	private isRunning: boolean;
	private interval: number;
	private nodesHostDetail: IHostDetail[];

	constructor(_interval: number) {
		this.nodeList = [];
		this.isRunning = false;
		this.interval = _interval || 300000;
		this.nodesHostDetail = [];
		this.cacheCollection();
	}

	public start = async () => {
		logger.info(`Start`);
		try {
			this.isRunning = true;
			this.clear();

			await this.getNodeList();
			await this.getNodesHostDetail();

			if (this.isRunning) {
				//await this.updateCollection();
				await this.cacheCollection();
				await sleep(this.interval);
				this.start();
			}
		} catch (e: any) {
			logger.error(`Unhandled error during a loop. ${e.message}. Restarting Monitor..`);
			await sleep(this.interval);
			this.stop();
			this.start();
		}
	};

	public stop = () => {
		logger.info(`Stop`);
		this.isRunning = false;
		this.clear();
	};

	private getNodeList = async (): Promise<any> => {
		try {
			this.nodeList = await DataBase.getNodeList();
		} catch (e) {
			for (const node of symbol.NODES) {
				const url = new URL(node);
				const hostUrl = await ApiNodeService.buildHostUrl(url.hostname);
				const nodeInfo = await ApiNodeService.getNodeInfo(hostUrl);

				if (nodeInfo) {
					const status = await ApiNodeService.getStatus(nodeInfo.host);

					if (status.isAvailable) this.nodeList.push({ ...nodeInfo });
				}
			}
		}

		return Promise.resolve();
	};

	private getNodesHostDetail = async () => {
		logger.info(`Getting host detail for ${this.nodeList.length} nodes`);
		let counter = 0;

		for (const node of this.nodeList) {
			counter++;
			//logger.info(`Getting host detail for [${counter}] ${node.host}`);

			try {
				const hostDetail = await HostInfo.getHostDetail(node.host);

				if (hostDetail) {
					this.addHostDetail(hostDetail);
					await this.addToCollection(hostDetail);
				}

				// await this.updateCollection();
			} catch (e: any) {
				logger.error(`Error getting host info. ${e.message}`);
			}
		}
	};

	private addHostDetail(hostDetail: IHostDetail) {
		if (!this.nodesHostDetail.find((el) => el.host === hostDetail.host)) this.nodesHostDetail.push(hostDetail);
	}

	private clear = () => {
		this.nodeList = [];
		this.nodesHostDetail = [];
	};

	private addToCollection = async (hostDetail: IHostDetail): Promise<any> => {
		try {
			const nodesHostDetailIndexes = await memoryCache.get('nodesHostDetailIndexes');

			if (!nodesHostDetailIndexes?.host?.[hostDetail.host]) {
				await DataBase.insertNodeHostDetail(hostDetail);
				logger.info(`New host info added to collection`);
			}
		} catch (e: any) {
			logger.error(`Failed to add new host info to collection`, e.message);
		}
	};

	private updateCollection = async (): Promise<any> => {
		if (this.nodesHostDetail.length > 0) {
			logger.info(`Update collection`);
			await DataBase.updateNodesHostDetail(this.nodesHostDetail);
		} else logger.error(`Failed to update collection. Collection length = ${this.nodesHostDetail.length}`);
	};

	private cacheCollection = async (): Promise<any> => {
		try {
			const nodesHostDetail = await DataBase.getNodesHostDetail();

			memoryCache.setArray('nodesHostDetail', nodesHostDetail, ['host']);
		} catch (e: any) {
			logger.error('Failed to cache "nodesHostDetail" collection to memory. ' + e.message);
		}
	};
}
