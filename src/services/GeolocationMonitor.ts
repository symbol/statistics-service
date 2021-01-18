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

export class ChainHeightMonitor {;
	private nodeList: INode[];
	private isRunning: boolean;
	private interval: number;
	private nodesHostDetail: IHostDetail[];

	constructor(_interval: number) {
		this.nodeList = [];
		this.isRunning = false;
		this.interval = _interval || 300000;
		this.nodesHostDetail = [];
	}

	public start = async () => {
		logger.info(`Start`);
		try {
			this.isRunning = true;
			this.clear();

			await this.getNodeList();
			await this.getNodesHostDetail();

			if (this.isRunning) {
				await this.updateCollection();
				await this.cacheCollection();
				await sleep(this.interval);
				this.start();
			}
		}
		catch(e) {
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
			this.nodeList = (await DataBase
				.getNodeList())
				.filter(node => isAPIRole(node.roles) && node.apiStatus?.isAvailable);
		}
		catch(e){
			for(const nodeUrl of symbol.NODES) {
				const node = await ApiNodeService.getNodeInfo(
					new URL(nodeUrl).host,
					Number(monitor.API_NODE_PORT)
				);
				if(node) {
					const status = await ApiNodeService.getStatus(node.host, monitor.API_NODE_PORT);
					if(status.isAvailable)
						this.nodeList.push({...node, rewardPrograms: []});
				}		
			}
		}

		return Promise.resolve();
	};

	private getNodesHostDetail = async () => {
		logger.info(`Getting height stats for ${this.nodeList.length} nodes`);
		for (const node of this.nodeList) {
			try {
				const hostDetail = await HostInfo.getHostDetail(node.host);
				
				if(hostDetail)
					this.nodesHostDetail.push(hostDetail);
			}
			catch(e) {
				logger.error(`Node chain height monitor failed. ${e.message}`);
			}
		}
	}

	private clear = () => {
		this.nodeList = [];
		this.nodesHostDetail = [];
	};

	private updateCollection = async (): Promise<any> => {
		logger.info(`Update collection`);
		await DataBase.updateNodesHostDetail(this.nodesHostDetail);
	};

	private cacheCollection = async (): Promise<any> => {
		try {
			const nodeList = await DataBase.getNodeList();
			memoryCache.setArray('nodesHostDetail', this.nodesHostDetail, ['host']);
		}
		catch(e) {
			logger.error('Failed to cache "nodesHostDetail" collection to memory. ' + e.message);
		}
	}
}
